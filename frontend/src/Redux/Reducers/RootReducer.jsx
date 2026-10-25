import { combineReducers } from "@reduxjs/toolkit";
import MaincategoryReducer from "./MaincategoryReducer";
import SubcategoryReducer from "./SubcategoryReducer";
import BrandReducer from "./BrandReducer";
import ProductReducer from "./ProductReducer";
import FeatureReducer from "./FeatureReducer";
import FaqReducer from "./FaqReducer";
import SettingReducer from "./SettingReducer";
import CartReducer from "./CartReducer";
import WishlistReducer from "./WishlistReducer";
import CheckoutReducer from "./CheckoutReducer";
import TestimonialReducer from "./TestimonialReducer";
import NewsletterReducer from "./NewsletterReducer";
import ContactUsReducer from "./ContactUsReducer";
import UserReducer from "./UserReducer";
import CategoryReducer from "./CategoryReducer";

export default combineReducers({
    MaincategoryStateData: MaincategoryReducer,
    SubcategoryStateData: SubcategoryReducer,
    CategoryStateData: CategoryReducer,
    BrandStateData: BrandReducer,
    ProductStateData: ProductReducer,
    FeatureStateData: FeatureReducer,
    FaqStateData: FaqReducer,
    SettingStateData: SettingReducer,
    CartStateData: CartReducer,
    WishlistStateData: WishlistReducer,
    CheckoutStateData: CheckoutReducer,
    TestimonialStateData: TestimonialReducer,
    NewsletterStateData: NewsletterReducer,
    ContactUsStateData: ContactUsReducer,
    UserStateData: UserReducer,
})