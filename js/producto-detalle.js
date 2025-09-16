(function(){
  const qs = s => document.querySelector(s);
  const money = n => n.toLocaleString('es-CL',{style:'currency',currency:'CLP'});
  const getId = () => new URLSearchParams(location.search).get('id');

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    if(!window.PRODUCTOS){ console.warn('PRODUCTOS no disponible'); return; }
  const prod = PRODUCTOS.find(p => p.id === getId());
    const wrap = qs('#productoWrap');
    if(!wrap) return;
    if(!prod) return notFound(wrap);
    renderProduct(wrap, prod);
    bindQty(wrap);
    qs('#btnAdd').addEventListener('click', () => addToCart(prod));
  }

  function notFound(el){
    el.innerHTML = `<p style="grid-column:1 / -1; color:#cfcfcf;">Producto no encontrado. <a href='home.html#productos' style='color:#ffd54a;'>Volver</a></p>`;
  }

  function renderProduct(wrap, p){
    document.title = p.titulo + ' - CapKing Store';
    wrap.innerHTML = `
      <div class='prod-gallery'><div class='prod-img-main'><img src='${p.img}' alt='${p.titulo}' loading='lazy'></div></div>
      <div class='prod-meta'>
        <h1>${p.titulo}</h1>
        <p class='prod-attrs'>${p.attrs||''}</p>
        <p class='prod-price'>${money(p.precio)} ${p.precio>60000? '<span class="badge-free">ENVÍO GRATIS</span>':''}</p>
        <p class='prod-desc'>${p.desc||'Sin descripción.'}</p>
        <div class='qty-row'><div><div class='qty-label'>Cantidad</div><div class='qty-box'>
          <button type='button' data-minus>-</button>
          <input id='qtyInput' value='1' aria-label='Cantidad' readonly>
          <button type='button' data-plus>+</button>
        </div></div></div>
        <div class='actions'><button class='btn-cart-main' id='btnAdd'><i class='fa-solid fa-cart-plus'></i> Añadir al carrito</button></div>
        <hr class='divider'>
        <div class='meta-mini'>
          <span><i class='fa-solid fa-truck-fast'></i> Envíos a todo Chile</span>
          <span><i class='fa-solid fa-rotate-left'></i> 30 días para cambios</span>
          <span><i class='fa-solid fa-shield-halved'></i> Pago seguro</span>
        </div>
      </div>`;
  }

  function bindQty(container){
    const input = qs('#qtyInput');
    container.addEventListener('click', e => {
      if(e.target.matches('[data-minus]')) input.value = Math.max(1, (+input.value)-1);
      if(e.target.matches('[data-plus]')) input.value = Math.min(99, (+input.value)+1);
    });
  }

  function addToCart(prod){
    const qty = parseInt(qs('#qtyInput').value,10) || 1;
    if(window.Cart){ Cart.add(prod, qty); showToast(qty); }
  }

  function showToast(qty){
    const toast = qs('#addedToast');
    const msg = qs('#addedMsg');
    if(!toast || !msg) return;
    msg.textContent = `Se añadió${qty>1? 'n':''} ${qty} al carrito`;
    toast.classList.add('visible');
    setTimeout(()=> toast.classList.remove('visible'), 1600);
  }
})();
