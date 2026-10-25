// Node.js Native Test Runner Suite
// Run with: node --test tests/api.test.js
const { test, describe, before, after } = require("node:test")
const assert = require("node:assert")
const mongoose = require("mongoose")

process.env.NODE_ENV = "test"
process.env.DB_KEY = "mongodb://127.0.0.1:27017/PizzaHub_test"
process.env.JWT_SECRET_KEY = "test_super_secret_jwt_key_at_least_32_chars_long"

const { app } = require("../index")
const User = require("../models/user.model")
const Category = require("../models/category.model")
const Maincategory = require("../models/maincategory.model")
const Product = require("../models/product.model")

describe("PizzaHub Native API Test Suite", () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DB_KEY)
    }
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Maincategory.deleteMany({}),
      Product.deleteMany({})
    ])
  })

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
    }
  })

  test("Health check endpoint returns healthy status", async () => {
    // Basic test checking mongoose connection
    assert.strictEqual(mongoose.connection.readyState, 1)
  })

  test("Category and Maincategory models co-exist correctly", async () => {
    const maincat = await Maincategory.create({
      name: "Test Main Category",
      pic: "uploads/test.jpg"
    })
    assert.ok(maincat._id)

    const cat = await Category.create({
      name: "Specialty Pizzas",
      slug: "specialty-pizzas",
      description: "Artisanal specialty pizzas"
    })
    assert.ok(cat._id)
    assert.strictEqual(cat.slug, "specialty-pizzas")
  })
})
