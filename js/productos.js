// Render listado principal de productos y manejo de botón "Añadir"
document.addEventListener('DOMContentLoaded', initProductos);

function initProductos(){
  const grid = document.getElementById('gridProductos');
  if(!grid || !window.PRODUCTOS) return;
  grid.innerHTML = PRODUCTOS.map(cardProducto).join('');
  grid.addEventListener('click', onGridClick);
}

function cardProducto(p){
  const titleSafe = (p.desc||'').replace(/"/g,'&quot;');
  return `<article class="card">
    <img class="card__img" src="${p.img}" alt="${p.titulo}" loading="lazy">
    <div class="card__body">
      <a class="card__title" href="producto.html?id=${p.id}" title="${titleSafe}">${p.titulo}</a>
      <div class="card__attrs">${p.attrs||''}</div>
      <div class="card__row">
        <span class="card__price">${moneyCLP(p.precio)}</span>
        <button class="card__btn" data-add="${p.id}">Añadir</button>
      </div>
    </div>
  </article>`;
}

function onGridClick(e){
  const btn = e.target.closest('[data-add]'); if(!btn) return;
  const prod = PRODUCTOS.find(p=> p.id === btn.dataset.add); if(!prod) return;
  if(!window.Cart) return console.warn('Cart no disponible');
  Cart.add(prod,1); flashAdded(btn);
}

function flashAdded(el){
  el.disabled = true;
  const original = el.textContent;
  el.textContent = '✓ Añadido';
  el.classList.add('added');
  setTimeout(()=>{ el.disabled=false; el.textContent=original; el.classList.remove('added'); }, 1200);
}