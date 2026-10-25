import React from 'react'
import Breadcrum from '../../Components/Breadcrum'
import { Link } from 'react-router-dom'

export default function OrderConfirmation() {
    return (
        <>
            <Breadcrum title="Order Has Been Placed" />

            <div className="container-fluid py-2">
                <div className="container py-2 text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <i className="bi bi-check display-1 text-secondary"></i>
                            <h1 className="display-1">Done</h1>
                            <h1 className="mb-4">Order Has Been Palced</h1>
                            <p className="mb-4">Thank you for shopping with Us! Your order has been successfully placed and is now being processed. We've sent a confirmation email with your order details. You can track your order from your account dashboard, and we'll notify you as soon as it's shipped. We appreciate your trust and look forward to serving you again!</p>
                            <div className="btn-group">
                                <Link className="btn btn-primary py-3 px-5" style={{ borderRadius: "40px 0 0 40px" }} to="/shop">Shop More</Link>
                                <Link className="btn btn-secondary py-3 px-5" style={{ borderRadius: "0 40px 40px 0" }} to="/profile?option=Orders">Track Order</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
