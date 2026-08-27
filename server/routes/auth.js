const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, insert } = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const existing = get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hash = bcrypt.hashSync(password, 10);
  const id = insert('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
  const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, name, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required' });
  const user = get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, address: user.address } });
});

router.get('/profile', authMiddleware, (req, res) => {
  const user = get('SELECT id, name, email, address, created_at FROM users WHERE id = ?', [req.user.id]);
  res.json(user);
});

router.put('/profile', authMiddleware, (req, res) => {
  const { name, address } = req.body;
  const { run } = require('../db');
  run('UPDATE users SET name = ?, address = ? WHERE id = ?', [name, address, req.user.id]);
  res.json({ success: true });
});

module.exports = router;
