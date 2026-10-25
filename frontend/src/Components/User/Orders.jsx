import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators"
import { getTestimonial, createTestimonial, updateTestimonial } from "../../Redux/ActionCreators/TestimonialActionCreators"
import { cancelOrderBuyerApi } from "../../Redux/Sagas/Service"

const inputOptions = {
  message: "",
  star: "5"
}

export default function Orders() {
  let [orders, setOrders] = useState([])
  let [review, setReview] = useState([])
  let [cancellingId, setCancellingId] = useState(null)

  let [showModal, setShowModal] = useState(false)
  let [option, setOption] = useState({})

  let [inputData, setInputData] = useState({ ...inputOptions })

  let CheckoutStateData = useSelector(state => state.CheckoutStateData)
  let TestimonialStateData = useSelector(state => state.TestimonialStateData)
  let dispatch = useDispatch()

  function create(product) {
    setShowModal(true)
    setOption({
      type: "Create",
      product: product
    })
    setInputData({ ...inputOptions })
  }

  function update(product) {
    setShowModal(true)
    setOption({
      type: "Update",
      product: product
    })
    const existing = review.find(x => x.product?._id === product._id || x.product === product._id)
    if (existing) {
      setInputData({ message: existing.message || "", star: existing.star || "5" })
    }
  }

  function getInputData(e) {
    let { name, value } = e.target
    setInputData({ ...inputData, [name]: value })
  }

  async function postData(e) {
    e.preventDefault()
    if (option.type === "Create") {
      let item = {
        user: localStorage.getItem("userid"),
        product: option.product._id,
        message: inputData.message,
        star: inputData.star
      }
      dispatch(createTestimonial(item))
      setTimeout(() => dispatch(getTestimonial()), 600)
    } else {
      let existing = review.find(x => x.product?._id === option.product._id || x.product === option.product._id)
      if (existing && existing._id) {
        dispatch(updateTestimonial({
          _id: existing._id,
          message: inputData.message,
          star: inputData.star
        }))
        setTimeout(() => dispatch(getTestimonial()), 600)
      }
    }
    setShowModal(false)
    setInputData(inputOptions)
  }

  function check(pid) {
    let item = review.find(x => x.product?._id === pid || x.product === pid)
    return item ? true : false
  }

  async function handleCancelOrder(orderId) {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      setCancellingId(orderId)
      try {
        const res = await cancelOrderBuyerApi(orderId)
        if (res.result === "Done") {
          alert("Order cancelled successfully.")
          dispatch(getCheckout())
        } else {
          alert(res.reason || "Failed to cancel order")
        }
      } catch (err) {
        alert("Cancellation error: " + err.message)
      } finally {
        setCancellingId(null)
      }
    }
  }

  useEffect(() => {
    dispatch(getCheckout())
  }, [dispatch])

  useEffect(() => {
    if (CheckoutStateData.length) {
      const currentUserId = localStorage.getItem("userid")
      const userOrders = CheckoutStateData.filter(x => 
        x.user?._id === currentUserId || 
        x.user === currentUserId ||
        x.user?.name === currentUserId
      )
      setOrders(userOrders.length > 0 ? userOrders : CheckoutStateData)
    }
  }, [CheckoutStateData])

  useEffect(() => {
    dispatch(getTestimonial())
  }, [dispatch])

  useEffect(() => {
    if (TestimonialStateData.length) {
      setReview(TestimonialStateData.filter(x => x.user?._id === localStorage.getItem("userid") || x.user === localStorage.getItem("userid")))
    }
  }, [TestimonialStateData])

  return (
    <>
      {orders.length ? (
        <div className='my-3'>
          {orders.map(item => {
            const canCancel = item.orderStatus === "Order Placed" || item.orderStatus === "Accepted"
            return (
              <div className='card mb-4 shadow-sm border' key={item._id}>
                <div className='card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2'>
                  <div>
                    <span className="fw-bold me-2">Order #{item._id}</span>
                    <span className="badge bg-primary me-2">{item.orderStatus}</span>
                    <span className={`badge ${item.paymentStatus === 'Done' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      Payment: {item.paymentStatus} ({item.paymentMode})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted small me-3">Placed on {new Date(item.createdAt).toLocaleDateString()}</span>
                    {canCancel && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={cancellingId === item._id}
                        onClick={() => handleCancelOrder(item._id)}
                      >
                        {cancellingId === item._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="card-body p-3">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6 className="fw-bold small text-muted text-uppercase mb-1">Delivery Destination</h6>
                      <p className="mb-0 small">
                        <strong>{item.deliveryAddress?.name}</strong> • {item.deliveryAddress?.phone}<br />
                        {item.deliveryAddress?.address}, {item.deliveryAddress?.city}, {item.deliveryAddress?.state} - {item.deliveryAddress?.pin}
                      </p>
                    </div>
                    <div className="col-md-6 text-md-end mt-2 mt-md-0">
                      <div className="small text-muted">Subtotal: &#8377;{item.subtotal}</div>
                      <div className="small text-muted">Delivery Fee: &#8377;{item.shipping}</div>
                      <h5 className="fw-bold text-primary mb-0 mt-1">Total: &#8377;{item.total}</h5>
                    </div>
                  </div>

                  <h6 className="fw-bold small text-muted text-uppercase mb-2">Pizzas in this Order</h6>
                  <div className="table-responsive">
                    <table className='table table-bordered table-sm align-middle mb-0'>
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Details</th>
                          <th>Size</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.products?.map(record => {
                          const picSrc = (record.product?.pic && record.product.pic.length > 0)
                            ? `${import.meta.env.VITE_APP_IMAGE_SERVER}${record.product.pic[0]}`
                            : '/images/pizza_farmhouse.jpg'
                          return (
                            <tr key={record._id || Math.random()}>
                              <td style={{ width: "60px" }}>
                                <img src={picSrc} height={50} width={50} style={{ objectFit: "cover" }} className="rounded" alt={record?.product?.name || "Ordered pizza"} />
                              </td>
                              <td>
                                <strong>{record?.product?.name || record?.name}</strong>
                                {record.customization?.base?.name && (
                                  <div className="small text-muted">
                                    Base: {record.customization.base.name} | Sauce: {record.customization.sauce?.name || "Marinara"}
                                  </div>
                                )}
                              </td>
                              <td><span className="badge bg-secondary">{record.size || "Regular"}</span></td>
                              <td>&#8377;{record?.product?.finalPrice || (record.quantity > 0 ? Math.round(record.total / record.quantity) : 0)}</td>
                              <td>{record.quantity}</td>
                              <td>&#8377;{record.total}</td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <Link to={`/product/${record.product?._id || record.product}`} className='btn btn-outline-primary'>
                                    Order Again
                                  </Link>
                                  {item.orderStatus === "Delivered" && (
                                    check(record.product?._id || record.product) ? (
                                      <button className='btn btn-outline-success' onClick={() => update({ _id: record.product?._id || record.product, name: record.name })}>
                                        Edit Review
                                      </button>
                                    ) : (
                                      <button className='btn btn-success' onClick={() => create({ _id: record.product?._id || record.product, name: record.name })}>
                                        Write Review
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className='card p-5 text-center shadow-sm border-0'>
          <i className="bi bi-bag-x fs-1 text-muted mb-2"></i>
          <h4>No Order History Found</h4>
          <p className="text-muted">You have not placed any pizza orders yet.</p>
          <Link to="/shop" className='btn btn-primary px-4 mx-auto'>Browse Menu & Order Now</Link>
        </div>
      )}

      {/* Review Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} id="exampleModal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">{option.type} Pizza Review</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={postData}>
                <div className="mb-3">
                  <label className="form-label fw-bold small">Rating (1 to 5 Stars)*</label>
                  <select name="star" value={inputData.star} onChange={getInputData} className='form-select'>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Outstanding</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                    <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                    <option value="2">⭐⭐ 2 Stars - Below Expectation</option>
                    <option value="1">⭐ 1 Star - Poor</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Your Experience / Feedback*</label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    value={inputData.message}
                    onChange={getInputData}
                    placeholder='Describe crust crispiness, toppings freshness, and delivery speed...'
                    className='form-control border-primary'
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
