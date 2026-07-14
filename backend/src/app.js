const express = require('express');
const cors = require('cors');
const path = require('path');

const produtosRoutes = require('./modules/produtos/produtos.routes');
const clientesRoutes = require('./modules/clientes/clientes.routes');
const errorHandler = require('./middlewares/errorHandler');
const autenticacao = require('./middlewares/auth');

const app = express();

if (!process.env.APP_PASSWORD) {
  console.warn('[AVISO] APP_PASSWORD não configurada: a aplicação está acessível sem senha para quem tiver a URL.');
}

app.use(cors());
app.use(express.json());
app.use(autenticacao);

app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('/api/status', (req, res) => res.json({ status: 'API Online e Modular!' }));
app.use('/api/produtos', produtosRoutes);
app.use('/api/clientes', clientesRoutes);

const historicoRoutes = require('./modules/historico/historico.routes');
app.use('/api/historico', historicoRoutes);

app.use(errorHandler);

module.exports = app;
