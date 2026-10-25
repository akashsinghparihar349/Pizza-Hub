const crypto = require("crypto")
const Checkout = require("../models/checkout.model")
const Cart = require("../models/cart.model")
const mailer = require("../helper/mailer.helper")
const { computeItemPrice } = require("../helper/pricing.helper")
const Razorpay = require("razorpay")
const { emitOrderStatusUpdated } = require("../helper/socket.helper")
const { validateAndDeductInventory, restoreOrderInventory } = require("../helper/inventory.helper")

// Permitted order lifecycle transitions
const VALID_TRANSITIONS = {
  "Order Placed": ["Accepted", "Cancelled"],
  "Accepted": ["Preparing", "Cancelled"],
  "Preparing": ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  "Delivered": [],
  "Cancelled": []
}

/**
 * Razorpay Payment Order Creation API
 * Uses trusted server-calculated checkout total
 */
async function order(req, res) {
  try {
    let checkid = req.body.checkid || req.body._id || req.body.checkoutId
    if (!checkid && req.user) {
      const latest = await Checkout.findOne({ user: req.user._id, paymentStatus: "Pending" }).sort({ createdAt: -1 })
      if (latest) checkid = latest._id
    }
    if (!checkid) {
      return res.status(400).send({
        result: "Fail",
        reason: "Checkout ID (checkid) is required"
      })
    }

    const check = await Checkout.findOne({ _id: checkid })
    if (!check) {
      return res.status(404).send({
        result: "Fail",
        reason: "Checkout record not found"
      })
    }

    // Ownership check: Customer can only pay for their own order
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(check.user)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot initiate payment for another user's order"
      })
    }

    if (check.paymentStatus === "Done") {
      return res.status(400).send({
        result: "Fail",
        reason: "Payment has already been completed for this order"
      })
    }

    if (check.orderStatus === "Cancelled") {
      return res.status(400).send({
        result: "Fail",
        reason: "Cannot pay for a cancelled order"
      })
    }

    const instance = new Razorpay({
      key_id: process.env.RPKEYID,
      key_secret: process.env.RPSECRETKEY,
    })

    // Server-calculated total converted to smallest currency unit (paise)
    const amountInPaise = Math.round(Number(check.total) * 100)

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: String(check._id)
    }

    instance.orders.create(options, async (error, rpOrder) => {
      if (error) {
        console.error("Razorpay order creation error:", error)
        return res.status(500).send({
          result: "Fail",
          reason: error.error?.description || "Failed to create Razorpay order"
        })
      }

      check.rporderid = rpOrder.id
      check.paymentMode = "Net Banking"
      await check.save()

      res.send({
        result: "Done",
        data: rpOrder
      })
    })
  } catch (error) {
    console.error("Razorpay order API error:", error)
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Razorpay Payment Cryptographic Signature Verification API
 * Verifies HMAC SHA-256 signature and handles duplicate verification idempotently
 */
async function verifyOrder(req, res) {
  try {
    let { checkid, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    if (!checkid && req.user) {
      const latest = await Checkout.findOne({ user: req.user._id, paymentStatus: "Pending" }).sort({ createdAt: -1 })
      if (latest) checkid = latest._id
    }
    if (!checkid) {
      return res.status(400).send({
        result: "Fail",
        reason: "Checkout ID (checkid) is required"
      })
    }

    const check = await Checkout.findOne({ _id: checkid })
    if (!check) {
      return res.status(404).send({
        result: "Fail",
        reason: "Checkout record not found"
      })
    }

    // Ownership check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(check.user)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied"
      })
    }

    // Idempotency: repeated verification requests handled safely
    if (check.paymentStatus === "Done") {
      return res.status(200).send({
        result: "Done",
        message: "Payment already verified successfully",
        data: check
      })
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).send({
        result: "Fail",
        reason: "Payment ID and signature are required for verification"
      })
    }

    const orderIdToVerify = razorpay_order_id || check.rporderid
    if (!orderIdToVerify) {
      return res.status(400).send({
        result: "Fail",
        reason: "Razorpay Order ID missing"
      })
    }

    // Server-side cryptographic HMAC SHA256 signature verification
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RPSECRETKEY || "")
      .update(`${orderIdToVerify}|${razorpay_payment_id}`)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      check.paymentStatus = "Failed"
      await check.save()
      return res.status(400).send({
        result: "Fail",
        reason: "Invalid payment signature: Verification failed"
      })
    }

    // Signature matches: mark payment Done
    check.rppid = razorpay_payment_id
    check.rpsignature = razorpay_signature
    check.paymentStatus = "Done"
    check.paymentMode = "Net Banking"

    // Confirm inventory deduction safely (idempotent)
    await validateAndDeductInventory(check)
    await check.save()

    res.status(200).send({
      result: "Done",
      message: "Payment Verified Successfully",
      data: check
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Create Order / Checkout
 * 1. Retrieves customer's cart
 * 2. Re-validates products & customizations against MongoDB
 * 3. Server computes trusted prices (subtotal, shipping, grand total)
 * 4. Rejects empty carts
 * 5. Saves order snapshot and clears user's cart
 */
async function createRecord(req, res) {
  try {
    const userId = req.user ? req.user._id : req.body.user
    if (!userId) {
      return res.status(401).send({
        result: "Fail",
        reason: "Unauthorized: User identification required"
      })
    }

    // Validate delivery address
    const deliveryAddress = req.body.deliveryAddress
    if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.address || !deliveryAddress.phone) {
      return res.status(400).send({
        result: "Fail",
        reason: "Delivery address with name, address, and phone is required"
      })
    }

    // 1. Retrieve customer's active cart items
    let cartItems = await Cart.find({ user: userId })

    // 2. Reject empty carts
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).send({
        result: "Fail",
        reason: "Cart is empty. Please add items to cart before checkout"
      })
    }

    // 3. Re-validate all products and customizations against MongoDB & compute server totals
    let subtotal = 0
    let orderRestaurant = req.body.restaurant || null
    const snapshotProducts = []

    for (const item of cartItems) {
      const priceCalculation = await computeItemPrice({
        productId: item.product,
        size: item.size || "Regular",
        baseId: item.customization?.base?.id,
        sauceId: item.customization?.sauce?.id,
        cheeseId: item.customization?.cheese?.id,
        veggieIds: item.customization?.veggies?.map(v => v.id),
        quantity: item.quantity || 1
      })

      subtotal += priceCalculation.total
      if (!orderRestaurant && priceCalculation.product?.restaurant) {
        orderRestaurant = priceCalculation.product.restaurant
      }

      snapshotProducts.push({
        product: priceCalculation.product._id,
        name: priceCalculation.product.name,
        pic: priceCalculation.product.pic && priceCalculation.product.pic.length > 0 ? priceCalculation.product.pic[0] : "",
        quantity: priceCalculation.quantity,
        size: priceCalculation.size,
        color: item.color || "",
        unitPrice: priceCalculation.unitPrice,
        total: priceCalculation.total,
        customization: priceCalculation.customization
      })
    }

    // 4. Server-calculated shipping and grand total (Free delivery if subtotal >= 500, else ₹50)
    const shipping = subtotal >= 500 ? 0 : 50
    const discount = 0
    const grandTotal = subtotal + shipping - discount

    // 5. Create checkout record with immutable server prices
    const checkout = new Checkout({
      user: userId,
      deliveryAddress,
      orderStatus: "Order Placed",
      statusHistory: [
        {
          status: "Order Placed",
          timestamp: new Date(),
          updatedBy: userId
        }
      ],
      paymentMode: req.body.paymentMode || "COD",
      paymentStatus: "Pending",
      subtotal,
      shipping,
      discount,
      total: grandTotal,
      restaurant: orderRestaurant,
      products: snapshotProducts
    })

    // Pre-validate & deduct ingredient inventory (throws error if insufficient stock)
    await validateAndDeductInventory(checkout)

    await checkout.save()

    // 6. Clear customer's cart after successful order creation
    await Cart.deleteMany({ user: userId })

    // 7. Emit real-time order creation event
    try {
      emitOrderStatusUpdated({
        orderId: checkout._id,
        orderStatus: checkout.orderStatus,
        updatedAt: checkout.updatedAt,
        statusHistory: checkout.statusHistory
      })
    } catch (socketErr) {
      console.error("Socket emit error on order creation:", socketErr.message)
    }

    // 7. Load populated checkout record for response and email
    const finalData = await Checkout.findOne({ _id: checkout._id })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "products.product",
        select: "name basePrice finalPrice pic size isCustomizable stock stockQuantity"
      })

    res.send({
      result: "Done",
      data: finalData
    })

    // Send email notifications asynchronously (non-blocking)
    try {
      const year = new Date(finalData.createdAt).getUTCFullYear()
      const productRows = finalData.products.map(item => {
        let customizationNotes = []
        if (item.customization?.base?.name) customizationNotes.push(`Crust: ${item.customization.base.name}`)
        if (item.customization?.sauce?.name) customizationNotes.push(`Sauce: ${item.customization.sauce.name}`)
        if (item.customization?.cheese?.name) customizationNotes.push(`Cheese: ${item.customization.cheese.name}`)
        if (item.customization?.veggies?.length) {
          customizationNotes.push(`Toppings: ${item.customization.veggies.map(v => v.name).join(", ")}`)
        }
        const customHtml = customizationNotes.length > 0 ? `<div style="font-size:12px;color:#777;margin-top:4px;">${customizationNotes.join(" | ")}</div>` : ""

        return `
          <tr>
            <td style="border-top:1px solid #e5e5e5;color:#333333;padding:10px;">
              <strong>${item.name || item.product?.name}</strong>
              ${customHtml}
            </td>
            <td align="center" style="border-top:1px solid #e5e5e5;color:#555555;padding:10px;">
              ${item.size}
            </td>
            <td align="right" style="border-top:1px solid #e5e5e5;color:#555555;padding:10px;">
              ₹${item.unitPrice}
            </td>
            <td align="center" style="border-top:1px solid #e5e5e5;color:#555555;padding:10px;">
              ${item.quantity}
            </td>
            <td align="right" style="border-top:1px solid #e5e5e5;color:#555555;padding:10px;">
              ₹${item.total}
            </td>
          </tr>`
      }).join("")

      if (finalData.deliveryAddress?.email) {
        mailer.sendMail({
          from: process.env.MAIL_USERNAME,
          to: finalData.deliveryAddress.email,
          subject: `Your PizzaHub Order Confirmed! [Order #${finalData._id}]`,
          html: `
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #dddddd;border-radius:8px;font-family:Arial,sans-serif;">
              <tr>
                <td align="center" style="background:#e53935;padding:25px;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;">PizzaHub</h1>
                  <p style="margin:8px 0 0;color:#ffebee;font-size:14px;">Order Placed Successfully</p>
                </td>
              </tr>
              <tr>
                <td style="padding:25px;">
                  <h2 style="margin:0 0 15px;color:#222222;font-size:20px;">Thank You, ${finalData.deliveryAddress?.name}!</h2>
                  <p style="color:#555555;font-size:15px;line-height:24px;">Your delicious pizza order has been received. Our chefs are getting ready!</p>
                  
                  <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border:1px solid #e5e5e5;margin:20px 0;">
                    <tr style="background:#f8f9fa;">
                      <td style="font-weight:bold;width:150px;">Order ID</td>
                      <td>${finalData._id}</td>
                    </tr>
                    <tr>
                      <td style="font-weight:bold;">Status</td>
                      <td style="color:#e53935;font-weight:bold;">${finalData.orderStatus}</td>
                    </tr>
                    <tr style="background:#f8f9fa;">
                      <td style="font-weight:bold;">Payment</td>
                      <td>${finalData.paymentMode} (${finalData.paymentStatus})</td>
                    </tr>
                  </table>

                  <h3 style="margin:15px 0 10px;font-size:16px;">Order Summary</h3>
                  <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border:1px solid #e5e5e5;border-collapse:collapse;">
                    <tr style="background:#e53935;color:#ffffff;">
                      <th align="left">Pizza</th>
                      <th align="center">Size</th>
                      <th align="right">Price</th>
                      <th align="center">Qty</th>
                      <th align="right">Total</th>
                    </tr>
                    ${productRows}
                  </table>

                  <table width="100%" cellpadding="6" cellspacing="0" border="0" style="margin-top:15px;">
                    <tr>
                      <td align="right" style="color:#666;">Subtotal:</td>
                      <td align="right" style="width:100px;font-weight:bold;">₹${finalData.subtotal}</td>
                    </tr>
                    <tr>
                      <td align="right" style="color:#666;">Delivery Fee:</td>
                      <td align="right" style="font-weight:bold;">₹${finalData.shipping}</td>
                    </tr>
                    <tr>
                      <td align="right" style="font-size:18px;font-weight:bold;color:#e53935;">Grand Total:</td>
                      <td align="right" style="font-size:18px;font-weight:bold;color:#e53935;">₹${finalData.total}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>`
        })
      }
    } catch (mailError) {
      console.error("Non-critical order email error:", mailError.message)
    }
  } catch (error) {
    console.error("Create checkout error:", error)
    res.status(400).send({
      result: "Fail",
      reason: error.message || "Failed to process checkout"
    })
  }
}

/**
 * Get all checkout records (Admin only)
 */
async function getRecord(req, res) {
  try {
    const data = await Checkout.find()
      .sort({ createdAt: -1 })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "products.product",
        select: "name basePrice finalPrice pic size isCustomizable stock stockQuantity"
      })

    res.send({
      result: "Done",
      data,
      count: data.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Get all orders for a specific user
 * Enforces customer isolation: Buyer can only view their own orders
 */
async function getUserRecord(req, res) {
  try {
    const requestedUserId = req.params.user

    // Ownership check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(requestedUserId)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot view another customer's orders"
      })
    }

    const data = await Checkout.find({ user: requestedUserId })
      .sort({ createdAt: -1 })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "products.product",
        select: "name basePrice finalPrice pic size isCustomizable stock stockQuantity"
      })

    res.send({
      result: "Done",
      data,
      count: data.length
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Get a single order by ID
 * Enforces customer isolation
 */
async function getSingleRecord(req, res) {
  try {
    const data = await Checkout.findOne({ _id: req.params._id })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "products.product",
        select: "name basePrice finalPrice pic size isCustomizable stock stockQuantity"
      })

    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "Order not found"
      })
    }

    // Ownership check
    if (req.user && req.user.role === "Buyer" && String(req.user._id) !== String(data.user?._id || data.user)) {
      return res.status(403).send({
        result: "Fail",
        reason: "Access Denied: You cannot view another customer's order"
      })
    }

    res.send({
      result: "Done",
      data
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Update order status and details
 * Enforces order lifecycle transitions:
 * Order Placed -> Accepted -> Preparing -> Out for Delivery -> Delivered
 * (or Cancelled)
 */
async function updateRecord(req, res) {
  try {
    const checkout = await Checkout.findOne({ _id: req.params._id })
    if (!checkout) {
      return res.status(404).send({
        result: "Fail",
        reason: "Order not found"
      })
    }

    const isBuyer = req.user && req.user.role === "Buyer"
    const isAdmin = req.user && (req.user.role === "Admin" || req.user.role === "Super Admin")

    // Buyer restrictions
    if (isBuyer) {
      // Ownership check
      if (String(req.user._id) !== String(checkout.user)) {
        return res.status(403).send({
          result: "Fail",
          reason: "Access Denied: You cannot update another customer's order"
        })
      }

      // Customer cannot update payment status or pricing
      if (req.body.paymentStatus || req.body.total || req.body.subtotal || req.body.shipping) {
        return res.status(403).send({
          result: "Fail",
          reason: "Access Denied: Customers cannot modify payment status or order totals"
        })
      }

      // Customer can ONLY cancel their order, and ONLY if status is 'Order Placed' or 'Accepted'
      if (req.body.orderStatus) {
        if (req.body.orderStatus !== "Cancelled") {
          return res.status(403).send({
            result: "Fail",
            reason: "Access Denied: Customers can only request order cancellation"
          })
        }

        if (checkout.orderStatus !== "Order Placed" && checkout.orderStatus !== "Accepted") {
          return res.status(400).send({
            result: "Fail",
            reason: `Order cannot be cancelled in its current state ('${checkout.orderStatus}'). Kitchen preparation or delivery is already in progress.`
          })
        }

        checkout.orderStatus = "Cancelled"
        checkout.statusHistory.push({
          status: "Cancelled",
          timestamp: new Date(),
          updatedBy: req.user._id
        })
        // Restore inventory on cancellation
        await restoreOrderInventory(checkout)
      }
    }

    // Admin / Super Admin transitions
    if (isAdmin) {
      if (req.body.orderStatus && req.body.orderStatus !== checkout.orderStatus) {
        const allowedTransitions = VALID_TRANSITIONS[checkout.orderStatus] || []
        if (!allowedTransitions.includes(req.body.orderStatus)) {
          return res.status(400).send({
            result: "Fail",
            reason: `Invalid status transition from '${checkout.orderStatus}' to '${req.body.orderStatus}'. Permitted transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(", ") : "None (Terminal status)"}`
          })
        }

        checkout.orderStatus = req.body.orderStatus
        checkout.statusHistory.push({
          status: req.body.orderStatus,
          timestamp: new Date(),
          updatedBy: req.user._id
        })

        if (req.body.orderStatus === "Cancelled") {
          await restoreOrderInventory(checkout)
        }
      }

      if (req.body.paymentStatus) {
        checkout.paymentStatus = req.body.paymentStatus
      }

      if (req.body.paymentMode) {
        checkout.paymentMode = req.body.paymentMode
      }
    }

    await checkout.save()

    // Emit real-time WebSocket update strictly after DB persistence succeeds
    try {
      emitOrderStatusUpdated({
        orderId: checkout._id,
        orderStatus: checkout.orderStatus,
        updatedAt: checkout.updatedAt,
        statusHistory: checkout.statusHistory
      })
    } catch (socketErr) {
      console.error("Socket emit error on status update:", socketErr.message)
    }

    const finalData = await Checkout.findOne({ _id: checkout._id })
      .populate("user", ["name", "username", "email"])
      .populate({
        path: "products.product",
        select: "name basePrice finalPrice pic size isCustomizable stock stockQuantity"
      })

    res.send({
      result: "Done",
      data: finalData
    })

    // Asynchronously send status update email
    try {
      if (finalData.deliveryAddress?.email && req.body.orderStatus) {
        mailer.sendMail({
          from: process.env.MAIL_USERNAME,
          to: finalData.deliveryAddress.email,
          subject: `Order #${finalData._id} Status Update: ${finalData.orderStatus}`,
          html: `
            <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #ddd;border-radius:6px;max-width:600px;">
              <h2 style="color:#e53935;">PizzaHub Order Update</h2>
              <p>Hello ${finalData.deliveryAddress?.name || "Customer"},</p>
              <p>Your order status has been updated to: <strong>${finalData.orderStatus}</strong></p>
              <p>Order ID: ${finalData._id}</p>
              <p>Thank you for choosing PizzaHub!</p>
            </div>`
        })
      }
    } catch (mailError) {
      console.error("Non-critical status email error:", mailError.message)
    }
  } catch (error) {
    console.error("Update checkout error:", error)
    res.status(500).send({
      result: "Fail",
      reason: error.message || "Internal Server Error"
    })
  }
}

/**
 * Delete order record (Super Admin only)
 */
async function deleteRecord(req, res) {
  try {
    const data = await Checkout.findOne({ _id: req.params._id })
    if (!data) {
      return res.status(404).send({
        result: "Fail",
        reason: "Order not found"
      })
    }

    await data.deleteOne()
    res.send({
      result: "Done",
      message: "Order deleted successfully"
    })
  } catch (error) {
    res.status(500).send({
      result: "Fail",
      reason: "Internal Server Error"
    })
  }
}

/**
 * Razorpay Webhook Handler
 * Verifies cryptographic webhook signature and safely updates payment & inventory
 */
async function razorpayWebhook(req, res) {
  try {
    const signature = req.headers["x-razorpay-signature"]
    const secret = process.env.RPWEBHOOKSECRET || process.env.RPSECRETKEY || ""

    if (!signature) {
      return res.status(400).send({ result: "Fail", reason: "Signature header missing" })
    }

    const bodyString = req.rawBody
      ? req.rawBody.toString()
      : (typeof req.body === "string" ? req.body : JSON.stringify(req.body))
    const expectedSignature = crypto.createHmac("sha256", secret).update(bodyString).digest("hex")

    if (expectedSignature !== signature) {
      return res.status(400).send({ result: "Fail", reason: "Invalid webhook signature" })
    }

    const event = req.body.event
    const payload = req.body.payload

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payment?.entity || payload.order?.entity
      const rporderid = paymentEntity?.order_id || paymentEntity?.id
      const paymentId = paymentEntity?.id

      if (rporderid) {
        const order = await Checkout.findOne({
          $or: [{ rporderid }, { rppid: paymentId }]
        })

        if (order) {
          order.paymentStatus = "Done"
          order.paymentMode = "Net Banking"
          if (paymentId) order.rppid = paymentId
          await order.save()

          await validateAndDeductInventory(order)

          emitOrderStatusUpdated({
            orderId: order._id,
            orderStatus: order.orderStatus,
            updatedAt: order.updatedAt,
            statusHistory: order.statusHistory
          })
        }
      }
    }

    res.status(200).json({ status: "ok" })
  } catch (error) {
    console.error("Razorpay webhook error:", error.message)
    res.status(500).json({ status: "error", message: error.message })
  }
}

module.exports = {
  createRecord,
  getRecord,
  getUserRecord,
  getSingleRecord,
  updateRecord,
  deleteRecord,
  order,
  verifyOrder,
  razorpayWebhook
}