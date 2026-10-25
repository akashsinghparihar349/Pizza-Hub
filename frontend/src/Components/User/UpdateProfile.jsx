import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextValidators from '../../FormValidators/TextValidators'

export default function UpdateProfile({ changeSearchParams }) {
  let [data, setData] = useState({
    name: "",
    username: "",
    email: "",
    phone: ""
  })
  let [errorMessage, setErrorMessage] = useState({
    name: "",
    username: "",
    email: "",
    phone: ""
  })
  let [show, setShow] = useState(false)

  let navigate = useNavigate()

  function getInputData(e) {
    let { name, value } = e.target
    setData({ ...data, [name]: value })
    setErrorMessage({ ...errorMessage, [name]: TextValidators(e) })
  }
  async function postData(e) {
    e.preventDefault()

    let item = Object.values(errorMessage).find(x => x !== "")
    if (item) {
      setShow(true)
      return
    }

    let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/${data._id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "authorization": localStorage.getItem("token")
      },
      body: JSON.stringify({ ...data })
    })
    response = await response.json()
    if (response.result === "Done")
      changeSearchParams('Profile')
    else {
      setErrorMessage({ ...errorMessage, ...response.reason })
      setShow(true)
    }
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
        setData({ ...data, ...response.data })
      else
        navigate("/login")
    })()
  }, [])
  return (
    <form onSubmit={postData}>
      <div className="row">
        <div className="col-lg-6 mb-3">
          <label>Full Name*</label>
          <input type="text" name="name" value={data.name} onChange={getInputData} placeholder='Full Name' className={`form-control ${show && errorMessage.name ? 'border-danger' : 'border-primary'}`} />
          {show && errorMessage.name ? <p className='text-danger'>{errorMessage.name}</p> : null}
        </div>

        <div className="col-lg-6 mb-3">
          <label>Phone Number*</label>
          <input type="text" name="phone" value={data.phone} onChange={getInputData} placeholder='Phone Number' className={`form-control ${show && errorMessage.phone ? 'border-danger' : 'border-primary'}`} />
          {show && errorMessage.phone ? <p className='text-danger'>{errorMessage.phone}</p> : null}
        </div>

        <div className="col-lg-6 mb-3">
          <label>Username*</label>
          <input type="text" name="username" value={data.username} onChange={getInputData} placeholder='Username' className={`form-control ${show && errorMessage.username ? 'border-danger' : 'border-primary'}`} />
          {show && errorMessage.username ? <p className='text-danger'>{errorMessage.username}</p> : null}
        </div>

        <div className="col-lg-6 mb-3">
          <label>Email Address*</label>
          <input type="email" name="email" value={data.email} onChange={getInputData} placeholder='Email Address' className={`form-control ${show && errorMessage.email ? 'border-danger' : 'border-primary'}`} />
          {show && errorMessage.email ? <p className='text-danger'>{errorMessage.email}</p> : null}
        </div>

        <div className="col-12 mb-3">
          <button type="submit" className='btn btn-primary w-100'>Update Profile</button>
        </div>
      </div>
    </form>
  )
}
