const express = require('express');
const cors = require('cors');
const path = require('path');

const produtosRoutes = require('./modules/produtos/produtos.routes');
const clientesRoutes = require('./modules/clientes/clientes.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Serve o Front-end estático
app.use(express.static(path.join(__dirname, '../../../frontend')));

// Rotas da API
app.get('/api/status', (req, res) => res.json({ status: 'API Online e Modular!' }));
app.use('/api/produtos', produtosRoutes);
app.use('/api/clientes', clientesRoutes);

// O ideal é a pessoa 1 criar o modulo de historico depois

// Middleware de tratamento de Erros
app.use(errorHandler);

module.exports = app;
