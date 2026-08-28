// ============================================
// APP PRINCIPAL - Carga de productos
// ============================================

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    const products = await api('/products');

    if (products.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--color-gray);grid-column:1/-1;">No hay productos disponibles</p>';
      return;
    }

    grid.innerHTML = products.map(p => `
      <div class="product-card" onclick="location.href='producto.html?id=${p.id}'">
        <div class="product-image-wrap">
          <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
          <span class="product-badge">${p.category}</span>
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.description || ''}</p>
          <div class="product-footer">
            <span class="product-price">$${Number(p.price).toLocaleString()}</span>
            <button class="btn btn-dark" style="padding:8px 16px;font-size:13px;" 
              onclick="event.stopPropagation(); addToCart({id:${p.id},name:'${p.name.replace(/'/g,"\'")}',price:${p.price},image:'${p.image}'})">
              Agregar
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando productos:', err);
    grid.innerHTML = '<p style="text-align:center;color:var(--color-gray);grid-column:1/-1;">Error al cargar productos. Intentá más tarde.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
});
