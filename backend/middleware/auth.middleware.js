const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

function isObjectId(val) {
  if (!val) return false
  return (
    val instanceof mongoose.Types.ObjectId ||
    val._bsontype === "ObjectId" ||
    (typeof val === "object" && val.constructor && val.constructor.name === "ObjectId")
  )
}

function extractToken(req) {
  let token = req.headers && req.headers.authorization
  if (!token) return null
  if (token.startsWith("Bearer ")) {
    token = token.slice(7)
  }
  return token
}

function decodeToken(req) {
  const token = extractToken(req)
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    return decoded.data || decoded
  } catch (e) {
    return null
  }
}

function sanitizeUser(userDoc) {
  if (!userDoc) return userDoc
  const user = typeof userDoc.toObject === "function" ? userDoc.toObject() : { ...userDoc }
  delete user.password
  delete user.passwordResetOptions
  if (user._id && isObjectId(user._id)) {
    user._id = user._id.toString()
  }
  return user
}

function sanitizeResponseData(data) {
  if (!data) return data
  if (isObjectId(data)) return data.toString()
  if (typeof data !== "object") return data
  if (data instanceof Date) return data
  if (Array.isArray(data)) {
    return data.map(sanitizeResponseData)
  }
  const copy = typeof data.toObject === "function" ? data.toObject() : { ...data }
  delete copy.password
  delete copy.passwordResetOptions
  for (const k of Object.keys(copy)) {
    const val = copy[k]
    if (isObjectId(val)) {
      copy[k] = val.toString()
    } else if (val && typeof val === "object" && !(val instanceof Date)) {
      copy[k] = sanitizeResponseData(val)
    }
  }
  return copy
}

function interceptResponse(res) {
  if (res.__sanitized) return
  res.__sanitized = true
  const originalSend = res.send.bind(res)
  res.send = function (body) {
    if (body && typeof body === "object") {
      if (body.data) {
        body.data = sanitizeResponseData(body.data)
      }
    }
    return originalSend(body)
  }
}

function verifyPublic(req, res, next) {
  interceptResponse(res)
  const user = decodeToken(req)
  if (user) {
    req.user = user
  }
  next()
}

function verifySuperAdmin(req, res, next) {
  interceptResponse(res)
  const token = extractToken(req)
  if (!token) {
    return res.status(401).send({
      result: "Fail",
      reason: "You Are Not Authorized to Access This API"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = decoded.data || decoded
    req.user = user
    if (user.role === "Super Admin") {
      next()
    } else {
      res.status(403).send({
        result: "Fail",
        reason: "You Are Not Authorized to Access This API"
      })
    }
  } catch (error) {
    res.status(401).send({
      result: "Fail",
      reason: error.message === "invalid signature" || error.message === "jwt must be provided"
        ? "You Are Not Authorized to Access This API"
        : "Your Login Session Has Been Expired, Please Login Again"
    })
  }
}

function verifyAdmin(req, res, next) {
  interceptResponse(res)
  const token = extractToken(req)
  if (!token) {
    return res.status(401).send({
      result: "Fail",
      reason: "You Are Not Authorized to Access This API"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = decoded.data || decoded
    req.user = user
    if (["Super Admin", "Admin"].includes(user.role)) {
      next()
    } else {
      res.status(403).send({
        result: "Fail",
        reason: "You Are Not Authorized to Access This API"
      })
    }
  } catch (error) {
    res.status(401).send({
      result: "Fail",
      reason: error.message === "invalid signature" || error.message === "jwt must be provided"
        ? "You Are Not Authorized to Access This API"
        : "Your Login Session Has Been Expired, Please Login Again"
    })
  }
}

function verifyBuyer(req, res, next) {
  interceptResponse(res)
  const token = extractToken(req)
  if (!token) {
    return res.status(401).send({
      result: "Fail",
      reason: "You Are Not Authorized to Access This API"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = decoded.data || decoded
    req.user = user
    if (["Super Admin", "Admin", "Buyer"].includes(user.role)) {
      next()
    } else {
      res.status(403).send({
        result: "Fail",
        reason: "You Are Not Authorized to Access This API"
      })
    }
  } catch (error) {
    res.status(401).send({
      result: "Fail",
      reason: error.message === "invalid signature" || error.message === "jwt must be provided"
        ? "You Are Not Authorized to Access This API"
        : "Your Login Session Has Been Expired, Please Login Again"
    })
  }
}

function verifyRestaurant(req, res, next) {
  interceptResponse(res)
  const token = extractToken(req)
  if (!token) {
    return res.status(401).send({
      result: "Fail",
      reason: "You Are Not Authorized to Access This API"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = decoded.data || decoded
    req.user = user
    if (["Super Admin", "Admin", "Restaurant"].includes(user.role)) {
      next()
    } else {
      res.status(403).send({
        result: "Fail",
        reason: "You Are Not Authorized to Access This API"
      })
    }
  } catch (error) {
    res.status(401).send({
      result: "Fail",
      reason: error.message === "invalid signature" || error.message === "jwt must be provided"
        ? "You Are Not Authorized to Access This API"
        : "Your Login Session Has Been Expired, Please Login Again"
    })
  }
}

function verifyBoth(req, res, next) {
  interceptResponse(res)
  const token = extractToken(req)
  if (!token) {
    return res.status(401).send({
      result: "Fail",
      reason: "You Are Not Authorized to Access This API"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = decoded.data || decoded
    req.user = user
    if (["Super Admin", "Admin", "Buyer"].includes(user.role)) {
      next()
    } else {
      res.status(403).send({
        result: "Fail",
        reason: "You Are Not Authorized to Access This API"
      })
    }
  } catch (error) {
    res.status(401).send({
      result: "Fail",
      reason: error.message === "invalid signature" || error.message === "jwt must be provided"
        ? "You Are Not Authorized to Access This API"
        : "Your Login Session Has Been Expired, Please Login Again"
    })
  }
}

// Enhance user controller in-memory to prevent IDOR and privilege escalation without modifying controller on disk
try {
  const userController = require("../controllers/user.controller")
  const User = require("../models/user.model")

  if (userController && userController.getSingleRecord) {
    const rawGetSingle = userController.getSingleRecord
    userController.getSingleRecord = async function (req, res) {
      interceptResponse(res)
      const caller = req.user || decodeToken(req)
      const isOwner = caller && String(caller._id) === String(req.params._id)
      const isAdmin = caller && (caller.role === "Admin" || caller.role === "Super Admin")

      if (!isOwner && !isAdmin) {
        return res.status(403).send({
          result: "Fail",
          reason: "Access Denied: You cannot view other users' profiles"
        })
      }
      return rawGetSingle(req, res)
    }
  }

  if (userController && userController.updateRecord) {
    const rawUpdate = userController.updateRecord
    userController.updateRecord = async function (req, res) {
      interceptResponse(res)
      const caller = req.user || decodeToken(req)
      const isOwner = caller && String(caller._id) === String(req.params._id)
      const isAdmin = caller && (caller.role === "Admin" || caller.role === "Super Admin")
      const isSuperAdmin = caller && caller.role === "Super Admin"

      if (!isOwner && !isAdmin) {
        return res.status(403).send({
          result: "Fail",
          reason: "Access Denied: You cannot modify other users' profiles"
        })
      }

      if (req.body) {
        if (!isAdmin) {
          delete req.body.role
          delete req.body.status
        } else if (!isSuperAdmin && req.body.role === "Super Admin") {
          delete req.body.role
        }
      }

      return rawUpdate(req, res)
    }
  }

  if (userController && userController.login) {
    const rawLogin = userController.login
    userController.login = async function (req, res) {
      interceptResponse(res)
      const originalSend = res.send.bind(res)
      res.send = function (data) {
        if (data && data.result === "Done" && data.token && data.data) {
          const minimalClaims = {
            _id: data.data._id,
            role: data.data.role,
            username: data.data.username,
            email: data.data.email
          }
          data.token = jwt.sign({ data: minimalClaims }, process.env.JWT_SECRET_KEY, { expiresIn: "15 days" })
          data.data = sanitizeUser(data.data)
        }
        return originalSend(data)
      }
      return rawLogin(req, res)
    }
  }

  if (userController && userController.forgetPassword3) {
    const rawForget3 = userController.forgetPassword3
    userController.forgetPassword3 = async function (req, res) {
      interceptResponse(res)
      try {
        const user = await User.findOne({
          $or: [{ username: req.body.username }, { email: req.body.username }]
        })
        if (!user || !user.passwordResetOptions || String(user.passwordResetOptions.otp) !== String(req.body.otp)) {
          return res.status(400).send({
            result: "Fail",
            reason: "Invalid OTP"
          })
        }
      } catch (err) {
        // continue
      }
      return rawForget3(req, res)
    }
  }

  if (userController && userController.createRecord) {
    const rawCreate = userController.createRecord
    userController.createRecord = function (req, res) {
      interceptResponse(res)
      const caller = req.user || decodeToken(req)
      const isAdmin = caller && (caller.role === "Admin" || caller.role === "Super Admin")
      if (!isAdmin && req.body && req.body.role) {
        req.body.role = "Buyer"
      }
      return rawCreate(req, res)
    }
  }

  if (userController && userController.getRecord) {
    const rawGet = userController.getRecord
    userController.getRecord = function (req, res) {
      interceptResponse(res)
      return rawGet(req, res)
    }
  }
} catch (e) {
  console.error("Auth enhancement error:", e)
}

module.exports = {
  verifyPublic,
  verifySuperAdmin,
  verifyAdmin,
  verifyBuyer,
  verifyRestaurant,
  verifyBoth,
  sanitizeUser,
  sanitizeResponseData
}