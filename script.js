/* ========== CONFIGURAÇÕES ========== */
const WHATSAPP_NUMBER = "5521992344201";
const COMPANY_NAME = "Ju-Acessorios";

const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentCategory = 'todos';
let ALL_PRODUCTS = [];

const grid = document.getElementById('grid');
const modalBack = document.getElementById('modalBack');
const modalTitle = document.getElementById('modalTitle');
const modalImg = document.getElementById('modalImg');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalWpp = document.getElementById('modalWpp');
const modalMore = document.getElementById('modalMore');
const closeBtn = document.getElementById('closeBtn');

let isZoomed = false;



/* ========== SISTEMA DE CATEGORIAS ========== */
function updateCategoryCounts(products) {
  const counts = {
    todos: products.length,
    braceletes: products.filter(p => p.category === 'braceletes').length,
    brincos: products.filter(p => p.category === 'brincos').length,
    colares: products.filter(p => p.category === 'colares').length,
    pulseiras: products.filter(p => p.category === 'pulseiras').length
  };

  Object.keys(counts).forEach(cat => {
    const countEl = document.getElementById(`count-${cat}`);
    if (countEl) countEl.textContent = counts[cat];
  });
}

function filterByCategory(category) {
  currentCategory = category;
  currentPage = 1;
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    }
  });
  
  renderGrid(ALL_PRODUCTS);
}

function getFilteredProducts(products) {
  if (currentCategory === 'todos') {
    return products;
  }
  return products.filter(p => p.category === currentCategory);
}

function renderGrid(PRODUCTS) {
  const filteredProducts = getFilteredProducts(PRODUCTS);
  
  // Separar produtos disponíveis e esgotados
  const availableProducts = filteredProducts.filter(p => !p.sold);
  const soldProducts = filteredProducts.filter(p => p.sold);
  
  // Combinar: disponíveis primeiro, depois esgotados
  const sortedProducts = [...availableProducts, ...soldProducts];
  
  grid.innerHTML = '';
  grid.style.opacity = '0';
  setTimeout(() => {
    grid.style.opacity = '1';
  }, 50);
  
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const visible = sortedProducts.slice(start, end);

  if (visible.length === 0) {
    grid.innerHTML = '<div class="no-products"><p>Nenhum produto encontrado nesta categoria.</p></div>';
    return;
  }

  visible.forEach((p, index) => {
    const c = document.createElement('article');
    c.className = 'card';
    c.style.animationDelay = `${0.05 * index}s`;

    const soldBadge = p.sold ? `<div class="badge badge-sold">Esgotado</div>` : `<div class="badge">${p.badge || ''}</div>`;
    const priceText = p.price && p.price !== "R$ —" && p.price !== "" ? p.price : "R$ —";

    c.innerHTML = `
      <div class="thumb-container">
        <img class="thumb" src="${p.img}" alt="${p.title}">
        ${soldBadge}
      </div>
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">${p.title}</div>
          <div class="subtitle">${p.subtitle || ''}</div>
        </div>
        <div class="price">${priceText}<small>/unidade</small></div>
        <div class="actions">
          <button class="btn details" data-id="${p.id}" ${p.sold ? 'disabled' : ''}>Ver Detalhes</button>
          <div class="action-row">
            <button class="btn wpp" data-id="${p.id}" ${p.sold ? 'disabled' : ''}>Pedir</button>
            <button class="btn add-to-bag icon-only" data-id="${p.id}" ${p.sold ? 'disabled' : ''} title="Adicionar à Sacola">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    if (p.sold) {
      c.style.opacity = '0.6';
      c.style.pointerEvents = 'none';
      c.style.cursor = 'not-allowed';
    }

    grid.appendChild(c);
  });

  renderPagination(sortedProducts);
}

function renderPagination(filteredProducts) {
  // Separar produtos disponíveis e esgotados
  const availableProducts = filteredProducts.filter(p => !p.sold);
  const soldProducts = filteredProducts.filter(p => p.sold);
  const sortedProducts = [...availableProducts, ...soldProducts];
  
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  
  // Remover paginação anterior
  const oldPagination = document.querySelector('.pagination-wrapper');
  if (oldPagination) oldPagination.remove();

  if (totalPages <= 1) return;

  // Criar wrapper
  const container = document.createElement('div');
  container.className = 'pagination-wrapper';
  
  // Criar paginação
  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  // Botão Anterior
  const prev = document.createElement('button');
  prev.textContent = '← Anterior';
  prev.className = 'btn details';
  prev.id = 'prevBtn';
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    currentPage--;
    renderGrid(ALL_PRODUCTS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Informações
  const info = document.createElement('span');
  info.className = 'page-info';
  info.innerHTML = `Página <span id="currentPage">${currentPage}</span> de <span id="totalPages">${totalPages}</span>`;

  // Botão Próximo
  const next = document.createElement('button');
  next.textContent = 'Próxima →';
  next.className = 'btn details';
  next.id = 'nextBtn';
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    currentPage++;
    renderGrid(ALL_PRODUCTS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Adicionar elementos
  pagination.appendChild(prev);
  pagination.appendChild(info);
  pagination.appendChild(next);
  container.appendChild(pagination);

  // Adicionar ao grid
  grid.appendChild(container);
}

// Atualizar números da paginação
function updatePaginationNumbers(current, total) {
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl = document.getElementById('totalPages');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (currentPageEl) currentPageEl.textContent = current;
  if (totalPagesEl) totalPagesEl.textContent = total;
  if (prevBtn) prevBtn.disabled = current === 1;
  if (nextBtn) nextBtn.disabled = current === total;
}

// Atualizar números da paginação
function updatePaginationNumbers(current, total) {
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl = document.getElementById('totalPages');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (currentPageEl) currentPageEl.textContent = current;
  if (totalPagesEl) totalPagesEl.textContent = total;
  if (prevBtn) prevBtn.disabled = current === 1;
  if (nextBtn) nextBtn.disabled = current === total;
}

function attachGridEvents(PRODUCTS) {
  grid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const product = PRODUCTS.find(x => x.id === id);
    if (!product || product.sold) return;

    if (btn.classList.contains('add-to-bag')) {
      const valorNumerico = product.price.replace('R$', '').replace(',', '.').trim() || '0';
      adicionarProduto(product.img, product.title, valorNumerico);
      return;
    }

    if (btn.classList.contains('wpp')) {
      const pageUrl = location.href.split('#')[0];
      const msg = `Olá *${COMPANY_NAME}*! \n\nTenho interesse em:\n\n *${product.title}*\n ${product.price}\n\n Mostruário: ${pageUrl}`;
      window.open(waLink(WHATSAPP_NUMBER, msg), '_blank');
    } else if (btn.classList.contains('details')) {
      isZoomed = false;
      modalTitle.textContent = product.title;
      modalImg.src = product.img;
      modalImg.alt = product.title;
      modalImg.style.cursor = 'zoom-in';
      modalDesc.textContent = product.desc;
      modalPrice.textContent = product.price;
      modalMore.textContent = 'Ver Mais Detalhes';
      modalBack.style.display = "flex";
      
      document.querySelector('.modal-img-container').classList.remove('zoomed');
      
      modalMore.onclick = toggleImageZoom;
      modalImg.onclick = toggleImageZoom;

      const modalAddToBag = document.getElementById('modalAddToBag');
      if (modalAddToBag) {
        modalAddToBag.onclick = () => {
          const valorNumerico = product.price.replace('R$', '').replace(',', '.').trim() || '0';
          adicionarProduto(product.img, product.title, valorNumerico);
        };
      }
    }
  });

  closeBtn.addEventListener('click', () => {
    modalBack.style.display = 'none';
    isZoomed = false;
    document.querySelector('.modal-img-container').classList.remove('zoomed');
  });
  
  modalBack.addEventListener('click', (e) => {
    if (e.target === modalBack) {
      modalBack.style.display = 'none';
      isZoomed = false;
      document.querySelector('.modal-img-container').classList.remove('zoomed');
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBack.style.display === 'flex') {
      modalBack.style.display = 'none';
      isZoomed = false;
      document.querySelector('.modal-img-container').classList.remove('zoomed');
    }
  });
}

/* ========== FUNÇÕES DA SACOLA ========== */
function adicionarProduto(foto, nome, valor) {
  let sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  sacola.push({ foto, nome, valor });
  localStorage.setItem('sacola', JSON.stringify(sacola));
  atualizarSacola();
  
  mostrarNotificacao('Produto adicionado à sacola');
}

function atualizarSacola() {
  const sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  const sacolaDiv = document.getElementById('sacola');
  const toggleBtn = document.getElementById('toggleSacola');
  const counter = document.querySelector('.sacola-counter');
  
  if (counter) {
    counter.textContent = sacola.length;
  }
  
  if (toggleBtn) {
    toggleBtn.style.display = sacola.length > 0 ? 'flex' : 'none';
  }
  
  if (sacola.length === 0) {
    sacolaDiv.style.display = 'none';
    return;
  }
  
  let html = `
    <div id="sacola-header">
      <h3>Minha Sacola</h3>
      <button id="sacola-close">×</button>
    </div>
  `;
  
  sacola.forEach((item, index) => {
    html += `
      <div class="sacola-item">
        <img src="${item.foto}" alt="${item.nome}">
        <div class="sacola-item-info">
          <div class="sacola-item-title">${item.nome}</div>
          <div class="sacola-item-price">R$ ${item.valor}</div>
          <button onclick="removerProduto(${index})">Remover</button>
        </div>
      </div>
    `;
  });
  
  const total = sacola.reduce((sum, item) => sum + parseFloat(item.valor), 0);
  html += `
    <div id="sacola-total">
      <span>Total:</span>
      <span id="sacola-total-value">R$ ${total.toFixed(2)}</span>
    </div>
    <button class="finalizar" onclick="finalizarSacola()">Finalizar Pedido</button>
  `;
  
  sacolaDiv.innerHTML = html;
  
  document.getElementById('sacola-close').onclick = () => {
    sacolaDiv.style.display = 'none';
  };
}

function removerProduto(index) {
  let sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  sacola.splice(index, 1);
  localStorage.setItem('sacola', JSON.stringify(sacola));
  atualizarSacola();
  mostrarNotificacao('Produto removido da sacola');
}

/* ========== SISTEMA DE ID CURTO INTERNO ========== */

// Gerar ID curto único (6 caracteres)
function gerarIdCurto() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return (timestamp + random).substring(0, 6);
}

// Comprimir dados da sacola para URL curta
function comprimirSacolaParaUrl(sacola) {
  // Criar versão super compacta: apenas IDs dos produtos
  const produtosIds = sacola.map(item => {
    // Encontrar ID do produto no catálogo
    const produto = ALL_PRODUCTS.find(p => p.title === item.nome);
    return produto ? produto.id : null;
  }).filter(id => id !== null).join(',');
  
  // Retornar string curta
  return produtosIds;
}

// Descomprimir URL para sacola
function descomprimirUrlParaSacola(dados) {
  if (!dados) return [];
  
  const ids = dados.split(',');
  const sacola = [];
  
  ids.forEach(id => {
    const produto = ALL_PRODUCTS.find(p => p.id === id);
    if (produto) {
      const valorNumerico = produto.price.replace('R$', '').replace(',', '.').trim();
      sacola.push({
        foto: produto.img,
        nome: produto.title,
        valor: valorNumerico
      });
    }
  });
  
  return sacola;
}

// Função finalizar sacola 
function finalizarSacola() {
  const sacola = JSON.parse(localStorage.getItem('sacola')) || [];
  
  if (sacola.length === 0) {
    alert('Sacola vazia!');
    return;
  }
  
  try {
    // Gerar ID curto único
    const idPedido = gerarIdCurto();
    
    // Comprimir sacola para URL
    const dadosComprimidos = comprimirSacolaParaUrl(sacola);
    
    // Criar URL curta usando fragment (#)
    const baseUrl = window.location.origin + window.location.pathname;
    const linkCurto = `${baseUrl}#${idPedido}-${dadosComprimidos}`;
    
    // Calcular total
    const total = sacola.reduce((sum, item) => sum + parseFloat(item.valor), 0);
    
    // Montar mensagem para WhatsApp
    let itensResumidos = sacola.map(item => `• ${item.nome} - R$ ${item.valor}`).join('\n');
    let mensagem = `Olá *${COMPANY_NAME}*! 💎\n\nGostaria de finalizar minha compra:\n\n${itensResumidos}\n\n*Total: R$ ${total.toFixed(2)}*\n\n🛍️ Ver pedido: \n${linkCurto}`;
    
    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
    
    // Limpar sacola
    localStorage.removeItem('sacola');
    atualizarSacola();
    
    mostrarNotificacao('Pedido enviado com sucesso!');
    
    console.log('✅ Link gerado:', linkCurto);
    console.log('📦 ID do pedido:', idPedido);
  } catch (error) {
    console.error('❌ Erro ao finalizar:', error);
    mostrarNotificacao('Erro ao gerar link. Tente novamente.');
  }
}

/* ========== PÁGINA DE RESUMO DA SACOLA ========== */

// Função para mostrar página de resumo da sacola
function mostrarResumoSacola(sacola, idPedido) {
  document.body.classList.add('visualizando-sacola');
  
  const total = sacola.reduce((sum, item) => sum + parseFloat(item.valor), 0);
  
  const overlay = document.createElement('div');
  overlay.id = 'sacola-visualizar-overlay';
  overlay.innerHTML = `
    <div class="sacola-visualizar-container">
      <div class="sacola-visualizar-header">
        <h2>${COMPANY_NAME}</h2>
        <div class="sacola-id">Pedido #${idPedido}</div>
        <button class="sacola-visualizar-fechar" onclick="fecharResumoSacola()" aria-label="Fechar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="sacola-visualizar-produtos">
        ${sacola.map((item, index) => `
          <div class="sacola-visualizar-item">
            <div class="sacola-visualizar-numero">${index + 1}</div>
            <img class="sacola-visualizar-foto" src="${item.foto}" alt="${item.nome}" loading="lazy">
            <div class="sacola-visualizar-info">
              <h3>${item.nome}</h3>
              <div class="sacola-visualizar-preco">R$ ${item.valor}</div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="sacola-visualizar-footer">
        <div class="sacola-visualizar-total">
          <span>Total do Pedido:</span>
          <div class="sacola-visualizar-total-valor">R$ ${total.toFixed(2)}</div>
        </div>
        
        <div class="sacola-visualizar-acoes">
          <button class="sacola-visualizar-btn-imprimir" onclick="imprimirSacola()" tabindex="0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Imprimir Pedido
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = '1', 10);
}

function fecharResumoSacola() {
  const overlay = document.getElementById('sacola-visualizar-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.body.classList.remove('visualizando-sacola');
      window.location.href = window.location.origin + window.location.pathname;
    }, 300);
  }
}

function imprimirSacola() {
  window.print();
}

/* ========== FUNÇÕES AUXILIARES ========== */
function waLink(number, msg) {
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

function toggleImageZoom() {
  const container = document.querySelector('.modal-img-container');
  isZoomed = !isZoomed;
  container.classList.toggle('zoomed', isZoomed);
  modalImg.style.cursor = isZoomed ? 'zoom-out' : 'zoom-in';
}

function mostrarNotificacao(mensagem) {
  const notificacaoExistente = document.querySelector('.notificacao');
  if (notificacaoExistente) {
    notificacaoExistente.remove();
  }
  
  const notif = document.createElement('div');
  notif.className = 'notificacao';
  notif.innerHTML = `
    <span>${mensagem}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.classList.add('mostrar'), 10);
  
  setTimeout(() => {
    notif.classList.remove('mostrar');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

/* ========== INICIALIZAÇÃO ========== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando aplicação...');
  
  // Detectar se há sacola compartilhada no fragment (#)
  const hash = window.location.hash.substring(1);
  
  fetch('products.json')
    .then(response => response.json())
    .then(data => {
      ALL_PRODUCTS = data;
      console.log('✅ Produtos carregados:', ALL_PRODUCTS.length);
      
      updateCategoryCounts(ALL_PRODUCTS);
      
      // Detectar sacola compartilhada DEPOIS de carregar produtos
      if (hash && hash.includes('-')) {
        console.log('📦 Sacola compartilhada detectada:', hash);
        
        const partes = hash.split('-');
        const idPedido = partes[0];
        const dadosComprimidos = partes.slice(1).join('-');
        
        console.log('🔑 ID do pedido:', idPedido);
        console.log('📊 Dados:', dadosComprimidos);
        
        const sacola = descomprimirUrlParaSacola(dadosComprimidos);
        
        if (sacola && sacola.length > 0) {
          console.log('✅ Sacola descomprimida:', sacola);
          mostrarResumoSacola(sacola, idPedido);
        } else {
          console.error('❌ Erro ao descomprimir sacola');
          alert('Erro ao carregar pedido. Link pode estar incorreto.');
          renderGrid(ALL_PRODUCTS);
          attachGridEvents(ALL_PRODUCTS);
        }
      } else {
        renderGrid(ALL_PRODUCTS);
        attachGridEvents(ALL_PRODUCTS);
      }
    })
    .catch(error => {
      console.error('❌ Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos. Verifique o console.');
    });
  
  atualizarSacola();
  
  const toggleBtn = document.getElementById('toggleSacola');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const sacolaDiv = document.getElementById('sacola');
      sacolaDiv.style.display = sacolaDiv.style.display === 'block' ? 'none' : 'block';
    });
  }

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterByCategory(category);
    });
  });
});

