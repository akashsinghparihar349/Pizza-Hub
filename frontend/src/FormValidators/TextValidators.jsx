import React from 'react'
import PasswordValidator from 'password-validator'

var schema = new PasswordValidator();

// Add properties to it
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase(1)                             // Must have at least 1 uppercase letter
    .has().lowercase(1)                             // Must have at least 1 lowercase letter
    .has().digits(1)                                // Must have at least 1 digit
    .has().symbols(1)                               // Must have at least 1 special Character
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

export default function TextValidators(e) {
    let { value, name } = e.target
    switch (name) {
        case "name":
        case "email":
        case "username":
        case "icon":
        case "question":
        case "subject":
            if (!value || value.length === 0)
                return name + " Field is Mendatory"
            else if (value.length < 2 || value.length > 100)
                return name + " Field Length Must Be 2-100"
            else
                return ""

        case "password":
            if (!value || value.length === 0)
                return name + " Field is Mendatory"
            else if (!schema.validate(value))
                return schema.validate(value, { details: true }).map(x => x.message.replaceAll('string', 'Password')).join("|")
            else
                return ""

        case "phone":
            if (!value || value.length === 0)
                return name + " Field is Mendatory"
            else if (value.length < 10 || value.length > 10)
                return "Invalid Phone Number, Phone Number Should Be 10 Digits"
            else if (!["6", "7", "8", "9"].includes(value[0]))
                return "Invalid Phone Number, Phone Number Must Start With 6,7,8,9"
            else
                return ""

        case "basePrice":
            if (!value || value.length === 0)
                return name + " Field is Mendatory"
            else if (parseInt(value) < 1)
                return "Price Field Length Be 1 or More"
            else
                return ""


        case "stockQuantity":
            if (!value || value.length === 0)
                return name + " Field is Mendatory"
            else if (parseInt(value) < 0)
                return "Stock Quantity Field Length Be 0 or More"
            else
                return ""


        case "discount":
            if (!value || value.length === 0)
                return name + " Field is Mendatory"
            else if (parseInt(value) < 0 || parseInt(value) > 100)
                return "Discount Field Value Must Be 0-100"
            else
                return ""

        case "shortDescription":
        case "answer":
            if (!value || value.length === 0)
                return name + " Field is Mendatory"
            else if (value.length < 20 || value.length > 1000)
                return name + " Field Length Must Be 20-1000"
            else
                return ""

        case "message":
            if (!value || value.length === 0)
                return name + " Field is Mendatory"
            else if (value.length < 20)
                return name + " Field Length Must Be Greater Then or Equal to 20 Characters"
            else
                return ""


        default:
            return ""
    }
}
