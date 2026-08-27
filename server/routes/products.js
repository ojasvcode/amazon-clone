const router = require('express').Router();
const { all, get } = require('../db');

router.get('/', (req, res) => {
  const { category, page = 1, limit = 20, featured } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let query = `SELECT p.*, c.name as category_name, c.slug as category_slug
               FROM products p JOIN categories c ON c.id = p.category_id WHERE 1=1`;
  const params = [];
  if (category) { query += ' AND c.slug = ?'; params.push(category); }
  if (featured === '1') { query += ' AND p.featured = 1'; }
  query += ' ORDER BY p.featured DESC, p.review_count DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  const products = all(query, params);
  res.json({ products, total: products.length, page: parseInt(page) });
});

router.get('/search', (req, res) => {
  const { q = '', category, min_price, max_price, rating, limit = 20 } = req.query;
  let query = `SELECT p.*, c.name as category_name, c.slug as category_slug
               FROM products p JOIN categories c ON c.id = p.category_id WHERE 1=1`;
  const params = [];
  if (q) { query += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  if (category) { query += ' AND c.slug = ?'; params.push(category); }
  if (min_price) { query += ' AND p.price >= ?'; params.push(parseFloat(min_price)); }
  if (max_price) { query += ' AND p.price <= ?'; params.push(parseFloat(max_price)); }
  if (rating) { query += ' AND p.rating >= ?'; params.push(parseFloat(rating)); }
  query += ' ORDER BY p.review_count DESC LIMIT ?';
  params.push(parseInt(limit));
  const products = all(query, params);
  res.json({ products, query: q });
});

router.get('/categories', (req, res) => {
  res.json(all('SELECT * FROM categories'));
});

router.get('/:id', (req, res) => {
  const product = get(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
    [req.params.id]
  );
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const related = all(
    `SELECT p.*, c.name as category_name FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.category_id = ? AND p.id != ? LIMIT 6`,
    [product.category_id, product.id]
  );
  res.json({ product, related });
});

module.exports = router;
