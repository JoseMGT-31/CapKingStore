// auth.js - Gestión simple de usuarios y sesión (localStorage)
(function(){
  const KEY_SESSION = 'CK_SESSION_V1';
  const KEY_USERS   = 'CK_USERS_V1';

  // Cargar usuarios existentes
  let users = safeJSON(KEY_USERS, []);

  // Migración de estructuras antiguas (solo si no hay usuarios nuevos)
  if(!users.length){ migrateLegacy(); }

  // Insertar usuarios semilla si faltan
  seedUsers([
    { username:'admin',     run:'11111111K', nombre:'Super',  apellidos:'Administrador', email:'admin@duoc.cl',     role:'admin',    _pass:'admin123' },
    { username:'cliente1',  run:'22222222K', nombre:'Carlos', apellidos:'Cliente',       email:'cliente1@gmail.com', role:'cliente',  _pass:'cliente' },
    { username:'vendedor1', run:'33333333K', nombre:'Valeria',apellidos:'Vendedora',     email:'vendedor1@duoc.cl',  role:'vendedor', _pass:'vendedor' }
  ]);

  persist();

  // ---- Utilidades internas ----
  function safeJSON(key, fb){ try { return JSON.parse(localStorage.getItem(key)) || fb; } catch { return fb; } }
  function persist(){ localStorage.setItem(KEY_USERS, JSON.stringify(users)); }
  function saveSession(sess){ localStorage.setItem(KEY_SESSION, JSON.stringify(sess)); }
  function getSession(){ return safeJSON(KEY_SESSION, null); }
  function seedUsers(list){ list.forEach(u=> { if(!users.some(x=> x.username===u.username || x.email===u.email)){ users.push(buildUser(u)); } }); }
  function buildUser(u){ return { username:u.username, run:u.run||'', nombre:u.nombre||'', apellidos:u.apellidos||'', email:u.email||'', role:u.role||'cliente', direccion:u.direccion||'', fnac:u.fnac||'', created: Date.now(), _pass:u._pass||'1234' }; }

  function migrateLegacy(){
    const legacyEmployees = safeJSON('CK_EMPLOYEES_V1', []);
    const legacyClients   = safeJSON('CK_CLIENTS_V1', []);
    if(!(legacyEmployees.length || legacyClients.length)) return;
    const mappedEmp = legacyEmployees.map(e=> buildUser({ ...e, role: e.role==='admin'? 'admin' : (e.role==='cliente'? 'cliente':'vendedor'), _pass: e._pass||'1234' }));
    const mappedClients = legacyClients
      .filter(c=> !mappedEmp.some(m=> m.email===c.email))
      .map(c=> buildUser({ username:c.email.split('@')[0], nombre:c.name||'', email:c.email, role:'cliente', _pass:'1234' }));
    users = [...mappedEmp, ...mappedClients];
  }

  // ---- API pública ----
  function login(identifier, pass){
    identifier = identifier.trim().toLowerCase();
    const u = users.find(x=> x.username.toLowerCase()===identifier || x.email.toLowerCase()===identifier);
    if(!u) return { ok:false, msg:'Usuario no encontrado' };
    if(u._pass !== pass) return { ok:false, msg:'Contraseña incorrecta' };
    const { _pass, ...safe } = u;
    saveSession({ username:safe.username, role:safe.role, email:safe.email, ts:Date.now() });
    return { ok:true, user:safe };
  }

  function logout(){ localStorage.removeItem(KEY_SESSION); }

  function register(data){
    if(users.some(u=> u.username===data.username)) return { ok:false, msg:'Usuario ya existe' };
    if(users.some(u=> u.email===data.email)) return { ok:false, msg:'Correo ya registrado' };
    users.push(buildUser({ ...data, _pass:data.pass }));
    persist();
    return { ok:true };
  }

  // Validación RUN (RUT chileno) - Módulo 11
  function validarRun(run){
    if(!/^[0-9kK]{7,9}$/.test(run)) return false;
    const cuerpo = run.slice(0,-1), dv = run.slice(-1).toLowerCase();
    let suma=0, mult=2;
    for(let i=cuerpo.length-1;i>=0;i--){ suma += parseInt(cuerpo[i],10)*mult; mult = mult===7?2:mult+1; }
    const res = 11 - (suma % 11);
    const dvCalc = res===11? '0' : res===10? 'k' : String(res);
    return dv === dvCalc;
  }

  window.Auth = { login, logout, getSession, register, validarRun, users:()=> users.slice() };
})();
