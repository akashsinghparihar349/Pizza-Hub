const CheckoutRouter = require("express").Router()
const {
  createRecord,
  getRecord,
  getUserRecord,
  getSingleRecord,
  updateRecord,
  deleteRecord,
  order,
  verifyOrder,
  razorpayWebhook
} = require("../controllers/checkout.controller")
const { verifyBuyer, verifyAdmin, verifySuperAdmin, verifyBoth } = require("../middleware/auth.middleware")

CheckoutRouter.post("", verifyBuyer, createRecord)
CheckoutRouter.get("", verifyAdmin, getRecord)
CheckoutRouter.get("/:_id", verifyBoth, getSingleRecord)
CheckoutRouter.get("/user/:user", verifyBuyer, getUserRecord)
CheckoutRouter.put("/:_id", verifyBoth, updateRecord)
CheckoutRouter.delete("/:_id", verifySuperAdmin, deleteRecord)
CheckoutRouter.post("/order", verifyBuyer, order)
CheckoutRouter.post("/verify-order", verifyBuyer, verifyOrder)
CheckoutRouter.post("/webhook", razorpayWebhook)

module.exports = CheckoutRouter
