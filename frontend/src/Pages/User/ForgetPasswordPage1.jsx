import { useState } from 'react'
import {  useNavigate } from 'react-router-dom'

export default function ForgetPasswordPage1() {
    let [data, setData] = useState({
        username: ''
    })
    let [errorMessage, setErrorMessage] = useState("")
    let [show, setShow] = useState(false)

    let navigate = useNavigate()

    function getInputData(e) {
        let { name, value } = e.target
        setData({ ...data, [name]: value })
    }
    async function postData(e) {
        e.preventDefault()

        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/forget-password-1`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": import.meta.env.VITE_APP_JWT_PUBLIC_KEY

            },
            body: JSON.stringify({
                username: data.username
            })
        })
        response = await response.json()
        if (response.result === "Done") {
            localStorage.setItem('forget-password-username', data.username)        
                navigate("/forget-password-2")
        }
        else {
            setErrorMessage(response.reason)
            setShow(true)
        }
    }
    return (
        <div className='container my-3'>
            <div className="row">
                <div className="col-xl-8 col-lg-10 m-auto">
                    <h5 className='text-center bg-primary text-light p-2'>Forget Your Password? Reset Now</h5>
                    <form onSubmit={postData}>
                        <div className="row">
                            <div className="col-12 mb-3">
                                <label>Username*</label>
                                <input type="text" name="username" onChange={getInputData} placeholder='Username' className={`form-control ${show ? 'border-danger' : 'border-primary'}`} />
                                {show ? <p className='text-danger'>{errorMessage}</p> : null}
                            </div>

                            <div className="col-12 mb-3">
                                <button type="submit" className='btn btn-primary w-100'>Send OTP</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
