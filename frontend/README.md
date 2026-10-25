# PizzaHub Frontend Application

A responsive, high-performance single page application built with React 19, Vite, Redux-Saga, and Bootstrap. Provides a complete pizza ordering experience featuring an interactive crust/sauce/cheese customizer, real-time price preview, shopping cart, multi-step checkout, and a full-featured admin management dashboard.

---

## 🍕 Features Overview

### 🍕 Customer Experience
- **Artisanal Home Landing Page:** Hero showcase, quick category discovery, popular oven-baked pizzas, 30-minute delivery guarantees, and verified customer testimonials.
- **Pizza Menu & Shop (`/shop`):**
  - Instant filtering by Maincategory (Veg Pizzas, Non-Veg Pizzas, Sides & Drinks) and Subcategories/Crusts.
  - Live search by pizza name, toppings, or spices (synchronized with URL search parameters `?search=`).
  - Price and discount sorting (Recommended, Low to High, High to Low, Biggest Discount).
- **Interactive Pizza Customizer (`/product/:_id`):**
  - **Crust Selection:** Hand Tossed, Thin & Crispy, Cheese Burst, Fresh Pan, Gluten Free.
  - **Signature Sauces:** Classic Marinara, Spicy Arrabiata, Garlic Parmesan, Smoky BBQ, Basil Pesto.
  - **Cheese Variety:** Standard Mozzarella, Extra Cheese, Cheddar Blend, Smoked Dutch Gouda.
  - **Gourmet Toppings:** Pick any combination of Mushrooms, Bell Peppers, Onions, Black Olives, Sweet Corn, Jalapenos, and Fresh Basil.
  - **Real-Time Price Engine:** Calculates live prices based on selected size multipliers (Regular 1.0x, Medium 1.4x, Large 1.8x) and extras via `POST /api/customization/calculate-price`.
  - **Quantity Controls & Stock Enforcement:** Add to cart with authenticated session checks.
- **Cart & Seamless Checkout (`/cart`, `/checkout`):**
  - Review items, customized ingredients snapshot, and subtotal calculations.
  - Delivery address book integration with instant address selection or new address entry.
  - Support for **Cash on Delivery (COD)** and **Online Payments (Razorpay)**.
- **Order Confirmation & History (`/order-confirmation`, `/profile?option=Orders`):**
  - Confirmed order badge, delivery receipt, and tracking view.
- **Customer Account & Profile (`/profile`):**
  - Profile editing with controlled inputs, error feedback, and protected field allowlists.
  - Saved addresses manager.
- **Customer Support & Policies:**
  - **About Us (`/about`):** 48-hr fermented dough pledge and craft standards.
  - **Features (`/feature`):** Stone deck baking and real-time fleet delivery highlights.
  - **FAQ (`/faq`):** Interactive accordion answering common ordering and dietary questions.
  - **Reviews (`/testimonial`):** Verified customer feedback with 5-star rating cards.
  - **Contact Us (`/contact`):** Inquiry form with direct backend logging and email confirmations.
  - **Legal:** Privacy Policy (`/privacy-policy`), Terms & Conditions (`/tc`), and Return & Refund Policy (`/refund-policy`).

### ⚙️ Admin Management Dashboard
- **Live Analytics (`/admin`):** Real-time MongoDB aggregations for total revenue, active orders pipeline, and restaurant onboarding counts via `/api/dashboard/stats`.
- **Order Lifecycle Management (`/admin/checkout`):** Inspect customer orders, update order status through valid transitions (`Order Placed` ➔ `Accepted` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`), and manage payment status.
- **Product & Catalog Management (`/admin/product`):** Create, update, toggle stock, upload pictures, and manage menu pricing.
- **Categories & Brands (`/admin/maincategory`, `/admin/subcategory`, `/admin/brand`):** Full CRUD for catalog taxonomy.
- **Content & Support Management (`/admin/faq`, `/admin/feature`, `/admin/contact`):** Manage marketing items and customer inquiries.

---

## 🛠️ Tech Stack

- **Framework:** React 19 (`react` ^19.2.6, `react-dom` ^19.2.6)
- **Build Tool:** Vite 8 (`vite` ^8.0.12)
- **Routing:** React Router DOM v7 (`react-router-dom` ^7.17.0)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`) & Redux-Saga (`redux-saga` ^1.5.0)
- **Styling:** Vanilla CSS, Bootstrap 5, Bootstrap Icons, and FontAwesome
- **Payment SDK:** Razorpay Web SDK (`react-razorpay`)
- **Notifications:** React Toastify (`react-toastify`)

---

## 📁 Directory Structure

```
frontend/
├── public/
│   └── images/                    # Local fallbacks & high-res pizza imagery
├── src/
│   ├── Components/
│   │   ├── Admin/
│   │   │   └── AdminSidebar.jsx   # Route-aware admin navigation sidebar
│   │   ├── User/
│   │   │   └── UpdateProfile.jsx  # Controlled user profile form
│   │   ├── Breadcrum.jsx          # Reusable page header breadcrumb
│   │   ├── Footer.jsx             # Footer with newsletter & site links
│   │   └── Navbar.jsx             # Global navbar with search & cart counter
│   ├── Pages/
│   │   ├── Admin/                 # Admin management views (Products, Orders, Stats)
│   │   │   ├── AdminHomePage.jsx  # Live stats dashboard
│   │   │   └── Checkout/          # Order inspection & status updater
│   │   ├── User/                  # User account & transaction views
│   │   │   ├── CartPage.jsx       # Cart view & quantity steppers
│   │   │   ├── CheckoutPage.jsx   # Delivery address & payment method
│   │   │   ├── Payment.jsx        # Razorpay modal & signature verifier
│   │   │   ├── OrderConfirmation.jsx
│   │   │   ├── ProfilePage.jsx    # Profile, orders, and wishlist tabs
│   │   │   └── LoginPage.jsx / SignupPage.jsx
│   │   ├── AboutPage.jsx          # Pizzeria craft & story
│   │   ├── ContactUsPage.jsx      # Contact form with backend API integration
│   │   ├── FaqPage.jsx            # Interactive FAQ accordion
│   │   ├── FeaturePage.jsx        # Key pizzeria features
│   │   ├── HomePage.jsx           # Landing page with hero & featured items
│   │   ├── PrivacyPolicy.jsx      # Privacy policy
│   │   ├── ProductPage.jsx        # Interactive pizza customizer & builder
│   │   ├── ReturnAndRefundPolicy.jsx
│   │   ├── ShopPage.jsx           # Filterable & searchable pizza menu
│   │   ├── TermsAndConditions.jsx
│   │   └── TestimonialPage.jsx    # Customer review cards
│   ├── Redux/
│   │   ├── ActionCreators/        # Action creators for all domain entities
│   │   ├── Constants/             # Action type string constants
│   │   ├── Reducers/              # Root & feature state reducers
│   │   ├── Sagas/                 # Redux-saga side effect workers & watchers
│   │   │   └── Service/index.js   # Base HTTP fetch service with JWT injection
│   │   └── Store.jsx              # Configured Redux-Saga store
│   ├── App.jsx                    # Application routing & route protection
│   └── main.jsx                   # React root entry point
├── .env.example                   # Environment configuration template
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- Backend server running on `http://localhost:8000` (see `../backend/README.md`)

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the backend server URLs point to your running API instance:
```env
VITE_APP_BACKEND_SERVER=http://localhost:8000/api
VITE_APP_IMAGE_SERVER=http://localhost:8000/
VITE_APP_SITE_NAME=PizzaHub
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📦 Production Build & Testing

### Build for Production
Creates an optimized production bundle in `dist/`:
```bash
npm run build
```
Builds 160+ modules with zero compilation errors.

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

---

## 🔄 State Management Architecture

The application uses **Redux-Saga** to cleanly decouple UI components from asynchronous network calls:

1. **Component Dispatch:** UI components dispatch pure action objects (e.g. `dispatch(getCart())` or `dispatch(getProduct())`).
2. **Saga Watchers:** Background sagas intercept actions using `takeEvery` (e.g. `CartSagas.jsx`, `ProductSagas.jsx`).
3. **HTTP Service Layer:** `Redux/Sagas/Service/index.js` automatically attaches the user's stored JWT token (`localStorage.getItem("token")`) to request headers.
4. **Authoritative Reducers:** Reducers update the immutable state store, triggering reactive UI re-renders across all active views.
