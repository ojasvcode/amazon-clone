document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  if (!getToken()) { location.href = '/login'; return; }
  loadCheckout();
});

async function loadCheckout() {
  try {
    const [items, user] = await Promise.all([apiFetch('/cart'), apiFetch('/auth/profile')]);
    if (items.length === 0) { location.href = '/cart'; return; }
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal > 25 ? 0 : 4.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.getElementById('order-items').innerHTML = items.map(i => `
      <div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100)">
        <img src="${i.image_url}&w=80" style="width:60px;height:60px;object-fit:contain;background:var(--gray-50);border-radius:6px" onerror="this.src='https://via.placeholder.com/60'">
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${i.name}</div><div style="font-size:12px;color:var(--gray-600)">Qty: ${i.quantity}</div></div>
        <div style="font-weight:700">$${(i.price * i.quantity).toFixed(2)}</div>
      </div>`).join('');

    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('checkout-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;

    if (user.address) document.getElementById('address').value = user.address;
  } catch (e) { showToast(e.message, 'error'); }
}

document.getElementById('checkout-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true; btn.textContent = 'Placing order...';
  const address = [
    document.getElementById('address').value,
    document.getElementById('city').value,
    document.getElementById('state').value,
    document.getElementById('zip').value,
  ].filter(Boolean).join(', ');

  try {
    const { orderId } = await apiFetch('/orders', { method: 'POST', body: JSON.stringify({ address }) });
    location.href = `/orders?success=${orderId}`;
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false; btn.textContent = 'Place Order';
  }
});
