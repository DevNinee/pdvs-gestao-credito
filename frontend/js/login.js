function destinoPosLogin() {
  const params = new URLSearchParams(window.location.search);
  const destinoRaw = params.get('redirect');
  if (!destinoRaw) {
    return '/';
  }

  try {
    const destino = new URL(destinoRaw, window.location.origin);
    if (
      destino.origin === window.location.origin &&
      destino.pathname.startsWith('/') &&
      !destino.pathname.startsWith('/api') &&
      destino.pathname !== '/login' &&
      destino.pathname !== '/login.html'
    ) {
      return `${destino.pathname}${destino.search}${destino.hash}`;
    }
  } catch (_) {
    return '/';
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
