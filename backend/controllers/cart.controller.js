const Cart = require("../models/cart.model")
const { computeItemPrice } = require("../helper/pricing.helper")

/**
 * Add product / customized pizza to cart
 */
async function createRecord(req, res) {
  try {
    const userId = req.user ? req.user._id : req.body.user
    if (!userId) {
      return res.status(401).send({
        result: "Fail",
        reason: "Unauthorized: User identification required"
      })
    }

    const productId = req.body.product
    if (!productId) {
      return res.status(400).send({
        result: "Fail",
        reason: "Product ID is required"
      })
    }

    // Support both direct IDs (baseId, sauceId...) or nested customization object
    const baseId = req.body.baseId || req.body.customization?.baseId || req.body.customization?.base?.id
    const sauceId = req.body.sauceId || req.body.customization?.sauceId || req.body.customization?.sauce?.id
    const cheeseId = req.body.cheeseId || req.body.customization?.cheeseId || req.body.customization?.cheese?.id
    const veggieIds = req.body.veggieIds || req.body.customization?.veggieIds || (req.body.customization?.veggies?.map(v => v.id || v._id)) || []

    // 1. Calculate trusted prices from MongoDB
    const priceCalculation = await computeItemPrice({
      productId,
      size: req.body.size || "Regular",
      baseId,
      sauceId,
      cheeseId,
      veggieIds,
      quantity: req.body.quantity || 1
    })

    // 2. Check if matching cart item already exists with the same size and customization
    let existingItem = await Cart.findOne({
      user: userId,
      product: productId,
      size: priceCalculation.size,
      "customization.base.id": baseId || null,
      "customization.sauce.id": sauceId || null,
      "customization.cheese.id": cheeseId || null
    })

    let savedId
    if (existingItem) {
      const newQuantity = existingItem.quantity + priceCalculation.quantity
      const recalculated = await computeItemPrice({
        productId,
        size: priceCalculation.size,
        baseId,
        sauceId,
        cheeseId,
        veggieIds,
        quantity: newQuantity
      })
      existingItem.quantity = recalculated.quantity
      existingItem.unitPrice = recalculated.unitPrice
      existingItem.total = recalculated.total
      await existingItem.save()
      savedId = existingItem._id
    } else {
      const cartData = new Cart({
        user: userId,
        product: productId,
        quantity: priceCalculation.quantity,
        size: priceCalculation.size,
        customization: priceCalculation.customization,
        unitPrice: priceCalculation.unitPrice,
        total: priceCalculation.total
      })
      await cartData.save()
      savedId = cartData._id
    }

    const finalData = await Cart.findOne({ _id: savedId })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "product",
        select: "name basePrice finalPrice pic size isVeg crust isCustomizable stock stockQuantity"
      })

    res.send({
      result: "Done",
      data: finalData
    })
  } catch (error) {
    res.status(400).send({
      result: "Fail",
      reason: error.message || "Failed to add item to cart"
    })
  }
}

/**
 * Get all cart items for a user
 */
async function getRecord(req, res) {
  try {
    const requestedUserId = req.params.user

    // Authorization: customer can only view their own cart
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(requestedUserId)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot view another customer's cart"
      })
    }

    const data = await Cart.find({ user: requestedUserId })
      .sort({ createdAt: -1 })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "product",
        select: "name basePrice finalPrice pic size isVeg crust isCustomizable stock stockQuantity"
      })

    // Calculate overall cart summary
    const cartTotal = data.reduce((sum, item) => sum + (Number(item.total) || 0), 0)

    res.send({
      result: "Done",
      data,
      count: data.length,
      cartTotal
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Get a single cart item
 */
async function getSingleRecord(req, res) {
  try {
    const data = await Cart.findOne({ _id: req.params._id })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "product",
        select: "name basePrice finalPrice pic size isVeg crust isCustomizable stock stockQuantity"
      })

    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "Cart item not found"
      })
    }

    // Authorization check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(data.user._id)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied"
      })
    }

    res.send({
      result: "Done",
      data
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Update quantity, size, or customization of a cart item
 */
async function updateRecord(req, res) {
  try {
    const cartItem = await Cart.findOne({ _id: req.params._id })
    if (!cartItem) {
      return res.status(404).send({
        result: "Fail",
        reason: "Cart item not found"
      })
    }

    // Ownership check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(cartItem.user)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot modify another customer's cart item"
      })
    }

    const newQuantity = req.body.quantity !== undefined ? req.body.quantity : cartItem.quantity
    const newSize = req.body.size || cartItem.size

    // Extract updated customization if provided, or retain existing snapshot
    const baseId = req.body.baseId || req.body.customization?.baseId || cartItem.customization?.base?.id
    const sauceId = req.body.sauceId || req.body.customization?.sauceId || cartItem.customization?.sauce?.id
    const cheeseId = req.body.cheeseId || req.body.customization?.cheeseId || cartItem.customization?.cheese?.id
    const veggieIds = req.body.veggieIds || (cartItem.customization?.veggies?.map(v => v.id)) || []

    // Recalculate trusted prices from database
    const recalculated = await computeItemPrice({
      productId: cartItem.product,
      size: newSize,
      baseId,
      sauceId,
      cheeseId,
      veggieIds,
      quantity: newQuantity
    })

    cartItem.quantity = recalculated.quantity
    cartItem.size = recalculated.size
    cartItem.customization = recalculated.customization
    cartItem.unitPrice = recalculated.unitPrice
    cartItem.total = recalculated.total // Authoritative server calculation

    await cartItem.save()

    const finalData = await Cart.findOne({ _id: cartItem._id })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "product",
        select: "name basePrice finalPrice pic size isCustomizable stock stockQuantity"
      })

    res.send({
      result: "Done",
      data: finalData
    })
  } catch (error) {
    res.status(400).send({
      result: "Fail",
      reason: error.message || "Failed to update cart item"
    })
  }
}

/**
 * Remove an item from the cart
 */
async function deleteRecord(req, res) {
  try {
    const cartItem = await Cart.findOne({ _id: req.params._id })
    if (!cartItem) {
      return res.status(404).send({
        result: "Fail",
        reason: "Cart item not found"
      })
    }

    // Ownership check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(cartItem.user)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot delete another customer's cart item"
      })
    }

    await cartItem.deleteOne()

    res.send({
      result: "Done",
      message: "Item removed from cart"
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

module.exports = {
  createRecord,
  getRecord,
  getSingleRecord,
  updateRecord,
  deleteRecord
}