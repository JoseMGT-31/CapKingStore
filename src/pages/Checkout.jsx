import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { moneyCLP } from '../data/productos';
import { getItem, setItem } from '../utils/localStorage';
import '../css/checkout.css';

export const Checkout = () => {
  const { items, clear, total } = useCart();
  const navigate = useNavigate();

  const handleConfirm = () => {
    const subtotal = total();
    const envio = subtotal > 60000 ? 0 : 4990;
    const totalFinal = subtotal + envio;

    const order = {
      id: 'ORD-' + Date.now().toString(36),
      date: Date.now(),
      items: items,
      total: totalFinal,
      status: 'ok',
      customer: 'Cliente invitado'
    };

    const KEY_ORDERS = 'CK_ORDERS_V1';
    const existing = getItem(KEY_ORDERS, []);
    existing.push(order);
    setItem(KEY_ORDERS, existing);

    alert('Compra confirmada (simulación). Gracias! ID: ' + order.id);
    clear();
    navigate('/admin');
  };

  if (items.length === 0) {
    return (
      <main className="wrap">
        <h1>Resumen de tu compra</h1>
        <div id="checkoutEmpty" className="box">
          <p className="empty-msg">
            Tu carrito está vacío.{' '}
            <a className="mini-link" href="/#productos">Ir a productos</a>
          </p>
        </div>
      </main>
    );
  }

  const subtotal = total();
  const envio = subtotal > 60000 ? 0 : 4990;
  const totalFinal = subtotal + envio;

  return (
    <main className="wrap">
      <h1>Resumen de tu compra</h1>
      <div className="resume-grid" id="checkoutContent">
        <div className="box">
          <h2>Items</h2>
          <div className="items-list" id="checkoutItems">
            {items.map(item => (
              <div className="r-item" key={item.id}>
                <img src={item.img} alt={item.titulo} />
                <div>
                  <p className="r-item-title">{item.titulo}</p>
                  <p className="r-item-attrs">{item.attrs || ''}</p>
                  <p className="r-item-price">
                    {item.qty} x {moneyCLP(item.precio)} = {moneyCLP(item.precio * item.qty)}
                  </p>
                </div>
                <p className="r-item-line-total">{moneyCLP(item.precio * item.qty)}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="box">
          <h2>Resumen</h2>
          <div className="summary" id="checkoutSummary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{moneyCLP(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Envío {envio === 0 ? '(gratis)' : ''}</span>
              <span>{moneyCLP(envio)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{moneyCLP(totalFinal)}</span>
            </div>
          </div>
          <button className="btn-primary" id="btnPagar" type="button" onClick={handleConfirm}>
            Confirmar compra
          </button>
          <p className="purchase-note">
            Al confirmar aceptas nuestros términos y el procesamiento de los datos necesarios para tu pedido.
          </p>
        </aside>
      </div>
    </main>
  );
};
