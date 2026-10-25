import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import TextValidators from '../../../FormValidators/TextValidators'
import ImageValidators from '../../../FormValidators/ImageValidators'

import { createCategory, getCategory } from '../../../Redux/ActionCreators/CategoryActionCreators'

export default function AdminCategoryCreatePage() {
    let [data, setData] = useState({
        name: "",
        description: "",
        image: null,
        isActive: true
    })
    let [errorMessage, setErrorMessage] = useState({
        name: "Name Field is Mendatory",
        image: ""
    })
    let [show, setShow] = useState(false)

    let CategoryStateData = useSelector(state => state.CategoryStateData)
    let dispatch = useDispatch()
    let navigate = useNavigate()

    function getInputData(e) {
        let name = e.target.name
        let value = name === "image" ? e.target.files[0] : e.target.value

        setData({ ...data, [name]: name === "isActive" ? value === "1" : value })
        setErrorMessage({ ...errorMessage, [name]: name === "image" ? ImageValidators(e) : TextValidators(e) })
    }

    function postData(e) {
        e.preventDefault()
        let error = Object.values(errorMessage).find(x => x !== "")
        if (error) {
            setShow(true)
            return
        }

        let item = CategoryStateData?.find(x => x.name?.toLocaleLowerCase() === data.name?.toLocaleLowerCase())
        if (item) {
            setErrorMessage({ ...errorMessage, name: 'Category With This Name Already Exists' })
            setShow(true)
            return
        }

        let formData = new FormData()
        formData.append("name", data.name)
        formData.append("description", data.description || "")
        formData.append("isActive", data.isActive)
        if (data.image) {
            formData.append("image", data.image)
        }

        dispatch(createCategory(formData))
        navigate("/admin/category")
    }

    useEffect(() => {
        dispatch(getCategory())
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
                            Create Category (Taxonomy) 
                            <Link to="/admin/category">
                                <i className='bi bi-arrow-left text-light float-end'></i>
                            </Link>
                        </h5>
                        <form onSubmit={postData}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label>Category Name*</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        onChange={getInputData} 
                                        placeholder='e.g. Gourmet Veg Pizzas' 
                                        className={`form-control ${show && errorMessage.name ? 'border-danger' : 'border-primary'}`} 
                                    />
                                    {show && errorMessage.name ? <p className='text-danger text-capitalize'>{errorMessage.name}</p> : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>Status</label>
                                    <select name="isActive" onChange={getInputData} className='form-select border-primary'>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>

                                <div className="col-12 mb-3">
                                    <label>Description</label>
                                    <textarea 
                                        name="description" 
                                        rows={3} 
                                        onChange={getInputData} 
                                        placeholder='SEO-friendly description for this pizza category...' 
                                        className='form-control border-primary' 
                                    />
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label>Category Banner / Image</label>
                                    <input 
                                        type="file" 
                                        name="image" 
                                        onChange={getInputData} 
                                        className={`form-control ${show && errorMessage.image ? 'border-danger' : 'border-primary'}`} 
                                    />
                                    {show && errorMessage.image ? <p className='text-danger text-capitalize'>{errorMessage.image}</p> : null}
                                </div>

                                <div className="col-12 mb-3">
                                    <button type='submit' className='btn btn-primary w-100'>Create Category</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
