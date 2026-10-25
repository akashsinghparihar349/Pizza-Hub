import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators"
import { getTestimonial, createTestimonial, updateTestimonial } from "../../Redux/ActionCreators/TestimonialActionCreators"

const inputOptions = {
  message: "",
  star: "5"
}
export default function Orders() {
  let [orders, setOrders] = useState([])
  let [review, setReview] = useState([])

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
    setInputData({ ...review.find(x => x.product?._id === product._id) })
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
      setReview(prev => [...prev, item])
    }
    else {
      let updatedReview = review.map(x => x.product?._id === option.product._id ? { ...x, message: inputData.message, star: inputData.star } : x)
      let itemToUpdate = updatedReview.find(x => x.product?._id === option.product._id)
      if (itemToUpdate) {
        dispatch(updateTestimonial({ ...itemToUpdate }))
      }
      setReview(updatedReview)
    }
    setShowModal(false)
    setInputData(inputOptions)
  }

  function check(pid) {
    let item = review.find(x => x.product?._id === pid)
    return item ? true : false
  }


  useEffect(() => {
    (() => {
      dispatch(getCheckout())
      if (CheckoutStateData.length) {
        // setOrders(CheckoutStateData.filter(x => x.user?.name === localStorage.getItem("userid")))
        setOrders(CheckoutStateData)
      }
    })()
  }, [CheckoutStateData.length])

  useEffect(() => {
    (() => {
      dispatch(getTestimonial())
      if (TestimonialStateData.length) {
        setReview(TestimonialStateData.filter(x => x.user?._id === localStorage.getItem("userid")))
      }
    })()
  }, [TestimonialStateData.length])
  return (
    <>
      {orders.length ?
        <div className='my-3'>
          {orders.map(item => {
            return <div className='table-responsive' key={item._id}>
              <h5 className='bg-secondary text-center p-2 text-light'>Order Details</h5>
              <table className='table table-bordered'>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Order Status</th>
                    <th>Payment Mode</th>
                    <th>Payment Satus</th>
                    <th>Delivery Address</th>
                    <th>Subtotal</th>
                    <th>Shipping</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{item._id}</td>
                    <td>{item.orderStatus}</td>
                    <td>{item.paymentMode}</td>
                    <td>{item.paymentStatus}</td>
                    <td>
                      <div>
                        <p>{item.deliveryAddress?.name}</p>
                        <p>{item.deliveryAddress?.phone}, {item.deliveryAddress?.email}</p>
                        <p>{item.deliveryAddress?.address}</p>
                        <p>{item.deliveryAddress?.pin}, {item.deliveryAddress?.city}, {item.deliveryAddress?.state}</p>
                      </div>
                    </td>
                    <td>&#8377;{item.subtotal}</td>
                    <td>&#8377;{item.shipping}</td>
                    <td>&#8377;{item.total}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                </tbody>
              </table>
              <h5 className='bg-primary text-center p-2 text-light'>Products In This Order</h5>
              <table className='table table-bordered'>
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Crust</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {item.products?.map(record => {
                    const picSrc = (record.product?.pic && record.product.pic.length > 0)
                      ? `${import.meta.env.VITE_APP_IMAGE_SERVER}${record.product.pic[0]}`
                      : '/images/pizza_farmhouse.jpg'
                    return <tr key={record._id}>
                      <td>
                        <Link to={picSrc} target='_blank'>
                          <img src={picSrc} height={70} width={70} style={{ objectFit: "cover" }} alt={record?.product?.name || "Ordered pizza"} />
                        </Link>
                      </td>
                      <td>{record?.product?.name}</td>
                      <td>{record?.product?.crust || "Classic Hand Tossed"}</td>
                      <td><span className="badge bg-secondary">{record.size || "Regular"}</span></td>
                      <td>&#8377;{record?.product?.finalPrice || (record.quantity > 0 ? record.total / record.quantity : 0)}</td>
                      <td>{record.quantity}</td>
                      <td>&#8377;{record.total}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/product/${record.product?._id}`} className='btn btn-primary'>Buy Again</Link>
                          {item.orderStatus === "Delivered" ?
                            check(record.product?._id) ?
                              <button className='btn btn-primary' onClick={() => update({ _id: record.product?._id, name: record.name })}>Update Review</button> :
                              <button className='btn btn-secondary' onClick={() => create({ _id: record.product?._id, name: record.name })}>Write Review</button>
                            : null}
                        </div>
                      </td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          })}
        </div> :
        <div className='card p-5 text-center'>
          <h3>No Order History Found</h3>
          <Link to="/shop" className='btn btn-primary w-25 m-auto'>Shop Now</Link>
        </div>}


      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} id="exampleModal">
        <div className="modal-dialog  modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">{option.type}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={postData}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label>Message*</label>
                    <textarea name="message" rows={8} required value={inputData.message} onChange={getInputData} placeholder='Message' className='form-control border-primary' />
                  </div>

                  <div className="col-12 mb-3">
                    <label>Star*</label>
                    <select name="star" value={inputData.star} onChange={getInputData} className='form-select'>
                      <option>5</option>
                      <option>4</option>
                      <option>3</option>
                      <option>2</option>
                      <option>1</option>
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary w-100">{option.type}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
