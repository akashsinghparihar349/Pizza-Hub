import { useEffect, useState } from 'react'
import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import {
    getRestaurantsAdminApi,
    approveRestaurantApi,
    rejectRestaurantApi
} from '../../../Redux/Sagas/Service'

export default function AdminRestaurantPage() {
    let [restaurants, setRestaurants] = useState([])
    let [loading, setLoading] = useState(false)
    let [message, setMessage] = useState("")

    let [showRejectModal, setShowRejectModal] = useState(false)
    let [selectedId, setSelectedId] = useState(null)
    let [rejectReason, setRejectReason] = useState("")

    async function loadRestaurants() {
        setLoading(true)
        const res = await getRestaurantsAdminApi()
        if (res.result === "Done" && res.data) {
            setRestaurants(res.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadRestaurants()
    }, [])

    async function handleApprove(id, name) {
        if (!window.confirm(`Approve restaurant partner '${name}' and grant 'Restaurant' partner role?`)) return
        setLoading(true)
        const res = await approveRestaurantApi(id)
        if (res.result === "Done") {
            setMessage(`Restaurant '${name}' approved successfully!`)
            await loadRestaurants()
        } else {
            alert(res.reason || "Failed to approve restaurant")
        }
        setLoading(false)
    }

    function openReject(id) {
        setSelectedId(id)
        setRejectReason("Documentation or kitchen inspection criteria not met.")
        setShowRejectModal(true)
    }

    async function handleRejectSubmit(e) {
        e.preventDefault()
        if (!selectedId) return
        setLoading(true)
        const res = await rejectRestaurantApi(selectedId, rejectReason)
        if (res.result === "Done") {
            setShowRejectModal(false)
            setMessage("Restaurant partner application rejected.")
            await loadRestaurants()
        } else {
            alert(res.reason || "Failed to reject application")
        }
        setLoading(false)
    }

    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-center bg-primary text-light p-2 mb-3">
                            <h5 className="mb-0 text-light">Restaurant Partner Applications & Onboarding</h5>
                        </div>

                        {message && (
                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                {message}
                                <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Restaurant Name</th>
                                            <th>Owner</th>
                                            <th>Contact</th>
                                            <th>City / Pin</th>
                                            <th>Cuisines</th>
                                            <th>Approval Status</th>
                                            <th style={{ width: "160px" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {restaurants && restaurants.length > 0 ? (
                                            restaurants.map(rest => (
                                                <tr key={rest._id}>
                                                    <td>
                                                        <strong>{rest.name}</strong>
                                                    </td>
                                                    <td>{rest.owner?.name || rest.owner?.username || "N/A"}</td>
                                                    <td>
                                                        <div><small>{rest.email}</small></div>
                                                        <div><small>{rest.phone}</small></div>
                                                    </td>
                                                    <td>{rest.address?.city || ""}, {rest.address?.pin || ""}</td>
                                                    <td>
                                                        {rest.cuisine?.map((c, i) => (
                                                            <span key={i} className="badge bg-light text-dark border me-1">{c}</span>
                                                        ))}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            rest.approvalStatus === "Approved" ? "bg-success" :
                                                            rest.approvalStatus === "Rejected" ? "bg-danger" : "bg-warning text-dark"
                                                        }`}>
                                                            {rest.approvalStatus}
                                                        </span>
                                                        {rest.rejectionReason && (
                                                            <div className="text-danger small mt-1">{rest.rejectionReason}</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {rest.approvalStatus === "Pending" ? (
                                                            <div className="btn-group btn-group-sm">
                                                                <button 
                                                                    className="btn btn-success" 
                                                                    onClick={() => handleApprove(rest._id, rest.name)}
                                                                >
                                                                    <i className="bi bi-check-lg"></i> Approve
                                                                </button>
                                                                <button 
                                                                    className="btn btn-danger" 
                                                                    onClick={() => openReject(rest._id)}
                                                                >
                                                                    <i className="bi bi-x-lg"></i> Reject
                                                                </button>
                                                            </div>
                                                        ) : rest.approvalStatus === "Approved" ? (
                                                            <span className="text-success small fw-bold"><i className="bi bi-shield-check"></i> Verified Partner</span>
                                                        ) : (
                                                            <button 
                                                                className="btn btn-sm btn-outline-success"
                                                                onClick={() => handleApprove(rest._id, rest.name)}
                                                            >
                                                                Re-approve
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4 text-muted">
                                                    No restaurant partner applications currently registered in the database.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleRejectSubmit}>
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-title">Reject Restaurant Application</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowRejectModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <label className="form-label">Reason for Rejection*</label>
                                    <textarea 
                                        className="form-control" 
                                        rows={3} 
                                        value={rejectReason} 
                                        onChange={e => setRejectReason(e.target.value)} 
                                        required 
                                        placeholder="Explain reason to the applicant..."
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-danger">Confirm Rejection</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
