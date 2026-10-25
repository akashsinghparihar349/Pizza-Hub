const User = require("../models/user.model")
const passwordValidator = require('password-validator')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const mailer = require("../helper/mailer.helper")
const { formatErrorMessage } = require("../helper/error.helper")

//Create a schema

// 7906651456

const schema = new passwordValidator()

//Add properties to it

schema
  .is().min(8)
  .is().max(100)
  .has().uppercase(1)
  .has().lowercase(1)
  .has().symbols(1)
  .has().digits(2)
  .has().not().spaces()
  .is().not().oneOf(['Passw0rd', 'Password123', 'Admin@123', 'User@123', 'Password@123']);


async function createRecord(req, res) {
  if (schema.validate(req.body.password)) {
    bcrypt.hash(req.body?.password, 12, async (error, hash) => {
      if (error) {
        res.status(400).send({
          result: "Fail",
          reason: "Internal Server Error"
        })
      } else {
        try {
          let data = new User(req.body)
          data.password = hash
          await data.save()
          res.send({
            result: "Done",
            data: data
          })

          mailer.sendMail({
            from: `"${process.env.SITE_NAME || 'PizzaHub'}" <${process.env.MAIL_USERNAME || 'no-reply@pizzahub.com'}>`,
            to: data.email,
            subject: `Welcome to ${process.env.SITE_NAME || 'PizzaHub'}, ${data.name}! 🍕`,
            text: `Hello ${data.name},\n\nWelcome to ${process.env.SITE_NAME || 'PizzaHub'}! Your account has been registered successfully.\nUsername: ${data.username}\nRegistered Email: ${data.email}\n\nExplore our fresh stone-baked pizzas: ${process.env.SITE_URL || 'http://localhost:5173'}/shop\n\nHappy Ordering,\nTeam ${process.env.SITE_NAME || 'PizzaHub'}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                <div style="background:#e53935;color:#ffffff;padding:24px;text-align:center;">
                  <h1 style="margin:0;font-size:26px;">🍕 ${process.env.SITE_NAME || 'PizzaHub'}</h1>
                  <p style="margin:6px 0 0;font-size:14px;color:#ffebee;">Welcome to Artisan Pizza Perfection</p>
                </div>
                <div style="padding:24px;color:#333333;line-height:1.6;">
                  <h2 style="color:#222222;font-size:20px;margin-top:0;">Hello ${data.name},</h2>
                  <p>Thank you for signing up with <strong>${process.env.SITE_NAME || 'PizzaHub'}</strong>! Your account has been created successfully.</p>
                  <div style="background:#f9f9f9;border-left:4px solid #e53935;padding:12px 16px;margin:16px 0;">
                    <p style="margin:0;"><strong>Username:</strong> ${data.username}</p>
                    <p style="margin:6px 0 0;"><strong>Registered Email:</strong> ${data.email}</p>
                  </div>
                  <p>Order handcrafted crusts, 100% real mozzarella, and gourmet toppings delivered hot within 30 minutes.</p>
                  <div style="text-align:center;margin:24px 0;">
                    <a href="${process.env.SITE_URL || 'http://localhost:5173'}/shop" style="background:#e53935;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:24px;font-weight:bold;display:inline-block;">Explore Pizza Menu</a>
                  </div>
                </div>
                <div style="background:#f4f4f4;padding:12px;text-align:center;font-size:12px;color:#777777;">
                  © ${new Date().getFullYear()} ${process.env.SITE_NAME || 'PizzaHub'}. All rights reserved.
                </div>
              </div>
            `
          })

        } catch (error) {
          const errorMessage = formatErrorMessage(error, "User")
          res.status(Object.values(errorMessage).length !== 0 ? 400 : 500).send({
            result: "Fail",
            reason: errorMessage
          })
        }
      }
    })
  }
  else {
    res.status(400).send({
      result: "Fail",
      reason: schema.validate(req.body?.password, { details: true }).map(x => x.message.replaceAll("string", "Password")).join("|")
    })
  }
}
async function getRecord(req, res) {
  try {
    let data = await User.find().sort({ _id: -1 })
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
    if (!req.params._id || !mongoose.isValidObjectId(req.params._id)) {
      return res.status(400).send({
        result: "Fail",
        reason: "Invalid User ID format"
      })
    }

    const caller = req.user
    if (caller) {
      const isOwner = String(caller._id) === String(req.params._id)
      const isAdmin = caller.role === "Admin" || caller.role === "Super Admin"
      if (!isOwner && !isAdmin) {
        return res.status(403).send({
          result: "Fail",
          reason: "Access Denied: You cannot view other users' profiles"
        })
      }
    }

    let data = await User.findOne({ _id: req.params._id })
    if (data) {
      res.send({
        result: "Done",
        data: data
      })
    } else {
      res.status(404).send({
        result: "Fail",
        reason: "No Such Exist"
      })
    }
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).send({
        result: "Fail",
        reason: `Invalid ${error.path}: ${error.value}`
      })
    }
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

async function updateRecord(req, res) {
  try {
    if (!req.params._id || !mongoose.isValidObjectId(req.params._id)) {
      return res.status(400).send({
        result: "Fail",
        reason: "Invalid User ID format"
      })
    }

    const caller = req.user
    if (caller) {
      const isOwner = String(caller._id) === String(req.params._id)
      const isAdmin = caller.role === "Admin" || caller.role === "Super Admin"
      if (!isOwner && !isAdmin) {
        return res.status(403).send({
          result: "Fail",
          reason: "Access Denied: You cannot modify other users' profiles"
        })
      }
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).send({
        result: "Fail",
        reason: "Request body is required"
      })
    }

    if (req.body.name !== undefined && typeof req.body.name === "string" && req.body.name.trim() === "") {
      return res.status(400).send({
        result: "Fail",
        reason: { name: "Full Name cannot be empty" }
      })
    }
    if (req.body.username !== undefined && typeof req.body.username === "string" && req.body.username.trim() === "") {
      return res.status(400).send({
        result: "Fail",
        reason: { username: "Username cannot be empty" }
      })
    }
    if (req.body.email !== undefined && typeof req.body.email === "string" && req.body.email.trim() === "") {
      return res.status(400).send({
        result: "Fail",
        reason: { email: "Email Address cannot be empty" }
      })
    }
    if (req.body.phone !== undefined && typeof req.body.phone === "string" && req.body.phone.trim() === "") {
      return res.status(400).send({
        result: "Fail",
        reason: { phone: "Phone Number cannot be empty" }
      })
    }

    let data = await User.findOne({ _id: req.params._id })
    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "No Such Exist"
      })
    }

    // Explicit allowlist of editable fields
    if (req.body.name !== undefined) data.name = req.body.name
    if (req.body.username !== undefined) data.username = req.body.username
    if (req.body.email !== undefined) data.email = req.body.email
    if (req.body.phone !== undefined) data.phone = req.body.phone
    if (req.body.address !== undefined) data.address = req.body.address

    // Privilege escalation prevention
    const isAdmin = caller && (caller.role === "Admin" || caller.role === "Super Admin")
    const isSuperAdmin = caller && caller.role === "Super Admin"

    if (isAdmin) {
      if (req.body.status !== undefined) data.status = req.body.status
      if (req.body.role !== undefined) {
        if (req.body.role === "Super Admin") {
          if (isSuperAdmin) data.role = req.body.role
        } else {
          data.role = req.body.role
        }
      }
    }

    await data.save()
    res.send({
      result: "Done",
      data: data
    })
  } catch (error) {
    const errorMessage = formatErrorMessage(error, "User")
    res.status(error.code === 11000 || error.errors || error.name === "CastError" ? 400 : 500).send({
      result: "Fail",
      reason: errorMessage
    })
  }
}

async function addAddress(req, res) {
  try {
    const userId = req.user ? req.user._id : null
    if (!userId) {
      return res.status(401).send({ result: "Fail", reason: "Unauthorized" })
    }
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ result: "Fail", reason: "User not found" })
    }
    if (!Array.isArray(user.address)) user.address = []
    user.address.push(req.body)
    await user.save()
    res.send({ result: "Done", data: user.address })
  } catch (err) {
    res.status(500).send({ result: "Fail", reason: err.message || "Internal Server Error" })
  }
}

async function getAddress(req, res) {
  try {
    const userId = req.user ? req.user._id : null
    if (!userId) {
      return res.status(401).send({ result: "Fail", reason: "Unauthorized" })
    }
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ result: "Fail", reason: "User not found" })
    }
    res.send({ result: "Done", data: user.address || [] })
  } catch (err) {
    res.status(500).send({ result: "Fail", reason: err.message || "Internal Server Error" })
  }
}

async function deleteAddress(req, res) {
  try {
    const userId = req.user ? req.user._id : null
    if (!userId) {
      return res.status(401).send({ result: "Fail", reason: "Unauthorized" })
    }
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ result: "Fail", reason: "User not found" })
    }
    const index = parseInt(req.params.index, 10)
    if (isNaN(index) || index < 0 || index >= (user.address || []).length) {
      return res.status(400).send({ result: "Fail", reason: "Invalid address index" })
    }
    user.address.splice(index, 1)
    await user.save()
    res.send({ result: "Done", data: user.address })
  } catch (err) {
    res.status(500).send({ result: "Fail", reason: err.message || "Internal Server Error" })
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).send({ result: "Fail", reason: "Email and OTP required" })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send({ result: "Fail", reason: "User not found" })
    }
    if (!user.passwordResetOptions || String(user.passwordResetOptions.otp) !== String(otp)) {
      return res.status(400).send({ result: "Fail", reason: "Invalid OTP" })
    }
    user.emailVerified = true
    await user.save()
    res.send({ result: "Done", message: "Email verified successfully" })
  } catch (err) {
    res.status(500).send({ result: "Fail", reason: err.message || "Internal Server Error" })
  }
}

async function deleteRecord(req, res) {
  try {
    let data = await User.findOne({ _id: req.params._id })
    if (data) {
      await data.deleteOne()
    }
    res.send({
      result: "Done"
    })
  } catch (error) {
    const errorMessage = formatErrorMessage(error, "User")
    res.status(error.code === 11000 || error.errors ? 400 : 500).send({
      result: "Fail",
      reason: errorMessage
    })
  }
}

async function login(req, res) {
  try {
    let data = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username }
      ]
    })
    if (data) {
      if (await bcrypt.compare(req.body?.password, data.password)) {
        let token = jwt.sign({ data }, process.env.JWT_SECRET_KEY, { expiresIn: "15 days" })
        res.send({
          result: "Done",
          data: data,
          token: token
        })
      }
      else {
        res.status(401).send({
          result: "Fail",
          reason: "Invalid Username or Password"
        })
      }
    }
    else {
      res.status(401).send({
        result: "Fail",
        reason: "Invalid Username or Password"
      })
    }
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}


async function forgetPassword1(req, res) {
  try {
    let data = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username }
      ]
    })
    if (data) {
      let otp = Number(Math.random().toString().slice(2, 8).toString().padEnd(6, "1"))
      data.passwordResetOptions = {
        otp: otp,
        date: new Date()
      }

      await data.save()

      res.send({
        result: "Done",
        message: "OTP Has Been Send Your Registered Email Address"
      })

      mailer.sendMail({
        from: `"${process.env.SITE_NAME || 'PizzaHub'}" <${process.env.MAIL_USERNAME || 'no-reply@pizzahub.com'}>`,
        to: data.email,
        subject: `Your ${process.env.SITE_NAME || 'PizzaHub'} Password Reset OTP: ${otp}`,
        text: `Hello ${data.name},\n\nWe received a request to reset your password for your ${process.env.SITE_NAME || 'PizzaHub'} account.\n\nYour 6-digit OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.\n\nTeam ${process.env.SITE_NAME || 'PizzaHub'}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
            <div style="background:#e53935;color:#ffffff;padding:24px;text-align:center;">
              <h1 style="margin:0;font-size:26px;">🍕 ${process.env.SITE_NAME || 'PizzaHub'}</h1>
              <p style="margin:6px 0 0;font-size:14px;color:#ffebee;">Password Reset Verification</p>
            </div>
            <div style="padding:24px;color:#333333;line-height:1.6;">
              <h2 style="color:#222222;font-size:20px;margin-top:0;">Hello ${data.name},</h2>
              <p>We received a request to reset the password for your <strong>${process.env.SITE_NAME || 'PizzaHub'}</strong> account (Username: <code>${data.username}</code>).</p>
              <div style="text-align:center;margin:24px 0;">
                <div style="display:inline-block;background:#fff3f3;border:2px dashed #e53935;color:#e53935;font-size:32px;font-weight:bold;letter-spacing:6px;padding:12px 32px;border-radius:8px;">
                  ${otp}
                </div>
              </div>
              <p style="color:#d32f2f;font-weight:bold;">⚠️ This OTP is valid for 10 minutes only.</p>
              <p style="color:#666666;font-size:13px;">If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized access.</p>
            </div>
            <div style="background:#f4f4f4;padding:12px;text-align:center;font-size:12px;color:#777777;">
              © ${new Date().getFullYear()} ${process.env.SITE_NAME || 'PizzaHub'}. All rights reserved.
            </div>
          </div>
        `
      })
    }
    else {
      res.status(401).send({
        result: "Fail",
        reason: "No User Record Found"
      })
    }
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}



async function forgetPassword2(req, res) {
  try {
    let data = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username }
      ]
    })
    if (data) {
      if (!data.passwordResetOptions || !data.passwordResetOptions.otp) {
        return res.status(400).send({
          result: "Fail",
          reason: "No active password reset request found. Please request a new OTP"
        })
      }
      if (String(data.passwordResetOptions.otp) === String(req.body.otp)) {
        const otpDate = data.passwordResetOptions.date ? new Date(data.passwordResetOptions.date).getTime() : 0
        if ((Date.now() - otpDate) > 600000) {
          res.status(400).send({
            result: "Fail",
            reason: "OTP Has Been Expired, Please Try Again"
          })
        }
        else {
          res.send({
            result: "Done"
          })
        }
      }
      else {
        res.status(400).send({
          result: "Fail",
          reason: "Invalid OTP"
        })
      }
    }
    else {
      res.status(401).send({
        result: "Fail",
        reason: "Unauthorized Activity"
      })
    }
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}



async function forgetPassword3(req, res) {
  try {
    let data = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username }
      ]
    })
    if (data) {
      if (schema.validate(req.body.password)) {
        bcrypt.hash(req.body?.password, 12, async (error, hash) => {
          if (error) {
            res.status(400).send({
              result: "Fail",
              reason: "Internal Server Error"
            })
          } else {

            data.password = hash
            data.passwordResetOptions = {}
            await data.save()
            res.send({
              result: "Done",
              data: data
            })

            mailer.sendMail({
              from: process.env.MAIL_USERNAME,
              to: data.email,
              subject: `Password Has Been Reset Successfully:Team ${process.env.SITE_NAME}`,
              html: `
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f9;padding:40px 0;">
                    <tr>
                      <td align="center">

                        <table width="600" cellpadding="0" cellspacing="0" border="0"
                          style="background:#ffffff;border:1px solid #dddddd;border-radius:8px;">

                          <!-- Header -->
                          <tr>
                            <td align="center" style="background:#0d6efd;padding:30px;">

                              <h1 style="margin:0;color:#ffffff;font-size:30px;">
                                ${process.env.SITE_NAME}
                              </h1>

                              <p style="margin:10px 0 0;color:#dbe9ff;font-size:15px;">
                                Password Reset Successful
                              </p>

                            </td>
                          </tr>

                          <!-- Content -->
                          <tr>
                            <td style="padding:35px;">

                              <h2 style="margin:0 0 20px;color:#222222;font-size:23px;">
                                Hello ${data.name},
                              </h2>

                              <p style="margin:0 0 20px;color:#555555;font-size:16px;line-height:27px;">
                                Your password for your
                                <strong>${process.env.SITE_NAME}</strong>
                                account has been successfully reset.
                              </p>

                              <!-- Success Status -->
                              <table width="100%" cellpadding="15" cellspacing="0" border="0"
                                style="background:#eaf8f0;border-left:4px solid #28a745;margin:25px 0;">

                                <tr>
                                  <td style="color:#333333;font-size:15px;line-height:24px;">

                                    <strong style="color:#28a745;">
                                      ✓ Password Reset Successful
                                    </strong>

                                    <br>

                                    Your new password is now active and you can use it to log in to your account.

                                  </td>
                                </tr>

                              </table>

                              <!-- Account Details -->
                              <table width="100%" cellpadding="12" cellspacing="0" border="0"
                                style="border:1px solid #e5e5e5;border-collapse:collapse;margin:25px 0;">

                                <tr style="background:#f8f9fa;">
                                  <td style="font-weight:bold;color:#333333;width:160px;">
                                    Account
                                  </td>

                                  <td style="color:#555555;">
                                    ${data.email}
                                  </td>
                                </tr>

                                <tr style="background:#f8f9fa;">
                                  <td style="font-weight:bold;color:#333333;">
                                    Status
                                  </td>

                                  <td style="color:#28a745;font-weight:bold;">
                                    Password Updated
                                  </td>
                                </tr>

                              </table>

                              <p style="margin:0 0 20px;color:#555555;font-size:15px;line-height:25px;">
                                If you made this change, no further action is required.
                              </p>

                              <table width="100%" cellpadding="15" cellspacing="0" border="0"
                                style="background:#fff8e6;border-left:4px solid #ffc107;margin:25px 0;">

                                <tr>
                                  <td style="color:#555555;font-size:14px;line-height:23px;">
                                    <strong>Security Notice:</strong><br>
                                    If you did not reset your password, please contact our support team immediately and secure your
                                    account.
                                  </td>
                                </tr>

                              </table>

                              <!-- Login Button -->
                              <table cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                  <td align="center" bgcolor="#0d6efd" style="border-radius:5px;">

                                    <a href="${process.env.SITE_URL}/login"
                                      style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">
                                      Login to Your Account
                                    </a>

                                  </td>
                                </tr>
                              </table>

                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td align="center" style="background:#f8f9fa;padding:22px;border-top:1px solid #e5e5e5;">

                              <p style="margin:0;color:#666666;font-size:14px;">
                                ${process.env.SITE_NAME} Support Team
                              </p>

                              <p style="margin:8px 0 0;color:#999999;font-size:12px;">
                                © 2026 ${process.env.SITE_NAME}. All Rights Reserved.
                              </p>

                            </td>
                          </tr>

                        </table>

                      </td>
                    </tr>
                   </table>
      `
            })


          }
        })
      }
      else {
        res.status(400).send({
          result: "Fail",
          reason: schema.validate(req.body?.password, { details: true }).map(x => x.message.replaceAll("string", "Password")).join("|")
        })
      }
    }
    else {
      res.status(401).send({
        result: "Fail",
        reason: "Unauthorized Activity"
      })
    }
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
  deleteRecord,
  login,
  forgetPassword1,
  forgetPassword2,
  forgetPassword3,
  addAddress,
  getAddress,
  deleteAddress,
  verifyEmail
}