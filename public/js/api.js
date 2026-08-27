const API = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('token'); }
function getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
function setAuth(token, user) { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem('token'); localStorage.removeItem('user'); }

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function stars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

function discount(price, original) {
  if (!original || original <= price) return 0;
  return Math.round((1 - price / original) * 100);
}

function stockLabel(stock) {
  if (stock === 0) return '<span class="out-stock">Out of Stock</span>';
  if (stock < 10) return `<span class="low-stock">Only ${stock} left!</span>`;
  return '<span class="in-stock">In Stock</span>';
}

function showToast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function productCardHTML(p) {
  const disc = discount(p.price, p.original_price);
  const badgeClass = p.badge === 'Deal' ? 'deal' : p.badge === 'Hot' ? 'hot' : '';
  return `
    <div class="product-card" onclick="location.href='/product?id=${p.id}'">
      ${p.badge ? `<span class="product-badge ${badgeClass}">${p.badge}</span>` : ''}
      <div class="product-img-wrap">
        <img src="${p.image_url}&auto=format&fit=crop" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300?text=Product'">
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="stars">
          <span class="stars-val">${stars(p.rating)}</span>
          <span class="stars-count">(${p.review_count?.toLocaleString()})</span>
        </div>
        <div class="product-price">
          <span class="price-current">$${p.price.toFixed(2)}</span>
          ${disc > 0 ? `<span class="price-original">$${p.original_price.toFixed(2)}</span><span class="price-save">-${disc}%</span>` : ''}
        </div>
        ${stockLabel(p.stock)}
      </div>
      <button class="btn-add-cart" onclick="event.stopPropagation(); addToCartFromCard(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
        🛒 Add to Cart
      </button>
    </div>`;
}

async function addToCartFromCard(productId, name) {
  if (!getToken()) { showToast('Please login to add items to cart', 'error'); setTimeout(() => location.href = '/login', 1200); return; }
  try {
    await apiFetch('/cart', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity: 1 }) });
    showToast(`"${name}" added to cart!`);
    updateCartCount();
  } catch (e) { showToast(e.message, 'error'); }
}

async function updateCartCount() {
  const badge = document.getElementById('cart-count');
  if (!badge || !getToken()) return;
  try {
    const items = await apiFetch('/cart');
    const total = items.reduce((s, i) => s + i.quantity, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  } catch {}
}

function renderNav() {
  const user = getUser();
  const accountEl = document.getElementById('nav-account');
  if (accountEl) {
    if (user) {
      accountEl.innerHTML = `<span>Hello, ${user.name.split(' ')[0]}</span><span>Account ▾</span>`;
      accountEl.onclick = () => { clearAuth(); location.href = '/'; };
    } else {
      accountEl.innerHTML = `<span>Hello, Sign in</span><span>Account & Lists</span>`;
      accountEl.href = '/login';
    }
  }
  updateCartCount();
}

window.addToCartFromCard = addToCartFromCard;
window.apiFetch = apiFetch;
window.getToken = getToken;
window.getUser = getUser;
window.setAuth = setAuth;
window.clearAuth = clearAuth;
window.showToast = showToast;
window.productCardHTML = productCardHTML;
window.updateCartCount = updateCartCount;
window.renderNav = renderNav;
window.stars = stars;
window.discount = discount;
window.stockLabel = stockLabel;
