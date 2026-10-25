import React from 'react'

export default function ImageValidators(e) {
  if (!e?.target?.files || e.target.files.length === 0) {
    return ""
  }
  if (e.target.files.length === 1) {
    let pic = e.target.files[0]
    if (!["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(pic.type))
      return "Invalid Pic Format, Please Upload an Image of type jpeg, jpg, png, gif or webp"
    else if (pic.size > 1048576)
      return "Pic is too Heavy, Please Upload an Image Upto 1 MB"
    else
      return ""
  }
  else {
    let errorMessage = []
    Array.from(e.target.files).forEach((pic,index) => {
      if (!["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(pic.type))
        errorMessage.push(`Invalid Pic${index + 1} Format, Please Upload an Image of type jpeg, jpg, png, gif or webp`)
      else if (pic.size > 1048576)
        errorMessage.push(`Pic${index + 1} is too Heavy, Please Upload an Image Upto 1 MB`)
    })
    return errorMessage.length ? errorMessage.join("|") : ""
  }
}
