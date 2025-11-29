import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendUrl = (import.meta as any)?.env?.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Types
 */
interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  location?: string;
  state?: string;
  education?: string;
  experience?: number;
  image?: string;
  specialties?: string[];
  language?: string[];
  [k: string]: any;
}

interface Slot {
  id: string;
  date: string;
  slot: string; // human readable time range
}

const FindDoctor: React.FC = () => {
  const { t } = useTranslation("findDoctor");
  const navigate = useNavigate();

  // --- Search & Data States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ specialization: "", location: "", education: "" });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Modal & Booking States ---
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // NEW: State to track the currently selected date filter
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // --- Form Inputs ---
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("");
  const [pulse, setPulse] = useState<string>("");
  const [bloodPressure, setBloodPressure] = useState<string>("");
  const [breathingRate, setBreathingRate] = useState<string>("");
  const [allergiesInput, setAllergiesInput] = useState<string>("");
  const [chronicInput, setChronicInput] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ----------------------------------------------------
  // 1. LOAD DOCTORS
  // ----------------------------------------------------
  useEffect(() => {
    let mounted = true;
    const loadDoctors = async () => {
      try {
        const res = await fetch(`${backendUrl}/getdoc`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          if (mounted) setDoctors([]);
          return;
        }

        const mapped: Doctor[] = data.map((doc: any) => {
          const id = String(doc.id ?? doc._id ?? doc.user?.id ?? "");
          return {
            id,
            name: doc.name ?? doc.user?.profile?.name ?? "Unknown",
            specialization: doc.specialization ?? doc.specialties?.[0] ?? "General",
            location: doc.location ?? doc.user?.profile?.address?.district ?? "Unknown",
            state: doc.state ?? doc.user?.profile?.address?.state ?? "",
            education: doc.education ?? "MBBS",
            experience: typeof doc.experience === "number" ? doc.experience : (doc.yearOfExperience ? Number(doc.yearOfExperience) : 0),
            image: doc.image ?? (doc.user?.profile?.avatar ? doc.user.profile.avatar : "https://via.placeholder.com/150"),
            specialties: Array.isArray(doc.specialties) ? doc.specialties : undefined,
            language: Array.isArray(doc.language) ? doc.language : undefined,
            raw: doc,
          } as Doctor;
        });

        if (mounted) setDoctors(mapped);
      } catch (err) {
        console.error("Error loading doctors:", err);
        if (mounted) setDoctors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDoctors();
    return () => { mounted = false; };
  }, []);

  // ----------------------------------------------------
  // 2. DATA GROUPING LOGIC (NEW)
  // ----------------------------------------------------

  // Group slots by date: { "2024-11-25": [Slot, Slot], "2024-11-26": [...] }
  const slotsByDate = useMemo(() => {
    const groups: Record<string, Slot[]> = {};
    slots.forEach((s) => {
      // Ensure we use the date string as key
      const d = s.date || "Unknown Date";
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(s);
    });
    return groups;
  }, [slots]);

  // Get unique dates for the tabs
  const uniqueDates = useMemo(() => Object.keys(slotsByDate), [slotsByDate]);

  // Auto-select the first date when slots change
  useEffect(() => {
    if (uniqueDates.length > 0) {
      // Only reset if the currently selected date isn't in the new list
      if (!selectedDate || !uniqueDates.includes(selectedDate)) {
        setSelectedDate(uniqueDates[0]);
      }
    } else {
      setSelectedDate(null);
    }
  }, [uniqueDates, selectedDate]);

  // ----------------------------------------------------
  // 3. HANDLERS
  // ----------------------------------------------------
  const onBookClick = async (doctor: Doctor) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setSelectedDoctor(doctor);
    setModalOpen(true);
    setSelectedSlotId(null);
    setSuccessMsg(null);
    setErrorMsg(null);
    setSlots([]);
    setSelectedDate(null);

    setSlotsLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/doctor/${doctor.id}/slots`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const serverSlots = res.data?.slots;
      if (!Array.isArray(serverSlots)) {
        setSlots([]);
      } else {
        const normalized: Slot[] = serverSlots.map((s: any, idx: number) => ({
          id: String(s.id ?? `${s.date ?? ""}-${s.slot ?? ""}-${idx}`),
          date: String(s.date ?? ""),
          slot: String(s.slot ?? (s.time ?? "")),
        }));
        setSlots(normalized);
      }
    } catch (err) {
      console.error("Slots fetch error", err);
      setErrorMsg("Failed to load slots.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const validateBooking = () => {
    if (!age.trim()) { setErrorMsg("Age is required"); return false; }
    if (!gender.trim()) { setErrorMsg("Gender is required"); return false; }
    if (!symptoms.trim()) { setErrorMsg("Symptoms are required"); return false; }
    if (!selectedSlotId) { setErrorMsg("Please select a slot"); return false; }
    setErrorMsg(null);
    return true;
  };

  const submitBooking = async () => {
    if (!validateBooking() || !selectedDoctor || !selectedSlotId) return;

    const slotDetails = slots.find((s) => s.id === selectedSlotId);
    if (!slotDetails) {
      setErrorMsg("Invalid slot selected");
      return;
    }

    // const token = localStorage.getItem("token");
    setBookingLoading(true);
    try {
      const parsedAge = Number(age);
      const parsedTemp = temperature.trim() ? parseFloat(temperature) : undefined;
      const parsedPulse = pulse.trim() ? Number(pulse) : undefined;
      const parsedBreathing = breathingRate.trim() ? Number(breathingRate) : undefined;

      const body = {
        doctorId: selectedDoctor.id,
        slotId: selectedSlotId,
        date: slotDetails.date,
        time: slotDetails.slot,
        age: Number.isNaN(parsedAge) ? 0 : parsedAge,
        gender,
        symptoms,
        temperature: parsedTemp,
        pulse: parsedPulse,
        bloodPressure: bloodPressure || undefined,
        breathingRate: parsedBreathing,
        allergies: allergiesInput ? allergiesInput.split(",").map(s => s.trim()).filter(Boolean) : [],
        chronicDiseases: chronicInput ? chronicInput.split(",").map(s => s.trim()).filter(Boolean) : []
      };

      // Save booking details to localStorage
      localStorage.setItem("pendingBooking", JSON.stringify(body));

      // Redirect to payment page
      navigate("/payment");

    } catch (err: any) {
      console.error("Booking preparation error:", err);
      setErrorMsg("Failed to proceed to payment.");
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((d) =>
    (d.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter.specialization ? (d.specialization ?? "") === filter.specialization : true) &&
    (filter.location ? (d.location ?? "") === filter.location : true) &&
    (filter.education ? (d.education ?? "") === filter.education : true)
  );

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen px-6 py-16 text-white bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <h1 className="text-4xl sm:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text">
        {t("findDoctors")}
      </h1>

      {/* Filters */}
      <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700 mb-12">
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={t("searchDoctor")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
          <select
            value={filter.specialization}
            onChange={(e) => setFilter({ ...filter, specialization: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Specialization</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Pediatrician">Pediatrician</option>
            <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
          </select>
          <select
            value={filter.location}
            onChange={(e) => setFilter({ ...filter, location: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Location</option>
            {[...new Set(doctors.map((d) => d.location ?? ""))].map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            value={filter.education}
            onChange={(e) => setFilter({ ...filter, education: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Education</option>
            <option value="MBBS">MBBS</option>
            <option value="MD">MD</option>
            <option value="MS">MS</option>
          </select>
        </div>
      </div>

      {/* Doctor List */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredDoctors.map((doctor) => (
          <motion.div
            key={doctor.id}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-md p-6 text-center"
          >
            <img
              src={doctor.image || "https://via.placeholder.com/150"}
              alt={doctor.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-2 border-emerald-400"
            />
            <h2 className="text-lg font-semibold">{doctor.name}</h2>
            <p className="text-emerald-400">{doctor.specialization}</p>
            <p className="text-gray-400 text-sm">{doctor.education}</p>
            <p className="text-gray-500 text-sm">{doctor.location}</p>
            <button
              onClick={() => onBookClick(doctor)}
              className="mt-4 bg-emerald-500 text-black px-4 py-2 rounded-lg"
            >
              {t("bookAppointment")}
            </button>
          </motion.div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <p className="text-center text-gray-400 mt-10">No doctors found</p>
      )}

      {/* Modal */}
      {modalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h3 className="text-lg font-bold mb-4">Book with {selectedDoctor.name}</h3>

            {/* FORM FIELDS */}
            <div className="grid grid-cols-2 gap-4">
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age *"
                className="bg-gray-800 p-2 rounded text-white border border-gray-700"
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-gray-800 p-2 rounded text-white border border-gray-700"
              >
                <option value="">Gender *</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <input
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Symptoms *"
              className="bg-gray-800 p-2 mt-3 rounded w-full text-white border border-gray-700"
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <input value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="Temperature" className="bg-gray-800 p-2 rounded text-white border border-gray-700" />
              <input value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="Pulse" className="bg-gray-800 p-2 rounded text-white border border-gray-700" />
              <input value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="Blood Pressure" className="bg-gray-800 p-2 rounded text-white border border-gray-700" />
              <input value={breathingRate} onChange={(e) => setBreathingRate(e.target.value)} placeholder="Breathing Rate" className="bg-gray-800 p-2 rounded text-white border border-gray-700" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 mb-6">
              <input value={allergiesInput} onChange={(e) => setAllergiesInput(e.target.value)} placeholder="Allergies (comma separated)" className="bg-gray-800 p-2 rounded text-white border border-gray-700" />
              <input value={chronicInput} onChange={(e) => setChronicInput(e.target.value)} placeholder="Chronic diseases" className="bg-gray-800 p-2 rounded text-white border border-gray-700" />
            </div>

            {/* --- NEW DATE & TIME SLOT SECTION --- */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-gray-300 font-semibold mb-2">Available Slots</h4>

              {slotsLoading ? (
                <p className="text-gray-400 text-center py-4">Loading slots...</p>
              ) : uniqueDates.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No slots available for this doctor.</p>
              ) : (
                <>
                  {/* Date Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-thin scrollbar-thumb-gray-600">
                    {uniqueDates.map((date) => {
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlotId(null); // Reset time when date changes
                          }}
                          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-colors ${isSelected
                            ? "bg-emerald-500 text-black font-semibold"
                            : "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                            }`}
                        >
                          {date}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time Slots for Selected Date */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-40 overflow-y-auto pr-1">
                    {selectedDate && slotsByDate[selectedDate]?.map((s) => {
                      const isSelected = selectedSlotId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSlotId(s.id)}
                          className={`px-2 py-2 rounded text-xs sm:text-sm border transition-all ${isSelected
                            ? "border-emerald-400 bg-emerald-900/30 text-white"
                            : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
                            }`}
                        >
                          {s.slot}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            {/* --- END NEW SECTION --- */}

            {errorMsg && <p className="text-red-400 mt-3 text-sm text-center">{errorMsg}</p>}
            {successMsg && <p className="text-emerald-400 mt-3 text-sm text-center">{successMsg}</p>}

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-700 pt-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                Cancel
              </button>
              <button
                onClick={submitBooking}
                disabled={bookingLoading}
                className={`px-4 py-2 rounded text-black font-semibold transition-colors ${bookingLoading ? "bg-emerald-700 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-400"
                  }`}
              >
                {bookingLoading ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctor;