const mongoose = require("mongoose")

const dbKey = process.env.DB_KEY || "mongodb://127.0.0.1:27017/PizzaHub"

if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(dbKey)
    .then(() => {
      console.log("Database connected successfully")
    })
    .catch((err) => {
      console.error("Database connection error:", err.message)
    })
}

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime connection error:", err.message)
})

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnection attempted automatically by driver.")
})