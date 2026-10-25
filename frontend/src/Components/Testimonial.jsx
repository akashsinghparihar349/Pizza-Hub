import { useEffect, useState } from 'react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules';
import "swiper/css";


import { getTestimonial } from "../Redux/ActionCreators/TestimonialActionCreators"
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';

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
    },
    1000: {
      slidesPerView: 3,
      spaceBetween: 10,
    }
  },
  autoplay: {
    delay: 2000,
    disableOnInteraction: false
  },
  modules: [Autoplay]
}
export default function Testimonial() {
  let [review, setReview] = useState([])

  let TestimonialStateData = useSelector(state => state.TestimonialStateData)
  let dispatch = useDispatch()

  function getStar(star) {
    if (star == "5")
      return <span><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i></span>
    else
      return <span><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star-fill text-warning'></i><i className='bi bi-star text-warning'></i></span>
  }

  useEffect(() => {
    (() => {
      dispatch(getTestimonial())
      if (TestimonialStateData.length) {
        setReview(TestimonialStateData.filter(x => x.star >= "2"))
      }
    })()
  }, [TestimonialStateData.length])
  return (
    <div className="container-fluid products productList overflow-hidden my-5">
      <div className="container py-5">
        <div className="mx-auto text-center mb-5">
          <h4 className="text-primary border-bottom border-primary border-2 d-inline-block p-2 title-border-radius wow fadeInUp"
            data-wow-delay="0.1s">Customer Reviews</h4>
          <h1 className="mb-0 display-3 wow fadeInUp" data-wow-delay="0.3s">What Pizza Lovers Say</h1>
        </div>
        <div className="py-4 wow fadeInUp" data-wow-delay="0.3s">
          <Swiper {...sliderOptions}>
            {review.map(item => {
              return <SwiperSlide key={item._id}>
                <div className="card p-3">
                  <h4><Link to={`/product/${item.product?._id}`} className='btn btn-link text-start'>{item.product?.name}</Link></h4>
                  {getStar(item.star)}
                  <p className='my-testimonial'>{item.message}</p>
                  <h5>{item.user?.name}</h5>

                </div>
              </SwiperSlide>
            })}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
