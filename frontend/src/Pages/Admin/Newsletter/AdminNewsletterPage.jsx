import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import DataTable from 'datatables.net-dt'
import "datatables.net-dt/css/dataTables.dataTables.min.css"

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'

import { getNewsletter, deleteNewsletter, updateNewsletter } from "../../../Redux/ActionCreators/NewsletterActionCreators"
export default function AdminNewsletterPage() {
    let [data, setData] = useState([])
    let [flag, setFlag] = useState(true)

    let NewsletterStateData = useSelector(state => state.NewsletterStateData)
    let dispatch = useDispatch()

    function updateRecord(_id) {
        if (window.confirm("Are You Sure to Change Status Of That Record?")) {
            let item = data.find(x => x._id === _id)
            if (!item) return
            let updated = { ...item, status: !item.status }
            dispatch(updateNewsletter(updated))
            setData(prev => prev.map(x => x._id === _id ? updated : x))
            setFlag(!flag)
        }
    }

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete That Record")) {
            dispatch(deleteNewsletter({ _id: _id }))
            setData(data.filter(x => x._id !== _id))
        }
    }

    useEffect(() => {
        let time = (() => {
            dispatch(getNewsletter())
            if (NewsletterStateData.length) {
                setData(NewsletterStateData)
                return setTimeout(() => new DataTable('#myTable'), 500)
            }
        })()
        return () => clearTimeout(time)
    }, [NewsletterStateData.length])
    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>Newsletter</h5>
                        <div className="table-responsive">
                            <table id='myTable' className='table table-bordered text-dark'>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => {
                                        return <tr key={item._id}>
                                            <td>{item._id}</td>
                                            <td>{item.email}</td>
                                            <td onClick={() => updateRecord(item._id)} style={{ cursor: "pointer" }}>{item.status ? "Active" : "Inactive"}</td>
                                            <td><button className='btn btn-danger' onClick={() => deleteRecord(item._id)}><i className='bi bi-x'></i></button></td>
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
