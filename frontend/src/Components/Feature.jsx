import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getFeature } from "../Redux/ActionCreators/FeatureActionCreators"
import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
export default function Feature() {
  let [settingData, setSettingData] = useState({
    siteName: import.meta.env.VITE_APP_SITE_NAME,
  })

  let SettingStateData = useSelector(state => state.SettingStateData)
  let FeatureStateData = useSelector(state => state.FeatureStateData)
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
    (() => dispatch(getFeature()))()
  }, [FeatureStateData.length])
  function renderIcon(icon) {
    if (!icon) return ""
    let trimmed = icon.trim()
    if (trimmed.startsWith("<")) {
      return trimmed
    }
    return `<i class="${trimmed}"></i>`
  }

  return (
    <>
      <div className="container my-5 py-5">
        <h1 className='text-center'>Why Pizza Lovers Choose {settingData.siteName}</h1>
        <p className='text-center'>Discover the fresh difference with features crafted to make every meal hot, delicious, and hassle-free. From 100% real dairy mozzarella and 30-minute express delivery to artisanal hand-stretched dough and live order tracking, {settingData.siteName} is committed to delivering the ultimate pizza experience every time.</p>
        <div className='row my-5'>
          {FeatureStateData.filter(x => x.status).map(item => {
            return <div className='col-lg-4 col-md-6' key={item._id}>
              <div className="my-card p-5">
                <div className='text-center'>
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(item.icon) }} className='fs-1'></span>
                </div>
                <h3>{item.name}</h3>
                <p>{item.shortDescription}</p>
              </div>
            </div>
          })}
        </div>
      </div>
    </>
  )
}
