import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
export default function ContactDetails() {
    let [settingData, setSettingData] = useState({
        address: import.meta.env.VITE_APP_ADDRESS,
        map1: import.meta.env.VITE_APP_MAP1,
        email: import.meta.env.VITE_APP_EMAIL,
        phone: import.meta.env.VITE_APP_PHONE,
        whatsapp: import.meta.env.VITE_APP_WHATSAPP,
    })

    let SettingStateData = useSelector(state => state.SettingStateData)
    let dispatch = useDispatch()

    useEffect(() => {
        (() => {
            dispatch(getSetting())
            if (SettingStateData.length) {
                setSettingData(() => {
                    let item = {}
                    Object.keys(settingData).map(key => item[key] = SettingStateData[0][key] || settingData[key])
                    return item
                })
            }
        })()
    }, [SettingStateData.length])

    return (
        <div className="container">
            <div className="col-lg-12">
                <div className="row g-4 align-items-center justify-content-center">
                    <div className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp" data-wow-delay="0.1s">
                        <div className="rounded p-4">
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4"
                                style={{ width: "70px", height: "70px" }}>
                                <i className="text-light fas fa-map-marker-alt fa-2x text-primary"></i>
                            </div>
                            <div>
                                <h4>Address</h4>
                                <a href={settingData.map1} target='_blank' className="mb-2 text-dark">{settingData.address}</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp" data-wow-delay="0.3s">
                        <div className="rounded p-4">
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4"
                                style={{ width: "70px", height: "70px" }}>
                                <i className="text-light fas fa-envelope fa-2x text-primary"></i>
                            </div>
                            <div>
                                <h4>Mail Us</h4>
                                 <a href={`mailto:${settingData.email}`} target='_blank' className="mb-2 text-dark">{settingData.email}</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp" data-wow-delay="0.5s">
                        <div className="rounded p-4">
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4"
                                style={{ width: "70px", height: "70px" }}>
                                <i className="text-light fa fa-phone-alt fa-2x text-primary"></i>
                            </div>
                            <div>
                                <h4>Telephone</h4>
                                <a href={`tel:${settingData.phone}`} target='_blank' className="mb-2 text-dark">{settingData.phone}</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp" data-wow-delay="0.7s">
                        <div className="rounded p-4">
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4"
                                style={{ width: "70px", height: "70px" }}>
                                <i className="text-light fab fa-whatsapp fa-2x text-primary"></i>
                            </div>
                            <div>
                                <h4>Whatsapp</h4>
                                <a href={`https//:${settingData.whatsapp}`} target='_blank' className="mb-2 text-dark">{settingData.whatsapp}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
