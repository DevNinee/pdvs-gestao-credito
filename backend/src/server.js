const app = require('./app');
const db = require('../database/connection');

const PORT = process.env.PORT || 3000;

db.pronto
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[ON] Servidor modular rodando em: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[OFF] Não foi possível inicializar o banco de dados. Servidor não iniciado.', err);
    process.exit(1);
  });
