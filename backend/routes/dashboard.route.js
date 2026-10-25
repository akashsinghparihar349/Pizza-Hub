const DashboardRouter = require("express").Router()
const { getDashboardStats } = require("../controllers/dashboard.controller")
const { verifyAdmin } = require("../middleware/auth.middleware")

DashboardRouter.get("/stats", verifyAdmin, getDashboardStats)

module.exports = DashboardRouter
