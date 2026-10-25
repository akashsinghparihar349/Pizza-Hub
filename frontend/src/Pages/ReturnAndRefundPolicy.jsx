import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Breadcrum from '../Components/Breadcrum'

import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
export default function ReturnAndRefundPolicy() {
  let [settingData, setSettingData] = useState({
    returnPolicy: ""
  })

  let SettingStateData = useSelector(state => state.SettingStateData)
  let dispatch = useDispatch()

  useEffect(() => {
    (() => {
      dispatch(getSetting())
      if (SettingStateData.length) {
        setSettingData({ returnPolicy: SettingStateData[0].returnPolicy ?? "" })
      }
    })()
  }, [SettingStateData.length])
  return (
    <>
      <Breadcrum title="Return and Refund Policy" />
      <div className="container my-3">
        <div dangerouslySetInnerHTML={{ __html: settingData.returnPolicy }} />
      </div>
    </>
  )
}
