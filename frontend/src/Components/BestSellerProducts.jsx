import React from 'react'
import SingleProduct2 from './SingleProduct2'

export default function BestSellerProducts({ data }) {
    return (
        <div className="container-fluid products pb-5">
            <div className="container products-mini py-5">
                <div className="mx-auto text-center mb-5" style={{ maxWidth: "700px" }}>
                    <h4 className="text-primary mb-4 border-bottom border-primary border-2 d-inline-block p-2 title-border-radius wow fadeInUp"
                        data-wow-delay="0.1s">Bestseller Pizzas</h4>
                    <p className="mb-0 wow fadeInUp" data-wow-delay="0.2s">Discover our chef-crafted bestselling pizzas loved by thousands of happy food lovers. From classic wood-fired Margheritas to loaded gourmet specialties, baked fresh to golden perfection and delivered piping hot.</p>
                </div>
                <div className="row g-4">
                    {data.map(item => {
                        return <div key={item._id} className="col-md-6 col-lg-6 col-xl-4 wow fadeInUp" data-wow-delay="0.1s">
                           <SingleProduct2 item={item}/>
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}
