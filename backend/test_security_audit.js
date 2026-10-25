/**
 * PizzaHub test_security_audit.js
 * Comprehensive Security, IDOR, Privilege Escalation & Health Probe Suite
 */
process.env.NODE_ENV = "test"
process.env.DB_KEY = "mongodb://127.0.0.1:27017/PizzaHub_test"
process.env.JWT_SECRET_KEY = "test_super_secret_jwt_key_at_least_32_chars_long"

const http = require("http")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const { app } = require("./index")
const User = require("./models/user.model")
const Product = require("./models/product.model")
const Maincategory = require("./models/maincategory.model")
const Subcategory = require("./models/subcategory.model")
const Brand = require("./models/brand.model")

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

async function runSecurityAuditTests() {
  console.log("\n=======================================================")
  console.log("  PIZZAHUB SECURITY & HARDENING AUDIT SUITE")
  console.log("=======================================================\n")

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DB_KEY)
  }

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Maincategory.deleteMany({}),
    Subcategory.deleteMany({}),
    Brand.deleteMany({})
  ])

  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port
      baseUrl = `http://127.0.0.1:${port}`
      console.log(`Security test server running at ${baseUrl}\n`)
      resolve()
    })
  })

  try {
    // -------------------------------------------------------------------
    // SEEDING TEST IDENTITIES
    // -------------------------------------------------------------------
    const passwordHash = await bcrypt.hash("SecurePass@123", 12)

    const customerA = await User.create({
      name: "Security Alice",
      username: "alice_sec",
      email: "alice_sec@example.com",
      phone: "9200000001",
      password: passwordHash,
      role: "Buyer"
    })
    const tokenA = jwt.sign(
      { data: { _id: customerA._id, role: customerA.role, username: customerA.username } },
      process.env.JWT_SECRET_KEY
    )

    const customerB = await User.create({
      name: "Attacker Bob",
      username: "bob_sec",
      email: "bob_sec@example.com",
      phone: "9200000002",
      password: passwordHash,
      role: "Buyer"
    })
    const tokenB = jwt.sign(
      { data: { _id: customerB._id, role: customerB.role, username: customerB.username } },
      process.env.JWT_SECRET_KEY
    )

    const maincat = await Maincategory.create({ name: "Security Catalog", pic: "uploads/sec.jpg" })
    const subcat = await Subcategory.create({ name: "Audit Pizzas", pic: "uploads/audit.jpg" })
    const brand = await Brand.create({ name: "Sec Brand", pic: "uploads/brand.jpg" })

    const sampleProduct = await Product.create({
      name: "Margherita Security Pizza",
      maincategory: maincat._id,
      subcategory: subcat._id,
      brand: brand._id,
      basePrice: 150,
      discount: 0,
      finalPrice: 150,
      stock: true,
      stockQuantity: 100,
      pic: ["uploads/margherita.jpg"]
    })

    console.log("--- 1. Infrastructure Readiness & Security Headers ---")

    // Check 1: Health check endpoint probe
    const healthRes = await request("GET", "/health")
    assert(healthRes.status === 200, "Health probe /health returns HTTP 200 OK")
    assert(healthRes.body.status === "healthy", "Service status reports 'healthy'")
    assert(healthRes.body.database === "connected", "MongoDB database state reports 'connected'")

    // Check 2: Helmet security headers
    assert(
      healthRes.headers["x-content-type-options"] === "nosniff",
      "Helmet header 'X-Content-Type-Options: nosniff' is present"
    )

    console.log("\n--- 2. Tenant Isolation & IDOR Defenses ---")

    // Check 3: Profile read tenant isolation (Bob blocked from viewing Alice's profile)
    const crossProfileRead = await request("GET", `/api/user/${customerA._id}`, null, tokenB)
    assert(crossProfileRead.status === 403, "Bob cannot view Alice's profile (HTTP 403 Forbidden)")

    // Check 4: Profile update tenant isolation (Bob blocked from editing Alice's profile)
    const crossProfileUpdate = await request(
      "PUT",
      `/api/user/${customerA._id}`,
      { name: "Hacked by Bob" },
      tokenB
    )
    assert(crossProfileUpdate.status === 403, "Bob cannot modify Alice's profile (HTTP 403 Forbidden)")

    console.log("\n--- 3. Privilege Escalation & Role Tampering Defenses ---")

    // Check 5: Vertical privilege escalation defense (Alice trying to elevate herself to Super Admin)
    const privEscalationRes = await request(
      "PUT",
      `/api/user/${customerA._id}`,
      { role: "Super Admin" },
      tokenA
    )
    assert(privEscalationRes.status === 200, "Self update executed without crash")
    const refreshedAlice = await User.findById(customerA._id)
    assert(refreshedAlice.role === "Buyer", "Role update ignored: Alice remains role 'Buyer'")

    console.log("\n--- 4. Sensitive Information Sanitization ---")

    // Check 6: Password hash and OTP options omitted from API profile responses
    const ownProfileRes = await request("GET", `/api/user/${customerA._id}`, null, tokenA)
    assert(ownProfileRes.status === 200, "Alice fetched own profile HTTP 200")
    assert(ownProfileRes.body.data.password === undefined, "Password hash is NOT exposed in response")
    assert(
      ownProfileRes.body.data.passwordResetOptions === undefined,
      "passwordResetOptions is NOT exposed in response"
    )

    console.log("\n--- 5. Account Takeover & Reset Security ---")

    // Check 7: Account takeover defense (Password reset step 3 without valid OTP is rejected)
    const fakeResetRes = await request("POST", "/api/user/forget-password-3", {
      username: "alice_sec",
      password: "NewPassword@123",
      otp: "000000" // Wrong OTP
    })
    assert(fakeResetRes.status === 400, "Password reset with wrong OTP rejected HTTP 400")

    console.log("\n--- 6. Catalog Integrity & Stock Tampering Defense ---")

    // Check 8: Stock tampering defense (Buyer blocked from updating product catalog or stock)
    const tamperStockRes = await request(
      "PUT",
      `/api/product/${sampleProduct._id}`,
      { stockQuantity: 999999, basePrice: 1 },
      tokenA
    )
    assert(tamperStockRes.status === 403, "Buyer is blocked from modifying product catalog HTTP 403")

    console.log("\n=======================================================")
    console.log(`  SECURITY AUDIT COMPLETE: ${checksPassed}/${totalChecks} CHECKS PASSED (100%)`)
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
  runSecurityAuditTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\nSECURITY TEST RUNNER FATAL ERROR:", err)
      process.exit(1)
    })
}

module.exports = { runSecurityAuditTests }
