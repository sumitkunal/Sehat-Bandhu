import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendUrl = (import.meta as any)?.env?.VITE_BACKEND_URL || "http://localhost:3000";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  state: string;
  education: string;
  experience: number;
  image: string;
}

interface Slot {
  id: string;
  date: string; // ISO
  slot: string; // "10:00 AM - 10:30 AM"
}

const FindDoctor: React.FC = () => {
  const { t } = useTranslation("findDoctor");
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ specialization: "", location: "", education: "" });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // patient form fields
  const [allergiesInput, setAllergiesInput] = useState("");
  const [chronicInput, setChronicInput] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const [temperature, setTemperature] = useState("");
  const [pulse, setPulse] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [breathingRate, setBreathingRate] = useState("");

  // Load Doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${backendUrl}/getdoc`);
        const data = await res.json();

        const updatedData = data.map((doc: Doctor) => ({
          ...doc,
          image: doc.image && doc.image.startsWith("data:") ? doc.image : "https://via.placeholder.com/150",
        }));

        setDoctors(updatedData);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter.specialization ? doctor.specialization === filter.specialization : true) &&
      (filter.location ? doctor.location === filter.location : true) &&
      (filter.education ? doctor.education.includes(filter.education) : true)
  );

  // open booking modal -> check auth
  const onBookClick = async (doctor: Doctor) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // not logged in
      navigate("/login");
      return;
    }

    // reset modal state
    setSelectedDoctor(doctor);
    setSelectedSlotId(null);
    setAllergiesInput("");
    setChronicInput("");
    setBloodGroup("");
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalOpen(true);

    // fetch available slots
    setSlotsLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/doctor/${doctor.id}/slots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // expecting { slots: Slot[] }
      setSlots(res.data?.slots || []);
    } catch (err) {
      console.error("Failed to fetch slots", err);
      setErrorMsg("Failed to load available slots. Try again later.");
    } finally {
      setSlotsLoading(false);
    }
  };

  const validateBooking = () => {
    if (!age || Number(age) <= 0) return setErrorMsg("Age is required");
    if (!gender) return setErrorMsg("Gender is required");
    if (!symptoms.trim()) return setErrorMsg("Symptoms are required");
    if (!selectedSlotId) return setErrorMsg("Please select a slot");
    setErrorMsg(null);
    return true;
  };


  const submitBooking = async () => {
    if (!selectedDoctor) return;
    if (!validateBooking()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    setErrorMsg(null);
    try {
      const body = {
        doctorId: selectedDoctor.id,
        slotId: selectedSlotId,
        allergies: allergiesInput ? allergiesInput.split(",").map(s => s.trim()).filter(Boolean) : [],
        chronicDiseases: chronicInput ? chronicInput.split(",").map(s => s.trim()).filter(Boolean) : [],
        bloodGroup,
      };

      const res = await axios.post(`${backendUrl}/appointments/book`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg("Appointment booked successfully.");
      // optionally remove booked slot from UI
      setSlots(prev => prev.filter(s => s.id !== selectedSlotId));
      // close modal after short delay
      setTimeout(() => {
        setModalOpen(false);
      }, 1200);
    } catch (err: any) {
      console.error("Booking error", err);
      const msg = err?.response?.data?.message || "Failed to book appointment";
      setErrorMsg(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-white text-center mt-20 text-lg">
        Loading doctors...
      </p>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden py-16 px-6">
      {/* Search + Filters */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300 text-transparent bg-clip-text">
          {t("findDoctors")}
        </h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/70 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-lg mb-12">
          <div className="grid md:grid-cols-4 gap-4">
            <input type="text" placeholder={t("searchDoctor")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" />

            <select value={filter.specialization} onChange={(e) => setFilter({ ...filter, specialization: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
              <option value="">{t("specialization")}</option>
              <option value="Cardiologist">{t("Cardiologist")}</option>
              <option value="Dermatologist">{t("Dermatologist")}</option>
              <option value="Pediatrician">{t("Pediatrician")}</option>
              <option value="Orthopedic Surgeon">{t("OrthopedicSurgeon")}</option>
            </select>

            <select value={filter.location} onChange={(e) => setFilter({ ...filter, location: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
              <option value="">{t("location")}</option>
              {[...new Set(doctors.map((d) => d.location))].map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>

            <select value={filter.education} onChange={(e) => setFilter({ ...filter, education: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
              <option value="">{t("education")}</option>
              <option value="MBBS">MBBS</option>
              <option value="MD">MD</option>
              <option value="MS">MS</option>
            </select>
          </div>
        </motion.div>

        {/* Doctors Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredDoctors.map((doctor) => (
            <motion.div key={doctor.id} whileHover={{ scale: 1.05 }} className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-md p-6 text-center">
              <img src={doctor.image} alt={doctor.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-emerald-400" />
              <h2 className="text-lg font-semibold text-white">{doctor.name}</h2>
              <p className="text-emerald-400 font-medium">{doctor.specialization}</p>
              <p className="text-sm text-gray-400 mt-1">{doctor.education}</p>
              <p className="text-sm text-gray-500">{doctor.location}</p>
              <p className="text-sm text-gray-500">{doctor.experience} years</p>

              <button onClick={() => onBookClick(doctor)} className="mt-3 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 text-white py-2 px-4 rounded-lg">
                {t("bookAppointment")}
              </button>
            </motion.div>
          ))}
        </div>

        {filteredDoctors.length === 0 && <p className="text-center text-gray-400 mt-10">{t("noDoctorsFound")}</p>}
      </div>

      {/* Booking Modal */}
      {modalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl bg-gray-900/85 border border-gray-700 rounded-2xl shadow-2xl p-6 z-60"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-white">
                Book Appointment with {selectedDoctor.name}
              </h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>

            {/* Required Patient Information */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">

              {/* AGE */}
              <div>
                <label className="text-sm text-gray-300">Age *</label>
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  type="number"
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Enter age"
                />
              </div>

              {/* GENDER */}
              <div>
                <label className="text-sm text-gray-300">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* SYMPTOMS */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Symptoms *</label>
                <input
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Describe your symptoms"
                />
              </div>

              {/* BODY TEMPERATURE */}
              <div>
                <label className="text-sm text-gray-300">Body Temperature (°C) (optional)*</label>
                <input
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  type="number"
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. 98.6"
                />
              </div>

              {/* PULSE */}
              <div>
                <label className="text-sm text-gray-300">Pulse (bpm)(optional) *</label>
                <input
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  type="number"
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. 72"
                />
              </div>

              {/* BLOOD PRESSURE */}
              <div>
                <label className="text-sm text-gray-300">Blood Pressure (mmHg) (optional) *</label>
                <input
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. 120/80"
                />
              </div>

              {/* BREATHING RATE */}
              <div>
                <label className="text-sm text-gray-300">Breathing Rate (breaths/min) (optional) *</label>
                <input
                  value={breathingRate}
                  onChange={(e) => setBreathingRate(e.target.value)}
                  type="number"
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. 16"
                />
              </div>

            </div>

            {/* Optional Fields */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="text-sm text-gray-300">Allergies (optional)</label>
                <input
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Penicillin"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300">Chronic Diseases (optional)</label>
                <input
                  value={chronicInput}
                  onChange={(e) => setChronicInput(e.target.value)}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Diabetes"
                />
              </div>
            </div>

            {/* Slots Section */}
            <div className="mt-6">
              <h4 className="text-sm text-gray-300 mb-2">Available Slots</h4>

              {slotsLoading ? (
                <p className="text-gray-400">Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-gray-400">No slots available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {slots.map((s) => {
                    const isSelected = selectedSlotId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlotId(s.id)}
                        className={`text-left p-3 rounded-md border ${isSelected
                            ? "border-emerald-400 bg-emerald-900/30"
                            : "border-gray-700 bg-gray-800"
                          }`}
                      >
                        <div className="text-sm text-white font-medium">{s.slot}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(s.date).toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error / Success */}
            {errorMsg && <p className="text-red-400 mt-4">{errorMsg}</p>}
            {successMsg && <p className="text-green-400 mt-4">{successMsg}</p>}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-md bg-gray-700 text-white"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>

              <button
                disabled={bookingLoading}
                onClick={submitBooking}
                className="px-4 py-2 rounded-md bg-emerald-500 text-black font-semibold"
              >
                {bookingLoading ? "Booking..." : "Confirm & Book"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default FindDoctor;
