# PizzaHub Backend API & Real-Time Engine

Production-grade, secure Node.js & Express RESTful API powering the PizzaHub food delivery ecosystem. Includes real-time Socket.IO order tracking, server-authoritative pizza pricing, multi-tenant restaurant support, raw inventory tracking, and Razorpay payment verification.

---

## 🍕 Core Capabilities

- **Server-Authoritative Pricing Engine:** Custom pizza calculation (`helper/pricing.helper.js`) prevents client-side price tampering. Automatically enforces base prices, crust/sauce/cheese/veggie modifiers, and size multipliers (Regular 1.0x, Medium 1.4x, Large 1.8x).
- **Real-Time Order Lifecycle:** Socket.IO server with JWT handshake authentication, dedicated order rooms, strict anti-eavesdropping room isolation, and live status broadcasts (`Order Placed` ➔ `Accepted` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`).
- **Role-Based Access Control (RBAC):** Middleware for `Public`, `Buyer`, `Admin`, `SuperAdmin`, and `Restaurant` roles with strict `401 Unauthorized` vs `403 Forbidden` status separation.
- **Security Hardened:** Explicit field allowlists on profile updates, password hash sanitization on API outputs, Helmet HTTP protection headers, express-rate-limiters, and ObjectId serialization defense.
- **Cryptographic Payment Verification:** Razorpay order generation with HMAC-SHA256 signature verification and idempotent webhook processing.
- **Multi-Tenant Restaurants & Inventory:** Restaurant application onboarding lifecycle, product catalog isolation, raw ingredient inventory adjustment, and automated low-stock cron notifications.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v18+)
- **Web Framework:** Express 5 (`express`)
- **Database & ODM:** MongoDB (`mongoose` v9)
- **Real-Time WebSockets:** Socket.IO (`socket.io` v4)
- **Authentication & Security:** JWT (`jsonwebtoken`), Bcrypt (`bcrypt`), Helmet (`helmet`), Express Rate Limit (`express-rate-limit`)
- **Payments:** Razorpay Node SDK (`razorpay`) & HMAC crypto verification
- **File Uploads:** Multer (`multer`) with mime-type validation
- **Email Service:** Nodemailer (`nodemailer`)
- **Scheduled Tasks:** Node-Cron (`node-cron`)

---

## 📁 Directory Structure

```
backend/
├── config/
│   └── db-connect.js              # MongoDB connection & reconnection handler
├── controllers/                   # Request controllers & business logic
│   ├── auth.controller.js         # Login, signup, password resets
│   ├── cart.controller.js         # Server-validated cart operations
│   ├── checkout.controller.js     # Orders, state machine, Razorpay HMAC
│   ├── customization.controller.js# Crust, sauce, cheese, veggie options
│   ├── dashboard.controller.js    # Live MongoDB metrics aggregation
│   ├── inventory.controller.js    # Raw ingredients & stock adjustments
│   ├── restaurant.controller.js   # Multi-tenant onboarding & catalog
│   ├── user.controller.js         # User profiles, address book, email OTP
│   └── ...                        # Product, brand, categories, FAQs, etc.
├── helper/                        # Helper utilities
│   ├── mailer.helper.js           # Nodemailer transactional emails
│   └── pricing.helper.js          # Authoritative pizza price computer
├── middleware/                    # Express middleware
│   ├── auth.middleware.js         # JWT verification, RBAC, response sanitization
│   └── fileUploader.middleware.js # Multer disk storage & file filter
├── models/                        # Mongoose schemas & data models
│   ├── cart.model.js
│   ├── checkout.model.js
│   ├── customization.model.js
│   ├── product.model.js
│   ├── restaurant.model.js
│   ├── user.model.js
│   └── ...
├── public/uploads/                # Uploaded product and category media
├── routes/                        # Express API route endpoints
├── seed_data.js                   # Database seed script for dev & staging
├── server.js                      # Application entrypoint & HTTP server
├── index.js                       # Express app configuration & middleware
├── test_flow.js                   # Automated end-to-end order flow test suite
├── test_socket.js                 # Socket.IO real-time verification suite
├── test_inventory_restaurant.js   # Inventory, restaurant, and metrics test suite
└── test_security_audit.js         # Security, IDOR, and privilege escalation audit
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (v6 or higher running locally or MongoDB Atlas)

### 2. Environment Configuration
Copy `.env.example` to `.env` in the `backend/` directory:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
PORT=8000
NODE_ENV=development
DB_KEY=mongodb://127.0.0.1:27017/PizzaHub
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

JWT_SECRET_KEY=your_secure_random_jwt_secret_key_minimum_32_characters
JWT_PUBLIC_KEY=your_optional_jwt_public_key

# Payment Gateway (Optional for dev / test mode)
RPKEYID=rzp_test_your_key_id
RPSECRETKEY=your_razorpay_secret
RPWEBHOOKSECRET=your_webhook_secret

# SMTP Email (Optional for transactional emails)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
SITE_NAME=PizzaHub
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Development Database
Populates standard pizza bases, sauces, cheeses, toppings, categories, and test products:
```bash
node seed_data.js
```

### 5. Start the Server
```bash
# Production mode
npm start

# Development mode with auto-reload (nodemon)
npm run dev
```
The server will start at `http://localhost:8000`. API base URL: `http://localhost:8000/api`.

---

## 🧪 Automated Test Suites

The backend includes a comprehensive 90-test verification harness with 100% pass rate:

```bash
# Run all test suites in sequence (90/90 Checks)
npm run test:all

# Individual suites:
npm test                  # Native unit tests (Health probe & model co-existence)
npm run test:flow         # 32 Checks: Cart pricing, order lifecycle, Razorpay HMAC
npm run test:socket       # 11 Checks: Socket.IO handshake auth & anti-eavesdropping
npm run test:extended     # 32 Checks: Inventory cron, restaurant isolation, address book
npm run test:audit        # 13 Checks: IDOR defenses, privilege escalation, sanitization
```

---

## 📡 Key API Endpoints

### 🔐 Authentication & Profile
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/user/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/user` | Public | Register new customer account |
| `GET` | `/api/user/:_id` | Authenticated | Retrieve user profile (sanitized) |
| `PUT` | `/api/user/:_id` | Owner / Admin | Update profile (protected field allowlist) |
| `POST` | `/api/user/address` | Authenticated | Add address to address book |
| `GET` | `/api/user/address` | Authenticated | Retrieve customer's address book |
| `DELETE` | `/api/user/address/:index`| Authenticated | Remove address from address book |

### 🍕 Pizza Catalog & Customizations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/product` | Public | Get all active menu products |
| `GET` | `/api/product/:_id` | Public | Get single product details |
| `GET` | `/api/customization` | Public | Get pizza bases, sauces, cheeses & veggies |
| `POST` | `/api/customization/calculate-price` | Public | Authoritative server-side price preview |

### 🛒 Cart & Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/cart` | Authenticated | Add customized pizza to cart (validated price) |
| `GET` | `/api/cart/user/:user` | Owner / Admin | Retrieve user's active cart items |
| `PUT` | `/api/cart/:_id` | Owner / Admin | Update quantity or size (auto-recomputed) |
| `DELETE` | `/api/cart/:_id` | Owner / Admin | Remove item from cart |
| `POST` | `/api/checkout` | Authenticated | Convert active cart into order |
| `GET` | `/api/checkout/user/:user`| Owner / Admin | Retrieve user's order history |
| `POST` | `/api/checkout/order` | Authenticated | Generate Razorpay order ID |
| `POST` | `/api/checkout/verify-order` | Authenticated | Verify Razorpay HMAC signature |
| `PUT` | `/api/checkout/order-status/:_id` | Admin / Restaurant | Transition order status |

### 📊 Admin & Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Admin | Real-time revenue, order counts, and pipeline stats |
| `GET` | `/api/inventory` | Admin | Raw ingredient levels & stock adjustments |
| `POST` | `/api/restaurant/apply` | Authenticated | Submit restaurant onboarding application |
| `PUT` | `/api/restaurant/approve/:_id` | Admin | Approve restaurant & promote owner role |

---

## 🛡️ Security & Best Practices

1. **No Sensitive Field Leaks:** Passwords, reset tokens, and secrets are stripped prior to response transmission.
2. **Strict Field Allowlist:** Profile mutations reject administrative or protected fields (`role`, `status`, `_id`, password hash).
3. **Price Anti-Tampering:** Unit prices submitted by clients are discarded; authoritative values are re-computed directly from database models.
4. **Isolated WebSocket Rooms:** Customers only receive updates for their authenticated `order_<orderId>` room.
