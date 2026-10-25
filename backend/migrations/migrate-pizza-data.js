require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") })
const mongoose = require("mongoose")
const Product = require("../models/product.model")

async function migrate() {
  const dbKey = process.env.DB_KEY || "mongodb://127.0.0.1:27017/PizzaHub"
  console.log("Connecting to MongoDB:", dbKey)
  await mongoose.connect(dbKey)
  console.log("Connected successfully.")

  const products = await Product.find({})
  console.log(`Found ${products.length} products to verify/migrate.`)

  let updatedCount = 0
  for (const p of products) {
    let modified = false

    // Check sizes: replace apparel sizes with standard pizza sizes
    const hasApparelSize = p.size?.some(s => ["XXL", "XL", "L", "MD", "SM", "XS", "NB", "22", "24", "26", "28", "30", "32", "34", "36", "38", "40", "N/A"].includes(s))
    if (!p.size || p.size.length === 0 || hasApparelSize || p.size.includes("Regular")) {
      p.size = ["Small", "Medium", "Large", "Extra Large"]
      modified = true
    }

    // Configure size-specific prices per pizza
    if (!p.sizePrices || p.sizePrices.length === 0) {
      const base = Number(p.finalPrice || p.basePrice || 200)
      p.sizePrices = [
        { size: "Small", inches: "6 inches", price: Math.round(base * 0.8) },
        { size: "Medium", inches: "8 inches", price: base },
        { size: "Large", inches: "10 inches", price: Math.round(base * 1.4) },
        { size: "Extra Large", inches: "12 inches", price: Math.round(base * 1.8) }
      ]
      modified = true
    }

    // Check isVeg
    if (p.isVeg === undefined || p.isVeg === null) {
      const lowerName = (p.name || "").toLowerCase()
      p.isVeg = !(lowerName.includes("pepperoni") || lowerName.includes("chicken") || lowerName.includes("meat") || lowerName.includes("non-veg"))
      modified = true
    }

    // Check crust
    if (!p.crust) {
      p.crust = "Classic Hand Tossed"
      modified = true
    }

    // Check prepTime
    if (!p.prepTime) {
      p.prepTime = "20-25 mins"
      modified = true
    }

    // Clean up clothing color array
    if (p.color && p.color.length > 0) {
      p.color = []
      modified = true
    }

    if (modified) {
      await p.save()
      updatedCount++
      console.log(`Migrated product: "${p.name}" (ID: ${p._id}) -> Veg: ${p.isVeg}, Crust: ${p.crust}, Sizes: [${p.size.join(", ")}]`)
    }
  }

  console.log(`\nMigration completed. ${updatedCount} products updated out of ${products.length}.`)
  await mongoose.disconnect()
}

migrate().catch(err => {
  console.error("Migration failed:", err)
  process.exit(1)
})
