const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, '../public/product.html')));
app.get('/search', (req, res) => res.sendFile(path.join(__dirname, '../public/search.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, '../public/cart.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(__dirname, '../public/checkout.html')));
app.get('/orders', (req, res) => res.sendFile(path.join(__dirname, '../public/orders.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/login.html')));

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Amazon Clone running at http://localhost:${PORT}\n`);
  });
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
