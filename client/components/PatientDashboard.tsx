import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3000";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Doctor + Patient appointments
  const [appointments, setAppointments] = useState<any[]>([]);

  // Doctor Availability
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

  const patientReports = [
    { name: "Glucose", date: "02/11/2023" },
    { name: "Blood Count", date: "02/11/2023" },
    { name: "Full Body X-Ray", date: "02/11/2023" },
    { name: "Hepatitis Panel", date: "02/11/2023" },
    { name: "Calcium", date: "02/11/2023" },
  ];

  // Load user & role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token || !storedRole) {
      navigate("/login");
      return;
    }

    setRole(storedRole);

    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);

        // ------------------------------------------
        // FIXED: FETCH APPOINTMENTS FOR PATIENT
        // ------------------------------------------
        if (storedRole === "patient") {
          const appRes = await axios.get(`${backendUrl}/appointments/patient`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = appRes.data;

          if (Array.isArray(data)) setAppointments(data);
          else if (Array.isArray(data?.appointments))
            setAppointments(data.appointments);
          else setAppointments([]);
        }

        // FETCH APPOINTMENTS FOR DOCTOR
        if (storedRole === "doctor") {
          const appRes = await axios.get(`${backendUrl}/appointments/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = appRes.data;

          if (Array.isArray(data)) setAppointments(data);
          else if (Array.isArray(data?.appointments))
            setAppointments(data.appointments);
          else setAppointments([]);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const saveAvailability = async () => {
    if (!availabilityDate) return setMessage("Please select a date.");
    if (selectedSlots.length === 0)
      return setMessage("Select at least one time slot.");

    const token = localStorage.getItem("token");
    setSaving(true);

    try {
      await axios.post(
        `${backendUrl}/set-availability`,
        { date: availabilityDate, slots: selectedSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Availability saved!");
      setAvailabilityDate("");
      setSelectedSlots([]);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save availability.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden py-16 px-6 text-white">

      {/* Background Animation */}
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
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            style={{
              width: `${Math.random() * 250 + 80}px`,
              height: `${Math.random() * 250 + 80}px`,
              filter: "blur(40px)",
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center mb-12"
        >
          <div>
            <h2 className="text-2xl font-semibold">
              {role === "doctor"
                ? `Welcome, Dr. ${user?.profile?.name}`
                : `Welcome back, ${user?.profile?.name || "Patient"}`}
            </h2>

            <p className="opacity-90 mt-2 text-white">
              {role === "doctor"
                ? "Manage appointments and availability."
                : "Track your health and appointments."}
            </p>
          </div>

          <img
            src="https://cdn-icons-png.flaticon.com/512/387/387561.png"
            className="w-28 h-28 mt-4 md:mt-0"
          />
        </motion.div>

        {/* ========================== PATIENT DASHBOARD ============================= */}
        {role === "patient" ? (
          <>
            {/* Vitals */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12"
            >
              {[
                { label: "Body Temperature", value: "36.2°C" },
                { label: "Pulse", value: "85 bpm" },
                { label: "Blood Pressure", value: "120/80 mmHg" },
                { label: "Breathing Rate", value: "15 breaths/m" },
              ].map((v, i) => (
                <div
                  key={i}
                  className="bg-gray-900/60 border border-gray-700 p-4 rounded-xl text-center shadow-lg"
                >
                  <p className="text-gray-400 text-sm">{v.label}</p>
                  <p className="text-xl text-emerald-400 mt-1">{v.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Reports + Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Appointments */}
              <motion.div className="lg:col-span-2 bg-gray-900/70 p-6 border border-gray-700 rounded-2xl shadow-xl">
                <h3 className="text-lg text-emerald-400 mb-4">Appointments</h3>

                {appointments.length === 0 ? (
                  <p className="text-gray-400">No appointments yet.</p>
                ) : (
                  <table className="w-full text-left text-gray-300">
                    <thead className="text-gray-400 bg-gray-800/70 text-sm">
                      <tr>
                        <th className="p-3">Doctor</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a, i) => (
                        <tr key={i} className="border-t border-gray-700">
                          <td className="p-3">{a.doctorName}</td>
                          <td className="p-3">{a.date}</td>
                          <td className="p-3">{a.time}</td>
                          <td className="p-3 text-emerald-400">{a.status}</td>
                          <td className="p-3">
                            {/* navigate to /video/:roomId where roomId = appointment id */}
                            <button
                              onClick={() => navigate(`/video/${a.id ?? a._id}`)}
                              className="px-3 py-1 bg-emerald-500 text-black rounded-md font-medium hover:brightness-95"
                            >
                              Join Video
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </motion.div>

              {/* Reports */}
              <motion.div className="bg-gray-900/70 p-6 border border-gray-700 rounded-2xl shadow-xl">
                <h3 className="text-lg text-emerald-400 mb-4">My Reports</h3>
                <ul className="space-y-3">
                  {patientReports.map((r, i) => (
                    <li
                      key={i}
                      className="flex justify-between p-3 bg-gray-800/60 border border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-emerald-400" />
                        {r.name}
                      </div>
                      <span className="text-sm text-gray-400">{r.date}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </>
        ) : (
          /* ===================== DOCTOR DASHBOARD ======================= */
          <>
            <motion.div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 shadow-xl mb-12">
              <h3 className="text-lg text-emerald-400 mb-4">Upcoming Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-gray-400">No upcoming appointments.</p>
              ) : (
                <table className="w-full text-left text-gray-300">
                  <thead className="text-gray-400 bg-gray-800/70 text-sm">
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
                        <td className="p-3">
                          {/* navigate to /video/:roomId where roomId = appointment id */}
                          <button
                            onClick={() => navigate(`/video/${a.id ?? a._id}`)}
                            className="px-3 py-1 bg-emerald-500 text-black rounded-md font-medium hover:brightness-95"
                          >
                            Join Video
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>

            {/* Availability Manager */}
            <motion.div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg text-emerald-400 mb-4 flex items-center gap-2">
                <Calendar size={18} /> Set Availability
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-300">Select Date</label>
                  <input
                    type="date"
                    value={availabilityDate}
                    onChange={(e) => setAvailabilityDate(e.target.value)}
                    className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Select Time Slots</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {slotOptions.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        className={`p-2 rounded-md border text-sm ${selectedSlots.includes(slot)
                          ? "border-emerald-400 bg-emerald-900/30"
                          : "border-gray-700 bg-gray-800"
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
