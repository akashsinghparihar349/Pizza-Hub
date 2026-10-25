import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import DataTable from 'datatables.net-dt'
import "datatables.net-dt/css/dataTables.dataTables.min.css"

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'

import { getCategory, deleteCategory } from "../../../Redux/ActionCreators/CategoryActionCreators"

export default function AdminCategoryPage() {
    let [data, setData] = useState([])

    let CategoryStateData = useSelector(state => state.CategoryStateData)
    let dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure You Want To Delete This Category?")) {
            dispatch(deleteCategory({ _id }))
            setData(prev => prev.filter(x => x._id !== _id))
        }
    }

    useEffect(() => {
        let timer
        dispatch(getCategory())
        if (CategoryStateData && CategoryStateData.length) {
            setData(CategoryStateData)
            timer = setTimeout(() => new DataTable('#categoryTable'), 500)
        }
        return () => clearTimeout(timer)
    }, [CategoryStateData?.length, dispatch])

    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>
                            SEO Categories (Taxonomy) 
                            <Link to="/admin/category/create">
                                <i className='bi bi-plus text-light float-end'></i>
                            </Link>
                        </h5>
                        <div className="table-responsive">
                            <table id='categoryTable' className='table table-bordered text-dark'>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Name</th>
                                        <th>Slug</th>
                                        <th>Image</th>
                                        <th>Status</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => {
                                        const imgSrc = item.image ? `${import.meta.env.VITE_APP_IMAGE_SERVER}${item.image}` : '/images/pizza_farmhouse.jpg'
                                        return (
                                            <tr key={item._id}>
                                                <td>{item._id}</td>
                                                <td><strong>{item.name}</strong></td>
                                                <td><span className="badge bg-secondary">{item.slug}</span></td>
                                                <td>
                                                    <img src={imgSrc} height={50} width={70} style={{ objectFit: "cover", borderRadius: "4px" }} alt={item.name} />
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.isActive !== false ? "bg-success" : "bg-danger"}`}>
                                                        {item.isActive !== false ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link to={`/admin/category/update/${item._id}`} className='btn btn-primary btn-sm'>
                                                        <i className='bi bi-pencil-square'></i>
                                                    </Link>
                                                </td>
                                                <td>
                                                    <button className='btn btn-danger btn-sm' onClick={() => deleteRecord(item._id)}>
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
