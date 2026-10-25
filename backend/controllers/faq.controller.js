const Faq = require("../models/faq.model")
const { formatErrorMessage } = require("../helper/error.helper")

async function createRecord(req, res) {
  try {
    let data = new Faq(req.body)
    await data.save()
    res.send({
      result: "Done",
      data: data
    })
  } catch (error) {
    const errorMessage = formatErrorMessage(error, "Faq")
    res.status(error.code === 11000 || error.errors ? 400 : 500).send({
      result: "Fail",
      reason: errorMessage
    })
  }
}
async function getRecord(req, res) {
  try {
    let data = await Faq.find().sort({ _id: -1 })
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
    let data = await Faq.findOne({ _id: req.params._id })
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
    let data = await Faq.findOne({ _id: req.params._id })
    if (data) {
      data.question = req.body.question ?? data.question
      data.answer = req.body.answer ?? data.answer
      data.status = req.body.status ?? data.status

      await data.save()
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
    const errorMessage = formatErrorMessage(error, "Faq")
    res.status(error.code === 11000 || error.errors ? 400 : 500).send({
      result: "Fail",
      reason: errorMessage
    })
  }

}

async function deleteRecord(req, res) {
  try {
    let data = await Faq.findOne({ _id: req.params._id })
    if (data) {
      await data.deleteOne()
    }
    res.send({
      result: "Done"
    })
  } catch (error) {
    const errorMessage = formatErrorMessage(error, "Faq")
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