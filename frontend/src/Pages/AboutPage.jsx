import React from 'react'
import Breadcrum from '../Components/Breadcrum'
import About from '../Components/About'
import ContactDetails from '../Components/ContactDetails'
import Feature from '../Components/Feature'
import Faq from '../Components/Faq'
import Testimonial from '../Components/Testimonial'

export default function AboutPage() {
    return (
        <>
            <Breadcrum title="About Us" />
            <About />
            <ContactDetails />
            <Feature />
            <Faq />
            <Testimonial />
        </>
    )
}
