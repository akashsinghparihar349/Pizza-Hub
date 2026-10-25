import  { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Profile from '../../Components/User/Profile'
import UpdateProfile from '../../Components/User/UpdateProfile'
import Wishlist from '../../Components/User/Wishlist'
import Orders from '../../Components/User/Orders'
import Address from '../../Components/User/Address'
export default function ProfilePage() {
  let [option, setOption] = useState("")

  let [searchParams, setSearchParams] = useSearchParams()

  function changeSearchParams(value) {
    setOption(value)
    setSearchParams({ option: value })
  }
  useEffect(() => {
    let opt = (searchParams.get("option") || "Profile").toLowerCase()
    let map = {
      profile: "Profile",
      "update-profile": "Update-Profile",
      wishlist: "Wishlist",
      orders: "Orders",
      address: "Address"
    }
    setOption(map[opt] || "Profile")
  }, [searchParams])
  return (
    <div className='container-fluid my-3'>
      <div className="row">
        <div className="col-md-3">
          <div className="list-group">
            <button onClick={() => changeSearchParams('Profile')} className={`list-group-item list-group-item-action ${option === 'Profile' ? 'active' : ''} mb-1`} aria-current="true"> <span className='float-end'>Profile</span></button>
            <button onClick={() => changeSearchParams('Update-Profile')} className={`list-group-item list-group-item-action ${option === 'Update-Profile' ? 'active' : ''} mb-1`} aria-current="true"><span className='float-end'>Update Profile</span></button>
            <button onClick={() => changeSearchParams('Wishlist')} className={`list-group-item list-group-item-action ${option === 'Wishlist' ? 'active' : ''} mb-1`} aria-current="true"><span className='float-end'>Wishlist</span></button>
            <button onClick={() => changeSearchParams('Orders')} className={`list-group-item list-group-item-action ${option === 'Orders' ? 'active' : ''} mb-1`} aria-current="true"><span className='float-end'>Orders</span></button>
            <button onClick={() => changeSearchParams('Address')} className={`list-group-item list-group-item-action ${option === 'Address' ? 'active' : ''} mb-1`} aria-current="true"><span className='float-end'>Address</span></button>
          </div>
        </div>
        <div className="col-md-9">
          <h5 className='bg-primary text-center p-2 text-light'>{option}</h5>
          {option === "Profile" ? <Profile /> : null}
          {option === "Update-Profile" ? <UpdateProfile changeSearchParams={changeSearchParams} /> : null}
          {option === "Wishlist" ? <Wishlist /> : null}
          {option === "Orders" ? <Orders /> : null}
          {option === "Address" ? <Address /> : null}
        </div>
      </div>
    </div>
  )
}
