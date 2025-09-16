// login.js - Maneja la validación y envío del formulario de login
(function(){
  document.addEventListener('DOMContentLoaded', initLogin);

  function qs(id){ return document.getElementById(id); }

  function initLogin(){
    const form = qs('formLogin'); if(!form) return;
    const correo = qs('correo');
    const pass = qs('pass');
    const errCorreo = qs('err-correo');
    const errPass = qs('err-pass');
    const allowed = ['duoc.cl','profesor.duoc.cl','gmail.com'];

    correo.addEventListener('blur', validarCorreo);
    pass.addEventListener('blur', validarPass);
    form.addEventListener('submit', onSubmit);

    function validarCorreo(){
      const v = correo.value.trim();
      resetErr(correo, errCorreo);
      if(!v) return setAndFail(correo, errCorreo,'Ingresa el correo.');
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return setAndFail(correo, errCorreo,'Formato inválido.');
      const domain = v.split('@')[1].toLowerCase();
      if(!allowed.includes(domain)) return setAndFail(correo, errCorreo,'Dominio no permitido.');
      return true;
    }

    function validarPass(){
      const v = pass.value;
      resetErr(pass, errPass);
      if(!v) return setAndFail(pass, errPass,'Ingresa la contraseña.');
      if(v.length<4) return setAndFail(pass, errPass,'Mínimo 4 caracteres.');
      return true;
    }

    function onSubmit(e){
      e.preventDefault();
      const okCorreo = validarCorreo();
      const okPass = validarPass();
      if(!okCorreo || !okPass) return;
      const btn = form.querySelector('.btn');
      btn.disabled = true; btn.textContent = 'Entrando...';
      const res = window.Auth.login(correo.value.trim(), pass.value);
      if(!res.ok){
        setErr(pass, errPass, res.msg);
        btn.disabled=false; btn.textContent='Entrar';
        return;
      }
      setTimeout(()=>{ location.href = (res.user.role==='admin')? 'admin.html':'home.html'; }, 350);
    }
  }

  function resetErr(input, small){ small.textContent=''; input.parentElement.classList.remove('error'); }
  function setErr(input, small, msg){ small.textContent = msg; input.parentElement.classList.add('error'); }
  function setAndFail(input, small, msg){ setErr(input, small, msg); return false; }
})();
