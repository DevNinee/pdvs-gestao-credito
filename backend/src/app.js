const express = require('express');
const cors = require('cors');
const path = require('path');

const produtosRoutes = require('./modules/produtos/produtos.routes');
const clientesRoutes = require('./modules/clientes/clientes.routes');
const errorHandler = require('./middlewares/errorHandler');
const autenticacao = require('./middlewares/auth');
const { criarToken, COOKIE_NOME, DURACAO_MS } = require('./utils/sessao');
const { senhasIguais } = require('./utils/senha');

const app = express();

if (!process.env.APP_PASSWORD) {
  console.warn('[AVISO] APP_PASSWORD não configurada: a aplicação está acessível sem senha para quem tiver a URL.');
}

app.use(cors());
app.use(express.json());
app.use(autenticacao);

app.post('/api/login', (req, res) => {
  const senhaEsperada = process.env.APP_PASSWORD;
  const { senha } = req.body || {};

  if (!senhaEsperada || typeof senha !== 'string' || !senhasIguais(senha, senhaEsperada)) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }

  res.cookie(COOKIE_NOME, criarToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: DURACAO_MS
  });
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(COOKIE_NOME);
  res.json({ ok: true });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/login.html'));
});

app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('/api/status', (req, res) => res.json({ status: 'API Online e Modular!' }));
app.use('/api/produtos', produtosRoutes);
app.use('/api/clientes', clientesRoutes);

const historicoRoutes = require('./modules/historico/historico.routes');
app.use('/api/historico', historicoRoutes);

app.use(errorHandler);

module.exports = app;
