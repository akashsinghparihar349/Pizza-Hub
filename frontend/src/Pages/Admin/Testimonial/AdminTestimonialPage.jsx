import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DataTable from 'datatables.net-dt'
import "datatables.net-dt/css/dataTables.dataTables.min.css"

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import { getTestimonial, deleteTestimonial } from "../../../Redux/ActionCreators/TestimonialActionCreators"

export default function AdminTestimonialPage() {
    let [data, setData] = useState([])

    let TestimonialStateData = useSelector(state => state.TestimonialStateData)
    let dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are you sure you want to delete this customer review?")) {
            dispatch(deleteTestimonial({ _id: _id }))
            setData(data.filter(x => x._id !== _id))
        }
    }

    function renderStars(count) {
        const num = Number(count) || 5
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`bi bi-star${i <= num ? '-fill text-warning' : ' text-muted'} me-1`}
                ></i>
            )
        }
        return stars
    }

    useEffect(() => {
        dispatch(getTestimonial())
    }, [dispatch])

    useEffect(() => {
        if (TestimonialStateData && TestimonialStateData.length) {
            setData(TestimonialStateData)
            const timer = setTimeout(() => {
                const table = document.querySelector('#testimonialTable')
                if (table) new DataTable(table)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [TestimonialStateData])

    return (
        <>
            <Breadcrum title="Admin Reviews & Feedback" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-center bg-primary text-light p-2 mb-3 rounded">
                            <h5 className="mb-0 text-light"><i className="bi bi-chat-heart me-2"></i>Customer Reviews & Testimonials</h5>
                            <span className="badge bg-light text-primary">{data.length} Total Reviews</span>
                        </div>

                        <div className="table-responsive">
                            <table id='testimonialTable' className='table table-bordered table-hover align-middle text-dark'>
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Product / Pizza</th>
                                        <th>Rating</th>
                                        <th>Review Message</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => {
                                        return (
                                            <tr key={item._id}>
                                                <td><small className="text-muted">{item._id}</small></td>
                                                <td>
                                                    <strong>{item.user?.name || item.name || "Customer"}</strong>
                                                    {item.user?.email && <div className="small text-muted">{item.user.email}</div>}
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark border">
                                                        {item.product?.name || item.product || "General Experience"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {renderStars(item.star)}
                                                        <span className="ms-1 fw-bold text-muted small">({item.star}/5)</span>
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: '300px' }}>
                                                    <p className="mb-0 small text-truncate" title={item.message}>{item.message}</p>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className='btn btn-sm btn-outline-danger'
                                                        title="Delete Review"
                                                        onClick={() => deleteRecord(item._id)}
                                                    >
                                                        <i className='bi bi-trash'></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
