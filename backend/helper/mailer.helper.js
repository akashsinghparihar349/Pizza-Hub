const nodemailer = require("nodemailer")

let customTransporter = null
let cachedTransporter = null
let lastConfiguredUser = null
let lastConfiguredPass = null

function getActiveTransporter() {
  if (customTransporter) {
    return customTransporter
  }

  const currentUser = process.env.MAIL_USERNAME?.trim() || ""
  const currentPass = process.env.MAIL_PASSWORD?.trim() || ""

  if (!cachedTransporter || currentUser !== lastConfiguredUser || currentPass !== lastConfiguredPass) {
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      tls: { rejectUnauthorized: false },
      auth: {
        user: currentUser,
        pass: currentPass
      }
    })
    lastConfiguredUser = currentUser
    lastConfiguredPass = currentPass
  }

  return cachedTransporter
}

// Safe wrapper preventing SMTP connection failures from causing unhandled promise rejections
const mailer = {
  get transporter() {
    return getActiveTransporter()
  },
  setTransporter: function (t) {
    customTransporter = t
  },
  resetTransporter: function () {
    customTransporter = null
  },
  sendMail: function (options, callback) {
    const activeTransport = getActiveTransporter()

    // If a mock/custom transport is active (e.g. during automated test runs), use it directly
    if (customTransporter) {
      if (typeof callback === "function") {
        return customTransporter.sendMail(options, callback)
      }
      return customTransporter.sendMail(options).catch((err) => {
        console.error("Nodemailer delivery error (non-fatal):", err.message)
      })
    }

    // Check if SMTP credentials are configured in .env
    const hasCredentials = Boolean(
      process.env.MAIL_USERNAME &&
      process.env.MAIL_PASSWORD &&
      process.env.MAIL_USERNAME.trim() !== "" &&
      process.env.MAIL_PASSWORD.trim() !== ""
    )

    if (!hasCredentials) {
      // In local dev without credentials, log a clean info message and resolve gracefully
      if (process.env.NODE_ENV !== "test") {
        console.log(`ℹ️ [Mailer] SMTP credentials not configured in .env. Email to "${options?.to || 'recipient'}" (Subject: "${options?.subject || ''}") was safely skipped in development.`)
      }
      const skippedResult = { messageId: "dev-skipped-no-credentials" }
      if (typeof callback === "function") {
        return callback(null, skippedResult)
      }
      return Promise.resolve(skippedResult)
    }

    // Ensure valid sender address fallback if options.from is empty
    const normalizedOptions = {
      ...options,
      from: options?.from || process.env.MAIL_USERNAME || process.env.SITE_EMAIL || "no-reply@pizzahub.com"
    }

    if (typeof callback === "function") {
      return activeTransport.sendMail(normalizedOptions, callback)
    }
    return activeTransport.sendMail(normalizedOptions).catch((err) => {
      console.error("Nodemailer delivery error (non-fatal):", err.message)
    })
  }
}

module.exports = mailer