import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
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
import PatientDashboard from '../components/PatientDashboard';

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup", "/doctor-signup"];

  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <ServiceCard />
            <NewsSlider />
            <ContactUs />
          </>
        } />
        <Route path="/find-doctor" element={<FindDoctor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/doctor-signup" element={<DoctorSignup />} />
        <Route path="/appointments" element={<PatientDashboard />} />
        <Route path="*" element={null} />
      </Routes>

      {/* Optionally show Footer only on certain pages */}
      {shouldShowNavbar && <Footer />}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
