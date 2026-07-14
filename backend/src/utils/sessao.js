const crypto = require('crypto');
const { senhasIguais } = require('./senha');

const COOKIE_NOME = 'pdv_sessao';
const DURACAO_MS = 1000 * 60 * 60 * 12; // 12 horas

// O segredo de assinatura deriva da própria APP_PASSWORD, então não é
// preciso configurar mais nenhuma variável de ambiente só para sessão.
function getSegredo() {
  return crypto.createHash('sha256').update(String(process.env.APP_PASSWORD || '')).digest();
}

function criarToken() {
  const expira = Date.now() + DURACAO_MS;
  const payload = String(expira);
  const assinatura = crypto.createHmac('sha256', getSegredo()).update(payload).digest('hex');
  return `${payload}.${assinatura}`;
}

function tokenValido(token) {
  if (!token || typeof token !== 'string') return false;

  const ponto = token.indexOf('.');
  if (ponto === -1) return false;

  const payload = token.slice(0, ponto);
  const assinatura = token.slice(ponto + 1);
  const esperado = crypto.createHmac('sha256', getSegredo()).update(payload).digest('hex');

  if (!senhasIguais(assinatura, esperado)) return false;

  const expira = Number(payload);
  return Number.isFinite(expira) && Date.now() < expira;
}

module.exports = { criarToken, tokenValido, COOKIE_NOME, DURACAO_MS };
