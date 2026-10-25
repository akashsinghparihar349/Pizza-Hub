/**
 * PizzaHub test_inventory_restaurant.js
 * Inventory Atomicity, Multi-Tenant Restaurants, Address Book & Webhook Suite
 */
process.env.NODE_ENV = "test"
process.env.DB_KEY = "mongodb://127.0.0.1:27017/PizzaHub_test"
process.env.JWT_SECRET_KEY = "test_super_secret_jwt_key_at_least_32_chars_long"
process.env.RPWEBHOOKSECRET = "test_webhook_secret_key"
process.env.RPSECRETKEY = "test_webhook_secret_key"

const http = require("http")
const crypto = require("crypto")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const { app } = require("./index")
const User = require("./models/user.model")
const Product = require("./models/product.model")
const Maincategory = require("./models/maincategory.model")
const Subcategory = require("./models/subcategory.model")
const Brand = require("./models/brand.model")
const CustomizationItem = require("./models/customization.model")
const Cart = require("./models/cart.model")
const Checkout = require("./models/checkout.model")
const Ingredient = require("./models/inventory.model")
const Restaurant = require("./models/restaurant.model")
const { checkLowStockAndAlert } = require("./helper/inventory.helper")

let serverInstance
let baseUrl

function request(method, path, body = null, token = null, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl)
    const headers = { "Content-Type": "application/json", ...customHeaders }
    if (token) headers["Authorization"] = `Bearer ${token}`

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          let parsed
          try {
            parsed = JSON.parse(data)
          } catch (e) {
            parsed = data
          }
          resolve({ status: res.statusCode, body: parsed, headers: res.headers })
        })
      }
    )

    req.on("error", reject)
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body))
    }
    req.end()
  })
}

let checksPassed = 0
let totalChecks = 0

function assert(condition, message) {
  totalChecks++
  if (!condition) {
    console.error(`  ❌ CHECK ${totalChecks} FAILED: ${message}`)
    throw new Error(`Assertion failed: ${message}`)
  } else {
    checksPassed++
    console.log(`  ✓ CHECK ${totalChecks}: ${message}`)
  }
}

async function runInventoryRestaurantTests() {
  console.log("\n=======================================================")
  console.log("  PIZZAHUB INVENTORY, RESTAURANT & INTEGRATION SUITE")
  console.log("=======================================================\n")

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DB_KEY)
  }

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Maincategory.deleteMany({}),
    Subcategory.deleteMany({}),
    Brand.deleteMany({}),
    CustomizationItem.deleteMany({}),
    Cart.deleteMany({}),
    Checkout.deleteMany({}),
    Ingredient.deleteMany({}),
    Restaurant.deleteMany({})
  ])

  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port
      baseUrl = `http://127.0.0.1:${port}`
      console.log(`Test server running at ${baseUrl}\n`)
      resolve()
    })
  })

  try {
    // -------------------------------------------------------------------
    // SEEDING IDENTITIES
    // -------------------------------------------------------------------
    const passwordHash = await bcrypt.hash("Test@123456", 12)
    const admin = await User.create({
      name: "Admin User",
      username: "admin_test",
      email: "admin_test@example.com",
      phone: "9100000001",
      password: passwordHash,
      role: "Admin"
    })
    const tokenAdmin = jwt.sign({ data: { _id: admin._id, role: admin.role } }, process.env.JWT_SECRET_KEY)

    const buyer = await User.create({
      name: "Buyer Charlie",
      username: "charlie",
      email: "charlie@example.com",
      phone: "9100000002",
      password: passwordHash,
      role: "Buyer"
    })
    const tokenBuyer = jwt.sign({ data: { _id: buyer._id, role: buyer.role } }, process.env.JWT_SECRET_KEY)

    const restaurantApplicant = await User.create({
      name: "Chef Mario",
      username: "mario",
      email: "mario@example.com",
      phone: "9100000003",
      password: passwordHash,
      role: "Buyer"
    })
    const tokenMario = jwt.sign(
      { data: { _id: restaurantApplicant._id, role: restaurantApplicant.role } },
      process.env.JWT_SECRET_KEY
    )

    console.log("--- 1. Raw Ingredient Inventory & Manual Adjustments ---")

    // Check 1: Create raw ingredient
    const cheeseOption = await CustomizationItem.create({
      name: "Mozzarella Block",
      type: "cheese",
      price: 50,
      status: true
    })

    const createIngRes = await request(
      "POST",
      "/api/inventory",
      {
        name: "Dairy Mozzarella Cheese",
        customizationItem: cheeseOption._id,
        quantity: 20,
        unit: "portions",
        lowStockThreshold: 5
      },
      tokenAdmin
    )
    assert(createIngRes.status === 200, "Admin can create raw ingredient HTTP 200")
    const ingId = createIngRes.body.data._id

    // Check 2: Authorized manual adjustment (+10)
    const adjRes1 = await request(
      "POST",
      "/api/inventory/adjust",
      { ingredientId: ingId, adjustment: 10, reason: "Morning delivery batch" },
      tokenAdmin
    )
    assert(adjRes1.status === 200, "Stock increased by +10 portions (New: 30)")
    assert(adjRes1.body.data.quantity === 30, "Current quantity verified as 30")

    // Check 3: Negative stock prevention (attempt to adjust -50 when stock is 30)
    const adjRes2 = await request(
      "POST",
      "/api/inventory/adjust",
      { ingredientId: ingId, adjustment: -50, reason: "Excessive deduction" },
      tokenAdmin
    )
    assert(adjRes2.status === 400, "Negative stock adjustment rejected with HTTP 400")

    console.log("\n--- 2. Low-Stock Cron & Deduplicated Alerts ---")

    // Check 4: Adjust stock below threshold (set to 3, threshold is 5)
    await request(
      "POST",
      "/api/inventory/adjust",
      { ingredientId: ingId, adjustment: -27 }, // 30 - 27 = 3
      tokenAdmin
    )

    // Run low-stock scan
    const alertResult1 = await checkLowStockAndAlert()
    assert(alertResult1.alerted === true, "Low-stock alert triggered when quantity <= threshold")
    assert(alertResult1.count === 1, "Alert identified 1 low-stock ingredient")

    // Check 5: Duplicate alert prevention (same stock level)
    const alertResult2 = await checkLowStockAndAlert()
    assert(alertResult2.alerted === false, "Duplicate alert prevented when stock level hasn't changed")

    console.log("\n--- 3. Multi-Tenant Restaurant Onboarding & Strict Isolation ---")

    // Check 6: User applies for restaurant registration
    const applyRes = await request(
      "POST",
      "/api/restaurant/apply",
      {
        name: "Mario's Authentic Woodfired Pizza",
        street: "12 Little Italy Lane",
        city: "Delhi",
        state: "Delhi",
        pin: "110002",
        cuisine: ["Woodfired Pizza", "Calzones"]
      },
      tokenMario
    )
    assert(applyRes.status === 201, "Restaurant application submitted HTTP 201 (Status: Pending)")
    const restaurantId = applyRes.body.data._id

    // Check 7: Admin approves restaurant application
    const approveRes = await request("PUT", `/api/restaurant/${restaurantId}/approve`, {}, tokenAdmin)
    assert(approveRes.status === 200, "Admin approved restaurant application HTTP 200")
    assert(approveRes.body.data.approvalStatus === "Approved", "Restaurant status is now 'Approved'")

    // Check 8: Automatic role elevation from 'Buyer' to 'Restaurant'
    const updatedMario = await User.findById(restaurantApplicant._id)
    assert(updatedMario.role === "Restaurant", "Owner role automatically promoted to 'Restaurant'")

    const tokenMarioApproved = jwt.sign(
      { data: { _id: updatedMario._id, role: updatedMario.role } },
      process.env.JWT_SECRET_KEY
    )

    // Check 9: Restaurant owner view own restaurant profile
    const myRestRes = await request("GET", "/api/restaurant/me", null, tokenMarioApproved)
    assert(myRestRes.status === 200, "Restaurant owner accessed /api/restaurant/me")
    assert(myRestRes.body.data.name === "Mario's Authentic Woodfired Pizza", "Profile data matches")

    // Check 10: Restaurant tenant isolation (Restaurant products)
    const maincat = await Maincategory.create({ name: "Woodfired", pic: "uploads/wf.jpg" })
    const subcat = await Subcategory.create({ name: "Italian Specials", pic: "uploads/is.jpg" })
    const brand = await Brand.create({ name: "Mario Exclusive", pic: "uploads/mario.jpg" })

    const marioProduct = await Product.create({
      name: "Truffle Mushroom Pizza",
      maincategory: maincat._id,
      subcategory: subcat._id,
      brand: brand._id,
      restaurant: restaurantId,
      basePrice: 400,
      discount: 0,
      finalPrice: 400,
      stock: true,
      stockQuantity: 20,
      pic: ["uploads/truffle.jpg"]
    })

    const marioProductsRes = await request("GET", "/api/restaurant/my-products", null, tokenMarioApproved)
    assert(marioProductsRes.status === 200, "Restaurant owner fetched own products")
    assert(marioProductsRes.body.count === 1, "Only products belonging to Mario's restaurant returned")

    console.log("\n--- 4. Customer Address Book CRUD Checks ---")

    // Check 11: Add Address
    const addAddrRes = await request(
      "POST",
      "/api/user/address",
      {
        name: "Charlie Office",
        address: "DLF Cyber City, Tower A",
        city: "Gurugram",
        state: "Haryana",
        pin: "122002",
        isDefault: true
      },
      tokenBuyer
    )
    assert(addAddrRes.status === 200, "Customer added address to address book HTTP 200")
    assert(addAddrRes.body.data.length === 1, "Address book contains 1 entry")

    // Check 12: Get Addresses
    const getAddrRes = await request("GET", "/api/user/address", null, tokenBuyer)
    assert(getAddrRes.status === 200, "Customer retrieved address book HTTP 200")
    assert(getAddrRes.body.data[0].city === "Gurugram", "Address verified as Gurugram")

    // Check 13: Delete Address
    const delAddrRes = await request("DELETE", "/api/user/address/0", null, tokenBuyer)
    assert(delAddrRes.status === 200, "Customer deleted address at index 0 HTTP 200")
    assert(delAddrRes.body.data.length === 0, "Address book is now empty")

    console.log("\n--- 5. Email Verification with OTP ---")

    // Set OTP on buyer
    buyer.passwordResetOptions = { otp: "554433", date: new Date() }
    await buyer.save()

    // Check 14: Invalid OTP rejection
    const invalidOtpRes = await request("POST", "/api/user/verify-email", { email: buyer.email, otp: "000000" })
    assert(invalidOtpRes.status === 400, "Invalid email verification code rejected HTTP 400")

    // Check 15: Valid OTP verification
    const validOtpRes = await request("POST", "/api/user/verify-email", { email: buyer.email, otp: "554433" })
    assert(validOtpRes.status === 200, "Email verified successfully HTTP 200")
    const refreshedBuyer = await User.findById(buyer._id)
    assert(refreshedBuyer.emailVerified === true, "emailVerified flag persisted as true in MongoDB")

    console.log("\n--- 6. Asynchronous Razorpay Webhook HMAC Verification ---")

    const testCheckout = await Checkout.create({
      user: buyer._id,
      deliveryAddress: { name: "Charlie", address: "Road 5", city: "Delhi", pin: "110001", phone: "9100000002" },
      orderStatus: "Order Placed",
      paymentMode: "Net Banking",
      paymentStatus: "Pending",
      subtotal: 400,
      shipping: 50,
      total: 450,
      rporderid: "order_webhook_test_123",
      products: [
        {
          product: marioProduct._id,
          name: "Truffle Mushroom Pizza",
          quantity: 1,
          size: "Regular",
          total: 400
        }
      ]
    })

    const webhookPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_webhook_999",
            order_id: "order_webhook_test_123",
            status: "captured",
            amount: 45000
          }
        }
      }
    })

    // Check 16: Invalid webhook signature rejection
    const invalidWebhookRes = await request(
      "POST",
      "/api/checkout/webhook",
      webhookPayload,
      null,
      { "x-razorpay-signature": "forged_signature" }
    )
    assert(invalidWebhookRes.status === 400, "Forged webhook signature rejected HTTP 400")

    // Check 17: Valid cryptographic webhook HMAC acceptance
    const validWebhookSig = crypto
      .createHmac("sha256", process.env.RPWEBHOOKSECRET)
      .update(webhookPayload)
      .digest("hex")

    const validWebhookRes = await request(
      "POST",
      "/api/checkout/webhook",
      webhookPayload,
      null,
      { "x-razorpay-signature": validWebhookSig }
    )
    assert(validWebhookRes.status === 200, "Valid Razorpay webhook signature accepted HTTP 200")

    const updatedOrder = await Checkout.findById(testCheckout._id)
    assert(updatedOrder.paymentStatus === "Done", "Order paymentStatus updated to 'Done' via webhook")
    assert(updatedOrder.rppid === "pay_webhook_999", "Payment ID recorded from webhook payload")

    console.log("\n--- 7. Live Admin Dashboard Metrics ---")

    // Check 18: Dashboard Stats
    const dashboardRes = await request("GET", "/api/dashboard/stats", null, tokenAdmin)
    assert(dashboardRes.status === 200, "Admin accessed dashboard metrics HTTP 200")
    assert(dashboardRes.body.data.revenue.totalRevenue >= 450, "Dashboard includes revenue from paid orders")
    assert(dashboardRes.body.data.users.restaurantsCount === 1, "Dashboard counts 1 approved restaurant")
    assert(dashboardRes.body.data.orders.totalOrders >= 1, "Dashboard counts active orders")

    console.log("\n=======================================================")
    console.log(`  INVENTORY & RESTAURANT TESTS COMPLETE: ${checksPassed}/${totalChecks} CHECKS PASSED (100%)`)
    console.log("=======================================================\n")
    return true
  } finally {
    if (serverInstance) {
      await new Promise((res) => serverInstance.close(res))
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
    }
  }
}

if (require.main === module) {
  runInventoryRestaurantTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\nTEST RUNNER FATAL ERROR:", err)
      process.exit(1)
    })
}

module.exports = { runInventoryRestaurantTests }
