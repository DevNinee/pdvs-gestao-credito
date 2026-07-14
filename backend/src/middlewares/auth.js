const crypto = require('crypto');

function senhasIguais(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Buffers de tamanhos diferentes quebrariam o timingSafeEqual, então
  // comparamos o tamanho primeiro (isso não vaza informação útil, só o
  // comprimento da senha correta).
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Protege a aplicação inteira (frontend + API) com HTTP Basic Auth usando
// uma única senha compartilhada, configurada via variável de ambiente
// APP_PASSWORD no Render. O usuário digitado é ignorado — só a senha importa.
// Se APP_PASSWORD não estiver configurada, a aplicação fica sem proteção
// (com aviso no log), para não travar ambientes de desenvolvimento local.
function autenticacao(req, res, next) {
  const senhaEsperada = process.env.APP_PASSWORD;
  if (!senhaEsperada) {
    return next();
  }

  const header = req.headers.authorization || '';
  const [tipo, credenciais] = header.split(' ');

  if (tipo === 'Basic' && credenciais) {
    try {
      const decodificado = Buffer.from(credenciais, 'base64').toString('utf8');
      const separador = decodificado.indexOf(':');
      const senha = separador >= 0 ? decodificado.slice(separador + 1) : decodificado;
      if (senhasIguais(senha, senhaEsperada)) {
        return next();
      }
    } catch (err) {
      // credenciais malformadas: cai para o 401 abaixo
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="PDV Bar da Preta"');
  return res.status(401).json({ error: 'Autenticação necessária.' });
}

module.exports = autenticacao;
