const express = require("express")
const http = require("http")
const mongoose = require("mongoose")
require("dotenv").config()
require("./config/db-connect")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const path = require("path")
const { initSocket } = require("./helper/socket.helper")
const { initInventoryCron } = require("./helper/inventory.helper")

const Router = require("./routes/index.route")

const app = express()

// 1. Security HTTP Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allows static uploaded images to be requested by frontend
  })
)

// 2. Production-configurable CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["*"]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error("CORS policy violation: Origin not allowed"), false)
    },
    credentials: true
  })
)

// 3. General API Rate Limiting (1000 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { result: "Fail", reason: "Too many requests, please try again later" }
})
app.use("/api", apiLimiter)

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf
    }
  })
)
app.use("/public", express.static("./public"))

// 4. Health-Check Endpoints
const healthHandler = (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStatusMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" }
  const isHealthy = dbState === 1
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "degraded",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbState] || "unknown",
    environment: process.env.NODE_ENV || "development"
  })
}
app.get("/health", healthHandler)
app.get("/api/health", healthHandler)

// Mount main API routes
app.use("/api", Router)

// Process-level crash prevention for asynchronous network operations (e.g., SMTP)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection (handled safely):", err?.message || err)
})

// Create HTTP server wrapping Express application
const server = http.createServer(app)

// Initialize Socket.IO real-time tracking
initSocket(server)

// Initialize inventory low-stock cron scheduler in non-test mode
if (process.env.NODE_ENV !== "test") {
  initInventoryCron()
}

// Graceful Shutdown
function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`)
  server.close(async () => {
    console.log("HTTP server closed.")
    try {
      await mongoose.connection.close(false)
      console.log("MongoDB connection closed.")
    } catch (err) {
      console.error("Error closing MongoDB connection:", err?.message || err)
    }
    process.exit(0)
  })
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

const port = process.env.PORT || 8000
if (require.main === module) {
  server.listen(port, () => console.log(`Server is Running at http://localhost:${port}`))
}

module.exports = { app, server }
