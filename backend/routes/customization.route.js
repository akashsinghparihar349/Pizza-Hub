const CustomizationRouter = require("express").Router()
const {
  getCustomizationOptions,
  calculatePrice,
  seedDefaultOptions,
  createOption,
  updateOption,
  deleteOption
} = require("../controllers/customization.controller")
const { verifyPublic, verifyAdmin } = require("../middleware/auth.middleware")

// Public: Get all bases, sauces, cheeses, and veggie options
CustomizationRouter.get("", verifyPublic, getCustomizationOptions)
CustomizationRouter.get("/options", verifyPublic, getCustomizationOptions)

// Public: Calculate server-side authoritative pizza price
CustomizationRouter.post("/calculate-price", verifyPublic, calculatePrice)

// Admin: Seed or manage options
CustomizationRouter.post("/seed", verifyAdmin, seedDefaultOptions)
CustomizationRouter.post("", verifyAdmin, createOption)
CustomizationRouter.put("/:_id", verifyAdmin, updateOption)
CustomizationRouter.delete("/:_id", verifyAdmin, deleteOption)

module.exports = CustomizationRouter
