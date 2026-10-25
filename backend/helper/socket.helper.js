const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const Checkout = require("../models/checkout.model")

let ioInstance = null

/**
 * Initialize Socket.IO with HTTP server
 * Sets up JWT authentication, connection lifecycle, and room subscriptions
 */
function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT"]
    }
  })

  // Socket-level JWT Authentication Middleware
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization
    if (!token) {
      return next(new Error("Authentication error: Token missing"))
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7)
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err || !decoded) {
        return next(new Error("Authentication error: Invalid or expired token"))
      }
      // Attach verified user identity to socket instance
      socket.user = decoded.data || decoded
      next()
    })
  })

  io.on("connection", (socket) => {
    // Customer / Admin requests subscription to a specific order's status updates
    socket.on("order:subscribe", async (payload) => {
      try {
        const orderId = typeof payload === "object" ? payload?.orderId : payload
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
          return socket.emit("order:error", { message: "Invalid order ID" })
        }

        const order = await Checkout.findById(orderId)
        if (!order) {
          return socket.emit("order:error", { message: "Order not found" })
        }

        // Strict Server-Side Ownership & Role Validation
        const isOwner = socket.user && String(order.user) === String(socket.user._id)
        const isAdmin = socket.user && (socket.user.role === "Admin" || socket.user.role === "Super Admin")

        if (!isOwner && !isAdmin) {
          return socket.emit("order:error", {
            message: "Access Denied: You cannot track another customer's order"
          })
        }

        // Join isolated order room
        const roomName = `order:${orderId}`
        socket.join(roomName)

        // Confirm subscription with current status
        socket.emit("order:subscribed", {
          orderId: String(order._id),
          currentStatus: order.orderStatus,
          updatedAt: order.updatedAt
        })
      } catch (err) {
        socket.emit("order:error", { message: "Failed to subscribe to order updates" })
      }
    })

    // Admin dashboard subscription to all live order status changes
    socket.on("orders:subscribeAll", () => {
      if (socket.user && (socket.user.role === "Admin" || socket.user.role === "Super Admin")) {
        socket.join("orders:admin")
        socket.emit("orders:adminSubscribed", { message: "Subscribed to all live order updates" })
      } else {
        socket.emit("order:error", { message: "Access Denied: Admin permissions required" })
      }
    })

    // Unsubscribe from order updates
    socket.on("order:unsubscribe", (payload) => {
      const orderId = typeof payload === "object" ? payload?.orderId : payload
      if (orderId) {
        socket.leave(`order:${orderId}`)
      }
    })

    // Gracefully handle disconnects
    socket.on("disconnect", () => {
      // Disconnection handled safely without memory leaks
    })
  })

  ioInstance = io
  return io
}

/**
 * Access the active Socket.IO server instance
 */
function getIO() {
  return ioInstance
}

/**
 * Emit order status update strictly after DB persistence
 * Dispatches only to the authorized order room and admin channel
 */
function emitOrderStatusUpdated({ orderId, orderStatus, updatedAt, statusHistory }) {
  if (!ioInstance) return

  // Minimal, secure payload — no passwords, secrets, tokens, or financial data
  const payload = {
    orderId: String(orderId),
    orderStatus,
    updatedAt: updatedAt || new Date(),
    statusHistory: statusHistory
      ? statusHistory.map((h) => ({
          status: h.status,
          timestamp: h.timestamp
        }))
      : []
  }

  // 1. Emit to customer(s) subscribed to this specific order
  ioInstance.to(`order:${orderId}`).emit("order:statusUpdated", payload)

  // 2. Emit to authorized admin board
  ioInstance.to("orders:admin").emit("order:statusUpdated", payload)
}

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusUpdated
}
