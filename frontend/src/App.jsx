import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Navbar from './Components/Navbar'
import Footer from './Components/Footer'

import HomePage from './Pages/HomePage'
import AboutPage from './Pages/AboutPage'
import ShopPage from './Pages/ShopPage'
import ProductPage from './Pages/ProductPage'
import FeaturePage from './Pages/FeaturePage'
import FaqPage from './Pages/FaqPage'
import TestimonialPage from './Pages/TestimonialPage'
import CartPage from './Pages/User/CartPage'
import CheckoutPage from './Pages/User/CheckoutPage'
import ErrorPage from './Pages/ErrorPage'
import ContactUsPage from './Pages/ContactUsPage'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import TermsAndConditions from './Pages/TermsAndConditions'
import ReturnAndRefundPolicy from './Pages/ReturnAndRefundPolicy'

import SignupPage from './Pages/User/SignupPage'
import LoginPage from './Pages/User/LoginPage'
import ForgetPasswordPage1 from './Pages/User/ForgetPasswordPage1'
import ForgetPasswordPage2 from './Pages/User/ForgetPasswordPage2'
import ForgetPasswordPage3 from './Pages/User/ForgetPasswordPage3'
import ProfilePage from './Pages/User/ProfilePage'
import OrderConfirmation from './Pages/User/OrderConfirmation'
import Payment from './Pages/User/Payment'

import AdminHomePage from './Pages/Admin/AdminHomePage'

import AdminMaincategoryPage from './Pages/Admin/Maincategory/AdminMaincategoryPage'
import AdminMaincategoryCreatePage from './Pages/Admin/Maincategory/AdminMaincategoryCreatePage'
import AdminMaincategoryUpdatePage from './Pages/Admin/Maincategory/AdminMaincategoryUpdatePage'

import AdminSubcategoryPage from './Pages/Admin/Subcategory/AdminSubcategoryPage'
import AdminSubcategoryCreatePage from './Pages/Admin/Subcategory/AdminSubcategoryCreatePage'
import AdminSubcategoryUpdatePage from './Pages/Admin/Subcategory/AdminSubcategoryUpdatePage'

import AdminBrandPage from './Pages/Admin/Brand/AdminBrandPage'
import AdminBrandCreatePage from './Pages/Admin/Brand/AdminBrandCreatePage'
import AdminBrandUpdatePage from './Pages/Admin/Brand/AdminBrandUpdatePage'

import AdminFeaturePage from './Pages/Admin/Feature/AdminFeaturePage'
import AdminFeatureCreatePage from './Pages/Admin/Feature/AdminFeatureCreatePage'
import AdminFeatureUpdatePage from './Pages/Admin/Feature/AdminFeatureUpdatePage'

import AdminFaqPage from './Pages/Admin/Faq/AdminFaqPage'
import AdminFaqCreatePage from './Pages/Admin/Faq/AdminFaqCreatePage'
import AdminFaqUpdatePage from './Pages/Admin/Faq/AdminFaqUpdatePage'

import AdminSettingPage from './Pages/Admin/Setting/AdminSettingPage'

import AdminProductPage from './Pages/Admin/Product/AdminProductPage'
import AdminProductCreatePage from './Pages/Admin/Product/AdminProductCreatePage'
import AdminProductUpdatePage from './Pages/Admin/Product/AdminProductUpdatePage'

import AdminNewsletterPage from './Pages/Admin/Newsletter/AdminNewsletterPage'

import AdminContactUsPage from './Pages/Admin/ContactUs/AdminContactUsPage'
import AdminContactUsShowPage from './Pages/Admin/ContactUs/AdminContactUsShowPage'

import AdminCheckoutPage from './Pages/Admin/Checkout/AdminCheckoutPage'
import AdminCheckoutShowPage from './Pages/Admin/Checkout/AdminCheckoutShowPage'

import AdminUserPage from './Pages/Admin/User/AdminUserPage'
import AdminUserCreatePage from './Pages/Admin/User/AdminUserCreatePage'
import AdminUserUpdatePage from './Pages/Admin/User/AdminUserUpdatePage'




export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='' element={<HomePage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/shop' element={<ShopPage />} />
        <Route path='/product/:_id' element={<ProductPage />} />
        <Route path='/feature' element={<FeaturePage />} />
        <Route path='/faq' element={<FaqPage />} />
        <Route path='/testimonial' element={<TestimonialPage />} />
        <Route path='/contact' element={<ContactUsPage />} />

        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/tc' element={<TermsAndConditions />} />
        <Route path='/refund-policy' element={<ReturnAndRefundPolicy />} />

        <Route path='/signup' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/forget-password-1' element={<ForgetPasswordPage1 />} />
        <Route path='/forget-password-2' element={<ForgetPasswordPage2 />} />
        <Route path='/forget-password-3' element={<ForgetPasswordPage3 />} />


        {/* User Routes */}

        {/* User Protected Routes */}
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/order-confirmation' element={<OrderConfirmation />} />
        <Route path='/payment/:_id' element={<Payment />} />

        {/* Admin Protected Routes */}
        <Route path='/admin' element={<AdminHomePage />} />

        <Route path='/admin/maincategory' element={<AdminMaincategoryPage />} />
        <Route path='/admin/maincategory/create' element={<AdminMaincategoryCreatePage />} />
        <Route path='/admin/maincategory/update/:_id' element={<AdminMaincategoryUpdatePage />} />

        <Route path='/admin/subcategory' element={<AdminSubcategoryPage />} />
        <Route path='/admin/subcategory/create' element={<AdminSubcategoryCreatePage />} />
        <Route path='/admin/subcategory/update/:_id' element={<AdminSubcategoryUpdatePage />} />

        <Route path='/admin/brand' element={<AdminBrandPage />} />
        <Route path='/admin/brand/create' element={<AdminBrandCreatePage />} />
        <Route path='/admin/brand/update/:_id' element={<AdminBrandUpdatePage />} />

        <Route path='/admin/feature' element={<AdminFeaturePage />} />
        <Route path='/admin/feature/create' element={<AdminFeatureCreatePage />} />
        <Route path='/admin/feature/update/:_id' element={<AdminFeatureUpdatePage />} />

        <Route path='/admin/faq' element={<AdminFaqPage />} />
        <Route path='/admin/faq/create' element={<AdminFaqCreatePage />} />
        <Route path='/admin/faq/update/:_id' element={<AdminFaqUpdatePage />} />

        <Route path='/admin/setting' element={<AdminSettingPage />} />

        <Route path='/admin/product' element={<AdminProductPage />} />
        <Route path='/admin/product/create' element={<AdminProductCreatePage />} />
        <Route path='/admin/product/update/:_id' element={<AdminProductUpdatePage />} />

        <Route path='/admin/newsletter' element={<AdminNewsletterPage />} />

        <Route path='/admin/contact' element={<AdminContactUsPage />} />
        <Route path='/admin/contact/show/:_id' element={<AdminContactUsShowPage />} />

        <Route path='/admin/checkout' element={<AdminCheckoutPage />} />
        <Route path='/admin/checkout/show/:_id' element={<AdminCheckoutShowPage />} />

        <Route path='/admin/user' element={<AdminUserPage />} />
        <Route path='/admin/user/create' element={<AdminUserCreatePage />} />
        <Route path='/admin/user/update/:_id' element={<AdminUserUpdatePage />} />



        <Route path='/*' element={<ErrorPage />} />

      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
