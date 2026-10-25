const Category = require("../models/category.model")
const slugify = require("slugify")
const fs = require("fs")

/**
 * Create a new category (Admin / Super Admin)
 */
async function createRecord(req, res) {
  try {
    const { name, description, image, isActive } = req.body
    if (!name) {
      return res.status(400).send({
        result: "Fail",
        reason: "Category name is required"
      })
    }

    const slug = req.body.slug
      ? slugify(req.body.slug, { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true })

    const existing = await Category.findOne({ slug })
    if (existing) {
      return res.status(400).send({
        result: "Fail",
        reason: "Category with this name or slug already exists"
      })
    }

    const imageUrl = req.file ? req.file.path : (image || "")

    const category = new Category({
      name,
      slug,
      description: description || "",
      image: imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?._id
    })

    await category.save()

    res.status(201).send({
      result: "Done",
      message: "Category created successfully",
      data: category
    })
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (err) {}
    }
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * List all categories (Public / Filtered)
 */
async function getRecord(req, res) {
  try {
    const isPrivileged = req.user && (req.user.role === "Admin" || req.user.role === "Super Admin")
    const query = isPrivileged ? {} : { isActive: true }

    const categories = await Category.find(query).sort({ createdAt: -1 })
    res.send({
      result: "Done",
      data: categories,
      count: categories.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Get category by ID
 */
async function getSingleRecord(req, res) {
  try {
    const category = await Category.findById(req.params._id || req.params.id)
    if (!category) {
      return res.status(404).send({
        result: "Fail",
        reason: "Category not found"
      })
    }

    res.send({
      result: "Done",
      data: category
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Get category by unique slug
 */
async function getBySlug(req, res) {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
    if (!category) {
      return res.status(404).send({
        result: "Fail",
        reason: "Category not found"
      })
    }

    res.send({
      result: "Done",
      data: category
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Update category details (Admin / Super Admin)
 */
async function updateRecord(req, res) {
  try {
    const category = await Category.findById(req.params._id || req.params.id)
    if (!category) {
      return res.status(404).send({
        result: "Fail",
        reason: "Category not found"
      })
    }

    if (req.body.name) {
      category.name = req.body.name
      if (!req.body.slug) {
        category.slug = slugify(req.body.name, { lower: true, strict: true })
      }
    }

    if (req.body.slug) {
      category.slug = slugify(req.body.slug, { lower: true, strict: true })
    }

    if (req.body.description !== undefined) category.description = req.body.description
    if (req.file) {
      if (category.image) {
        try {
          fs.unlinkSync(category.image)
        } catch (err) {}
      }
      category.image = req.file.path
    } else if (req.body.image !== undefined) {
      category.image = req.body.image
    }
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive

    await category.save()

    res.send({
      result: "Done",
      message: "Category updated successfully",
      data: category
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Delete category (Super Admin)
 */
async function deleteRecord(req, res) {
  try {
    const category = await Category.findById(req.params._id || req.params.id)
    if (!category) {
      return res.status(404).send({
        result: "Fail",
        reason: "Category not found"
      })
    }

    if (category.image) {
      try {
        fs.unlinkSync(category.image)
      } catch (err) {}
    }
    await category.deleteOne()

    res.send({
      result: "Done",
      message: "Category deleted successfully"
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

module.exports = {
  createRecord,
  getRecord,
  getSingleRecord,
  getBySlug,
  updateRecord,
  deleteRecord
}
