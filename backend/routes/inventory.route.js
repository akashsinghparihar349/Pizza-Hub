const InventoryRouter = require("express").Router()
const {
  createRecord,
  getRecord,
  getSingleRecord,
  updateRecord,
  adjustStock,
  deleteRecord,
  triggerLowStockCheck
} = require("../controllers/inventory.controller")
const { verifyAdmin } = require("../middleware/auth.middleware")

InventoryRouter.post("", verifyAdmin, createRecord)
InventoryRouter.get("", verifyAdmin, getRecord)
InventoryRouter.post("/adjust", verifyAdmin, adjustStock)
InventoryRouter.put("/adjust", verifyAdmin, adjustStock)
InventoryRouter.post("/check-alerts", verifyAdmin, triggerLowStockCheck)
InventoryRouter.get("/:_id", verifyAdmin, getSingleRecord)
InventoryRouter.put("/:_id", verifyAdmin, updateRecord)
InventoryRouter.delete("/:_id", verifyAdmin, deleteRecord)

module.exports = InventoryRouter
