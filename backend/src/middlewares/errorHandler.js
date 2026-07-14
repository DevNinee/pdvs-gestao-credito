// Códigos de erro do Postgres que fazem sentido traduzir para o usuário final
// em vez de mostrar "Erro interno no servidor" genérico ou vazar detalhes
// técnicos de SQL nos toasts da interface.
const MENSAGENS_PG = {
  '23505': { status: 409, mensagem: 'Já existe um registro com esses dados.' },
  '23503': { status: 409, mensagem: 'Não é possível concluir: este registro está vinculado a outros dados.' },
  '22P02': { status: 400, mensagem: 'Dados inválidos enviados.' },
  '23514': { status: 400, mensagem: 'Operação inválida: violaria uma regra do banco de dados (ex.: estoque negativo).' },
  '57P03': { status: 503, mensagem: 'Banco de dados indisponível no momento. Tente novamente em instantes.' },
  'ECONNREFUSED': { status: 503, mensagem: 'Banco de dados indisponível no momento. Tente novamente em instantes.' }
};

function errorHandler(err, req, res, next) {

  console.error(err.stack || err);

  let status = err.status || 500;
  let mensagem = err.expose ? err.message : 'Erro interno no servidor';

  if (!err.expose) {
    const traducao = MENSAGENS_PG[err.code];
    if (traducao) {
      status = traducao.status;
      mensagem = traducao.mensagem;
    }
  }

  res.status(status).json({ error: mensagem });
}

module.exports = errorHandler;
