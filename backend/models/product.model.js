const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product Name Field is Mendatory"]
  },

  maincategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Maincategory",
    required: [true, "Maincategory Id is Mendatory"]
  },

  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: [true, "Subcategory Id is Mendatory"]
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: [true, "Brand Id is Mendatory"]
  },

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    default: null
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },

  color: {
    type: [String],
    default: []
  },

  isVeg: {
    type: Boolean,
    default: true
  },

  crust: {
    type: String,
    default: "Classic Hand Tossed"
  },

  prepTime: {
    type: String,
    default: "20-25 mins"
  },

  size: {
    type: [String],
    default: ["Small", "Medium", "Large", "Extra Large"]
  },

  sizePrices: [
    {
      size: { type: String, required: true },
      inches: { type: String, default: "" },
      price: { type: Number, required: true }
    }
  ],

  isCustomizable: {
    type: Boolean,
    default: false
  },

  basePrice: {
    type: Number,
    required: [true, "Product Base Price is Mendatory"]
  },
  discount: {
    type: Number,
    required: [true, "Discount on Product is Mendatory"]
  },
  finalPrice: {
    type: Number,
    required: [true, "Product FinalPrice is Mendatory"]
  },

  stock: {
    type: Boolean,
    default: true
  },

  stockQuantity: {
    type: Number,
    required: [true, "Product StockQuantity is Mendatory"]
  },
  description: {
    type: String,
    default: ""
  },
  pic: {
    type: [String],
    required: [true, "Product Pic is Required"],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'please Provide Atleast One Pic'
    }
  },

  status: {
    type: Boolean,
    default: true
  }
})

const Product = new mongoose.model("Product", ProductSchema)
module.exports = Product