import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../Components/Breadcrum'

import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
export default function TermsAndConditions() {
  let [settingData, setSettingData] = useState({
    termsAndConditions: ""
  })

  let SettingStateData = useSelector(state => state.SettingStateData)
  let dispatch = useDispatch()

  useEffect(() => {
    (() => {
      dispatch(getSetting())
      if (SettingStateData.length) {
        setSettingData({ termsAndConditions: SettingStateData[0].termsAndConditions ?? "" })
      }
    })()
  }, [SettingStateData.length])
  return (
    <>
      <Breadcrum title="Terms and Conditions" />
      <div className="container my-3">
        <div dangerouslySetInnerHTML={{ __html: settingData.termsAndConditions }} />
      </div>
    </>
  )
}
