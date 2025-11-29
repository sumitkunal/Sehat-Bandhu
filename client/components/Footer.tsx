import React from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation("Footer");

  // const toggleLanguage = () => {
  //   i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");
  // };

  return (
    <footer className="bg-gray-900 text-white relative">
      {/* Language Toggle */}
      {/* <button
        onClick={toggleLanguage}
        className="absolute right-6 top-6 bg-white text-gray-900 hover:bg-gray-200 text-sm px-3 py-1 rounded-lg transition-colors font-semibold"
      >
        {i18n.language === "en" ? "हिन्दी" : "English"}
      </button> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 text-transparent bg-clip-text">
                {t("brand")}
              </span>
            </Link>
            <p className="mt-4 text-gray-400">{t("tagline")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              {(t("menu", { returnObjects: true }) as any[]).map((text: string, idx: number) => (
                <li key={idx}>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("services")}</h3>
            <ul className="space-y-2">
              {(t("serviceList", { returnObjects: true }) as any[]).map((text: string, idx: number) => (
                <li key={idx}>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("contact")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 whitespace-pre-line">{t("address")}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                <span className="text-gray-400">{t("phone")}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                <span className="text-gray-400">{t("email")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {t("brand")}. {t("rights")}
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t("privacy")}
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t("terms")}
            </Link>
            <Link to="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t("sitemap")}
            </Link>
          </div>
        </div>

        {/* Made with love */}
        <div className="mt-6 text-center text-gray-400 text-sm flex items-center justify-center">
          <span>{t("madeWith")}</span>
          <Heart className="h-4 w-4 text-emerald-500 mx-1" />
          <span>{t("forRural")}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
