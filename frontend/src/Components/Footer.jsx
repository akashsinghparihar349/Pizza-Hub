import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
import { createNewsletter, getNewsletter } from "../Redux/ActionCreators/NewsletterActionCreators"
export default function Footer() {
    let [settingData, setSettingData] = useState({
        siteName: import.meta.env.VITE_APP_SITE_NAME,
        address: import.meta.env.VITE_APP_ADDRESS,
        map1: import.meta.env.VITE_APP_MAP1,
        email: import.meta.env.VITE_APP_EMAIL,
        phone: import.meta.env.VITE_APP_PHONE,
        whatsapp: import.meta.env.VITE_APP_WHATSAPP,
        facebook: import.meta.env.VITE_APP_FAECBOOK,
        twitter: import.meta.env.VITE_APP_TWITTER,
        youtube: import.meta.env.VITE_APP_YOUTUBE,
        linkedin: import.meta.env.VITE_APP_LINKEDIN,
        instagram: import.meta.env.VITE_APP_INSTAGRAM,
    })
    let [email, setEmail] = useState("")
    let [message, setMessage] = useState()


    let SettingStateData = useSelector(state => state.SettingStateData)
    let NewsletterStateData = useSelector(state => state.NewsletterStateData)
    let dispatch = useDispatch()

    function postData(e) {
        e.preventDefault()
        if (email === "") {
            setMessage("Please Enter a Valid Email Address")
            return
        }
        let item = NewsletterStateData.find(x => x.email.toLocaleLowerCase() === email.toLocaleLowerCase())
        if (item) {
            setMessage("Email Address Is Already Subscribed")
            return;
        }

        dispatch(createNewsletter({ email: email, status: true }))
        setEmail("")
        setMessage("Thanks To subscribe Our Newsletter Service")
    }

    useEffect(() => {
        (() => dispatch(getNewsletter()))()
    }, [NewsletterStateData.length])

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
        <>
            <div className="container-fluid footer py-5 wow fadeIn" data-wow-delay="0.2s">
                <div className="container py-5">
                    <div className="row g-4 rounded mb-5" style={{ background: "rgba(255, 255, 255, .03)" }}>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4"
                                    style={{ width: "70px", height: "70px" }}>
                                    <i className="fas fa-map-marker-alt fa-2x text-light"></i>
                                </div>
                                <div>
                                    <h4 className="text-white">Address</h4>
                                    <a href={settingData.map1} target='_blank' className="mb-2 text-light">{settingData.address}</a>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4"
                                    style={{ width: "70px", height: "70px" }}>
                                    <i className="fas fa-envelope fa-2x text-light"></i>
                                </div>
                                <div>
                                    <h4 className="text-white">Mail Us</h4>
                                    <a href={`mailto:${settingData.email}`} target='_blank' className="mb-2 text-light">{settingData.email}</a>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4"
                                    style={{ width: "70px", height: "70px" }}>
                                    <i className="fa fa-phone-alt fa-2x text-light"></i>
                                </div>
                                <div>
                                    <h4 className="text-white">Telephone</h4>
                                    <a href={`tel:${settingData.phone}`} target='_blank' className="mb-2 text-light">{settingData.phone}</a>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4"
                                    style={{ width: "70px", height: "70px" }}>
                                    <i className="bi bi-whatsapp fa-2x text-light"></i>
                                </div>
                                <div>
                                    <h4 className="text-white">Whatsapp</h4>
                                    <a href={`mailto:${settingData.whatsapp}`} target='_blank' className="mb-2 text-light">{settingData.whatsapp}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row g-5">
                        <div className="col-md-6">
                            <div className="footer-item d-flex flex-column">
                                <div className="footer-item">
                                    <h4 className="text-light mb-4">{settingData.siteName}</h4>
                                    <p className="mb-3 text-light">{settingData.siteName || "PizzaDelivery"} is your favorite artisan pizzeria destination, serving oven-fresh stone-baked pizzas, gourmet toppings, and fast 30-minute doorstep delivery crafted with love and 100% real mozzarella.</p>
                                    <form onSubmit={postData}>
                                        <div className="position-relative mx-auto rounded-pill">
                                            <input className="form-control rounded-pill w-100 py-3 ps-4 pe-5" type="text" name='email' onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Enter your email" />
                                            <button type="submit" className="btn btn-primary rounded-pill position-absolute top-0 end-0 py-2 mt-2 me-2">Subscribe</button>
                                        </div>
                                    </form>
                                    {message ? <p className='text-light'>{message}</p> : null}
                                </div>
                                <div className='mt-3'>
                                    <a href={settingData.facebook} target='_blank' className="text-light me-2"> <i className='fs-3 me-2 bi bi-facebook'></i></a>
                                    <a href={settingData.twitter} target='_blank' className="text-light me-2"> <i className='fs-3 me-2 bi bi-twitter'></i></a>
                                    <a href={settingData.youtube} target='_blank' className="text-light me-2"> <i className='fs-3 me-2 bi bi-youtube'></i></a>
                                    <a href={settingData.linkedin} target='_blank' className="text-light me-2"> <i className='fs-3 me-2 bi bi-linkedin'></i></a>
                                    <a href={settingData.instagram} target='_blank' className="text-light me-2"> <i className='fs-3 me-2 bi bi-instagram'></i></a>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="footer-item d-flex flex-column">
                                <h4 className="text-light mb-4">Quick Links</h4>
                                <Link to="/" className="text-light"><i className="fas fa-angle-right me-2"></i> Home</Link>
                                <Link to="/about" className="text-light"><i className="fas fa-angle-right me-2"></i> About Us</Link>
                                <Link to="/shop" className="text-light"><i className="fas fa-angle-right me-2"></i> Pizza Menu</Link>
                                <Link to="/testimonial" className="text-light"><i className="fas fa-angle-right me-2"></i> Testimonials</Link>
                                <Link to="/contact" className="text-light"><i className="fas fa-angle-right me-2"></i> Contact Us</Link>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="footer-item d-flex flex-column">
                                <h4 className="text-light mb-4">Other Links</h4>
                                <Link to="/feature" className="text-light"><i className="fas fa-angle-right me-2"></i> Features</Link>
                                <Link to="/faq" className="text-light"><i className="fas fa-angle-right me-2"></i> Faq</Link>
                                <Link to="/privacy-policy" className="text-light"><i className="fas fa-angle-right me-2"></i> Privacy Policy</Link>
                                <Link to="/tc" className="text-light"><i className="fas fa-angle-right me-2"></i> Terms & Conditions</Link>
                                <Link to="/refund-policy" className="text-light"><i className="fas fa-angle-right me-2"></i> Return and Refund Policy</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid copyright py-4">
                <div className="container">
                    <div className="row g-4 align-items-center">
                        <div className="col-md-6 text-center text-md-start mb-md-0">
                            <span className="text-white"><a href="#" className="border-bottom text-white"><i
                                className="fas fa-copyright text-light me-2"></i>{settingData.siteName}</a>, All right
                                reserved.</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
