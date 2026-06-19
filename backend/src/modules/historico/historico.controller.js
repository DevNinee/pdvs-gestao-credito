const HistoricoRepository = require('historico/historico.repository');

class HistoricoController {
    async salvarVenda(req, res) {
        try {
            const { clienteNome, total, tipo } = req.body;
            await HistoricoRepository.criarVenda(clienteNome, total, tipo);
            return res.status(201).json({ success: true, message: "Venda gravada com sucesso!" });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    async listarVendas(req, res) {
        try {
            const vendas = await HistoricoRepository.listarVendas();
            return res.json(vendas);
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new HistoricoController();