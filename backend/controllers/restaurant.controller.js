const Restaurant = require("../models/restaurant.model")
const User = require("../models/user.model")
const Product = require("../models/product.model")
const Checkout = require("../models/checkout.model")
const { emitOrderStatusUpdated } = require("../helper/socket.helper")

const VALID_TRANSITIONS = {
  "Order Placed": ["Accepted", "Cancelled"],
  "Accepted": ["Preparing", "Cancelled"],
  "Preparing": ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  "Delivered": [],
  "Cancelled": []
}

/**
 * Apply for restaurant registration (Pending admin approval)
 */
async function applyRestaurant(req, res) {
  try {
    const userId = req.user._id

    // Check if user already has a pending or approved restaurant
    const existing = await Restaurant.findOne({
      owner: userId,
      approvalStatus: { $in: ["Pending", "Approved"] }
    })

    if (existing) {
      return res.status(400).send({
        result: "Fail",
        reason: `You already have a restaurant application with status: ${existing.approvalStatus}`
      })
    }

    const user = await User.findById(userId)
    const restaurant = new Restaurant({
      name: req.body.name,
      owner: userId,
      email: req.body.email || user?.email,
      phone: req.body.phone || user?.phone,
      address: req.body.address || {
        street: req.body.street || "",
        city: req.body.city || "",
        state: req.body.state || "",
        pin: req.body.pin || ""
      },
      cuisine: req.body.cuisine || ["Pizza", "Italian"],
      approvalStatus: "Pending",
      status: false // Inactive until approved
    })

    await restaurant.save()

    res.status(201).send({
      result: "Done",
      message: "Restaurant application submitted successfully and is pending admin review",
      data: restaurant
    })
  } catch (error) {
    const reason = error.errors
      ? Object.fromEntries(Object.keys(error.errors).map((k) => [k, error.errors[k].message]))
      : error.message
    res.status(400).send({
      result: "Fail",
      reason
    })
  }
}

/**
 * Get current user's restaurant profile
 */
async function getMyRestaurant(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).populate("owner", ["name", "email", "phone"])
    if (!restaurant) {
      return res.status(404).send({
        result: "Fail",
        reason: "No restaurant found associated with your account"
      })
    }

    res.send({
      result: "Done",
      data: restaurant
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Update current user's restaurant profile
 */
async function updateMyRestaurant(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
    if (!restaurant) {
      return res.status(404).send({
        result: "Fail",
        reason: "No restaurant found associated with your account"
      })
    }

    if (req.body.name) restaurant.name = req.body.name
    if (req.body.phone) restaurant.phone = req.body.phone
    if (req.body.email) restaurant.email = req.body.email
    if (req.body.address) restaurant.address = req.body.address
    if (req.body.cuisine) restaurant.cuisine = req.body.cuisine
    // Note: approvalStatus and status cannot be self-modified by the owner

    await restaurant.save()

    res.send({
      result: "Done",
      message: "Restaurant profile updated successfully",
      data: restaurant
    })
  } catch (error) {
    res.status(400).send({
      result: "Fail",
      reason: error.message || "Failed to update restaurant profile"
    })
  }
}

/**
 * List all restaurants (Admin only)
 */
async function getRecord(req, res) {
  try {
    const filter = {}
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus
    if (req.query.status !== undefined) filter.status = req.query.status === "true"

    const data = await Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .populate("owner", ["name", "email", "phone", "username"])

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
 * Get single restaurant by ID
 */
async function getSingleRecord(req, res) {
  try {
    const restaurant = await Restaurant.findById(req.params._id).populate("owner", ["name", "email", "phone"])
    if (!restaurant) {
      return res.status(404).send({
        result: "Fail",
        reason: "Restaurant not found"
      })
    }

    res.send({
      result: "Done",
      data: restaurant
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Admin approve restaurant
 */
async function approveRestaurant(req, res) {
  try {
    const restaurant = await Restaurant.findById(req.params._id)
    if (!restaurant) {
      return res.status(404).send({
        result: "Fail",
        reason: "Restaurant not found"
      })
    }

    restaurant.approvalStatus = "Approved"
    restaurant.status = true
    restaurant.rejectionReason = ""
    await restaurant.save()

    // Elevate owner to Restaurant role
    await User.findByIdAndUpdate(restaurant.owner, { role: "Restaurant" })

    res.send({
      result: "Done",
      message: `Restaurant '${restaurant.name}' approved successfully`,
      data: restaurant
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Failed to approve restaurant"
    })
  }
}

/**
 * Admin reject restaurant
 */
async function rejectRestaurant(req, res) {
  try {
    const restaurant = await Restaurant.findById(req.params._id)
    if (!restaurant) {
      return res.status(404).send({
        result: "Fail",
        reason: "Restaurant not found"
      })
    }

    restaurant.approvalStatus = "Rejected"
    restaurant.status = false
    restaurant.rejectionReason = req.body.reason || "Application rejected by admin"
    await restaurant.save()

    res.send({
      result: "Done",
      message: `Restaurant '${restaurant.name}' rejected`,
      data: restaurant
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Failed to reject restaurant"
    })
  }
}

/**
 * Restaurant owner view their restaurant-specific products (Strict Isolation)
 */
async function getMyProducts(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
    if (!restaurant) {
      return res.status(404).send({
        result: "Fail",
        reason: "No restaurant found for this account"
      })
    }

    const products = await Product.find({ restaurant: restaurant._id }).sort({ createdAt: -1 })

    res.send({
      result: "Done",
      restaurant: { id: restaurant._id, name: restaurant.name },
      data: products,
      count: products.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Restaurant owner view their restaurant-specific orders (Strict Isolation)
 */
async function getMyOrders(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
    if (!restaurant) {
      return res.status(404).send({
        result: "Fail",
        reason: "No restaurant found for this account"
      })
    }

    if (restaurant.approvalStatus !== "Approved") {
      return res.status(403).send({
        result: "Fail",
        reason: "Restaurant is not yet approved by admin"
      })
    }

    const orders = await Checkout.find({ restaurant: restaurant._id })
      .sort({ createdAt: -1 })
      .populate("user", ["name", "email", "phone"])

    res.send({
      result: "Done",
      restaurant: { id: restaurant._id, name: restaurant.name },
      data: orders,
      count: orders.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Restaurant owner update order status for their own restaurant's orders
 */
async function updateMyOrderStatus(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
    if (!restaurant || restaurant.approvalStatus !== "Approved") {
      return res.status(403).send({
        result: "Fail",
        reason: "Approved restaurant account required"
      })
    }

    const order = await Checkout.findById(req.params.orderId)
    if (!order) {
      return res.status(404).send({
        result: "Fail",
        reason: "Order not found"
      })
    }

    // Strict restaurant ownership check
    if (!order.restaurant || String(order.restaurant) !== String(restaurant._id)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: This order does not belong to your restaurant"
      })
    }

    const newStatus = req.body.orderStatus
    if (newStatus && newStatus !== order.orderStatus) {
      const allowed = VALID_TRANSITIONS[order.orderStatus] || []
      if (!allowed.includes(newStatus)) {
        return res.status(400).send({
          result: "Fail",
          reason: `Invalid status transition from '${order.orderStatus}' to '${newStatus}'`
        })
      }

      order.orderStatus = newStatus
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        updatedBy: req.user._id
      })

      await order.save()

      // Real-time Socket.IO emission
      emitOrderStatusUpdated({
        orderId: order._id,
        orderStatus: order.orderStatus,
        updatedAt: order.updatedAt,
        statusHistory: order.statusHistory
      })
    }

    res.send({
      result: "Done",
      data: order
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

module.exports = {
  applyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  getRecord,
  getSingleRecord,
  approveRestaurant,
  rejectRestaurant,
  getMyProducts,
  getMyOrders,
  updateMyOrderStatus
}
