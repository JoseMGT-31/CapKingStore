const PRODUCTOS = [
  { id: "ck-59fifty-negra", titulo: "59FIFTY Classic Negra", precio: 29990, attrs: "59FIFTY · Black", img: "assets/images/products/cap1.png" },
  { id: "ck-9forty-ny",      titulo: "9FORTY NY Navy",      precio: 26990, attrs: "9FORTY · Navy",   img: "assets/images/products/cap2.png" },
  { id: "ck-trucker-blanca", titulo: "Trucker Blanca Mesh", precio: 21990, attrs: "Trucker · White", img: "assets/images/products/cap3.png" },
  { id: "ck-snapback-roja",  titulo: "Snapback Roja",       precio: 23990, attrs: "Snapback · Red",  img: "assets/images/products/cap4.png" },
  { id: "ck-59fifty-negra", titulo: "59FIFTY Classic Negra", precio: 29990, attrs: "59FIFTY · Black", img: "assets/images/products/cap5.png" },
  { id: "ck-9forty-ny",      titulo: "9FORTY NY Navy",      precio: 26990, attrs: "9FORTY · Navy",   img: "assets/images/products/cap6.png" },
];

const moneyCLP = n => n.toLocaleString('es-CL', { style:'currency', currency:'CLP' });

const card = p => `
  <article class="card">
    <img class="card__img" src="${p.img}" alt="${p.titulo}" loading="lazy">
    <div class="card__body">
      <a class="card__title" href="producto.html?id=${p.id}">${p.titulo}</a>
      <div class="card__attrs">${p.attrs}</div>
      <div class="card__row">
        <span class="card__price">${moneyCLP(p.precio)}</span>
        <button class="card__btn" data-add="${p.id}">Añadir</button>
      </div>
    </div>
  </article>
`;

function renderGrid() {
  const grid = document.getElementById('gridProductos');
  if (!grid) return;
  grid.innerHTML = PRODUCTOS.map(card).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderGrid();

  const grid = document.getElementById('gridProductos');
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const id = btn.dataset.add;
    const prod = PRODUCTOS.find(p => p.id === id);
    if (!prod) return;

    console.log('Añadido al carrito:', prod.id);
  });
});