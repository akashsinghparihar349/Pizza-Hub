import { useState } from 'react'
import SingleProduct from './SingleProduct'

export default function Products({ maincategory, data }) {
    let [selected, setSelected] = useState("")
    return (
        <>
            <div className="container-fluid product py-5">
                <div className="container py-5">
                    <div className="tab-class">
                        <div className="row g-4">
                            <div className="col-lg-4 text-start wow fadeInLeft" data-wow-delay="0.1s">
                                <h1>Our Products</h1>
                            </div>
                            <div className="col-lg-8 text-end wow fadeInRight" data-wow-delay="0.1s">
                                <ul className="nav nav-pills d-inline-flex text-center mb-5">
                                    <li className="nav-item mb-4">
                                        <button className={`d-flex mx-2 py-2 border border-dark rounded-pill btn ${selected === "" ? 'btn-primary' : 'btn-light'}`} onClick={() => setSelected("")}>
                                            <span style={{ width: "100px" }}>All Products</span>
                                        </button>
                                    </li>
                                    {maincategory.map(item => {
                                        return <li key={item._id} className="nav-item mb-4">
                                            <button className={`d-flex mx-2 py-2 border border-dark rounded-pill btn ${selected === item.name ? 'btn-primary' : 'btn-light'}`} onClick={() => setSelected(item.name)}>
                                                <span style={{ width: "100px" }}>{item.name}</span>
                                            </button>
                                        </li>
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className="tab-content">
                            <div id="tab-1" className="tab-pane fade show p-0 active">
                                <div className="row g-4">
                                    {data.filter(x => selected === "" || x.maincategory?.name === selected).slice(0, 24).map(item => {
                                        return <SingleProduct key={item._id} item={item} />
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
