const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Limpa as tabelas para garantir que começamos do zero no seed
  db.run('DELETE FROM produtos');
  db.run('DELETE FROM clientes');
  db.run('DELETE FROM sqlite_sequence'); // Resete de IDs

  const insertProduto = db.prepare('INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)');
  insertProduto.run('Cerveja Lata 350ml', 5.00, 48);
  insertProduto.run('Cerveja Long Neck', 8.00, 24);
  insertProduto.run('Refrigerante Lata', 5.00, 20);
  insertProduto.run('Água Mineral 500ml', 3.00, 30);
  insertProduto.run('Cachaça Dose', 6.00, 0);
  insertProduto.run('Vodka Dose', 9.00, 5);
  insertProduto.finalize();

  const insertCliente = db.prepare('INSERT INTO clientes (nome, divida) VALUES (?, ?)');
  insertCliente.run('Joãozinho', 45.00);
  insertCliente.run('Dona Maria', 12.50);
  insertCliente.run('Seu Zé', 0);
  insertCliente.finalize();

  console.log('Banco de dados populado com os dados reais iniciais!');
});

db.close();
