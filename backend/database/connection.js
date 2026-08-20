const { Pool, types } = require('pg');

// Sem isso, o driver `pg` devolve colunas NUMERIC como STRING (para não perder
// precisão). Como preco/divida/total são exibidos e somados como number no
// frontend, forçamos o parse para float aqui — a precisão de centavos já é
// garantida pela coluna NUMERIC(10,2), então o float resultante é seguro.
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// O Render (e a maioria dos Postgres gerenciados) derruba conexões ociosas
// periodicamente. Sem este handler, esse encerramento vira um evento 'error'
// não tratado no pool e derruba o processo Node inteiro (crash do servidor).
pool.on('error', (err) => {
  console.error('[DB] Erro inesperado em cliente ocioso do pool:', err);
});

// Auto-inicializa/migra as tabelas ao conectar. Idempotente: seguro rodar
// em todo boot, inclusive contra um banco já existente em produção.
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        preco NUMERIC(10,2) NOT NULL,
        estoque INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        divida NUMERIC(10,2) DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS historico (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER,
        cliente_name TEXT NOT NULL,
        hora TEXT NOT NULL,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        total NUMERIC(10,2) NOT NULL,
        tipo TEXT NOT NULL,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS historico_itens (
        id SERIAL PRIMARY KEY,
        historico_id INTEGER NOT NULL,
        produto_id INTEGER,
        descricao TEXT NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 1,
        valor NUMERIC(10,2) NOT NULL,
        FOREIGN KEY (historico_id) REFERENCES historico (id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE SET NULL
      );
    `);

    // Migrações idempotentes para bancos já existentes (criados antes destas
    // colunas/constraints existirem). Seguro rodar repetidamente.
    await client.query(`
      ALTER TABLE historico ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

      ALTER TABLE produtos ALTER COLUMN preco TYPE NUMERIC(10,2);
      ALTER TABLE clientes ALTER COLUMN divida TYPE NUMERIC(10,2);
      ALTER TABLE historico ALTER COLUMN total TYPE NUMERIC(10,2);
      ALTER TABLE historico_itens ALTER COLUMN valor TYPE NUMERIC(10,2);
    `);

    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE historico DROP CONSTRAINT IF EXISTS historico_cliente_id_fkey;
        ALTER TABLE historico ADD CONSTRAINT historico_cliente_id_fkey
          FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL;

        ALTER TABLE historico_itens DROP CONSTRAINT IF EXISTS historico_itens_produto_id_fkey;
        ALTER TABLE historico_itens ADD CONSTRAINT historico_itens_produto_id_fkey
          FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL;

        ALTER TABLE historico_itens DROP CONSTRAINT IF EXISTS historico_itens_historico_id_fkey;
        ALTER TABLE historico_itens ADD CONSTRAINT historico_itens_historico_id_fkey
          FOREIGN KEY (historico_id) REFERENCES historico(id) ON DELETE CASCADE;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE produtos ADD CONSTRAINT chk_produtos_estoque_nao_negativo CHECK (estoque >= 0);
      EXCEPTION WHEN duplicate_object THEN NULL;
      WHEN check_violation THEN
        RAISE NOTICE 'chk_produtos_estoque_nao_negativo não aplicada: já existem produtos com estoque negativo. Corrija os dados e reinicie.';
      END $$;
    `);

    console.log('[DB] Tabelas PostgreSQL verificadas/migradas com sucesso.');
  } finally {
    client.release();
  }
}

const dbPronto = initDB().catch((err) => {
  console.error('[DB] Erro fatal ao inicializar/migrar tabelas:', err);
  throw err;
});

module.exports = {
  pronto: dbPronto,
  run: async (query, params) => {
    const result = await pool.query(query, params);
    const lastID = result.rows && result.rows[0] ? result.rows[0].id : null;
    return { id: lastID, changes: result.rowCount };
  },
  all: async (query, params) => {
    const result = await pool.query(query, params);
    return result.rows;
  },
  get: async (query, params) => {
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },

  transaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const resultado = await callback({
        run: async (q, p) => {
          const r = await client.query(q, p);
          const lastID = r.rows && r.rows[0] ? r.rows[0].id : null;
          return { lastID, changes: r.rowCount };
        },
        get: async (q, p) => {
          const r = await client.query(q, p);
          return r.rows[0] || null;
        },
        all: async (q, p) => {
          const r = await client.query(q, p);
          return r.rows;
        }
      });
      await client.query('COMMIT');
      return resultado;
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }
  }
};
