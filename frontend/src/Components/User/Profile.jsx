import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyUserEmailApi } from '../../Redux/Sagas/Service'

export default function Profile() {
    let [data, setData] = useState({})
    let [otp, setOtp] = useState("")
    let [showOtpModal, setShowOtpModal] = useState(false)
    let [statusMsg, setStatusMsg] = useState(null)
    let [loading, setLoading] = useState(false)
    let navigate = useNavigate()

    async function fetchUser() {
        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${localStorage.getItem("userid")}`, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token")
            }
        })
        response = await response.json()
        if (response.result === "Done")
            setData(response.data)
        else
            navigate("/login")
    }

    async function handleVerifyOtp(e) {
        e.preventDefault()
        setLoading(true)
        setStatusMsg(null)
        try {
            const res = await verifyUserEmailApi(data.email, otp)
            if (res.result === "Done") {
                setStatusMsg({ type: "success", text: "Email verified successfully!" })
                setData(prev => ({ ...prev, isEmailVerified: true }))
                setTimeout(() => setShowOtpModal(false), 1500)
            } else {
                setStatusMsg({ type: "danger", text: res.reason || "Invalid OTP code" })
            }
        } catch (err) {
            setStatusMsg({ type: "danger", text: err.message || "Verification failed" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <>
            <div className="card shadow-sm border-0 p-3">
                <table className='table table-bordered text-dark align-middle mb-0'>
                    <tbody>
                        <tr>
                            <th style={{ width: "25%" }}>Full Name</th>
                            <td>{data.name}</td>
                        </tr>
                        <tr>
                            <th>Username</th>
                            <td>{data.username}</td>
                        </tr>
                        <tr>
                            <th>Email Address</th>
                            <td>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>{data.email}</span>
                                    {data.isEmailVerified ? (
                                        <span className="badge bg-success">
                                            <i className="bi bi-patch-check-fill me-1"></i>Verified
                                        </span>
                                    ) : (
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-warning text-dark">Unverified</span>
                                            <button 
                                                className="btn btn-sm btn-outline-primary py-0"
                                                onClick={() => setShowOtpModal(true)}
                                            >
                                                Verify Email
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Phone</th>
                            <td>{data.phone}</td>
                        </tr>
                        <tr>
                            <th>Account Role</th>
                            <td>
                                <span className="badge bg-primary">{data.role}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Email OTP Verification Modal */}
            <div className={`modal fade ${showOtpModal ? 'show d-block' : ''}`} id="emailVerifyModal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Verify Email Address</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowOtpModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p className="small text-muted mb-3">
                                Enter the verification OTP associated with your account <strong>{data.email}</strong> to verify your email.
                            </p>

                            {statusMsg && (
                                <div className={`alert alert-${statusMsg.type} py-2 small`} role="alert">
                                    {statusMsg.text}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">6-Digit OTP Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        className="form-control text-center fs-4 letter-spacing-2"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="btn btn-primary w-100">
                                    {loading ? "Verifying..." : "Confirm & Verify Email"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
