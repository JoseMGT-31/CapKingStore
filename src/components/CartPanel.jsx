import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { moneyCLP } from '../data/productos';
import '../css/cart.css';

export const CartPanel = ({ isOpen, onClose }) => {
  const { items, remove, update, clear, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  const handleClear = () => {
    if (confirm('¿Vaciar carrito?')) {
      clear();
    }
  };

  const changeQty = (id, delta) => {
    const item = items.find(i => i.id === id);
    if (item) {
      update(id, item.qty + delta);
    }
  };

  return (
    <>
      <div className={`cart-panel ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h2>Tu Carrito</h2>
          <button className="cart-close" onClick={onClose} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>
        <div className="cart-items" role="list">
          {items.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío</p>
          ) : (
            items.map(item => (
              <div className="cart-item" key={item.id} data-id={item.id} role="listitem">
                <img src={item.img} alt={item.titulo} />
                <div>
                  <p className="cart-item-title">{item.titulo}</p>
                  <p className="cart-item-attrs">{item.attrs || ''}</p>
                  <div className="qty-box">
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, -1)}
                      aria-label="Restar"
                    >
                      -
                    </button>
                    <input aria-label="Cantidad" value={item.qty} readOnly />
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, 1)}
                      aria-label="Sumar"
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-item-price">{moneyCLP(item.precio * item.qty)}</p>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => remove(item.id)}
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-total-row">
            <span>Total</span>
            <span className="cart-total">{moneyCLP(total())}</span>
          </div>
          <div className="cart-actions">
            <button
              className="cart-btn cart-btn--clear"
              type="button"
              onClick={handleClear}
            >
              Vaciar
            </button>
            <button className="cart-btn" type="button" onClick={handleCheckout}>
              Comprar
            </button>
          </div>
        </div>
      </div>
      <div
        className={`cart-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>
    </>
  );
};
