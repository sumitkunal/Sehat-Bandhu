// client/src/components/Signup.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const { t } = useTranslation("LoginSignup");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name) e.name = t("validation.required");
    if (!email) e.email = t("validation.required");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = t("validation.invalidEmail");
    if (!password) e.password = t("validation.required");
    if (password.length > 0 && password.length < 6) e.password = t("validation.minPassword");
    if (password !== confirm) e.confirm = t("validation.passwordMismatch");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // >>> DATABASE / API: Insert signup call here (create user in DB)
      // e.g. await api.signup({ name, email, password, role: 'patient' });
      await new Promise((r) => setTimeout(r, 700)); // demo delay
      navigate("/login");
    } catch (err) {
      setErrors({ ...errors, email: t("auth.emailTaken") });
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

      {/* Centered modal card */}
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
            <label className="text-sm text-gray-300">{t("fullName")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">{t("email")}</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-300">{t("confirmPassword")}</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              />
              {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm}</p>}
            </div>
          </div>

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
