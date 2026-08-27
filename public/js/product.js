document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.href = '/'; return; }
  loadProduct(id);
});

let currentQty = 1;

async function loadProduct(id) {
  const container = document.getElementById('product-container');
  try {
    const { product: p, related } = await apiFetch(`/products/${id}`);
    const disc = discount(p.price, p.original_price);
    container.innerHTML = `
      <div class="product-detail">
        <div class="breadcrumb">
          <a href="/">Home</a> › <a href="/search?category=${p.category_slug}">${p.category_name}</a> › ${p.name.substring(0, 40)}...
        </div>
        <div class="product-detail-grid">
          <div class="product-images">
            <div class="main-image">
              <img src="${p.image_url}&auto=format&fit=crop&w=600" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x400?text=Product'">
            </div>
          </div>
          <div class="product-detail-info">
            ${p.badge ? `<span class="product-badge" style="position:static;display:inline-block;margin-bottom:8px">${p.badge}</span>` : ''}
            <h1 class="product-detail-title">${p.name}</h1>
            <div class="stars">
              <span class="stars-val" style="font-size:18px">${stars(p.rating)}</span>
              <span class="stars-count">${p.review_count?.toLocaleString()} ratings</span>
            </div>
            <div style="border-top:1px solid var(--gray-200);padding-top:14px">
              <div class="product-detail-price">$${p.price.toFixed(2)}</div>
              ${disc > 0 ? `<span style="color:var(--red);font-weight:600">Save ${disc}%</span> <span style="text-decoration:line-through;color:var(--gray-400)">$${p.original_price.toFixed(2)}</span>` : ''}
            </div>
            <div>${stockLabel(p.stock)}</div>
            <p class="product-detail-desc">${p.description}</p>
            <div class="qty-selector">
              <span style="font-weight:600;font-size:14px">Qty:</span>
              <button class="qty-btn" id="qty-dec">−</button>
              <span class="qty-val" id="qty-val">1</span>
              <button class="qty-btn" id="qty-inc">+</button>
            </div>
            <button class="add-to-cart-big" id="add-cart-btn" ${p.stock === 0 ? 'disabled style="opacity:0.5"' : ''}>
              🛒 Add to Cart
            </button>
            <button class="add-to-cart-big" style="background:var(--navy);color:white;margin-top:10px" id="buy-now-btn" ${p.stock === 0 ? 'disabled style="opacity:0.5"' : ''}>
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>
      ${related.length ? `
        <div class="section">
          <div class="section-header"><h2 class="section-title">Related Products</h2></div>
          <div class="products-grid">${related.map(productCardHTML).join('')}</div>
        </div>` : ''}`;

    document.getElementById('qty-dec').onclick = () => { if (currentQty > 1) { currentQty--; document.getElementById('qty-val').textContent = currentQty; } };
    document.getElementById('qty-inc').onclick = () => { if (currentQty < p.stock) { currentQty++; document.getElementById('qty-val').textContent = currentQty; } };
    document.getElementById('add-cart-btn').onclick = () => addToCart(p.id, p.name, currentQty);
    document.getElementById('buy-now-btn').onclick = async () => { await addToCart(p.id, p.name, currentQty); location.href = '/cart'; };

    document.title = `${p.name} | ShopNow`;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="icon">😕</div><h3>Product not found</h3><a href="/" class="btn btn-primary">Go Home</a></div>`;
  }
}

async function addToCart(productId, name, qty) {
  if (!getToken()) { showToast('Please login first', 'error'); setTimeout(() => location.href = '/login', 1200); return; }
  try {
    await apiFetch('/cart', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity: qty }) });
    showToast(`"${name}" added to cart!`);
    updateCartCount();
  } catch (e) { showToast(e.message, 'error'); }
}
