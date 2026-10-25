const Ingredient = require("../models/inventory.model")
const { checkLowStockAndAlert } = require("../helper/inventory.helper")

/**
 * Create a new tracked ingredient
 */
async function createRecord(req, res) {
  try {
    const ingredient = new Ingredient(req.body)
    await ingredient.save()
    res.send({
      result: "Done",
      data: ingredient
    })
  } catch (error) {
    const errorMessage = error.errors
      ? Object.fromEntries(Object.keys(error.errors).map((k) => [k, error.errors[k].message]))
      : error.message
    res.status(400).send({
      result: "Fail",
      reason: errorMessage
    })
  }
}

/**
 * Get all ingredients with optional low-stock filter
 */
async function getRecord(req, res) {
  try {
    const filter = {}
    if (req.query.status !== undefined) {
      filter.status = req.query.status === "true"
    }

    let data = []
    if (req.query.lowStock === "true") {
      data = await Ingredient.find({
        ...filter,
        $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
      }).sort({ quantity: 1 })
    } else {
      data = await Ingredient.find(filter).sort({ name: 1 })
    }

    res.send({
      result: "Done",
      data,
      count: data.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Get single ingredient
 */
async function getSingleRecord(req, res) {
  try {
    const data = await Ingredient.findById(req.params._id)
    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "Ingredient not found"
      })
    }

    res.send({
      result: "Done",
      data
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Update ingredient details
 */
async function updateRecord(req, res) {
  try {
    const ingredient = await Ingredient.findById(req.params._id)
    if (!ingredient) {
      return res.status(404).send({
        result: "Fail",
        reason: "Ingredient not found"
      })
    }

    if (req.body.name !== undefined) ingredient.name = req.body.name
    if (req.body.quantity !== undefined) ingredient.quantity = Math.max(0, Number(req.body.quantity))
    if (req.body.unit !== undefined) ingredient.unit = req.body.unit
    if (req.body.lowStockThreshold !== undefined) ingredient.lowStockThreshold = Math.max(0, Number(req.body.lowStockThreshold))
    if (req.body.customizationItem !== undefined) ingredient.customizationItem = req.body.customizationItem
    if (req.body.product !== undefined) ingredient.product = req.body.product
    if (req.body.status !== undefined) ingredient.status = req.body.status

    await ingredient.save()

    res.send({
      result: "Done",
      data: ingredient
    })
  } catch (error) {
    res.status(400).send({
      result: "Fail",
      reason: error.message || "Failed to update ingredient"
    })
  }
}

/**
 * Authorized manual stock adjustment
 */
async function adjustStock(req, res) {
  try {
    const { ingredientId, adjustment, reason } = req.body
    if (!ingredientId || adjustment === undefined) {
      return res.status(400).send({
        result: "Fail",
        reason: "ingredientId and adjustment amount are required"
      })
    }

    const ingredient = await Ingredient.findById(ingredientId)
    if (!ingredient) {
      return res.status(404).send({
        result: "Fail",
        reason: "Ingredient not found"
      })
    }

    const change = Number(adjustment)
    if (isNaN(change)) {
      return res.status(400).send({
        result: "Fail",
        reason: "Adjustment must be a valid number"
      })
    }

    const newQuantity = ingredient.quantity + change
    if (newQuantity < 0) {
      return res.status(400).send({
        result: "Fail",
        reason: `Cannot adjust: Stock would become negative (${newQuantity})`
      })
    }

    ingredient.quantity = newQuantity
    await ingredient.save()

    res.send({
      result: "Done",
      message: `Stock adjusted by ${change >= 0 ? "+" + change : change} ${ingredient.unit}`,
      data: ingredient,
      reason: reason || "Manual stock adjustment"
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Delete ingredient
 */
async function deleteRecord(req, res) {
  try {
    const data = await Ingredient.findById(req.params._id)
    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "Ingredient not found"
      })
    }

    await data.deleteOne()
    res.send({
      result: "Done",
      message: "Ingredient deleted successfully"
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Trigger low-stock alert scan on demand
 */
async function triggerLowStockCheck(req, res) {
  try {
    const result = await checkLowStockAndAlert()
    res.send({
      result: "Done",
      data: result
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

module.exports = {
  createRecord,
  getRecord,
  getSingleRecord,
  updateRecord,
  adjustStock,
  deleteRecord,
  triggerLowStockCheck
}
