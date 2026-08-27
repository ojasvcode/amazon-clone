const router = require('express').Router();
const { all, get, run, insert } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const items = all(
    `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.original_price, p.image_url, p.stock, p.rating, p.badge
     FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.user_id = ?`,
    [req.user.id]
  );
  res.json(items);
});

router.post('/', authMiddleware, (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id required' });
  const existing = get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
  if (existing) {
    run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
  } else {
    run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, quantity]);
  }
  res.json({ success: true });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  } else {
    run('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
  }
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, (req, res) => {
  run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

router.delete('/', authMiddleware, (req, res) => {
  run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
  res.json({ success: true });
});

module.exports = router;
