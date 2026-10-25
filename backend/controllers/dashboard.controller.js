const Checkout = require("../models/checkout.model")
const User = require("../models/user.model")
const Product = require("../models/product.model")
const Ingredient = require("../models/inventory.model")
const Restaurant = require("../models/restaurant.model")

/**
 * Get comprehensive admin dashboard statistics
 */
async function getDashboardStats(req, res) {
  try {
    // 1. Order metrics
    const totalOrders = await Checkout.countDocuments()
    const ordersByStatus = {
      "Order Placed": await Checkout.countDocuments({ orderStatus: "Order Placed" }),
      Accepted: await Checkout.countDocuments({ orderStatus: "Accepted" }),
      Preparing: await Checkout.countDocuments({ orderStatus: "Preparing" }),
      "Out for Delivery": await Checkout.countDocuments({ orderStatus: "Out for Delivery" }),
      Delivered: await Checkout.countDocuments({ orderStatus: "Delivered" }),
      Cancelled: await Checkout.countDocuments({ orderStatus: "Cancelled" })
    }

    // 2. Revenue calculation
    const paidOrders = await Checkout.find({
      $or: [{ paymentStatus: "Done" }, { orderStatus: "Delivered" }]
    })
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)

    // 3. User & Restaurant metrics
    const totalUsers = await User.countDocuments()
    const buyersCount = await User.countDocuments({ role: "Buyer" })
    const restaurantsCount = await Restaurant.countDocuments({ approvalStatus: "Approved" })
    const pendingRestaurantsCount = await Restaurant.countDocuments({ approvalStatus: "Pending" })

    // 4. Product & Inventory metrics
    const totalProducts = await Product.countDocuments()
    const outOfStockProducts = await Product.countDocuments({ stockQuantity: { $lte: 0 } })
    const lowStockIngredientsCount = await Ingredient.countDocuments({
      status: true,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
    })

    // 5. Recent 5 orders
    const recentOrders = await Checkout.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", ["name", "email"])
      .select("_id orderStatus paymentStatus total createdAt deliveryAddress.name")

    res.send({
      result: "Done",
      data: {
        revenue: {
          totalRevenue,
          paidOrdersCount: paidOrders.length
        },
        orders: {
          totalOrders,
          byStatus: ordersByStatus
        },
        users: {
          totalUsers,
          buyersCount,
          restaurantsCount,
          pendingRestaurantsCount
        },
        inventory: {
          totalProducts,
          outOfStockProducts,
          lowStockIngredientsCount
        },
        recentOrders
      }
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

module.exports = {
  getDashboardStats
}
