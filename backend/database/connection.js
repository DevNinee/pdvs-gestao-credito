const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Auto-inicializa as tabelas ao conectar
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        preco REAL NOT NULL,
        estoque INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        divida REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS historico (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER,
        cliente_name TEXT NOT NULL,
        hora TEXT NOT NULL,
        total REAL NOT NULL,
        tipo TEXT NOT NULL,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      );

      CREATE TABLE IF NOT EXISTS historico_itens (
        id SERIAL PRIMARY KEY,
        historico_id INTEGER NOT NULL,
        produto_id INTEGER,
        descricao TEXT NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 1,
        valor REAL NOT NULL,
        FOREIGN KEY (historico_id) REFERENCES historico (id),
        FOREIGN KEY (produto_id) REFERENCES produtos (id)
      );
    `);
    console.log('[DB] Tabelas PostgreSQL verificadas/criadas com sucesso.');
  } catch (err) {
    console.error('[DB] Erro ao inicializar tabelas:', err);
  } finally {
    client.release();
  }
}

initDB();

module.exports = {
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
