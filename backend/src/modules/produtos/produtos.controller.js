const ProdutosRepository = require('./produtos.repository');
const { erroValidacao } = require('../../utils/erros');

function validarProduto({ nome, preco, estoque }) {
  const precoNum = Number(preco);
  const estoqueNum = Number(estoque);
  if (!nome || typeof nome !== 'string' || !nome.trim()) {
    throw erroValidacao('Nome do produto é obrigatório.');
  }
  if (isNaN(precoNum) || precoNum < 0) {
    throw erroValidacao('Preço deve ser um número maior ou igual a zero.');
  }
  if (!Number.isInteger(estoqueNum) || estoqueNum < 0) {
    throw erroValidacao('Estoque deve ser um número inteiro maior ou igual a zero.');
  }
  return { nome: nome.trim(), preco: precoNum, estoque: estoqueNum };
}

class ProdutosController {
  async listar(req, res, next) {
    try {
      const produtos = await ProdutosRepository.listar();
      res.json(produtos);
    } catch (err) {
      next(err);
    }
  }

  async criar(req, res, next) {
    try {
      const { nome, preco, estoque } = validarProduto(req.body);
      const id = await ProdutosRepository.criar(nome, preco, estoque);
      res.status(201).json({ id, nome, preco, estoque });
    } catch (err) {
      next(err);
    }
  }

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, preco, estoque } = validarProduto(req.body);
      await ProdutosRepository.atualizar(id, nome, preco, estoque);
      res.json({ id, nome, preco, estoque });
    } catch (err) {
      next(err);
    }
  }

  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      await ProdutosRepository.deletar(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProdutosController();
