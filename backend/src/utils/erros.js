
function erroValidacao(mensagem) {
  const erro = new Error(mensagem);
  erro.status = 400;
  erro.expose = true;
  return erro;
}

module.exports = { erroValidacao };
