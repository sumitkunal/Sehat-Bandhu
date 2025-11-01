import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Hero from '../components/Hero'
import ServiceCard from '../components/serviceCard'
import NewsSlider from '../components/NewsSlider'
import ContactUs from '../components/ContactUs'
import Footer from '../components/Footer'
import './i18n'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <ServiceCard/>
            <NewsSlider />
            <ContactUs />
            <Footer/>
          </>
          } />
          <Route path = "*" element= {"not found"} />;
      </Routes>
    </Router>
  )
}

export default App
