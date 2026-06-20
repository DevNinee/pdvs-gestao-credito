const db = require('../../../database/connection');

class HistoricoRepository {

    async criarVenda({ clienteId, clienteNome, tipo, itens }) {
        return db.transaction(async (tx) => {

            const total = itens.reduce((soma, item) => soma + item.valor * item.quantidade, 0);

            const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const venda = await tx.run(
                `INSERT INTO historico (cliente_id, cliente_name, hora, total, tipo)
                 VALUES (?, ?, ?, ?, ?)`,
                [clienteId || null, clienteNome || 'Avulso', horaAtual, total, tipo]
            );
            const historicoId = venda.lastID;

            for (const item of itens) {
                await tx.run(
                    `INSERT INTO historico_itens (historico_id, produto_id, descricao, quantidade, valor)
                     VALUES (?, ?, ?, ?, ?)`,
                    [historicoId, item.produtoId || null, item.descricao, item.quantidade, item.valor]
                );

                if (item.produtoId) {
                    const produto = await tx.get('SELECT estoque FROM produtos WHERE id = ?', [item.produtoId]);
                    if (!produto) {
                        const erro = new Error(`Produto inexistente: ${item.descricao}`);
                        erro.status = 400;
                        erro.expose = true;
                        throw erro;
                    }
                    if (produto.estoque < item.quantidade) {
                        const erro = new Error(`Estoque insuficiente para "${item.descricao}" (restam ${produto.estoque}).`);
                        erro.status = 409;
                        erro.expose = true;
                        throw erro; 
                    }
                    await tx.run(
                        'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
                        [item.quantidade, item.produtoId]
                    );
                }
            }

            if (tipo === 'fiado' && clienteId) {
                await tx.run('UPDATE clientes SET divida = divida + ? WHERE id = ?', [total, clienteId]);
            }

            return { id: historicoId, total };
        });
    }

    async listarVendas() {
        return await db.all(`SELECT * FROM historico ORDER BY id DESC`);
    }
}

module.exports = new HistoricoRepository();
