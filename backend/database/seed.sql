
DELETE FROM produtos;
DELETE FROM clientes;
DELETE FROM historico;
DELETE FROM historico_itens;

DELETE FROM sqlite_sequence;

INSERT INTO produtos (nome, preco, estoque) VALUES 
('Cerveja Lata 350ml', 5.00, 48),
('Cerveja Long Neck', 8.00, 24),
('Refrigerante Lata', 5.00, 20),
('Água Mineral 500ml', 3.00, 30),
('Cachaça Dose', 6.00, 0),
('Vodka Dose', 9.00, 5);

INSERT INTO clientes (nome, divida) VALUES 
('Joãozinho', 45.00),
('Dona Maria', 12.50),
('Seu Zé', 0.00);

INSERT INTO historico (cliente_id, cliente_name, hora, total, tipo) VALUES
(NULL, 'Avulso', '18:30', 25.00, 'pago'),
(2, 'Dona Maria', '19:15', 12.50, 'fiado');
