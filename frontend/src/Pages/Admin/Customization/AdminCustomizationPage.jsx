import { useEffect, useState } from 'react'
import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import {
    getCustomizationOptionsApi,
    seedCustomizationOptionsApi,
    createCustomizationOptionApi,
    updateCustomizationOptionApi,
    deleteCustomizationOptionApi
} from '../../../Redux/Sagas/Service'

const initialOptionState = {
    name: "",
    type: "base",
    price: 0,
    description: "",
    inStock: true,
    status: true
}

export default function AdminCustomizationPage() {
    let [activeTab, setActiveTab] = useState("base")
    let [options, setOptions] = useState({ bases: [], sauces: [], cheeses: [], veggies: [] })
    let [loading, setLoading] = useState(false)
    let [message, setMessage] = useState("")

    let [showModal, setShowModal] = useState(false)
    let [isEditing, setIsEditing] = useState(false)
    let [editId, setEditId] = useState(null)
    let [form, setForm] = useState({ ...initialOptionState })

    async function loadOptions() {
        setLoading(true)
        const res = await getCustomizationOptionsApi()
        if (res.result === "Done" && res.data) {
            setOptions(res.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadOptions()
    }, [])

    async function handleSeed() {
        if (!window.confirm("Seed default crust bases, sauces, cheeses, and vegetable toppings into database?")) return
        setLoading(true)
        const res = await seedCustomizationOptionsApi()
        if (res.result === "Done") {
            setMessage("Default pizza toppings & options seeded successfully!")
            await loadOptions()
        } else {
            alert(res.reason || "Failed to seed options")
        }
        setLoading(false)
    }

    function openCreate(type) {
        setIsEditing(false)
        setEditId(null)
        setForm({ ...initialOptionState, type })
        setShowModal(true)
    }

    function openEdit(item) {
        setIsEditing(true)
        setEditId(item._id)
        setForm({
            name: item.name,
            type: item.type,
            price: item.price,
            description: item.description || "",
            inStock: item.inStock !== false,
            status: item.status !== false
        })
        setShowModal(true)
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to remove this customization item?")) return
        const res = await deleteCustomizationOptionApi(id)
        if (res.result === "Done") {
            await loadOptions()
        } else {
            alert(res.reason || "Failed to delete item")
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name.trim()) {
            alert("Name is required")
            return
        }

        const payload = {
            name: form.name.trim(),
            type: form.type,
            price: Number(form.price) || 0,
            description: form.description,
            inStock: form.inStock,
            status: form.status
        }

        let res
        if (isEditing) {
            res = await updateCustomizationOptionApi(editId, payload)
        } else {
            res = await createCustomizationOptionApi(payload)
        }

        if (res.result === "Done") {
            setShowModal(false)
            await loadOptions()
        } else {
            alert(res.reason || "Failed to save option")
        }
    }

    const currentList = activeTab === "base" ? options.bases :
        activeTab === "sauce" ? options.sauces :
        activeTab === "cheese" ? options.cheeses : options.veggies

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
                            <h5 className="mb-0 text-light">Pizza Customization Options & Toppings</h5>
                            <div>
                                <button className="btn btn-warning btn-sm me-2 fw-bold" onClick={handleSeed}>
                                    <i className="bi bi-magic me-1"></i> Seed Default Options
                                </button>
                                <button className="btn btn-light btn-sm text-primary fw-bold" onClick={() => openCreate(activeTab)}>
                                    <i className="bi bi-plus-circle me-1"></i> Add New {activeTab.toUpperCase()}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                {message}
                                <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                            </div>
                        )}

                        {/* Navigation Tabs */}
                        <ul className="nav nav-pills mb-3">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'base' ? 'active' : ''}`} 
                                    onClick={() => setActiveTab('base')}
                                >
                                    🍕 Crust Bases ({options.bases?.length || 0})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'sauce' ? 'active' : ''}`} 
                                    onClick={() => setActiveTab('sauce')}
                                >
                                    🍅 Sauces ({options.sauces?.length || 0})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'cheese' ? 'active' : ''}`} 
                                    onClick={() => setActiveTab('cheese')}
                                >
                                    🧀 Cheeses ({options.cheeses?.length || 0})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'veggie' ? 'active' : ''}`} 
                                    onClick={() => setActiveTab('veggie')}
                                >
                                    🫑 Veggies & Toppings ({options.veggies?.length || 0})
                                </button>
                            </li>
                        </ul>

                        {/* Options Table */}
                        {loading ? (
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Extra Price</th>
                                            <th>Description</th>
                                            <th>In Stock</th>
                                            <th>Status</th>
                                            <th style={{ width: "120px" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentList && currentList.length > 0 ? (
                                            currentList.map(item => (
                                                <tr key={item._id}>
                                                    <td><strong>{item.name}</strong></td>
                                                    <td>
                                                        {item.price > 0 ? (
                                                            <span className="badge bg-primary fs-6">+&#8377;{item.price}</span>
                                                        ) : (
                                                            <span className="badge bg-success">Included (₹0)</span>
                                                        )}
                                                    </td>
                                                    <td><small className="text-muted">{item.description || "N/A"}</small></td>
                                                    <td>
                                                        <span className={`badge ${item.inStock !== false ? 'bg-success' : 'bg-danger'}`}>
                                                            {item.inStock !== false ? "In Stock" : "Out of Stock"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${item.status !== false ? 'bg-info' : 'bg-secondary'}`}>
                                                            {item.status !== false ? "Active" : "Disabled"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(item)}>
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item._id)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 text-muted">
                                                    No {activeTab} options found. Click "Seed Default Options" or "Add New" to populate.
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

            {/* Modal for Add / Edit */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">{isEditing ? "Edit Customization Item" : `Add New ${form.type.toUpperCase()}`}</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Name*</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={form.name} 
                                            onChange={e => setForm({ ...form, name: e.target.value })} 
                                            required 
                                            placeholder="e.g. Cheese Burst Crust, Jalapenos, BBQ Sauce"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Type</label>
                                        <select 
                                            className="form-select" 
                                            value={form.type} 
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                        >
                                            <option value="base">Crust Base</option>
                                            <option value="sauce">Sauce</option>
                                            <option value="cheese">Cheese</option>
                                            <option value="veggie">Veggie / Topping</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Extra Price (&#8377;)*</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={form.price} 
                                            onChange={e => setForm({ ...form, price: e.target.value })} 
                                            min="0"
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description (Optional)</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={form.description} 
                                            onChange={e => setForm({ ...form, description: e.target.value })} 
                                            placeholder="Short description"
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label">In Stock</label>
                                            <select 
                                                className="form-select" 
                                                value={form.inStock ? "1" : "0"} 
                                                onChange={e => setForm({ ...form, inStock: e.target.value === "1" })}
                                            >
                                                <option value="1">Yes</option>
                                                <option value="0">No</option>
                                            </select>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Status</label>
                                            <select 
                                                className="form-select" 
                                                value={form.status ? "1" : "0"} 
                                                onChange={e => setForm({ ...form, status: e.target.value === "1" })}
                                            >
                                                <option value="1">Active</option>
                                                <option value="0">Disabled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isEditing ? "Save Changes" : "Create Item"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
