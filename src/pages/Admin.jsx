import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PRODUCTOS, moneyCLP } from '../data/productos';
import { getItem, setItem } from '../utils/localStorage';
import '../css/admin.css';

const KEY_ORDERS = 'CK_ORDERS_V1';

export const Admin = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('orders');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!session || (session.role !== 'admin' && session.role !== 'vendedor')) {
      alert('Acceso restringido. Debes iniciar sesión (admin o vendedor).');
      navigate('/login');
      return;
    }
    loadOrders();
  }, [session, navigate]);

  const loadOrders = () => {
    const loadedOrders = getItem(KEY_ORDERS, []);
    setOrders(loadedOrders);
  };

  const renderOrders = () => {
    const list = orders.slice().reverse();
    return (
      <>
        <h1 className="admin-title">Órdenes</h1>
        {list.length === 0 ? (
          <p className="empty">No hay órdenes aún.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Items</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {list.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.date).toLocaleString()}</td>
                  <td>{order.customer || '-'}</td>
                  <td>{moneyCLP(order.total)}</td>
                  <td>{order.items.length}</td>
                  <td>
                    <span className={`status-pill ${order.status}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    );
  };

  const renderInventory = () => {
    return (
      <>
        <h1 className="admin-title">Inventario</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTOS.map(prod => (
              <tr key={prod.id}>
                <td>{prod.id}</td>
                <td>{prod.titulo}</td>
                <td>{moneyCLP(prod.precio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'orders':
        return renderOrders();
      case 'inventory':
        return renderInventory();
      default:
        return renderOrders();
    }
  };

  if (!session || (session.role !== 'admin' && session.role !== 'vendedor')) {
    return null;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>ADMIN</h2>
        <ul className="admin-menu">
          <li>
            <a
              href="#"
              className={view === 'orders' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setView('orders');
              }}
            >
              <i className="fa-solid fa-receipt"></i> Órdenes
            </a>
          </li>
          <li>
            <a
              href="#"
              className={view === 'inventory' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setView('inventory');
              }}
            >
              <i className="fa-solid fa-boxes-stacked"></i> Inventario
            </a>
          </li>
        </ul>
      </aside>
      <main className="admin-content">
        <section id="viewContainer">{renderContent()}</section>
      </main>
    </div>
  );
};
