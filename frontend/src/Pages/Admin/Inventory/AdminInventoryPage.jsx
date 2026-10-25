import { useEffect, useState } from 'react'
import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import {
    getInventoryApi,
    createInventoryApi,
    updateInventoryApi,
    adjustInventoryApi,
    checkInventoryAlertsApi,
    deleteInventoryApi
} from '../../../Redux/Sagas/Service'

export default function AdminInventoryPage() {
    let [items, setItems] = useState([])
    let [loading, setLoading] = useState(false)
    let [filterLowStock, setFilterLowStock] = useState(false)
    let [message, setMessage] = useState("")

    // Modals state
    let [showCreateModal, setShowCreateModal] = useState(false)
    let [showAdjustModal, setShowAdjustModal] = useState(false)
    let [showEditModal, setShowEditModal] = useState(false)
    let [selectedItem, setSelectedItem] = useState(null)

    let [createForm, setCreateForm] = useState({
        name: "",
        quantity: 0,
        unit: "portions",
        lowStockThreshold: 10,
        status: true
    })

    let [adjustForm, setAdjustForm] = useState({
        adjustment: 0,
        reason: "Daily Restock"
    })

    let [editForm, setEditForm] = useState({
        name: "",
        quantity: 0,
        unit: "portions",
        lowStockThreshold: 10,
        status: true
    })

    async function loadInventory(lowOnly = filterLowStock) {
        setLoading(true)
        const query = lowOnly ? "lowStock=true" : ""
        const res = await getInventoryApi(query)
        if (res.result === "Done" && res.data) {
            setItems(res.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadInventory()
    }, [filterLowStock])

    async function handleCheckAlerts() {
        setLoading(true)
        const res = await checkInventoryAlertsApi()
        if (res.result === "Done") {
            setMessage(`Low stock check complete! Found ${res.data?.count || 0} items at or below threshold.`)
            await loadInventory()
        } else {
            alert(res.reason || "Failed to trigger alerts check")
        }
        setLoading(false)
    }

    async function handleCreate(e) {
        e.preventDefault()
        const payload = {
            name: createForm.name.trim(),
            quantity: Number(createForm.quantity) || 0,
            unit: createForm.unit,
            lowStockThreshold: Number(createForm.lowStockThreshold) || 10,
            status: createForm.status
        }
        const res = await createInventoryApi(payload)
        if (res.result === "Done") {
            setShowCreateModal(false)
            setCreateForm({ name: "", quantity: 0, unit: "portions", lowStockThreshold: 10, status: true })
            await loadInventory()
        } else {
            alert(res.reason || "Failed to create inventory item")
        }
    }

    async function handleAdjust(e) {
        e.preventDefault()
        if (!selectedItem) return
        const adjustmentVal = Number(adjustForm.adjustment)
        if (isNaN(adjustmentVal) || adjustmentVal === 0) {
            alert("Please enter a non-zero adjustment (+ to add, - to subtract)")
            return
        }

        const res = await adjustInventoryApi({
            ingredientId: selectedItem._id,
            adjustment: adjustmentVal,
            reason: adjustForm.reason
        })

        if (res.result === "Done") {
            setShowAdjustModal(false)
            setSelectedItem(null)
            await loadInventory()
        } else {
            alert(res.reason || "Failed to adjust stock")
        }
    }

    async function handleEdit(e) {
        e.preventDefault()
        if (!selectedItem) return

        const res = await updateInventoryApi(selectedItem._id, {
            name: editForm.name,
            quantity: Number(editForm.quantity) || 0,
            unit: editForm.unit,
            lowStockThreshold: Number(editForm.lowStockThreshold) || 10,
            status: editForm.status
        })

        if (res.result === "Done") {
            setShowEditModal(false)
            setSelectedItem(null)
            await loadInventory()
        } else {
            alert(res.reason || "Failed to update item")
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this tracked ingredient?")) return
        const res = await deleteInventoryApi(id)
        if (res.result === "Done") {
            await loadInventory()
        } else {
            alert(res.reason || "Failed to delete item")
        }
    }

    function openAdjust(item) {
        setSelectedItem(item)
        setAdjustForm({ adjustment: 10, reason: "Restock replenishment" })
        setShowAdjustModal(true)
    }

    function openEdit(item) {
        setSelectedItem(item)
        setEditForm({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            lowStockThreshold: item.lowStockThreshold,
            status: item.status !== false
        })
        setShowEditModal(true)
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
                        <div className="d-flex flex-wrap justify-content-between align-items-center bg-primary text-light p-2 mb-3">
                            <h5 className="mb-0 text-light">Raw Ingredient Inventory Management</h5>
                            <div className="d-flex gap-2">
                                <button className="btn btn-warning btn-sm fw-bold" onClick={handleCheckAlerts}>
                                    <i className="bi bi-bell-fill me-1"></i> Scan Low-Stock Alerts
                                </button>
                                <button className="btn btn-light btn-sm text-primary fw-bold" onClick={() => setShowCreateModal(true)}>
                                    <i className="bi bi-plus-circle me-1"></i> Add Raw Ingredient
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="alert alert-info alert-dismissible fade show" role="alert">
                                {message}
                                <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                            </div>
                        )}

                        {/* Filter Bar */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <button 
                                    className={`btn btn-sm me-2 ${!filterLowStock ? 'btn-primary' : 'btn-outline-primary'}`} 
                                    onClick={() => setFilterLowStock(false)}
                                >
                                    All Ingredients ({items.length})
                                </button>
                                <button 
                                    className={`btn btn-sm ${filterLowStock ? 'btn-danger' : 'btn-outline-danger'}`} 
                                    onClick={() => setFilterLowStock(true)}
                                >
                                    <i className="bi bi-exclamation-triangle-fill me-1"></i> Low Stock Warning Only
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Ingredient Name</th>
                                            <th>Current Quantity</th>
                                            <th>Unit</th>
                                            <th>Threshold</th>
                                            <th>Stock Health</th>
                                            <th>Status</th>
                                            <th style={{ width: "170px" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items && items.length > 0 ? (
                                            items.map(item => {
                                                const isLow = item.quantity <= item.lowStockThreshold
                                                return (
                                                    <tr key={item._id} className={isLow ? "table-danger" : ""}>
                                                        <td><strong>{item.name}</strong></td>
                                                        <td>
                                                            <span className={`fs-6 fw-bold ${isLow ? "text-danger" : "text-success"}`}>
                                                                {item.quantity}
                                                            </span>
                                                        </td>
                                                        <td><small className="badge bg-secondary">{item.unit}</small></td>
                                                        <td>{item.lowStockThreshold} {item.unit}</td>
                                                        <td>
                                                            {isLow ? (
                                                                <span className="badge bg-danger">
                                                                    <i className="bi bi-exclamation-circle me-1"></i> LOW STOCK
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-success">Healthy</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${item.status !== false ? "bg-info" : "bg-secondary"}`}>
                                                                {item.status !== false ? "Active" : "Disabled"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-success me-1" 
                                                                title="Quick Adjust Stock"
                                                                onClick={() => openAdjust(item)}
                                                            >
                                                                <i className="bi bi-plus-slash-minus"></i> Stock
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary me-1" 
                                                                title="Edit Ingredient"
                                                                onClick={() => openEdit(item)}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger" 
                                                                title="Delete Ingredient"
                                                                onClick={() => handleDelete(item._id)}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4 text-muted">
                                                    No ingredients found matching the criteria. Click "Add Raw Ingredient" to track inventory.
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

            {/* Modal: Create Ingredient */}
            {showCreateModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleCreate}>
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Track New Raw Ingredient</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Ingredient Name*</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={createForm.name} 
                                            onChange={e => setCreateForm({ ...createForm, name: e.target.value })} 
                                            required 
                                            placeholder="e.g. Mozzarella Cheese Block, Pizza Dough, Bell Peppers"
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Initial Quantity*</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={createForm.quantity} 
                                                onChange={e => setCreateForm({ ...createForm, quantity: e.target.value })} 
                                                min="0"
                                                required 
                                            />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Measurement Unit</label>
                                            <select 
                                                className="form-select" 
                                                value={createForm.unit} 
                                                onChange={e => setCreateForm({ ...createForm, unit: e.target.value })}
                                            >
                                                <option value="portions">portions</option>
                                                <option value="units">units</option>
                                                <option value="grams">grams</option>
                                                <option value="kg">kg</option>
                                                <option value="ml">ml</option>
                                                <option value="liters">liters</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Low-Stock Alert Threshold*</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={createForm.lowStockThreshold} 
                                            onChange={e => setCreateForm({ ...createForm, lowStockThreshold: e.target.value })} 
                                            min="0"
                                            required 
                                        />
                                        <small className="text-muted">An automated alert email triggers when stock drops to or below this level.</small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Ingredient</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Adjust Stock */}
            {showAdjustModal && selectedItem && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleAdjust}>
                                <div className="modal-header bg-success text-white">
                                    <h5 className="modal-title">Manual Stock Adjustment</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowAdjustModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p className="mb-2"><strong>Ingredient:</strong> {selectedItem.name}</p>
                                    <p className="mb-3"><strong>Current Stock:</strong> {selectedItem.quantity} {selectedItem.unit}</p>

                                    <div className="mb-3">
                                        <label className="form-label">Stock Change (Adjustment)*</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={adjustForm.adjustment} 
                                            onChange={e => setAdjustForm({ ...adjustForm, adjustment: e.target.value })} 
                                            required 
                                        />
                                        <small className="text-muted">Enter positive number to replenish (e.g. +20) or negative number for waste/spoilage (e.g. -5).</small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Reason for Adjustment</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={adjustForm.reason} 
                                            onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })} 
                                            placeholder="e.g. Supplier delivery, Kitchen waste, Audit reconciliation"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success">Apply Adjustment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Edit Ingredient */}
            {showEditModal && selectedItem && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleEdit}>
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Edit Ingredient Details</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Ingredient Name*</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={editForm.name} 
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Quantity*</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={editForm.quantity} 
                                                onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} 
                                                min="0"
                                                required 
                                            />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label">Unit</label>
                                            <select 
                                                className="form-select" 
                                                value={editForm.unit} 
                                                onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                                            >
                                                <option value="portions">portions</option>
                                                <option value="units">units</option>
                                                <option value="grams">grams</option>
                                                <option value="kg">kg</option>
                                                <option value="ml">ml</option>
                                                <option value="liters">liters</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Low Stock Threshold</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={editForm.lowStockThreshold} 
                                            onChange={e => setEditForm({ ...editForm, lowStockThreshold: e.target.value })} 
                                            min="0"
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
