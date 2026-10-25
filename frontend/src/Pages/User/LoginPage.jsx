import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
    let [showPassword, setShowPassword] = useState(false)
    let [data, setData] = useState({
        username: '',
        password: ''
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

        let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user/login`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": import.meta.env.VITE_APP_JWT_PUBLIC_KEY

            },
            body: JSON.stringify({
                username: data.username,
                password: data.password,
            })
        })
        response = await response.json()
        if (response.result === "Done") {
            if (response.data?.status === false) {
                setErrorMessage("Your Account Has Been Blocked Due to Some Anauthorized Activity, Please Contact Us to Resume Your Account")
                setShow(true)
                return
            }
            localStorage.setItem('login', true)
            localStorage.setItem('userid', response.data?._id)
            localStorage.setItem('name', response.data?.name)
            localStorage.setItem('role', response.data?.role)
            localStorage.setItem('token', response.token)

          
            if (response.data?.role === "Buyer")
                navigate("/profile")
            else
                navigate("/admin")
        }
        else {
            setErrorMessage(response.reason)
            setShow(true)
        }


        // let response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/user`, {
        //     method: "GET",
        //     headers: {
        //         "content-type": "application/json"
        //     }
        // })
        // response = await response.json()
        // let item = response.find(x => (x.username === data.username || x.email === data.username) && x.password === data.password)
        // if (item) {
        //     if (item.status === false) {
        //         setErrorMessage("Your Account Has Been Blocked Due to Some Anauthorized Activity, Please Contact Us to Resume Your Account")
        //         setShow(true)
        //     }
        //     else {
        //         localStorage.setItem('login', true)
        //         localStorage.setItem('userid', item._id)
        //         localStorage.setItem('name', item.name)
        //         localStorage.setItem('role', item.role)
        //         if (item.role === "Buyer")
        //             navigate("/profile")
        //         else
        //             navigate("/admin")
        //     }
        // }
        // else {
        //     setErrorMessage("Invalid Username or Password")
        //     setShow(true)
        // }
    }
    return (
        <div className='container my-3'>
            <div className="row">
                <div className="col-xl-8 col-lg-10 m-auto">
                    <h5 className='text-center bg-primary text-light p-2'>Login To Your Account</h5>
                    <form onSubmit={postData}>
                        <div className="row">
                            <div className="col-12 mb-3">
                                <label>Username*</label>
                                <input type="text" name="username" onChange={getInputData} placeholder='Username' className={`form-control ${show ? 'border-danger' : 'border-primary'}`} />
                                {show ? <p className='text-danger'>{errorMessage}</p> : null}
                            </div>

                            <div className="col-12 mb-3">
                                <label className='d-block'>Password*</label>
                                <div className='btn-group w-100'>
                                    <input type={`${showPassword ? 'text' : 'password'}`} name="password" onChange={getInputData} placeholder='Password' className={`form-control rounded-0 rounded-start ${show ? 'border-danger' : 'border-primary'}`} />
                                    <button type='button' className='btn border border-primary' onClick={() => setShowPassword(!showPassword)}><i className={`${showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}`}></i></button>
                                </div>
                            </div>

                            <div className="col-12 mb-3">
                                <button type="submit" className='btn btn-primary w-100'>Login</button>
                            </div>
                        </div>
                    </form>
                    <div className='d-flex justify-content-between'>
                        <Link to="/forget-password-1">Forget Password</Link>
                        <Link to="/signup">Doesn't Have an Account?Signup</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
