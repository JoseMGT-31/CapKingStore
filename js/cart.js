// Carrito de compras - almacenamiento en localStorage
// Estructura de item: { id, titulo, precio, img, qty, attrs }
(function(){
  const LS_KEY = 'CK_CART_V1';
  const money = n => n.toLocaleString('es-CL', { style:'currency', currency:'CLP' });
  const state = { items: readCart() };

  // --- Storage helpers ---
  function readCart(){ try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } }
  function writeCart(){ localStorage.setItem(LS_KEY, JSON.stringify(state.items)); }
  function itemBy(id){ return state.items.find(i=> i.id===id); }

  // --- API pública ---
  window.Cart = {
    add(p, qty=1){ const it = itemBy(p.id); it? it.qty += qty : state.items.push(copyItem(p, qty)); sync(); },
    remove(id){ const i = state.items.findIndex(x=>x.id===id); if(i>-1){ state.items.splice(i,1); sync(); } },
    update(id, qty){ const it = itemBy(id); if(!it) return; it.qty = Math.max(1, qty|0); sync(); },
    clear(){ state.items = []; sync(); },
    total(){ return state.items.reduce((s,i)=> s + i.precio*i.qty, 0); },
    count(){ return state.items.reduce((s,i)=> s + i.qty, 0); }
  };

  function copyItem(p, qty){ return { id:p.id, titulo:p.titulo, precio:p.precio, img:p.img, attrs:p.attrs, qty }; }
  function sync(){ writeCart(); render(); }

  // --- UI creation / lifecycle ---
  function ensureUI(){
    if(document.querySelector('.cart-panel')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="cart-panel">
        <div class="cart-header">
          <h2>Tu Carrito</h2>
          <button class="cart-close" aria-label="Cerrar carrito">✕</button>
        </div>
        <div class="cart-items" role="list"></div>
        <div class="cart-footer">
          <div class="cart-total-row"><span>Total</span><span class="cart-total">$0</span></div>
          <div class="cart-actions">
            <button class="cart-btn cart-btn--clear" type="button" data-clear>Vaciar</button>
            <button class="cart-btn" type="button" data-checkout>Comprar</button>
          </div>
        </div>
      </div>
      <div class="cart-overlay"></div>`);
    const panel = document.querySelector('.cart-panel');
    const overlay = document.querySelector('.cart-overlay');
    overlay.addEventListener('click', close);
    panel.querySelector('.cart-close').addEventListener('click', close);
    panel.addEventListener('click', handlePanelClick);
  }

  function handlePanelClick(e){
    const t=e.target;
    if(t.matches('[data-remove]')) return Cart.remove(t.dataset.remove);
    if(t.matches('[data-minus]')) return changeQty(t,-1);
    if(t.matches('[data-plus]')) return changeQty(t,1);
    if(t.matches('[data-clear]')) return confirm('¿Vaciar carrito?') && Cart.clear();
    if(t.matches('[data-checkout]')) return goCheckout();
  }
  function changeQty(el,delta){ const id = el.closest('.cart-item').dataset.id; const it = itemBy(id); if(!it) return; Cart.update(id, it.qty + delta); }
  function goCheckout(){ if(!state.items.length) return alert('Tu carrito está vacío.'); close(); location.href='checkout.html'; }

  function open(){ ensureUI(); toggle(true); }
  function close(){ toggle(false); }
  function toggle(show){ document.querySelector('.cart-panel').classList.toggle('active', show); document.querySelector('.cart-overlay').classList.toggle('active', show); }
  window.toggleCart = () => { const p = document.querySelector('.cart-panel'); (!p || !p.classList.contains('active')) ? open() : close(); };

  function render(){
    ensureUI();
    const list = document.querySelector('.cart-items');
    const totalEl = document.querySelector('.cart-total');
    const badge = document.getElementById('cart-count');
    list.innerHTML = state.items.length ? state.items.map(itemHTML).join('') : '<p class="cart-empty">Tu carrito está vacío</p>';
    totalEl.textContent = money(Cart.total());
    updateBadge(badge);
  }
  function itemHTML(it){ return `<div class="cart-item" data-id="${it.id}" role="listitem">
      <img src="${it.img}" alt="${it.titulo}">
      <div>
        <p class="cart-item-title">${it.titulo}</p>
        <p class="cart-item-attrs">${it.attrs || ''}</p>
        <div class="qty-box">
          <button type="button" data-minus aria-label="Restar">-</button>
          <input aria-label="Cantidad" value="${it.qty}" readonly>
          <button type="button" data-plus aria-label="Sumar">+</button>
        </div>
        <p class="cart-item-price">${money(it.precio * it.qty)}</p>
      </div>
      <button class="cart-item-remove" data-remove="${it.id}" aria-label="Eliminar">✕</button>
    </div>`; }
  function updateBadge(badge){ if(!badge) return; const c = Cart.count(); badge.textContent = c; badge.classList.toggle('hidden', c===0); }

  // --- Inicio ---
  document.addEventListener('DOMContentLoaded', () => {
    ensureUI();
    render();
    setupIcon();
  });

  function setupIcon(){
    const icon = document.getElementById('cart-icon');
    if(!icon) return;
    let badge = document.getElementById('cart-count');
    if(!badge){
      badge = document.createElement('span');
      badge.id = 'cart-count';
      badge.className = 'cart-badge hidden';
      icon.style.position = 'relative';
      icon.parentElement.style.position = 'relative';
      icon.parentElement.appendChild(badge);
    }
    const clickable = icon.closest('a') || icon;
    ['click'].forEach(evt => {
      clickable.addEventListener(evt, e=> { e.preventDefault(); toggleCart(); });
      icon.addEventListener(evt, e=> { e.preventDefault(); toggleCart(); });
    });
  }
})();
