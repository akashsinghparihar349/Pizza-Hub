import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import DataTable from 'datatables.net-dt'
import "datatables.net-dt/css/dataTables.dataTables.min.css"

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'

import { getUser, deleteUser, updateUser } from "../../../Redux/ActionCreators/UserActionCreators"
export default function AdminUserPage() {
    let [data, setData] = useState([])
    let [flag, setFlag] = useState(true)

    let UserStateData = useSelector(state => state.UserStateData)
    let dispatch = useDispatch()

    function updateRecord(_id) {
        if (window.confirm("Are You Sure to Change Status Of That Record?")) {
            let itemToUpdate = data.find(x => x._id === _id)
            if (!itemToUpdate) return
            let updatedItem = { ...itemToUpdate, status: !itemToUpdate.status }
            dispatch(updateUser(updatedItem))
            setData(prev => prev.map(x => x._id === _id ? updatedItem : x))
            setFlag(!flag)
        }
    }

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete That Record")) {
            dispatch(deleteUser({ _id: _id }))
            setData(data.filter(x => x._id !== _id))
        }
    }

    useEffect(() => {
        let time = (() => {
            dispatch(getUser())
            if (UserStateData.length) {
                setData(UserStateData)
                return setTimeout(() => new DataTable('#myTable'), 500)
            }
        })()
        return () => clearTimeout(time)
    }, [UserStateData.length])
    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>User <Link to="/admin/user/create"><i className='bi bi-plus text-light float-end'></i></Link></h5>
                        <div className="table-responsive">
                            <table id='myTable' className='table table-bordered text-dark'>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => {
                                        return <tr key={item._id}>
                                            <td>{item._id}</td>
                                            <td>{item.name}</td>
                                            <td>{item.username}</td>
                                            <td>{item.email}</td>
                                            <td>{item.phone}</td>
                                            <td>{item.role}</td>
                                            <td onClick={() => updateRecord(item._id)} style={{ cursor: "pointer" }}>{item.status ? "Active" : "Inactive"}</td>
                                            <td>{item.role === "Buyer" ? null : <Link to={`/admin/user/update/${item._id}`} className='btn btn-primary'><i className='bi bi-pencil-square'></i></Link>}</td>
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
