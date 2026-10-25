import  { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import DataTable from 'datatables.net-dt'
import "datatables.net-dt/css/dataTables.dataTables.min.css"

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'

import { getProduct, deleteProduct } from "../../../Redux/ActionCreators/ProductActionCreators"
export default function AdminProductPage() {
    let [data, setData] = useState([])

    let ProductStateData = useSelector(state => state.ProductStateData)
    let dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete That Record")) {
            dispatch(deleteProduct({ _id: _id }))
            setData(data.filter(x => x._id !== _id))
        }
    }

    useEffect(() => {
        let time = (() => {
            dispatch(getProduct())
            if (ProductStateData.length) {
                setData(ProductStateData)
                return setTimeout(() => new DataTable('#myTable'), 500)
            }
        })()
        return () => clearTimeout(time)
    }, [ProductStateData.length])
    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>Pizza Menu Items <Link to="/admin/product/create"><i className='bi bi-plus text-light float-end'></i></Link></h5>
                        <div className="table-responsive">
                            <table id='myTable' className='table table-bordered text-dark'>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Crust</th>
                                        <th>Maincategory</th>
                                        <th>Subcategory</th>
                                        <th>Brand</th>
                                        <th>Pizza Sizes & Prices</th>
                                        <th>Base Price</th>
                                        <th>Discount</th>
                                        <th>Final Price</th>
                                        <th>Stock</th>
                                        <th>Stock Quantity</th>
                                        <th>Pic</th>
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
                                            <td>
                                                {item.isVeg !== false ? 
                                                    <span className="badge bg-success">Veg</span> : 
                                                    <span className="badge bg-danger">Non-Veg</span>
                                                }
                                            </td>
                                            <td>{item.crust || "Classic Hand Tossed"}</td>
                                            <td>{item.maincategory?.name}</td>
                                            <td>{item.subcategory?.name}</td>
                                            <td>{item.brand?.name}</td>
                                            <td>
                                                {item.sizePrices && item.sizePrices.length > 0 ? (
                                                    <div className="d-flex flex-column gap-1">
                                                        {item.sizePrices.map((sp, idx) => (
                                                            <span key={idx} className="badge bg-light text-dark border text-start" style={{ fontSize: "0.75rem" }}>
                                                                {sp.size} ({sp.inches}"): <strong>&#8377;{sp.price}</strong>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    item.size?.join(", ")
                                                )}
                                            </td>
                                            <td>&#8377;{item.basePrice}</td>
                                            <td>{item.discount}% Off</td>
                                            <td>&#8377;{item.finalPrice}</td>
                                            <td>{item.stock ? "In Stock" : "Out Of Stock"}</td>
                                            <td>{item.stockQuantity}</td>
                                            <td>
                                                <div style={{width:400}}>
                                                    {item.pic?.map((p, index) => {
                                                        return <Link key={index} to={`${import.meta.env.VITE_APP_IMAGE_SERVER}${p}`} target='_blank'>
                                                            <img src={`${import.meta.env.VITE_APP_IMAGE_SERVER}${p}`} className='m-1' height={60} width={80} alt="" />
                                                        </Link>
                                                    })}
                                                </div>
                                            </td>
                                            <td>{item.status ? "Active" : "Inactive"}</td>
                                            <td><Link to={`/admin/product/update/${item._id}`} className='btn btn-primary'><i className='bi bi-pencil-square'></i></Link></td>
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
