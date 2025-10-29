import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, removeItem } from '../utils/localStorage';

const AuthContext = createContext();
const KEY_SESSION = 'CK_SESSION_V1';
const KEY_USERS = 'CK_USERS_V1';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

const buildUser = (u) => ({
  username: u.username,
  run: u.run || '',
  nombre: u.nombre || '',
  apellidos: u.apellidos || '',
  email: u.email || '',
  role: u.role || 'cliente',
  direccion: u.direccion || '',
  fnac: u.fnac || '',
  created: Date.now(),
  _pass: u._pass || '1234'
});

const seedUsers = [
  { username: 'admin', run: '11111111K', nombre: 'Super', apellidos: 'Administrador', email: 'admin@duoc.cl', role: 'admin', _pass: 'admin123' },
  { username: 'cliente1', run: '22222222K', nombre: 'Carlos', apellidos: 'Cliente', email: 'cliente1@gmail.com', role: 'cliente', _pass: 'cliente' },
  { username: 'vendedor1', run: '33333333K', nombre: 'Valeria', apellidos: 'Vendedora', email: 'vendedor1@duoc.cl', role: 'vendedor', _pass: 'vendedor' }
];

const initUsers = () => {
  let users = getItem(KEY_USERS, []);

  seedUsers.forEach(u => {
    if (!users.some(x => x.username === u.username || x.email === u.email)) {
      users.push(buildUser(u));
    }
  });

  setItem(KEY_USERS, users);
  return users;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => getItem(KEY_SESSION, null));
  const [users, setUsers] = useState(() => initUsers());

  const login = (identifier, pass) => {
    const id = identifier.trim().toLowerCase();
    const u = users.find(x =>
      x.username.toLowerCase() === id || x.email.toLowerCase() === id
    );

    if (!u) return { ok: false, msg: 'Usuario no encontrado' };
    if (u._pass !== pass) return { ok: false, msg: 'Contraseña incorrecta' };

    const { _pass, ...safe } = u;
    const newSession = {
      username: safe.username,
      role: safe.role,
      email: safe.email,
      ts: Date.now()
    };

    setSession(newSession);
    setItem(KEY_SESSION, newSession);
    return { ok: true, user: safe };
  };

  const logout = () => {
    setSession(null);
    removeItem(KEY_SESSION);
  };

  const register = (data) => {
    if (users.some(u => u.username === data.username)) {
      return { ok: false, msg: 'Usuario ya existe' };
    }
    if (users.some(u => u.email === data.email)) {
      return { ok: false, msg: 'Correo ya registrado' };
    }

    const newUser = buildUser({ ...data, _pass: data.pass });
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setItem(KEY_USERS, updatedUsers);
    return { ok: true };
  };

  const validarRun = (run) => {
    if (!/^[0-9kK]{7,9}$/.test(run)) return false;
    const cuerpo = run.slice(0, -1);
    const dv = run.slice(-1).toLowerCase();
    let suma = 0;
    let mult = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * mult;
      mult = mult === 7 ? 2 : mult + 1;
    }

    const res = 11 - (suma % 11);
    const dvCalc = res === 11 ? '0' : res === 10 ? 'k' : String(res);
    return dv === dvCalc;
  };

  const value = {
    session,
    login,
    logout,
    register,
    validarRun,
    users
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
