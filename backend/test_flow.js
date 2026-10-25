/**
 * PizzaHub test_flow.js
 * End-to-End Core Flow & Order Lifecycle Automated Verification Suite
 */
process.env.NODE_ENV = "test"
process.env.DB_KEY = "mongodb://127.0.0.1:27017/PizzaHub_test"
process.env.JWT_SECRET_KEY = "test_super_secret_jwt_key_at_least_32_chars_long"
process.env.RPKEYID = "rzp_test_flow_key"
process.env.RPSECRETKEY = "rzp_test_flow_secret"

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

let serverInstance
let baseUrl

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl)
    const headers = { "Content-Type": "application/json" }
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

async function runFlowTests() {
  console.log("\n=======================================================")
  console.log("  PIZZAHUB END-TO-END FLOW VERIFICATION SUITE")
  console.log("=======================================================\n")

  // 1. Setup isolated database connection
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DB_KEY)
  }

  // 2. Clear test database collections
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Maincategory.deleteMany({}),
    Subcategory.deleteMany({}),
    Brand.deleteMany({}),
    CustomizationItem.deleteMany({}),
    Cart.deleteMany({}),
    Checkout.deleteMany({})
  ])

  // 3. Start ephemeral test HTTP server on port 0
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
    // SEEDING TEST FIXTURES
    // -------------------------------------------------------------------
    console.log("--- 1. Fixture Seeding & Identity Setup ---")
    const maincat = await Maincategory.create({ name: "Pizzas", pic: "uploads/pizzas.jpg" })
    const subcat = await Subcategory.create({ name: "Veg Pizzas", pic: "uploads/veg.jpg" })
    const brand = await Brand.create({ name: "PizzaHub Gourmet", pic: "uploads/brand.jpg" })

    const testProduct = await Product.create({
      name: "Farmhouse Deluxe Pizza",
      maincategory: maincat._id,
      subcategory: subcat._id,
      brand: brand._id,
      basePrice: 200,
      discount: 10,
      finalPrice: 180,
      stock: true,
      stockQuantity: 50,
      size: ["Regular", "Medium", "Large"],
      pic: ["uploads/farmhouse.jpg"]
    })

    const tamperProduct = await Product.create({
      name: "Tamper Test Margherita Pizza",
      maincategory: maincat._id,
      subcategory: subcat._id,
      brand: brand._id,
      basePrice: 200,
      discount: 10,
      finalPrice: 180,
      stock: true,
      stockQuantity: 50,
      size: ["Regular", "Medium", "Large"],
      pic: ["uploads/margherita.jpg"]
    })

    const crustBase = await CustomizationItem.create({
      name: "Cheese Burst Crust",
      type: "base",
      price: 80,
      status: true
    })

    const sauce = await CustomizationItem.create({
      name: "Basil Pesto Sauce",
      type: "sauce",
      price: 40,
      status: true
    })

    const cheese = await CustomizationItem.create({
      name: "Smoked Gouda",
      type: "cheese",
      price: 75,
      status: true
    })

    const topping = await CustomizationItem.create({
      name: "Black Olives",
      type: "veggie",
      price: 35,
      status: true
    })

    // Create Buyer A
    const passwordHash = await bcrypt.hash("Buyer@123456", 12)
    const buyerA = await User.create({
      name: "Customer Alice",
      username: "alice",
      email: "alice@example.com",
      phone: "9876543210",
      password: passwordHash,
      role: "Buyer"
    })
    const tokenA = jwt.sign(
      { data: { _id: buyerA._id, role: buyerA.role, username: buyerA.username } },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    )

    // Create Buyer B
    const buyerB = await User.create({
      name: "Customer Bob",
      username: "bob",
      email: "bob@example.com",
      phone: "9876543211",
      password: passwordHash,
      role: "Buyer"
    })
    const tokenB = jwt.sign(
      { data: { _id: buyerB._id, role: buyerB.role, username: buyerB.username } },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    )

    // Create Admin
    const admin = await User.create({
      name: "Store Manager",
      username: "admin_manager",
      email: "admin@example.com",
      phone: "9876543212",
      password: passwordHash,
      role: "Admin"
    })
    const tokenAdmin = jwt.sign(
      { data: { _id: admin._id, role: admin.role, username: admin.username } },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    )

    assert(buyerA && buyerB && admin, "Users and catalog seeded successfully")

    // -------------------------------------------------------------------
    // CART & PRICING VERIFICATION
    // -------------------------------------------------------------------
    console.log("\n--- 2. Cart Pricing & Customization Engine Checks ---")

    // Check 1: Add Standard Pizza
    const cartRes1 = await request(
      "POST",
      "/api/cart",
      { product: String(testProduct._id), size: "Regular", quantity: 1 },
      tokenA
    )
    assert(cartRes1.status === 200, "Add standard pizza returns HTTP 200")
    assert(cartRes1.body.data.total === 180, "Standard regular pizza price is correctly ₹180")
    const standardCartItemId = cartRes1.body.data._id

    // Check 2: Add Customized Pizza with Base, Sauce, Cheese, Veggies & Multiplier
    // basePrice (180) + base (80) + sauce (40) + cheese (75) + topping (35) = 410. Medium multiplier (1.4) = 574.
    const cartRes2 = await request(
      "POST",
      "/api/cart",
      {
        product: String(testProduct._id),
        size: "Medium",
        quantity: 2,
        baseId: String(crustBase._id),
        sauceId: String(sauce._id),
        cheeseId: String(cheese._id),
        veggieIds: [String(topping._id)]
      },
      tokenA
    )
    assert(cartRes2.status === 200, "Add customized pizza returns HTTP 200")
    assert(cartRes2.body.data.unitPrice === 574, "Medium customized unit price calculated server-side as ₹574")
    assert(cartRes2.body.data.total === 1148, "Quantity 2 total is correctly ₹1148")

    // Check 3: Client-side fake price tampering defense
    const tamperRes = await request(
      "POST",
      "/api/cart",
      {
        product: String(tamperProduct._id),
        size: "Regular",
        quantity: 1,
        unitPrice: 1, // Attacker attempts to forge price of ₹1
        total: 1
      },
      tokenA
    )
    assert(tamperRes.status === 200, "Tampered request handled safely")
    assert(tamperRes.body.data.unitPrice === 180, "Fake price ₹1 dropped, authoritative ₹180 restored")
    assert(tamperRes.body.data.total === 180, "Authoritative total ₹180 enforced")

    // Check 4: Quantity update & dynamic resizing in cart
    const updateRes = await request(
      "PUT",
      `/api/cart/${standardCartItemId}`,
      { quantity: 3, size: "Large" }, // 180 * 1.8 = 324 * 3 = 972
      tokenA
    )
    assert(updateRes.status === 200, "Cart item update returns HTTP 200")
    assert(updateRes.body.data.size === "Large", "Size updated to Large")
    assert(updateRes.body.data.total === 972, "Authoritative resized total correctly ₹972")

    // Check 5: Cross-customer cart access rejection (Customer B cannot view Customer A's cart)
    const crossCartRes = await request("GET", `/api/cart/user/${buyerA._id}`, null, tokenB)
    assert(crossCartRes.status === 403, "Customer B cannot view Customer A's cart (HTTP 403)")

    // Clean up extra items, keep 1 item of ₹972 for checkout
    await request("DELETE", `/api/cart/${cartRes2.body.data._id}`, null, tokenA)
    await request("DELETE", `/api/cart/${tamperRes.body.data._id}`, null, tokenA)

    // -------------------------------------------------------------------
    // CHECKOUT & ORDER STATE MACHINE VERIFICATION
    // -------------------------------------------------------------------
    console.log("\n--- 3. Checkout, Pricing Snapshots & State Machine ---")

    // Check 6: Empty cart checkout rejection
    const emptyCheckoutRes = await request(
      "POST",
      "/api/checkout",
      {
        deliveryAddress: { name: "Bob", address: "456 Elm St", city: "Delhi", pin: "110001", phone: "9876543211" }
      },
      tokenB // Bob's cart is empty
    )
    assert(emptyCheckoutRes.status === 400, "Empty cart checkout is rejected with HTTP 400")

    // Check 7: Successful checkout with Free delivery (subtotal ₹972 >= 500)
    const checkoutRes = await request(
      "POST",
      "/api/checkout",
      {
        deliveryAddress: { name: "Alice", address: "123 Main St", city: "Delhi", pin: "110001", phone: "9876543210" },
        paymentMode: "Net Banking"
      },
      tokenA
    )
    assert(checkoutRes.status === 200, "Checkout created successfully HTTP 200")
    const orderData = checkoutRes.body.data
    assert(orderData.subtotal === 972, "Order subtotal is ₹972")
    assert(orderData.shipping === 0, "Free delivery applied (₹0) since subtotal >= ₹500")
    assert(orderData.total === 972, "Grand total matches subtotal ₹972")
    assert(orderData.orderStatus === "Order Placed", "Initial status is 'Order Placed'")
    assert(orderData.statusHistory.length === 1, "Status history initiated with 1 entry")

    // Check 8: Cart auto-cleared after checkout
    const postCheckoutCart = await request("GET", `/api/cart/user/${buyerA._id}`, null, tokenA)
    assert(postCheckoutCart.body.count === 0, "Customer cart automatically cleared after order placement")

    // -------------------------------------------------------------------
    // RAZORPAY PAYMENT VERIFICATION & IDEMPOTENCY
    // -------------------------------------------------------------------
    console.log("\n--- 4. Razorpay Signature Verification & Idempotency ---")

    // Check 9: Tampered signature rejection
    const fakeVerifyRes = await request(
      "POST",
      "/api/checkout/verify-order",
      {
        checkid: String(orderData._id),
        razorpay_order_id: "order_test_12345",
        razorpay_payment_id: "pay_test_99999",
        razorpay_signature: "tampered_fake_signature"
      },
      tokenA
    )
    assert(fakeVerifyRes.status === 400, "Tampered Razorpay signature is rejected HTTP 400")

    // Check 10: Cryptographically valid signature acceptance
    const validRpOrderId = "order_test_valid_123"
    const validPaymentId = "pay_test_valid_456"
    const validSignature = crypto
      .createHmac("sha256", process.env.RPSECRETKEY)
      .update(`${validRpOrderId}|${validPaymentId}`)
      .digest("hex")

    const validVerifyRes = await request(
      "POST",
      "/api/checkout/verify-order",
      {
        checkid: String(orderData._id),
        razorpay_order_id: validRpOrderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature
      },
      tokenA
    )
    assert(validVerifyRes.status === 200, "Valid cryptographic signature verified HTTP 200")
    assert(validVerifyRes.body.data.paymentStatus === "Done", "Order paymentStatus updated to 'Done'")

    // Check 11: Idempotent duplicate verification handling
    const duplicateVerifyRes = await request(
      "POST",
      "/api/checkout/verify-order",
      {
        checkid: String(orderData._id),
        razorpay_order_id: validRpOrderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature
      },
      tokenA
    )
    assert(duplicateVerifyRes.status === 200, "Duplicate payment verification handled idempotently without error")

    // -------------------------------------------------------------------
    // LIFECYCLE STATE MACHINE VALIDATION
    // -------------------------------------------------------------------
    console.log("\n--- 5. Order Lifecycle State Machine & Cancellation Rules ---")

    // Check 12: Invalid transition rejection (jumping 'Order Placed' directly to 'Delivered')
    const invalidJumpRes = await request(
      "PUT",
      `/api/checkout/${orderData._id}`,
      { orderStatus: "Delivered" },
      tokenAdmin
    )
    assert(invalidJumpRes.status === 400, "Direct transition from 'Order Placed' to 'Delivered' rejected HTTP 400")

    // Check 13: Permitted transition: 'Order Placed' -> 'Accepted'
    const acceptRes = await request(
      "PUT",
      `/api/checkout/${orderData._id}`,
      { orderStatus: "Accepted" },
      tokenAdmin
    )
    assert(acceptRes.status === 200, "Transition to 'Accepted' permitted HTTP 200")

    // Check 14: Permitted transition: 'Accepted' -> 'Preparing'
    const prepRes = await request(
      "PUT",
      `/api/checkout/${orderData._id}`,
      { orderStatus: "Preparing" },
      tokenAdmin
    )
    assert(prepRes.status === 200, "Transition to 'Preparing' permitted HTTP 200")

    // Check 15: Customer cancellation rejection after kitchen preparation began
    const lateCancelRes = await request(
      "PUT",
      `/api/checkout/${orderData._id}`,
      { orderStatus: "Cancelled" },
      tokenA
    )
    assert(lateCancelRes.status === 400, "Customer cancellation blocked after kitchen preparation began HTTP 400")

    // Check 16: Complete delivery transition sequence
    const outForDeliveryRes = await request(
      "PUT",
      `/api/checkout/${orderData._id}`,
      { orderStatus: "Out for Delivery" },
      tokenAdmin
    )
    assert(outForDeliveryRes.status === 200, "Transition to 'Out for Delivery' permitted HTTP 200")

    const deliveredRes = await request(
      "PUT",
      `/api/checkout/${orderData._id}`,
      { orderStatus: "Delivered" },
      tokenAdmin
    )
    assert(deliveredRes.status === 200, "Transition to 'Delivered' permitted HTTP 200")
    assert(deliveredRes.body.data.orderStatus === "Delivered", "Final terminal status is 'Delivered'")

    console.log("\n=======================================================")
    console.log(`  FLOW TESTS COMPLETE: ${checksPassed}/${totalChecks} CHECKS PASSED (100%)`)
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
  runFlowTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\nTEST RUNNER FATAL ERROR:", err)
      process.exit(1)
    })
}

module.exports = { runFlowTests }
