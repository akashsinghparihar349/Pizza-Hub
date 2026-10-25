import { Link } from 'react-router-dom'

export default function SingleProduct2({ item }) {
    const imgSrc = (item?.pic && item.pic.length > 0 && item.pic[0]) 
        ? `${import.meta.env.VITE_APP_IMAGE_SERVER}${item.pic[0]}` 
        : '/images/pizza_farmhouse.jpg'

    return (
        <div className="productImg-carousel productList-item">
            <div className="productImg-item products-mini-item border">
                <div className="row g-0">
                    <div className="col-5">
                        <div className="products-mini-img border-end h-100">
                            <img src={imgSrc} style={{ height: 180, objectFit: "cover" }} className="img-fluid w-100" alt={item?.name || "Product"} />
                            <div className="products-mini-icon rounded-circle bg-primary">
                                <Link to={`/product/${item._id}`}><i className="fa fa-eye fa-1x text-white"></i></Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-7">
                        <div className="products-mini-content p-3">
                            <Link to={`/product/${item._id}`} className="d-block mb-1 text-muted">{item.isVeg !== false ? '🟢 Pure Veg' : '🔴 Non-Veg'} • {item.crust || "Classic Hand Tossed"}</Link>
                            <Link to={`/product/${item._id}`} className="d-block h5 mb-1">{item.name}</Link>
                            
                            {/* Pizza Sizes */}
                            <div className="d-flex flex-wrap gap-1 my-1">
                                {(item.sizePrices?.length > 0 
                                    ? item.sizePrices.map(sp => `${sp.size}${sp.inches ? ` (${sp.inches}")` : ''}`)
                                    : (Array.isArray(item.size) && item.size.length > 0 ? item.size : ['Small', 'Medium', 'Large'])
                                ).slice(0, 3).map((sz, idx) => (
                                    <span key={idx} className="badge bg-light text-secondary border px-1" style={{ fontSize: '0.68rem' }}>
                                        {sz}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-1">
                                {item.sizePrices?.length > 1 ? (
                                    <span className="text-primary fs-6 fw-bold">
                                        From &#8377;{Math.min(...item.sizePrices.map(sp => sp.price || item.finalPrice))}
                                    </span>
                                ) : (
                                    <>
                                        <del className="me-2 fs-6 text-muted">&#8377;{item.basePrice}</del>
                                        <span className="text-primary fs-6 fw-bold">&#8377;{item.finalPrice}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="products-mini-add border p-3">
                    <Link to={`/product/${item._id}`} className="btn btn-primary border-secondary rounded-pill py-2 px-4"><i
                        className="fas fa-shopping-cart me-2"></i> Add To Cart</Link>
                    <div className="d-flex">
                        <div
                            className="text-primary d-flex align-items-center justify-content-center me-3">
                            {item.stock ? `${item.stockQuantity} Quantity Left in Stock` : "Out Of Stock"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
