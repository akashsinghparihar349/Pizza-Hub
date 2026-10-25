const CategoryRouter = require("express").Router()
const {
  createRecord,
  getRecord,
  getSingleRecord,
  getBySlug,
  updateRecord,
  deleteRecord
} = require("../controllers/category.controller")
const { verifyPublic, verifyAdmin, verifySuperAdmin } = require("../middleware/auth.middleware")

const { categoryUploader } = require("../middleware/fileUploader.middleware")

// Public: List all active categories or filtered categories
CategoryRouter.get("", verifyPublic, getRecord)

// Public: Lookup category by unique slug
CategoryRouter.get("/slug/:slug", verifyPublic, getBySlug)

// Public: Get category by ID
CategoryRouter.get("/:_id", verifyPublic, getSingleRecord)

// Admin / Super Admin: Create new category (supports JSON or multipart upload with image/pic)
CategoryRouter.post("", verifyAdmin, categoryUploader.single("image"), createRecord)

// Admin / Super Admin: Update category details or status
CategoryRouter.put("/:_id", verifyAdmin, categoryUploader.single("image"), updateRecord)

// Super Admin: Delete category
CategoryRouter.delete("/:_id", verifySuperAdmin, deleteRecord)

module.exports = CategoryRouter
