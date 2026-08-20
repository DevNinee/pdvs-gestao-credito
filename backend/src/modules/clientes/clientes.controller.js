const ClientesRepository = require('./clientes.repository');
const HistoricoRepository = require('../historico/historico.repository');
const { erroValidacao } = require('../../utils/erros');

function validarId(id) {
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    throw erroValidacao('Identificador inválido.');
  }
  return idNum;
}

function validarCliente({ nome, divida }) {
  const dividaNum = divida === undefined ? 0 : Number(divida);
  if (!nome || typeof nome !== 'string' || !nome.trim()) {
    throw erroValidacao('Nome do cliente é obrigatório.');
  }
  if (isNaN(dividaNum) || dividaNum < 0) {
    throw erroValidacao('Dívida deve ser um número maior ou igual a zero.');
  }
  return { nome: nome.trim(), divida: dividaNum };
}

class ClientesController {
  async listar(req, res, next) {
    try {
      const clientes = await ClientesRepository.listar();
      res.json(clientes);
    } catch (err) {
      next(err);
    }
  }

  async criar(req, res, next) {
    try {
      const { nome, divida } = validarCliente(req.body);
      const id = await ClientesRepository.criar(nome, divida);
      res.status(201).json({ id, nome, divida });
    } catch (err) {
      next(err);
    }
  }

  async atualizar(req, res, next) {
    try {
      const id = validarId(req.params.id);
      const { nome, divida } = validarCliente(req.body);
      await ClientesRepository.atualizar(id, nome, divida);
      res.json({ id, nome, divida });
    } catch (err) {
      next(err);
    }
  }

  async deletar(req, res, next) {
    try {
      const id = validarId(req.params.id);
      await ClientesRepository.deletar(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async pagarDivida(req, res, next) {
    try {
      const id = validarId(req.params.id);
      const { valor } = req.body;
      const resultado = await HistoricoRepository.registrarPagamento({ clienteId: id, valor });
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ClientesController();
