import { useState } from 'react'
import {  useNavigate } from 'react-router-dom'

export default function ForgetPasswordPage3() {
    let [data, setData] = useState({
        password: '',
        cpassword: ''
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
        if (data.password !== data.cpassword) {
            setShow(true)
            setErrorMessage("Password and Confirm Password Doesn't Match!!")
            return
        }
        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/forget-password-3`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": import.meta.env.VITE_APP_JWT_PUBLIC_KEY

            },
            body: JSON.stringify({
                username: localStorage.getItem("forget-password-username"),
                password: data.password,
                otp: localStorage.getItem("forget-password-otp")
            })
        })
        response = await response.json()
        if (response.result === "Done") {
            localStorage.removeItem('forget-password-username')
            localStorage.removeItem('forget-password-otp')
            navigate("/login")
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
                                <label>Password*</label>
                                <input type="text" name="password" onChange={getInputData} placeholder='Enter New Password' className={`form-control ${show ? 'border-danger' : 'border-primary'}`} />
                                {show ? <p className='text-danger'>{errorMessage}</p> : null}
                            </div>
                            <div className="col-12 mb-3">
                                <label>Confirm Password*</label>
                                <input type="text" name="cpassword" onChange={getInputData} placeholder='Confiorm Password' className={`form-control ${show ? 'border-danger' : 'border-primary'}`} />
                                
                            </div>

                            <div className="col-12 mb-3">
                                <button type="submit" className='btn btn-primary w-100'>Reset Password</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
