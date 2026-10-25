import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
export default function About() {
  let [settingData, setSettingData] = useState({
    siteName: import.meta.env.VITE_APP_SITE_NAME,
    facebook: import.meta.env.VITE_APP_FAECBOOK,
    twitter: import.meta.env.VITE_APP_TWITTER,
    youtube: import.meta.env.VITE_APP_YOUTUBE,
    linkedin: import.meta.env.VITE_APP_LINKEDIN,
    instagram: import.meta.env.VITE_APP_INSTAGRAM,
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
    <>
      <div className="container my-4 py-5">
        <h1>Your Trusted Artisan Pizzeria — Handcrafted Crusts, 100% Real Mozzarella & Fast Doorstep Delivery</h1>
        <div className="row">
          <div className="col-md-6">
            <p>At {settingData.siteName}, we believe pizza is more than just food — it is an art of craftsmanship, authentic flavors, and shared celebrations. Our pizzaiolos hand-stretch fresh dough prepared daily from premium flour, slow-proofed to achieve that signature airy crust with an irresistible wood-fired crunch. We top every pie with rich San Marzano tomato sauce, 100% whole-milk real mozzarella, crisp handpicked vegetables, and premium gourmet meats. From classic Neapolitan Margheritas to loaded farmhouse feasts, every pizza is baked fresh to order in our high-temperature ovens.</p>
            <p>Piping-hot delivery is our culinary commitment. Packed in insulated thermal containers, your pizza arrives with melted bubbling cheese, fragrant fresh basil, and crisp crust intact — delivered right to your doorstep within 30 minutes. Customer delight drives everything we do, from our transparent ingredient sourcing to our customizable crusts, cheeses, and toppings. At {settingData.siteName}, we are proud to serve you the freshest, tastiest pizzeria experience in town.</p>
            <div>
              <a href={settingData.facebook} target='_blank' className=" me-2"> <i className='fs-3 text-secondary bi bi-facebook'></i></a>
              <a href={settingData.twitter} target='_blank' className=" me-2"> <i className='fs-3 text-secondary bi bi-twitter'></i></a>
              <a href={settingData.youtube} target='_blank' className=" me-2"> <i className='fs-3 text-secondary bi bi-youtube'></i></a>
              <a href={settingData.linkedin} target='_blank' className=" me-2"> <i className='fs-3 text-secondary bi bi-linkedin'></i></a>
              <a href={settingData.instagram} target='_blank' className=" me-2"> <i className='fs-3 text-secondary bi bi-instagram'></i></a>
            </div>
          </div>
          <div className="col-md-6">
            <img src="/images/pizza-about.png" className='img-fluid w-100' alt="" />
          </div>
        </div>
      </div>
    </>
  )
}
