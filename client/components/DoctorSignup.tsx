import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const DoctorSignup: React.FC = () => {
  const { t } = useTranslation("LoginSignup");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    license: "",
    password: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = t("validation.required");
    if (!form.email) e.email = t("validation.required");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = t("validation.invalidEmail");
    if (!form.specialization) e.specialization = t("validation.required");
    if (!form.license) e.license = t("validation.required");
    if (!form.password) e.password = t("validation.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // >>> DATABASE / AUTH: Insert doctor signup call here
      await new Promise((r) => setTimeout(r, 700));
      navigate("/login");
    } catch (err) {
      setErrors({ general: t("auth.signupFailed") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex items-center justify-center px-4">
      {/* Animated background elements */}
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

      {/* Doctor Signup Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-lg bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-10"
      >
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text text-center">
          {t("doctorSignupTitle")}
        </h2>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="text-sm text-gray-300">{t("fullName")}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              placeholder={t("namePlaceholder")}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">{t("email")}</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              placeholder="doctor@example.com"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">{t("specialization")}</label>
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              placeholder={t("specializationPlaceholder")}
            />
            {errors.specialization && <p className="text-xs text-red-400 mt-1">{errors.specialization}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">{t("license")}</label>
            <input
              name="license"
              value={form.license}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              placeholder={t("licensePlaceholder")}
            />
            {errors.license && <p className="text-xs text-red-400 mt-1">{errors.license}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">{t("password")}</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 inline-flex items-center justify-center px-4 py-3 rounded-md bg-emerald-500 hover:brightness-95 text-black font-semibold text-lg transition"
          >
            {loading ? t("loading") : t("createAccount")}
          </button>

          <div className="text-sm text-gray-400 flex justify-center mt-4">
            <Link to="/login" className="text-emerald-400 hover:underline">
              {t("alreadyHave")} {t("login")}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DoctorSignup;
