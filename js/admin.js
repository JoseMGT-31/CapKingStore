// Panel de administración (estado en localStorage)
(function(){
  const KEY_ORDERS = 'CK_ORDERS_V1';
  const KEY_PRODUCTS = 'CK_PRODUCTS_V1'; // productos creados manualmente (se suman a PRODUCTOS base)
  const CATEGORIES = ['General','Deportes','Urban','Edición Limitada','Oferta'];

  // Helpers cortos
  const money = n => n.toLocaleString('es-CL',{style:'currency',currency:'CLP'});
  const qs = s=>document.querySelector(s);
  const qsa = s=>Array.from(document.querySelectorAll(s));

  const state = {
    orders: load(KEY_ORDERS, []),
    products: load(KEY_PRODUCTS, []),
    view: 'orders',
    editingProduct: null,
    editingEmployee: null,
    editingProductOriginal: null
  };

  function load(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
  function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function toast(msg){
    const t = qs('#adminToast');
    if(!t) { alert(msg); return; }
    qs('#toastMsg').textContent = msg;
    t.classList.add('visible');
    setTimeout(()=> t.classList.remove('visible'), 2500);
  }

  function persistAll(){ save(KEY_ORDERS, state.orders); save(KEY_PRODUCTS, state.products); }


  // Combina productos base y los guardados (overrides) sin exponer concepto "origen"
  function mergedProducts(){
    const map = {};
    const norm = p => ({ ...p, stock: p.stock ?? 0, categoria: p.categoria || 'General' });
    if(window.PRODUCTOS){ window.PRODUCTOS.forEach(p=> { map[p.id] = norm(p); }); }
    state.products.forEach(p=> { map[p.id] = norm(p); });
    return Object.values(map);
  }

  const RENDERS = {
    orders(){
      const list = state.orders.slice().reverse();
      return `<h1 class='admin-title'>Órdenes</h1>
        ${!list.length? `<p class='empty'>No hay órdenes aún.</p>`:
        `<table class='table'><thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Items</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        ${list.map(o=> `<tr data-order='${o.id}'>
          <td>${o.id}</td>
          <td>${new Date(o.date).toLocaleString()}</td>
          <td>${o.customer || '-'}</td>
          <td>${money(o.total)}</td>
          <td>${o.items.length}</td>
          <td><span class='status-pill ${o.status}'>${o.status}</span></td>
          <td><button class='mini-act' data-view-order='${o.id}' title='Ver detalle'><i class="fa-solid fa-eye"></i></button></td>
        </tr>`).join('')}</tbody></table>`}`;
    },
    inventory(){
      const list = mergedProducts();
      return `<div class='split'>
        <div class='panel'>
          <h3>Listado de Productos (${list.length})</h3>
          ${list.length? `<table class='table'><thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>
            ${list.map(p=> {
              const isPersisted = state.products.some(ep=>ep.id===p.id); // decide si mostrar eliminar (solo overrides propios)
              const critical = (p.stock===0);
              return `<tr data-prod='${p.id}' class='${critical? 'stock-critical':''}'>
                <td>${p.id}</td>
                <td>${p.titulo}</td>
                <td>${p.categoria||'General'}</td>
                <td>${money(p.precio)}</td>
                <td>${p.stock ?? 0}</td>
                <td>
                  <button class='mini-act' data-view-prod='${p.id}' title='Ver'><i class="fa-solid fa-eye"></i></button>
                  <button class='mini-act' data-edit-prod='${p.id}' title='Editar'><i class="fa-solid fa-pen"></i></button>
                  ${isPersisted? `<button class='mini-act danger' data-del-prod='${p.id}' title='Eliminar'><i class="fa-solid fa-trash"></i></button>` : ''}
                </td>
              </tr>`;
            }).join('')}</tbody></table>` : `<p class='empty'>Sin productos.</p>`}
        </div>
        <div class='panel'>
          <h3>${state.editingProduct? 'Editar producto' : 'Crear nuevo producto'}</h3>
          <form id='formNewProd' class='form-grid'>
            <div class='field'>
              <label for='np_id'>Código *</label>
              <input id='np_id' required placeholder='ABC123'>
            </div>
            <div class='field'>
              <label for='np_titulo'>Nombre *</label>
              <input id='np_titulo' required maxlength='100'>
            </div>
            <div class='field'>
              <label for='np_precio'>Precio *</label>
              <input id='np_precio' type='number' min='0' step='0.01' required placeholder='10000.00'>
            </div>
            <div class='field'>
              <label for='np_img'>Imagen URL</label>
              <input id='np_img' placeholder='assets/images/products/nuevo.png'>
            </div>
            <div class='field'>
              <label for='np_stock'>Stock *</label>
              <input id='np_stock' type='number' min='0' step='1' required placeholder='0'>
            </div>
            <div class='field'>
              <label for='np_cat'>Categoría *</label>
              <select id='np_cat' required>
                ${CATEGORIES.map(c=> `<option value='${c}'>${c}</option>`).join('')}
              </select>
            </div>
            <div class='field' style='grid-column:1 / -1;'>
              <label for='np_desc'>Descripción</label>
              <textarea id='np_desc' placeholder='Descripción breve (máx 500)' maxlength='500'></textarea>
            </div>
            <div class='actions-row' style='grid-column:1 / -1;'>
              <button class='btn' type='submit'><i class='fa-solid fa-${state.editingProduct? 'save' : 'plus'}'></i> ${state.editingProduct? 'Actualizar' : 'Guardar'}</button>
              ${state.editingProduct? `<button class='btn secondary' type='button' id='cancelEditProd'>Cancelar</button>` : `<button class='btn secondary' type='reset'>Limpiar</button>`}
            </div>
          </form>
        </div>
      </div>`;
    },
    employees(){
      const users = window.Auth.users();
      return `<div class='split'>
        <div class='panel'>
          <h3>Usuarios (${users.length})</h3>
          ${users.length? `<table class='table'><thead><tr><th>Usuario</th><th>Rol</th><th>Correo</th><th>RUN</th><th>Creado</th><th>Acciones</th></tr></thead><tbody>
            ${users.map(e=> `<tr data-user='${e.username}'>
              <td>${e.username}</td>
              <td>${e.role}</td>
              <td>${e.email || '-'}</td>
              <td>${e.run || '-'}</td>
              <td>${new Date(e.created).toLocaleDateString()}</td>
              <td>
                <button class='mini-act' data-edit-emp='${e.username}' title='Editar'><i class="fa-solid fa-pen"></i></button>
                <button class='mini-act danger' data-del-emp='${e.username}' title='Eliminar'><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>`).join('')}</tbody></table>` : `<p class='empty'>Sin usuarios registrados.</p>`}
        </div>
        <div class='panel'>
          <h3>${state.editingEmployee? 'Editar usuario' : 'Crear nuevo usuario'}</h3>
          <p class='notice'>Roles disponibles: administrador, cliente y vendedor.</p>
          <form id='formNewEmp' class='form-grid'>
            <div class='field'>
              <label for='emp_user'>Usuario * ${state.editingEmployee? '(solo lectura)' : ''}</label>
              <input id='emp_user' ${state.editingEmployee? 'readonly' : 'required'} placeholder='usuario'>
            </div>
            <div class='field'>
              <label for='emp_run'>RUN *</label>
              <input id='emp_run' required placeholder='19011022K' maxlength='9'>
            </div>
            <div class='field'>
              <label for='emp_nombre'>Nombre *</label>
              <input id='emp_nombre' required maxlength='50'>
            </div>
            <div class='field'>
              <label for='emp_apellidos'>Apellidos *</label>
              <input id='emp_apellidos' required maxlength='100'>
            </div>
            <div class='field'>
              <label for='emp_email'>Correo *</label>
              <input id='emp_email' type='email' required maxlength='100' placeholder='tu@duoc.cl'>
            </div>
            <div class='field'>
              <label for='emp_pass'>Contraseña ${state.editingEmployee? '(dejar vacío para no cambiar)' : '*'}</label>
              <input id='emp_pass' ${state.editingEmployee? '' : 'required'} minlength='4' maxlength='10' placeholder='••••'>
            </div>
            <div class='field'>
              <label for='emp_pass2'>Confirmar ${state.editingEmployee? '(solo si cambias)' : '*'}</label>
              <input id='emp_pass2' ${state.editingEmployee? '' : 'required'} minlength='4' maxlength='10' placeholder='••••'>
            </div>
            <div class='field'>
              <label for='emp_role'>Rol *</label>
              <select id='emp_role' required>
                <option value='admin'>Administrador</option>
                <option value='vendedor'>Vendedor</option>
                <option value='cliente'>Cliente</option>
              </select>
            </div>
            <div class='actions-row' style='grid-column:1 / -1;'>
              <button class='btn' type='submit'><i class='fa-solid fa-${state.editingEmployee? 'save' : 'user-plus'}'></i> ${state.editingEmployee? 'Actualizar' : 'Crear'}</button>
              ${state.editingEmployee? `<button type='button' class='btn secondary' id='cancelEditEmp'>Cancelar</button>` : `<button class='btn secondary' type='reset'>Limpiar</button>`}
            </div>
          </form>
        </div>
      </div>`;
    },
    clients(){
      const users = window.Auth.users().filter(u=> u.role==='cliente');
      return `<h1 class='admin-title'>Clientes (${users.length})</h1>
        ${users.length? `<table class='table'><thead><tr><th>Correo</th><th>Nombre</th><th>Registrado</th></tr></thead><tbody>
          ${users.map(c=> `<tr><td>${c.email}</td><td>${(c.nombre||'')+' '+(c.apellidos||'')}</td><td>${new Date(c.created).toLocaleDateString()}</td></tr>`).join('')}</tbody></table>` : `<p class='empty'>No hay clientes registrados.</p>`}`;
    }
  };

  function render(){ qs('#viewContainer').innerHTML = RENDERS[state.view](); bindForms(); highlightMenu(); }
  function highlightMenu(){ qsa('#adminMenu a').forEach(a=> a.classList.toggle('active', a.dataset.view===state.view)); }

  function bindForms(){
    if(state.view==='inventory'){
      const f = qs('#formNewProd'); if(f) f.addEventListener('submit', e=>{ e.preventDefault();
  const id = qs('#np_id').value.trim();
  const titulo = qs('#np_titulo').value.trim();
  const precioRaw = qs('#np_precio').value.trim();
  const img = qs('#np_img').value.trim();
  const desc = qs('#np_desc').value.trim();
  const stockRaw = qs('#np_stock').value.trim();
  const categoria = qs('#np_cat').value;
  const exists = code => mergedProducts().some(p=>p.id===code);

        // Validaciones
        if(!id || id.length < 3){ toast('Código mínimo 3 caracteres'); return; }
        if(!titulo || titulo.length>100){ toast('Nombre requerido (máx 100)'); return; }
        if(desc.length>500){ toast('Descripción excede 500'); return; }
        if(!precioRaw || isNaN(precioRaw)){ toast('Precio inválido'); return; }
        const precio = parseFloat(precioRaw); if(precio < 0){ toast('Precio >= 0'); return; }
        if(!stockRaw || isNaN(stockRaw)){ toast('Stock inválido'); return; }
        const stock = parseInt(stockRaw,10); if(stock < 0){ toast('Stock >= 0'); return; }
        if(!categoria){ toast('Categoría requerida'); return; }

        if(state.editingProduct){
          const originalId = state.editingProductOriginal || state.editingProduct;
          const isPersisted = state.products.some(p=>p.id===originalId);
          // Verificar duplicado si se cambió el código
            if(id !== originalId && exists(id)){
              toast('Código ya existe'); return;
            }
          if(isPersisted){
            const prod = state.products.find(p=>p.id===originalId);
            if(prod){
              prod.id = id;
              prod.titulo = titulo;
              prod.precio = precio;
              prod.img = img || 'assets/images/products/cap1.png';
              prod.desc = desc;
              prod.stock = stock;
              prod.categoria = categoria;
              toast('Producto actualizado');
            }
          } else {
            // Era base: crear override
            const override = { id, titulo, precio, img: img || 'assets/images/products/cap1.png', desc, stock, categoria };
            state.products.push(override);
            toast(id===originalId? 'Producto base modificado':'Producto base duplicado como nuevo código');
          }
          state.editingProduct = null; state.editingProductOriginal=null; persistAll(); render(); return;
        }
  if(exists(id)){ toast('Código duplicado'); return; }
        const nuevo = { id, titulo, precio, img: img || 'assets/images/products/cap1.png', desc, stock, categoria };
        state.products.push(nuevo); persistAll(); toast('Producto creado'); render();
      });
      // cancelar edición
      const cancelBtn = qs('#cancelEditProd'); if(cancelBtn) cancelBtn.addEventListener('click', ()=>{ state.editingProduct = null; render(); });
      // acciones lista
  document.querySelectorAll('[data-edit-prod]').forEach(btn=> btn.addEventListener('click', e=>{ e.preventDefault(); const pid = btn.dataset.editProd; const all = mergedProducts(); const prod = all.find(p=>p.id===pid); if(!prod){ toast('No encontrado'); return; } state.editingProduct = pid; state.editingProductOriginal = pid; render(); setTimeout(()=> fillProductForm(prod),0); }));
      document.querySelectorAll('[data-del-prod]').forEach(btn=> btn.addEventListener('click', e=>{ e.preventDefault(); const pid = btn.dataset.delProd; if(!confirm('Eliminar producto '+pid+'?')) return; const idx = state.products.findIndex(p=>p.id===pid); if(idx>-1){ state.products.splice(idx,1); persistAll(); toast('Producto eliminado'); render(); } }));
      document.querySelectorAll('[data-view-prod]').forEach(btn=> btn.addEventListener('click', e=>{ e.preventDefault(); const id = btn.dataset.viewProd; const prod = mergedProducts().find(p=>p.id===id); if(!prod){ toast('No encontrado'); return; } showProductDetail(prod); }));
    }
    if(state.view==='employees'){
      const f = qs('#formNewEmp'); if(f) f.addEventListener('submit', e=>{ e.preventDefault();
        const user = qs('#emp_user').value.trim();
        const run = qs('#emp_run').value.trim().toUpperCase();
        const nombre = qs('#emp_nombre').value.trim();
        const apellidos = qs('#emp_apellidos').value.trim();
        const email = qs('#emp_email').value.trim().toLowerCase();
        const pass = qs('#emp_pass').value;
        const pass2 = qs('#emp_pass2').value;
        const role = qs('#emp_role').value;
        const users = window.Auth.users();
        const dominios = ['duoc.cl','profesor.duoc.cl','gmail.com'];

        if(!window.Auth.validarRun(run)){ toast('RUN inválido'); return; }
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !dominios.includes(email.split('@')[1])){ toast('Correo inválido'); return; }
        if(pass && pass !== pass2){ toast('Contraseñas no coinciden'); return; }
        if(!nombre || !apellidos){ toast('Nombre/apellidos requeridos'); return; }

        if(state.editingEmployee){
          // Edición: recrear usuario
          const existing = users.find(u=> u.username===state.editingEmployee);
          if(existing){
            const updated = { ...existing, run, nombre, apellidos, email, role };
            if(pass){ updated._pass = pass; }
            // Reemplazar en storage global
            const all = users.map(u=> u.username===existing.username? updated : u);
            localStorage.setItem('CK_USERS_V1', JSON.stringify(all));
            toast('Usuario actualizado');
          }
          state.editingEmployee = null; render(); return;
        }
        if(users.some(u=> u.username===user)){ toast('Usuario duplicado'); return; }
        if(users.some(u=> u.email===email)){ toast('Correo ya usado'); return; }
        if(!pass){ toast('Contraseña requerida'); return; }
        const nuevo = { username:user, run, nombre, apellidos, email, role, direccion:'', fnac:'', created:Date.now(), _pass:pass };
        const all = [...users, nuevo];
        localStorage.setItem('CK_USERS_V1', JSON.stringify(all));
        toast('Usuario creado'); render();
      });
      const cancelEmp = qs('#cancelEditEmp'); if(cancelEmp) cancelEmp.addEventListener('click', ()=>{ state.editingEmployee=null; render(); });
      document.querySelectorAll('[data-edit-emp]').forEach(btn=> btn.addEventListener('click', e=>{ e.preventDefault(); const u = btn.dataset.editEmp; const emp = window.Auth.users().find(x=>x.username===u); if(!emp){ toast('No encontrado'); return; } state.editingEmployee = u; render(); setTimeout(()=> fillEmployeeForm(emp),0); }));
      document.querySelectorAll('[data-del-emp]').forEach(btn=> btn.addEventListener('click', e=>{ e.preventDefault(); const u = btn.dataset.delEmp; if(!confirm('Eliminar usuario '+u+'?')) return; const remaining = window.Auth.users().filter(x=> x.username!==u); localStorage.setItem('CK_USERS_V1', JSON.stringify(remaining)); toast('Usuario eliminado'); render(); }));
    }
    if(state.view==='orders'){
      document.querySelectorAll('[data-view-order]').forEach(b=> b.addEventListener('click', e=>{ e.preventDefault(); const id = b.dataset.viewOrder; const ord = state.orders.find(o=>o.id===id); if(!ord){ toast('Orden no encontrada'); return; } showOrderDetail(ord); }));
    }
  }

  function fillProductForm(p){ if(!p) return; qs('#np_id').value = p.id; qs('#np_titulo').value = p.titulo; qs('#np_precio').value = p.precio; qs('#np_img').value = p.img; qs('#np_desc').value = p.desc || ''; const s=qs('#np_stock'); if(s) s.value = p.stock ?? 0; const cat=qs('#np_cat'); if(cat) cat.value = p.categoria || 'General'; }
  function fillEmployeeForm(e){ if(!e) return; qs('#emp_user').value = e.username; qs('#emp_run').value = e.run || ''; qs('#emp_nombre').value = e.nombre || ''; qs('#emp_apellidos').value = e.apellidos || ''; qs('#emp_email').value = e.email || ''; qs('#emp_role').value = e.role || 'cliente'; }

  document.addEventListener('DOMContentLoaded', () => {
    qs('#adminMenu').addEventListener('click', e=>{
      const a = e.target.closest('a[data-view]'); if(!a) return; e.preventDefault(); state.view = a.dataset.view; render();
    });
    filterMenuByRole();
    render();
  });

  function filterMenuByRole(){
    const sess = window.Auth? window.Auth.getSession(): null;
    if(!sess) return;
    if(sess.role==='vendedor'){
      // Solo órdenes e inventario
      qsa('#adminMenu a').forEach(a=>{
        if(!['orders','inventory'].includes(a.dataset.view)) a.style.display='none';
      });
      if(!['orders','inventory'].includes(state.view)){ state.view='orders'; }
    }
  }

  function showOrderDetail(order){
    const html = `<div class='panel'>
      <h3>Detalle Orden ${order.id}</h3>
      <p><strong>Fecha:</strong> ${new Date(order.date).toLocaleString()}</p>
      <p><strong>Cliente:</strong> ${order.customer||'-'}</p>
      <p><strong>Total:</strong> ${money(order.total)}</p>
      <table class='table' style='margin-top:14px;'>
        <thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${order.items.map(it=> `<tr><td>${it.titulo||it.id}</td><td>${it.cantidad}</td><td>${money(it.precio)}</td><td>${money(it.precio*it.cantidad)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div style='margin-top:18px; display:flex; gap:10px;'>
        <button class='btn secondary' id='closeDetail'>Cerrar</button>
      </div>
    </div>`;
    const container = qs('#viewContainer');
    const prev = container.innerHTML;
    container.innerHTML = html;
    qs('#closeDetail').addEventListener('click', ()=>{ container.innerHTML = RENDERS[state.view](); bindForms(); });
  }

  function showProductDetail(prod){
    const html = `<div class='panel'>
      <h3>Detalle Producto ${prod.id}</h3>
      <p><strong>Nombre:</strong> ${prod.titulo}</p>
      <p><strong>Precio:</strong> ${money(prod.precio)}</p>
  <p><strong>Categoría:</strong> ${prod.categoria||'General'}</p>
  <p><strong>Stock:</strong> ${prod.stock ?? 0} ${ (prod.stock??0)===0 ? '(SIN STOCK)' : ''}</p>
      <p><strong>Descripción:</strong><br>${prod.desc||'-'}</p>
      <div style='margin-top:18px; display:flex; gap:10px;'>
        <button class='btn secondary' id='closeProdDetail'>Cerrar</button>
      </div>
    </div>`;
    const container = qs('#viewContainer');
    container.innerHTML = html;
    qs('#closeProdDetail').addEventListener('click', ()=>{ render(); });
  }
})();
