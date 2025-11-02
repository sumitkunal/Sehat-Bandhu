import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ServiceCard from '../components/serviceCard'
import NewsSlider from '../components/NewsSlider'
import ContactUs from '../components/ContactUs'
import Footer from '../components/Footer'
import './i18n'
import Login from "../components/Login";
import Signup from "../components/Signup";
import DoctorSignup from "../components/DoctorSignup";
import FindDoctor from "../components/findDoctor";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            <Hero />
            <ServiceCard />
            <NewsSlider />
            <ContactUs />
            <Footer />
          </>
        } />
        <Route path="/find-doctor" element={<FindDoctor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/doctor-signup" element={<DoctorSignup />} />
        <Route path="*" element={"not found"} />
      </Routes>
    </Router>
  )
}

export default App
