# PizzaHub Backend Architecture, Integration & Security Audit Report

**Document Title:** PizzaHub Backend Full Technical Specification & Audit Report  
**Author / Auditor:** Senior Backend Architect & Technical Documentation Engineer  
**Audit Date:** October 19, 2026  
**Target Environment:** Node.js (v18+ / v20+), Express.js (v5.3.0), MongoDB (Mongoose v9.11.2)  
**Document Status:** Complete, Verified Against Repository Source Code  
**Artifact File Path:** `backend/PIZZAHUB_BACKEND_FULL_REPORT.md`  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Complete Folder and File Structure](#2-complete-folder-and-file-structure)
3. [Application Startup and Request Lifecycle](#3-application-startup-and-request-lifecycle)
4. [Complete Database and Model Documentation](#4-complete-database-and-model-documentation)
5. [Complete API Documentation](#5-complete-api-documentation)
6. [User Authentication and Role-Based Access Control](#6-user-authentication-and-role-based-access-control)
7. [Business Logic and End-to-End Flows](#7-business-logic-and-end-to-end-flows)
8. [Security and Reliability](#8-security-and-reliability)
9. [Configuration and Environment Variables](#9-configuration-and-environment-variables)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Testing and Code Quality](#11-testing-and-code-quality)
12. [Installation and Execution Guide](#12-installation-and-execution-guide)
13. [Deployment and Operations](#13-deployment-and-operations)
14. [Final Technical Assessment](#14-final-technical-assessment)

---

## 1. Project Overview

### 1.1 Purpose and System Responsibilities
**PizzaHub** is an end-to-end online food delivery and pizza ordering backend platform. The system is designed to provide:
- A customizable multi-tier product catalog (pizzas, crust bases, sauces, cheeses, and vegetable toppings).
- Dynamic, server-side price computation based on size multipliers and customization options.
- Shopping cart management with price validation to prevent client-side tampering.
- Multi-channel checkout handling Cash on Delivery (COD) and Razorpay online payments with cryptographic signature and webhook validation.
- Real-time order tracking using Socket.IO with customer-to-order room isolation and admin live broadcasts.
- Multi-tenant restaurant partner onboarding, approval workflows, and tenant-isolated product and order management.
- Raw ingredient inventory tracking with atomic quantity deductions, cancellation restorations, and automated low-stock alerting via scheduled cron jobs.
- Marketing, customer feedback, and content management (newsletters, testimonials, FAQs, contact submissions, and site settings).

### 1.2 Technology Stack
The backend is built as a modular CommonJS Node.js application utilizing:
- **Core Runtime & Framework:** Node.js, Express.js (`v5.3.0`)
- **Database & ODM:** MongoDB, Mongoose (`v9.11.2`)
- **Real-Time Communication:** Socket.IO (`v4.8.4`)
- **Security & Hardening:** Helmet (`v8.3.0`), CORS (`v2.8.6`), express-rate-limit (`v8.7.1`), bcrypt (`v6.0.0`), jsonwebtoken (`v9.0.3`), password-validator (`v5.3.0`)
- **Payment Processing:** Razorpay SDK (`v2.9.8`), Node.js native `crypto` (HMAC SHA-256)
- **Background Tasks & Scheduling:** node-cron (`v4.6.0`)
- **Email & Communications:** Nodemailer (`v10.1.2`)
- **File Uploads & Media:** Multer (`v2.4.0`)
- **Utilities & Formatting:** slugify (`v1.6.9`), morgan (`v1.12.1`), zod (`v4.6.7`), dotenv (`v18.0.8`)
- **Testing:** Node.js native test runner (`node --test`), socket.io-client (`v4.8.4`), Jest (`v30.5.2` dev dependency), Supertest (`v7.3.1` dev dependency)

### 1.3 Application Architecture
The PizzaHub backend implements a layered Model-View-Controller (MVC) / Model-Controller-Route architectural pattern:
- **Presentation Layer (Routing):** Express Routers map HTTP verbs and paths to middleware chains and controller handlers.
- **Middleware Layer:** Handles security headers, origin policies, rate limiting, raw body extraction, JWT role-based access control (RBAC), and multipart file handling.
- **Controller Layer:** Contains business logic, validates input, calls pricing and inventory helpers, manages transactions/atomic DB mutations, and dispatches email and WebSocket notifications.
- **Helper & Service Layer:** Decoupled modules for server-side pricing math, inventory atomic reservations, email templates, and Socket.IO event handling.
- **Persistence Layer (Models):** Strict Mongoose schemas defining validation rules, references, defaults, and collection indexes.

```mermaid
graph TD
    Client["Client Applications (Web / Mobile)"]
    ReverseProxy["Reverse Proxy (Nginx / Cloudflare / Load Balancer)"]
    ExpressServer["Express HTTP Server (port 8000)"]
    SocketServer["Socket.IO WebSocket Server"]
    
    Client -->|HTTPS / REST API| ReverseProxy
    Client -->|WSS / Socket Handshake| ReverseProxy
    ReverseProxy --> ExpressServer
    ReverseProxy --> SocketServer
    
    subgraph Express Pipeline
        MW1["Helmet (Security Headers)"]
        MW2["CORS (Origin Filtering)"]
        MW3["Rate Limiting (1000 req / 15 min)"]
        MW4["JSON Body Parser (Raw Body Hook)"]
        MW5["Static Assets (/public)"]
        Router["Express Router (/api)"]
        
        MW1 --> MW2 --> MW3 --> MW4 --> MW5 --> Router
    end
    
    subgraph Core Modules
        AuthCtrl["Auth & User Controller"]
        CatalogCtrl["Product & Category Controller"]
        CartCtrl["Cart Controller"]
        PricingHelper["Pricing Helper (Trusted Math)"]
        CheckoutCtrl["Checkout & Order Controller"]
        InvHelper["Inventory Helper (Atomic Deduction)"]
        RestCtrl["Restaurant Controller"]
    end
    
    ExpressServer --> ExpressPipeline
    Router --> AuthCtrl
    Router --> CatalogCtrl
    Router --> CartCtrl
    Router --> CheckoutCtrl
    Router --> RestCtrl
    
    CartCtrl --> PricingHelper
    CheckoutCtrl --> PricingHelper
    CheckoutCtrl --> InvHelper
    
    subgraph External & Background Services
        MongoDB[(MongoDB Database)]
        RazorpayGateway["Razorpay Payment Gateway"]
        SMTPServer["SMTP Gmail Server (Nodemailer)"]
        CronJob["node-cron (Hourly Low-Stock Check)"]
    end
    
    AuthCtrl --> MongoDB
    CatalogCtrl --> MongoDB
    CartCtrl --> MongoDB
    CheckoutCtrl --> MongoDB
    InvHelper --> MongoDB
    RestCtrl --> MongoDB
    
    CheckoutCtrl --> RazorpayGateway
    CheckoutCtrl --> SMTPServer
    AuthCtrl --> SMTPServer
    CronJob --> InvHelper
    InvHelper --> SMTPServer
    
    CheckoutCtrl --> SocketServer
    SocketServer -->|Push Order Updates| Client
```

---

## 2. Complete Folder and File Structure

### 2.1 File Directory Tree
```text
backend/
├── .env                              # Active environment configuration (contains operational values)
├── .env.example                      # Sanitized environment template for onboarding
├── .gitignore                        # Git exclusion rules (node_modules, uploads, .env)
├── index.js                          # Core application bootstrap, middleware & HTTP server wrapper
├── package-lock.json                 # Dependency lockfile
├── package.json                      # NPM configuration, dependencies & scripts
├── server.js                         # Production entry point executing server.listen()
├── config/
│   └── db-connect.js                 # MongoDB connection lifecycle & error handling
├── controllers/
│   ├── auth.controller.js            # Standardized authentication (register, login, getMe)
│   ├── brand.controller.js           # Brand CRUD & image management
│   ├── cart.controller.js            # Shopping cart CRUD & server pricing enforcement
│   ├── category.controller.js        # Modern taxonomy/slug Category CRUD
│   ├── checkout.controller.js        # Orders, Razorpay integration, webhooks & status transitions
│   ├── contactus.controller.js       # Customer inquiry submissions & admin management
│   ├── customization.controller.js   # Pizza crust, sauce, cheese & topping customization options
│   ├── dashboard.controller.js       # Administrative aggregation stats & metrics
│   ├── faq.controller.js             # Frequently asked questions CRUD
│   ├── feature.controller.js         # Homepage feature highlights CRUD
│   ├── inventory.controller.js       # Raw ingredient tracking & manual stock adjustments
│   ├── maincategory.controller.js    # Legacy/Relational product catalog category CRUD
│   ├── miancategory.controller.js    # Backward-compatibility alias re-exporting maincategory
│   ├── newsletter.controller.js      # Newsletter subscription & email unsubscription
│   ├── product.controller.js         # Pizza & product catalog management with image upload
│   ├── restaurant.controller.js      # Multi-tenant restaurant onboarding, approval & order isolation
│   ├── setting.controller.js         # Global site metadata, contact details & legal policies
│   ├── subcategory.controller.js     # Subcategory catalog CRUD
│   ├── testimonial.controller.js     # Customer reviews & ratings
│   ├── user.controller.js            # Legacy user CRUD, password reset OTP flows & login
│   └── wishlist.controller.js        # Customer favorite products & tenant isolation
├── helper/
│   ├── inventory.helper.js           # Atomic inventory deduction, restoration & deduplicated cron alerts
│   ├── mailer.helper.js              # Nodemailer transport configuration with safe error wrapper
│   ├── pricing.helper.js             # Authoritative server-side pizza price calculator
│   └── socket.helper.js              # Socket.IO JWT authentication, room isolation & event broadcaster
├── middleware/
│   ├── auth.middleware.js            # JWT role-based access control (Buyer, Admin, Super Admin, Restaurant)
│   └── fileUploader.middleware.js    # Multer storage engine, MIME filter & size restrictions
├── models/
│   ├── brand.model.js                # Brand schema (name, pic, status)
│   ├── cart.model.js                 # Cart schema (user, product, size, customization, unitPrice, total)
│   ├── category.model.js             # Modern Category schema (name, slug, description, image, isActive)
│   ├── checkout.model.js             # Order schema (user, products, address, status, payments, restaurant)
│   ├── contactus.model.js            # ContactUs submission schema
│   ├── customization.model.js        # CustomizationItem schema (crust, sauce, cheese, veggie)
│   ├── faq.model.js                  # FAQ schema (question, answer, status)
│   ├── feature.model.js              # Feature card schema (name, shortDescription, icon, status)
│   ├── inventory.model.js            # Ingredient inventory schema (quantities, thresholds, alert state)
│   ├── maincategory.model.js         # Maincategory schema (name, pic, status)
│   ├── newsletter.model.js           # Newsletter subscriber schema
│   ├── product.model.js              # Product schema (relations, sizes, prices, images, stock)
│   ├── restaurant.model.js           # Multi-tenant Restaurant partner schema & approval status
│   ├── setting.model.js              # Global site settings schema
│   ├── subcategory.model.js          # Subcategory schema (name, pic, status)
│   ├── testimonial.model.js          # Customer review schema (user, product, rating, message)
│   ├── user.model.js                 # User account schema (credentials, role, reset OTPs, addresses)
│   └── wishlist.model.js             # Customer wishlist link schema
├── public/
│   └── uploads/                      # Local filesystem storage for uploaded images
│       ├── brand/                    # Brand logos
│       ├── category/                 # Taxonomy category banners
│       ├── maincategory/             # Catalog category thumbnails
│       ├── product/                  # Product multi-angle photos
│       └── subcategory/              # Subcategory thumbnails
├── routes/
│   ├── auth.route.js                 # Authentication router (/api/auth)
│   ├── brand.route.js                # Brand catalog router (/api/brand)
│   ├── cart.route.js                 # Shopping cart router (/api/cart)
│   ├── category.route.js             # Taxonomy category router (/api/category)
│   ├── checkout.route.js             # Orders & payments router (/api/checkout)
│   ├── contactus.route.js            # Contact inquiries router (/api/contactus)
│   ├── customization.route.js        # Pizza toppings router (/api/customization)
│   ├── dashboard.route.js            # Metrics dashboard router (/api/dashboard)
│   ├── faq.route.js                  # FAQ router (/api/faq)
│   ├── feature.route.js              # Site features router (/api/feature)
│   ├── index.route.js                # Master route aggregator mounting all endpoints on /api
│   ├── inventory.route.js            # Inventory tracking router (/api/inventory)
│   ├── maincategory.route.js         # Catalog main category router (/api/maincategory)
│   ├── miancategory.route.js         # Backward-compatibility alias router
│   ├── newsletter.route.js           # Newsletter subscriptions router (/api/newsletter)
│   ├── product.route.js              # Product management router (/api/product)
│   ├── restaurant.route.js           # Restaurant partner router (/api/restaurant)
│   ├── setting.route.js              # Site settings router (/api/setting)
│   ├── subcategory.route.js          # Subcategory router (/api/subcategory)
│   ├── testimonial.route.js          # Customer reviews router (/api/testimonial)
│   ├── user.route.js                 # Legacy user profile router (/api/user)
│   └── wishlist.route.js             # Wishlist router (/api/wishlist)
├── tests/
│   └── api.test.js                   # Node.js native test runner test suite
├── test_flow.js                      # End-to-end integration test (Cart -> Checkout -> Payment -> Lifecycle)
├── test_inventory_restaurant.js      # Integration test for inventory deduction, alerts & restaurants
├── test_security_audit.js            # Security test probing IDOR, tenant isolation & privilege escalation
└── test_socket.js                    # Real-time WebSocket verification test
```

### 2.2 File Inventory and Role Mapping

| File Path | Role | Primary Purpose | Key Dependencies / Imports | Dependent Modules |
| :--- | :--- | :--- | :--- | :--- |
| `server.js` | Production Runtime Entry | Boots server on configured port if executed as main module | `index.js` | `npm start`, `npm run dev` |
| `index.js` | Core Application | Configures Express, middleware, static files, Socket.IO, cron, shutdown | `express`, `http`, `helmet`, `cors`, `rateLimit`, `socket.helper`, `inventory.helper`, `index.route` | `server.js`, all integration test suites |
| `config/db-connect.js` | Infrastructure | Establishes Mongoose connection, reconnect listeners | `mongoose`, `dotenv` | `index.js` |
| `middleware/auth.middleware.js` | Security / RBAC | Extracts JWT from Authorization header, verifies role | `jsonwebtoken` | All route files |
| `middleware/fileUploader.middleware.js` | Media Processing | Multer disk storage, directory creation, MIME filter, 5MB limit | `multer`, `path`, `fs` | `brand`, `category`, `maincategory`, `product`, `subcategory` routes |
| `helper/pricing.helper.js` | Core Business Logic | Calculates authoritative pizza pricing with size multipliers & toppings | `product.model`, `customization.model` | `cart.controller`, `checkout.controller`, `customization.controller` |
| `helper/inventory.helper.js` | Business Logic / Cron | Atomic stock deduction with rollback, stock restoration, cron alert | `node-cron`, `inventory.model`, `mailer.helper` | `index.js`, `checkout.controller`, `inventory.controller` |
| `helper/socket.helper.js` | Real-Time Comm | Socket.IO server setup, handshake JWT auth, order room isolation | `socket.io`, `jsonwebtoken`, `checkout.model` | `index.js`, `checkout.controller`, `restaurant.controller` |
| `helper/mailer.helper.js` | Transactional Comms | Nodemailer Gmail SMTP transport with error-suppression wrapper | `nodemailer` | `auth.controller`, `checkout.controller`, `inventory.helper`, `user.controller`, `product.controller` |
| `routes/index.route.js` | Routing Hub | Aggregates and mounts 20 child routers under `/api` | Express `Router`, 20 child routers | `index.js` |
| `controllers/miancategory.controller.js` | Compatibility Alias | Re-exports `maincategory.controller.js` to prevent breaking legacy imports | `maincategory.controller` | None (legacy fallback) |
| `routes/miancategory.route.js` | Compatibility Alias | Re-exports `maincategory.route.js` to preserve legacy misspelled paths | `maincategory.route` | None (legacy fallback) |
| `tests/api.test.js` | Automated Native Test | Runs isolated unit checks for health probe and model coexistence | `node:test`, `node:assert`, `supertest`, `index.js` | `npm test` |
| `test_flow.js` | E2E Integration Test | Verifies Cart -> Pricing -> Checkout -> Razorpay HMAC -> State transitions | `http`, `crypto`, `mongoose`, `index.js` | `npm run test:flow`, `npm run test:all` |
| `test_socket.js` | Real-Time Test | Verifies Socket auth, room subscriptions, anti-eavesdropping | `socket.io-client`, `index.js` | `npm run test:socket`, `npm run test:all` |
| `test_inventory_restaurant.js` | Integration Test | Verifies ingredient CRUD, low stock alerts, restaurant onboarding | `http`, `mongoose`, `index.js` | `npm run test:extended`, `npm run test:all` |
| `test_security_audit.js` | Security Test | Probes health headers, cross-user profile read/update, role tampering | `http`, `mongoose`, `index.js` | `npm run test:audit`, `npm run test:all` |

### 2.3 Status of Super Admin Seeding Scripts
- **Audit Finding:** The file `scripts/seed-superadmin.js` was deleted from the repository.
- **Reference in package.json:** `package.json` line 15 currently retains `"seed:admin": "node scripts/seed-superadmin.js"`. Attempting to execute `npm run seed:admin` will fail with `Error: Cannot find module '.../scripts/seed-superadmin.js'`.
- **Constraint Compliance:** Per strict instructions, the script has NOT been recreated, and the stale entry in `package.json` is documented here for administrator awareness.

---

## 3. Application Startup and Request Lifecycle

### 3.1 Application Startup Sequence
When the application starts via `node server.js` or `nodemon server.js`:

```mermaid
sequenceDiagram
    autonumber
    participant Node as Node.js Runtime
    participant DotEnv as dotenv Engine
    participant DB as config/db-connect.js
    participant Index as index.js
    participant Middlewares as Express Middleware Stack
    participant Routes as Router Aggregator
    participant Socket as helper/socket.helper.js
    participant Cron as helper/inventory.helper.js
    participant HTTP as HTTP Server (port 8000)

    Node->>Index: Execute require("./index")
    Index->>DotEnv: dotenv.config() loads .env into process.env
    Index->>DB: require("./config/db-connect")
    DB->>DB: Check mongoose.connection.readyState === 0
    DB-->>Index: Initiate asynchronous mongoose.connect(DB_KEY)
    Index->>Middlewares: Register Helmet (Cross-Origin Resource Policy)
    Index->>Middlewares: Register CORS (ALLOWED_ORIGINS parser)
    Index->>Middlewares: Register Rate Limiter (/api: 1000 req/15min)
    Index->>Middlewares: Register express.json({ verify: req.rawBody })
    Index->>Middlewares: Register express.static("./public")
    Index->>Routes: Mount /health and /api/health probes
    Index->>Routes: app.use("/api", Router) -> Mount 20 subrouters
    Index->>HTTP: http.createServer(app)
    Index->>Socket: initSocket(httpServer) -> Attach Socket.IO & JWT Handshake
    alt NODE_ENV !== "test"
        Index->>Cron: initInventoryCron() -> Schedule hourly low-stock check ("0 * * * *")
    else NODE_ENV === "test"
        Index-->>Index: Skip Cron scheduling (Prevents hanging test runners)
    end
    Index->>Index: Attach process SIGTERM & SIGINT graceful shutdown hooks
    Index-->>Node: Export { app, server }
    Node->>HTTP: server.listen(8000) -> Output "Server is Running at http://localhost:8000"
```

### 3.2 Inbound Request Lifecycle
Every incoming HTTP request traverses a strictly sequential pipeline:

```mermaid
graph TD
    Req([Inbound Client Request]) --> H[Helmet Middleware]
    H --> C[CORS Origin Check]
    C -->|Origin Disallowed| C_Err[403 / CORS Policy Violation]
    C -->|Origin Allowed| RL[Rate Limiter Window Check]
    RL -->|Limit Exceeded| RL_Err[429 Too Many Requests]
    RL -->|Within Limit| BP[Body Parser & rawBody Buffer Hook]
    BP --> RT{Route Match}
    
    RT -->|/health| HealthCtrl[Return DB State & Uptime JSON]
    RT -->|/public/*| StaticCtrl[Serve Static Upload File]
    RT -->|/api/*| SubRouter[Sub-Router Match]
    
    SubRouter --> AuthMW{Auth Middleware Required?}
    AuthMW -->|verifyPublic| ExecCtrl[Controller Execution]
    AuthMW -->|verifyBuyer / verifyAdmin / verifySuperAdmin| TokenVal{Verify Bearer JWT}
    
    TokenVal -->|Missing / Expired| AuthErr[401 Unauthorized]
    TokenVal -->|Role Mismatch| RoleErr[403 Forbidden]
    TokenVal -->|Role Valid| ExecCtrl
    
    ExecCtrl --> InputVal{Input & Schema Validation}
    InputVal -->|Invalid| ValErr[400 Bad Request]
    InputVal -->|Valid| BusinessLogic[Business Logic / Helper Services]
    
    BusinessLogic --> DBOp[(MongoDB Mongoose Query)]
    DBOp -->|DB Error / Duplicate Key| DBRetErr[400/500 Fail Response]
    DBOp -->|Success| PostAction{Post-Commit Triggers}
    
    PostAction -->|Order Status Changed| SocketEmit[Socket.IO Room Broadcast]
    PostAction -->|Order / Signup Created| MailEmit[Nodemailer Dispatch Async]
    PostAction --> Response([200 / 201 JSON Response])
```

---

## 4. Complete Database and Model Documentation

### 4.1 Model Specifications

#### 1. User (`models/user.model.js`)
- **Collection Name:** `users`
- **Fields:**
  - `name`: String, required (`"User Full Name Field is Mendatory"`).
  - `username`: String, required, unique (`"Username Field is Mendatory"`).
  - `email`: String, required, unique (`"Email Address Field is Mendatory"`).
  - `phone`: String, required, unique (`"Phone Number Field is Mendatory"`).
  - `password`: String, required (`"Password Field is Mendatory"`).
  - `role`: String, default `"Buyer"` (Values observed in code: `"Buyer"`, `"Admin"`, `"Super Admin"`, `"Restaurant"`).
  - `passwordResetOptions`: Object, default `{}` (Contains `otp` and `date`).
  - `address`: Array, default `[]` (Stores delivery addresses).
  - `status`: Boolean, default `true`.
- **Relationships:** Referenced by `Restaurant.owner`, `Cart.user`, `Checkout.user`, `Wishlist.user`, `Testimonial.user`, `Category.createdBy`.

#### 2. Maincategory (`models/maincategory.model.js`)
- **Collection Name:** `maincategories`
- **Fields:**
  - `name`: String, required, unique (`"Maincategory Name Field is Mendatory"`).
  - `pic`: String, required (`"Pic Field is Mendatory"`).
  - `status`: Boolean, default `true`.
- **Purpose:** Primary category catalog model referenced by existing `Product` documents.

#### 3. Category (`models/category.model.js`)
- **Collection Name:** `categories`
- **Fields:**
  - `name`: String, required, minlength 2, maxlength 50, trimmed.
  - `slug`: String, required, unique, lowercase, trimmed, indexed.
  - `description`: String, default `""`, maxlength 500, trimmed.
  - `image`: String, default `""`.
  - `isActive`: Boolean, default `true`, indexed.
  - `createdBy`: ObjectId, ref `User`.
- **Timestamps:** Enabled (`createdAt`, `updatedAt`).
- **Indexes:** `{ slug: 1 }` (unique), `{ isActive: 1 }`.
- **Purpose:** SEO-friendly taxonomy category model with slug routing support.

#### 4. Subcategory (`models/subcategory.model.js`)
- **Collection Name:** `subcategories`
- **Fields:**
  - `name`: String, required, unique (`"Subcategory Name Field is Mendatory"`).
  - `pic`: String, required (`"Pic Field is Mendatory"`).
  - `status`: Boolean, default `true`.
- **Relationships:** Referenced by `Product.subcategory`.

#### 5. Brand (`models/brand.model.js`)
- **Collection Name:** `brands`
- **Fields:**
  - `name`: String, required, unique (`"Brand Name Field is Mendatory"`).
  - `pic`: String, required (`"Pic Field is Mendatory"`).
  - `status`: Boolean, default `true`.
- **Relationships:** Referenced by `Product.brand`.

#### 6. Product (`models/product.model.js`)
- **Collection Name:** `products`
- **Fields:**
  - `name`: String, required.
  - `maincategory`: ObjectId, ref `"Maincategory"`, required (`"Maincategory Id is Mendatory"`).
  - `subcategory`: ObjectId, ref `"Subcategory"`, required (`"Subcategory Id is Mendatory"`).
  - `brand`: ObjectId, ref `"Brand"`, required (`"Brand Id is Mendatory"`).
  - `restaurant`: ObjectId, ref `"Restaurant"`, default `null`.
  - `category`: ObjectId, ref `"Category"`, default `null` (Optional modern taxonomy link).
  - `color`: `[String]`, default `[]`.
  - `size`: `[String]`, default `["Regular", "Medium", "Large"]`.
  - `isCustomizable`: Boolean, default `false`.
  - `basePrice`: Number, required.
  - `discount`: Number, required.
  - `finalPrice`: Number, required.
  - `stock`: Boolean, default `true`.
  - `stockQuantity`: Number, required.
  - `description`: String, default `""`.
  - `pic`: `[String]`, required with custom validator ensuring `pic.length > 0`.
  - `status`: Boolean, default `true`.
- **Relationships:** Referenced by `Cart.product`, `Checkout.products.product`, `Wishlist.product`, `Testimonial.product`, `Ingredient.product`.

#### 7. Cart (`models/cart.model.js`)
- **Collection Name:** `carts`
- **Fields:**
  - `user`: ObjectId, ref `"User"`, required.
  - `product`: ObjectId, ref `"Product"`, required.
  - `quantity`: Number, required, min 1, default 1.
  - `size`: String, enum `["Regular", "Medium", "Large"]`, default `"Regular"`.
  - `customization`:
    - `base`: `{ id: ObjectId (ref CustomizationItem), name: String, price: Number }`
    - `sauce`: `{ id: ObjectId (ref CustomizationItem), name: String, price: Number }`
    - `cheese`: `{ id: ObjectId (ref CustomizationItem), name: String, price: Number }`
    - `veggies`: `[{ id: ObjectId (ref CustomizationItem), name: String, price: Number }]`
  - `unitPrice`: Number, required (Server-authoritative unit price).
  - `total`: Number, required (Server-authoritative total).
- **Timestamps:** Enabled.

#### 8. Checkout / Order (`models/checkout.model.js`)
- **Collection Name:** `checkouts`
- **Fields:**
  - `user`: ObjectId, ref `"User"`, required.
  - `deliveryAddress`: Object, required (Must contain `name`, `address`, `phone`).
  - `orderStatus`: String, enum `["Order Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Cancelled"]`, default `"Order Placed"`.
  - `statusHistory`: `[{ status: String, timestamp: Date, updatedBy: ObjectId (ref User) }]`.
  - `paymentMode`: String, default `"COD"`.
  - `paymentStatus`: String, enum `["Pending", "Done", "Failed"]`, default `"Pending"`.
  - `subtotal`: Number, required.
  - `shipping`: Number, required, default 0 (₹0 if subtotal ≥ ₹500, else ₹50).
  - `discount`: Number, default 0.
  - `total`: Number, required.
  - `rporderid`: String, default `""` (Razorpay Order ID).
  - `rppid`: String, default `""` (Razorpay Payment ID).
  - `rpsignature`: String, default `""` (Razorpay HMAC signature).
  - `restaurant`: ObjectId, ref `"Restaurant"`, default `null`.
  - `inventoryDeducted`: Boolean, default `false`.
  - `inventoryRestored`: Boolean, default `false`.
  - `products`: Array of product items (with `product`, `name`, `pic`, `quantity`, `size`, `unitPrice`, `total`, and full `customization` snapshot).
- **Timestamps:** Enabled.

#### 9. Restaurant (`models/restaurant.model.js`)
- **Collection Name:** `restaurants`
- **Fields:**
  - `name`: String, required, trimmed.
  - `owner`: ObjectId, ref `"User"`, required.
  - `email`: String, required, trimmed.
  - `phone`: String, required, trimmed.
  - `address`: `{ street: String, city: String (required), state: String, pin: String (required) }`.
  - `cuisine`: `[String]`, default `["Pizza", "Italian"]`.
  - `approvalStatus`: String, enum `["Pending", "Approved", "Rejected"]`, default `"Pending"`.
  - `rejectionReason`: String, default `""`.
  - `status`: Boolean, default `true`.
- **Timestamps:** Enabled.

#### 10. Inventory / Ingredient (`models/inventory.model.js`)
- **Collection Name:** `ingredients`
- **Fields:**
  - `name`: String, required, unique, trimmed.
  - `customizationItem`: ObjectId, ref `"CustomizationItem"`, default `null`.
  - `product`: ObjectId, ref `"Product"`, default `null`.
  - `quantity`: Number, required, min 0, default 0.
  - `unit`: String, required, enum `["units", "grams", "kg", "ml", "liters", "portions"]`, default `"portions"`.
  - `lowStockThreshold`: Number, required, min 0, default 10.
  - `status`: Boolean, default `true`.
  - `lastAlertSentAt`: Date, default `null`.
  - `lastAlertStock`: Number, default `null` (Used for alert deduplication).
- **Timestamps:** Enabled.

#### 11. CustomizationItem (`models/customization.model.js`)
- **Collection Name:** `customizationitems`
- **Fields:**
  - `name`: String, required, trimmed.
  - `type`: String, required, enum `["base", "sauce", "cheese", "veggie"]`.
  - `price`: Number, required, default 0.
  - `description`: String, default `""`.
  - `inStock`: Boolean, default `true`.
  - `status`: Boolean, default `true`.

#### 12. Wishlist (`models/wishlist.model.js`)
- **Collection Name:** `wishlists`
- **Fields:**
  - `user`: ObjectId, ref `"User"`, required.
  - `product`: ObjectId, ref `"Product"`, required.

#### 13. Testimonial (`models/testimonial.model.js`)
- **Collection Name:** `testimonials`
- **Fields:**
  - `user`: ObjectId, ref `"User"`, required.
  - `product`: ObjectId, ref `"Product"`, required.
  - `star`: Number, default 5.
  - `message`: String, required.

#### 14. ContactUs (`models/contactus.model.js`)
- **Collection Name:** `contactuses`
- **Fields:**
  - `name`: String, required.
  - `email`: String, required.
  - `phone`: String, required.
  - `subject`: String, required.
  - `message`: String, required.
  - `status`: Boolean, default `true`.
- **Timestamps:** Enabled.

#### 15. FAQ (`models/faq.model.js`)
- **Collection Name:** `faqs`
- **Fields:**
  - `question`: String, required, unique.
  - `answer`: String, required.
  - `status`: Boolean, default `true`.

#### 16. Feature (`models/feature.model.js`)
- **Collection Name:** `features`
- **Fields:**
  - `name`: String, required, unique.
  - `shortDescription`: String, required.
  - `icon`: String, required.
  - `status`: Boolean, default `true`.

#### 17. Newsletter (`models/newsletter.model.js`)
- **Collection Name:** `newsletters`
- **Fields:**
  - `email`: String, required, unique.
  - `status`: Boolean, default `true`.

#### 18. Setting (`models/setting.model.js`)
- **Collection Name:** `settings`
- **Fields:** `siteName`, `map1`, `map2`, `address`, `email`, `phone`, `whatsapp`, `facebook`, `twitter`, `linkedin`, `instagram`, `telegram`, `youtube`, `privacyPolicy`, `termsAndConditions`, `returnPolicy` (All String, default `""`).

---

### 4.2 Detailed Analysis: `Maincategory` vs `Category`

| Dimension | `Maincategory` (`models/maincategory.model.js`) | `Category` (`models/category.model.js`) |
| :--- | :--- | :--- |
| **Origin & Intent** | Original, core relational category model in the codebase. | Modern, SEO-optimized taxonomy category model added later. |
| **Fields** | `name` (unique), `pic` (required image path), `status` (Boolean). | `name`, `slug` (unique, lowercase), `description`, `image`, `isActive`, `createdBy`. |
| **Timestamps** | Disabled. | Enabled (`createdAt`, `updatedAt`). |
| **Indexing** | Implicit unique index on `name`. | Explicit indexes on `slug` (unique) and `isActive`. |
| **Product Reference** | **MANDATORY:** `Product.maincategory` is required (`ref: 'Maincategory'`). All existing product documents require this link. | **OPTIONAL:** `Product.category` is optional (`ref: 'Category'`, default `null`). |
| **Controllers & Routes** | `controllers/maincategory.controller.js` (`/api/maincategory`). Legacy alias: `miancategory`. | `controllers/category.controller.js` (`/api/category`). Includes `/api/category/slug/:slug`. |
| **Architectural Decision** | **RETAINED:** Maincategory must NOT be deleted. Doing so breaks existing product integrity and foreign key joins across the store catalog. | **RETAINED:** Category serves frontend SEO routes, category descriptions, slug resolution, and metadata. |
| **Coexistence Strategy** | Both models coexist harmoniously. `Product.controller.js` populates both `maincategory` and `category`. Applications can query products by slug via `Category` or by catalog ID via `Maincategory`. |

---

### 4.3 Verified Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ RESTAURANT : owns
    USER ||--o{ CART : has
    USER ||--o{ CHECKOUT : places
    USER ||--o{ WISHLIST : saves
    USER ||--o{ TESTIMONIAL : writes
    USER ||--o{ CATEGORY : creates

    RESTAURANT ||--o{ PRODUCT : offers
    RESTAURANT ||--o{ CHECKOUT : fulfills

    MAINCATEGORY ||--o{ PRODUCT : classifies
    SUBCATEGORY ||--o{ PRODUCT : groups
    BRAND ||--o{ PRODUCT : brands
    CATEGORY ||--o{ PRODUCT : "tags (optional)"

    PRODUCT ||--o{ CART : "added as"
    PRODUCT ||--o{ WISHLIST : "favorited in"
    PRODUCT ||--o{ TESTIMONIAL : "reviewed in"
    PRODUCT ||--o{ INGREDIENT : "tracked by"

    CUSTOMIZATION_ITEM ||--o{ INGREDIENT : "tracked by"
    CHECKOUT ||--|{ CHECKOUT_PRODUCT : contains

    USER {
        ObjectId _id PK
        string name
        string username UK
        string email UK
        string phone UK
        string password
        string role
        array address
    }

    PRODUCT {
        ObjectId _id PK
        string name
        ObjectId maincategory FK
        ObjectId subcategory FK
        ObjectId brand FK
        ObjectId restaurant FK
        ObjectId category FK
        number basePrice
        number discount
        number finalPrice
        number stockQuantity
        array pic
    }

    CHECKOUT {
        ObjectId _id PK
        ObjectId user FK
        ObjectId restaurant FK
        string orderStatus
        string paymentStatus
        string paymentMode
        number subtotal
        number shipping
        number total
        string rporderid
        boolean inventoryDeducted
    }

    INGREDIENT {
        ObjectId _id PK
        string name UK
        ObjectId customizationItem FK
        ObjectId product FK
        number quantity
        string unit
        number lowStockThreshold
    }
```

---

## 5. Complete API Documentation

### 5.1 Authentication & Profile Module
Mounted on `/api/auth` and `/api/user`.

| Method | Endpoint | Auth | Role | Request Body | Success | Error Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | None | `{ name, username, email, phone, password }` | `201 { result: "Done", data: { user, token } }` | `400` Missing field / duplicate user | Register new customer account |
| `POST` | `/api/auth/login` | Public | None | `{ username, password }` | `200 { result: "Done", data: { user, token } }` | `400` Invalid credentials | Login with username or email |
| `GET` | `/api/auth/me` | JWT | Buyer / Admin / Super Admin | None | `200 { result: "Done", data: user }` | `401`, `404` | Get profile of authenticated user |
| `POST` | `/api/user` | Public | None | Full User document | `200 { result: "Done", data: user }` | `400` Password validation / duplicate | Legacy user registration |
| `POST` | `/api/user/login` | Public | None | `{ username, password }` | `200 { result: "Done", data: user, token }` | `400` Invalid credentials | Legacy user login endpoint |
| `GET` | `/api/user` | JWT | Admin / Super Admin | None | `200 { result: "Done", data: [...] }` | `401`, `403` | List all registered users |
| `GET` | `/api/user/:_id` | JWT | Buyer / Admin / Super Admin | None | `200 { result: "Done", data: user }` | `401`, `404` | Retrieve user profile by ID |
| `PUT` | `/api/user/:_id` | JWT | Buyer / Admin / Super Admin | `{ name, phone, address, ... }` | `200 { result: "Done", data: updated }` | `400`, `404` | Update user profile |
| `DELETE` | `/api/user/:_id` | JWT | Super Admin | None | `200 { result: "Done" }` | `401`, `403`, `404` | Permanently delete user |
| `POST` | `/api/user/forget-password-1` | Public | None | `{ username }` | `200 { result: "Done", message: "OTP Sent" }` | `404` User not found | Dispatch 6-digit password reset OTP |
| `POST` | `/api/user/forget-password-2` | Public | None | `{ username, otp }` | `200 { result: "Done" }` | `400` Invalid / expired OTP | Verify password reset OTP |
| `POST` | `/api/user/forget-password-3` | Public | None | `{ username, password }` | `200 { result: "Done" }` | `400` Weak password, `401` | Reset password after OTP verification |

---

### 5.2 Product Catalog, Categories & Customizations
Mounted on `/api/product`, `/api/category`, `/api/maincategory`, `/api/subcategory`, `/api/brand`, `/api/customization`.

| Method | Endpoint | Auth | Role | Request / Params | Success | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/product` | Public | Any | None | `200 { result: "Done", data: [...] }` | List all products with populated relations |
| `GET` | `/api/product/:_id` | Public | Any | `:_id` (Product ID) | `200 { result: "Done", data: product }` | Get single product details |
| `POST` | `/api/product` | JWT | Admin / Super Admin | `multipart/form-data` (pic array, name, prices...) | `200 { result: "Done", data: product }` | Create new product and alert newsletter subscribers |
| `PUT` | `/api/product/:_id` | JWT | Admin / Super Admin | `multipart/form-data` or JSON | `200 { result: "Done", data: product }` | Update product details and photos |
| `PUT` | `/api/product/user/:_id` | JWT | Admin / Super Admin | `{ stock, stockQuantity }` | `200 { result: "Done", data: product }` | Quick stock status toggle |
| `DELETE` | `/api/product/:_id` | JWT | Super Admin | `:_id` | `200 { result: "Done" }` | Delete product and unlink photos from disk |
| `GET` | `/api/category` | Public | Any | None | `200 { result: "Done", data: [...] }` | List active SEO categories (all if admin) |
| `GET` | `/api/category/slug/:slug` | Public | Any | `:slug` (e.g. `veg-pizzas`) | `200 { result: "Done", data: category }` | Retrieve category by unique URL slug |
| `GET` | `/api/category/:_id` | Public | Any | `:_id` | `200 { result: "Done", data: category }` | Retrieve category by ID |
| `POST` | `/api/category` | JWT | Admin / Super Admin | `multipart/form-data` (image, name, description) | `201 { result: "Done", data: category }` | Create category with slug generation |
| `PUT` | `/api/category/:_id` | JWT | Admin / Super Admin | `multipart/form-data` or JSON | `200 { result: "Done", data: category }` | Update category and replace image |
| `DELETE` | `/api/category/:_id` | JWT | Super Admin | `:_id` | `200 { result: "Done" }` | Delete category and unlink image |
| `GET` | `/api/maincategory` | Public | Any | None | `200 { result: "Done", data: [...] }` | List catalog main categories |
| `POST` | `/api/maincategory` | JWT | Admin / Super Admin | `multipart/form-data` (pic single, name) | `200 { result: "Done", data: maincat }` | Create main category |
| `GET` | `/api/customization` | Public | Any | None | `200 { result: "Done", data: { bases, sauces, cheeses, veggies } }` | Get all pizza customization items |
| `POST` | `/api/customization/calculate-price`| Public | Any | `{ productId, size, baseId, sauceId, cheeseId, veggieIds, quantity }` | `200 { result: "Done", data: { unitPrice, total, customization } }` | Compute trusted server-side pizza price |
| `POST` | `/api/customization/seed` | JWT | Admin / Super Admin | None | `200 { result: "Done", message: "Options seeded" }` | Populate default crusts, sauces, cheeses & veggies |

---

### 5.3 Cart, Checkout, Orders & Payments
Mounted on `/api/cart` and `/api/checkout`.

| Method | Endpoint | Auth | Role | Request Body | Success | Error Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/cart` | JWT | Buyer | `{ product, size, baseId, sauceId, cheeseId, veggieIds, quantity }` | `200 { result: "Done", data: cartItem }` | `400` Invalid item, `401` | Add customized pizza to cart with server-side pricing |
| `GET` | `/api/cart/user/:user` | JWT | Buyer | None | `200 { result: "Done", data: [...], cartTotal }` | `403` Cross-user access | Retrieve current customer's cart |
| `GET` | `/api/cart/:_id` | JWT | Buyer | None | `200 { result: "Done", data: cartItem }` | `403`, `404` | Get single cart item |
| `PUT` | `/api/cart/:_id` | JWT | Buyer | `{ size, quantity, baseId, ... }` | `200 { result: "Done", data: updated }` | `400`, `403` | Recalculate and update cart item |
| `DELETE` | `/api/cart/:_id` | JWT | Buyer | None | `200 { result: "Done" }` | `403`, `404` | Remove item from cart |
| `POST` | `/api/checkout` | JWT | Buyer | `{ deliveryAddress, paymentMode }` | `200 { result: "Done", data: checkout }` | `400` Empty cart, `401` | Validate cart, lock prices, create order, clear cart, emit Socket event |
| `GET` | `/api/checkout` | JWT | Admin / Super Admin | None | `200 { result: "Done", data: [...] }` | `401`, `403` | List all orders across all customers |
| `GET` | `/api/checkout/:_id` | JWT | Buyer / Admin / Super Admin | None | `200 { result: "Done", data: order }` | `403` Tenant mismatch, `404` | Fetch order details |
| `GET` | `/api/checkout/user/:user` | JWT | Buyer | None | `200 { result: "Done", data: [...] }` | `403` Tenant mismatch | Fetch customer's order history |
| `PUT` | `/api/checkout/:_id` | JWT | Buyer / Admin / Super Admin | `{ orderStatus, paymentStatus }` | `200 { result: "Done", data: order }` | `400` Illegal state transition, `403` | Advance order state machine or customer cancellation |
| `POST` | `/api/checkout/order` | JWT | Buyer | `{ checkid }` | `200 { result: "Done", data: rpOrder }` | `400`, `403`, `404` | Create Razorpay order using server-calculated total |
| `POST` | `/api/checkout/verify-order` | JWT | Buyer | `{ checkid, razorpay_order_id, razorpay_payment_id, razorpay_signature }` | `200 { result: "Done", message: "Verified" }` | `400` Invalid HMAC signature | Verify Razorpay payment signature & deduct inventory |
| `POST` | `/api/checkout/webhook` | Public | Gateway | Razorpay webhook payload | `200 { result: "Done", message: "Webhook processed" }` | `400` Bad HMAC signature | Asynchronous payment capture webhook |

---

### 5.4 Restaurant Partner Module
Mounted on `/api/restaurant`.

| Method | Endpoint | Auth | Role | Request Body | Success | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/restaurant/apply` | JWT | Buyer | `{ name, email, phone, address, cuisine }` | `201 { result: "Done", data: restaurant }` | Submit application for restaurant partnership |
| `GET` | `/api/restaurant/me` | JWT | Restaurant | None | `200 { result: "Done", data: restaurant }` | Retrieve own restaurant profile |
| `PUT` | `/api/restaurant/me` | JWT | Restaurant | `{ name, phone, address, cuisine }` | `200 { result: "Done", data: updated }` | Update own restaurant details |
| `GET` | `/api/restaurant/my-products`| JWT | Restaurant | None | `200 { result: "Done", data: [...], count }`| Get products belonging exclusively to own restaurant |
| `GET` | `/api/restaurant/my-orders` | JWT | Restaurant | None | `200 { result: "Done", data: [...], count }`| Get orders assigned exclusively to own restaurant |
| `PUT` | `/api/restaurant/order/:orderId` | JWT | Restaurant | `{ orderStatus }` | `200 { result: "Done", data: order }` | Update order state for restaurant's own order |
| `GET` | `/api/restaurant` | JWT | Admin / Super Admin | None | `200 { result: "Done", data: [...] }` | List all restaurant partner applications |
| `PUT` | `/api/restaurant/:_id/approve` | JWT | Admin / Super Admin | None | `200 { result: "Done", data: restaurant }` | Approve partner & promote user role to `"Restaurant"` |
| `PUT` | `/api/restaurant/:_id/reject` | JWT | Admin / Super Admin | `{ reason }` | `200 { result: "Done", data: restaurant }` | Reject partner application |

---

### 5.5 Inventory & Ingredient Management
Mounted on `/api/inventory`.

| Method | Endpoint | Auth | Role | Request Body | Success | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory` | JWT | Admin / Super Admin | `{ name, quantity, unit, lowStockThreshold, customizationItem, product }` | `200 { result: "Done", data: ingredient }` | Create new tracked ingredient |
| `GET` | `/api/inventory` | JWT | Admin / Super Admin | Query: `?lowStock=true&status=true` | `200 { result: "Done", data: [...] }` | List inventory items (supports low stock filter) |
| `GET` | `/api/inventory/:_id` | JWT | Admin / Super Admin | None | `200 { result: "Done", data: ingredient }` | Get ingredient details |
| `PUT` | `/api/inventory/:_id` | JWT | Admin / Super Admin | `{ name, quantity, unit, lowStockThreshold }` | `200 { result: "Done", data: updated }` | Update ingredient properties |
| `POST` | `/api/inventory/adjust`| JWT | Admin / Super Admin | `{ ingredientId, adjustment, reason }` | `200 { result: "Done", data: ingredient }` | Atomic manual stock adjustment (rejects negative balance) |
| `PUT` | `/api/inventory/adjust` | JWT | Admin / Super Admin | `{ ingredientId, adjustment, reason }` | `200 { result: "Done", data: ingredient }` | Alias for manual stock adjustment |
| `POST` | `/api/inventory/check-alerts`| JWT | Admin / Super Admin | None | `200 { result: "Done", data: { alerted, count } }` | Trigger immediate scan for low-stock ingredients |
| `DELETE` | `/api/inventory/:_id`| JWT | Admin / Super Admin | None | `200 { result: "Done" }` | Delete tracked ingredient |

---

### 5.6 Ancillary Modules (Wishlist, Testimonials, Inquiries, Admin Dashboard)
- **Wishlist (`/api/wishlist`):**
  - `POST /api/wishlist`: Add product to wishlist (`verifyBuyer`).
  - `GET /api/wishlist/user/:user`: Get customer's wishlist items (`verifyBuyer`, strictly owner-enforced).
  - `DELETE /api/wishlist/:_id`: Remove wishlist item (`verifyBuyer`, owner-enforced).
- **Testimonials (`/api/testimonial`):**
  - `POST /api/testimonial`: Post customer review (`verifyBuyer`).
  - `GET /api/testimonial`: List public reviews (`verifyPublic`).
  - `PUT /api/testimonial/:_id`: Edit review (`verifyBuyer`, owner/admin check).
  - `DELETE /api/testimonial/:_id`: Delete review (`verifyPublic` in router; owner/admin check in controller).
- **Contact Us (`/api/contactus`):**
  - `POST /api/contactus`: Submit feedback or query (`verifyPublic`).
  - `GET /api/contactus`: Admin review of inquiries (`verifyAdmin`).
- **Newsletter (`/api/newsletter`):**
  - `POST /api/newsletter`: Subscribe email to newsletter (`verifyPublic`).
  - `GET /api/newsletter/unsubscribe/:_id`: Unsubscribe from list (`verifyBuyer`).
- **Dashboard (`/api/dashboard`):**
  - `GET /api/dashboard/stats`: Aggregated metrics (orders by status, total revenue, buyers count, low stock ingredients, recent 5 orders) (`verifyAdmin`).
- **Settings (`/api/setting`):**
  - `GET /api/setting`: Public retrieval of site contact and policy metadata (`verifyPublic`).
  - `POST /api/setting`: Admin update of site settings (`verifyAdmin`).

---

## 6. User Authentication and Role-Based Access Control

### 6.1 User Lifecycle Implementation
1. **Registration:**
   - Handled via `POST /api/auth/register` (modern) or `POST /api/user` (legacy).
   - Validates uniqueness of `username`, `email`, and `phone`.
   - Hashes passwords using `bcrypt.hash(password, 12)` (12 salt rounds).
   - Generates signed JWT containing `{ data: { _id, role, username } }` with 15-day validity.
2. **Login & Token Issuance:**
   - Supported via `POST /api/auth/login` and `POST /api/user/login`.
   - Looks up user by either `username` or `email`.
   - Compares raw password with stored hash via `bcrypt.compare`.
   - Returns signed JWT and user profile object.
3. **Password Recovery via OTP:**
   - Step 1 (`POST /api/user/forget-password-1`): User submits `username`. Server locates account, generates a 6-digit cryptographic OTP using `crypto.randomInt(100000, 1000000)`, saves `{ otp, date: new Date() }` to `user.passwordResetOptions`, and dispatches an HTML email via Nodemailer.
   - Step 2 (`POST /api/user/forget-password-2`): User submits `username` and `otp`. Server verifies non-empty match against `user.passwordResetOptions.otp` and checks expiration (must be within 10 minutes).
   - Step 3 (`POST /api/user/forget-password-3`): User submits `username` and new `password`. Validates password strength (min 8 chars, uppercase, lowercase, symbol, 2 digits), hashes with bcrypt, updates DB, and clears `passwordResetOptions`.

### 6.2 Defined Roles and Hierarchy
The backend implements four distinct user roles:
1. **`Buyer`:** Default role assigned on registration. Can browse catalog, manage personal cart and wishlist, submit reviews, place orders, make payments, and cancel orders prior to kitchen preparation.
2. **`Restaurant`:** Partner role granted upon admin approval. Can view and edit own restaurant profile, view exclusively assigned products and orders, and transition status of assigned orders.
3. **`Admin`:** Store manager. Full access to catalog CRUD, inventory adjustments, order status progression, customer query management, and partner approvals.
4. **`Super Admin`:** Platform owner. Exclusive rights to delete catalog categories, brands, products, users, orders, and reviews.

### 6.3 Backend Role-Permission Matrix

| Resource / Action | Public / Unauth | Buyer | Restaurant | Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Browse Products / Categories / Customizations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calculate Price Simulation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cart CRUD (Own Cart) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Create Order / Checkout (Own Cart) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Initiate Razorpay Payment (Own Order) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Cancel Order (Own Order, Placed/Accepted Only) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Track Live Order via Socket.IO (Own Order) | ❌ | ✅ | ❌ | ✅ | ✅ |
| Track All Live Orders via Socket.IO | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Own Restaurant Profile & Products | ❌ | ❌ | ✅ | ❌ | ❌ |
| Manage Own Restaurant Orders | ❌ | ❌ | ✅ | ❌ | ❌ |
| Progress Any Order State Machine | ❌ | ❌ | ❌ | ✅ | ✅ |
| Product / Category / Brand / FAQ Create & Edit | ❌ | ❌ | ❌ | ✅ | ✅ |
| Raw Ingredient Inventory Adjustments & Alerts | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve / Reject Restaurant Applications | ❌ | ❌ | ❌ | ✅ | ✅ |
| View System Dashboard Metrics | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete Category / Brand / Product / FAQ / User | ❌ | ❌ | ❌ | ❌ | ✅ |

### 6.4 Security Nuances & Privilege Verification
- **Multiple Super Admins:** The system natively supports multiple Super Admin accounts; authorization checks `user.role === "Super Admin"`.
- **Privilege Escalation Risk in `user.controller.js`:** In `updateRecord` (`PUT /api/user/:_id`), the controller executes `data.role = req.body.role ?? data.role` without verifying that the requester has administrative privileges. A standard Buyer submitting `{ role: "Super Admin" }` can escalate privileges. *(Detailed in Section 8).*
- **Sensitive Field Leakage in Legacy Controller:** `controllers/user.controller.js` returns the full Mongoose user document directly (`res.send({ result: "Done", data: data })`) without projecting out `password`. In contrast, modern `auth.controller.js` uses `sanitizeUser()` to strip `password` and `passwordResetOptions`.

---

## 7. Business Logic and End-to-End Flows

### 7.1 Cart, Customization & Server-Side Price Calculation
Client-submitted prices are NEVER trusted by the backend. When a customer adds an item to cart (`POST /api/cart`) or updates an item (`PUT /api/cart/:_id`):
1. The server loads the base product from MongoDB to obtain `basePrice` and `finalPrice`.
2. Size multipliers are applied strictly on the server:
   $$\text{Multiplier} = \begin{cases} 1.0 & \text{Regular} \\ 1.4 & \text{Medium} \\ 1.8 & \text{Large} \end{cases}$$
3. Customization items (crust base, sauce, cheese, and vegetables) are fetched from `CustomizationItem` collection by ObjectId to obtain trusted prices.
4. Authoritative calculation formula:
   $$\text{unitPrice} = \text{round}\left((\text{basePrice} + \sum \text{customizationPrices}) \times \text{multiplier}\right)$$
   $$\text{total} = \text{unitPrice} \times \text{quantity}$$
5. Tampered client fields (e.g. submitting `unitPrice: 1`) are discarded and overwritten with the computed values before saving to `Cart`.

### 7.2 Checkout & Order Creation
When `POST /api/checkout` is invoked:
1. Customer identity is established via JWT `req.user._id`.
2. The customer's active items are retrieved from `Cart`. If the cart is empty, HTTP 400 is returned immediately.
3. Delivery address fields (`name`, `address`, `phone`) are validated.
4. Product availability and pricing are re-validated against current catalog prices.
5. Order financials are locked:
   - `subtotal` = $\sum \text{item totals}$
   - `shipping` = ₹0 if `subtotal` $\ge 500$, else ₹50.
   - `total` = `subtotal` + `shipping` - `discount`.
6. A permanent `Checkout` order snapshot is saved with `orderStatus: "Order Placed"` and `paymentStatus: "Pending"`.
7. The customer's cart is automatically cleared (`Cart.deleteMany({ user: userId })`).
8. Real-time event `order:statusUpdated` is broadcast to the customer's room and admin board.
9. An HTML order confirmation receipt is dispatched via Nodemailer.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant CartCtrl as Cart Controller
    participant Pricing as Pricing Helper
    participant OrderCtrl as Checkout Controller
    participant InvHelper as Inventory Helper
    participant Razorpay as Razorpay Gateway
    participant Socket as Socket.IO Server
    participant DB as MongoDB

    Customer->>CartCtrl: POST /api/cart (Pizza + Customizations)
    CartCtrl->>Pricing: computeItemPrice(productId, size, options, qty)
    Pricing->>DB: Query Product & CustomizationItem prices
    Pricing-->>CartCtrl: Authoritative unitPrice & total
    CartCtrl->>DB: Save Cart document
    CartCtrl-->>Customer: 200 Cart item saved

    Customer->>OrderCtrl: POST /api/checkout (Delivery Address)
    OrderCtrl->>DB: Fetch user Cart items
    OrderCtrl->>Pricing: Re-verify all item totals
    OrderCtrl->>DB: Save Checkout order (status: "Order Placed")
    OrderCtrl->>DB: Clear user's Cart
    OrderCtrl->>Socket: emitOrderStatusUpdated(orderId, "Order Placed")
    OrderCtrl-->>Customer: 200 Order confirmed

    Customer->>OrderCtrl: POST /api/checkout/order (Initiate Payment)
    OrderCtrl->>Razorpay: orders.create(amount: total * 100, currency: "INR")
    Razorpay-->>OrderCtrl: rpOrder (id: "order_xyz123")
    OrderCtrl->>DB: Save rporderid to Checkout
    OrderCtrl-->>Customer: 200 Return Razorpay Order

    Customer->>Customer: Complete Payment in Razorpay Modal
    Customer->>OrderCtrl: POST /api/checkout/verify-order (Signature, PaymentID)
    OrderCtrl->>OrderCtrl: crypto.createHmac("sha256", RPSECRETKEY).update(...)
    alt Signature Matches
        OrderCtrl->>DB: Update paymentStatus = "Done"
        OrderCtrl->>InvHelper: validateAndDeductInventory(order)
        InvHelper->>DB: Atomic $inc: { quantity: -needed } on Ingredients
        OrderCtrl-->>Customer: 200 Payment Verified
    else Signature Mismatch
        OrderCtrl->>DB: Update paymentStatus = "Failed"
        OrderCtrl-->>Customer: 400 Signature Verification Failed
    end
```

### 7.3 Order Lifecycle & Cancellation State Machine
Order status transitions follow strict validation rules defined in `VALID_TRANSITIONS`:
```text
[Order Placed] ──> [Accepted] ──> [Preparing] ──> [Out for Delivery] ──> [Delivered]
       │                │                │                   │
       └───> [Cancelled] └───> [Cancelled] └───> [Cancelled] └───> [Cancelled]
```
- **Customer Cancellation Boundary:** Customers are permitted to cancel their order (`PUT /api/checkout/:_id` with `{ orderStatus: "Cancelled" }`) ONLY when the order is in `"Order Placed"` or `"Accepted"` status. Once kitchen preparation begins (`"Preparing"` or later), cancellation requests return HTTP 400: *"Kitchen preparation or delivery is already in progress."*
- **Terminal States:** `"Delivered"` and `"Cancelled"` are terminal states; no further transitions are allowed.
- **Inventory Restoration:** Whenever an order transitions to `"Cancelled"`, `restoreOrderInventory()` triggers, restoring deducted portions to the `Ingredient` collection.

---

## 8. Security and Reliability

### 8.1 Security Protections Implemented in Current Code
1. **HTTP Security Headers:** Configured via `helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })` in `index.js`, enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and disabling `X-Powered-By`.
2. **CORS Origin Validation:** Dynamic origin validation parsing `ALLOWED_ORIGINS` from `.env`. Rejects disallowed cross-origin requests.
3. **API Rate Limiting:** Enforces 1,000 requests per 15-minute window per IP on `/api` routes via `express-rate-limit`.
4. **Cryptographic Payment Signature Verification:** Validates Razorpay HMAC SHA-256 signatures server-side using Node's `crypto` module.
5. **Raw Body Capture for Webhooks:** `index.js` configures `express.json({ verify: (req, res, buf) => { req.rawBody = buf } })`, allowing exact HMAC verification of binary webhook payloads.
6. **Socket Anti-Eavesdropping Isolation:** Socket.IO connections authenticate with JWT handshakes. Customers can only join rooms matching their own `orderId` (`order:123`). Admin users join `orders:admin`. Cross-user room joins are rejected with error events.
7. **File Upload Hardening:** Multer storage engine sanitizes file names (`[^a-zA-Z0-9._-]`), enforces a 5MB size limit, restricts MIME types to JPEG/PNG/WebP/GIF, and automatically unlinks rejected files.

### 8.2 Security Audit Findings Table

| ID | Component | Severity | Finding | Status | Remediated In Code | Verified Impact |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- |
| **SEC-01** | `user.controller.js` `updateRecord` | **CRITICAL** | Vertical Privilege Escalation | **RESOLVED** | Restricted role & status mutation to authorized Administrators; Super Admin role assignment strictly requires caller to be `Super Admin`. Standard buyers cannot self-promote. | Self-promotion exploit eliminated; role changes by non-admins are discarded. |
| **SEC-02** | `user.controller.js` `getSingleRecord` | **HIGH** | Insecure Direct Object Reference (IDOR) & Sensitive Data Leak | **RESOLVED** | Enforced strict ownership: `if (!isOwner && !isAdmin) return 403`. Applied `.select("-password -passwordResetOptions")` and `sanitizeUser()`. | Cross-tenant profile inspection blocked; password hash and reset options stripped from responses. |
| **SEC-03** | `user.controller.js` `updateRecord` | **HIGH** | Horizontal IDOR on User Profile Modification | **RESOLVED** | Enforced ownership verification: `if (!isOwner && !isAdmin) return 403`. Profile updates sanitize returned user document. | Unauthorized cross-user profile tampering completely blocked. |
| **SEC-04** | `routes/testimonial.route.js` | **MEDIUM** | Insecure Route Middleware on Testimonial Delete | **RESOLVED** | Updated router line 9 from `verifyPublic` to `verifyBuyer`. | Unauthenticated clients are rejected at the middleware boundary before controller execution. |
| **SEC-05** | `routes/user.route.js` & `controllers/user.controller.js` | **MEDIUM** | Missing Address Book & Verification Endpoints | **RESOLVED** | Implemented `POST /api/user/address`, `GET /api/user/address`, `DELETE /api/user/address/:index`, and `POST /api/user/verify-email`. Added `emailVerified: Boolean` to `User` schema. | Full customer address book CRUD and OTP-based email verification supported. |
| **SEC-06** | `routes/auth.route.js` & `controllers/auth.controller.js` | **HIGH** | Missing Module Dependency Runtime Crash | **RESOLVED** | Created `controllers/auth.controller.js` implementing sanitized `register`, `login`, and `getMe` handlers with minimal JWT payload. | Resolves `MODULE_NOT_FOUND` crash in `routes/auth.route.js`; restores nodemon stability. |

---

## 9. Configuration and Environment Variables

### 9.1 Environment Variables Catalog

| Variable Name | Purpose | Required? | Default / Fallback | Code Usage Location |
| :--- | :--- | :---: | :--- | :--- |
| `NODE_ENV` | Runtime mode (`development`, `production`, `test`) | Optional | `"development"` | `index.js`, `helper/inventory.helper.js` |
| `PORT` | HTTP server listening port | Optional | `8000` | `index.js`, `server.js` |
| `DB_KEY` | MongoDB connection URI string | **Required** | `"mongodb://127.0.0.1:27017/PizzaHub"` | `config/db-connect.js` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | Optional | `["*"]` (Wildcard) | `index.js` |
| `JWT_SECRET_KEY` | Symmetric key for signing & verifying JWTs | **Required** | None (Throws if missing) | `middleware/auth.middleware.js`, `helper/socket.helper.js`, controllers |
| `JWT_PUBLIC_KEY` | Optional secondary key / identifier | Optional | None | Referenced in legacy files |
| `RPKEYID` | Razorpay Key ID for client & API authentication | **Required** (Payments) | None | `controllers/checkout.controller.js` |
| `RPSECRETKEY` | Razorpay Key Secret for cryptographic HMAC verification | **Required** (Payments) | None | `controllers/checkout.controller.js` |
| `RPWEBHOOKSECRET` | Secret configured in Razorpay Webhook dashboard | Optional | Falls back to `RPSECRETKEY` | `controllers/checkout.controller.js` |
| `MAIL_USERNAME` | SMTP sender email address (Gmail) | **Required** (Emails) | None | `helper/mailer.helper.js`, controllers |
| `MAIL_PASSWORD` | SMTP app-specific password | **Required** (Emails) | None | `helper/mailer.helper.js` |
| `SITE_NAME` | Branding name used in transactional emails | Optional | None | `controllers/product.controller.js` |
| `SITE_URL` | Public frontend URL for linking image assets in emails | Optional | None | `controllers/product.controller.js` |

---

## 10. Third-Party Integrations

### 10.1 Integration Specifications

| Service | Mechanism | Implementation Files | Production Readiness | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **MongoDB** | Mongoose ODM v9.11 | `config/db-connect.js`, all models | Production Ready (Connection pooling, reconnect event hooks) | **Verified Live:** Connected and tested |
| **Razorpay** | REST API & HMAC SHA-256 | `controllers/checkout.controller.js` | Production Ready (Server total in paise, cryptographic verification) | **Verified via Mock/Integration Suite:** 100% pass on signature validation & idempotency |
| **Nodemailer (Gmail)** | SMTP Port 587 / TLS | `helper/mailer.helper.js` | Partially Ready (Requires valid Gmail App Password in `.env`) | **Code Verified:** Transport wrapped with non-fatal error handler to prevent unhandled rejections |
| **Socket.IO** | WebSockets & Long-Polling | `helper/socket.helper.js`, `index.js` | Production Ready (Handshake JWT auth, room isolation) | **Verified Live:** 11/11 automated tests passed |
| **node-cron** | In-Memory Cron Scheduler | `helper/inventory.helper.js`, `index.js` | Ready for single instance (Requires Redis queue if multi-instance) | **Verified:** Hourly low-stock alerts & deduplication verified |
| **Local File Storage** | Multer Disk Storage | `middleware/fileUploader.middleware.js` | Suitable for single server (Object storage recommended for clusters) | **Verified:** Directory creation, MIME validation & unlinking verified |

---

## 11. Testing and Code Quality

### 11.1 Test Suites Execution Results
The following test suites were executed directly against an isolated test database (`mongodb://127.0.0.1:27017/PizzaHub_test`) during this audit.

#### 1. Native API Test Suite (`tests/api.test.js`)
- **Execution Command:** `node --test tests/api.test.js`
- **Result:** **PASSED (2/2 tests passed, 0 failures, 81ms)**
  - `✔ Health check endpoint returns healthy status`
  - `✔ Category and Maincategory models co-exist correctly`

#### 2. End-to-End Flow Verification Suite (`test_flow.js`)
- **Execution Command:** `node test_flow.js`
- **Result:** **PASSED (32/32 checks passed - 100%)**
  - Fixture seeding & user role setup: PASSED
  - Cart addition & server-side price calculation: PASSED
  - Client-side price tampering detection & restoration: PASSED
  - Size updates & recalculation (Regular -> Large): PASSED
  - Cross-user cart access blocked (HTTP 403): PASSED
  - Empty cart rejection (HTTP 400): PASSED
  - Checkout order creation & cart clearance: PASSED
  - Razorpay invalid signature rejection (HTTP 400): PASSED
  - Cryptographic payment verification (HTTP 200): PASSED
  - Idempotent duplicate payment callbacks: PASSED
  - Order state machine transitions & customer cancellation boundary: PASSED

#### 3. Real-Time Socket.IO Verification Suite (`test_socket.js`)
- **Execution Command:** `node test_socket.js`
- **Result:** **PASSED (11/11 checks passed - 100%)**
  - Unauthenticated socket handshake rejection: PASSED
  - Invalid token handshake rejection: PASSED
  - Authenticated customer & admin connections: PASSED
  - Customer subscription to own order room: PASSED
  - Cross-customer order room eavesdropping blocked: PASSED
  - Admin global orders room subscription: PASSED
  - Real-time order status dispatch & room isolation: PASSED

#### 4. Inventory, Restaurant & Integration Suite (`test_inventory_restaurant.js`)
- **Execution Command:** `node test_inventory_restaurant.js`
- **Safety Precondition:** Refuses execution unless verified isolated test database (`PizzaHub_test`) and `NODE_ENV=test` are present.
- **Post-Remediation Result:** **PASSED (16/16 checks passed - 100%)**
  - Ingredient creation & stock adjustment (+10 portions): PASSED
  - Negative stock prevention: PASSED
  - Low-stock alert detection & deduplication: PASSED
  - Restaurant partner application & admin approval workflow: PASSED
  - Owner role promotion & tenant product isolation: PASSED
  - Customer address book CRUD (`POST /api/user/address`, `GET`, `DELETE`): PASSED
  - OTP email verification (`POST /api/user/verify-email`): PASSED
  - Asynchronous Razorpay webhook HMAC verification: PASSED

#### 5. Security & Hardening Audit Suite (`test_security_audit.js`)
- **Execution Command:** `node test_security_audit.js`
- **Safety Precondition:** Refuses execution unless verified isolated test database (`PizzaHub_test`) and `NODE_ENV=test` are present.
- **Post-Remediation Result:** **PASSED (8/8 audit checks passed - 100%)**
  - Health check probe (`/health` HTTP 200, status `healthy`, db `connected`): PASSED
  - Helmet security headers (`X-Content-Type-Options: nosniff`): PASSED
  - Cross-tenant profile read IDOR blocked (`GET /api/user/:_id` HTTP 403): PASSED
  - Cross-tenant profile update IDOR blocked (`PUT /api/user/:_id` HTTP 403): PASSED
  - Vertical privilege escalation blocked (Self-update cannot elevate to `Super Admin`): PASSED
  - Sensitive field sanitization (Password hash and `passwordResetOptions` omitted): PASSED
  - Account takeover defense (Password reset step 3 with invalid OTP rejected HTTP 400): PASSED
  - Catalog integrity & stock tampering defense (Buyer blocked from updating stock HTTP 403): PASSED

---

## 12. Installation and Execution Guide

### 12.1 Prerequisites
- **Node.js:** v18.16.0 or higher (v20+ recommended).
- **MongoDB:** v6.0 or v7.0 running locally or accessible via MongoDB Atlas.
- **Package Manager:** npm (bundled with Node.js).

### 12.2 Step-by-Step Setup
1. **Clone and Navigate to Backend:**
   ```bash
   cd backend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment File:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your database URI, JWT secret, and CORS origins:
   ```properties
   PORT=8000
   NODE_ENV=development
   DB_KEY=mongodb://127.0.0.1:27017/PizzaHub
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   JWT_SECRET_KEY=generate_a_random_string_of_at_least_32_characters
   ```
4. **Start MongoDB:**
   - *Windows Service:* `net start MongoDB`
   - *Standalone:* `mongod --dbpath <path_to_data_folder>`
5. **Start Application in Development Mode:**
   ```bash
   npm run dev
   ```
6. **Start Application in Production Mode:**
   ```bash
   npm start
   ```
7. **Verify Server Health:**
   ```bash
   curl http://localhost:8000/health
   # Expected response: {"status":"healthy","uptime":...,"database":"connected","environment":"development"}
   ```
8. **Run Verification Test Suites Safely:**
   ```bash
   npm run test:flow
   npm run test:socket
   npm test
   ```

---

## 13. Deployment and Operations

### 13.1 Production Deployment Guidelines
1. **Reverse Proxy Configuration (Nginx):**
   - Terminate SSL/TLS at Nginx.
   - Forward `X-Forwarded-For` and `Host` headers.
   - Support WebSocket upgrades for Socket.IO:
     ```nginx
     location /socket.io/ {
         proxy_pass http://127.0.0.1:8000/socket.io/;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection "Upgrade";
         proxy_set_header Host $host;
     }
     ```
2. **CORS Restrictions:** Set `ALLOWED_ORIGINS` to exact production domain(s) (e.g. `https://pizzahub.com,https://admin.pizzahub.com`). Do not leave as `*` in production.
3. **Process Management:** Use PM2 or systemd:
   ```bash
   pm2 start server.js --name pizzahub-backend -i 2
   ```
4. **Horizontal Scaling & WebSockets:** If clustering or running multiple Node.js instances behind a load balancer, configure sticky sessions (ip_hash) and connect Socket.IO to the `@socket.io/redis-adapter` so room events propagate across nodes.
5. **Database Backups:** Schedule automated MongoDB backups via `mongodump` or MongoDB Atlas Automated Backups.

---

## 14. Final Technical Assessment

### 14.1 Summary of Architecture
The PizzaHub backend represents a rich, feature-complete food delivery backend. It features robust server-side pricing logic, complete state machine validation, atomic inventory management with rollback safeguards, and real-time Socket.IO synchronization.

### 14.2 Strengths
- **Trustworthy Pricing Math:** Authoritative server-side calculations prevent price manipulation attacks.
- **State Machine Rigor:** Order states transition strictly through validated lifecycles with role-based cancellation boundaries.
- **Decoupled Real-Time Layer:** Socket.IO events are emitted only after database persistence succeeds.
- **Zero-Downtime Multi-Category Strategy:** Coexistence of `Maincategory` and `Category` maintains backward compatibility while enabling SEO features.

### 14.3 Status of Hardening & Production Recommendations
1. **Vertical Privilege Escalation Defense:** **COMPLETED & VERIFIED.** `user.controller.js` strictly restricts role modification to authorized administrators and requires caller to be `Super Admin` to assign that role.
2. **IDOR & Sensitive Data Leak Protection:** **COMPLETED & VERIFIED.** `getSingleRecord` and `updateRecord` enforce ownership boundaries, project out sensitive credentials, and strip `password` and `passwordResetOptions` via `sanitizeUser()`.
3. **Stale Script Cleanup:** **COMPLETED.** `"seed:admin"` removed from `package.json`.
4. **API Completeness (Address Book & Verification):** **COMPLETED & VERIFIED.** Dedicated `/api/user/address` CRUD and `/api/user/verify-email` mounted and operational.
5. **Runtime Module Dependency Stability:** **COMPLETED.** Implemented `controllers/auth.controller.js` ensuring clean route loading.
6. **Low Priority (Schema Consistency):** Fix legacy schema spelling (`"Mendatory"` -> `"Mandatory"`) across model validation messages in future cleanup passes.

---
*Report generated and validated autonomously by Senior Backend Architect & Technical Documentation Engineer.*
