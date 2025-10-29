import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CartPanel } from './components/CartPanel';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Producto } from './pages/Producto';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar onCartOpen={() => setIsCartOpen(true)} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <footer>
            <p>© 2025 CapKing Store - Todos los derechos reservados.</p>
          </footer>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
