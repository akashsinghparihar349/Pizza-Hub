const RestaurantRouter = require("express").Router()
const {
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
} = require("../controllers/restaurant.controller")
const { verifyBuyer, verifyAdmin,  verifyRestaurant, verifyPublic } = require("../middleware/auth.middleware")

RestaurantRouter.post("/apply", verifyBuyer, applyRestaurant)
RestaurantRouter.get("/me", verifyRestaurant, getMyRestaurant)
RestaurantRouter.put("/me", verifyRestaurant, updateMyRestaurant)
RestaurantRouter.get("/my-products", verifyRestaurant, getMyProducts)
RestaurantRouter.get("/my-orders", verifyRestaurant, getMyOrders)
RestaurantRouter.put("/order/:orderId", verifyRestaurant, updateMyOrderStatus)

RestaurantRouter.get("", verifyAdmin, getRecord)
RestaurantRouter.get("/:_id", verifyPublic, getSingleRecord)
RestaurantRouter.put("/:_id/approve", verifyAdmin, approveRestaurant)
RestaurantRouter.put("/:_id/reject", verifyAdmin, rejectRestaurant)

module.exports = RestaurantRouter
