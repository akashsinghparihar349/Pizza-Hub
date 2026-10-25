import React from 'react'
import { Link } from 'react-router-dom'

export default function Offer() {
    return (
        <div className="container-fluid bg-light py-5">
            <div className="container">
                <div className="row g-4">
                    <div className="col-lg-6 wow fadeInLeft" data-wow-delay="0.2s">
                        <Link to="/shop?sc=Pizza" className="d-flex align-items-center justify-content-between border bg-white rounded p-4">
                            <div>
                                <p className="text-muted mb-2">Artisan Handcrafted Crusts</p>
                                <h3 className="text-primary mb-1">Classic Veg Pizza</h3>
                                <h1 className="display-4 text-danger mb-0">20% <span
                                    className="text-dark fs-3 fw-normal">Off</span></h1>
                            </div>
                            <img src="/images/pizza_margherita.jpg" className="rounded" style={{ height: 160, width: 160, objectFit: "cover" }} alt="Classic Veg Pizza" />
                        </Link>
                    </div>
                    <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.3s">
                        <Link to="/shop?sc=Pizza" className="d-flex align-items-center justify-content-between border bg-white rounded p-4">
                            <div>
                                <p className="text-muted mb-2">Loaded Gourmet Toppings</p>
                                <h3 className="text-primary mb-1">Special Feast</h3>
                                <h1 className="display-4 text-danger mb-0">30% <span
                                    className="text-dark fs-3 fw-normal">Off</span></h1>
                            </div>
                            <img src="/images/pizza_farmhouse.jpg" className="rounded" style={{ height: 160, width: 160, objectFit: "cover" }} alt="Special Feast Pizza" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
