import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ToastContainer, toast } from 'react-toastify';

import Breadcrum from '../../../Components/Breadcrum'
import AdminSidebar from '../../../Components/Admin/AdminSidebar'

import { getSetting, createSetting } from "../../../Redux/ActionCreators/SettingActionCreators"
let rtePrivacyPolicy;
let rteTermsAndConditions;
let rteReturnPolicy;
export default function AdminSettingPage() {
    var refdivPrivacyPolicy = useRef(null);
    var refdivTermsAndCondition = useRef(null);
    var refdivReturnPolicy = useRef(null);
    let [data, setData] = useState({
        siteName: "",
        address: "",
        map1: "",
        map2: "",
        email: "",
        phone: "",
        whatsapp: "",
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        youtube: ""
    })

    let SettingStateData = useSelector(state => state.SettingStateData)
    let dispatch = useDispatch()

    function getInputData(e) {
        let { name, value } = e.target
        setData({ ...data, [name]: value })
    }

    function postData(e) {
        e.preventDefault()
        let item = {
            ...data,
            privacyPolicy: rtePrivacyPolicy?.getHTMLCode ? rtePrivacyPolicy.getHTMLCode() : (data.privacyPolicy || ""),
            termsAndConditions: rteTermsAndConditions?.getHTMLCode ? rteTermsAndConditions.getHTMLCode() : (data.termsAndConditions || ""),
            returnPolicy: rteReturnPolicy?.getHTMLCode ? rteReturnPolicy.getHTMLCode() : (data.returnPolicy || ""),
        }
        if (SettingStateData.length)
            dispatch(createSetting({ ...item, _id: SettingStateData[0]._id }))
        else
            dispatch(createSetting({ ...item }))

        toast("Setting Record Has Been Updated");
    }

    useEffect(() => {
        dispatch(getSetting())
    }, [dispatch])

    useEffect(() => {
        if (window.RichTextEditor) {
            if (refdivPrivacyPolicy.current && !rtePrivacyPolicy) {
                rtePrivacyPolicy = new window.RichTextEditor(refdivPrivacyPolicy.current);
            }
            if (refdivTermsAndCondition.current && !rteTermsAndConditions) {
                rteTermsAndConditions = new window.RichTextEditor(refdivTermsAndCondition.current);
            }
            if (refdivReturnPolicy.current && !rteReturnPolicy) {
                rteReturnPolicy = new window.RichTextEditor(refdivReturnPolicy.current);
            }
        }
        if (SettingStateData.length) {
            setData(prev => ({ ...prev, ...SettingStateData[0] }))
            if (rtePrivacyPolicy?.setHTMLCode) rtePrivacyPolicy.setHTMLCode(SettingStateData[0].privacyPolicy || "")
            if (rteTermsAndConditions?.setHTMLCode) rteTermsAndConditions.setHTMLCode(SettingStateData[0].termsAndConditions || "")
            if (rteReturnPolicy?.setHTMLCode) rteReturnPolicy.setHTMLCode(SettingStateData[0].returnPolicy || "")
        }
        return () => {
            rtePrivacyPolicy = null;
            rteTermsAndConditions = null;
            rteReturnPolicy = null;
        }
    }, [SettingStateData])

    return (
        <>
            <ToastContainer />
            <Breadcrum title="Admin" />
            <div className="container-fluid my-3">
                <div className="row">
                    <div className="col-md-3">
                        <AdminSidebar />
                    </div>
                    <div className="col-md-9">
                        <h5 className='bg-primary text-light text-center p-2'>Setting</h5>
                        <form onSubmit={postData}>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label>Address</label>
                                    <input type="text" name="address" value={data.address} onChange={getInputData} placeholder='Address' className='form-control border-primary' />
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Map1</label>
                                    <input type="url" name="map1" value={data.map1} onChange={getInputData} placeholder='Map1' className='form-control border-primary' />
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Map2</label>
                                    <input type="url" name="map2"  value={data.map2} onChange={getInputData} placeholder='Map2' className='form-control border-primary' />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label>Site Name</label>
                                    <input type="text" name="siteName" value={data.siteName} onChange={getInputData} placeholder='Site Name' className='form-control border-primary' />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label>Email Address</label>
                                    <input type="text" name="email" value={data.email} onChange={getInputData} placeholder='Email Address' className='form-control border-primary' />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label>Phone Number</label>
                                    <input type="text" name="phone" value={data.phone} onChange={getInputData} placeholder='Phone Number' className='form-control border-primary' />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label>Whatsapp Number</label>
                                    <input type="text" name="whatsapp" value={data.whatsapp} onChange={getInputData} placeholder='Whatsapp Number' className='form-control border-primary' />
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Facebook Profile Page Url</label>
                                    <input type="url" name="facebook" value={data.facebook} onChange={getInputData} placeholder='Facebook Profile Page Url' className='form-control border-primary' />
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Twitter Profile Page Url</label>
                                    <input type="url" name="twitter" value={data.twitter} onChange={getInputData} placeholder='Twitter Profile Page Url' className='form-control border-primary' />
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Instagram Profile Page Url</label>
                                    <input type="url" name="instagram" value={data.instagram} onChange={getInputData} placeholder='Instagram Profile Page Url' className='form-control border-primary' />
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Linkedin Profile Page Url</label>
                                    <input type="url" name="linkedin" value={data.linkedin} onChange={getInputData} placeholder='Linkedin Profile Page Url' className='form-control border-primary' />
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Youtube Profile Page Url</label>
                                    <input type="url" name="youtube" value={data.youtube} onChange={getInputData} placeholder='Youtube Profile Page Url' className='form-control border-primary' />
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Privacy Policy</label>
                                    <div ref={refdivPrivacyPolicy} className='border-primary'></div>
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Terms and Conditions</label>
                                    <div ref={refdivTermsAndCondition} className='border-primary'></div>
                                </div>
                                <div className="col-12 mb-3">
                                    <label>Return Policy</label>
                                    <div ref={refdivReturnPolicy} className='border-primary'></div>
                                </div>
                                <div className="col-12 mb-3">
                                    <button type='submit' className='btn btn-primary w-100'>Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
