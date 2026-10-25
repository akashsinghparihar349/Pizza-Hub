import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules';
import "swiper/css";

import Service from '../Components/Service'
import Offer from '../Components/Offer'
import Products from '../Components/Products'
import SaleBanner from '../Components/SaleBanner'
import ProductSlider from '../Components/ProductSlider'
import BestSellerProducts from '../Components/BestSellerProducts'


import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators"
import { getProduct } from "../Redux/ActionCreators/ProductActionCreators"
export default function HomePage() {
  let [maincategory, setMaincategory] = useState([])

  let sliderOptions = {
    loop: true,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false
    },
    modules: [Autoplay]
  }
  let [data, setData] = useState({ pic: [] })

  let MaincategoryStateData = useSelector(state => state.MaincategoryStateData)
  let ProductStateData = useSelector(state => state.ProductStateData)
  let dispatch = useDispatch()

  useEffect(() => {
    dispatch(getMaincategory())
    dispatch(getProduct())
  }, [dispatch])

  useEffect(() => {
    if (MaincategoryStateData.length && ProductStateData.length) {
      setMaincategory(MaincategoryStateData.filter(x => x.status && ProductStateData.some(p => p.status && (p.maincategory?.name === x.name || p.maincategory === x.name || p.maincategory?._id === x._id))))
    }
  }, [MaincategoryStateData, ProductStateData])

  useEffect(() => {
    if (ProductStateData.length) {
      let active = ProductStateData.find(x => x.status) || ProductStateData[0]
      setData(active)
    }
  }, [ProductStateData])
  return (
    <>
      <div className="container-fluid carousel bg-light px-0">
        <div className="row g-0 justify-content-end">
          <div className="col-12 col-lg-7 col-xl-9">
            <div className="header-carousel bg-light py-5">
              <Swiper {...sliderOptions}>
                <SwiperSlide>
                  <div className="row g-0 header-carousel-item align-items-center">
                    <div className="col-xl-6 carousel-img wow fadeInLeft" data-wow-delay="0.1s">
                      <img src="images/pizza_margherita.jpg" className="img-fluid w-100" alt="Image" />
                    </div>
                    <div className="col-xl-6 carousel-content p-4">
                      <h4 className="text-uppercase fw-bold mb-4 wow fadeInRight" data-wow-delay="0.1s"
                        style={{ letterSpacing: "3px" }}>Fresh & Hot In 30 Mins</h4>
                      <h1 className="display-3 text-capitalize mb-4 wow fadeInRight" data-wow-delay="0.3s">Authentic Stone-Baked Pizzas</h1>
                      <p className="text-dark wow fadeInRight" data-wow-delay="0.5s">100% Real Mozzarella • Fresh Dough Daily</p>
                      <Link className="btn btn-primary rounded-pill py-3 px-5 wow fadeInRight" data-wow-delay="0.7s"
                        to="/shop">Order Now</Link>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="row g-0 header-carousel-item align-items-center">
                    <div className="col-xl-6 carousel-img wow fadeInLeft" data-wow-delay="0.1s">
                      <img src="images/pizza_farmhouse.jpg" className="img-fluid w-100" alt="Image" />
                    </div>
                    <div className="col-xl-6 carousel-content p-4">
                      <h4 className="text-uppercase fw-bold mb-4 wow fadeInRight" data-wow-delay="0.1s"
                        style={{ letterSpacing: "3px" }}>Loaded With Flavor</h4>
                      <h1 className="display-3 text-capitalize mb-4 wow fadeInRight" data-wow-delay="0.3s">Handcrafted Gourmet Pizzas</h1>
                      <p className="text-dark wow fadeInRight" data-wow-delay="0.5s">Veg & Non-Veg Favorites with Chef's Secret Sauces</p>
                      <Link className="btn btn-primary rounded-pill py-3 px-5 wow fadeInRight" data-wow-delay="0.7s"
                        to="/shop">Order Now</Link>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
          <div className="col-12 col-lg-5 col-xl-3 wow fadeInRight" data-wow-delay="0.1s">
            <div className="carousel-header-banner h-100">
              <img src={data.pic?.[0] ? `${import.meta.env.VITE_APP_IMAGE_SERVER}${data.pic[0]}` : "images/pizza_farmhouse.jpg"} className="img-fluid w-100 h-100" style={{ objectFit: "cover" }} alt={data.name || "Special Offer"} />
              {data.discount ? (
                <div className="carousel-banner-offer">
                  <p className="bg-primary text-white rounded fs-5 py-2 px-4 mb-0 me-3">Save &#8377;{(data.basePrice || 0) - (data.finalPrice || 0)}</p>
                  <p className="text-light fs-5 fw-bold mb-0">{data.discount}% Off</p>
                </div>
              ) : null}
              {data._id ? (
                <div className="carousel-banner">
                  <div className="carousel-banner-content text-center p-4">
                    <Link to={`/shop?mc=${data?.maincategory?.name || ''}`} className="text-light d-block mb-2">{data?.maincategory?.name}</Link>
                    <Link to={`/product/${data._id}`} className="d-block text-white fs-3">{data.name}</Link>
                    <del className="me-2 text-white fs-5">&#8377;{data.basePrice}</del>
                    <span className="text-light fs-5">&#8377;{data.finalPrice}</span>
                  </div>
                  <Link to={`/product/${data._id}`} className="btn btn-primary rounded-pill py-2 px-4"><i
                    className="fas fa-shopping-cart me-2"></i> Add To Cart</Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Service />
      <Offer />
      <Products maincategory={maincategory} data={ProductStateData.filter(x => x.status)} />
      <SaleBanner />
      {maincategory.map(item => {
        return <ProductSlider key={item._id} maincategory={item.name} data={ProductStateData.filter(p => p.status && p.maincategory?.name === item.name)} />
      })}
      <BestSellerProducts data={ProductStateData.filter(x => x.status).slice(0, 24)} />
    </>
  )
}
