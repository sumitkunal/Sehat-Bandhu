import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { t } = useTranslation("LoginSignup");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = t("validation.required");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = t("validation.invalidEmail");
    if (!password) e.password = t("validation.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // >>> DATABASE / AUTH: Insert login call here
      await new Promise((r) => setTimeout(r, 700)); // demo delay
      navigate("/"); // redirect after successful login
    } catch (err) {
      setErrors({ ...errors, password: t("auth.invalidCredentials") });
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

      {/* Login Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-lg bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-10"
      >
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text text-center">
          {t("loginTitle")}
        </h2>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="text-sm text-gray-300">{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? t("loading") : t("login")}
          </button>

          <div className="text-sm text-gray-400 flex justify-between items-center mt-4">
            <Link to="/signup" className="text-emerald-400 hover:underline">
              {t("noAccount")}
            </Link>
            <Link to="/forgot" className="text-gray-400 hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
