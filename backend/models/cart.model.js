const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id Field is Mendatory"]
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product Id Field is Mendatory"]
    },
    quantity: {
      type: Number,
      required: [true, "Cart Quantity Field is Mendatory"],
      min: [1, "Quantity must be at least 1"],
      default: 1
    },
    size: {
      type: String,
      default: "Medium"
    },
    customization: {
      base: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "CustomizationItem" },
        name: { type: String, default: "" },
        price: { type: Number, default: 0 }
      },
      sauce: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "CustomizationItem" },
        name: { type: String, default: "" },
        price: { type: Number, default: 0 }
      },
      cheese: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "CustomizationItem" },
        name: { type: String, default: "" },
        price: { type: Number, default: 0 }
      },
      veggies: [
        {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "CustomizationItem" },
          name: { type: String, default: "" },
          price: { type: Number, default: 0 }
        }
      ]
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit Price is Mendatory"]
    },
    total: {
      type: Number,
      required: [true, "Cart Total Field is Mendatory"]
    }
  },
  { timestamps: true }
)

const Cart = new mongoose.model("Cart", CartSchema)
module.exports = Cart