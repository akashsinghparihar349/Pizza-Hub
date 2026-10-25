require("dotenv").config()
const mongoose = require("mongoose")

const Maincategory = require("./models/maincategory.model")
const User = require("./models/user.model")
const Subcategory = require("./models/subcategory.model")
const Brand = require("./models/brand.model")
const Product = require("./models/product.model")
const CustomizationItem = require("./models/customization.model")
const Feature = require("./models/feature.model")
const Faq = require("./models/faq.model")
const Testimonial = require("./models/testimonial.model")
const Setting = require("./models/setting.model")

async function seed() {
  const dbKey = process.env.DB_KEY || "mongodb://127.0.0.1:27017/PizzaHub"
  await mongoose.connect(dbKey)
  console.log("Connected to MongoDB for seeding:", dbKey)

  // 1. Settings
  const existingSetting = await Setting.findOne()
  if (!existingSetting) {
    await Setting.create({
      siteName: "PizzaHub",
      address: "A-43, Sector 16, Noida, Uttar Pradesh",
      email: "support@pizzahub.com",
      phone: "+91 98765 43210",
      whatsapp: "9876543210",
      map1: "https://maps.google.com",
      map2: "https://maps.google.com"
    })
    console.log("Created Setting")
  }

  // 2. Customization Items
  const custCount = await CustomizationItem.countDocuments()
  if (custCount === 0) {
    await CustomizationItem.insertMany([
      // Bases
      { name: "Classic Hand Tossed", type: "base", price: 0, description: "Traditional crust with a garlic-seasoned edge", status: true },
      { name: "Thin & Crispy", type: "base", price: 30, description: "Extra thin, crispy crust with signature crunch", status: true },
      { name: "Cheese Burst", type: "base", price: 80, description: "Crust stuffed with hot molten mozzarella", status: true },
      { name: "Fresh Pan", type: "base", price: 50, description: "Thick, soft, and buttery golden crust", status: true },
      { name: "Gluten Free Crust", type: "base", price: 90, description: "Wholesome gluten-free pizza base", status: true },

      // Sauces
      { name: "Classic Marinara", type: "sauce", price: 0, description: "Slow-simmered San Marzano tomato & herb sauce", status: true },
      { name: "Spicy Red Arrabiata", type: "sauce", price: 20, description: "Fiery tomato sauce with red chili and garlic", status: true },
      { name: "Creamy Garlic Parmesan", type: "sauce", price: 35, description: "Rich white sauce with roasted garlic and cheese", status: true },
      { name: "Smoky Barbecue", type: "sauce", price: 25, description: "Sweet & tangy smoky barbecue reduction", status: true },
      { name: "Basil Pesto", type: "sauce", price: 40, description: "Fresh aromatic basil, pine nuts, and olive oil sauce", status: true },

      // Cheeses
      { name: "Standard Mozzarella", type: "cheese", price: 0, description: "100% real dairy shredded mozzarella", status: true },
      { name: "Extra Mozzarella", type: "cheese", price: 50, description: "Double layer of stretchy mozzarella", status: true },
      { name: "Cheddar & Mozzarella Blend", type: "cheese", price: 60, description: "Sharp cheddar blended with creamy mozzarella", status: true },
      { name: "Smoked Gouda", type: "cheese", price: 75, description: "Rich, mildly smoky Dutch gouda", status: true },

      // Veggies
      { name: "Fresh Mushrooms", type: "veggie", price: 30, description: "Sliced button mushrooms", status: true },
      { name: "Crisp Bell Peppers", type: "veggie", price: 25, description: "Tri-color crunchy capsicum", status: true },
      { name: "Red Onions", type: "veggie", price: 20, description: "Sweet and crisp sliced red onions", status: true },
      { name: "Black Olives", type: "veggie", price: 35, description: "Pitted sliced Mediterranean black olives", status: true },
      { name: "Golden Sweet Corn", type: "veggie", price: 25, description: "Plump and juicy sweet corn kernels", status: true },
      { name: "Spicy Jalapenos", type: "veggie", price: 30, description: "Pickled Mexican jalapeno peppers", status: true },
      { name: "Fresh Basil Leaves", type: "veggie", price: 20, description: "Aromatic whole Italian basil", status: true }
    ])
    console.log("Seeded Customization Items")
  }

  // 3. Maincategories
  let mcVeg = await Maincategory.findOne({ name: "Veg Pizzas" })
  if (!mcVeg) mcVeg = await Maincategory.create({ name: "Veg Pizzas", pic: "public/uploads/product/pizza_farmhouse.jpg", status: true })

  let mcNonVeg = await Maincategory.findOne({ name: "Non-Veg Pizzas" })
  if (!mcNonVeg) mcNonVeg = await Maincategory.create({ name: "Non-Veg Pizzas", pic: "public/uploads/product/pizza_hero_banner.jpg", status: true })

  let mcBeverages = await Maincategory.findOne({ name: "Beverages" })
  if (!mcBeverages) mcBeverages = await Maincategory.create({ name: "Beverages", pic: "public/uploads/product/pizza_margherita.jpg", status: true })

  // 4. Subcategories
  let subClassic = await Subcategory.findOne({ name: "Classic Pizzas" })
  if (!subClassic) subClassic = await Subcategory.create({ name: "Classic Pizzas", pic: "public/uploads/product/pizza_margherita.jpg", status: true })

  let subPremium = await Subcategory.findOne({ name: "Premium Gourmet" })
  if (!subPremium) subPremium = await Subcategory.create({ name: "Premium Gourmet", pic: "public/uploads/product/pizza_farmhouse.jpg", status: true })

  let subColdDrinks = await Subcategory.findOne({ name: "Cold Drinks" })
  if (!subColdDrinks) subColdDrinks = await Subcategory.create({ name: "Cold Drinks", pic: "public/uploads/product/pizza_margherita.jpg", status: true })

  // 5. Brands
  let brandSignature = await Brand.findOne({ name: "PizzaHub Signature" })
  if (!brandSignature) brandSignature = await Brand.create({ name: "PizzaHub Signature", pic: "public/uploads/product/pizza_margherita.jpg", status: true })

  let brandItalian = await Brand.findOne({ name: "Italian Craft" })
  if (!brandItalian) brandItalian = await Brand.create({ name: "Italian Craft", pic: "public/uploads/product/pizza_farmhouse.jpg", status: true })

  // 6. Products
  const prodCount = await Product.countDocuments()
  if (prodCount === 0) {
    await Product.insertMany([
      {
        name: "Margherita Classic Pizza",
        maincategory: mcVeg._id,
        subcategory: subClassic._id,
        brand: brandSignature._id,
        basePrice: 220,
        discount: 10,
        finalPrice: 198,
        stock: true,
        stockQuantity: 100,
        size: ["Small", "Medium", "Large", "Extra Large"],
        sizePrices: [
          { size: "Small", inches: "6", price: 159 },
          { size: "Medium", inches: "8", price: 279 },
          { size: "Large", inches: "10", price: 399 },
          { size: "Extra Large", inches: "12", price: 499 }
        ],
        isCustomizable: true,
        isVeg: true,
        crust: "Classic Hand Tossed",
        description: "Authentic Neapolitan style crust loaded with San Marzano marinara, fresh buffalo mozzarella, aromatic basil leaves, and extra virgin olive oil.",
        pic: ["public/uploads/product/pizza_margherita.jpg"],
        status: true
      },
      {
        name: "Farmhouse Veggie Supreme Pizza",
        maincategory: mcVeg._id,
        subcategory: subPremium._id,
        brand: brandItalian._id,
        basePrice: 320,
        discount: 15,
        finalPrice: 272,
        stock: true,
        stockQuantity: 80,
        size: ["Small", "Medium", "Large", "Extra Large"],
        sizePrices: [
          { size: "Small", inches: "6", price: 219 },
          { size: "Medium", inches: "8", price: 379 },
          { size: "Large", inches: "10", price: 539 },
          { size: "Extra Large", inches: "12", price: 659 }
        ],
        isCustomizable: true,
        isVeg: true,
        crust: "Thin & Crispy",
        description: "A colorful feast of crisp bell peppers, savory button mushrooms, juicy sweet corn, fresh sliced red onions, and ripe black olives over melted mozzarella.",
        pic: ["public/uploads/product/pizza_farmhouse.jpg"],
        status: true
      },
      {
        name: "Artisan Pepperoni Feast Pizza",
        maincategory: mcNonVeg._id,
        subcategory: subClassic._id,
        brand: brandSignature._id,
        basePrice: 380,
        discount: 10,
        finalPrice: 342,
        stock: true,
        stockQuantity: 65,
        size: ["Small", "Medium", "Large", "Extra Large"],
        sizePrices: [
          { size: "Small", inches: "6", price: 279 },
          { size: "Medium", inches: "8", price: 479 },
          { size: "Large", inches: "10", price: 679 },
          { size: "Extra Large", inches: "12", price: 829 }
        ],
        isCustomizable: true,
        isVeg: false,
        crust: "Cheese Burst",
        description: "Generously layered with crispy, savory pepperoni slices, bubbling herb-infused mozzarella, and rich Italian marinara on a golden wood-fired crust.",
        pic: ["public/uploads/product/pizza_hero_banner.jpg"],
        status: true
      },
      {
        name: "Paneer Tikka & Herb Pizza",
        maincategory: mcVeg._id,
        subcategory: subPremium._id,
        brand: brandSignature._id,
        basePrice: 310,
        discount: 12,
        finalPrice: 273,
        stock: true,
        stockQuantity: 70,
        size: ["Small", "Medium", "Large", "Extra Large"],
        sizePrices: [
          { size: "Small", inches: "6", price: 219 },
          { size: "Medium", inches: "8", price: 369 },
          { size: "Large", inches: "10", price: 519 },
          { size: "Extra Large", inches: "12", price: 639 }
        ],
        isCustomizable: true,
        isVeg: true,
        crust: "Fresh Pan",
        description: "Tender tandoori marinated paneer cubes, crunchy red capsicum, sliced onions, and fresh coriander baked to perfection on a garlic butter crust.",
        pic: ["public/uploads/product/pizza_farmhouse.jpg"],
        status: true
      },
      {
        name: "Truffle Mushroom & Smoked Cheese",
        maincategory: mcVeg._id,
        subcategory: subPremium._id,
        brand: brandItalian._id,
        basePrice: 420,
        discount: 10,
        finalPrice: 378,
        stock: true,
        stockQuantity: 50,
        size: ["Small", "Medium", "Large", "Extra Large"],
        sizePrices: [
          { size: "Small", inches: "6", price: 299 },
          { size: "Medium", inches: "8", price: 519 },
          { size: "Large", inches: "10", price: 739 },
          { size: "Extra Large", inches: "12", price: 899 }
        ],
        isCustomizable: true,
        isVeg: true,
        crust: "Wood-Fired Neapolitan",
        description: "Sautéed wild button mushrooms, garlic parmesan cream, smoked gouda, and a delicate drizzle of fragrant white truffle oil.",
        pic: ["public/uploads/product/pizza_margherita.jpg"],
        status: true
      },
      {
        name: "Classic Italian Garlic Breadsticks",
        maincategory: mcBeverages._id,
        subcategory: subColdDrinks._id,
        brand: brandSignature._id,
        basePrice: 140,
        discount: 10,
        finalPrice: 126,
        stock: true,
        stockQuantity: 90,
        size: ["Regular"],
        sizePrices: [
          { size: "Regular", inches: "8", price: 126 }
        ],
        isCustomizable: false,
        isVeg: true,
        crust: "Garlic Butter Glazed",
        description: "Freshly baked breadsticks brushed with roasted garlic butter, rosemary herbs, and served with a zesty marinara dipping sauce.",
        pic: ["public/uploads/product/pizza_hero_banner.jpg"],
        status: true
      }
    ])
    console.log("Seeded Products")
  }

  // 7. Features
  const featCount = await Feature.countDocuments()
  if (featCount === 0) {
    await Feature.insertMany([
      { name: "30-Minute Fast Delivery", shortDescription: "Hot, piping-fresh pizzas right to your doorstep within 30 minutes, guaranteed.", icon: "bi bi-truck", status: true },
      { name: "100% Real Mozzarella", shortDescription: "Crafted exclusively with real dairy mozzarella and premium San Marzano tomatoes.", icon: "bi bi-check-circle-fill", status: true },
      { name: "Interactive Customization", shortDescription: "Design your dream pizza from 5 unique crusts, gourmet sauces, cheese blends, and toppings.", icon: "bi bi-sliders", status: true },
      { name: "Live Order Tracking", shortDescription: "Real-time updates as your pizza is accepted, baked, prepared, and dispatched.", icon: "bi bi-geo-alt-fill", status: true }
    ])
    console.log("Seeded Features")
  }

  // 8. FAQs
  const faqCount = await Faq.countDocuments()
  if (faqCount === 0) {
    await Faq.insertMany([
      { question: "How does the custom pizza builder work?", answer: "Choose your favorite pizza base, pick from 5 gourmet sauces, select cheese intensity, and pile on your favorite fresh vegetable toppings. Prices update automatically in real-time!", status: true },
      { question: "What are your delivery charges?", answer: "We offer FREE delivery on all orders above ₹500! A nominal ₹150 delivery charge applies to smaller orders.", status: true },
      { question: "Can I cancel my order?", answer: "Orders can be cancelled anytime before the kitchen starts baking ('Preparing'). Once in the oven, orders cannot be cancelled to avoid food waste.", status: true },
      { question: "Which payment modes are supported?", answer: "We accept Cash on Delivery (COD) as well as online payments including UPI, Net Banking, and Credit/Debit Cards via Razorpay.", status: true }
    ])
    console.log("Seeded FAQs")
  }

  // 9. Testimonials
  const testCount = await Testimonial.countDocuments()
  if (testCount === 0) {
    const user = await mongoose.model("User").findOne()
    const product = await Product.findOne()
    if (user && product) {
      await Testimonial.insertMany([
        { user: user._id, product: product._id, star: 5, message: "Best woodfired pizza in town! The Cheese Burst crust is out of this world, and delivery arrived in 24 minutes flat." },
        { user: user._id, product: product._id, star: 5, message: "The ability to customize crust, sauce, and toppings is incredible. Farmhouse Supreme with Basil Pesto sauce was pure perfection!" }
      ])
      console.log("Seeded Testimonials")
    }
  }

  console.log("Database seeding completed successfully!")
  await mongoose.connection.close()
}

seed().catch(err => {
  console.error("Seeding error:", err)
  process.exit(1)
})
