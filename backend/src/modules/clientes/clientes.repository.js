const db = require('../../../database/connection');

class ClientesRepository {
  async listar() {
    return await db.all('SELECT * FROM clientes');
  }

  async criar(nome, divida) {
    const query = 'INSERT INTO clientes (nome, divida) VALUES (?, ?)';
    const result = await db.run(query, [nome, divida]);
    return result.id;
  }

  async atualizar(id, nome, divida) {
    const query = 'UPDATE clientes SET nome = ?, divida = ? WHERE id = ?';
    await db.run(query, [nome, divida, id]);
  }

  async deletar(id) {
    await db.run('DELETE FROM clientes WHERE id = ?', [id]);
  }
}

module.exports = new ClientesRepository();
