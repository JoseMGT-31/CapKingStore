import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../css/navbar.css';

export const Navbar = ({ onCartOpen }) => {
  const location = useLocation();
  const { session, logout } = useAuth();
  const { count } = useCart();
  const cartCount = count();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header>
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/" className={isActive('/')}>Inicio</Link></li>
          <li><Link to="/#productos">Productos</Link></li>
          <li><Link to="/about" className={isActive('/about')}>Nosotros</Link></li>
          <li><Link to="/blogs" className={isActive('/blogs')}>Blogs</Link></li>
          <li><Link to="/contacto" className={isActive('/contacto')}>Contacto</Link></li>
        </ul>
        <div className="logo">
          <img src="/assets/images/logo_capking_white.png" alt="CapKing Store Logo" />
        </div>
        <div className="nav-actions">
          {!session ? (
            <Link to="/login" className={`mini-btn ${isActive('/login')}`}>
              <i className="fa-solid fa-user"></i> Acceder
            </Link>
          ) : (
            <>
              {['admin', 'vendedor'].includes(session.role) && (
                <Link to="/admin" className={`mini-btn ${isActive('/admin')}`}>
                  <i className="fa-solid fa-shield"></i> Admin
                </Link>
              )}
              <span className="mini-btn user-tag">
                <i className="fa-solid fa-user"></i> {session.username} ({session.role})
              </span>
              <button onClick={handleLogout} className="mini-btn logout-btn">
                <i className="fa-solid fa-right-from-bracket"></i> Salir
              </button>
            </>
          )}
          <button
            onClick={onCartOpen}
            aria-label="Carrito"
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
          >
            <i id="cart-icon" className="fa-solid fa-cart-shopping" style={{ fontSize: '1.2rem', color: 'white' }}></i>
            {cartCount > 0 && (
              <span className="cart-badge" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ffd54a',
                color: '#1a1a1a',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};
