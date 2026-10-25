import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserAddressesApi, addUserAddressApi, deleteUserAddressApi } from '../../Redux/Sagas/Service'

const inputOptions = {
  name: "",
  email: "",
  phone: "",
  address: "",
  pin: "",
  city: "",
  state: "",
}

export default function Address() {
  let [showModal, setShowModal] = useState(false)
  let [option, setOption] = useState({})
  let [addresses, setAddresses] = useState([])
  let [loading, setLoading] = useState(false)
  let [inputData, setInputData] = useState({ ...inputOptions })

  let navigate = useNavigate()

  async function loadAddresses() {
    setLoading(true)
    try {
      const res = await getUserAddressesApi()
      if (res.result === "Done" && Array.isArray(res.data)) {
        setAddresses(res.data)
      } else {
        // Fallback to reading from user record
        const userRes = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${localStorage.getItem("userid")}`, {
          headers: {
            "content-type": "application/json",
            "authorization": localStorage.getItem("token")
          }
        })
        const data = await userRes.json()
        if (data.result === "Done" && data.data?.address) {
          setAddresses(data.data.address)
        }
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false)
    }
  }

  function create() {
    setShowModal(true)
    setOption({ type: "Create" })
    setInputData({ ...inputOptions })
  }

  function update(index) {
    setShowModal(true)
    setOption({
      type: "Update",
      index: index
    })
    setInputData({ ...addresses[index] })
  }

  function getInputData(e) {
    let { name, value } = e.target
    setInputData({ ...inputData, [name]: value })
  }

  async function deleteRecord(index) {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const res = await deleteUserAddressApi(index)
        if (res.result === "Done" && Array.isArray(res.data)) {
          setAddresses(res.data)
        } else {
          // Fallback
          const updated = addresses.filter((_, idx) => idx !== index)
          await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${localStorage.getItem("userid")}`, {
            method: "PUT",
            headers: {
              "content-type": "application/json",
              "authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({ address: updated })
          })
          setAddresses(updated)
        }
      } catch (err) {
        alert("Failed to delete address: " + err.message)
      }
    }
  }

  async function postData(e) {
    e.preventDefault()
    try {
      if (option.type === "Create") {
        const res = await addUserAddressApi(inputData)
        if (res.result === "Done" && Array.isArray(res.data)) {
          setAddresses(res.data)
        } else {
          // Fallback to PUT /user/:id
          const updated = [...addresses, { ...inputData }]
          await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${localStorage.getItem("userid")}`, {
            method: "PUT",
            headers: {
              "content-type": "application/json",
              "authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({ address: updated })
          })
          setAddresses(updated)
        }
      } else {
        // Update existing address index
        const updated = addresses.map((addr, idx) => idx === option.index ? { ...inputData } : addr)
        await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${localStorage.getItem("userid")}`, {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "authorization": localStorage.getItem("token")
          },
          body: JSON.stringify({ address: updated })
        })
        setAddresses(updated)
      }
      setShowModal(false)
      setInputData(inputOptions)
    } catch (err) {
      alert("Failed to save address: " + err.message)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login")
      return
    }
    loadAddresses()
  }, [])

  return (
    <>
      <div>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h5 className="mb-0">Saved Delivery Addresses</h5>
          <button className='btn btn-primary btn-sm' onClick={create}>
            <i className="bi bi-plus-lg me-1"></i> Add New Address
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
            <span className="ms-2 small text-muted">Loading addresses...</span>
          </div>
        ) : (
          <div className="row g-3">
            {addresses && addresses.length > 0 ? (
              addresses.map((item, index) => {
                return (
                  <div className='col-md-6' key={index}>
                    <div className='card p-3 h-100 shadow-sm border position-relative'>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong className="text-primary">{item.name || "Default Contact"}</strong>
                        <div className='btn-group'>
                          <button className='btn btn-sm btn-outline-primary' title="Edit" onClick={() => update(index)}>
                            <i className='bi bi-pencil'></i>
                          </button>
                          <button className='btn btn-sm btn-outline-danger' title="Delete" onClick={() => deleteRecord(index)}>
                            <i className='bi bi-trash'></i>
                          </button>
                        </div>
                      </div>
                      <p className="mb-1 small text-muted"><i className="bi bi-envelope me-1"></i>{item.email} | <i className="bi bi-phone me-1"></i>{item.phone}</p>
                      <p className="mb-1 small"><i className="bi bi-geo-alt me-1 text-danger"></i>{item.address}</p>
                      <p className="mb-0 small text-muted">{item.city}, {item.state} - <strong>{item.pin}</strong></p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-12">
                <div className="card p-4 text-center text-muted">
                  <i className="bi bi-geo-alt fs-1 text-secondary mb-2"></i>
                  <p className="mb-2">No delivery addresses saved yet.</p>
                  <button className="btn btn-outline-primary btn-sm mx-auto" onClick={create}>Add Your First Address</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} id="exampleModal">
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">{option.type} Address</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={postData}>
                  <div className="row g-2">
                    <div className="col-12 mb-2">
                      <label className="form-label small fw-bold">Full Name*</label>
                      <input type="text" name="name" value={inputData.name} onChange={getInputData} required placeholder='Full Name' className='form-control border-primary' />
                    </div>

                    <div className="col-md-6 mb-2">
                      <label className="form-label small fw-bold">Email Address*</label>
                      <input type="email" name="email" value={inputData.email} onChange={getInputData} required placeholder='Email Address' className='form-control border-primary' />
                    </div>

                    <div className="col-md-6 mb-2">
                      <label className="form-label small fw-bold">Phone Number*</label>
                      <input type="text" name="phone" value={inputData.phone} onChange={getInputData} required placeholder='Phone Number' className='form-control border-primary' />
                    </div>

                    <div className="col-12 mb-2">
                      <label className="form-label small fw-bold">Street Address*</label>
                      <textarea name="address" required value={inputData.address} onChange={getInputData} placeholder='House/Flat No., Street, Landmark' className='form-control border-primary' rows={2} />
                    </div>

                    <div className="col-4 mb-2">
                      <label className="form-label small fw-bold">Pin Code*</label>
                      <input type="text" name="pin" required value={inputData.pin} onChange={getInputData} placeholder='Pin Code' className='form-control border-primary' />
                    </div>

                    <div className="col-4 mb-2">
                      <label className="form-label small fw-bold">City*</label>
                      <input type="text" name="city" required value={inputData.city} onChange={getInputData} placeholder='City Name' className='form-control border-primary' />
                    </div>

                    <div className="col-4 mb-2">
                      <label className="form-label small fw-bold">State*</label>
                      <input type="text" name="state" required value={inputData.state} onChange={getInputData} placeholder='State Name' className='form-control border-primary' />
                    </div>

                    <div className="col-12 mt-3">
                      <button type="submit" className="btn btn-primary w-100">{option.type} Address</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
