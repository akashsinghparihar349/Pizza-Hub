const mongoose = require("mongoose")

const IngredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ingredient name is required"],
      trim: true,
      unique: true
    },
    customizationItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomizationItem",
      default: null
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },
    quantity: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0
    },
    unit: {
      type: String,
      required: [true, "Unit of measurement is required"],
      enum: ["units", "grams", "kg", "ml", "liters", "portions"],
      default: "portions"
    },
    lowStockThreshold: {
      type: Number,
      required: [true, "Low stock threshold is required"],
      min: [0, "Threshold cannot be negative"],
      default: 10
    },
    status: {
      type: Boolean,
      default: true
    },
    lastAlertSentAt: {
      type: Date,
      default: null
    },
    lastAlertStock: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
)

const Ingredient = mongoose.model("Ingredient", IngredientSchema)
module.exports = Ingredient
