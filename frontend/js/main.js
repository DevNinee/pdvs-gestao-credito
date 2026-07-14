
const state = {
  produtos: [],
  clientes: [],
  historico: [],
  carrinho: [],
  caixaHoje: 0,
  editandoProduto: null,
  editandoCliente: null,
  quitandoCliente: null,
};

function arredonda(v) {
  return Math.round((Number(v) + Number.EPSILON) * 100) / 100;
}

function ehHoje(dataISO) {
  if (!dataISO) return false;
  const d = new Date(dataISO);
  const hoje = new Date();
  return d.getFullYear() === hoje.getFullYear() &&
    d.getMonth() === hoje.getMonth() &&
    d.getDate() === hoje.getDate();
}

const fmt = v => `R$ ${arredonda(v).toFixed(2).replace('.', ',')}`;

// Impede duplo-clique/duplo-submit: desabilita o elemento durante a
// execução assíncrona do handler e reabilita ao final (sucesso ou erro).
function protegerClique(el, handler) {
  el.addEventListener('click', async (...args) => {
    if (el.disabled) return;
    el.disabled = true;
    try {
      await handler(...args);
    } finally {
      el.disabled = false;
    }
  });
}

function showToast(msg, tipo = 'success') {
  const container = document.querySelector('.toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${tipo}`;
  t.textContent = msg;
  t.style.transform = 'translateX(120%)';
  t.style.opacity = '0';
  t.style.transition = 'transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease';
  container.appendChild(t);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      t.style.transform = 'translateX(0)';
      t.style.opacity = '1';
    });
  });

  setTimeout(() => {
    t.style.transform = 'translateX(120%)';
    t.style.opacity = '0';
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, 2800);
}

function pulse(el) {
  el.style.transform = 'scale(1.08)';
  el.style.transition = 'transform 0.18s cubic-bezier(.34,1.56,.64,1)';
  setTimeout(() => {
    el.style.transform = '';
    setTimeout(() => el.style.transition = '', 200);
  }, 180);
}

function countUp(el, from, to, prefix = '') {
  const duration = 500;
  const start = performance.now();
  const diff = to - from;
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = from + diff * ease;
    el.textContent = prefix + fmt(val);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function openModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove('hidden');
  overlay.style.opacity = '0';
  const modal = overlay.querySelector('.modal');
  modal.style.transform = 'scale(0.88) translateY(16px)';
  modal.style.opacity = '0';
  modal.style.transition = 'transform 0.32s cubic-bezier(.34,1.56,.64,1), opacity 0.22s ease';
  overlay.style.transition = 'opacity 0.22s ease';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1) translateY(0)';
      modal.style.opacity = '1';
    });
  });
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  const modal = overlay.querySelector('.modal');
  modal.style.transform = 'scale(0.92) translateY(10px)';
  modal.style.opacity = '0';
  overlay.style.opacity = '0';
  overlay.addEventListener('transitionend', () => overlay.classList.add('hidden'), { once: true });
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const overlay = btn.closest('.modal-overlay');
    closeModal(overlay.id);
  });
});

document.querySelectorAll('.btn-outline').forEach(btn => {
  btn.addEventListener('click', () => {
    const overlay = btn.closest('.modal-overlay');
    if (overlay) closeModal(overlay.id);
  });
});

const tabs = document.querySelectorAll('.tab');
const views = {
  0: 'view-estoque',
  1: 'view-caderneta',
  2: 'view-historico',
};

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    Object.values(views).forEach(id => {
      const el = document.getElementById(id);
      el.classList.add('hidden');
      el.style.opacity = '0';
    });

    const target = document.getElementById(views[i]);
    target.classList.remove('hidden');
    requestAnimationFrame(() => {
      target.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      target.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
      });
    });
  });
});

function totalCarrinho() {
  return arredonda(state.carrinho.reduce((s, i) => s + i.preco * i.qty, 0));
}

function renderCarrinho() {
  const list = document.querySelector('.cart-list');
  const totalEl = document.querySelector('.cart-total-value');
  const oldTotal = parseFloat(totalEl.dataset.val || '0');
  const newTotal = totalCarrinho();

  list.innerHTML = '';

  if (state.carrinho.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    empty.textContent = 'Nenhum item adicionado.';
    empty.style.padding = '20px';
    empty.style.textAlign = 'center';
    empty.style.color = 'var(--text-muted, #888)';
    empty.style.fontSize = '13px';
    list.appendChild(empty);
  }

  state.carrinho.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.style.opacity = '0';
    row.style.transform = 'translateX(-12px)';
    row.style.transition = `opacity 0.22s ease ${idx * 0.05}s, transform 0.22s ease ${idx * 0.05}s`;
    row.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.nome}</span>
        <span class="cart-item-sub">${item.qty}× ${fmt(item.preco)}</span>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-total">${fmt(item.preco * item.qty)}</span>
        <button class="cart-item-remove" data-idx="${idx}">✕</button>
      </div>
    `;
    list.appendChild(row);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
      });
    });
  });

  countUp(totalEl, oldTotal, newTotal, '');
  totalEl.dataset.val = newTotal;

  list.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const row = btn.closest('.cart-item');
      row.style.transition = 'opacity 0.18s ease, transform 0.18s ease, max-height 0.25s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      row.style.maxHeight = '0';
      row.style.overflow = 'hidden';
      setTimeout(() => {
        state.carrinho.splice(idx, 1);
        renderCarrinho();
      }, 220);
    });
  });

  renderClienteSelect();
}

document.querySelector('.btn-ghost-danger').addEventListener('click', function () {
  if (state.carrinho.length === 0) return;
  pulse(this);
  state.carrinho = [];
  limparCampoClienteNovo();
  renderCarrinho();
  showToast('Comanda limpa', 'warning');
});

function montarItensVenda() {
  return state.carrinho.map(item => ({
    produtoId: item.produtoId,
    descricao: item.nome,
    quantidade: item.qty,
    valor: item.preco
  }));
}

function calcularCaixaHoje() {
  return arredonda(state.historico
    .filter(h => h.tipo === 'pago' && ehHoje(h.criado_em))
    .reduce((soma, h) => soma + Number(h.total), 0));
}

async function recarregarDados() {
  const [produtos, clientes, historico] = await Promise.all([
    Backend.produtos.listar(),
    Backend.clientes.listar(),
    Backend.historico.listar()
  ]);
  state.produtos = produtos;
  state.clientes = clientes;
  state.historico = historico;

  renderProdutoGrid();
  renderEstoque();
  renderCaderneta();
  renderClienteSelect();
  renderHistorico();

  const fiadoEl = document.querySelector('.stat-red');
  const totalFiado = arredonda(state.clientes.reduce((s, c) => s + Number(c.divida), 0));
  countUp(fiadoEl, parseFloat(fiadoEl.dataset.val || '0'), totalFiado, '');
  fiadoEl.dataset.val = totalFiado;

  state.caixaHoje = calcularCaixaHoje();
  const caixaEl = document.querySelector('.stat-green');
  countUp(caixaEl, parseFloat(caixaEl.dataset.val || '0'), state.caixaHoje, '');
  caixaEl.dataset.val = state.caixaHoje;

  atualizaStatEstoque();
}

// Resolve o cliente da venda atual: se houver um nome digitado no campo de
// cliente novo, tem prioridade — reaproveita um cliente já cadastrado com
// esse nome (case-insensitive) ou cria o cadastro na hora. Caso contrário,
// usa o cliente escolhido no <select> (ou null para venda avulsa).
async function resolverClienteVenda() {
  const inputNovo = document.querySelector('.field-cliente-novo');
  const nomeNovo = inputNovo.value.trim();

  if (nomeNovo) {
    const existente = state.clientes.find(c => c.nome.toLowerCase() === nomeNovo.toLowerCase());
    if (existente) return existente;

    const criado = await Backend.clientes.criar({ nome: nomeNovo, divida: 0 });
    state.clientes.push(criado);
    renderClienteSelect();
    return criado;
  }

  const select = document.querySelector('.field-select');
  const clienteId = select.value ? Number(select.value) : null;
  return clienteId ? state.clientes.find(c => c.id === clienteId) : null;
}

function limparCampoClienteNovo() {
  document.querySelector('.field-cliente-novo').value = '';
}

protegerClique(document.querySelector('.btn-receive'), async () => {
  if (state.carrinho.length === 0) return showToast('Carrinho vazio', 'error');
  const total = totalCarrinho();

  try {
    const cliente = await resolverClienteVenda();
    const clienteId = cliente ? cliente.id : null;
    const clienteNome = cliente ? cliente.nome : 'Avulso';

    await registrarVenda({ clienteId, clienteNome, tipo: 'pago', itens: montarItensVenda() });

    state.carrinho = [];
    limparCampoClienteNovo();
    await recarregarDados();
    renderCarrinho();
    showToast(`Recebido: ${fmt(total)}`, 'success');
  } catch (erro) {
    showToast(erro.message, 'error');
  }
});

protegerClique(document.querySelector('.btn-fiado'), async () => {
  if (state.carrinho.length === 0) return showToast('Carrinho vazio', 'error');

  try {
    const cliente = await resolverClienteVenda();
    if (!cliente) return showToast('Selecione ou digite o nome de um cliente para fiado', 'error');

    const total = totalCarrinho();
    await registrarVenda({ clienteId: cliente.id, clienteNome: cliente.nome, tipo: 'fiado', itens: montarItensVenda() });

    state.carrinho = [];
    limparCampoClienteNovo();
    await recarregarDados();
    renderCarrinho();
    showToast(`Pendurado para ${cliente.nome}: ${fmt(total)}`, 'warning');
  } catch (erro) {
    showToast(erro.message, 'error');
  }
});

function renderClienteSelect() {
  const select = document.querySelector('.field-select');
  const idAnterior = select.value;
  select.innerHTML = '';

  const optAvulsa = document.createElement('option');
  optAvulsa.value = '';
  optAvulsa.textContent = '— Venda Avulsa (sem cadastro) —';
  select.appendChild(optAvulsa);

  state.clientes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nome + (c.divida > 0 ? ` — Deve ${fmt(c.divida)}` : '');
    select.appendChild(opt);
  });

  if ([...select.options].some(o => o.value === idAnterior)) {
    select.value = idAnterior;
  }
}

function renderEstoque() {
  const wrap = document.querySelector('#view-estoque .table-wrap');
  const head = wrap.querySelector('.table-head');
  wrap.innerHTML = '';
  wrap.appendChild(head);

  state.produtos.forEach((p, i) => {
    const badgeClass = p.estoque === 0 ? 'badge-red' : p.estoque <= 6 ? 'badge-orange' : 'badge-green';
    const badgeText  = p.estoque === 0 ? '0' : p.estoque;
    const row = document.createElement('div');
    row.className = 'table-row';
    row.style.opacity = '0';
    row.style.transform = 'translateY(8px)';
    row.style.transition = `opacity 0.2s ease ${i * 0.04}s, transform 0.2s ease ${i * 0.04}s`;
    row.innerHTML = `
      <span class="row-name">${p.nome}</span>
      <span class="row-price">${fmt(p.preco)}</span>
      <span class="col-center"><span class="badge ${badgeClass}">${badgeText}</span></span>
      <span class="col-center row-actions">
        <button class="btn-edit" data-id="${p.id}">Editar</button>
        <button class="btn-delete" data-id="${p.id}">Del</button>
      </span>
    `;
    wrap.appendChild(row);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      row.style.opacity = '1';
      row.style.transform = 'translateY(0)';
    }));
  });

  renderProdutoGrid();

  wrap.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      state.editandoProduto = state.produtos.find(p => p.id === id);
      const m = document.getElementById('modal-edit-product');
      m.querySelector('input[type="text"]').value = state.editandoProduto.nome;
      m.querySelectorAll('input[type="number"]')[0].value = state.editandoProduto.preco.toFixed(2);
      m.querySelectorAll('input[type="number"]')[1].value = state.editandoProduto.estoque;
      openModal('modal-edit-product');
    });
  });

  wrap.querySelectorAll('.btn-delete').forEach(btn => {
    protegerClique(btn, async () => {
      const id = parseInt(btn.dataset.id);
      try {
        await Backend.produtos.deletar(id);
        state.produtos = state.produtos.filter(p => p.id !== id);
        renderEstoque();
        showToast('Produto removido do banco', 'error');
      } catch (erro) {
        showToast(erro.message, 'error');
      }
    });
  });
}

function renderProdutoGrid() {
  const grid = document.querySelector('.product-grid');
  grid.innerHTML = '';

  state.produtos.forEach(p => {
    const badgeClass = p.estoque === 0 ? 'badge-red' : p.estoque <= 6 ? 'badge-orange' : 'badge-green';
    const badgeText  = p.estoque === 0 ? 'Esgotado' : `${p.estoque} un`;

    const btn = document.createElement('button');
    btn.className = 'product-btn';
    btn.dataset.id = p.id;
    btn.disabled = p.estoque === 0;
    btn.innerHTML = `
      <span class="product-name">${p.nome}</span>
      <div class="product-footer">
        <span class="product-price">${fmt(p.preco)}</span>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
    btn.addEventListener('click', () => adicionarAoCarrinho(p, btn));
    grid.appendChild(btn);
  });

  const meta = grid.closest('section')?.querySelector('.panel-meta');
  if (meta) meta.textContent = `${state.produtos.length} itens`;
}

function adicionarAoCarrinho(produto, btn) {
  const existente = state.carrinho.find(i => i.produtoId === produto.id);
  const qtdAtual = existente ? existente.qty : 0;

  if (qtdAtual + 1 > produto.estoque) {
    return showToast(`Estoque insuficiente de ${produto.nome}`, 'error');
  }

  if (btn) {
    btn.style.transform = 'scale(0.94)';
    btn.style.transition = 'transform 0.12s ease';
    setTimeout(() => {
      btn.style.transform = '';
      setTimeout(() => btn.style.transition = '', 150);
    }, 120);
  }

  if (existente) {
    existente.qty++;
  } else {
    state.carrinho.push({ produtoId: produto.id, nome: produto.nome, preco: produto.preco, qty: 1 });
  }

  renderCarrinho();
  showToast(`${produto.nome} adicionado`, 'success');
}

document.querySelector('#view-estoque .btn-primary').addEventListener('click', () => {
  const m = document.getElementById('modal-new-product');
  m.querySelector('input[type="text"]').value = '';
  m.querySelectorAll('input[type="number"]')[0].value = '';
  m.querySelectorAll('input[type="number"]')[1].value = '0';
  openModal('modal-new-product');
});

protegerClique(document.querySelector('#modal-new-product .btn-primary'), async () => {
  const m = document.getElementById('modal-new-product');
  const nome = m.querySelector('input[type="text"]').value.trim();
  const preco = parseFloat(m.querySelectorAll('input[type="number"]')[0].value) || 0;
  const estoque = parseInt(m.querySelectorAll('input[type="number"]')[1].value) || 0;
  if (!nome) return showToast('Informe o nome do produto', 'error');

  try {
    const novoProduto = await Backend.produtos.criar({ nome, preco, estoque });
    state.produtos.push(novoProduto);
    closeModal('modal-new-product');
    renderEstoque();
    showToast(`${nome} salvo com sucesso`, 'success');
  } catch (erro) {
    showToast(erro.message, 'error');
  }
});

protegerClique(document.querySelector('#modal-edit-product .btn-primary'), async () => {
  const m = document.getElementById('modal-edit-product');
  const p = state.editandoProduto;
  const nome    = m.querySelector('input[type="text"]').value.trim() || p.nome;
  const preco   = parseFloat(m.querySelectorAll('input[type="number"]')[0].value);
  const estoque = parseInt(m.querySelectorAll('input[type="number"]')[1].value);

  try {
    await Backend.produtos.atualizar(p.id, {
      nome,
      preco: isNaN(preco) ? p.preco : preco,
      estoque: isNaN(estoque) ? p.estoque : estoque
    });
    p.nome = nome;
    if (!isNaN(preco)) p.preco = preco;
    if (!isNaN(estoque)) p.estoque = estoque;

    closeModal('modal-edit-product');
    renderEstoque();
    showToast('Produto atualizado no banco', 'success');
  } catch (erro) {
    showToast(erro.message, 'error');
  }
});

function atualizaStatEstoque() {
  const total = state.produtos.reduce((s, p) => s + p.estoque, 0);
  const el = document.querySelector('.stat-amber');
  const old = parseInt(el.dataset.val || '127');
  el.dataset.val = total;
  const dur = 400;
  const start = performance.now();
  const diff = total - old;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(old + diff * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}

function renderCaderneta() {
  const list = document.querySelector('.client-list');
  list.innerHTML = '';

  state.clientes.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'client-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(8px)';
    card.style.transition = `opacity 0.2s ease ${i * 0.05}s, transform 0.2s ease ${i * 0.05}s`;

    const debtClass = c.divida > 0 ? 'debt-active' : 'debt-none';
    const debtText  = c.divida > 0 ? `Deve ${fmt(c.divida)}` : 'Sem dívidas';

    card.innerHTML = `
      <div class="client-info">
        <span class="client-name">${c.nome}</span>
        <span class="client-debt ${debtClass}">${debtText}</span>
      </div>
      <div class="client-actions">
        ${c.divida > 0 ? `<button class="btn-success-sm" data-id="${c.id}">Quitar</button>` : ''}
        <button class="btn-edit" data-id="${c.id}">Editar</button>
        <button class="btn-delete" data-id="${c.id}">Del</button>
      </div>
    `;
    list.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }));
  });

  list.querySelectorAll('.btn-success-sm').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      state.quitandoCliente = state.clientes.find(c => c.id === id);
      const m = document.getElementById('modal-quitar');
      m.querySelector('.debt-summary-label').textContent = `${state.quitandoCliente.nome} — Saldo devedor`;
      m.querySelector('.debt-summary-value').textContent = fmt(state.quitandoCliente.divida);
      m.querySelector('.field-input').value = state.quitandoCliente.divida.toFixed(2);
      openModal('modal-quitar');
    });
  });

  list.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      state.editandoCliente = state.clientes.find(c => c.id === id);
      const m = document.getElementById('modal-edit-client');
      m.querySelectorAll('.field-input')[0].value = state.editandoCliente.nome;
      m.querySelectorAll('.field-input')[1].value = state.editandoCliente.divida.toFixed(2);
      openModal('modal-edit-client');
    });
  });

  list.querySelectorAll('.btn-delete').forEach(btn => {
    protegerClique(btn, async () => {
      const id = parseInt(btn.dataset.id);
      try {
        await Backend.clientes.deletar(id);
        state.clientes = state.clientes.filter(c => c.id !== id);
        renderCaderneta();
        renderClienteSelect();
        showToast('Cliente removido do banco', 'error');
      } catch (erro) {
        showToast(erro.message, 'error');
      }
    });
  });
}

document.querySelector('#view-caderneta .btn-primary').addEventListener('click', () => {
  document.getElementById('modal-new-client').querySelector('.field-input').value = '';
  openModal('modal-new-client');
});

protegerClique(document.querySelector('#modal-new-client .btn-primary'), async () => {
  const nome = document.querySelector('#modal-new-client .field-input').value.trim();
  if (!nome) return showToast('Informe o nome do cliente', 'error');

  try {
    const novoCliente = await Backend.clientes.criar({ nome, divida: 0 });
    state.clientes.push(novoCliente);
    closeModal('modal-new-client');
    renderCaderneta();
    renderClienteSelect();
    showToast(`${nome} cadastrado com sucesso!`, 'success');
  } catch (erro) {
    showToast(erro.message, 'error');
  }
});

protegerClique(document.querySelector('#modal-edit-client .btn-primary'), async () => {
  const c = state.editandoCliente;
  const m = document.getElementById('modal-edit-client');
  const nome = m.querySelectorAll('.field-input')[0].value.trim() || c.nome;
  const divida = parseFloat(m.querySelectorAll('.field-input')[1].value);

  try {
    await Backend.clientes.atualizar(c.id, { nome, divida: isNaN(divida) ? c.divida : divida });
    c.nome = nome;
    if (!isNaN(divida)) c.divida = divida;

    closeModal('modal-edit-client');
    renderCaderneta();
    renderClienteSelect();
    showToast('Cliente atualizado no banco', 'success');
  } catch (erro) {
    showToast(erro.message, 'error');
  }
});

protegerClique(document.querySelector('.btn-success-lg'), async () => {
  const c = state.quitandoCliente;
  const val = arredonda(parseFloat(document.querySelector('#modal-quitar .field-input').value) || 0);

  if (val <= 0) return showToast('Informe um valor de pagamento válido', 'error');
  if (val > c.divida) return showToast(`Valor maior que a dívida (${fmt(c.divida)})`, 'error');

  try {
    await Backend.clientes.pagarDivida(c.id, val);
    await recarregarDados();
    closeModal('modal-quitar');
    showToast(`${c.nome} pagou ${fmt(val)}`, 'success');
  } catch (erro) {
    showToast(erro.message, 'error');
  }
});

function renderHistorico() {
  const list = document.querySelector('.comanda-list');
  list.innerHTML = '';

  state.historico.forEach((h, i) => {
    const card = document.createElement('div');
    card.className = 'comanda-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px)';
    card.style.transition = `opacity 0.22s ease ${i * 0.05}s, transform 0.22s ease ${i * 0.05}s`;

    const typeClass = h.tipo === 'fiado' ? 'type-fiado' : 'type-pago';
    const typeText  = h.tipo === 'fiado' ? 'Fiado' : 'Pago';

    card.innerHTML = `
      <div class="comanda-header">
        <div>
          <div class="comanda-client">${h.cliente_name || 'Cliente Geral'}</div>
          <div class="comanda-time">${h.hora}</div>
        </div>
        <div class="comanda-right">
          <div class="comanda-total">${fmt(h.total)}</div>
          <div class="comanda-type ${typeClass}">${typeText}</div>
        </div>
      </div>
      <div class="comanda-items">
         <div class="comanda-line"><span>Venda processada no PDV</span><span>${fmt(h.total)}</span></div>
      </div>
    `;
    list.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }));
  });
}

document.querySelector('#view-historico .btn-ghost-danger').addEventListener('click', async function () {
  if (this.disabled) return;
  if (!confirm('Tem certeza que deseja limpar todo o histórico? Isso apagará todas as vendas registradas.')) return;

  this.disabled = true;
  try {
    pulse(this);
    await Backend.historico.limpar();
    state.historico = [];
    state.caixaHoje = 0;
    const caixaEl = document.querySelector('.stat-green');
    caixaEl.dataset.val = '0';
    caixaEl.textContent = fmt(0);
    renderHistorico();
    showToast('Histórico limpo com sucesso', 'warning');
  } catch (erro) {
    showToast(erro.message, 'error');
  } finally {
    this.disabled = false;
  }
});

// Ao voltar para a aba (ex.: outro dispositivo/aba registrou uma venda
// enquanto esta ficou em segundo plano), busca o estado real do servidor
// para evitar operar sobre dados desatualizados.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    recarregarDados().catch(err => console.error('Falha ao sincronizar dados:', err));
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [produtos, clientes, historico] = await Promise.all([
      Backend.produtos.listar(),
      Backend.clientes.listar(),
      Backend.historico.listar()
    ]);
    state.produtos = produtos;
    state.clientes = clientes;
    state.historico = historico;
    state.caixaHoje = calcularCaixaHoje();
  } catch (erro) {
    showToast('Não foi possível carregar os dados do servidor.', 'error');
    console.error('Falha ao carregar dados iniciais:', erro);
  }

  const totalFiadoInicial = arredonda(state.clientes.reduce((s, c) => s + Number(c.divida), 0));
  const totalItensEstoque = state.produtos.reduce((s, p) => s + p.estoque, 0);

  document.querySelector('.stat-green').dataset.val = state.caixaHoje;
  document.querySelector('.stat-red').dataset.val   = totalFiadoInicial;
  document.querySelector('.stat-amber').dataset.val = totalItensEstoque;

  document.querySelector('.stat-green').textContent = fmt(state.caixaHoje);
  document.querySelector('.stat-red').textContent   = fmt(totalFiadoInicial);
  document.querySelector('.stat-amber').textContent = totalItensEstoque;

  renderCarrinho();
  renderClienteSelect();
  renderEstoque();
  renderCaderneta();
  renderHistorico();

  const staticToast = document.querySelector('.toast-success');
  if (staticToast) {
    setTimeout(() => {
      staticToast.style.transition = 'opacity 0.4s, transform 0.4s';
      staticToast.style.opacity = '0';
      staticToast.style.transform = 'translateX(120%)';
      setTimeout(() => staticToast.remove(), 400);
    }, 3000);
  }

  document.querySelectorAll('.stat-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-12px)';
    card.style.transition = `opacity 0.35s ease ${0.1 + i * 0.1}s, transform 0.35s ease ${0.1 + i * 0.1}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }));
  });

  document.querySelectorAll('.panel').forEach((panel, i) => {
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(16px)';
    panel.style.transition = `opacity 0.4s ease ${0.2 + i * 0.08}s, transform 0.4s ease ${0.2 + i * 0.08}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    }));
  });
});
