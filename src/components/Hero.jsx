export const Hero = () => {
  const scrollToProducts = (e) => {
    e.preventDefault();
    const productSection = document.getElementById('productos');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>CapKing Store</h1>
        <p>Las mejores gorras para marcar tu estilo.</p>
        <a href="#productos" className="hero-button" onClick={scrollToProducts}>
          <i className="fa-solid fa-arrow-down"></i>
          Ver Productos
        </a>
      </div>
    </section>
  );
};
