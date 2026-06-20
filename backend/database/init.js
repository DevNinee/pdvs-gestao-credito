const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
});

const runScript = (filePath) => {
  return new Promise((resolve, reject) => {
    const script = fs.readFileSync(filePath, 'utf8');
    db.exec(script, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const initDB = async () => {
  try {
    console.log(' Dropando tabelas antigas para evitar conflitos...');

    db.exec(`
      DROP TABLE IF EXISTS historico_itens;
      DROP TABLE IF EXISTS historico;
      DROP TABLE IF EXISTS clientes;
      DROP TABLE IF EXISTS produtos;
    `, async (err) => {
      if (err) throw err;

      console.log(' Criando a estrutura do banco de dados (Schema)...');
      await runScript(schemaPath);

      console.log(' Populando com dados iniciais (Seed)...');
      await runScript(seedPath);

      console.log(' Banco de dados configurado com sucesso!');
      db.close();
    });
  } catch (error) {
    console.error(' Erro na configuração do banco:', error);
    db.close();
  }
};

initDB();
