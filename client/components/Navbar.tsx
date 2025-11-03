import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, Calendar, Search, Video, User } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { i18n, t } = useTranslation("Navbar");
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
  };

  const navLinks = [
    { name: t("home"), path: "/", icon: <Home className="w-5 h-5" /> },
    { name: t("dashboard"), path: "/appointments", icon: <Calendar className="w-5 h-5" /> },
    { name: t("findDoctors"), path: "/find-doctor", icon: <Search className="w-5 h-5" /> },
    { name: t("videoCall"), path: "/video-consultation", icon: <Video className="w-5 h-5" /> },
  ];

  // ✅ Check JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // ✅ Close logout dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowLogout(false);
    navigate("/login");
  };

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-lg text-white backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold bg-gradient-to-r from-emerald-500 via-green-400 to-teal-300 text-transparent bg-clip-text"
              >
                Sehat Bandhu
              </motion.span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all duration-200 ${location.pathname === link.path
                      ? "border border-emerald-500 text-emerald-400 bg-gray-800"
                      : "text-gray-300 hover:text-emerald-400 hover:bg-gray-800"
                    }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-100 font-semibold transition"
                title="Toggle Language"
              >
                {i18n.language === "en" ? "हिंदी" : "English"}
              </button>

              {/* Auth Section */}
              {!isLoggedIn ? (
                <div className="ml-4 flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium border border-emerald-500 text-emerald-400 hover:bg-emerald-600/20"
                  >
                    {t("Login")}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 text-black font-semibold hover:opacity-90"
                  >
                    {t("Sign Up")}
                  </Link>
                </div>
              ) : (
                <div ref={dropdownRef} className="relative ml-4">
                  <button
                    onClick={() => setShowLogout(!showLogout)}
                    className="p-2 rounded-full border border-emerald-500 text-emerald-400 hover:bg-emerald-600/20"
                    title="User Menu"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {showLogout && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2"
                    >
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-emerald-400"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-300 hover:text-emerald-400 focus:outline-none"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-black border-t border-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 text-base font-medium flex items-center space-x-2 ${location.pathname === link.path
                    ? "bg-gray-800 border-l-4 border-emerald-500 text-emerald-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-emerald-400"
                  }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            {/* Mobile Auth or Logout */}
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-base text-gray-300 hover:bg-gray-800 hover:text-emerald-400"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-base text-gray-300 hover:bg-gray-800 hover:text-emerald-400"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base text-gray-300 hover:bg-gray-800 hover:text-emerald-400"
              >
                Logout
              </button>
            )}

            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center py-2 border-t border-gray-700 hover:bg-gray-800 text-white"
            >
              {i18n.language === "en" ? "हिन्दी" : "English"}
            </button>
          </div>
        )}
      </nav>

      {/* Push content below fixed navbar */}
      <div className="pt-16" />
    </>
  );
};

export default Navbar;
