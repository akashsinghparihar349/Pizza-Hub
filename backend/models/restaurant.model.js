const mongoose = require("mongoose")

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner user reference is required"]
    },
    email: {
      type: String,
      required: [true, "Restaurant email is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Restaurant phone is required"],
      trim: true
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, required: [true, "City is required"] },
      state: { type: String, default: "" },
      pin: { type: String, required: [true, "PIN code is required"] }
    },
    cuisine: {
      type: [String],
      default: ["Pizza", "Italian"]
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    rejectionReason: {
      type: String,
      default: ""
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const Restaurant = mongoose.model("Restaurant", RestaurantSchema)
module.exports = Restaurant
