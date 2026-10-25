const Maincategory = require("../models/maincategory.model")
const fs = require("fs")

/**
 * Create a new Maincategory (Admin)
 */
async function createRecord(req, res) {
  try {
    let data = new Maincategory(req.body)
    if (req.file) {
      data.pic = req.file.path
    }
    await data.save()
    res.send({
      result: "Done",
      data: data
    })
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (err) {}
    }

    let errorMessage = error.keyValue
      ? Object.fromEntries(Object.keys(error.keyValue).map((key) => [key, "Maincategory with this name already exists"]))
      : Object.fromEntries(Object.keys(error.errors || {}).map((key) => [key, error.errors[key].message]))
    res.status(Object.values(errorMessage).length !== 0 ? 400 : 500).send({
      result: "Fail",
      reason: Object.values(errorMessage).length !== 0 ? errorMessage : "Internal Server Error"
    })
  }
}

/**
 * List all main categories (Public)
 */
async function getRecord(req, res) {
  try {
    let data = await Maincategory.find().sort({ _id: -1 })
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
 * Get single main category by ID (Public)
 */
async function getSingleRecord(req, res) {
  try {
    let data = await Maincategory.findOne({ _id: req.params._id })
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
 * Update main category (Admin)
 */
async function updateRecord(req, res) {
  try {
    let data = await Maincategory.findOne({ _id: req.params._id })
    if (data) {
      data.name = req.body.name ?? data.name
      data.status = req.body.status ?? data.status
      if (await data.save()) {
        if (req.file) {
          if (data.pic) {
            try {
              fs.unlinkSync(data.pic)
            } catch (err) {}
          }
          data.pic = req.file.path
          await data.save()
        }
      }
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
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (err) {}
    }
    let errorMessage = error.keyValue
      ? Object.fromEntries(Object.keys(error.keyValue).map((key) => [key, "Maincategory with this name already exists"]))
      : Object.fromEntries(Object.keys(error.errors || {}).map((key) => [key, error.errors[key].message]))
    res.status(Object.values(errorMessage).length !== 0 ? 400 : 500).send({
      result: "Fail",
      reason: Object.values(errorMessage).length !== 0 ? errorMessage : "Internal Server Error"
    })
  }
}

/**
 * Delete main category (Super Admin)
 */
async function deleteRecord(req, res) {
  try {
    let data = await Maincategory.findOne({ _id: req.params._id })
    if (data) {
      if (data.pic) {
        try {
          fs.unlinkSync(data.pic)
        } catch (err) {}
      }
      await data.deleteOne()
    }
    res.send({
      result: "Done",
      message: "Maincategory deleted successfully"
    })
  } catch (error) {
    let errorMessage = error.keyValue
      ? Object.fromEntries(Object.keys(error.keyValue).map((key) => [key, "Maincategory with this name already exists"]))
      : Object.fromEntries(Object.keys(error.errors || {}).map((key) => [key, error.errors[key].message]))
    res.status(Object.values(errorMessage).length !== 0 ? 400 : 500).send({
      result: "Fail",
      reason: Object.values(errorMessage).length !== 0 ? errorMessage : "Internal Server Error"
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
