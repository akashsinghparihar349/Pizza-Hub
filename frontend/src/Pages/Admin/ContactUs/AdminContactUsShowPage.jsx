import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'

import { getContactUs, deleteContactUs, updateContactUs } from "../../../Redux/ActionCreators/ContactUsActionCreators"
export default function AdminContactUsShowPage() {
    let { _id } = useParams()
    let [data, setData] = useState({})
    let [flag, setFlag] = useState(true)

    let ContactUsStateData = useSelector(state => state.ContactUsStateData)
    let dispatch = useDispatch()
    let navigate = useNavigate()

    function updateRecord() {
        if (window.confirm("Are You Sure to Change Status Of That Record?")) {
            let updated = { ...data, status: !data.status }
            dispatch(updateContactUs(updated))
            setData(updated)
            setFlag(!flag)
        }
    }

    function deleteRecord() {
        if (window.confirm("Are You Sure to Delete That Record")) {
            dispatch(deleteContactUs({ _id: _id }))
            navigate("/admin/contact")
        }
    }

    useEffect(() => {
        (() => {
            dispatch(getContactUs())
            if (ContactUsStateData.length) {
                let item = ContactUsStateData.find(x => x._id === _id)
                if (item)
                    setData(item)
                else
                    navigate("/admin/contact")
            }
        })()
    }, [ContactUsStateData.length])
    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>ContactUs Query
                            <Link to="/admin/contact"><i className='bi bi-arrow-left float-end text-light'></i></Link>
                        </h5>
                        <div className="table-responsive">
                            <table className='table table-bordered'>
                                <tbody>
                                    <tr>
                                        <th>Id</th>
                                        <td>{data._id}</td>
                                    </tr>
                                    <tr>
                                        <th>Name</th>
                                        <td>{data.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Phone Number</th>
                                        <td>{data.phone}</td>
                                    </tr>
                                    <tr>
                                        <th>Email Address</th>
                                        <td>{data.email}</td>
                                    </tr>
                                    <tr>
                                        <th>Subject</th>
                                        <td>{data.subject}</td>
                                    </tr>
                                    <tr>
                                        <th>Message</th>
                                        <td>{data.message}</td>
                                    </tr>
                                    <tr>
                                        <th>Date</th>
                                        <td>{new Date(data.createdAt).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>{data.status ? "Active" : "Inactive"}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            {data.status ?
                                                <button onClick={updateRecord} className='btn btn-primary w-100'>Update Status</button> :
                                                <button onClick={deleteRecord} className='btn btn-danger w-100'>Delete</button>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
