import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || "http://localhost:3000";

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const slotOptions = [
    "09:00 AM - 09:30 AM",
    "09:30 AM - 10:00 AM",
    "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "12:00 PM - 12:30 PM",
    "02:00 PM - 02:30 PM",
    "02:30 PM - 03:00 PM",
    "03:00 PM - 03:30 PM",
    "04:00 PM - 04:30 PM",
  ];

  // Load Doctor Info & Appointments
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/doctor/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data);

        const appRes = await axios.get(`${backendUrl}/doctor/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(appRes.data);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (!doctor) return null;

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const saveAvailability = async () => {
    if (!availabilityDate) {
      setMessage("Please select a date.");
      return;
    }
    if (selectedSlots.length === 0) {
      setMessage("Please select at least one time slot.");
      return;
    }

    const token = localStorage.getItem("token");
    setSaving(true);
    setMessage("");

    try {
      await axios.post(
        `${backendUrl}/doctor/set-availability`,
        {
          date: availabilityDate,
          slots: selectedSlots,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Availability saved successfully!");
      setSelectedSlots([]);
      setAvailabilityDate("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden py-16 px-6 text-white">
      {/* Animated Background */}
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

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center mb-12 shadow-lg"
        >
          <div>
            <h2 className="text-2xl font-semibold">
              Welcome, Dr. {doctor.profile?.name}
            </h2>
            <p className="opacity-90 mt-2 text-white">
              Manage appointments and set your availability.
            </p>
          </div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/387/387561.png"
            alt="Doctor"
            className="w-28 h-28 mt-4 md:mt-0"
          />
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 backdrop-blur-md shadow-lg mb-12"
        >
          <h3 className="text-lg font-semibold mb-4 text-emerald-400">
            Upcoming Appointments
          </h3>

          {appointments.length === 0 ? (
            <p className="text-gray-400">No upcoming appointments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead className="bg-gray-800/70 text-gray-400 text-sm">
                  <tr>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Age</th>
                    <th className="p-3">Symptoms</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="p-3">{a.patientName}</td>
                      <td className="p-3">{a.age}</td>
                      <td className="p-3">{a.symptoms}</td>
                      <td className="p-3">{a.date}</td>
                      <td className="p-3">{a.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Availability Manager */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 backdrop-blur-md shadow-lg"
        >
          <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <Calendar size={18} /> Set Availability
          </h3>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Select Date */}
            <div>
              <label className="text-sm text-gray-300">Select Date</label>
              <input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white"
              />
            </div>

            {/* Select Slots */}
            <div>
              <label className="text-sm text-gray-300">Select Time Slots</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {slotOptions.map((slot) => {
                  const active = selectedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      className={`p-2 rounded-md border text-sm ${
                        active
                          ? "border-emerald-400 bg-emerald-900/30"
                          : "border-gray-700 bg-gray-800"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={saveAvailability}
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 text-black rounded-lg font-semibold hover:brightness-95"
            >
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </div>

          {message && (
            <p className="text-center mt-4 text-emerald-400">{message}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
