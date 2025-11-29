import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const { t } = useTranslation("LoginSignup");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    dob: "",
    gender: "",
    role: "patient",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 🔹 Input change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 🔹 Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.length < 3) e.name = "Name must be at least 3 characters";
    if (!form.email) e.email = "Email is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!form.phone) e.phone = "Phone is required";
    if (!form.gender) e.gender = "Gender is required";
    if (!form.dob) e.dob = "Date of birth is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🔹 Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone,
        role: "patient",
        gender: form.gender,
        dob: new Date(form.dob), // ✅ send as Date
        adress: {
          line: "some street",
          district: "some district",
          state: "some state",
          pincode: 123456, // ✅ number, not string
        },
      };

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const res = await fetch(`${backendUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      console.log("✅ User created:", data);
      alert("Signup successful!");
      navigate("/login");
    } catch (err: any) {
      console.error("❌ Signup error:", err);
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex items-center justify-center px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
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
              filter: "blur(40px)",
            }}
          />
        ))}
      </div>

      {/* Signup Form */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-xl bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md z-10"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text">
          {t("signupTitle")}
        </h2>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="text-sm text-gray-300">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            />
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-300">Confirm Password</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              />
              {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              />
              {errors.dob && <p className="text-xs text-red-400 mt-1">{errors.dob}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-300">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-red-400 mt-1">{errors.gender}</p>}
            </div>
          </div>

          {errors.general && (
            <p className="text-center text-sm text-red-400">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-md bg-emerald-500 hover:brightness-95 text-black font-semibold"
          >
            {loading ? t("loading") : t("createAccount")}
          </button>

          <div className="text-sm text-gray-400 text-center">
            {t("alreadyHave")}{" "}
            <Link to="/login" className="text-emerald-400 hover:underline">
              {t("login")}
            </Link>
          </div>

          <div className="text-sm text-gray-400 flex justify-center">
            {t("areYouDoctor")}{" "}
            <Link to="/doctor-signup" className="text-emerald-400 ml-1 hover:underline">
              {t("doctorSignupTitle")}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
