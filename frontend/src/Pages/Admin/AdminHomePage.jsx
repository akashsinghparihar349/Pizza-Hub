import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrum from '../../Components/Breadcrum'
import AdminSidebar from '../../Components/Admin/AdminSidebar'
import Profile from '../../Components/User/Profile'
import { getDashboardStatsApi } from '../../Redux/Sagas/Service'

export default function AdminHomePage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')

    async function loadStats() {
        setLoading(true)
        try {
            const res = await getDashboardStatsApi()
            if (res.result === "Done" && res.data) {
                setStats(res.data)
            } else {
                setError(res.reason || "Failed to load dashboard metrics")
            }
        } catch (err) {
            setError(err.message || "Failed to fetch dashboard stats")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStats()
    }, [])

    return (
        <>
            <Breadcrum title="Admin Executive Dashboard" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-center bg-primary text-light p-3 mb-3 rounded shadow-sm">
                            <h4 className="mb-0 text-light">
                                <i className="bi bi-speedometer2 me-2"></i>PizzaHub Operations Center
                            </h4>
                            <div className="btn-group">
                                <button
                                    className={`btn btn-sm ${activeTab === 'overview' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    <i className="bi bi-bar-chart me-1"></i>Metrics Overview
                                </button>
                                <button
                                    className={`btn btn-sm ${activeTab === 'profile' ? 'btn-light text-primary fw-bold' : 'btn-outline-light'}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <i className="bi bi-person-badge me-1"></i>Admin Profile
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-light"
                                    onClick={loadStats}
                                    title="Refresh Data"
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                        </div>

                        {activeTab === 'profile' ? (
                            <div className="card shadow-sm border-0 p-4">
                                <h5 className="border-bottom pb-2 mb-3">Administrator Account Info</h5>
                                <Profile />
                            </div>
                        ) : (
                            <div>
                                {loading && (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <div className="mt-2 text-muted">Aggregating system statistics...</div>
                                    </div>
                                )}

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                                    </div>
                                )}

                                {stats && (
                                    <>
                                        {/* Top KPI Cards */}
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-3 col-sm-6">
                                                <div className="card shadow-sm border-0 bg-primary text-white p-3 h-100">
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <div className="text-white-50 small text-uppercase fw-bold">Total Revenue</div>
                                                            <h3 className="mb-0 fw-bold mt-1 text-white">₹{stats.revenue?.totalRevenue?.toLocaleString('en-IN') || 0}</h3>
                                                            <small className="text-white-50">{stats.revenue?.paidOrdersCount || 0} paid orders</small>
                                                        </div>
                                                        <i className="bi bi-currency-rupee fs-1 text-white-50"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-3 col-sm-6">
                                                <div className="card shadow-sm border-0 bg-success text-white p-3 h-100">
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <div className="text-white-50 small text-uppercase fw-bold">Total Orders</div>
                                                            <h3 className="mb-0 fw-bold mt-1 text-white">{stats.orders?.totalOrders || 0}</h3>
                                                            <Link to="/admin/checkout" className="text-white text-decoration-underline small">Manage Orders &rarr;</Link>
                                                        </div>
                                                        <i className="bi bi-bag-check fs-1 text-white-50"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-3 col-sm-6">
                                                <div className="card shadow-sm border-0 bg-warning text-dark p-3 h-100">
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <div className="text-muted small text-uppercase fw-bold">Pending Partners</div>
                                                            <h3 className="mb-0 fw-bold mt-1">{stats.users?.pendingRestaurantsCount || 0}</h3>
                                                            <Link to="/admin/restaurant" className="text-dark text-decoration-underline small">Review Applications &rarr;</Link>
                                                        </div>
                                                        <i className="bi bi-shop fs-1 text-muted"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-3 col-sm-6">
                                                <div className="card shadow-sm border-0 bg-danger text-white p-3 h-100">
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <div className="text-white-50 small text-uppercase fw-bold">Low-Stock Raw Items</div>
                                                            <h3 className="mb-0 fw-bold mt-1 text-white">{stats.inventory?.lowStockIngredientsCount || 0}</h3>
                                                            <Link to="/admin/inventory" className="text-white text-decoration-underline small">Check Inventory &rarr;</Link>
                                                        </div>
                                                        <i className="bi bi-exclamation-octagon fs-1 text-white-50"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Distribution & User Breakdown */}
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-7">
                                                <div className="card shadow-sm border-0 p-3 h-100">
                                                    <h6 className="fw-bold mb-3"><i className="bi bi-pie-chart me-2 text-primary"></i>Live Order Status Breakdown</h6>
                                                    <div className="row g-2 text-center">
                                                        <div className="col-4">
                                                            <div className="p-2 border rounded bg-light">
                                                                <span className="badge bg-secondary mb-1">Placed</span>
                                                                <h5 className="mb-0">{stats.orders?.byStatus?.['Order Placed'] || 0}</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="p-2 border rounded bg-light">
                                                                <span className="badge bg-info mb-1">Accepted</span>
                                                                <h5 className="mb-0">{stats.orders?.byStatus?.['Accepted'] || 0}</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="p-2 border rounded bg-light">
                                                                <span className="badge bg-primary mb-1">Preparing</span>
                                                                <h5 className="mb-0">{stats.orders?.byStatus?.['Preparing'] || 0}</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="p-2 border rounded bg-light">
                                                                <span className="badge bg-warning text-dark mb-1">Out For Delivery</span>
                                                                <h5 className="mb-0">{stats.orders?.byStatus?.['Out for Delivery'] || 0}</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="p-2 border rounded bg-light">
                                                                <span className="badge bg-success mb-1">Delivered</span>
                                                                <h5 className="mb-0">{stats.orders?.byStatus?.['Delivered'] || 0}</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="p-2 border rounded bg-light">
                                                                <span className="badge bg-danger mb-1">Cancelled</span>
                                                                <h5 className="mb-0">{stats.orders?.byStatus?.['Cancelled'] || 0}</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-5">
                                                <div className="card shadow-sm border-0 p-3 h-100">
                                                    <h6 className="fw-bold mb-3"><i className="bi bi-people me-2 text-primary"></i>Platform Demographics</h6>
                                                    <ul className="list-group list-group-flush">
                                                        <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                            <span>Registered Buyers</span>
                                                            <span className="badge bg-primary rounded-pill">{stats.users?.buyersCount || 0}</span>
                                                        </li>
                                                        <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                            <span>Active Partner Outlets</span>
                                                            <span className="badge bg-success rounded-pill">{stats.users?.restaurantsCount || 0}</span>
                                                        </li>
                                                        <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                            <span>Total Menu Pizzas</span>
                                                            <span className="badge bg-info text-dark rounded-pill">{stats.inventory?.totalProducts || 0}</span>
                                                        </li>
                                                        <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                            <span>Out-of-Stock Pizzas</span>
                                                            <span className={`badge ${stats.inventory?.outOfStockProducts > 0 ? 'bg-danger' : 'bg-secondary'} rounded-pill`}>
                                                                {stats.inventory?.outOfStockProducts || 0}
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Orders Table */}
                                        <div className="card shadow-sm border-0 p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2 text-primary"></i>Recent Real-Time Orders</h6>
                                                <Link to="/admin/checkout" className="btn btn-sm btn-outline-primary">View All Orders</Link>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-sm align-middle text-dark mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Order ID</th>
                                                            <th>Customer</th>
                                                            <th>Amount</th>
                                                            <th>Payment Status</th>
                                                            <th>Order Status</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {stats.recentOrders && stats.recentOrders.length > 0 ? (
                                                            stats.recentOrders.map(ord => (
                                                                <tr key={ord._id}>
                                                                    <td><small className="font-monospace">{ord._id}</small></td>
                                                                    <td>{ord.deliveryAddress?.name || ord.user?.name || "Customer"}</td>
                                                                    <td><strong>₹{ord.total}</strong></td>
                                                                    <td>
                                                                        <span className={`badge ${ord.paymentStatus === 'Done' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                                            {ord.paymentStatus}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-primary">{ord.orderStatus}</span>
                                                                    </td>
                                                                    <td><small className="text-muted">{new Date(ord.createdAt).toLocaleString()}</small></td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6" className="text-center text-muted py-3">No orders recorded yet</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
