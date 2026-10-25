import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../Components/Breadcrum'

import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
export default function PrivacyPolicy() {
  let [settingData, setSettingData] = useState({
    privacyPolicy: ""
  })

  let SettingStateData = useSelector(state => state.SettingStateData)
  let dispatch = useDispatch()

  useEffect(() => {
    (() => {
      dispatch(getSetting())
      if (SettingStateData.length) {
        setSettingData({ privacyPolicy: SettingStateData[0].privacyPolicy ?? "" })
      }
    })()
  }, [SettingStateData.length])
  return (
    <>
      <Breadcrum title="Privacy Policy" />
      <div className="container my-3">
        <div dangerouslySetInnerHTML={{ __html: settingData.privacyPolicy }} />
      </div>
    </>
  )
}
