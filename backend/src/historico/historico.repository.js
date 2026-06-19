const db = require('../../database/connection'); 

class HistoricoRepository {
    async criarVenda(clienteNome, total, tipo) {
        const query = `
            INSERT INTO historico (cliente_name, hora, total, tipo) 
            VALUES (?, ?, ?, ?)
        `;
        const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const result = await db.run(query, [clienteNome || 'Cliente Geral', horaAtual, total, tipo]);
        return result.id;
    }

    async listarVendas() {
        return await db.all(`SELECT * FROM historico ORDER BY id DESC`);
    }
}

module.exports = new HistoricoRepository();