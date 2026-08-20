const db = require('../../../database/connection');

function arredonda(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function erroExpose(status, mensagem) {
    const erro = new Error(mensagem);
    erro.status = status;
    erro.expose = true;
    return erro;
}

class HistoricoRepository {

    async criarVenda({ clienteId, clienteNome, tipo, itens }) {
        return db.transaction(async (tx) => {

            const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            let total = 0;
            const itensResolvidos = [];

            for (const item of itens) {
                let valorUnitario = Number(item.valor);

                if (item.produtoId) {
                    // UPDATE condicional atômico: a checagem de estoque e o
                    // decremento acontecem em uma única instrução, então o
                    // lock de linha do Postgres impede que duas vendas
                    // concorrentes derrubem o estoque abaixo de zero (race
                    // condition que existia no SELECT + checagem + UPDATE
                    // separados).
                    const atualizado = await tx.get(
                        `UPDATE produtos SET estoque = estoque - $1
                         WHERE id = $2 AND estoque >= $1
                         RETURNING preco, estoque`,
                        [item.quantidade, item.produtoId]
                    );

                    if (!atualizado) {
                        const produtoAtual = await tx.get('SELECT estoque FROM produtos WHERE id = $1', [item.produtoId]);
                        if (!produtoAtual) {
                            throw erroExpose(400, `Produto inexistente: ${item.descricao}`);
                        }
                        throw erroExpose(409, `Estoque insuficiente para "${item.descricao}" (restam ${produtoAtual.estoque}).`);
                    }

                    // O preço cobrado é sempre o preço atual no banco, nunca
                    // o valor enviado pelo cliente — evita fraude (alterar o
                    // preço na requisição) e evita cobrar um preço
                    // desatualizado se outro usuário editou o produto entre
                    // o carregamento da tela e o clique em "vender".
                    valorUnitario = Number(atualizado.preco);
                }

                valorUnitario = arredonda(valorUnitario);
                total = arredonda(total + valorUnitario * item.quantidade);
                itensResolvidos.push({ ...item, valor: valorUnitario });
            }

            const venda = await tx.run(
                `INSERT INTO historico (cliente_id, cliente_name, hora, total, tipo)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [clienteId || null, clienteNome || 'Avulso', horaAtual, total, tipo]
            );
            const historicoId = venda.lastID;

            for (const item of itensResolvidos) {
                await tx.run(
                    `INSERT INTO historico_itens (historico_id, produto_id, descricao, quantidade, valor)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [historicoId, item.produtoId || null, item.descricao, item.quantidade, item.valor]
                );
            }

            if (tipo === 'fiado' && clienteId) {
                await tx.run('UPDATE clientes SET divida = divida + $1 WHERE id = $2', [total, clienteId]);
            }

            return { id: historicoId, total };
        });
    }

    // Quitação (parcial ou total) de fiado: debitar a dívida do cliente e
    // registrar o pagamento no histórico precisam ser atômicos — se
    // fossem duas chamadas HTTP separadas (como o frontend fazia antes),
    // uma falha de rede entre elas deixaria a dívida reduzida sem nenhum
    // registro correspondente no histórico/caixa.
    async registrarPagamento({ clienteId, valor }) {
        const valorNum = arredonda(Number(valor));
        if (!Number.isFinite(valorNum) || valorNum <= 0) {
            throw erroExpose(400, 'Valor de pagamento inválido.');
        }

        return db.transaction(async (tx) => {
            const atualizado = await tx.get(
                `UPDATE clientes SET divida = divida - $1
                 WHERE id = $2 AND divida >= $1
                 RETURNING nome, divida`,
                [valorNum, clienteId]
            );

            if (!atualizado) {
                const clienteAtual = await tx.get('SELECT nome, divida FROM clientes WHERE id = $1', [clienteId]);
                if (!clienteAtual) {
                    throw erroExpose(404, 'Cliente não encontrado.');
                }
                throw erroExpose(400, `Valor maior que a dívida atual (R$ ${Number(clienteAtual.divida).toFixed(2)}).`);
            }

            const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const venda = await tx.run(
                `INSERT INTO historico (cliente_id, cliente_name, hora, total, tipo)
                 VALUES ($1, $2, $3, $4, 'pago') RETURNING id`,
                [clienteId, atualizado.nome, horaAtual, valorNum]
            );

            await tx.run(
                `INSERT INTO historico_itens (historico_id, produto_id, descricao, quantidade, valor)
                 VALUES ($1, NULL, 'Pagamento de Fiado', 1, $2)`,
                [venda.lastID, valorNum]
            );

            return { id: venda.lastID, divida: Number(atualizado.divida) };
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
