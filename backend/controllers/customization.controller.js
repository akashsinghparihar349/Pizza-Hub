const CustomizationItem = require("../models/customization.model")

// Default pizza customization options per PizzaHub specifications
const defaultOptions = [
  // 5 Pizza Bases
  { name: "Classic Hand Tossed", type: "base", price: 0, description: "Traditional crust with a garlic-seasoned edge" },
  { name: "Thin & Crispy", type: "base", price: 30, description: "Extra thin, crispy crust with signature crunch" },
  { name: "Cheese Burst", type: "base", price: 80, description: "Crust stuffed with hot molten mozzarella" },
  { name: "Fresh Pan", type: "base", price: 50, description: "Thick, soft, and buttery golden crust" },
  { name: "Gluten Free Crust", type: "base", price: 90, description: "Wholesome gluten-free pizza base" },

  // 5 Pizza Sauces
  { name: "Classic Marinara", type: "sauce", price: 0, description: "Slow-simmered San Marzano tomato & herb sauce" },
  { name: "Spicy Red Arrabiata", type: "sauce", price: 20, description: "Fiery tomato sauce with red chili and garlic" },
  { name: "Creamy Garlic Parmesan", type: "sauce", price: 35, description: "Rich white sauce with roasted garlic and cheese" },
  { name: "Smoky Barbecue", type: "sauce", price: 25, description: "Sweet & tangy smoky barbecue reduction" },
  { name: "Basil Pesto", type: "sauce", price: 40, description: "Fresh aromatic basil, pine nuts, and olive oil sauce" },

  // Cheese Options
  { name: "Standard Mozzarella", type: "cheese", price: 0, description: "100% real dairy shredded mozzarella" },
  { name: "Extra Mozzarella", type: "cheese", price: 50, description: "Double layer of stretchy mozzarella" },
  { name: "Cheddar & Mozzarella Blend", type: "cheese", price: 60, description: "Sharp cheddar blended with creamy mozzarella" },
  { name: "Smoked Gouda", type: "cheese", price: 75, description: "Rich, mildly smoky Dutch gouda" },

  // Vegetable Toppings
  { name: "Fresh Mushrooms", type: "veggie", price: 30, description: "Sliced button mushrooms" },
  { name: "Crisp Bell Peppers", type: "veggie", price: 25, description: "Tri-color crunchy capsicum" },
  { name: "Red Onions", type: "veggie", price: 20, description: "Sweet and crisp sliced red onions" },
  { name: "Black Olives", type: "veggie", price: 35, description: "Pitted sliced Mediterranean black olives" },
  { name: "Golden Sweet Corn", type: "veggie", price: 25, description: "Plump and juicy sweet corn kernels" },
  { name: "Spicy Jalapenos", type: "veggie", price: 30, description: "Pickled Mexican jalapeno peppers" },
  { name: "Fresh Basil Leaves", type: "veggie", price: 20, description: "Aromatic whole Italian basil" }
]

async function seedDefaultOptions(req, res) {
  try {
    const count = await CustomizationItem.countDocuments()
    if (count > 0) {
      return res.send({
        result: "Done",
        message: "Customization options already seeded",
        count
      })
    }

    await CustomizationItem.insertMany(defaultOptions)
    const items = await CustomizationItem.find({ status: true })
    res.send({
      result: "Done",
      message: "Successfully seeded 5 bases, 5 sauces, cheese, and vegetable options",
      data: items,
      count: items.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

async function getCustomizationOptions(req, res) {
  try {
    const items = await CustomizationItem.find({ status: true })

    // Auto-seed if database has no customization items yet
    if (items.length === 0) {
      await CustomizationItem.insertMany(defaultOptions)
      const seeded = await CustomizationItem.find({ status: true })
      return res.send({
        result: "Done",
        data: groupOptions(seeded),
        count: seeded.length
      })
    }

    res.send({
      result: "Done",
      data: groupOptions(items),
      count: items.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

function groupOptions(items) {
  return {
    bases: items.filter(x => x.type === "base"),
    sauces: items.filter(x => x.type === "sauce"),
    cheeses: items.filter(x => x.type === "cheese"),
    veggies: items.filter(x => x.type === "veggie")
  }
}

async function calculatePrice(req, res) {
  try {
    const { baseId, sauceId, cheeseId, veggieIds = [], basePrice = 249, size = "Regular", quantity = 1 } = req.body

    let extraPrice = 0
    let selectedDetails = {
      base: null,
      sauce: null,
      cheese: null,
      veggies: []
    }

    // Size multiplier
    const sizeMultiplierMap = {
      "Regular": 1.0,
      "Medium": 1.4,
      "Large": 1.8
    }
    const multiplier = sizeMultiplierMap[size] || 1.0

    // Fetch base
    if (baseId) {
      const base = await CustomizationItem.findOne({ _id: baseId, type: "base", status: true })
      if (base) {
        extraPrice += base.price
        selectedDetails.base = { name: base.name, price: base.price }
      }
    }

    // Fetch sauce
    if (sauceId) {
      const sauce = await CustomizationItem.findOne({ _id: sauceId, type: "sauce", status: true })
      if (sauce) {
        extraPrice += sauce.price
        selectedDetails.sauce = { name: sauce.name, price: sauce.price }
      }
    }

    // Fetch cheese
    if (cheeseId) {
      const cheese = await CustomizationItem.findOne({ _id: cheeseId, type: "cheese", status: true })
      if (cheese) {
        extraPrice += cheese.price
        selectedDetails.cheese = { name: cheese.name, price: cheese.price }
      }
    }

    // Fetch veggies
    if (Array.isArray(veggieIds) && veggieIds.length > 0) {
      const veggies = await CustomizationItem.find({ _id: { $in: veggieIds }, type: "veggie", status: true })
      veggies.forEach(v => {
        extraPrice += v.price
        selectedDetails.veggies.push({ name: v.name, price: v.price })
      })
    }

    // Server-side authoritative price calculation
    const unitPrice = Math.round((Number(basePrice) + extraPrice) * multiplier)
    const totalPrice = unitPrice * Math.max(1, parseInt(quantity, 10) || 1)

    res.send({
      result: "Done",
      data: {
        basePrice: Number(basePrice),
        customizationExtra: extraPrice,
        size,
        sizeMultiplier: multiplier,
        unitPrice,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
        totalPrice,
        selectedDetails
      }
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

async function createOption(req, res) {
  try {
    let item = new CustomizationItem(req.body)
    await item.save()
    res.send({
      result: "Done",
      data: item
    })
  } catch (error) {
    let errorMessage = error.errors ? Object.fromEntries(Object.keys(error.errors).map(k => [k, error.errors[k].message])) : "Internal Server Error"
    res.status(400).send({
      result: "Fail",
      reason: errorMessage
    })
  }
}

async function updateOption(req, res) {
  try {
    let item = await CustomizationItem.findOne({ _id: req.params._id })
    if (item) {
      item.name = req.body.name ?? item.name
      item.type = req.body.type ?? item.type
      item.price = req.body.price ?? item.price
      item.description = req.body.description ?? item.description
      item.inStock = req.body.inStock ?? item.inStock
      item.status = req.body.status ?? item.status
      await item.save()
      res.send({
        result: "Done",
        data: item
      })
    } else {
      res.status(404).send({
        result: "Fail",
        reason: "Option Not Found"
      })
    }
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

async function deleteOption(req, res) {
  try {
    let item = await CustomizationItem.findOne({ _id: req.params._id })
    if (item) {
      await item.deleteOne()
      res.send({
        result: "Done"
      })
    } else {
      res.status(404).send({
        result: "Fail",
        reason: "Option Not Found"
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
  getCustomizationOptions,
  calculatePrice,
  seedDefaultOptions,
  createOption,
  updateOption,
  deleteOption
}
