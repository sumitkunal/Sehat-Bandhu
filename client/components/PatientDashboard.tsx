import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const reports = [
    { name: "Glucose", date: "02/11/2023" },
    { name: "Blood Count", date: "02/11/2023" },
    { name: "Full Body X-Ray", date: "02/11/2023" },
    { name: "Hepatitis Panel", date: "02/11/2023" },
    { name: "Calcium", date: "02/11/2023" },
  ];

  const appointments = [
    {
      doctor: "Dr. Arjun Mehta",
      specialization: "Orthopedic Surgeon",
      date: "2025-11-08",
      time: "03:00 PM",
      status: "Scheduled",
    },
  ];
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          // Unauthorized
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

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

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}


        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center mb-12 shadow-lg"
        >
          <div>
            <h2 className="text-2xl font-semibold">
              Welcome back, {user.name || "Patient"}
            </h2>
            <p className="opacity-90 mt-2 text-white">
              Let's keep track of your latest health updates.
            </p>
          </div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/387/387561.png"
            alt="Doctor"
            className="w-28 h-28 mt-4 md:mt-0"
          />
        </motion.div>

        {/* Vitals */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12"
        >
          {[{ label: "Body Temperature", value: "36.2°C" },
          { label: "Pulse", value: "85 bpm" },
          { label: "Blood Pressure", value: "120/80 mmHg" },
          { label: "Breathing Rate", value: "15 breaths/m" }].map((v, i) => (
            <div
              key={i}
              className="bg-gray-900/60 border border-gray-700 p-4 rounded-xl text-center shadow-md backdrop-blur-md hover:border-emerald-400 transition"
            >
              <p className="text-gray-400 text-sm">{v.label}</p>
              <p className="text-xl font-semibold text-emerald-400 mt-1">
                {v.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gray-900/70 border border-gray-700 rounded-2xl p-6 backdrop-blur-md shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">
              Appointments
            </h3>
            {appointments.length === 0 ? (
              <p className="text-gray-400">No appointments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                  <thead className="bg-gray-800/70 text-gray-400 text-sm">
                    <tr>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Specialization</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a, i) => (
                      <tr key={i} className="border-t border-gray-700">
                        <td className="p-3">{a.doctor}</td>
                        <td className="p-3">{a.specialization}</td>
                        <td className="p-3">{a.date}</td>
                        <td className="p-3">{a.time}</td>
                        <td className="p-3">
                          <span className="text-emerald-400">{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Reports */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 backdrop-blur-md shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">
              My Reports
            </h3>
            <ul className="space-y-3">
              {reports.map((r, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-800/60 border border-gray-700 rounded-lg p-3 hover:border-emerald-400 transition"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="text-emerald-400" size={18} />
                    <span>{r.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{r.date}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
