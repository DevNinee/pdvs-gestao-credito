const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPromise = open({
  filename: path.join(__dirname, 'database.sqlite'),
  driver: sqlite3.Database
});

// Auto-inicializa as tabelas ao conectar (garante que o CRUD funciona no Render)
dbPromise.then(async (db) => {
  await db.run('PRAGMA foreign_keys = ON');

  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schema);
    console.log('[DB] Tabelas verificadas/criadas com sucesso.');
  }
});

module.exports = {
  run: async (query, params) => {
    const db = await dbPromise;
    const result = await db.run(query, params);
    return result.lastID ? { id: result.lastID } : result;
  },
  all: async (query, params) => {
    const db = await dbPromise;
    return db.all(query, params);
  },
  get: async (query, params) => {
    const db = await dbPromise;
    return db.get(query, params);
  },

  transaction: async (callback) => {
    const db = await dbPromise;
    await db.run('BEGIN');
    try {
      const resultado = await callback(db);
      await db.run('COMMIT');
      return resultado;
    } catch (erro) {
      await db.run('ROLLBACK');
      throw erro;
    }
  }
};
