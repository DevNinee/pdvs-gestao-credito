/* ════════════════════════════════════════════════
   BarControl — JavaScript de Interações & Animações
   ════════════════════════════════════════════════ */

/* ── Estado global ── */
const state = {
  produtos: [
    { id: 1, nome: 'Cerveja Lata 350ml',  preco: 5.00, estoque: 48 },
    { id: 2, nome: 'Cerveja Long Neck',   preco: 8.00, estoque: 24 },
    { id: 3, nome: 'Refrigerante Lata',   preco: 5.00, estoque: 20 },
    { id: 4, nome: 'Água Mineral 500ml',  preco: 3.00, estoque: 30 },
    { id: 5, nome: 'Cachaça Dose',        preco: 6.00, estoque: 0  },
    { id: 6, nome: 'Vodka Dose',          preco: 9.00, estoque: 5  },
  ],
  clientes: [
    { id: 1, nome: 'Joãozinho', divida: 45.00 },
    { id: 2, nome: 'Dona Maria', divida: 12.50 },
    { id: 3, nome: 'Seu Zé',    divida: 0     },
  ],
  historico: [
    {
      id: 1, cliente: 'Joãozinho', hora: '14:32', total: 19.00, tipo: 'fiado',
      itens: [{ desc: '2× Cerveja Lata 350ml', val: 10.00 }, { desc: '1× Vodka Dose', val: 9.00 }]
    },
    {
      id: 2, cliente: 'Avulso', hora: '13:10', total: 16.00, tipo: 'pago',
      itens: [{ desc: '2× Cerveja Long Neck', val: 16.00 }]
    },
    {
      id: 3, cliente: 'Dona Maria', hora: '11:45', total: 12.50, tipo: 'fiado',
      itens: [
        { desc: '1× Cerveja Lata 350ml', val: 5.00 },
        { desc: '1× Refrigerante Lata',  val: 5.00 },
        { desc: '1× Água Mineral',       val: 2.50 },
      ]
    },
  ],
  carrinho: [],     // { produtoId, nome, preco, qty }
  caixaHoje: 320.00,
  editandoProduto: null,
  editandoCliente: null,
  quitandoCliente: null,
};

/* ══════════════════════════════════════════════
   UTILITÁRIOS
══════════════════════════════════════════════ */
const fmt = v => `R$ ${v.toFixed(2).replace('.', ',')}`;

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

/* ══════════════════════════════════════════════
   MODAIS
══════════════════════════════════════════════ */
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

/* Fecha modal ao clicar no overlay */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

/* Fecha modal ao clicar em ✕ */
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const overlay = btn.closest('.modal-overlay');
    closeModal(overlay.id);
  });
});

/* Botões Cancelar */
document.querySelectorAll('.btn-outline').forEach(btn => {
  btn.addEventListener('click', () => {
    const overlay = btn.closest('.modal-overlay');
    if (overlay) closeModal(overlay.id);
  });
});

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   CARRINHO
══════════════════════════════════════════════ */
function totalCarrinho() {
  return state.carrinho.reduce((s, i) => s + i.preco * i.qty, 0);
}

function renderCarrinho() {
  const list = document.querySelector('.cart-list');
  const totalEl = document.querySelector('.cart-total-value');
  const oldTotal = parseFloat(totalEl.dataset.val || '0');
  const newTotal = totalCarrinho();

  /* limpa */
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

  /* total animado */
  countUp(totalEl, oldTotal, newTotal, '');
  totalEl.dataset.val = newTotal;

  /* botões remover */
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

  /* atualiza select de clientes */
  renderClienteSelect();
}

/* ── Adicionar produto ao carrinho ── */
document.querySelectorAll('.product-btn:not([disabled])').forEach(btn => {
  btn.addEventListener('click', () => {
    const nome  = btn.querySelector('.product-name').textContent.trim();
    const preco = parseFloat(
      btn.querySelector('.product-price').textContent.replace('R$ ', '').replace(',', '.')
    );

    /* feedback visual no botão */
    btn.style.transform = 'scale(0.94)';
    btn.style.transition = 'transform 0.12s ease';
    setTimeout(() => {
      btn.style.transform = '';
      setTimeout(() => btn.style.transition = '', 150);
    }, 120);

    const existing = state.carrinho.find(i => i.nome === nome);
    if (existing) {
      existing.qty++;
    } else {
      state.carrinho.push({ nome, preco, qty: 1 });
    }

    renderCarrinho();
    showToast(`${nome} adicionado`, 'success');
  });
});

/* ── Limpar carrinho ── */
document.querySelector('.btn-ghost-danger').addEventListener('click', function () {
  if (state.carrinho.length === 0) return;
  pulse(this);
  state.carrinho = [];
  renderCarrinho();
  showToast('Comanda limpa', 'warning');
});

/* ── Receber ── */
document.querySelector('.btn-receive').addEventListener('click', () => {
  if (state.carrinho.length === 0) return showToast('Carrinho vazio', 'error');
  const total = totalCarrinho();

  /* registra no histórico */
  state.historico.unshift({
    id: Date.now(),
    cliente: 'Avulso',
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    total,
    tipo: 'pago',
    itens: state.carrinho.map(i => ({ desc: `${i.qty}× ${i.nome}`, val: i.preco * i.qty })),
  });

  state.caixaHoje += total;
  const caixaEl = document.querySelector('.stat-green');
  const oldCaixa = parseFloat(caixaEl.dataset.val || '320');
  countUp(caixaEl, oldCaixa, state.caixaHoje, '');
  caixaEl.dataset.val = state.caixaHoje;

  state.carrinho = [];
  renderCarrinho();
  renderHistorico();
  showToast(`Recebido: ${fmt(total)} ✓`, 'success');
});

/* ── Pendurar (fiado) ── */
document.querySelector('.btn-fiado').addEventListener('click', () => {
  if (state.carrinho.length === 0) return showToast('Carrinho vazio', 'error');
  const select = document.querySelector('.field-select');
  const clienteNome = select.value.split(' —')[0].trim();
  if (clienteNome.startsWith('—')) return showToast('Selecione um cliente para fiado', 'error');

  const total = totalCarrinho();
  const cliente = state.clientes.find(c => c.nome === clienteNome);
  if (cliente) cliente.divida += total;

  state.historico.unshift({
    id: Date.now(),
    cliente: clienteNome,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    total,
    tipo: 'fiado',
    itens: state.carrinho.map(i => ({ desc: `${i.qty}× ${i.nome}`, val: i.preco * i.qty })),
  });

  /* atualiza stat fiado */
  const fiadoEl = document.querySelector('.stat-red');
  const totalFiado = state.clientes.reduce((s, c) => s + c.divida, 0);
  const oldFiado = parseFloat(fiadoEl.dataset.val || '57.5');
  countUp(fiadoEl, oldFiado, totalFiado, '');
  fiadoEl.dataset.val = totalFiado;

  state.carrinho = [];
  renderCarrinho();
  renderCaderneta();
  renderHistorico();
  showToast(`📌 Pendurado para ${clienteNome}: ${fmt(total)}`, 'warning');
});

/* ══════════════════════════════════════════════
   SELECT DE CLIENTES NO PDV
══════════════════════════════════════════════ */
function renderClienteSelect() {
  const select = document.querySelector('.field-select');
  const val = select.value;
  select.innerHTML = `<option>— Venda Avulsa (sem cadastro) —</option>`;
  state.clientes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.nome + (c.divida > 0 ? ` — Deve ${fmt(c.divida)}` : '');
    opt.textContent = opt.value;
    if (opt.value.startsWith(val.split(' —')[0])) opt.selected = true;
    select.appendChild(opt);
  });
}

/* ══════════════════════════════════════════════
   ESTOQUE — render
══════════════════════════════════════════════ */
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

  /* atualiza grid de produtos */
  renderProdutoGrid();

  /* bind editar */
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

  /* bind deletar */
  wrap.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const row = btn.closest('.table-row');
      row.style.transition = 'opacity 0.18s, transform 0.18s, max-height 0.22s';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      row.style.maxHeight = '0';
      row.style.overflow = 'hidden';
      setTimeout(() => {
        state.produtos = state.produtos.filter(p => p.id !== id);
        renderEstoque();
        showToast('Produto removido', 'error');
      }, 220);
    });
  });
}

/* ── Grid de produtos (PDV) ── */
function renderProdutoGrid() {
  const grid = document.querySelector('.product-grid');
  const btnsAtivos = grid.querySelectorAll('.product-btn');

  state.produtos.forEach((p, i) => {
    const btn = btnsAtivos[i];
    if (!btn) return;
    const badgeClass = p.estoque === 0 ? 'badge-red' : p.estoque <= 6 ? 'badge-orange' : 'badge-green';
    const badgeText  = p.estoque === 0 ? 'Esgotado' : `${p.estoque} un`;
    btn.querySelector('.product-name').textContent = p.nome;
    btn.querySelector('.product-price').textContent = fmt(p.preco);
    const badge = btn.querySelector('.badge');
    badge.className = `badge ${badgeClass}`;
    badge.textContent = badgeText;
    btn.disabled = p.estoque === 0;
  });
}

/* ── Novo produto ── */
document.querySelector('#view-estoque .btn-primary').addEventListener('click', () => {
  const m = document.getElementById('modal-new-product');
  m.querySelector('input[type="text"]').value = '';
  m.querySelectorAll('input[type="number"]')[0].value = '';
  m.querySelectorAll('input[type="number"]')[1].value = '0';
  openModal('modal-new-product');
});

document.querySelector('#modal-new-product .btn-primary').addEventListener('click', () => {
  const m = document.getElementById('modal-new-product');
  const nome = m.querySelector('input[type="text"]').value.trim();
  const preco = parseFloat(m.querySelectorAll('input[type="number"]')[0].value) || 0;
  const estoque = parseInt(m.querySelectorAll('input[type="number"]')[1].value) || 0;
  if (!nome) return showToast('Informe o nome do produto', 'error');
  state.produtos.push({ id: Date.now(), nome, preco, estoque });
  closeModal('modal-new-product');
  renderEstoque();
  showToast(`${nome} adicionado ao estoque`, 'success');
});

document.querySelector('#modal-edit-product .btn-primary').addEventListener('click', () => {
  const m = document.getElementById('modal-edit-product');
  const p = state.editandoProduto;
  p.nome    = m.querySelector('input[type="text"]').value.trim() || p.nome;
  p.preco   = parseFloat(m.querySelectorAll('input[type="number"]')[0].value) || p.preco;
  p.estoque = parseInt(m.querySelectorAll('input[type="number"]')[1].value) ?? p.estoque;
  closeModal('modal-edit-product');
  renderEstoque();
  showToast('Produto atualizado', 'success');
});

/* Atualiza stat "Itens em Estoque" */
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

/* ══════════════════════════════════════════════
   CADERNETA — render
══════════════════════════════════════════════ */
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
    const debtText  = c.divida > 0 ? `📌 Deve ${fmt(c.divida)}` : '✓ Sem dívidas';

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

  /* bind quitar */
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

  /* bind editar cliente */
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

  /* bind deletar cliente */
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const card = btn.closest('.client-card');
      card.style.transition = 'opacity 0.18s, transform 0.18s, max-height 0.22s';
      card.style.opacity = '0';
      card.style.transform = 'translateX(20px)';
      card.style.maxHeight = '0';
      card.style.overflow = 'hidden';
      setTimeout(() => {
        state.clientes = state.clientes.filter(c => c.id !== id);
        renderCaderneta();
        renderClienteSelect();
        showToast('Cliente removido', 'error');
      }, 220);
    });
  });
}

/* ── Novo cliente ── */
document.querySelector('#view-caderneta .btn-primary').addEventListener('click', () => {
  document.getElementById('modal-new-client').querySelector('.field-input').value = '';
  openModal('modal-new-client');
});

document.querySelector('#modal-new-client .btn-primary').addEventListener('click', () => {
  const nome = document.querySelector('#modal-new-client .field-input').value.trim();
  if (!nome) return showToast('Informe o nome do cliente', 'error');
  state.clientes.push({ id: Date.now(), nome, divida: 0 });
  closeModal('modal-new-client');
  renderCaderneta();
  renderClienteSelect();
  showToast(`${nome} cadastrado`, 'success');
});

/* ── Editar cliente ── */
document.querySelector('#modal-edit-client .btn-primary').addEventListener('click', () => {
  const c = state.editandoCliente;
  const m = document.getElementById('modal-edit-client');
  c.nome   = m.querySelectorAll('.field-input')[0].value.trim() || c.nome;
  c.divida = parseFloat(m.querySelectorAll('.field-input')[1].value) || 0;
  closeModal('modal-edit-client');
  renderCaderneta();
  renderClienteSelect();
  showToast('Cliente atualizado', 'success');
});

/* ── Quitar dívida ── */
document.querySelector('.btn-success-lg').addEventListener('click', () => {
  const c = state.quitandoCliente;
  const val = parseFloat(document.querySelector('#modal-quitar .field-input').value) || 0;
  c.divida = Math.max(0, c.divida - val);

  const fiadoEl = document.querySelector('.stat-red');
  const totalFiado = state.clientes.reduce((s, cl) => s + cl.divida, 0);
  const oldFiado = parseFloat(fiadoEl.dataset.val || '57.5');
  countUp(fiadoEl, oldFiado, totalFiado, '');
  fiadoEl.dataset.val = totalFiado;

  closeModal('modal-quitar');
  renderCaderneta();
  renderClienteSelect();
  showToast(`${c.nome} pagou ${fmt(val)} ✓`, 'success');
});

/* ══════════════════════════════════════════════
   HISTÓRICO — render
══════════════════════════════════════════════ */
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
    const typeText  = h.tipo === 'fiado' ? '📌 Fiado' : '✓ Pago';

    card.innerHTML = `
      <div class="comanda-header">
        <div>
          <div class="comanda-client">${h.cliente}</div>
          <div class="comanda-time">${h.hora}</div>
        </div>
        <div class="comanda-right">
          <div class="comanda-total">${fmt(h.total)}</div>
          <div class="comanda-type ${typeClass}">${typeText}</div>
        </div>
      </div>
      <div class="comanda-items">
        ${h.itens.map(it =>
          `<div class="comanda-line"><span>${it.desc}</span><span>${fmt(it.val)}</span></div>`
        ).join('')}
      </div>
    `;
    list.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }));
  });
}

/* Limpar histórico */
document.querySelector('#view-historico .btn-ghost-danger').addEventListener('click', function () {
  pulse(this);
  state.historico = [];
  renderHistorico();
  showToast('Histórico limpo', 'warning');
});

/* ══════════════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* Guarda valores iniciais dos stats */
  document.querySelector('.stat-green').dataset.val = state.caixaHoje;
  document.querySelector('.stat-red').dataset.val   = '57.5';
  document.querySelector('.stat-amber').dataset.val = '127';

  renderCarrinho();
  renderClienteSelect();
  renderEstoque();
  renderCaderneta();
  renderHistorico();

  /* Esconde toast estático inicial após 3s */
  const staticToast = document.querySelector('.toast-success');
  if (staticToast) {
    setTimeout(() => {
      staticToast.style.transition = 'opacity 0.4s, transform 0.4s';
      staticToast.style.opacity = '0';
      staticToast.style.transform = 'translateX(120%)';
      setTimeout(() => staticToast.remove(), 400);
    }, 3000);
  }

  /* Animação de entrada dos cards do header */
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-12px)';
    card.style.transition = `opacity 0.35s ease ${0.1 + i * 0.1}s, transform 0.35s ease ${0.1 + i * 0.1}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }));
  });

  /* Animação de entrada dos painéis */
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