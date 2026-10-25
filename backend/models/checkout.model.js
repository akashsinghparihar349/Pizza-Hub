const mongoose = require("mongoose")

const ORDER_STATUSES = [
  "Order Placed",
  "Accepted",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
]

const CheckoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id Field is Mendatory"]
    },

    deliveryAddress: {
      type: Object,
      required: [true, "Delivery Address Field is Mendatory"]
    },

    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Order Placed"
    },

    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ],

    paymentMode: {
      type: String,
      default: "COD"
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Done", "Failed"],
      default: "Pending"
    },

    subtotal: {
      type: Number,
      required: [true, "Subtotal Amount Field is Mendatory"]
    },

    shipping: {
      type: Number,
      required: [true, "Shipping Amount Field is Mendatory"],
      default: 0
    },

    discount: {
      type: Number,
      default: 0
    },

    total: {
      type: Number,
      required: [true, "Total Amount Field is Mendatory"]
    },

    rporderid: {
      type: String,
      default: ""
    },

    rppid: {
      type: String,
      default: ""
    },

    rpsignature: {
      type: String,
      default: ""
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null
    },

    inventoryDeducted: {
      type: Boolean,
      default: false
    },

    inventoryRestored: {
      type: Boolean,
      default: false
    },

    products: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product Id Field is Mendatory"]
          },
          name: {
            type: String,
            default: ""
          },
          pic: {
            type: String,
            default: ""
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
          unitPrice: {
            type: Number,
            default: 0
          },
          total: {
            type: Number,
            required: [true, "Item Total Field is Mendatory"]
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
          }
        }
      ],
      required: [true, "Carts Product are Required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0
        },
        message: "Please provide at least one product"
      }
    }
  },
  { timestamps: true }
)

CheckoutSchema.statics.ORDER_STATUSES = ORDER_STATUSES

const Checkout = new mongoose.model("Checkout", CheckoutSchema)
module.exports = Checkout