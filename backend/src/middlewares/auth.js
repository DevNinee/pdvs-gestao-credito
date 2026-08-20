const { tokenValido, COOKIE_NOME } = require('../utils/sessao');

// Caminhos acessíveis sem sessão válida: a própria tela de login, o
// endpoint que a autentica, e os assets estáticos que ela precisa para
// se desenhar (o resto do app fica atrás do login).
const CAMINHOS_PUBLICOS = new Set([
  '/login',
  '/api/login',
  '/css/style.css',
  '/js/login.js'
]);

function lerCookie(req, nome) {
  const header = req.headers.cookie;
  if (!header) return null;

  for (const parte of header.split(';')) {
    const trecho = parte.trim();
    const idx = trecho.indexOf('=');
    if (idx === -1) continue;
    if (trecho.slice(0, idx) === nome) {
      return decodeURIComponent(trecho.slice(idx + 1));
    }
  }
  return null;
}

// Protege a aplicação inteira (frontend + API) com uma sessão simples via
// cookie assinado, criada ao acertar a senha em /login. Se APP_PASSWORD não
// estiver configurada, a aplicação fica sem proteção (com aviso no log),
// para não travar ambientes de desenvolvimento local.
function autenticacao(req, res, next) {
  const senhaEsperada = process.env.APP_PASSWORD;
  if (!senhaEsperada) return next();

  if (CAMINHOS_PUBLICOS.has(req.path)) return next();

  const token = lerCookie(req, COOKIE_NOME);
  if (tokenValido(token)) return next();

  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
}

module.exports = autenticacao;
