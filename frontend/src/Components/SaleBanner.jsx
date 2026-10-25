import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getProduct } from "../Redux/ActionCreators/ProductActionCreators"
import { useDispatch, useSelector } from 'react-redux'
export default function SaleBanner() {
    let [data, setData] = useState({ pic: [] })
    let ProductStateData = useSelector(state => state.ProductStateData)
    let dispatch = useDispatch()

    useEffect(() => {
        (() => {
            dispatch(getProduct())
            if (ProductStateData.length) {
                setData(ProductStateData[0])
            }
        })()
    }, [ProductStateData.length])
    const pic1 = (data?.pic && data.pic.length > 0 && data.pic[0])
        ? `${import.meta.env.VITE_APP_IMAGE_SERVER}${data.pic[0]}`
        : '/images/pizza_margherita.jpg'

    return (
        <div className="container-fluid py-5">
            <div className="container">
                <div className="row g-4">
                    <div className="col-lg-6 wow fadeInLeft" data-wow-delay="0.1s">
                        <div>
                            <div className="bg-primary rounded position-relative">
                                <img src={pic1} className="img-fluid w-100 rounded" style={{ height: 350, objectFit: "cover" }} alt={data.name || "Special Pizza Offer"} />
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center rounded p-4"
                                    style={{ background: "rgba(255, 255, 255, 0.7)" }}>
                                    <h3 className="display-5 text-primary">{data.name || "Chef's Special Pizza"}</h3>
                                    <p className="fs-4 text-dark"><del className="text-muted me-2">&#8377;{data.basePrice || 299}</del>&#8377;{data.finalPrice || 249}{data.discount ? <sup className="ms-2 badge bg-danger">{data.discount}% Off</sup> : null}</p>
                                    <Link to={data._id ? `/product/${data._id}` : "/shop"} className="btn btn-primary rounded-pill align-self-start py-2 px-4">Order Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.2s">
                        <div>
                            <div className="text-center bg-primary rounded position-relative">
                                <img src="/images/pizza_farmhouse.jpg" className="img-fluid w-100 rounded" style={{ height: 350, objectFit: "cover" }} alt="Special Pizza Deals" />
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center rounded p-4"
                                    style={{ background: "rgba(0, 0, 0, 0.45)" }}>
                                    <h2 className="display-4 text-warning fw-bold">WEEKEND DEAL</h2>
                                    <h4 className="display-6 text-white mb-4">Flat 20% Off on Large Pizzas</h4>
                                    <Link to="/shop" className="btn btn-warning rounded-pill align-self-center py-2 px-4 fw-bold">Explore Menu</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
