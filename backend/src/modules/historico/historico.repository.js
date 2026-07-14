const db = require('../../../database/connection');

class HistoricoRepository {

    async criarVenda({ clienteId, clienteNome, tipo, itens }) {
        return db.transaction(async (tx) => {

            const total = itens.reduce((soma, item) => soma + item.valor * item.quantidade, 0);

            const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const venda = await tx.run(
                `INSERT INTO historico (cliente_id, cliente_name, hora, total, tipo)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [clienteId || null, clienteNome || 'Avulso', horaAtual, total, tipo]
            );
            const historicoId = venda.lastID;

            for (const item of itens) {
                await tx.run(
                    `INSERT INTO historico_itens (historico_id, produto_id, descricao, quantidade, valor)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [historicoId, item.produtoId || null, item.descricao, item.quantidade, item.valor]
                );

                if (item.produtoId) {
                    const produto = await tx.get('SELECT estoque FROM produtos WHERE id = $1', [item.produtoId]);
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
                        'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
                        [item.quantidade, item.produtoId]
                    );
                }
            }

            if (tipo === 'fiado' && clienteId) {
                await tx.run('UPDATE clientes SET divida = divida + $1 WHERE id = $2', [total, clienteId]);
            }

            return { id: historicoId, total };
        });
    }

    async listarVendas() {
        return await db.all(`SELECT * FROM historico ORDER BY id DESC`);
    }

    async limparHistorico() {
        return db.transaction(async (tx) => {
            await tx.run(`DELETE FROM historico_itens`);
            await tx.run(`DELETE FROM historico`);
        });
    }
}

module.exports = new HistoricoRepository();
