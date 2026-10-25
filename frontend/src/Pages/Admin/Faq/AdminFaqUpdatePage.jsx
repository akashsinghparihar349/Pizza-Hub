import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import TextValidators from '../../../FormValidators/TextValidators'

import { updateFaq, getFaq } from '../../../Redux/ActionCreators/FaqActionCreators'
export default function AdminFaqUpdatePage() {
    let { _id } = useParams()

    let [data, setData] = useState({
        question: "",
        answer: "",
        status: true
    })
    let [errorMessage, setErrorMessage] = useState({
        question: "",
        answer: ""
    })
    let [show, setShow] = useState(false)

    let FaqStateData = useSelector(state => state.FaqStateData)
    let dispatch = useDispatch()
    let navigate = useNavigate()

    function getInputData(e) {
        let { name, value } = e.target

        setData({ ...data, [name]: name === "status" ? value === "1" ? true : false : value })
        setErrorMessage({ ...errorMessage, [name]: TextValidators(e) })
    }
    async function postData(e) {
        e.preventDefault()
        let error = Object.values(errorMessage).find(x => x !== "")
        if (error)
            setShow(true)
        else {
            let item = FaqStateData.find(x => x._id !== _id && x.question?.toLocaleLowerCase() === data.question?.toLocaleLowerCase())
            if (item) {
                setErrorMessage({ ...errorMessage, question: 'Faq With This Question Already Exist' })
                setShow(true)
                return
            }
            dispatch(updateFaq({ ...data }))
            navigate("/admin/faq")
        }
    }

    useEffect(() => {
        dispatch(getFaq())
        if (FaqStateData.length) {
            let item = FaqStateData.find(x => x._id === _id)
            if (item)
                setData(prev => ({ ...prev, ...item }))
            else
                navigate("/admin/faq")
        }
    }, [FaqStateData.length, _id, dispatch, navigate])
    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>Update Faq <Link to="/admin/faq"><i className='bi bi-arrow-left text-light float-end'></i></Link></h5>
                        <form onSubmit={postData}>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label>Question*</label>
                                    <input type="text" name="question" value={data.question} onChange={getInputData} placeholder='Question' className={`form-control ${show && errorMessage.question ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.question ? <p className='text-danger text-capitalize'>{errorMessage.question}</p> : null}
                                </div>

                                <div className="col-12 mb-3">
                                    <label>Answer*</label>
                                    <textarea name="answer" rows={3} value={data.answer} onChange={getInputData} placeholder='Faq Name' className={`form-control ${show && errorMessage.answer ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.answer ? <p className='text-danger text-capitalize'>{errorMessage.answer}</p> : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>Status</label>
                                    <select name="status" value={data.status ? "1" : "0"} onChange={getInputData} className='form-select border-primary'>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>

                                <div className="col-12 mb-3">
                                    <button type='submit' className='btn btn-primary w-100'>Update</button>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
