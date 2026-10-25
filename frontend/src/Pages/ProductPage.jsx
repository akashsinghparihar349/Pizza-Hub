import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';

import Breadcrum from '../Components/Breadcrum'
import ProductSlider from '../Components/ProductSlider'

import { getProduct } from "../Redux/ActionCreators/ProductActionCreators"
import { createCart, getCart } from "../Redux/ActionCreators/CartActionCreators"
import { createWishlist, getWishlist } from "../Redux/ActionCreators/WishlistActionCreators"
import { getTestimonial } from "../Redux/ActionCreators/TestimonialActionCreators"
const sliderOptions = {
    effect: 'cube',
    grabCursor: true,
    cubeEffect: {
        shadow: true,
        slideShadows: true,
        shadowOffset: 20,
        shadowScale: 0.94,
    },
    loop: true,
    pagination: true,
    modules: [EffectCube, Pagination],
    className: "mySwiper"
}
const PIZZA_SIZE_METADATA = {
    "Small": { inches: "6 inches", label: "Small (6\")", defaultMultiplier: 0.8 },
    "Medium": { inches: "8 inches", label: "Medium (8\")", defaultMultiplier: 1.0 },
    "Large": { inches: "10 inches", label: "Large (10\")", defaultMultiplier: 1.4 },
    "Extra Large": { inches: "12 inches", label: "Extra Large (12\")", defaultMultiplier: 1.8 },
    "Regular": { inches: "8 inches", label: "Regular (8\")", defaultMultiplier: 1.0 }
}

export default function ProductPage() {
    let { _id } = useParams()
    let [review, setReview] = useState([])

    let [selected, setSelected] = useState({
        size: "Medium",
        quantity: 1
    })
    let [data, setData] = useState({
        pic: [],
        size: ["Small", "Medium", "Large", "Extra Large"],
        sizePrices: []
    })
    let [relatedProducts, setRelatedProducts] = useState([])

    let ProductStateData = useSelector(state => state.ProductStateData)
    let CartStateData = useSelector(state => state.CartStateData)
    let WishlistStateData = useSelector(state => state.WishlistStateData)
    let TestimonialStateData = useSelector(state => state.TestimonialStateData)

    let dispatch = useDispatch()
    let navigate = useNavigate()

    // Determine size-specific price for selected size
    const currentSizePriceObj = data.sizePrices?.find(sp => 
        sp.size?.toLowerCase() === selected.size?.toLowerCase() ||
        selected.size?.toLowerCase().startsWith(sp.size?.toLowerCase())
    )

    const meta = PIZZA_SIZE_METADATA[selected.size] || { inches: "8 inches", label: selected.size, defaultMultiplier: 1.0 }
    
    let currentFinalPrice
    let currentBasePrice

    if (currentSizePriceObj && typeof currentSizePriceObj.price === "number") {
        currentFinalPrice = currentSizePriceObj.price
        const discountPercent = Number(data.discount) || 0
        currentBasePrice = discountPercent > 0 
            ? Math.round(currentFinalPrice / (1 - discountPercent / 100))
            : currentFinalPrice
    } else {
        const mult = meta.defaultMultiplier || 1.0
        currentBasePrice = Math.round((Number(data.basePrice) || 200) * mult)
        currentFinalPrice = Math.round((Number(data.finalPrice) || (Number(data.basePrice) || 200)) * mult)
    }

    function addToCart() {
        let userid = localStorage.getItem("userid")
        if (!userid) {
            navigate("/login")
            return
        }
        let item = CartStateData.find(x => 
            (x.product?._id === _id || x.product === _id) && 
            (x.user?._id === userid || x.user === userid) &&
            x.size === selected.size
        )
        if (!item) {
            item = {
                user: userid,
                product: data._id,
                quantity: selected.quantity,
                size: selected.size || "Regular",
                total: selected.quantity * currentFinalPrice,
            }
            dispatch(createCart({ ...item }))
        }
        navigate("/cart")
    }

    function getStar(star) {
        if (star == "5")
            return <span><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i></span>
        else if (star == "4")
            return <span><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star text-warning'></i></span>
        else if (star == "3")
            return <span><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star text-warning'></i><i className='bi bi-star text-warning'></i></span>
        else if (star == "2")
            return <span><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star text-warning'></i><i className='bi bi-star text-warning'></i><i className='bi bi-star text-warning'></i></span>
        else
            return <span><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star text-warning'></i><i className='bi bi-star text-warning'></i><i className='bi bi-star text-warning'></i><i className='bi bi-star text-warning'></i></span>
    }


    function addToWishlist() {
        let userid = localStorage.getItem("userid")
        if (!userid) {
            navigate("/login")
            return
        }
        let item = WishlistStateData.find(x => (x.product?._id === _id || x.product === _id) && (x.user?._id === userid || x.user === userid))
        if (!item) {
            item = {
                user: userid,
                product: data._id,
            }
            dispatch(createWishlist({ ...item }))
        }
        navigate("/profile?option=Wishlist")
    }

    useEffect(() => {
        dispatch(getProduct())
    }, [dispatch])

    useEffect(() => {
        if (localStorage.getItem("userid")) {
            dispatch(getCart())
        }
    }, [dispatch])

    useEffect(() => {
        if (localStorage.getItem("userid")) {
            dispatch(getWishlist())
        }
    }, [dispatch])

    useEffect(() => {
        dispatch(getTestimonial())
    }, [dispatch])

    useEffect(() => {
        if (TestimonialStateData.length) {
            setReview(TestimonialStateData.filter(x => (x.product?._id === _id || x.product === _id)))
        }
    }, [TestimonialStateData, _id])

    useEffect(() => {
        if (ProductStateData.length) {
            let item = ProductStateData.find(x => x._id === _id)
            if (item) {
                setData({ ...item })
                setSelected(prev => ({
                    ...prev,
                    size: item.size?.[0] || ""
                }))
                let targetCat = item.maincategory?.name || item.maincategory
                setRelatedProducts(ProductStateData.filter(x => {
                    let cat = x.maincategory?.name || x.maincategory
                    return cat === targetCat && x._id !== item._id
                }))
            }
        }
    }, [ProductStateData, _id])
    return (
        <>
            <Breadcrum title={data.name ? data.name : "Product"} />
            <div className="container-fluid shop py-5">
                <div className="container py-5">
                    <div className="g-4">
                        <div className="wow fadeInUp" data-wow-delay="0.1s">
                            <div className="row g-4 single-product">
                                <div className="col-xl-6">
                                    <Swiper {...sliderOptions}>
                                        {(data.pic && data.pic.length > 0 ? data.pic : [""]).map((item, index) => {
                                            const imgSrc = item ? `${import.meta.env.VITE_APP_IMAGE_SERVER}${item}` : '/images/pizza_farmhouse.jpg'
                                            return <SwiperSlide key={index}>
                                                <img src={imgSrc} height={400} style={{ objectFit: "cover" }} className='w-100 rounded' alt={data.name} />
                                            </SwiperSlide>
                                        })}
                                    </Swiper>
                                </div>
                                <div className="col-xl-6">
                                    <div className="d-flex align-items-center mb-2">
                                        {data.isVeg !== false ? (
                                            <span className="badge bg-success-subtle text-success border border-success me-2 px-2 py-1">
                                                <i className="bi bi-circle-fill me-1" style={{ fontSize: "9px" }}></i> 100% Pure Veg
                                            </span>
                                        ) : (
                                            <span className="badge bg-danger-subtle text-danger border border-danger me-2 px-2 py-1">
                                                <i className="bi bi-triangle-fill me-1" style={{ fontSize: "9px" }}></i> Non-Veg
                                            </span>
                                        )}
                                        <span className="badge bg-light text-dark border me-2">
                                            <i className="bi bi-clock me-1 text-primary"></i> {data.prepTime || "20-25 mins"}
                                        </span>
                                        <span className="badge bg-light text-dark border">
                                            <i className="bi bi-fire me-1 text-danger"></i> {data.crust || "Classic Hand Tossed"}
                                        </span>
                                    </div>

                                    <h4 className="fw-bold mb-2">{data.name}</h4>
                                    <p className="mb-2 text-muted">Category: {data.maincategory?.name} {data.subcategory?.name ? `• ${data.subcategory?.name}` : ''} {data.brand?.name ? `• ${data.brand?.name}` : ''}</p>
                                    <h5 className="fw-bold mb-3">
                                        <del className="text-muted me-2">&#8377;{currentBasePrice}</del>
                                        <span className="text-primary fs-4 me-2">&#8377;{currentFinalPrice}</span>
                                        <sup className="badge bg-danger text-light">{data.discount}% Off</sup>
                                        <span className="ms-2 badge bg-light text-dark border">
                                            {selected.size} ({meta.inches})
                                        </span>
                                    </h5>

                                    <p className="mb-3">{data.stock ? <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i> Fresh & In Stock</span> : <span className="text-danger"><i className="bi bi-x-circle-fill me-1"></i> Out Of Stock</span>}</p>
                                    <div className='mb-4'>
                                        <h5 className="mb-2">Select Pizza Size: </h5>
                                        <div className='d-flex flex-wrap gap-2'>
                                            {(data.size && data.size.length > 0 ? data.size : ["Small", "Medium", "Large", "Extra Large"]).map((item, index) => {
                                                const szMeta = PIZZA_SIZE_METADATA[item] || { inches: "8 inches" }
                                                const spObj = data.sizePrices?.find(sp => sp.size === item)
                                                const priceText = spObj ? ` • ₹${spObj.price}` : ''
                                                return <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => setSelected({ ...selected, size: item })}
                                                    className={`btn py-2 px-3 ${selected.size === item ? 'btn-primary text-white shadow' : 'btn-outline-primary'}`}>
                                                    <span className="fw-bold">{item}</span> <small className="opacity-75">({szMeta.inches})</small>{priceText}
                                                </button>
                                            })}
                                        </div>
                                    </div>
                                    {data.stock ?
                                        <div className="input-group quantity mb-3" style={{ width: "100px" }}>
                                            <div className="input-group-btn">
                                                <button className="btn btn-sm btn-minus rounded-circle bg-light border" onClick={() => selected.quantity > 1 ? setSelected({ ...selected, quantity: selected.quantity - 1 }) : null}>
                                                    <i className="fa fa-minus"></i>
                                                </button>
                                            </div>
                                            <input type="text" className="form-control form-control-sm text-center border-0" value={selected.quantity} />
                                            <div className="input-group-btn">
                                                <button className="btn btn-sm btn-plus rounded-circle bg-light border" onClick={() => selected.quantity < data.stockQuantity ? setSelected({ ...selected, quantity: selected.quantity + 1 }) : null}>
                                                    <i className="fa fa-plus"></i>
                                                </button>
                                            </div>
                                        </div> : null}
                                    <div className='btn-group'>
                                        {data.stock ?
                                            <button className="btn btn-primary border px-4 py-2 mb-4 text-primary" onClick={addToCart}>
                                                <i className="bi bi-cart-plus fs-5 me-2 text-white"></i> Add to cart
                                            </button> : null}
                                        <button className="btn btn-success border px-4 py-2 mb-4 text-light" onClick={addToWishlist}>
                                            <i className="bi bi-heart fs-5 me-2 text-white"></i> Add to Wishlist
                                        </button>
                                    </div>
                                </div>
                                <div className="col-lg-12">
                                    <nav>
                                        <div className="nav nav-tabs mb-3">
                                            <button className="nav-link active border-white border-bottom-0" type="button"
                                                role="tab" id="nav-about-tab" data-bs-toggle="tab" data-bs-target="#nav-about"
                                                aria-controls="nav-about" aria-selected="true">Description</button>
                                            <button className="nav-link border-white border-bottom-0" type="button" role="tab"
                                                id="nav-mission-tab" data-bs-toggle="tab" data-bs-target="#nav-mission"
                                                aria-controls="nav-mission" aria-selected="false">Reviews</button>
                                        </div>
                                    </nav>
                                    <div className="tab-content mb-5">
                                        <div className="tab-pane active" id="nav-about" role="tabpanel"
                                            aria-labelledby="nav-about-tab">
                                            <div dangerouslySetInnerHTML={{ __html: data.description }} />
                                        </div>
                                        <div className="tab-pane" id="nav-mission" role="tabpanel"
                                            aria-labelledby="nav-mission-tab">
                                            {review.length ?
                                                review.map(item => {
                                                    return <div className="d-flex card p-4" key={item._id}>
                                                        <div className="">
                                                            <div className="d-flex justify-content-between">
                                                                <h5>{item.user?.name}</h5>
                                                                {getStar(item.star)}
                                                            </div>
                                                            <p>{item.message}</p>
                                                        </div>
                                                    </div>
                                                }) :
                                                <div className='card p-5'>
                                                    No Reviews
                                                </div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ProductSlider data={relatedProducts} title="Related Pizzas" />
        </>
    )
}
