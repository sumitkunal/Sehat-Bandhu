// DoctorSignup.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorSignup: React.FC = () => {
  const { t } = useTranslation("LoginSignup");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialties: "",
    regNo: "",
    clinicName: "",
    yearOfExperience: "",
    languages: "",
    password: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = t("validation.required");
    if (!form.email) e.email = t("validation.required");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = t("validation.invalidEmail");
    if (!form.specialties) e.specialties = t("validation.required");
    if (!form.regNo) e.regNo = t("validation.required");
    if (!form.password) e.password = t("validation.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("regNo", form.regNo);
      fd.append("clinicName", form.clinicName);
      fd.append("password", form.password);
      fd.append("yearOfExperience", form.yearOfExperience);

      fd.append("specialties", JSON.stringify(form.specialties.split(",").map(s => s.trim())));
      fd.append("languages", JSON.stringify(form.languages ? form.languages.split(",").map(l => l.trim()) : []));

      if (avatar) fd.append("avatar", avatar);

      await axios.post(`${baseUrl}/auth/doctor/signup`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/login");
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || t("auth.signupFailed") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      {/* Background bubbles */}
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
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              scale: [0.7, 1.3, 0.7],
            }}
            transition={{ duration: Math.random() * 20 + 10, repeat: Infinity }}
            style={{
              width: `${Math.random() * 300 + 80}px`,
              height: `${Math.random() * 300 + 80}px`,
              filter: "blur(40px)",
            }}
          />
        ))}
      </div>

      {/* Form card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-10"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text text-center">
          Doctor Registration
        </h2>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mt-6">
          <label className="text-gray-300 text-sm mb-2">Profile Picture</label>

          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} className="w-full h-full object-cover" alt="preview" />
            ) : (
              <span className="text-gray-500">No Image</span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="mt-3 text-sm text-gray-300"
          />
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
          {[
            ["name", "Full Name"],
            ["email", "Email"],
            ["phone", "Phone (optional)"],
            ["specialties", "Specialties (comma separated)"],
            ["regNo", "Registration Number"],
            ["clinicName", "Clinic Name (optional)"],
            ["yearOfExperience", "Years of Experience"],
            ["languages", "Languages (comma separated, optional)"],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="text-sm text-gray-300">{label}</label>
              <input
                name={field}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              />
              {errors[field] && <p className="text-xs text-red-400 mt-1">{errors[field]}</p>}
            </div>
          ))}

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500"
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
          </div>

          {errors.general && <p className="text-red-400 text-center">{errors.general}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-4 py-3 rounded-md bg-emerald-500 text-black font-semibold text-lg hover:brightness-95"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="text-sm text-gray-400 text-center mt-4">
            Already registered?{" "}
            <Link to="/login" className="text-emerald-400 hover:underline">Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DoctorSignup;
