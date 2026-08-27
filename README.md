# 🛒 Amazon Clone

A full-stack Amazon-inspired e-commerce web application built with **Node.js**, **Express**, and **SQLite** — featuring user authentication, product browsing, cart management, and order placement.

---

## 📸 Preview

> Browse products across 6 categories, add to cart, and checkout — all in a clean Amazon-style UI.

---

## ✨ Features

- 🔐 **User Authentication** — Register & login with JWT-based sessions, passwords hashed with bcrypt
- 🏠 **Home Page** — Featured products and category browsing
- 🔍 **Search** — Search products by name/description
- 📦 **Product Pages** — Detailed product view with ratings, pricing, and stock info
- 🛒 **Cart** — Add/remove items, update quantities, persistent per user
- 💳 **Checkout** — Place orders with delivery address
- 📋 **Orders** — View order history and status
- 🗄️ **SQLite Database** — Persistent storage via `sql.js` with 28 seeded products across 6 categories

---

## 🗂️ Project Structure

```
amazon-clone/
├── public/               # Frontend (HTML, CSS, JS)
│   ├── index.html        # Home page
│   ├── product.html      # Product detail page
│   ├── search.html       # Search results page
│   ├── cart.html         # Shopping cart
│   ├── checkout.html     # Checkout page
│   ├── orders.html       # Order history
│   ├── login.html        # Login / Register
│   ├── css/              # Stylesheets
│   └── js/               # Client-side scripts
├── server/
│   ├── index.js          # Express app entry point
│   ├── db.js             # SQLite database setup & seed data
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   └── routes/
│       ├── auth.js       # /api/auth — register, login
│       ├── products.js   # /api/products — browse, search, detail
│       ├── cart.js       # /api/cart — add, remove, update
│       └── orders.js     # /api/orders — place order, history
├── data/
│   └── shop.db           # SQLite database file (auto-created)
├── package.json
└── screenshot.js         # Puppeteer screenshot utility
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js |
| **Database** | SQLite via `sql.js` |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **Dev Tools** | Puppeteer (screenshots) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ojasvcode/amazon-clone.git
cd amazon-clone

# Install dependencies
npm install
```

### Run the App

```bash
npm start
```

The app will be available at **http://localhost:3000**

> The SQLite database is automatically initialized and seeded with **28 products** across **6 categories** on first run.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT token |
| `GET` | `/api/auth/me` | Get current user profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get all products (with optional `?category=` filter) |
| `GET` | `/api/products/featured` | Get featured products |
| `GET` | `/api/products/search?q=` | Search products by name/description |
| `GET` | `/api/products/:id` | Get a single product by ID |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Get current user's cart |
| `POST` | `/api/cart` | Add item to cart |
| `PUT` | `/api/cart/:productId` | Update item quantity |
| `DELETE` | `/api/cart/:productId` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | Get current user's order history |
| `POST` | `/api/orders` | Place a new order from cart |

---

## 🗃️ Database Schema

```
users         — id, name, email, password_hash, address, created_at
categories    — id, name, icon, slug
products      — id, name, description, price, original_price, category_id, rating, review_count, stock, image_url, badge, featured
cart_items    — id, user_id, product_id, quantity
orders        — id, user_id, total, status, address, created_at
order_items   — id, order_id, product_id, quantity, price
```

---

## 📦 Seeded Categories & Products

| Category | Products |
|---|---|
| 💻 Electronics | MacBook Pro, Samsung Galaxy S24 Ultra, Sony Headphones, iPad Pro, LG Monitor, MX Master Mouse, Nintendo Switch, Echo Dot |
| 📚 Books | Atomic Habits, Psychology of Money, Deep Work, Sapiens |
| 👗 Clothing | Nike Air Max, Levi's 501, Patagonia Jacket, Adidas Ultraboost |
| 🏠 Home & Kitchen | Instant Pot, Ninja Air Fryer, Dyson Vacuum, Breville Espresso |
| ⚽ Sports | Bowflex Dumbbells, Fitbit Charge 6, Hydro Flask, Yoga Mat |
| 💄 Beauty | Dyson Airwrap, CeraVe Cream, Charlotte Tilbury Lipstick, Tatcha Cream |

---

## 📄 License

This project is for educational purposes only. All product names and images are used for demonstration and belong to their respective owners.

---

<div align="center">Made with ❤️ by <a href="https://github.com/ojasvcode">ojasvcode</a></div>
