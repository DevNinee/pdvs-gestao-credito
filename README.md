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

## ️ Passo a Passo para Testar o Projeto:

Siga os passos abaixo para inicializar o banco de dados e rodar a aplicação localmente no seu computador.

1. **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Abra o seu terminal e acesse a pasta `backend` do projeto:
   ```bash
   cd backend
   ```
3. Instale as bibliotecas e dependências necessárias:
   ```bash
   npm install
   ```
4. **Inicialize o Banco de Dados:** Execute o script automatizado que cria as tabelas (`schema.sql`) e preenche o sistema com produtos e clientes de teste (`seed.sql`):
   ```bash
   node database/init.js
   ```
   *(Você verá no terminal a confirmação de sucesso).*
5. **Inicie o Servidor da API:**
   ```bash
   npm start
   ```
   *(Mantenha esta janela do terminal aberta. O servidor estará rodando na porta 3000).*
6. **Acesse o Sistema:** Vá até a pasta `frontend` e dê um duplo clique no arquivo `index.html` para abri-lo no seu navegador web, ou utilize a extensão Live Server no VS Code.

## Estrutura de Pastas
- `frontend/`: Contém a interface (`index.html`), folhas de estilo (`css/`) e lógicas de interação e chamadas de API (`js/`).
- `backend/`: Código fonte do servidor web.
  - `src/modules/`: Organização em modelo MVC (Controller, Repository, Routes) para isolar as lógicas.
  - `database/`: Onde fica armazenado o arquivo `.sqlite` e os scripts de inicialização (Seed/Schema).
- `docs/`: Arquivos PDF exigidos como entrega do trabalho (Carta de aceite, relatórios, etc).
