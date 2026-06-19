// Interface de comunicação com a API do Back-end
const API_URL = 'http://localhost:3000/api';

// Wrapper para simplificar as requisições (Fetch API)
async function chamarAPI(endpoint, metodo = 'GET', dados = null) {
  const configuracao = {
    method: metodo,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (dados) {
    configuracao.body = JSON.stringify(dados);
  }

  try {
    const resposta = await fetch(`${API_URL}${endpoint}`, configuracao);
    if (!resposta.ok) throw new Error('Erro na comunicação com o servidor');
    return await resposta.json();
  } catch (erro) {
    console.error('Falha na API:', erro);
    // showToast('Erro de conexão', 'error'); // Essa função tá no main.js
    return null;
  }
}

// Endpoints disponíveis para consumo no Front-end
const Backend = {
  produtos: {
    listar: () => chamarAPI('/produtos'),
    criar: (produto) => chamarAPI('/produtos', 'POST', produto),
    atualizar: (id, produto) => chamarAPI(`/produtos/${id}`, 'PUT', produto),
    deletar: (id) => chamarAPI(`/produtos/${id}`, 'DELETE')
  },
  clientes: {
    listar: () => chamarAPI('/clientes'),
    criar: (cliente) => chamarAPI('/clientes', 'POST', cliente),
    atualizar: (id, cliente) => chamarAPI(`/clientes/${id}`, 'PUT', cliente),
    deletar: (id) => chamarAPI(`/clientes/${id}`, 'DELETE')
  }
};
