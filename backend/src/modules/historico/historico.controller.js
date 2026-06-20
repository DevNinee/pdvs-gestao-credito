const HistoricoRepository = require('./historico.repository');
const { erroValidacao } = require('../../utils/erros');

class HistoricoController {
    async salvarVenda(req, res, next) {
        try {
            const { clienteId, clienteNome, tipo, itens } = req.body;

            if (!Array.isArray(itens) || itens.length === 0) {
                throw erroValidacao('A venda precisa ter pelo menos um item.');
            }
            if (!['pago', 'fiado'].includes(tipo)) {
                throw erroValidacao('Tipo de venda inválido (use "pago" ou "fiado").');
            }
            if (tipo === 'fiado' && !clienteId) {
                throw erroValidacao('Venda fiado exige um cliente selecionado.');
            }
            for (const item of itens) {
                const qtd = Number(item.quantidade);
                const valor = Number(item.valor);
                if (!item.descricao || !Number.isInteger(qtd) || qtd <= 0 || isNaN(valor) || valor < 0) {
                    throw erroValidacao('Item da venda inválido (descrição, quantidade ou valor).');
                }
            }

            const resultado = await HistoricoRepository.criarVenda({ clienteId, clienteNome, tipo, itens });
            return res.status(201).json({ success: true, id: resultado.id, total: resultado.total });
        } catch (error) {
            next(error);
        }
    }

    async listarVendas(req, res, next) {
        try {
            const vendas = await HistoricoRepository.listarVendas();
            return res.json(vendas);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new HistoricoController();
