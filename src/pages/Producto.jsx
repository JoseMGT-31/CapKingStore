import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PRODUCTOS, moneyCLP } from '../data/productos';
import '../css/producto.css';

export const Producto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [producto, setProducto] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const found = PRODUCTOS.find(p => p.id === id);
    if (found) {
      setProducto(found);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const handleAdd = () => {
    if (producto) {
      add(producto, 1);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  if (!producto) {
    return <main className="producto-wrap"><p>Cargando...</p></main>;
  }

  return (
    <>
      <main className="producto-wrap" id="productoWrap">
        <div className="producto-container">
          <div className="producto-image">
            <img src={producto.img} alt={producto.titulo} />
          </div>
          <div className="producto-info">
            <h1>{producto.titulo}</h1>
            <p className="producto-attrs">{producto.attrs}</p>
            <p className="producto-desc">{producto.desc}</p>
            <div className="producto-price">{moneyCLP(producto.precio)}</div>
            <button className="producto-btn" onClick={handleAdd}>
              Añadir al carrito
            </button>
          </div>
        </div>
      </main>
      <div className={`added-toast ${showToast ? 'show' : ''}`} id="addedToast">
        <i className="fa-solid fa-circle-check"></i>
        <span id="addedMsg">Añadido al carrito</span>
      </div>
    </>
  );
};
