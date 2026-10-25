const Wishlist = require("../models/wishlist.model")

/**
 * Add item to customer wishlist
 */
async function createRecord(req, res) {
  try {
    const userId = req.user && req.user.role === "Buyer" ? req.user._id : (req.body.user || req.user?._id)
    if (!userId) {
      return res.status(401).send({
        result: "Fail",
        reason: "Unauthorized: User identification required"
      })
    }

    if (!req.body.product) {
      return res.status(400).send({
        result: "Fail",
        reason: "Product ID is required"
      })
    }

    // Prevent duplicate entries for same user and product
    let existing = await Wishlist.findOne({ user: userId, product: req.body.product })
    if (existing) {
      return res.status(400).send({
        result: "Fail",
        reason: "Product already in wishlist"
      })
    }

    let data = new Wishlist({
      user: userId,
      product: req.body.product
    })
    await data.save()

    let finalData = await Wishlist.findOne({ _id: data._id })
      .populate("user", ["name", "username"])
      .populate({
        path: "product",
        select: "name brand stockQuantity finalPrice pic color size",
        populate: {
          path: "brand",
          select: "-_id name"
        }
      })

    res.send({
      result: "Done",
      data: finalData
    })
  } catch (error) {
    let errorMessage = error.errors
      ? Object.fromEntries(Object.keys(error.errors).map((key) => [key, error.errors[key].message]))
      : error.message
    res.status(400).send({
      result: "Fail",
      reason: errorMessage || "Internal Server Error"
    })
  }
}

/**
 * Get all wishlist items for a user (Protected against cross-user access)
 */
async function getRecord(req, res) {
  try {
    const requestedUserId = req.params.user

    // Ownership check: Buyer can only view their own wishlist
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(requestedUserId)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot view another customer's wishlist"
      })
    }

    let data = await Wishlist.find({ user: requestedUserId })
      .sort({ _id: -1 })
      .populate("user", ["name", "username"])
      .populate({
        path: "product",
        select: "name brand stockQuantity finalPrice pic color size",
        populate: {
          path: "brand",
          select: "-_id name"
        }
      })

    res.send({
      result: "Done",
      data: data,
      count: data.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Get single wishlist item by ID
 */
async function getSingleRecord(req, res) {
  try {
    let data = await Wishlist.findOne({ _id: req.params._id })
      .populate("user", ["name", "username"])
      .populate({
        path: "product",
        select: "name brand stockQuantity finalPrice pic color size",
        populate: {
          path: "brand",
          select: "-_id name"
        }
      })

    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "No Such Record Exists"
      })
    }

    // Ownership check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(data.user?._id || data.user)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot view another customer's wishlist item"
      })
    }

    res.send({
      result: "Done",
      data: data
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Update wishlist record
 */
async function updateRecord(req, res) {
  try {
    let data = await Wishlist.findOne({ _id: req.params._id })
    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "No Such Record Exists"
      })
    }

    // Ownership check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(data.user)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot update another customer's wishlist item"
      })
    }

    if (req.body.product) {
      data.product = req.body.product
    }
    await data.save()

    let finalData = await Wishlist.findOne({ _id: data._id })
      .populate("user", ["name", "username"])
      .populate({
        path: "product",
        select: "name brand stockQuantity finalPrice pic color size",
        populate: {
          path: "brand",
          select: "-_id name"
        }
      })

    res.send({
      result: "Done",
      data: finalData
    })
  } catch (error) {
    let errorMessage = error.errors
      ? Object.fromEntries(Object.keys(error.errors).map((key) => [key, error.errors[key].message]))
      : error.message
    res.status(400).send({
      result: "Fail",
      reason: errorMessage || "Internal Server Error"
    })
  }
}

/**
 * Remove item from wishlist
 */
async function deleteRecord(req, res) {
  try {
    let data = await Wishlist.findOne({ _id: req.params._id })
    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "No Such Record Exists"
      })
    }

    // Ownership check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(data.user)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot delete another customer's wishlist item"
      })
    }

    await data.deleteOne()
    res.send({
      result: "Done",
      message: "Wishlist item removed successfully"
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

module.exports = {
  createRecord,
  getRecord,
  getSingleRecord,
  updateRecord,
  deleteRecord
}