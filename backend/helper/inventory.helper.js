const cron = require("node-cron")
const Ingredient = require("../models/inventory.model")
const mailer = require("./mailer.helper")

/**
 * Validate and atomically deduct stock for all configured ingredients in an order
 * Prevents negative stock, overselling, and duplicate deductions
 */
async function validateAndDeductInventory(order) {
  if (!order || !order.products || order.products.length === 0) {
    return { success: true, deducted: false, message: "No items to deduct" }
  }

  // Idempotency: prevent duplicate stock deductions on repeated callbacks
  if (order.inventoryDeducted) {
    return { success: true, deducted: false, message: "Inventory already deducted for this order" }
  }

  // 1. Gather all required ingredient deductions
  const requiredDeductions = new Map() // ingredientId -> { ingredient, neededQty }

  for (const item of order.products) {
    const itemQty = Number(item.quantity) || 1

    // Collect candidate identifiers (product ID and customization item IDs)
    const candidateIds = []
    if (item.product) candidateIds.push(String(item.product._id || item.product))

    if (item.customization) {
      if (item.customization.base?.id) candidateIds.push(String(item.customization.base.id))
      if (item.customization.sauce?.id) candidateIds.push(String(item.customization.sauce.id))
      if (item.customization.cheese?.id) candidateIds.push(String(item.customization.cheese.id))
      if (Array.isArray(item.customization.veggies)) {
        item.customization.veggies.forEach((v) => {
          if (v?.id) candidateIds.push(String(v.id))
        })
      }
    }

    // Find configured ingredients mapped to these items
    const configuredIngredients = await Ingredient.find({
      status: true,
      $or: [
        { customizationItem: { $in: candidateIds } },
        { product: { $in: candidateIds } }
      ]
    })

    for (const ing of configuredIngredients) {
      const ingId = String(ing._id)
      const current = requiredDeductions.get(ingId) || { ingredient: ing, neededQty: 0 }
      current.neededQty += itemQty
      requiredDeductions.set(ingId, current)
    }
  }

  // If no configured ingredients for this order, mark deducted and exit safely
  if (requiredDeductions.size === 0) {
    order.inventoryDeducted = true
    await order.save()
    return { success: true, deducted: false, message: "No tracked ingredients configured" }
  }

  // 2. Pre-validate stock availability for all configured ingredients
  for (const { ingredient, neededQty } of requiredDeductions.values()) {
    const freshIng = await Ingredient.findById(ingredient._id)
    if (!freshIng || freshIng.quantity < neededQty) {
      throw new Error(
        `Insufficient inventory for ingredient '${ingredient.name}'. Available: ${freshIng ? freshIng.quantity : 0} ${ingredient.unit}, Required: ${neededQty} ${ingredient.unit}`
      )
    }
  }

  // 3. Perform atomic deductions
  const successfullyDeducted = []
  try {
    for (const { ingredient, neededQty } of requiredDeductions.values()) {
      const updated = await Ingredient.findOneAndUpdate(
        { _id: ingredient._id, quantity: { $gte: neededQty } },
        { $inc: { quantity: -neededQty } },
        { returnDocument: "after" }
      )

      if (!updated) {
        throw new Error(`Concurrent stock change: Insufficient inventory for '${ingredient.name}'`)
      }

      successfullyDeducted.push({ ingredientId: ingredient._id, qty: neededQty })
    }

    // 4. Mark order as inventory deducted
    order.inventoryDeducted = true
    await order.save()

    return {
      success: true,
      deducted: true,
      deductionsCount: successfullyDeducted.length
    }
  } catch (err) {
    // Rollback any partial deductions if an atomic step failed
    for (const { ingredientId, qty } of successfullyDeducted) {
      await Ingredient.findByIdAndUpdate(ingredientId, { $inc: { quantity: qty } })
    }
    throw err
  }
}

/**
 * Restore inventory on valid order cancellation
 * Only executes if inventory was previously deducted and not yet restored
 */
async function restoreOrderInventory(order) {
  if (!order || !order.inventoryDeducted || order.inventoryRestored) {
    return { success: true, restored: false, message: "No inventory to restore" }
  }

  for (const item of order.products) {
    const itemQty = Number(item.quantity) || 1
    const candidateIds = []
    if (item.product) candidateIds.push(String(item.product._id || item.product))

    if (item.customization) {
      if (item.customization.base?.id) candidateIds.push(String(item.customization.base.id))
      if (item.customization.sauce?.id) candidateIds.push(String(item.customization.sauce.id))
      if (item.customization.cheese?.id) candidateIds.push(String(item.customization.cheese.id))
      if (Array.isArray(item.customization.veggies)) {
        item.customization.veggies.forEach((v) => {
          if (v?.id) candidateIds.push(String(v.id))
        })
      }
    }

    const configuredIngredients = await Ingredient.find({
      $or: [
        { customizationItem: { $in: candidateIds } },
        { product: { $in: candidateIds } }
      ]
    })

    for (const ing of configuredIngredients) {
      await Ingredient.findByIdAndUpdate(ing._id, { $inc: { quantity: itemQty } })
    }
  }

  order.inventoryRestored = true
  await order.save()
  return { success: true, restored: true }
}

/**
 * Check for low stock items and dispatch alerts
 * Deduplicates notifications: will not resend identical alerts for unchanged stock levels
 */
async function checkLowStockAndAlert() {
  try {
    const lowStockItems = await Ingredient.find({
      status: true,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
    })

    // Filter out items where alert was already sent for the exact current stock level
    const itemsNeedingAlert = lowStockItems.filter(
      (item) => item.lastAlertStock === null || item.lastAlertStock !== item.quantity
    )

    if (itemsNeedingAlert.length === 0) {
      return { alerted: false, count: 0 }
    }

    const rows = itemsNeedingAlert
      .map(
        (item) => `
        <tr>
          <td style="border:1px solid #ddd;padding:8px;">${item.name}</td>
          <td style="border:1px solid #ddd;padding:8px;color:#d9534f;font-weight:bold;">${item.quantity} ${item.unit}</td>
          <td style="border:1px solid #ddd;padding:8px;">${item.lowStockThreshold} ${item.unit}</td>
        </tr>`
      )
      .join("")

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <h2 style="color:#d9534f;">⚠️ PizzaHub Low Stock Inventory Alert</h2>
        <p>The following ingredients have fallen below their configured low-stock thresholds:</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="border:1px solid #ddd;padding:8px;text-align:left;">Ingredient</th>
              <th style="border:1px solid #ddd;padding:8px;text-align:left;">Current Stock</th>
              <th style="border:1px solid #ddd;padding:8px;text-align:left;">Threshold</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="color:#777;font-size:12px;">Alert generated automatically by PizzaHub Inventory Monitor.</p>
      </div>`

    if (process.env.MAIL_USERNAME) {
      mailer.sendMail({
        from: process.env.MAIL_USERNAME,
        to: process.env.MAIL_USERNAME,
        subject: `[PizzaHub Alert] ${itemsNeedingAlert.length} Ingredients Running Low on Stock`,
        html: emailHtml
      })
    }

    // Record lastAlertStock and lastAlertSentAt to prevent duplicate alerts
    const now = new Date()
    for (const item of itemsNeedingAlert) {
      item.lastAlertStock = item.quantity
      item.lastAlertSentAt = now
      await item.save()
    }

    return { alerted: true, count: itemsNeedingAlert.length }
  } catch (err) {
    console.error("Low stock alert check error:", err.message)
    return { alerted: false, error: err.message }
  }
}

/**
 * Initialize hourly low-stock cron monitor
 */
function initInventoryCron() {
  // Runs every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    await checkLowStockAndAlert()
  })
}

module.exports = {
  validateAndDeductInventory,
  restoreOrderInventory,
  checkLowStockAndAlert,
  initInventoryCron
}
