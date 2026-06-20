
const API_URL = 'http://localhost:3000/api';

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

    return null;
  }
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
    deletar: (id) => chamarAPI(`/clientes/${id}`, 'DELETE')
  },
  historico: {
    listar: () => chamarAPI('/historico')
  }
};

async function registrarVenda(venda) {
  const resposta = await fetch(`${API_URL}/historico`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(venda)
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(corpo.error || 'Erro ao registrar a venda no servidor');
  }
  return corpo;
}
