import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { getSetting } from "../Redux/ActionCreators/SettingActionCreators"
import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators"

export default function Navbar() {
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
  let [search, setSearch] = useState("")

  let SettingStateData = useSelector(state => state.SettingStateData)
  let MaincategoryStateData = useSelector(state => state.MaincategoryStateData)
  let dispatch = useDispatch()

  let navigate = useNavigate()

  function logout() {
    localStorage.clear()
    navigate("/login")
  }

  function postData(e) {
    e.preventDefault()
    navigate(`/shop?search=${search}`)
  }

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
  }, [SettingStateData.length, dispatch])

  useEffect(() => {
    (() => {
      dispatch(getMaincategory())
    })()
  }, [MaincategoryStateData.length, dispatch])

  const userRole = localStorage.getItem("role")

  return (
    <>
      <div className="container-fluid px-5 border-bottom">
        <div className="row gx-0 align-items-center">
          <div className="col-lg-7 col-4 text-center d-flex align-items-center justify-content-center">
            <a href={settingData.map1} target='_blank' rel="noreferrer" className=" d-flex me-2">
              <i className='me-1 bi bi-geo-alt'></i>
              <span className='d-none d-xl-inline-block'>{settingData.address}</span>
            </a>
            <a href={`mailto:${settingData.email}`} target='_blank' rel="noreferrer" className=" d-flex me-2">
              <i className='me-1 bi bi-envelope'></i>
              <span className='d-none d-xl-inline-block'>{settingData.email}</span>
            </a>
            <a href={`tel:${settingData.phone}`} target='_blank' rel="noreferrer" className=" d-flex me-2">
              <i className='me-1 bi bi-telephone'></i>
              <span className='d-none d-xl-inline-block'>{settingData.phone}</span>
            </a>
            <a href={`https://wa.me/${settingData.whatsapp}`} target='_blank' rel="noreferrer" className=" d-flex me-2">
              <i className='me-1 bi bi-whatsapp'></i>
              <span className='d-none d-xl-inline-block'>{settingData.whatsapp}</span>
            </a>
          </div>

          <div className="col-lg-5 col-8 text-center text-lg-end">
            <div className="d-inline-flex align-items-center" style={{ height: "45px" }}>
              <a href={settingData.facebook} target='_blank' rel="noreferrer" className=" me-2"> <i className='bi bi-facebook'></i></a>
              <a href={settingData.twitter} target='_blank' rel="noreferrer" className=" me-2"> <i className='bi bi-twitter'></i></a>
              <a href={settingData.youtube} target='_blank' rel="noreferrer" className=" me-2"> <i className='bi bi-youtube'></i></a>
              <a href={settingData.linkedin} target='_blank' rel="noreferrer" className=" me-2"> <i className='bi bi-linkedin'></i></a>
              <a href={settingData.instagram} target='_blank' rel="noreferrer" className=" me-2"> <i className='bi bi-instagram'></i></a>
              {localStorage.getItem("login") ? (
                <div className="dropdown">
                  <a href="#" className="dropdown-toggle ms-2" data-bs-toggle="dropdown"><small><i
                    className="fa fa-home me-2"></i> {localStorage.getItem("name")}</small></a>
                  <div className="dropdown-menu rounded shadow-sm">
                    <Link to="/profile?option=Profile" className="dropdown-item"><i className="bi bi-person me-2"></i>Profile</Link>
                    {userRole === "Restaurant" && (
                      <Link to="/restaurant/dashboard" className="dropdown-item text-primary fw-bold"><i className="bi bi-shop me-2"></i>Restaurant Portal</Link>
                    )}
                    {userRole === "Admin" || userRole === "Super Admin" ? (
                      <Link to="/admin" className="dropdown-item text-primary fw-bold"><i className="bi bi-speedometer2 me-2"></i>Admin Dashboard</Link>
                    ) : null}
                    <Link to="/profile?option=Wishlist" className="dropdown-item"><i className="bi bi-heart me-2"></i>Wishlist</Link>
                    <Link to="/profile?option=Orders" className="dropdown-item"><i className="bi bi-bag-check me-2"></i>Orders</Link>
                    <Link to="/profile?option=Address" className="dropdown-item"><i className="bi bi-geo-alt me-2"></i>Address</Link>
                    <Link to="/cart" className="dropdown-item"><i className="bi bi-cart me-2"></i>Cart</Link>
                    <Link to="/checkout" className="dropdown-item"><i className="bi bi-credit-card me-2"></i>Checkout</Link>
                    <hr className="dropdown-divider my-1" />
                    <button onClick={logout} className="dropdown-item text-danger"><i className="bi bi-box-arrow-right me-2"></i>Log Out</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className=" me-2">Login</Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid px-5 py-4 d-none d-lg-block">
        <div className="row gx-0 align-items-center text-center">
          <div className="col-md-4 col-lg-3 text-center text-lg-start">
            <div className="d-inline-flex align-items-center">
              <Link to="/" className="navbar-brand p-0">
                <h1 className="display-5 text-primary m-0"><i
                  className="bi bi-bag-check me-2"></i>{settingData.siteName}</h1>
              </Link>
            </div>
          </div>
          <div className="col-md-4 col-lg-6 text-center">
            <div className="position-relative ps-4">
              <form onSubmit={postData}>
                <div className="d-flex border rounded-pill">
                  <input className="form-control border-primary outline-primary w-100 py-3" onChange={(e) => setSearch(e.target.value)} style={{ borderRadius: "30px 0 0 30px" }} type="text"
                    data-bs-target="#dropdownToggle123" placeholder="Search Pizzas by Name, Category, Crust etc" />
                  <button type="submit" className="btn btn-primary py-3 px-5" style={{ borderRadius: "0 30px 30px 0" }} ><i
                    className="fas fa-search"></i></button>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-4 col-lg-3 text-center text-lg-end">
            <div className="d-inline-flex align-items-center">
              <Link to="/profile?option=Wishlist" className=" d-flex align-items-center justify-content-center me-3"><span
                className=""><i className="me-1 fas fa-heart"></i> Wishlist</span></Link>
              <Link to="/cart" className=" d-flex align-items-center justify-content-center"><span
                className=""><i className="me-1 fas fa-shopping-cart"></i> Cart</span></Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid nav-bar p-0">
        <div className="row gx-0 bg-primary px-5 align-items-center">
          <div className="col-lg-3 d-none d-lg-block">
            <nav className="navbar navbar-light position-relative" style={{ width: "250px" }}>
              <button className="navbar-toggler border-0 fs-4 w-100 px-0 text-start" type="button"
                data-bs-toggle="collapse" data-bs-target="#allCat">
                <h4 className="m-0 text-light"><i className="fa fa-bars me-2"></i>Main Categories</h4>
              </button>
              <div className="collapse navbar-collapse rounded-bottom" id="allCat">
                <div className="navbar-nav ms-auto py-0">
                  <ul className="list-unstyled categories-bars">
                    {MaincategoryStateData.filter(x => x.status).map((item, index) => {
                      return <li key={index}>
                        <div className="categories-bars-item">
                          <Link to={`/shop?mc=${item.name}`}>{item.name}</Link>
                        </div>
                      </li>
                    })}
                  </ul>
                </div>
              </div>
            </nav>
          </div>
          <div className="col-12 col-lg-9">
            <nav className="navbar navbar-expand-lg navbar-light bg-primary ">
              <Link to="/" className="navbar-brand d-block d-lg-none">
                <h1 className="display-5 text-light m-0"><i
                  className="bi bi-bag-check text-white me-2"></i>{settingData.siteName}</h1>
              </Link>
              <button className="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarCollapse">
                <span className="fa fa-bars fa-1x"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarCollapse">
                <div className="navbar-nav ms-auto py-0">
                  <Link to="/" className="nav-item nav-link text-light">Home</Link>
                  <Link to="/about" className="nav-item nav-link text-light">About</Link>
                  <Link to="/shop" className="nav-item nav-link text-light">Pizza Menu</Link>
                  <Link to="/feature" className="nav-item nav-link text-light">Feature</Link>
                  <Link to="/faq" className="nav-item nav-link text-light">Faq</Link>
                  <Link to="/testimonial" className="nav-item nav-link text-light">Testimonial</Link>
                  <Link to="/partner-with-us" className="nav-item nav-link text-light"><i className="bi bi-shop me-1"></i>Partner With Us</Link>
                  <Link to="/contact" className="nav-item nav-link text-light">Contact Us</Link>
                  <div className="nav-item dropdown d-block d-lg-none mb-3">
                    <a href="#" className="nav-link  text-light dropdown-toggle" data-bs-toggle="dropdown">Category</a>
                    <div className="dropdown-menu m-0">
                      <ul className="list-unstyled categories-bars">
                        {MaincategoryStateData.filter(x => x.status).map((item, index) => {
                          return <li key={index}>
                            <div className="categories-bars-item">
                              <Link to={`/shop?mc=${item.name}`}>{item.name}</Link>
                            </div>
                          </li>
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
