import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

import Breadcrum from '../Components/Breadcrum'
import SaleBanner from '../Components/SaleBanner'

import SingleProduct from '../Components/SingleProduct'
import SingleProduct2 from '../Components/SingleProduct2'

import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators"
import { getSubcategory } from "../Redux/ActionCreators/SubcategoryActionCreators"
import { getBrand } from "../Redux/ActionCreators/BrandActionCreators"
import { getProduct } from "../Redux/ActionCreators/ProductActionCreators"

const PIZZA_SIZES = [
    { name: "Small", inches: "6 inches", label: "Small (6 inches)" },
    { name: "Medium", inches: "8 inches", label: "Medium (8 inches)" },
    { name: "Large", inches: "10 inches", label: "Large (10 inches)" },
    { name: "Extra Large", inches: "12 inches", label: "Extra Large (12 inches)" }
]
export default function ShopPage() {
    let MaincategoryStateData = useSelector(state => state.MaincategoryStateData)
    let SubcategoryStateData = useSelector(state => state.SubcategoryStateData)
    let BrandStateData = useSelector(state => state.BrandStateData)
    let ProductStateData = useSelector(state => state.ProductStateData)

    let [page, setPage] = useState(1)
    let [totalProducts, setTotalProducts] = useState(0)

    let [searchParams] = useSearchParams()

    let [selected, setSelected] = useState({
        maincategory: [],
        subcategory: [],
        brand: [],
        size: [],
    })
    let [data, setData] = useState([])
    let [sortFilter, setSortFilter] = useState("No Sort")
    let [search, setSearch] = useState("")
    let [min, setMin] = useState(-1)
    let [max, setMax] = useState(-1)

    let dispatch = useDispatch()

    let startIndex = (page - 1) * 24
    let endIndex = page * 24
    let totalPages = Math.ceil(totalProducts / 24) || 1

    function getInputSelected(key, value) {
        let arr = selected[key] || []
        let newArr = arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]
        let newSelected = { ...selected, [key]: newArr }

        setSelected(newSelected)
        setPage(1)
        applySelectFilter(newSelected)
    }

    function applySearchFilter(option = null) {
        let ch = (option !== null ? option : search)?.toLowerCase() || ""
        let items = ProductStateData.filter(x => x.status && (
            (x.name?.toLowerCase()?.includes(ch)) ||
            (x.maincategory?.name?.toLowerCase() === ch) ||
            (x.subcategory?.name?.toLowerCase() === ch) ||
            (x.brand?.name?.toLowerCase() === ch) ||
            (x.crust?.toLowerCase()?.includes(ch)) ||
            (ch === "veg" && x.isVeg === true) ||
            (ch === "non-veg" && x.isVeg === false) ||
            (x.description?.toLowerCase()?.includes(ch))
        ))
        setSelected({
            maincategory: [],
            subcategory: [],
            brand: [],
            size: []
        })
        setPage(1)
        applySortFilter(sortFilter, items)
    }

    function applySelectFilter(currentSelected) {
        let items = ProductStateData.filter(x => x.status && (
            (currentSelected.maincategory?.length === 0 || currentSelected.maincategory?.includes(x.maincategory?.name)) &&
            (currentSelected.subcategory?.length === 0 || currentSelected.subcategory?.includes(x.subcategory?.name)) &&
            (currentSelected.brand?.length === 0 || currentSelected.brand?.includes(x.brand?.name)) &&
            (currentSelected.size?.length === 0 || currentSelected.size.some(size => 
                x.size?.some(c => c.toLowerCase() === size.toLowerCase()) ||
                x.sizePrices?.some(sp => sp.size.toLowerCase() === size.toLowerCase())
            ))
        ))
        setSearch("")
        setPage(1)
        applySortFilter(sortFilter, items)
    }

    function applySortFilter(filter, items = data) {
        let result = [...items]
        let minNum = Number(min)
        let maxNum = Number(max)
        if (min !== -1 && max !== -1 && !isNaN(minNum) && !isNaN(maxNum))
            result = result.filter(x => x.finalPrice >= minNum && x.finalPrice <= maxNum)
        if (filter === "Latest")
            result.sort((x, y) => (y._id || '').localeCompare(x._id || ''))
        else if (filter === "Price : Low to high")
            result.sort((x, y) => (x.finalPrice || 0) - (y.finalPrice || 0))
        else if (filter === "Price : High to low")
            result.sort((x, y) => (y.finalPrice || 0) - (x.finalPrice || 0))

        setData(result)
        setTotalProducts(result.length)
        setSortFilter(filter)
    }

    useEffect(() => {
        dispatch(getMaincategory())
        dispatch(getSubcategory())
        dispatch(getBrand())
        dispatch(getProduct())
    }, [dispatch])

    useEffect(() => {
        if (!ProductStateData.length) return

        let searchParam = searchParams.get("search")
        if (searchParam) {
            setSearch(searchParam)
            applySearchFilter(searchParam)
        } else {
            let mc = searchParams.get("mc") ? [searchParams.get("mc")] : []
            let sc = searchParams.get("sc") ? [searchParams.get("sc")] : []
            let br = searchParams.get("br") ? [searchParams.get("br")] : []
            let selectItems = {
                maincategory: mc,
                subcategory: sc,
                brand: br,
                size: []
            }
            setSelected(selectItems)
            applySelectFilter(selectItems)
        }
    }, [ProductStateData, searchParams])


    return (
        <>
            <Breadcrum title="Pizza Menu" />
            <div className="container-fluid shop py-5">
                <div className="container py-5">
                    <div className="row g-4">
                        <div className="col-lg-3 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="product-categories mb-2">
                                <h5>Category</h5>
                                <ul className="list-unstyled">
                                    {MaincategoryStateData.filter(x => x.status).map((item, index) => {
                                        return <li key={index}>
                                            <div className="d-flex">
                                                <span onClick={() => getInputSelected('maincategory', item.name)} className="btn btn-light w-100 text-start">{item.name}</span>
                                                {selected.maincategory.includes(item.name) ? <i className='bi bi-check'></i> : null}
                                            </div>
                                        </li>
                                    })}
                                </ul>
                            </div>
                            <div className="product-categories mb-2">
                                <h5>Pizza Style</h5>
                                <ul className="list-unstyled">
                                    {SubcategoryStateData.filter(x => x.status).map((item, index) => {
                                        return <li key={index}>
                                            <div className="d-flex">
                                                <span onClick={() => getInputSelected('subcategory', item.name)} className="btn btn-light w-100 text-start">{item.name}</span>
                                                {selected.subcategory.includes(item.name) ? <i className='bi bi-check'></i> : null}
                                            </div>
                                        </li>
                                    })}
                                </ul>
                            </div>
                            <div className="product-categories mb-2">
                                <h5>Kitchen / Brand</h5>
                                <ul className="list-unstyled">
                                    {BrandStateData.filter(x => x.status).map((item, index) => {
                                        return <li key={index}>
                                            <div className="d-flex">
                                                <span onClick={() => getInputSelected('brand', item.name)} className="btn btn-light w-100 text-start">{item.name}</span>
                                                {selected.brand.includes(item.name) ? <i className='bi bi-check'></i> : null}
                                            </div>
                                        </li>
                                    })}
                                </ul>
                            </div>

                           
                            <div className="product-size mb-3">
                                <h5>Filter By Pizza Size</h5>
                                <ul className="list-unstyled">
                                    {PIZZA_SIZES.map((item, index) => {
                                        return <li key={index} className="mb-1">
                                            <div className="d-flex align-items-center">
                                                <span onClick={() => getInputSelected('size', item.name)} className={`btn btn-light w-100 text-start ${selected.size.includes(item.name) ? 'border-primary fw-bold text-primary' : ''}`}>
                                                    {item.label}
                                                </span>
                                                {selected.size.includes(item.name) ? <i className='bi bi-check fs-5 text-primary ms-1'></i> : null}
                                            </div>
                                        </li>
                                    })}
                                </ul>
                            </div>
                            <div className="product-price mb-3">
                                <h5>Filter By Price Range</h5>
                                <form onSubmit={(e) => {
                                    e.preventDefault()
                                    applySortFilter(sortFilter, data)
                                }}>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label>Min. Amount</label>
                                            <input type="number" name="min" onChange={e => (setMin(e.target.value))} placeholder='Min. Amount' className='form-control border-primary' />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label>Max. Amount</label>
                                            <input type="number" name="max" onChange={e => (setMax(e.target.value))} placeholder='Max. Amount' className='form-control border-primary' />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <button type="submit" className='btn btn-primary w-100'>Apply Filter</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-9 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="row g-4">
                                <div className="col-xl-6">
                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        applySearchFilter()
                                    }} >
                                        <div className="input-group w-100 mx-auto d-flex">
                                            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control p-3" placeholder="Search Pizzas By Name, Crust, Toppings etc"
                                                aria-describedby="search-icon-1" />
                                            <button type='submit' id="search-icon-1" className="input-group-text p-3"><i
                                                className="fa fa-search"></i></button>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-xl-4 text-end">
                                    <div className="bg-light ps-3 py-3 rounded d-flex justify-content-between">
                                        <label>Sort By:</label>
                                        <select id="pizzaSort" onChange={(e) => applySortFilter(e.target.value, data)} name="pizzaSortList"
                                            className="border-0 form-select-sm bg-light me-3">
                                            <option>Latest</option>
                                            <option>Price : Low to high</option>
                                            <option>Price : High to low</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-xl-2 d-flex justify-content-center align-items-center">
                                    <ul className="nav nav-pills d-inline-flex text-center py-2 px-2 rounded bg-light mb-4">
                                        <li className="nav-item me-4">
                                            <a className="bg-light" data-bs-toggle="pill" href="#tab-5">
                                                <i className="fas fa-th fs-2 text-primary"></i>
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="bg-light" data-bs-toggle="pill" href="#tab-6">
                                                <i className="fas fa-bars fs-2 text-primary"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="tab-content">
                                <div id="tab-5" className="tab-pane fade show p-0 active">
                                    <div className="row g-4 product">
                                        {data.slice(startIndex, endIndex).map(item => {
                                            return <SingleProduct title="shop" item={item} key={item._id} />
                                        })}
                                    </div>
                                </div>
                                <div id="tab-6" className="products tab-pane fade show p-0">
                                    <div className="row g-4 products-mini">
                                        {data.slice(startIndex, endIndex).map(item => {
                                            return <div className="col-lg-6" key={item._id}>
                                                <SingleProduct2 title="shop" item={item} />
                                            </div>
                                        })}
                                    </div>
                                </div>
                                <div className="col-12 wow fadeInUp" data-wow-delay="0.1s">
                                    <div className="pagination d-flex justify-content-center mt-5">
                                        <a href="#" onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }} className="rounded">&laquo;</a>
                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <a href="#" key={index} onClick={(e) => { e.preventDefault(); setPage(index + 1); }} className={`rounded ${page === (index + 1) ? 'active' : ''}`}>{index + 1}</a>
                                        ))}
                                        <a href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }} className="rounded">&raquo;</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SaleBanner />
        </>
    )
}
