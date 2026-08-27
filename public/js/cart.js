document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  if (!getToken()) { location.href = '/login'; return; }
  loadCart();
});

let cartItems = [];

async function loadCart() {
  const container = document.getElementById('cart-container');
  const summaryEl = document.getElementById('cart-summary');
  try {
    cartItems = await apiFetch('/cart');
    if (cartItems.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="icon">🛒</div><h3>Your cart is empty</h3><p>Looks like you haven't added anything yet.</p><a href="/" class="btn btn-primary">Start Shopping</a></div>`;
      summaryEl.style.display = 'none';
      return;
    }
    summaryEl.style.display = 'block';
    renderCart();
  } catch (e) { showToast(e.message, 'error'); }
}

function renderCart() {
  const container = document.getElementById('cart-items-list');
  container.innerHTML = cartItems.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <img class="cart-item-img" src="${item.image_url}&auto=format&fit=crop&w=200" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100x100'">
      <div class="cart-item-info">
        <div class="cart-item-name"><a href="/product?id=${item.product_id}">${item.name}</a></div>
        ${item.badge ? `<span style="font-size:12px;color:var(--orange);font-weight:600">${item.badge}</span>` : ''}
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="cart-item-actions">
          <div class="qty-selector">
            <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity - 1})">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity + 1})">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeItem(${item.id})">Delete</button>
        </div>
      </div>
      <div style="font-size:18px;font-weight:700;color:var(--navy);white-space:nowrap">$${(item.price * item.quantity).toFixed(2)}</div>
    </div>`).join('');
  renderSummary();
}

function renderSummary() {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 25 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('summary-shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  document.getElementById('summary-tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
  document.getElementById('item-count').textContent = cartItems.reduce((s, i) => s + i.quantity, 0);
  updateCartCount();
}

async function changeQty(id, newQty) {
  if (newQty < 1) { removeItem(id); return; }
  try {
    await apiFetch(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity: newQty }) });
    const item = cartItems.find(i => i.id === id);
    if (item) { item.quantity = newQty; renderCart(); }
  } catch (e) { showToast(e.message, 'error'); }
}

async function removeItem(id) {
  try {
    await apiFetch(`/cart/${id}`, { method: 'DELETE' });
    cartItems = cartItems.filter(i => i.id !== id);
    if (cartItems.length === 0) { loadCart(); } else { renderCart(); }
    showToast('Item removed from cart');
  } catch (e) { showToast(e.message, 'error'); }
}

document.getElementById('checkout-btn')?.addEventListener('click', () => { location.href = '/checkout'; });

window.changeQty = changeQty;
window.removeItem = removeItem;
