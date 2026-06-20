const express = require('express');
const router = express.Router();
const HistoricoController = require('./historico.controller');
router.post('/', HistoricoController.salvarVenda);
router.get('/', HistoricoController.listarVendas);
module.exports = router;