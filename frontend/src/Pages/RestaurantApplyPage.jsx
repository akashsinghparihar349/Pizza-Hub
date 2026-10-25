import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrum from '../Components/Breadcrum'
import { applyRestaurantApi } from '../Redux/Sagas/Service'

export default function RestaurantApplyPage() {
    let [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pin: "",
        cuisine: "Pizza, Italian, Continental"
    })
    let [loading, setLoading] = useState(false)
    let [success, setSuccess] = useState(false)
    let [error, setError] = useState("")

    let navigate = useNavigate()

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!localStorage.getItem("token")) {
            navigate("/login")
            return
        }

        setLoading(true)
        setError("")

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: {
                street: form.street.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pin: form.pin.trim()
            },
            cuisine: form.cuisine.split(",").map(c => c.trim()).filter(Boolean)
        }

        const res = await applyRestaurantApi(payload)
        setLoading(false)

        if (res.result === "Done") {
            setSuccess(true)
        } else {
            setError(res.reason || "Failed to submit partnership application. Please try again.")
        }
    }

    return (
        <>
            <Breadcrum title="Partner With PizzaHub" />
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 p-4">
                            <div className="text-center mb-4">
                                <h2 className="text-primary fw-bold">Become a PizzaHub Restaurant Partner</h2>
                                <p className="text-muted">
                                    Grow your food business by joining our artisan pizza delivery network. Reach thousands of local pizza lovers daily!
                                </p>
                            </div>

                            {success ? (
                                <div className="alert alert-success text-center p-4">
                                    <h4 className="alert-heading fw-bold mb-2">🎉 Application Submitted Successfully!</h4>
                                    <p className="mb-3">
                                        Thank you for applying to become a partner. Our operations team is reviewing your restaurant details and will contact you via email or phone within 24–48 hours.
                                    </p>
                                    <button className="btn btn-primary" onClick={() => navigate("/profile")}>
                                        View Profile
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-bold">Restaurant / Outlet Name*</label>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                required 
                                                value={form.name} 
                                                onChange={handleChange} 
                                                placeholder="e.g. Mario's Woodfired Pizzeria" 
                                                className="form-control" 
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Official Email*</label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                required 
                                                value={form.email} 
                                                onChange={handleChange} 
                                                placeholder="partner@restaurant.com" 
                                                className="form-control" 
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Phone Number*</label>
                                            <input 
                                                type="text" 
                                                name="phone" 
                                                required 
                                                value={form.phone} 
                                                onChange={handleChange} 
                                                placeholder="10-digit mobile or contact" 
                                                className="form-control" 
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-bold">Street Address</label>
                                            <input 
                                                type="text" 
                                                name="street" 
                                                value={form.street} 
                                                onChange={handleChange} 
                                                placeholder="Shop / Unit number, street, landmark" 
                                                className="form-control" 
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">City*</label>
                                            <input 
                                                type="text" 
                                                name="city" 
                                                required 
                                                value={form.city} 
                                                onChange={handleChange} 
                                                placeholder="City name" 
                                                className="form-control" 
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">State</label>
                                            <input 
                                                type="text" 
                                                name="state" 
                                                value={form.state} 
                                                onChange={handleChange} 
                                                placeholder="State name" 
                                                className="form-control" 
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">PIN Code*</label>
                                            <input 
                                                type="text" 
                                                name="pin" 
                                                required 
                                                value={form.pin} 
                                                onChange={handleChange} 
                                                placeholder="6-digit PIN" 
                                                className="form-control" 
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-bold">Cuisines / Specialties (Comma-separated)</label>
                                            <input 
                                                type="text" 
                                                name="cuisine" 
                                                value={form.cuisine} 
                                                onChange={handleChange} 
                                                placeholder="e.g. Pizza, Italian, Garlic Breads, Calzones" 
                                                className="form-control" 
                                            />
                                        </div>

                                        <div className="col-12 mt-4">
                                            <button 
                                                type="submit" 
                                                disabled={loading} 
                                                className="btn btn-primary w-100 py-3 fw-bold fs-5"
                                            >
                                                {loading ? "Submitting Application..." : "Submit Partner Application"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
