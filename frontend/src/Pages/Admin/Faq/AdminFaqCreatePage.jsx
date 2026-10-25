import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'
import TextValidators from '../../../FormValidators/TextValidators'


import { createFaq, getFaq } from '../../../Redux/ActionCreators/FaqActionCreators'
export default function AdminFaqCreatePage() {
    let [data, setData] = useState({
        question: "",
        answer: "",
        status: true
    })
    let [errorMessage, setErrorMessage] = useState({
        question: "Question Field is Mendatory",
        answer: "Answer Field is Mendatory"
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
    function postData(e) {
        e.preventDefault()
        let error = Object.values(errorMessage).find(x => x !== "")
        if (error)
            setShow(true)
        else {
            let item = FaqStateData.find(x => x.question?.toLocaleLowerCase() === data.question?.toLocaleLowerCase())
            if (item) {
                setErrorMessage({ ...errorMessage, question: 'Faq With This Question Already Exist' })
                setShow(true)
                return
            }
            dispatch(createFaq({ ...data }))
            navigate("/admin/faq")
        }
    }

    useEffect(() => {
        dispatch(getFaq())
    }, [FaqStateData.length, dispatch])
    return (
        <>
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>Create Faq <Link to="/admin/faq"><i className='bi bi-arrow-left text-light float-end'></i></Link></h5>
                        <form onSubmit={postData}>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label>Question*</label>
                                    <input type="text" name="question" onChange={getInputData} placeholder='Question' className={`form-control ${show && errorMessage.question ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.question ? <p className='text-danger text-capitalize'>{errorMessage.question}</p> : null}
                                </div>

                                <div className="col-12 mb-3">
                                    <label>Answer*</label>
                                    <textarea name="answer" rows={3} onChange={getInputData} placeholder='Faq Name' className={`form-control ${show && errorMessage.answer ? 'border-danger' : 'border-primary'}`} />
                                    {show && errorMessage.answer ? <p className='text-danger text-capitalize'>{errorMessage.answer}</p> : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>Status</label>
                                    <select name="status" onChange={getInputData} className='form-select border-primary'>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>

                                <div className="col-12 mb-3">
                                    <button type='submit' className='btn btn-primary w-100'>Create</button>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
