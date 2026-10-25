import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


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
  let [flag, setFlag] = useState(false)

  let [inputData, setInputData] = useState({ ...inputOptions })

  let [data, setData] = useState({ address: [] })
  let navigate = useNavigate()

  function create() {
    setShowModal(true)
    setOption({
      type: "Create"
    })
    setInputData({ ...inputOptions })
  }

  function update(index) {
    setShowModal(true)
    setOption({
      type: "Update",
      index: index
    })
    setInputData({ ...data.address[index] })
  }


  function getInputData(e) {
    let { name, value } = e.target
    setInputData({ ...inputData, [name]: value })
  }

  async function deleteRecord(index) {
    if (window.confirm("Are You Sure You Want To Delete That Record?")) {
      let updatedAddresses = (data.address || []).filter((_, idx) => idx !== index)
      let updatedUser = { ...data, address: updatedAddresses }

      let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${localStorage.getItem("userid")}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: localStorage.getItem("token")
        },
        body: JSON.stringify(updatedUser)
      })
      let resData = await response.json()
      if (resData.result === "Done") {
        setData(updatedUser)
      }
      setFlag(!flag)
    }
  }

  async function postData(e) {
    e.preventDefault()
    let currentAddresses = data.address ? [...data.address] : []
    let updatedAddresses = option.type === "Create"
      ? [...currentAddresses, { ...inputData }]
      : currentAddresses.map((addr, idx) => idx === option.index ? { ...inputData } : addr)

    let updatedUser = { ...data, address: updatedAddresses }

    let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${localStorage.getItem("userid")}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "authorization": localStorage.getItem("token")
      },
      body: JSON.stringify(updatedUser)
    })
    let resData = await response.json()
    if (resData.result === "Done") {
      setData(updatedUser)
    }
    setShowModal(false)
    setInputData(inputOptions)
  }

  useEffect(() => {
    (async () => {
      let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${localStorage.getItem("userid")}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "authorization": localStorage.getItem("token")
        }
      })
      response = await response.json()
      if (response.result === "Done")
        setData({...response.data})
      else
        navigate("/login")
    })()
  }, [])
  return (
    <>
      <div>
        <div className='float-end'>
          <button className='btn btn-primary' onClick={create}>Add New Address</button>
        </div>
        <div>
          {data.address?.map((item, index) => {
            return <div className='card p-3 w-75' key={index}>
              <p>{item.name}</p>
              <p>{item.email},{item.phone}</p>
              <p>{item.address}</p>
              <p>{item.pin},{item.city},{item.state}</p>
              <div className='btn-group position-absolute end-0'>
                <button className='btn btn-primary' onClick={() => update(index)}><i className='bi bi-pencil'></i></button>
                <button className='btn btn-danger' onClick={() => deleteRecord(index)}><i className='bi bi-x'></i></button>
              </div>
            </div>
          })}
        </div>

        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} id="exampleModal">
          <div className="modal-dialog  modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">{option.type}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={postData}>
                  <div className="row">
                    <div className="col-12 mb-3">
                      {/* <label>Name*</label> */}
                      <input type="text" name="name" value={inputData.name} onChange={getInputData} required placeholder='Full Name' className='form-control border-primary' />
                    </div>

                    <div className="col-md-6 mb-3">
                      {/* <label>Email*</label> */}
                      <input type="email" name="email" value={inputData.email} onChange={getInputData} required placeholder='Eamil Address' className='form-control border-primary' />
                    </div>

                    <div className="col-md-6 mb-3">
                      {/* <label>Phone Number*</label> */}
                      <input type="text" name="phone" value={inputData.phone} onChange={getInputData} required placeholder='Phone Number' className='form-control border-primary' />
                    </div>

                    <div className="col-12 mb-3">
                      {/* <label>Address*</label> */}
                      <textarea name="address" required value={inputData.address} onChange={getInputData} placeholder='Address' className='form-control border-primary' />
                    </div>

                    <div className="col-6 mb-3">
                      {/* <label>Pin*</label> */}
                      <input type="pin" name="pin" required value={inputData.pin} onChange={getInputData} placeholder='Pin Code' className='form-control border-primary' />
                    </div>

                    <div className="col-6 mb-3">
                      {/* <label>City Name*</label> */}
                      <input type="text" name="city" required value={inputData.city} onChange={getInputData} placeholder='City Name' className='form-control border-primary' />
                    </div>
                    <div className="col-12 mb-3">
                      {/* <label>State*</label> */}
                      <input type="text" name="state" required value={inputData.state} onChange={getInputData} placeholder='State Name' className='form-control border-primary' />
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary w-100">{option.type}</button>
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
