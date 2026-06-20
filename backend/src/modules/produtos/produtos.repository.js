const db = require('../../../database/connection');

class ProdutosRepository {
  async listar() {
    return await db.all('SELECT * FROM produtos');
  }

  async criar(nome, preco, estoque) {
    const query = 'INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)';
    const result = await db.run(query, [nome, preco, estoque]);
    return result.id;
  }

  async atualizar(id, nome, preco, estoque) {
    const query = 'UPDATE produtos SET nome = ?, preco = ?, estoque = ? WHERE id = ?';
    await db.run(query, [nome, preco, estoque, id]);
  }

  async deletar(id) {
    await db.run('DELETE FROM produtos WHERE id = ?', [id]);
  }
}

module.exports = new ProdutosRepository();
