document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  if (!getToken()) { location.href = '/login'; return; }
  const params = new URLSearchParams(location.search);
  if (params.get('success')) {
    showToast(`🎉 Order #${params.get('success')} placed successfully!`);
  }
  loadOrders();
});

async function loadOrders() {
  const container = document.getElementById('orders-container');
  try {
    const orders = await apiFetch('/orders');
    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="icon">📦</div><h3>No orders yet</h3><p>Once you place an order, it will appear here.</p><a href="/" class="btn btn-primary">Start Shopping</a></div>`;
      return;
    }
    for (const o of orders) {
      const detail = await apiFetch(`/orders/${o.id}`);
      const statusClass = o.status === 'Processing' ? 'status-processing' : o.status === 'Shipped' ? 'status-shipped' : 'status-delivered';
      container.innerHTML += `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div style="font-size:12px;color:var(--gray-400);margin-bottom:2px">ORDER PLACED</div>
              <div style="font-weight:600">${new Date(o.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:12px;color:var(--gray-400);margin-bottom:2px">TOTAL</div>
              <div style="font-weight:700;font-size:17px">$${o.total.toFixed(2)}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:12px;color:var(--gray-400);margin-bottom:4px">ORDER #${o.id}</div>
              <span class="order-status ${statusClass}">${o.status}</span>
            </div>
          </div>
          <div class="order-items-list">
            ${detail.items.map(i => `
              <div class="order-item-thumb" onclick="location.href='/product?id=${i.product_id}'" style="cursor:pointer">
                <img src="${i.image_url}&w=120" alt="${i.name}" onerror="this.src='https://via.placeholder.com/60'">
                <div class="info">
                  <div class="name">${i.name.substring(0, 40)}${i.name.length > 40 ? '...' : ''}</div>
                  <div class="qty">Qty: ${i.quantity} · $${i.price.toFixed(2)} each</div>
                </div>
              </div>`).join('')}
          </div>
          <div style="margin-top:12px;display:flex;gap:10px">
            <a href="/" style="background:var(--orange);color:var(--navy);padding:8px 18px;border-radius:6px;font-weight:600;font-size:13px">Buy Again</a>
          </div>
        </div>`;
    }
  } catch (e) { showToast(e.message, 'error'); }
}
