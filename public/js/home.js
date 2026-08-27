document.addEventListener('DOMContentLoaded', async () => {
  renderNav();
  loadCategories();
  loadFeatured();
  loadDeals();
});

async function loadCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  const cats = await apiFetch('/products/categories');
  grid.innerHTML = cats.map(c => `
    <div class="category-card" onclick="location.href='/search?category=${c.slug}'">
      <div class="icon">${c.icon}</div>
      <div class="name">${c.name}</div>
    </div>`).join('');
}

async function loadFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  grid.innerHTML = Array(8).fill('<div class="skeleton-card"><div class="skeleton skeleton-img"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text-sm"></div><div class="skeleton skeleton-price"></div></div>').join('');
  const data = await apiFetch('/products?featured=1&limit=8');
  grid.innerHTML = data.products.map(productCardHTML).join('');
}

async function loadDeals() {
  const grid = document.getElementById('deals-grid');
  if (!grid) return;
  const data = await apiFetch('/products/search?q=&min_price=0&max_price=200&limit=8');
  grid.innerHTML = data.products.map(productCardHTML).join('');
}

document.getElementById('hero-search-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const q = document.getElementById('hero-search-input').value.trim();
  if (q) location.href = `/search?q=${encodeURIComponent(q)}`;
});
