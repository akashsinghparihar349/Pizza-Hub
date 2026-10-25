const Product = require("../models/product.model")
const CustomizationItem = require("../models/customization.model")

const SIZE_MULTIPLIERS = {
  Small: 0.8,
  Medium: 1.4,
  Large: 1.8,
  "Extra Large": 2.2,
  Regular: 1.0
}

const PIZZA_SIZE_CONFIGS = [
  { name: "Small", inches: "6 inches", label: "Small (6 inches)" },
  { name: "Medium", inches: "8 inches", label: "Medium (8 inches)" },
  { name: "Large", inches: "10 inches", label: "Large (10 inches)" },
  { name: "Extra Large", inches: "12 inches", label: "Extra Large (12 inches)" },
  { name: "Regular", inches: "8 inches", label: "Regular" }
]

/**
 * Server-side trusted price calculation and customization validator
 */
async function computeItemPrice({
  productId,
  size = "Medium",
  baseId,
  sauceId,
  cheeseId,
  veggieIds = [],
  quantity = 1
}) {
  // 1. Fetch and validate product
  const product = await Product.findById(productId)
  if (!product) {
    throw new Error("Product not found")
  }
  if (!product.status) {
    throw new Error(`Product '${product.name}' is currently unavailable`)
  }

  const cleanQuantity = Math.max(1, parseInt(quantity, 10) || 1)

  // Normalize requested size
  let matchedConfig = PIZZA_SIZE_CONFIGS.find(c => 
    c.name.toLowerCase() === (size || "").toLowerCase() ||
    (size || "").toLowerCase().startsWith(c.name.toLowerCase())
  )
  const validSize = matchedConfig ? matchedConfig.name : (size || "Medium")

  // Check if size-specific price is configured on this pizza
  let configuredPrice = null
  if (product.sizePrices && product.sizePrices.length > 0) {
    const match = product.sizePrices.find(sp => 
      sp.size?.toLowerCase() === validSize.toLowerCase() ||
      validSize.toLowerCase().startsWith(sp.size?.toLowerCase())
    )
    if (match && typeof match.price === "number") {
      configuredPrice = match.price
    }
  }

  const basePrice = configuredPrice !== null ? configuredPrice : Number(product.finalPrice || product.basePrice || 0)
  const multiplier = configuredPrice !== null ? 1.0 : (SIZE_MULTIPLIERS[validSize] || 1.0)
  let extraPrice = 0

  const customizationSnapshot = {
    base: { id: null, name: "", price: 0 },
    sauce: { id: null, name: "", price: 0 },
    cheese: { id: null, name: "", price: 0 },
    veggies: []
  }

  // 2. Fetch and validate base if provided
  if (baseId) {
    const baseItem = await CustomizationItem.findOne({
      _id: baseId,
      type: "base",
      status: true
    })
    if (!baseItem) {
      throw new Error("Selected pizza crust base is unavailable")
    }
    extraPrice += Number(baseItem.price || 0)
    customizationSnapshot.base = {
      id: baseItem._id,
      name: baseItem.name,
      price: Number(baseItem.price || 0)
    }
  }

  // 3. Fetch and validate sauce if provided
  if (sauceId) {
    const sauceItem = await CustomizationItem.findOne({
      _id: sauceId,
      type: "sauce",
      status: true
    })
    if (!sauceItem) {
      throw new Error("Selected pizza sauce is unavailable")
    }
    extraPrice += Number(sauceItem.price || 0)
    customizationSnapshot.sauce = {
      id: sauceItem._id,
      name: sauceItem.name,
      price: Number(sauceItem.price || 0)
    }
  }

  // 4. Fetch and validate cheese if provided
  if (cheeseId) {
    const cheeseItem = await CustomizationItem.findOne({
      _id: cheeseId,
      type: "cheese",
      status: true
    })
    if (!cheeseItem) {
      throw new Error("Selected cheese option is unavailable")
    }
    extraPrice += Number(cheeseItem.price || 0)
    customizationSnapshot.cheese = {
      id: cheeseItem._id,
      name: cheeseItem.name,
      price: Number(cheeseItem.price || 0)
    }
  }

  // 5. Fetch and validate vegetable toppings if provided
  if (Array.isArray(veggieIds) && veggieIds.length > 0) {
    const veggieItems = await CustomizationItem.find({
      _id: { $in: veggieIds },
      type: "veggie",
      status: true
    })

    if (veggieItems.length !== veggieIds.length) {
      throw new Error("One or more selected vegetable toppings are unavailable")
    }

    veggieItems.forEach((item) => {
      extraPrice += Number(item.price || 0)
      customizationSnapshot.veggies.push({
        id: item._id,
        name: item.name,
        price: Number(item.price || 0)
      })
    })
  }

  // 6. Calculate server authoritative unit price and total
  const unitPrice = Math.round((basePrice + extraPrice) * multiplier)
  const total = unitPrice * cleanQuantity

  return {
    product,
    size: validSize,
    quantity: cleanQuantity,
    unitPrice,
    total,
    customization: customizationSnapshot
  }
}

module.exports = {
  computeItemPrice,
  SIZE_MULTIPLIERS,
  PIZZA_SIZE_CONFIGS
}
