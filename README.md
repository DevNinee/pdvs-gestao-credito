# PDV - Bar da Preta: Gestão de Vendas e Controle de Crédito

Este é um sistema de Ponto de Venda (PDV) desenvolvido como parte da disciplina de Projeto de Extensão Universitária. O objetivo principal da aplicação é informatizar a gestão de estoque e o controle de "fiados" (crédito) dos clientes.

## Funcionalidades e Características
- **Frente de Caixa (PDV):** Interface interativa para adicionar itens ao carrinho, visualizar o valor total e realizar a cobrança rápida.
- **Gestão de Fiados (Caderneta):** Controle digital das contas dos clientes, permitindo pendurar compras e abater dívidas de forma fácil.
- **Controle de Estoque (CRUD):** Visualização, adição, edição e remoção de produtos, com atualização automática no banco de dados.
- **Arquitetura Modular:** Separação clara entre Front-End (HTML/JS puro) e Back-End (Node.js com MVC).

## Tecnologias Utilizadas
- **Front-End:** HTML5, CSS3, JavaScript (Vanilla).
- **Back-End:** Node.js, Express.
- **Banco de Dados:** SQLite.

## Como Executar o Projeto

1. **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) instalado no seu computador.
2. Abra o seu terminal, entre na pasta principal do projeto e acesse o diretório do backend:
   ```bash
   cd backend
   ```
3. Instale todas as dependências necessárias:
   ```bash
   npm install
   ```
4. *Opcional:* Se você quiser carregar o banco de dados com dados falsos iniciais (produtos e clientes para teste), rode o script semente:
   ```bash
   node database/seed.js
   ```
5. Inicie o servidor do Back-end:
   ```bash
   npm start
   ```
6. Com o servidor rodando (você verá a mensagem `Servidor modular rodando em http://localhost:3000`), basta abrir o arquivo `frontend/index.html` em qualquer navegador web ou através do Live Server no VS Code.

## Estrutura de Pastas
- `frontend/`: Contém a interface (`index.html`), folhas de estilo (`css/`) e lógicas de interação e chamadas de API (`js/`).
- `backend/`: Código fonte do servidor web.
  - `src/modules/`: Organização em modelo MVC (Controller, Repository, Routes) para isolar as lógicas.
  - `database/`: Onde fica armazenado o arquivo `.sqlite` e os scripts de inicialização (Seed/Schema).
- `docs/`: Arquivos PDF exigidos como entrega do trabalho (Carta de aceite, relatórios, etc).
