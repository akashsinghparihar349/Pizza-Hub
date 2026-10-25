import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import DataTable from 'datatables.net-dt'
import "datatables.net-dt/css/dataTables.dataTables.min.css"

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'

import { getCheckout } from "../../../Redux/ActionCreators/CheckoutActionCreators"
export default function AdminCheckoutPage() {
    let [data, setData] = useState([])

    let CheckoutStateData = useSelector(state => state.CheckoutStateData)
    let dispatch = useDispatch()

    

    useEffect(() => {
        let time = (() => {
            dispatch(getCheckout())
            if (CheckoutStateData.length) {
                setData(CheckoutStateData)
                return setTimeout(() => new DataTable('#myTable'), 500)
            }
        })()
        return () => clearTimeout(time)
    }, [CheckoutStateData.length])
    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>Checkout</h5>
                        <div className="table-responsive">
                            <table id='myTable' className='table table-bordered text-dark'>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>User</th>
                                        <th>Status</th>
                                        <th>Payement Mode</th>
                                        <th>Payment Staus</th>
                                        <th>Total</th>
                                        <th>Date</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => {
                                        return <tr key={item._id}>
                                            <td>{item._id}</td>
                                            <td>{item.deliveryAddress?.name},{item.deliveryAddress?.city}</td>
                                            <td>{item.orderStatus}</td>
                                            <td>{item.paymentMode}</td>
                                            <td>{item.paymentStatus}</td>
                                            <td>&#8377;{item.total}</td>
                                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td><Link to={`/admin/checkout/show/${item._id}`} className='btn btn-primary'><i className='bi bi-eye'></i></Link></td>
                                        </tr>
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
