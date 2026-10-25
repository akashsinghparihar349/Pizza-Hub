import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getFaq } from "../Redux/ActionCreators/FaqActionCreators"
import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
export default function Faq() {
  let [settingData, setSettingData] = useState({
    siteName: import.meta.env.VITE_APP_SITE_NAME,
  })

  let FaqStateData = useSelector(state => state.FaqStateData)
  let SettingStateData = useSelector(state => state.SettingStateData)
  let dispatch = useDispatch()

  useEffect(() => {
    (() => {
      dispatch(getSetting())
      if (SettingStateData.length) {
        setSettingData({ siteName: SettingStateData[0].siteName || settingData.siteName })
      }
    })()
  }, [SettingStateData.length])

  useEffect(() => {
    (() => dispatch(getFaq()))()
  }, [FaqStateData.length])
  return (
    <div className='container my-3'>
      <h1 className='text-center'>Frequently Asked Questions</h1>
      <p className='text-center'>Find answers to the most common questions about shopping on {settingData.siteName}. From placing orders and secure payments to shipping, returns, and customer support, our FAQ section is here to help you enjoy a smooth, convenient, and worry-free online shopping experience.</p>
      <div className="my-3">
        <div className="accordion mt-5" id="accordionExample">
          {FaqStateData.filter(x => x.status).map((item, index) => {
            return <div className="accordion-item" key={item._id}>
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button text-secondary" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${item._id}`} aria-expanded="true" aria-controls={`collapse${item._id}`}>
                  {item.question}
                </button>
              </h2>
              <div id={`collapse${item._id}`} className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                <div className="accordion-body">
                  {item.answer}
                </div>
              </div>
            </div>
          })}
        </div>
      </div>
    </div>
  )
}
