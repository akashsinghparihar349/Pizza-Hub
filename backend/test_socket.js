/**
 * PizzaHub test_socket.js
 * Real-Time Socket.IO Authentication, Multi-Tenant Rooms & Event Isolation Suite
 */
process.env.NODE_ENV = "test"
process.env.DB_KEY = "mongodb://127.0.0.1:27017/PizzaHub_test"
process.env.JWT_SECRET_KEY = "test_super_secret_jwt_key_at_least_32_chars_long"

const http = require("http")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const { io: Client } = require("socket.io-client")

const { app } = require("./index")
const { initSocket, emitOrderStatusUpdated } = require("./helper/socket.helper")
const User = require("./models/user.model")
const Checkout = require("./models/checkout.model")

let server
let baseUrl
let socketUrl

let totalChecks = 0
let checksPassed = 0

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

function connectClient(token = null) {
  const options = {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false
  }
  if (token) {
    options.auth = { token }
  }
  return Client(socketUrl, options)
}

async function runSocketTests() {
  console.log("\n=======================================================")
  console.log("  PIZZAHUB SOCKET.IO REAL-TIME VERIFICATION SUITE")
  console.log("=======================================================\n")

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DB_KEY)
  }

  await Promise.all([User.deleteMany({}), Checkout.deleteMany({})])

  // Create HTTP server & initialize Socket.IO
  server = http.createServer(app)
  initSocket(server)

  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port
      socketUrl = `http://127.0.0.1:${port}`
      baseUrl = `http://127.0.0.1:${port}`
      console.log(`Socket server listening on ${socketUrl}\n`)
      resolve()
    })
  })

  const openClients = []

  try {
    // -------------------------------------------------------------------
    // SEED TEST DATA
    // -------------------------------------------------------------------
    const userA = await User.create({
      name: "Socket Alice",
      username: "alice_socket",
      email: "alice_sock@example.com",
      phone: "9111111111",
      password: "dummy_hashed_password",
      role: "Buyer"
    })
    const tokenA = jwt.sign({ data: { _id: userA._id, role: userA.role } }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h"
    })

    const userB = await User.create({
      name: "Socket Bob",
      username: "bob_socket",
      email: "bob_sock@example.com",
      phone: "9111111112",
      password: "dummy_hashed_password",
      role: "Buyer"
    })
    const tokenB = jwt.sign({ data: { _id: userB._id, role: userB.role } }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h"
    })

    const adminUser = await User.create({
      name: "Socket Admin",
      username: "admin_socket",
      email: "admin_sock@example.com",
      phone: "9111111113",
      password: "dummy_hashed_password",
      role: "Admin"
    })
    const tokenAdmin = jwt.sign({ data: { _id: adminUser._id, role: adminUser.role } }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h"
    })

    const orderA = await Checkout.create({
      user: userA._id,
      deliveryAddress: { name: "Alice", address: "Road 1", city: "City", pin: "110001", phone: "9111111111" },
      orderStatus: "Order Placed",
      subtotal: 300,
      shipping: 50,
      total: 350,
      products: [
        {
          product: new mongoose.Types.ObjectId(),
          name: "Cheese Pizza",
          quantity: 1,
          size: "Regular",
          total: 300
        }
      ]
    })

    console.log("--- 1. Handshake Authentication Checks ---")

    // Check 1: Unauthorized handshake rejection (Token missing)
    const unauthErr = await new Promise((resolve) => {
      const client = connectClient()
      openClients.push(client)
      client.on("connect_error", (err) => resolve(err.message))
    })
    assert(unauthErr.includes("Token missing"), "Unauthenticated connection without token is rejected")

    // Check 2: Invalid JWT token rejection
    const invalidTokenErr = await new Promise((resolve) => {
      const client = connectClient("invalid_garbage_token")
      openClients.push(client)
      client.on("connect_error", (err) => resolve(err.message))
    })
    assert(invalidTokenErr.includes("Invalid or expired token"), "Connection with invalid token is rejected")

    // Check 3: Authenticated customer connection
    const clientA = connectClient(tokenA)
    openClients.push(clientA)
    const connectedA = await new Promise((resolve) => {
      clientA.on("connect", () => resolve(true))
    })
    assert(connectedA, "Customer Alice connects successfully with verified JWT")

    // Check 4: Authenticated Customer Bob connection
    const clientB = connectClient(tokenB)
    openClients.push(clientB)
    const connectedB = await new Promise((resolve) => {
      clientB.on("connect", () => resolve(true))
    })
    assert(connectedB, "Customer Bob connects successfully with verified JWT")

    // Check 5: Authenticated Admin connection
    const clientAdmin = connectClient(tokenAdmin)
    openClients.push(clientAdmin)
    const connectedAdmin = await new Promise((resolve) => {
      clientAdmin.on("connect", () => resolve(true))
    })
    assert(connectedAdmin, "Admin connects successfully with verified JWT")

    console.log("\n--- 2. Room Subscriptions & Anti-Eavesdropping Checks ---")

    // Check 6: Valid subscription by order owner (Customer Alice)
    const subPromiseA = new Promise((resolve) => {
      clientA.once("order:subscribed", resolve)
    })
    clientA.emit("order:subscribe", { orderId: String(orderA._id) })
    const subResA = await subPromiseA
    assert(subResA.orderId === String(orderA._id), "Customer Alice subscribed to her own order room")

    // Check 7: Anti-eavesdropping check (Customer Bob attempting to track Alice's order)
    const bobEavesdropPromise = new Promise((resolve) => {
      clientB.once("order:error", resolve)
    })
    clientB.emit("order:subscribe", { orderId: String(orderA._id) })
    const bobError = await bobEavesdropPromise
    assert(bobError.message.includes("Access Denied"), "Customer Bob is denied tracking Alice's order room")

    // Check 8: Admin global live orders subscription
    const adminSubPromise = new Promise((resolve) => {
      clientAdmin.once("orders:adminSubscribed", resolve)
    })
    clientAdmin.emit("orders:subscribeAll")
    const adminSubRes = await adminSubPromise
    assert(adminSubRes.message.includes("Subscribed"), "Admin successfully subscribed to global orders room")

    console.log("\n--- 3. Real-Time Broadcast & Room Isolation Checks ---")

    let bobReceivedEvent = false
    clientB.on("order:statusUpdated", () => {
      bobReceivedEvent = true
    })

    const aliceEventPromise = new Promise((resolve) => {
      clientA.once("order:statusUpdated", resolve)
    })

    const adminEventPromise = new Promise((resolve) => {
      clientAdmin.once("order:statusUpdated", resolve)
    })

    // Server emits order status update for Alice's order
    emitOrderStatusUpdated({
      orderId: orderA._id,
      orderStatus: "Preparing",
      updatedAt: new Date(),
      statusHistory: [{ status: "Preparing", timestamp: new Date() }]
    })

    const aliceEvent = await aliceEventPromise
    const adminEvent = await adminEventPromise

    // Check 9: Customer Alice receives real-time update
    assert(aliceEvent.orderStatus === "Preparing", "Alice received real-time 'Preparing' status update")

    // Check 10: Admin board receives real-time update
    assert(adminEvent.orderStatus === "Preparing", "Admin board received live order update")

    // Check 11: Customer Bob (eavesdropper) received 0 events
    await new Promise((res) => setTimeout(res, 200))
    assert(!bobReceivedEvent, "Bob received 0 events for Alice's order (Strict Room Isolation verified)")

    console.log("\n=======================================================")
    console.log(`  SOCKET TESTS COMPLETE: ${checksPassed}/${totalChecks} CHECKS PASSED (100%)`)
    console.log("=======================================================\n")
    return true
  } finally {
    openClients.forEach((c) => {
      try {
        c.disconnect()
      } catch (e) { }
    })
    if (server) {
      await new Promise((res) => server.close(res))
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
    }
  }
}

if (require.main === module) {
  runSocketTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\nSOCKET TEST RUNNER FATAL ERROR:", err)
      process.exit(1)
    })
}

module.exports = { runSocketTests }
