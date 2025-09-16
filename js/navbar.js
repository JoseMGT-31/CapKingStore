// Script para marcar el enlace activo basado en la URL actual
(function(){
  const current = location.pathname.split('/').pop();

  // Marca activo en menú principal
  document.querySelectorAll('.nav-links a').forEach(a => {
    const file = (a.getAttribute('href')||'').split('#')[0];
    if(file === current) a.classList.add('active');
  });

  function sessionHTML(sess){
    if(!sess){
      return `
        <a href="login.html" class="mini-btn${current==='login.html'?' active':''}"><i class="fa-solid fa-user"></i> Acceder</a>
        <a href="carrito.html" aria-label="Carrito"><i id="cart-icon" class="fa-solid fa-cart-shopping"></i></a>`;
    }
    const adminBtn = ['admin','vendedor'].includes(sess.role)
      ? `<a href="admin.html" class="mini-btn${current==='admin.html'?' active':''}"><i class="fa-solid fa-shield"></i> Admin</a>`
      : '';
    return `
      ${adminBtn}
      <span class="mini-btn user-tag"><i class="fa-solid fa-user"></i> ${sess.username} (${sess.role})</span>
      <button id="btnLogout" class="mini-btn logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Salir</button>
      <a href="carrito.html" aria-label="Carrito"><i id="cart-icon" class="fa-solid fa-cart-shopping"></i></a>`;
  }

  function renderSession(){
    const cont = document.querySelector('.nav-actions');
    if(!cont) return;
    const sess = window.Auth && window.Auth.getSession();
    cont.innerHTML = sessionHTML(sess);
    const btn = document.getElementById('btnLogout');
    if(btn) btn.addEventListener('click', ()=>{ window.Auth.logout(); location.href='home.html'; });
  }

  document.addEventListener('DOMContentLoaded', renderSession);
})();
