function errorHandler(err, req, res, next) {

  console.error(err.stack || err);

  const status = err.status || 500;

  const mensagem = err.expose ? err.message : 'Erro interno no servidor';

  res.status(status).json({ error: mensagem });
}

module.exports = errorHandler;
