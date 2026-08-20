const express = require('express');
const router = express.Router();
const ClientesController = require('./clientes.controller');

router.get('/', ClientesController.listar);
router.post('/', ClientesController.criar);
router.put('/:id', ClientesController.atualizar);
router.delete('/:id', ClientesController.deletar);
router.post('/:id/pagamentos', ClientesController.pagarDivida);

module.exports = router;
