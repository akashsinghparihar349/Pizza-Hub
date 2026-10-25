import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import TextValidators from '../../../FormValidators/TextValidators'
import ImageValidators from '../../../FormValidators/ImageValidators'

let rte;
import { createProduct } from '../../../Redux/ActionCreators/ProductActionCreators'
import { getMaincategory } from '../../../Redux/ActionCreators/MaincategoryActionCreators'
import { getSubcategory } from '../../../Redux/ActionCreators/SubcategoryActionCreators'
import { getBrand } from '../../../Redux/ActionCreators/BrandActionCreators'

const PIZZA_SIZE_OPTIONS = [
    { name: "Small", inches: "6 inches", defaultMultiplier: 0.8 },
    { name: "Medium", inches: "8 inches", defaultMultiplier: 1.0 },
    { name: "Large", inches: "10 inches", defaultMultiplier: 1.4 },
    { name: "Extra Large", inches: "12 inches", defaultMultiplier: 1.8 }
]
const crustOptions = ["Classic Hand Tossed", "Cheese Burst", "Fresh Pan", "Thin & Crispy", "Gluten Free Crust"]

export default function AdminProductCreatePage() {
    let refdiv = useRef(null);
    let [data, setData] = useState({
        name: "",
        maincategory: "",
        subcategory: "",
        brand: "",
        size: ["Small", "Medium", "Large", "Extra Large"],
        isVeg: true,
        crust: "Classic Hand Tossed",
        prepTime: "20-25 mins",
        basePrice: 0,
        discount: 0,
        finalPrice: 0,
        stock: true,
        stockQuantity: 0,
        pic: [],
        status: true
    })
    let [sizePrices, setSizePrices] = useState({
        "Small": 160,
        "Medium": 200,
        "Large": 280,
        "Extra Large": 360
    })
    let [errorMessage, setErrorMessage] = useState({
        name: "Name Field is Mendatory",
        basePrice: "Base Price Field is Mendatory",
        discount: "Discount Field is Mendatory",
        stockQuantity: "Stock Quantity Field is Mendatory",
        size: "",
        pic: 'Pic Field is Mendatory'
    })
    let [show, setShow] = useState(false)

    let MaincategoryStateData = useSelector(state => state.MaincategoryStateData)
    let SubcategoryStateData = useSelector(state => state.SubcategoryStateData)
    let BrandStateData = useSelector(state => state.BrandStateData)
    let dispatch = useDispatch()
    let navigate = useNavigate()

    function getInputCheckbox(name, value) {
        let arr = [...data[name]]
        if (arr.includes(value))
            arr = arr.filter(x => x !== value)
        else
            arr.push(value)

        setData({ ...data, [name]: arr })
        setErrorMessage({ ...errorMessage, [name]: arr.length === 0 ? `Please Select Atleast One ${name}` : "" })
    }

    function handleSizePriceChange(sizeName, newPrice) {
        setSizePrices(prev => ({
            ...prev,
            [sizeName]: Number(newPrice) || 0
        }))
    }

    function getInputData(e) {
        let name = e.target.name
        let value = name === "pic" ? e.target.files : e.target.value

        let parsedValue = value
        if (name === "status" || name === "stock") {
            parsedValue = value === "1"
        } else if (name === "isVeg") {
            parsedValue = value === "true" || value === "1"
        }

        let updatedData = { ...data, [name]: parsedValue }

        if (name === "basePrice" || name === "discount") {
            let bp = name === "basePrice" ? Number(parsedValue) || 0 : Number(data.basePrice) || 0
            let d = name === "discount" ? Number(parsedValue) || 0 : Number(data.discount) || 0
            let fp = Math.round(bp - (bp * d / 100))
            updatedData.finalPrice = fp
            // Auto calculate initial suggested size prices based on base price
            if (fp > 0) {
                setSizePrices({
                    "Small": Math.round(fp * 0.8),
                    "Medium": fp,
                    "Large": Math.round(fp * 1.4),
                    "Extra Large": Math.round(fp * 1.8)
                })
            }
        }

        setData(updatedData)
        setErrorMessage({ ...errorMessage, [name]: name === "pic" ? ImageValidators(e) : TextValidators(e) })
    }
    function postData(e) {
        e.preventDefault()
        let error = Object.values(errorMessage).find(x => x !== "")
        if (error)
            setShow(true)
        else {
            let stockQuantity = parseInt(data.stockQuantity)
            let bp = parseInt(data.basePrice)
            let d = parseInt(data.discount)
            let fp = parseInt(bp - bp * d / 100)

            let defaultMainCat = MaincategoryStateData[0]?._id || ""
            let defaultSubCat = SubcategoryStateData[0]?._id || ""
            let defaultBrand = BrandStateData[0]?._id || ""

            let formattedSizePrices = data.size.map(sz => {
                const opt = PIZZA_SIZE_OPTIONS.find(o => o.name === sz)
                return {
                    size: sz,
                    inches: opt?.inches || "",
                    price: Number(sizePrices[sz] || fp)
                }
            })

            let formData = new FormData()
            formData.append("name", data.name)
            formData.append("maincategory", data.maincategory || defaultMainCat)
            formData.append("subcategory", data.subcategory || defaultSubCat)
            formData.append("brand", data.brand || defaultBrand)
            formData.append("isVeg", data.isVeg)
            formData.append("crust", data.crust)
            formData.append("prepTime", data.prepTime)
            formData.append("basePrice", bp)
            formData.append("discount", d)
            formData.append("finalPrice", fp)
            formData.append("stock", data.stock)
            formData.append("stockQuantity", stockQuantity)
            formData.append("sizePrices", JSON.stringify(formattedSizePrices))
            Array.from(data.pic).forEach(x => {
                formData.append("pic", x)
            })
            data.size.forEach(x => {
                formData.append("size", x)
            })
            formData.append("status", data.status)
            formData.append("description", rte?.getHTMLCode ? rte.getHTMLCode() : "")
            dispatch(createProduct(formData))

            navigate("/admin/product")
        }
    }

    useEffect(() => {
        dispatch(getMaincategory())
    }, [MaincategoryStateData.length, dispatch])

    useEffect(() => {
        dispatch(getSubcategory())
    }, [SubcategoryStateData.length, dispatch])

    useEffect(() => {
        dispatch(getBrand())
    }, [BrandStateData.length, dispatch])

    useEffect(() => {
        if (window.RichTextEditor && refdiv.current && !rte) {
            rte = new window.RichTextEditor(refdiv.current);
            rte.setHTMLCode("");
        }
        return () => {
            rte = null;
        }
    }, [])
    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>Create Product <Link to="/admin/product"><i className='bi bi-arrow-left text-light float-end'></i></Link></h5>
                        <form onSubmit={postData}>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label>Name*</label>
                                    <input type="text" name="name" onChange={getInputData} placeholder='Product Name' className={`form-control ${show && errorMessage.name ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.name ? <p className='text-danger text-capitalize'>{errorMessage.name}</p> : null}
                                </div>

                                <div className="col-xl-3 col-md-6 mb-3">
                                    <label>Maincategory*</label>
                                    <select name="maincategory" onChange={getInputData} className='form-select border-primary'>
                                        {MaincategoryStateData.filter(x => x.status).map((item) => {
                                            // return <option key={item._id}>{item.name}</option>
                                            return <option key={item._id} value={item._id}>{item.name}</option>
                                        })}
                                    </select>
                                </div>

                                <div className="col-xl-3 col-md-6 mb-3">
                                    <label>Subcategory*</label>
                                    <select name="subcategory" onChange={getInputData} className='form-select border-primary'>
                                        {SubcategoryStateData.filter(x => x.status).map((item) => {
                                            // return <option key={item._id}>{item.name}</option>
                                            return <option key={item._id} value={item._id}>{item.name}</option>
                                        })}
                                    </select>
                                </div>

                                <div className="col-xl-3 col-md-6 mb-3">
                                    <label>Brand*</label>
                                    <select name="brand" onChange={getInputData} className='form-select border-primary'>
                                        {BrandStateData.filter(x => x.status).map((item) => {
                                            // return <option key={item._id}>{item.name}</option>
                                            return <option key={item._id} value={item._id}>{item.name}</option>
                                        })}
                                    </select>
                                </div>

                                <div className="col-xl-3 col-md-6 mb-3">
                                    <label>Stock*</label>
                                    <select name="stock" onChange={getInputData} className='form-select border-primary'>
                                        <option value="1">In Stock</option>
                                        <option value="0">Out Of Stock</option>
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label>Base Price*</label>
                                    <input type="number" name="basePrice" onChange={getInputData} placeholder='Product Base Price' className={`form-control ${show && errorMessage.basePrice ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.basePrice ? <p className='text-danger text-capitalize'>{errorMessage.basePrice}</p> : null}
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label>Discount*</label>
                                    <input type="number" name="discount" onChange={getInputData} placeholder='Product Discount' className={`form-control ${show && errorMessage.discount ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.discount ? <p className='text-danger text-capitalize'>{errorMessage.discount}</p> : null}
                                </div>


                                <div className="col-md-4 mb-3">
                                    <label>Stock Quantity*</label>
                                    <input type="number" name="stockQuantity" onChange={getInputData} placeholder='Product Stock Quantity' className={`form-control ${show && errorMessage.stockQuantity ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.stockQuantity ? <p className='text-danger text-capitalize'>{errorMessage.stockQuantity}</p> : null}
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label>Food Type*</label>
                                    <select name="isVeg" value={data.isVeg ? "true" : "false"} onChange={getInputData} className='form-select border-primary'>
                                        <option value="true">🟢 100% Pure Veg</option>
                                        <option value="false">🔴 Non-Veg</option>
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label>Crust Type*</label>
                                    <select name="crust" value={data.crust} onChange={getInputData} className='form-select border-primary'>
                                        {crustOptions.map((crust, i) => (
                                            <option key={i} value={crust}>{crust}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label>Estimated Prep Time*</label>
                                    <input type="text" name="prepTime" value={data.prepTime} onChange={getInputData} placeholder='e.g. 20-25 mins' className='form-control border-primary' />
                                </div>

                                <div className="col-12 mb-3">
                                    <label className="fw-bold">Available Pizza Sizes & Size-Specific Prices*</label>
                                    <div className='border border-primary rounded p-3 row'>
                                        {PIZZA_SIZE_OPTIONS.map((opt, index) => {
                                            const isChecked = data?.size?.includes(opt.name)
                                            return (
                                                <div key={index} className='col-md-6 col-lg-3 mb-2 p-2'>
                                                    <div className={`card p-2 h-100 ${isChecked ? 'border-primary' : 'border-secondary bg-light'}`}>
                                                        <div className="form-check mb-2">
                                                            <input
                                                                type="checkbox"
                                                                onChange={() => getInputCheckbox('size', opt.name)}
                                                                checked={isChecked}
                                                                id={`size-check-${opt.name}`}
                                                                className='form-check-input'
                                                            />
                                                            <label htmlFor={`size-check-${opt.name}`} className='form-check-label fw-bold'>
                                                                {opt.name} ({opt.inches})
                                                            </label>
                                                        </div>
                                                        <div>
                                                            <label className="form-label small text-muted mb-1">Price (₹)</label>
                                                            <input
                                                                type="number"
                                                                disabled={!isChecked}
                                                                value={sizePrices[opt.name] ?? ""}
                                                                onChange={(e) => handleSizePriceChange(opt.name, e.target.value)}
                                                                className="form-control form-control-sm border-primary"
                                                                placeholder={`Price for ${opt.name}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {show && errorMessage.size ? <p className='text-danger text-capitalize mt-1'>{errorMessage.size}</p> : null}
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Description*</label>
                                    <div ref={refdiv} className='border-primary'></div>
                                </div>


                                <div className="col-md-6 mb-3">
                                    <label>Pic*</label>
                                    <input type="file" name="pic" multiple onChange={getInputData} className={`form-control ${show && errorMessage.pic ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.pic ? errorMessage.pic?.split("|").map((item, index) => {
                                        return <p className='text-danger text-capitalize' key={index}>{item}</p>
                                    }) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>Status</label>
                                    <select name="status" onChange={getInputData} className='form-select border-primary'>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>

                                <div className="col-12 mb-3">
                                    <button type='submit' className='btn btn-primary w-100'>Create</button>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
