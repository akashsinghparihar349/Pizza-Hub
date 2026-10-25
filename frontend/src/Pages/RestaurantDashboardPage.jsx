import { useEffect, useState } from 'react'
import Breadcrum from '../Components/Breadcrum'
import {
    getMyRestaurantApi,
    updateMyRestaurantApi,
    getMyRestaurantProductsApi,
    getMyRestaurantOrdersApi,
    updateMyRestaurantOrderStatusApi
} from '../Redux/Sagas/Service'

export default function RestaurantDashboardPage() {
    let [activeTab, setActiveTab] = useState("orders")
    let [restaurant, setRestaurant] = useState(null)
    let [products, setProducts] = useState([])
    let [orders, setOrders] = useState([])
    let [loading, setLoading] = useState(false)
    let [message, setMessage] = useState("")

    let [profileForm, setProfileForm] = useState({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pin: "",
        cuisine: ""
    })

    async function loadData() {
        setLoading(true)
        const [restRes, prodRes, ordRes] = await Promise.all([
            getMyRestaurantApi(),
            getMyRestaurantProductsApi(),
            getMyRestaurantOrdersApi()
        ])

        if (restRes.result === "Done" && restRes.data) {
            setRestaurant(restRes.data)
            setProfileForm({
                name: restRes.data.name || "",
                phone: restRes.data.phone || "",
                street: restRes.data.address?.street || "",
                city: restRes.data.address?.city || "",
                state: restRes.data.address?.state || "",
                pin: restRes.data.address?.pin || "",
                cuisine: Array.isArray(restRes.data.cuisine) ? restRes.data.cuisine.join(", ") : ""
            })
        }
        if (prodRes.result === "Done" && prodRes.data) {
            setProducts(prodRes.data)
        }
        if (ordRes.result === "Done" && ordRes.data) {
            setOrders(ordRes.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    async function handleStatusUpdate(orderId, newStatus) {
        setLoading(true)
        const res = await updateMyRestaurantOrderStatusApi(orderId, newStatus)
        if (res.result === "Done") {
            setMessage(`Order #${orderId} updated to '${newStatus}'`)
            const ordRes = await getMyRestaurantOrdersApi()
            if (ordRes.result === "Done") setOrders(ordRes.data)
        } else {
            alert(res.reason || "Failed to update order status")
        }
        setLoading(false)
    }

    async function handleProfileSave(e) {
        e.preventDefault()
        setLoading(true)
        const payload = {
            name: profileForm.name,
            phone: profileForm.phone,
            address: {
                street: profileForm.street,
                city: profileForm.city,
                state: profileForm.state,
                pin: profileForm.pin
            },
            cuisine: profileForm.cuisine.split(",").map(c => c.trim()).filter(Boolean)
        }
        const res = await updateMyRestaurantApi(payload)
        if (res.result === "Done") {
            setMessage("Restaurant profile updated successfully!")
            setRestaurant(res.data)
        } else {
            alert(res.reason || "Failed to update profile")
        }
        setLoading(false)
    }

    return (
        <>
            <Breadcrum title="Restaurant Partner Dashboard" />
            <div className="container-fluid my-4">
                <div className="row">
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 mb-3">
                            <div className="card-body text-center">
                                <i className="bi bi-shop text-primary fs-1 mb-2"></i>
                                <h5 className="fw-bold">{restaurant?.name || "My Restaurant"}</h5>
                                <span className={`badge ${restaurant?.approvalStatus === "Approved" ? "bg-success" : "bg-warning text-dark"}`}>
                                    {restaurant?.approvalStatus || "Partner"}
                                </span>
                                <div className="mt-3 text-start small">
                                    <p className="mb-1 text-muted"><strong>Email:</strong> {restaurant?.email}</p>
                                    <p className="mb-1 text-muted"><strong>Phone:</strong> {restaurant?.phone}</p>
                                    <p className="mb-1 text-muted"><strong>City:</strong> {restaurant?.address?.city}</p>
                                </div>
                            </div>
                        </div>

                        <div className="list-group shadow-sm">
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <i className="bi bi-receipt me-2"></i> Assigned Orders ({orders.length})
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'products' ? 'active' : ''}`}
                                onClick={() => setActiveTab('products')}
                            >
                                <i className="bi bi-box-seam me-2"></i> Our Menu Products ({products.length})
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <i className="bi bi-gear me-2"></i> Outlet Profile
                            </button>
                        </div>
                    </div>

                    <div className="col-md-9">
                        {message && (
                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                {message}
                                <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        )}

                        {/* ORDERS TAB */}
                        {!loading && activeTab === 'orders' && (
                            <div className="card border-0 shadow-sm p-3">
                                <h5 className="text-primary fw-bold mb-3">Incoming & Active Orders</h5>
                                {orders && orders.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Customer & Address</th>
                                                    <th>Items</th>
                                                    <th>Total</th>
                                                    <th>Current Status</th>
                                                    <th>Update Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(ord => (
                                                    <tr key={ord._id}>
                                                        <td><small className="fw-bold">{ord._id}</small></td>
                                                        <td>
                                                            <div><strong>{ord.deliveryAddress?.name}</strong></div>
                                                            <small className="text-muted">{ord.deliveryAddress?.phone}</small>
                                                            <div className="small">{ord.deliveryAddress?.address}, {ord.deliveryAddress?.city}</div>
                                                        </td>
                                                        <td>
                                                            {ord.products?.map((p, idx) => (
                                                                <div key={idx} className="small">
                                                                    • {p.name || p.product?.name} ({p.size}) x {p.quantity}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td><strong>&#8377;{ord.total}</strong></td>
                                                        <td>
                                                            <span className="badge bg-primary">{ord.orderStatus}</span>
                                                        </td>
                                                        <td>
                                                            <select 
                                                                className="form-select form-select-sm"
                                                                value={ord.orderStatus}
                                                                onChange={e => handleStatusUpdate(ord._id, e.target.value)}
                                                            >
                                                                <option value="Order Placed">Order Placed</option>
                                                                <option value="Accepted">Accepted</option>
                                                                <option value="Preparing">Preparing</option>
                                                                <option value="Out for Delivery">Out for Delivery</option>
                                                                <option value="Delivered">Delivered</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-1 mb-2 d-block"></i>
                                        No orders assigned to this restaurant outlet yet.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PRODUCTS TAB */}
                        {!loading && activeTab === 'products' && (
                            <div className="card border-0 shadow-sm p-3">
                                <h5 className="text-primary fw-bold mb-3">Restaurant Assigned Products</h5>
                                {products && products.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Pizza Name</th>
                                                    <th>Crust / Type</th>
                                                    <th>Sizes</th>
                                                    <th>Base Price</th>
                                                    <th>Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map(prod => (
                                                    <tr key={prod._id}>
                                                        <td><strong>{prod.name}</strong></td>
                                                        <td>{prod.crust || "Classic Hand Tossed"} ({prod.isVeg !== false ? "Veg" : "Non-Veg"})</td>
                                                        <td>{prod.size?.join(", ")}</td>
                                                        <td>&#8377;{prod.finalPrice || prod.basePrice}</td>
                                                        <td>
                                                            <span className={`badge ${prod.stock ? 'bg-success' : 'bg-danger'}`}>
                                                                {prod.stock ? `${prod.stockQuantity} in stock` : 'Out of stock'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-box fs-1 mb-2 d-block"></i>
                                        No exclusive products assigned to this restaurant yet. Contact platform admin to assign items.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PROFILE TAB */}
                        {!loading && activeTab === 'profile' && (
                            <div className="card border-0 shadow-sm p-4">
                                <h5 className="text-primary fw-bold mb-3">Manage Restaurant Profile</h5>
                                <form onSubmit={handleProfileSave}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Restaurant Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={profileForm.name} 
                                                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Phone</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={profileForm.phone} 
                                                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Street Address</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={profileForm.street} 
                                                onChange={e => setProfileForm({ ...profileForm, street: e.target.value })} 
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">City</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={profileForm.city} 
                                                onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">State</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={profileForm.state} 
                                                onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} 
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">PIN</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={profileForm.pin} 
                                                onChange={e => setProfileForm({ ...profileForm, pin: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Cuisines</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={profileForm.cuisine} 
                                                onChange={e => setProfileForm({ ...profileForm, cuisine: e.target.value })} 
                                            />
                                        </div>
                                        <div className="col-12 mt-3">
                                            <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
