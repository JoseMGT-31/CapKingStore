import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTOS } from '../data/productos';
import '../css/home.css';

export const Home = () => {
  return (
    <main>
      <Hero />
      <section id="productos">
        <div className="container">
          <div className="productos-header">
            <h2 className="productos-title">Productos</h2>
            <p className="productos-subtitle">Nuestra nueva colección</p>
          </div>
          <div id="gridProductos" className="grid">
            {PRODUCTOS.map(producto => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
