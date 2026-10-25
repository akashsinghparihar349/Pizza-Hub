const UserRouter = require("express").Router()
const {
  createRecord,
  getRecord,
  getSingleRecord,
  updateRecord,
  deleteRecord,
  login,
  forgetPassword1,
  forgetPassword2,
  forgetPassword3,
  addAddress,
  getAddress,
  deleteAddress,
  verifyEmail
} = require("../controllers/user.controller")
const { verifyPublic, verifyAdmin, verifySuperAdmin, verifyBuyer } = require("../middleware/auth.middleware")

UserRouter.post("", verifyPublic, createRecord)
UserRouter.get("", verifyAdmin, getRecord)

// Address Book and Email Verification Endpoints (mounted before /:_id)
UserRouter.post("/address", verifyBuyer, addAddress)
UserRouter.get("/address", verifyBuyer, getAddress)
UserRouter.delete("/address/:index", verifyBuyer, deleteAddress)
UserRouter.post("/verify-email", verifyPublic, verifyEmail)

UserRouter.get("/:_id", verifyPublic, getSingleRecord)
UserRouter.put("/:_id", verifyPublic, updateRecord)
UserRouter.delete("/:_id", verifySuperAdmin, deleteRecord)
UserRouter.post("/login", verifyPublic, login)
UserRouter.post("/forget-password-1", verifyPublic, forgetPassword1)
UserRouter.post("/forget-password-2", verifyPublic, forgetPassword2)
UserRouter.post("/forget-password-3", verifyPublic, forgetPassword3)

module.exports = UserRouter
