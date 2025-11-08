import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  location: string;
  education: string;
  experience: number;
  image: string;
}

const FindDoctor: React.FC = () => {
  const { t } = useTranslation("findDoctor"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    specialization: "",
    location: "",
    education: "",
  });

  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Amandeep Aggarwal",
      specialization: "General Physician",
      location: "Sangrur",
      education: "MBBS",
      experience: 32,
      image: "https://assets.lybrate.com/f_auto,c_limit,w_384,q_auto/img/documents/doctor/dp/729e93c1d6618f007dc3ca47b4085a06/Family-Medicine-AmandeepAggarwal-Sangrur-b1d3c5",
    },
    {
      id: 2,
      name: "Dr. Lipy Gupta ",
      specialization: "Dermatologist",
      location: "Delhi",
      education: "MBBS, MD (Dermatology)",
      experience: 15,
      image: "https://drlipygupta.com/wp-content/uploads/2019/05/IMG_4419-684x1024.jpg",
    },
    {
      id: 3,
      name: "DR. ANAND SUDE",
      specialization: "Pediatrician",
      location: "Mumbai",
      education: "MBBS, MD (Pediatrics)",
      experience: 12,
      image: "https://mangalprabhu.com/wp-content/uploads/2020/04/Dr.-Anand-Sude.jpg",
    },
    {
      id: 4,
      name: "Dr. Soham Mandal",
      specialization: "Orthopedic Surgeon",
      location: "Kolkata",
      education: "MBBS, MS (Orthopedics)",
      experience: 15,
      image: "https://ortho360degree.com/wp-content/uploads/2024/08/Doctors-in-Kolkata.png",
    },
    {
      id: 5,
      name: "Dr. Aditi Sharma",
      specialization: "Cardiologist",
      location: "Delhi",
      education: "MBBS, MD (Cardiology)",
      experience: 10,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
        {
      id: 6,
      name: "Dr. Rajesh Kumar",
      specialization: "Dermatologist",
      location: "Mumbai",
      education: "MBBS, MD (Dermatology)",
      experience: 8,
      image: "https://randomuser.me/api/portraits/men/41.jpg",
    },
    {
      id: 7,
      name: "Dr. Priya Nair",
      specialization: "Pediatrician",
      location: "Bangalore",
      education: "MBBS, DCH, MD (Pediatrics)",
      experience: 12,
      image: "https://randomuser.me/api/portraits/women/47.jpg",
    },
    {
      id: 8,
      name: "Dr. Arjun Mehta",
      specialization: "Orthopedic Surgeon",
      location: "Chennai",
      education: "MBBS, MS (Orthopedics)",
      experience: 15,
      image: "https://randomuser.me/api/portraits/men/45.jpg",
    },
  ];

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter.specialization
        ? doctor.specialization === filter.specialization
        : true) &&
      (filter.location ? doctor.location === filter.location : true) &&
      (filter.education ? doctor.education.includes(filter.education) : true)
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden py-16 px-6">
      {/*  Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              scale: [
                Math.random() * 0.5 + 0.5,
                Math.random() * 1 + 1,
                Math.random() * 0.5 + 0.5,
              ],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              filter: "blur(50px)",
            }}
          />
        ))}
      </div>

      {/*  Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300 text-transparent bg-clip-text">
          {t("findDoctors")}
        </h1>

        {/*  Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/70 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-lg mb-12"
        >
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder={t("searchDoctor")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <select
              value={filter.specialization}
              onChange={(e) =>
                setFilter({ ...filter, specialization: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">{t("specialization")}</option>
              <option value="Cardiologist">{t("Cardiologist")}</option>
              <option value="Dermatologist">{t("Dermatologist")}</option>
              <option value="Pediatrician">{t("Pediatrician")}</option>
              <option value="Orthopedic Surgeon">{t("OrthopedicSurgeon")}</option>
            </select>

            <select
              value={filter.location}
              onChange={(e) => setFilter({ ...filter, location: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">{t("location")}</option>
              <option value="Delhi">{t("Delhi")}</option>
              <option value="Mumbai">{t("Mumbai")}</option>
              <option value="Bangalore">{t("Bangalore")}</option>
              <option value="Chennai">{t("Chennai")}</option>
            </select>

            <select
              value={filter.education}
              onChange={(e) =>
                setFilter({ ...filter, education: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">{t("education")}</option>
              <option value="MBBS">{t("MBBS")}</option>
              <option value="MD">{t("MD")}</option>
              <option value="MS">{t("MS")}</option>
              <option value="DCH">{t("DCH")}</option>
            </select>
          </div>
        </motion.div>

        {/*  Doctors Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-md p-6 text-center transition-all backdrop-blur-sm hover:shadow-emerald-500/20"
            >
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-emerald-400"
              />
              <h2 className="text-lg font-semibold text-white">
                {doctor.name}
              </h2>
              <p className="text-emerald-400 font-medium">
                {t(doctor.specialization)}
              </p>
              <p className="text-sm text-gray-400 mt-1">{doctor.education}</p>
              <p className="text-sm text-gray-500">{t(doctor.location)}</p>
              <p className="text-sm text-gray-500">
                {doctor.experience} {t("yearsExperience")}
              </p>
              <button className="mt-3 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 hover:opacity-90 text-white py-2 px-4 rounded-lg transition-all font-medium shadow-md">
                {t("bookAppointment")}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {filteredDoctors.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            {t("noDoctorsFound")}
          </p>
        )}
      </div>
    </div>
  );
};

export default FindDoctor;
