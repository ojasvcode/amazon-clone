const router = require('express').Router();
const { all, get, run, insert } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Address required' });

  const cartItems = all(
    `SELECT ci.quantity, p.id as product_id, p.price, p.stock
     FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.user_id = ?`,
    [req.user.id]
  );
  if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const orderId = insert('INSERT INTO orders (user_id, total, address, status) VALUES (?, ?, ?, ?)', [req.user.id, total, address, 'Processing']);

  cartItems.forEach(item => {
    run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.product_id, item.quantity, item.price]);
    run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
  });

  run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
  res.json({ success: true, orderId, total });
});

router.get('/', authMiddleware, (req, res) => {
  const orders = all(
    `SELECT o.*, COUNT(oi.id) as item_count FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ? GROUP BY o.id ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json(orders);
});

router.get('/:id', authMiddleware, (req, res) => {
  const order = get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = all(
    `SELECT oi.quantity, oi.price, p.name, p.image_url, p.id as product_id
     FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
    [order.id]
  );
  res.json({ order, items });
});

module.exports = router;
