const multer = require("multer")
const path = require("path")
const fs = require("fs")

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

function generateUpload(folder) {
  const targetDir = `public/uploads/${folder}`
  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true })
    } catch (err) {
      console.error(`Failed to ensure upload dir ${targetDir}:`, err.message)
    }
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, targetDir)
    },
    filename: function (req, file, cb) {
      const sanitizedName = path
        .basename(file.originalname)
        .replace(/[^a-zA-Z0-9._-]/g, "_")
      cb(null, `${Date.now()}_${sanitizedName}`)
    }
  })

  return multer({
    storage: storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 5 // max 5 files per upload
    },
    fileFilter: function (req, file, cb) {
      if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
        cb(null, true)
      } else {
        cb(new Error(`Invalid file type '${file.mimetype}'. Only images (JPEG, PNG, WebP, GIF) are permitted.`), false)
      }
    }
  })
}

const maincategoryUploader = generateUpload("maincategory")
const subcategoryUploader = generateUpload("subcategory")
const categoryUploader = generateUpload("category")
const brandUploader = generateUpload("brand")
const productUploader = generateUpload("product")

module.exports = {
  maincategoryUploader,
  subcategoryUploader,
  categoryUploader,
  brandUploader,
  productUploader
}