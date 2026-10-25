const Subcategory = require("../models/subcategory.model")
const fs = require('fs')
const { formatErrorMessage } = require("../helper/error.helper")

async function createRecord(req, res) {
  try {
    let data = new Subcategory(req.body)
    if (req.file)
      data.pic = req.file.path
    await data.save()
    res.send({
      result: "Done",
      data: data
    })
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (error) { }
    }

    const errorMessage = formatErrorMessage(error, "Subcategory")
    res.status(error.code === 11000 || error.errors ? 400 : 500).send({
      result: "Fail",
      reason: errorMessage
    })
  }
}
async function getRecord(req, res) {
  try {
    let data = await Subcategory.find().sort({ _id: -1 })
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
async function getSingleRecord(req, res) {
  try {
    let data = await Subcategory.findOne({ _id: req.params._id })
    if (data) {
      res.send({
        result: "Done",
        data: data
      })
    }
    else {
      res.status(404).send({
        result: "Fail",
        reason: "No Such Exist"
      })
    }
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }

}
async function updateRecord(req, res) {
  try {
    let data = await Subcategory.findOne({ _id: req.params._id })
    if (data) {
      data.name = req.body.name ?? data.name
      data.status = req.body.status ?? data.status
      if (await data.save() && req.file) {
        try {
          fs.unlinkSync(data.pic)

        } catch (error) { }
        data.pic = req.file.path
        await data.save()
      }
      res.send({
        result: "Done",
        data: data
      })
    }
    else {
      res.status(404).send({
        result: "Fail",
        reason: "No Such Exist"
      })
    }
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (error) { }
    }
    const errorMessage = formatErrorMessage(error, "Subcategory")
    res.status(error.code === 11000 || error.errors ? 400 : 500).send({
      result: "Fail",
      reason: errorMessage
    })
  }

}

async function deleteRecord(req, res) {
  try {
    let data = await Subcategory.findOne({ _id: req.params._id })
    if (data) {
      try {
        fs.unlinkSync(data.pic)
      } catch (error) { }
      await data.deleteOne()
    }
    res.send({
      result: "Done"
    })
  } catch (error) {
    const errorMessage = formatErrorMessage(error, "Subcategory")
    res.status(error.code === 11000 || error.errors ? 400 : 500).send({
      result: "Fail",
      reason: errorMessage
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