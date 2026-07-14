function destinoPosLogin() {
  const params = new URLSearchParams(window.location.search);
  const destino = params.get('redirect');
  if (destino && destino.startsWith('/') && !destino.startsWith('//') && !destino.startsWith('/api') && destino !== '/login') {
    return destino;
  }
  return '/';
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const botao = e.target.querySelector('button[type="submit"]');
  const campoSenha = document.getElementById('campo-senha');
  const erroEl = document.getElementById('login-erro');
  erroEl.textContent = '';
  botao.disabled = true;

  try {
    const resposta = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: campoSenha.value })
    });
    const corpo = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      erroEl.textContent = corpo.error || 'Não foi possível entrar.';
      campoSenha.value = '';
      campoSenha.focus();
      return;
    }

    window.location.href = destinoPosLogin();
  } catch (erro) {
    erroEl.textContent = 'Falha de conexão. Tente novamente.';
  } finally {
    botao.disabled = false;
  }
});
