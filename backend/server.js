/**
 * PizzaHub Server Entry Point
 * Bootstraps the application from index.js
 */
const { app, server } = require("./index")

const port = process.env.PORT || 8000
if (require.main === module) {
  server.listen(port, () => console.log(`Server is Running at http://localhost:${port}`))
}

module.exports = { app, server }
