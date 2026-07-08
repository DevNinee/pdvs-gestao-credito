# PDV - Bar da Preta
## Gestão de Vendas, Controle de Estoque e Crédito | Sales, Inventory, and Credit Management

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJavaScript-orange)
![Architecture](https://img.shields.io/badge/Architecture-MVC-blue)
![Status](https://img.shields.io/badge/Status-Academic%20Project-success)

---

## PT-BR

### Sobre o projeto
O **PDV - Bar da Preta** é um sistema de Ponto de Venda (PDV) criado para digitalizar a operação de um pequeno comércio local, com foco em **agilidade no caixa**, **controle de estoque** e **gestão de fiado (caderneta)**.

O projeto foi desenvolvido como parte de uma ação de **Extensão Universitária**, conectando tecnologia a uma necessidade real.

### Problema que resolve
Muitos pequenos negócios ainda controlam vendas e fiado manualmente (caderno, anotações soltas ou memória), o que pode gerar:

- erros de cobrança;
- perda de informações de clientes;
- dificuldade para acompanhar dívidas;
- falta de visão atualizada do estoque;
- lentidão no atendimento.

A proposta do sistema é oferecer uma solução simples, prática e acessível para esse cenário.

### Funcionalidades principais
- **Frente de Caixa (PDV):** registro rápido de itens e cálculo automático do total.
- **Gestão de Fiado (Caderneta):** controle digital de débitos e pagamentos de clientes.
- **Controle de Estoque (CRUD):** cadastrar, editar, excluir e listar produtos.
- **Arquitetura Modular:** separação entre front-end e back-end para facilitar manutenção.

### Diferenciais
- Foco em pequenos comércios e fluxo de uso objetivo.
- Controle de fiado integrado ao processo de venda.
- Baixo custo de implantação com tecnologias leves.
- Organização em MVC, facilitando evolução técnica.
- Impacto acadêmico e social no contexto de extensão.

### Quem ajuda
- Proprietários de pequenos comércios.
- Operadores de caixa/atendentes.
- Clientes, com registros mais claros de compras e pagamentos.
- Estudantes e comunidade acadêmica, como estudo de caso prático.

### Por que fizemos
Este projeto foi desenvolvido para:

1. aplicar conhecimentos técnicos em um problema real;
2. apoiar a gestão de um comércio local com tecnologia;
3. reduzir erros operacionais e melhorar o controle financeiro;
4. gerar impacto por meio da extensão universitária;
5. fortalecer o trabalho colaborativo da equipe.

---

## EN

### About the project
**PDV - Bar da Preta** is a Point of Sale (POS) system designed to digitalize operations in a small local business, focusing on **fast checkout**, **inventory control**, and **customer credit (tab) management**.

This project was developed as part of a **University Extension initiative**, connecting software development to a real-world need.

### Problem it solves
Many small businesses still track sales and customer credit manually (paper notebooks, loose notes, or memory), which can lead to:

- billing mistakes;
- lost customer data;
- difficulty tracking outstanding balances;
- lack of up-to-date inventory visibility;
- slow service.

The system provides a simple, practical, and accessible solution for this context.

### Main features
- **Point of Sale (POS):** fast item registration and automatic total calculation.
- **Credit/Tab Management:** digital tracking of customer debt and payments.
- **Inventory Control (CRUD):** create, edit, delete, and list products.
- **Modular Architecture:** front-end/back-end separation for easier maintenance.

### Key differentials
- Designed for small local businesses with a straightforward workflow.
- Integrated credit tracking directly in the sales process.
- Low implementation cost using lightweight technologies.
- MVC-based organization to support long-term evolution.
- Academic and social impact through university extension.

### Who it helps
- Small business owners.
- Cashiers/attendants.
- Customers, with clearer purchase/payment records.
- Students and the academic community as a practical case study.

### Why we built it
This project was created to:

1. apply technical skills to a real problem;
2. support local business management through technology;
3. reduce operational errors and improve financial control;
4. deliver impact through university extension activities;
5. strengthen team collaboration and learning.

---

## Tech Stack
- **Front-end:** HTML5, CSS3, Vanilla JavaScript
- **Back-end:** Node.js, Express
- **Database:** SQLite

## How to run | Como executar

### Prerequisites | Pré-requisitos
- [Node.js](https://nodejs.org/) instalado / installed.

### Steps | Passos
1. Acesse a pasta backend / Go to backend:
   ```bash
   cd backend
   ```

2. Instale as dependências / Install dependencies:
   ```bash
   npm install
   ```

3. Inicialize o banco / Initialize database:
   ```bash
   node database/init.js
   ```

4. Inicie o servidor / Start API server:
   ```bash
   npm start
   ```

5. Abra o front-end / Open frontend:
   - Abra `frontend/index.html` no navegador / Open `frontend/index.html` in your browser
   - ou / or use **Live Server** no VS Code.

## Estrutura de pastas | Folder structure
- `frontend/` -> Interface do usuário / User interface
- `backend/` -> Servidor e regras de negócio / Server and business logic
  - `src/modules/` -> MVC (Controller, Repository, Routes)
  - `database/` -> SQLite e scripts de inicialização / SQLite and initialization scripts
- `docs/` -> Documentos acadêmicos / Academic documents

## Equipe | Team
- **Camile Felix**
- **Fabiana Souza**
- **Erick Ferreira**
- **Fernanda Ferreira**
- **Emanoel Alexandri**

## Licença | License
Projeto desenvolvido para fins acadêmicos no contexto de extensão universitária.  
Project developed for academic purposes in a university extension context.
