# 🍕 PizzaHub — Full-Stack Pizza Delivery Application

A full-stack food delivery web application built with a modern decoupled architecture: **Node.js + Express + MongoDB + Socket.IO** on the backend and **React 19 + Vite + Redux-Saga + Bootstrap** on the frontend.

Features a real-time pizza customizer, server-authoritative pricing engine, automated kitchen order state machine, anti-eavesdropping WebSocket order tracking, multi-tenant restaurant support, and an administrative analytics dashboard.

---

## 📂 Repository Layout

```
PizzaDelivery/
├── backend/                  # Express REST API, Socket.IO WebSockets & MongoDB ODM
│   ├── README.md             # Comprehensive Backend Documentation & API Guide
│   ├── controllers/          # Business logic & request controllers
│   ├── models/               # Mongoose schemas (Products, Carts, Orders, Users)
│   ├── routes/               # API route definitions (/api/...)
│   └── seed_data.js          # Database fixture seeding script
│
└── frontend/                 # React 19 single page application (SPA)
    ├── README.md             # Comprehensive Frontend Documentation & Component Guide
    ├── src/Pages/            # Customer & Admin pages (Shop, Customizer, Cart, Checkout)
    ├── src/Redux/            # Redux Toolkit & Redux-Saga state store
    └── src/Components/       # Reusable UI controls, Navbar, Footer, Admin Sidebar
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally on port 27017 or a MongoDB Atlas URI)

### 2. Launch the Backend
```bash
cd backend

# 1. Install dependencies
npm install

# 2. Setup environment variables (copy template)
cp .env.example .env

# 3. Seed initial database (Customizations, Categories, Products, FAQs)
node seed_data.js

# 4. Start backend server
npm run dev
```
Backend API will be live at `http://localhost:8000/api`.

### 3. Launch the Frontend
In a separate terminal window:
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Setup environment variables (copy template)
cp .env.example .env

# 3. Start Vite dev server
npm run dev
```
Frontend client will be live at `http://localhost:5173`.

---

## 🧪 Automated Testing

The backend includes a verified 90-check test suite covering all critical customer and administrative flows:

```bash
cd backend

# Run the complete test suite (90/90 Passing)
npm run test:all
```

- `npm run test:flow`: 32 checks covering cart pricing, anti-tampering, checkout, and Razorpay HMAC.
- `npm run test:socket`: 11 checks covering Socket.IO JWT auth, order room subscriptions, and anti-eavesdropping.
- `npm run test:extended`: 32 checks covering raw inventory, low-stock alerts, multi-tenant restaurants, and address books.
- `npm run test:audit`: 13 checks covering IDOR defenses, privilege escalation, and sensitive field sanitization.

To verify the frontend production build:
```bash
cd frontend
npm run build
```

---

## 📚 Detailed Documentation

- 🔗 **[Backend API & Real-Time Engine Documentation](./backend/README.md)**: Full API reference, security model, environment schema, and WebSocket architecture.
- 🔗 **[Frontend Application & Component Documentation](./frontend/README.md)**: Component tree, pizza customizer guide, Redux-Saga state flow, and build configuration.
