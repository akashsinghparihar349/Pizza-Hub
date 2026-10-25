import { Link } from 'react-router-dom'

export default function SingleProduct({ item, title }) {
    const imgSrc = (item?.pic && item.pic.length > 0 && item.pic[0]) 
        ? `${import.meta.env.VITE_APP_IMAGE_SERVER}${item.pic[0]}` 
        : '/images/pizza_farmhouse.jpg'

    return (
        <div className={`col-md-6 ${title && title === 'shop' ? 'col-xl-4' : 'col-xl-3'}`}>
            <div className="product-item rounded wow fadeInUp" data-wow-delay="0.1s">
                <div className="product-item-inner border rounded">
                    <div className="product-item-inner-item">
                        <img src={imgSrc} style={{ height: 400, objectFit: "cover" }} className="img-fluid w-100 rounded-top" alt={item?.name || "Product"} />
                        <div className="product-new" style={{ backgroundColor: item.isVeg !== false ? '#198754' : '#dc3545' }}>
                            {item.isVeg !== false ? '🟢 Veg' : '🔴 Non-Veg'}
                        </div>
                        <div className="product-details">
                            <Link to={`/product/${item._id}`}><i className="fa fa-eye fa-1x"></i></Link>
                        </div>
                    </div>
                    <div className="text-center rounded-bottom p-4">
                        <Link to={`/product/${item._id}`} className="d-block mb-2 text-muted">{item.maincategory?.name || "Pizza"} • {item.crust || "Classic Crust"}</Link>
                        <Link to={`/product/${item._id}`} className="d-block h4">{item.name}</Link>
                        
                        {/* Authentic Pizza Size Badges */}
                        <div className="d-flex flex-wrap justify-content-center gap-1 my-2">
                            {(item.sizePrices?.length > 0 
                                ? item.sizePrices.map(sp => `${sp.size}${sp.inches ? ` (${sp.inches}")` : ''}`)
                                : (Array.isArray(item.size) && item.size.length > 0 ? item.size : ['Small', 'Medium', 'Large'])
                            ).map((sz, idx) => (
                                <span key={idx} className="badge bg-light text-secondary border px-2 py-1" style={{ fontSize: '0.72rem' }}>
                                    {sz}
                                </span>
                            ))}
                        </div>

                        <div className="mt-2">
                            {item.sizePrices?.length > 1 ? (
                                <span className="text-primary fs-5 fw-bold">
                                    From &#8377;{Math.min(...item.sizePrices.map(sp => sp.price || item.finalPrice))}
                                </span>
                            ) : (
                                <>
                                    <del className="me-2 fs-5 text-muted">&#8377;{item.basePrice}</del>
                                    <span className="text-primary fs-5 fw-bold">&#8377;{item.finalPrice}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div
                    className="product-item-add border border-top-0 rounded-bottom text-center p-4 pt-3">
                    <Link to={`/product/${item._id}`}
                        className="btn btn-primary border-secondary rounded-pill py-2 px-4 mb-4"><i
                            className="fas fa-shopping-cart me-2"></i> Add To Cart</Link>
                </div>
            </div>
        </div>
    )
}
