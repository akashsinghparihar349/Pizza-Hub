function formatErrorMessage(error, entityName = "Record") {
  if (!error) return { error: "Unknown error" }

  if (error.code === 11000 || error.keyValue) {
    const keys = error.keyValue ? Object.keys(error.keyValue) : Object.keys(error.keyPattern || {})
    return Object.fromEntries(keys.map(key => [key, `${entityName} with this ${key} already exists`]))
  }

  if (error.errors && typeof error.errors === "object") {
    return Object.fromEntries(Object.keys(error.errors).map(key => [key, error.errors[key]?.message || "Validation error"]))
  }

  if (error.name === "CastError") {
    return { [error.path || "id"]: `Invalid ${error.path || "ID"}: ${error.value}` }
  }

  return { error: error.message || "Internal Server Error" }
}

module.exports = { formatErrorMessage }
