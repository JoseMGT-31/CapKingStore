import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { moneyCLP } from '../data/productos';

export const ProductCard = ({ product }) => {
  const { add } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    add(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <article className="card">
      <img
        className="card__img"
        src={product.img}
        alt={product.titulo}
        loading="lazy"
      />
      <div className="card__body">
        <Link
          className="card__title"
          to={`/producto/${product.id}`}
          title={product.desc}
        >
          {product.titulo}
        </Link>
        <div className="card__attrs">{product.attrs || ''}</div>
        <div className="card__row">
          <span className="card__price">{moneyCLP(product.precio)}</span>
          <button
            className={`card__btn ${isAdded ? 'added' : ''}`}
            onClick={handleAdd}
            disabled={isAdded}
          >
            {isAdded ? '✓ Añadido' : 'Añadir'}
          </button>
        </div>
      </div>
    </article>
  );
};
