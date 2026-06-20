const express = require('express');
const router = express.Router();
const ProdutosController = require('./produtos.controller');

router.get('/', ProdutosController.listar);
router.post('/', ProdutosController.criar);
router.put('/:id', ProdutosController.atualizar);
router.delete('/:id', ProdutosController.deletar);

module.exports = router;
