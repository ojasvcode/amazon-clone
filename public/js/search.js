document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  const params = new URLSearchParams(location.search);
  currentQuery = params.get('q') || '';
  currentCategory = params.get('category') || '';
  if (currentQuery) document.getElementById('search-input').value = currentQuery;
  loadCategories();
  doSearch();
});

let currentQuery = '', currentCategory = '', currentPage = 1;

async function loadCategories() {
  const sel = document.getElementById('filter-category');
  const cats = await apiFetch('/products/categories');
  sel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c.slug}" ${c.slug === currentCategory ? 'selected' : ''}>${c.name}</option>`).join('');
}

async function doSearch() {
  const grid = document.getElementById('results-grid');
  const meta = document.getElementById('search-meta');
  const q = document.getElementById('search-input').value.trim();
  const category = document.getElementById('filter-category').value;
  const minPrice = document.getElementById('filter-min').value || 0;
  const maxPrice = document.getElementById('filter-max').value || 9999;
  const rating = document.getElementById('filter-rating').value || 0;

  grid.innerHTML = Array(8).fill('<div class="skeleton-card"><div class="skeleton skeleton-img"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-price"></div></div>').join('');

  const url = `/products/search?q=${encodeURIComponent(q)}&category=${category}&min_price=${minPrice}&max_price=${maxPrice}&rating=${rating}`;
  const data = await apiFetch(url);
  meta.innerHTML = `Showing <strong>${data.products.length}</strong> results${q ? ` for "<strong>${q}</strong>"` : ''}`;
  grid.innerHTML = data.products.length ? data.products.map(productCardHTML).join('') : `<div class="empty-state" style="grid-column:1/-1"><div class="icon">🔍</div><h3>No results found</h3><p>Try different keywords or filters.</p></div>`;
}

document.getElementById('search-form')?.addEventListener('submit', e => { e.preventDefault(); doSearch(); });
document.getElementById('filter-category')?.addEventListener('change', doSearch);
document.getElementById('filter-rating')?.addEventListener('change', doSearch);
document.getElementById('apply-price')?.addEventListener('click', doSearch);
document.getElementById('filter-max')?.addEventListener('input', e => { document.getElementById('price-display').textContent = `$0 – $${e.target.value}`; });
