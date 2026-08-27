const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/shop.db');
const DATA_DIR = path.join(__dirname, '../data');

let db = null;

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function getDB() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

// Helper to run a statement that returns no rows
function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

// Helper to get all rows
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper to get one row
function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

// Helper for INSERT that returns lastInsertRowid
function insert(sql, params = []) {
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid() as id');
  saveDB();
  return result[0]?.values[0][0];
}

async function initDB() {
  await getDB();

  db.run(`PRAGMA foreign_keys = ON`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL NOT NULL,
    category_id INTEGER NOT NULL,
    rating REAL DEFAULT 4.0,
    review_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 100,
    image_url TEXT NOT NULL,
    badge TEXT DEFAULT '',
    featured INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, product_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'Processing',
    address TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  )`);

  saveDB();

  // Seed if empty
  const catCount = get('SELECT COUNT(*) as c FROM categories');
  if (!catCount || catCount.c === 0) {
    seedData();
  }

  console.log('✅ Database initialized');
}

function seedData() {
  const cats = [
    ['Electronics', '💻', 'electronics'],
    ['Books', '📚', 'books'],
    ['Clothing', '👗', 'clothing'],
    ['Home & Kitchen', '🏠', 'home-kitchen'],
    ['Sports', '⚽', 'sports'],
    ['Beauty', '💄', 'beauty'],
  ];
  cats.forEach(([name, icon, slug]) => {
    db.run('INSERT INTO categories (name, icon, slug) VALUES (?, ?, ?)', [name, icon, slug]);
  });

  const products = [
    // Electronics (1)
    ['Apple MacBook Pro 14" M3 Pro', 'The most powerful MacBook Pro. M3 Pro chip, 18GB unified memory, Liquid Retina XDR display, 18-hour battery.', 1999.99, 2199.99, 1, 4.8, 3241, 45, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 'Best Seller', 1],
    ['Samsung Galaxy S24 Ultra', 'Ultimate AI smartphone. 200MP camera, built-in S Pen, titanium frame, 6.8" Dynamic AMOLED 2X, 5000mAh battery.', 1199.99, 1299.99, 1, 4.7, 5621, 78, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600', 'Deal', 1],
    ['Sony WH-1000XM5 Headphones', 'Industry-leading noise canceling with 8 microphones. 30-hour battery, hands-free calling, Crystal clear audio.', 279.99, 349.99, 1, 4.9, 8934, 120, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'Best Seller', 1],
    ['iPad Pro 11" M4', 'Thinnest Apple product ever. Ultra Retina XDR display, Apple Pencil Pro support, M4 chip, all-day battery.', 999.99, 1099.99, 1, 4.8, 2341, 60, 'https://images.unsplash.com/photo-1585790831882-59f3c1e33a5a?w=600', '', 1],
    ['LG 27" 4K OLED Monitor', '27-inch UltraFine OLED, 4K, 120Hz, VESA DisplayHDR 400, USB-C. Perfect for professionals and creators.', 699.99, 799.99, 1, 4.6, 1876, 35, 'https://images.unsplash.com/photo-1527443224154-c4a573d65e27?w=600', 'Deal', 0],
    ['Logitech MX Master 3S Mouse', 'Advanced wireless mouse, ultra-fast MagSpeed scrolling, 8K DPI sensor, ergonomic. Mac & Windows compatible.', 99.99, 129.99, 1, 4.7, 4521, 200, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', '', 0],
    ['Nintendo Switch OLED', 'Play at home or on-the-go. 7-inch OLED screen, enhanced audio, 64GB storage, wide adjustable stand.', 349.99, 349.99, 1, 4.8, 9821, 55, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600', 'Hot', 1],
    ['Amazon Echo Dot 5th Gen', 'Smart speaker with Alexa. Improved audio, temperature sensor, eero Wi-Fi. Control your smart home with voice.', 49.99, 54.99, 1, 4.5, 12453, 300, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600', 'Best Seller', 0],
    // Books (2)
    ['Atomic Habits by James Clear', 'The life-changing million copy bestseller. Tiny Changes, Remarkable Results. Build Good Habits & Break Bad Ones.', 14.99, 27.00, 2, 4.9, 45231, 500, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', 'Best Seller', 1],
    ['The Psychology of Money', 'Timeless lessons on wealth, greed, and happiness. 19 stories on the strange ways people think about money.', 12.99, 18.00, 2, 4.8, 32100, 400, 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600', '', 1],
    ['Deep Work by Cal Newport', 'Rules for Focused Success in a Distracted World. The superpower of the 21st century.', 13.99, 22.00, 2, 4.7, 18900, 350, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', '', 0],
    ['Sapiens: A Brief History', 'A landmark work exploring what made humans the most successful species on Earth.', 16.99, 26.00, 2, 4.8, 67800, 600, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600', 'Best Seller', 1],
    // Clothing (3)
    ['Nike Air Max 270 Sneakers', 'Iconic Air Max cushioning, large heel Air unit, breathable mesh upper. All-day comfort in multiple colors.', 129.99, 149.99, 3, 4.6, 8732, 150, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'Hot', 1],
    ["Levi's 501 Original Jeans", 'The original straight leg jean since 1873. Button fly, authentic denim, versatile styling.', 59.99, 79.99, 3, 4.5, 15432, 200, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 'Best Seller', 0],
    ['Patagonia Nano Puff Jacket', 'Ultralight, windproof, water-resistant. 60g PrimaLoft Gold Insulation, packable into its own pocket.', 229.99, 279.99, 3, 4.8, 4321, 80, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', '', 1],
    ['Adidas Ultraboost 22', 'Running shoes with BOOST midsole, Primeknit+ upper, Continental rubber outsole. Every stride powered.', 149.99, 189.99, 3, 4.7, 9876, 100, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600', 'Deal', 1],
    // Home & Kitchen (4)
    ['Instant Pot Duo 7-in-1', 'Replace 7 kitchen appliances. Pressure cooker, slow cooker, rice cooker, steamer, sauté pan and more. 6 quart.', 79.99, 99.99, 4, 4.7, 28900, 180, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', 'Best Seller', 1],
    ['Ninja Air Fryer Pro 4-in-1', 'Air fry, roast, reheat, dehydrate. 5-quart ceramic basket, dishwasher-safe. 75% less fat than deep frying.', 119.99, 149.99, 4, 4.6, 15200, 120, 'https://images.unsplash.com/photo-1593759608142-e976b3062b25?w=600', 'Deal', 1],
    ['Dyson V15 Detect Vacuum', 'Laser detects invisible dust. 60 min run time, HEPA filtration, LCD screen shows real-time results.', 649.99, 749.99, 4, 4.8, 6780, 45, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'Best Seller', 1],
    ['Breville Barista Express', 'Grind, dose, tamp, extract — all-in-one espresso machine. Integrated grinder, 15 bar Italian pump.', 699.99, 799.99, 4, 4.7, 4321, 30, 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=600', '', 0],
    // Sports (5)
    ['Bowflex SelectTech Dumbbells', 'Replace 15 sets of weights. Adjusts from 5 to 52.5 lbs in 2.5 lb increments. Space-saving design.', 329.99, 399.99, 5, 4.7, 12300, 40, 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600', 'Best Seller', 1],
    ['Fitbit Charge 6', 'Advanced fitness tracker. Built-in GPS, 7-day battery, heart rate, sleep tracking, stress management.', 159.99, 179.99, 5, 4.5, 9421, 150, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600', 'Hot', 1],
    ['Hydro Flask 32oz Water Bottle', 'Double wall vacuum insulation. Cold 24h, hot 12h. Stainless steel, BPA-free, leakproof lid.', 44.95, 52.95, 5, 4.8, 23400, 300, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', '', 0],
    ['Peloton Yoga Mat', 'Extra thick 6mm non-slip mat with alignment lines. Sweat-resistant, latex-free, carrying strap included.', 44.99, 59.99, 5, 4.6, 7834, 250, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', '', 0],
    // Beauty (6)
    ['Dyson Airwrap Styler', 'Complete styling set for multiple hair types. Curl, wave, smooth, and dry with no extreme heat. 6 attachments.', 599.99, 649.99, 6, 4.7, 8921, 35, 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600', 'Hot', 1],
    ['CeraVe Moisturizing Cream', '3 essential ceramides, hyaluronic acid, MVE technology for 24-hour hydration. Dermatologist developed.', 16.99, 19.99, 6, 4.8, 34200, 400, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', 'Best Seller', 1],
    ['Charlotte Tilbury Pillow Talk Lipstick', "World's #1 selling lipstick shade. Universal rose-pink nude, peachy shimmer, Matte Revolution finish.", 34.99, 37.00, 6, 4.7, 12300, 120, 'https://images.unsplash.com/photo-1586495777744-4e6232bf5e39?w=600', 'Best Seller', 0],
    ['Tatcha The Water Cream', 'Poreless, lightweight water cream with japanese wild rose, reishi mushroom, red algae. Oil-free formula.', 69.99, 79.00, 6, 4.5, 7800, 100, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', 'Deal', 0],
  ];

  products.forEach(p => {
    db.run(
      'INSERT INTO products (name,description,price,original_price,category_id,rating,review_count,stock,image_url,badge,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      p
    );
  });

  saveDB();
  console.log(`✅ Seeded ${products.length} products across ${cats.length} categories`);
}

module.exports = { getDB, initDB, run, all, get, insert };
