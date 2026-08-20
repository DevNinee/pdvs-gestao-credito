const crypto = require('crypto');

// Comparação em tempo constante: evita que um atacante descubra a senha
// certa medindo quanto tempo a resposta demora (timing attack).
function senhasIguais(a, b) {
  const bufA = Buffer.from(String(a ?? ''));
  const bufB = Buffer.from(String(b ?? ''));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { senhasIguais };
