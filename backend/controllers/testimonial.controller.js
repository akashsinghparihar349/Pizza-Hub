const Testimonial = require("../models/testimonial.model")

/**
 * Create testimonial review
 */
async function createRecord(req, res) {
  try {
    const userId = req.user && req.user.role === "Buyer" ? req.user._id : (req.body.user || req.user?._id)
    let data = new Testimonial({
      ...req.body,
      user: userId
    })
    await data.save()
    let finalData = await Testimonial.findOne({ _id: data._id })
      .populate("user", ["name", "username"])
      .populate("product", ["name"])
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
 * List all testimonials (Public)
 */
async function getRecord(req, res) {
  try {
    let data = await Testimonial.find().sort({ _id: -1 }).populate("user", ["name"]).populate("product", ["name"])
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
 * Get single testimonial
 */
async function getSingleRecord(req, res) {
  try {
    let data = await Testimonial.findOne({ _id: req.params._id }).populate("user", ["name"]).populate("product", ["name"])
    if (data) {
      res.send({
        result: "Done",
        data: data
      })
    } else {
      res.status(404).send({
        result: "Fail",
        reason: "No Such Record Exists"
      })
    }
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Update testimonial (Owner or Admin)
 */
async function updateRecord(req, res) {
  try {
    let data = await Testimonial.findOne({ _id: req.params._id })
    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "No Such Record Exists"
      })
    }

    // Ownership check
    const isOwner = req.user && String(req.user._id) === String(data.user)
    const isAdmin = req.user && (req.user.role === "Admin" || req.user.role === "Super Admin")

    if (!isOwner && !isAdmin) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot modify another customer's testimonial"
      })
    }

    data.message = req.body.message ?? data.message
    data.star = req.body.star ?? data.star
    await data.save()

    let finalData = await Testimonial.findOne({ _id: data._id })
      .populate("user", ["name"])
      .populate("product", ["name"])

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
 * Delete testimonial (Owner, Admin or Super Admin)
 */
async function deleteRecord(req, res) {
  try {
    let data = await Testimonial.findOne({ _id: req.params._id })
    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "No Such Record Exists"
      })
    }

    // Ownership check
    const isOwner = req.user && String(req.user._id) === String(data.user)
    const isAdmin = req.user && (req.user.role === "Admin" || req.user.role === "Super Admin")

    if (!isOwner && !isAdmin) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot delete another customer's testimonial"
      })
    }

    await data.deleteOne()
    res.send({
      result: "Done",
      message: "Testimonial deleted successfully"
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
  updateRecord,
  deleteRecord
}