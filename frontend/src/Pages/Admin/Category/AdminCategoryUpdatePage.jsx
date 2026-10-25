import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import TextValidators from '../../../FormValidators/TextValidators'
import ImageValidators from '../../../FormValidators/ImageValidators'

import { updateCategory, getCategory } from '../../../Redux/ActionCreators/CategoryActionCreators'

export default function AdminCategoryUpdatePage() {
    let { _id } = useParams()

    let [data, setData] = useState({
        name: "",
        slug: "",
        description: "",
        image: "",
        isActive: true
    })
    let [newImage, setNewImage] = useState(null)
    let [errorMessage, setErrorMessage] = useState({
        name: "",
        image: ""
    })
    let [show, setShow] = useState(false)

    let CategoryStateData = useSelector(state => state.CategoryStateData)
    let dispatch = useDispatch()
    let navigate = useNavigate()

    function getInputData(e) {
        let name = e.target.name
        if (name === "image") {
            setNewImage(e.target.files[0])
            setErrorMessage({ ...errorMessage, image: ImageValidators(e) })
        } else if (name === "isActive") {
            setData({ ...data, isActive: e.target.value === "1" })
        } else {
            setData({ ...data, [name]: e.target.value })
            setErrorMessage({ ...errorMessage, [name]: TextValidators(e) })
        }
    }

    function postData(e) {
        e.preventDefault()
        let error = Object.values(errorMessage).find(x => x !== "")
        if (error) {
            setShow(true)
            return
        }

        let item = CategoryStateData?.find(x => x._id !== _id && x.name?.toLocaleLowerCase() === data.name?.toLocaleLowerCase())
        if (item) {
            setErrorMessage({ ...errorMessage, name: 'Category With This Name Already Exists' })
            setShow(true)
            return
        }

        let formData = new FormData()
        formData.append("_id", data._id || _id)
        formData.append("name", data.name)
        formData.append("description", data.description || "")
        formData.append("isActive", data.isActive)
        if (newImage) {
            formData.append("image", newImage)
        }

        dispatch(updateCategory(formData))
        navigate("/admin/category")
    }

    useEffect(() => {
        dispatch(getCategory())
        if (CategoryStateData && CategoryStateData.length) {
            let item = CategoryStateData.find(x => x._id === _id)
            if (item) {
                setData(item)
            } else {
                navigate("/admin/category")
            }
        }
    }, [CategoryStateData?.length, _id, dispatch, navigate])

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
                            Update Category (Taxonomy) 
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
                                        value={data.name} 
                                        onChange={getInputData} 
                                        placeholder='Category Name' 
                                        className={`form-control ${show && errorMessage.name ? 'border-danger' : 'border-primary'}`} 
                                    />
                                    {show && errorMessage.name ? <p className='text-danger text-capitalize'>{errorMessage.name}</p> : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>Status</label>
                                    <select 
                                        name="isActive" 
                                        value={data.isActive ? "1" : "0"} 
                                        onChange={getInputData} 
                                        className='form-select border-primary'
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>

                                <div className="col-12 mb-3">
                                    <label>Slug (URL key)</label>
                                    <input 
                                        type="text" 
                                        name="slug" 
                                        value={data.slug || ""} 
                                        readOnly 
                                        className='form-control bg-light' 
                                    />
                                    <small className="text-muted">Slug is automatically maintained by the backend server for SEO routing.</small>
                                </div>

                                <div className="col-12 mb-3">
                                    <label>Description</label>
                                    <textarea 
                                        name="description" 
                                        rows={3} 
                                        value={data.description || ""} 
                                        onChange={getInputData} 
                                        placeholder='SEO-friendly description...' 
                                        className='form-control border-primary' 
                                    />
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label>Replace Banner Image (Optional)</label>
                                    {data.image && !newImage && (
                                        <div className="mb-2">
                                            <img 
                                                src={`${import.meta.env.VITE_APP_IMAGE_SERVER}${data.image}`} 
                                                height={70} 
                                                style={{ borderRadius: "4px" }} 
                                                alt="Current Category Banner" 
                                            />
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        name="image" 
                                        onChange={getInputData} 
                                        className={`form-control ${show && errorMessage.image ? 'border-danger' : 'border-primary'}`} 
                                    />
                                    {show && errorMessage.image ? <p className='text-danger text-capitalize'>{errorMessage.image}</p> : null}
                                </div>

                                <div className="col-12 mb-3">
                                    <button type='submit' className='btn btn-primary w-100'>Update Category</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
