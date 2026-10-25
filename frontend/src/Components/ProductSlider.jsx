import React from 'react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules';
import "swiper/css";

import SingleProduct2 from './SingleProduct2';
const sliderOptions = {
    loop: true,
    breakpoints: {
        640: {
            slidesPerView: 1,
            spaceBetween: 0,
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 10,
        }
    },
    autoplay: {
        delay: 2000,
        disableOnInteraction: false
    },
    modules: [Autoplay]
}
export default function ProductSlider({ title, maincategory, data }) {
    return (
        <div className="container-fluid products productList overflow-hidden">
            <div className="container products-mini py-5">
                <div className="mx-auto text-center mb-5" style={{ maxWidth: "900px" }}>
                    <h4 className="text-primary border-bottom border-primary border-2 d-inline-block p-2 title-border-radius wow fadeInUp"
                        data-wow-delay="0.1s">Products</h4>
                    {title && title !== "" ?
                        <h1 className="mb-0 display-3 wow fadeInUp" data-wow-delay="0.3s">Other Related Items</h1> :
                        <h1 className="mb-0 display-3 wow fadeInUp" data-wow-delay="0.3s">All {maincategory} Items</h1>}
                </div>
                <div className="productList-carousel pt-4 wow fadeInUp" data-wow-delay="0.3s">
                    <Swiper {...sliderOptions}>
                        {data.map(item => {
                            return <SwiperSlide key={item._id}>
                                <SingleProduct2 item={item} />
                            </SwiperSlide>
                        })}
                    </Swiper>
                </div>
            </div>
        </div>
    )
}
