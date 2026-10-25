const mongoose = require("mongoose")

const CustomizationItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Option name is required"],
    trim: true
  },
  type: {
    type: String,
    required: [true, "Customization type is required"],
    enum: ["base", "sauce", "cheese", "veggie"]
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    default: 0
  },
  description: {
    type: String,
    default: ""
  },
  inStock: {
    type: Boolean,
    default: true
  },
  status: {
    type: Boolean,
    default: true
  }
})

const CustomizationItem = new mongoose.model("CustomizationItem", CustomizationItemSchema)

module.exports = CustomizationItem
