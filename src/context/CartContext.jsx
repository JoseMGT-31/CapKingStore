import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem } from '../utils/localStorage';

const CartContext = createContext();
const LS_KEY = 'CK_CART_V1';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => getItem(LS_KEY, []));

  useEffect(() => {
    setItem(LS_KEY, items);
  }, [items]);

  const add = (product, qty = 1) => {
    setItems(current => {
      const existing = current.find(i => i.id === product.id);
      if (existing) {
        return current.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...current, {
        id: product.id,
        titulo: product.titulo,
        precio: product.precio,
        img: product.img,
        attrs: product.attrs,
        qty
      }];
    });
  };

  const remove = (id) => {
    setItems(current => current.filter(i => i.id !== id));
  };

  const update = (id, qty) => {
    setItems(current =>
      current.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)
    );
  };

  const clear = () => {
    setItems([]);
  };

  const total = () => {
    return items.reduce((sum, item) => sum + item.precio * item.qty, 0);
  };

  const count = () => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  };

  const value = {
    items,
    add,
    remove,
    update,
    clear,
    total,
    count
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
