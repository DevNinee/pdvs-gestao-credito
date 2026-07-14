const API_URL = '/api';

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

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${endpoint}`, configuracao);
  } catch (erro) {
    console.error('Falha de rede na API:', erro);
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
  }

  if (resposta.status === 204) return null;

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem = (corpo && corpo.error) || 'Erro na comunicação com o servidor';
    console.error('Falha na API:', mensagem);
    throw new Error(mensagem);
  }

  return corpo;
}

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
    deletar: (id) => chamarAPI(`/clientes/${id}`, 'DELETE'),
    pagarDivida: (id, valor) => chamarAPI(`/clientes/${id}/pagamentos`, 'POST', { valor })
  },
  historico: {
    listar: () => chamarAPI('/historico'),
    limpar: () => chamarAPI('/historico', 'DELETE')
  }
};

function registrarVenda(venda) {
  return chamarAPI('/historico', 'POST', venda);
}
