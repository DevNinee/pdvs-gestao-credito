const db = require('../../../database/connection');

class ClientesRepository {
  async listar() {
    return await db.all('SELECT * FROM clientes');
  }

  async criar(nome, divida) {
    const query = 'INSERT INTO clientes (nome, divida) VALUES ($1, $2) RETURNING id';
    const result = await db.run(query, [nome, divida]);
    return result.id;
  }

  async atualizar(id, nome, divida) {
    const query = 'UPDATE clientes SET nome = $1, divida = $2 WHERE id = $3';
    await db.run(query, [nome, divida, id]);
  }

  async deletar(id) {
    await db.run('DELETE FROM clientes WHERE id = $1', [id]);
  }
}

module.exports = new ClientesRepository();
