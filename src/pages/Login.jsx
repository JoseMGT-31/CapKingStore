import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/register.css';

export const Login = () => {
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!correo || !pass) {
      setError('Por favor completa todos los campos');
      return;
    }

    const result = login(correo, pass);
    if (result.ok) {
      navigate('/');
    } else {
      setError(result.msg);
    }
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>Iniciar sesión</h1>
          <form id="formLogin" className="form" onSubmit={handleSubmit} noValidate>
            <div className="field full">
              <label htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                placeholder="tu@duoc.cl"
                required
                maxLength="100"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
              <small className="hint">Permitidos: @duoc.cl, @profesor.duoc.cl, @gmail.com</small>
            </div>

            <div className="field full">
              <label htmlFor="pass">Contraseña</label>
              <input
                id="pass"
                name="pass"
                type="password"
                placeholder="••••"
                required
                minLength="4"
                maxLength="10"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>

            {error && (
              <div className="field full">
                <small className="error" style={{ display: 'block', color: '#ff6b6b' }}>
                  {error}
                </small>
              </div>
            )}

            <div className="field">
              <label style={{ fontWeight: 500, fontSize: '.85rem' }}>
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  style={{ width: 'auto', marginRight: '6px', accentColor: '#ffd54a' }}
                />
                Recuérdame
              </label>
            </div>

            <button type="submit" className="btn">Entrar</button>

            <div className="field full" style={{ textAlign: 'center', fontSize: '.85rem', color: '#cfcfcf' }}>
              ¿No tienes cuenta?{' '}
              <a href="/register" style={{ color: '#ffd54a', textDecoration: 'none', fontWeight: 600 }}>
                Crear cuenta
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};
