import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MessageSquare, TvMinimal, Users } from 'lucide-react';

const Hero: React.FC = () => {
  const { t } = useTranslation("hero");

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
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
              scale: [Math.random() * 0.5 + 0.5, Math.random() * 1 + 1, Math.random() * 0.5 + 0.5],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="block text-white">{t("section.ruralCommunities.title_1")}</span>
            <span className="block bg-gradient-to-r from-emerald-500 via-green-400 to-teal-300 text-transparent bg-clip-text mt-2">
              {t("section.ruralCommunities.title_2")}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
            {t("section.ruralCommunities.description")}
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link
              to="/appointments"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 hover:opacity-90 md:py-4 md:text-lg md:px-10 shadow-lg transform transition hover:scale-105"
            >
              {t("section.actions.bookAppointment")}
            </Link>
            <Link
              to="/find-doctor"
              className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 md:py-4 md:text-lg md:px-10 transform transition hover:scale-105"
            >
              {t("section.actions.findDoctors")}
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              title: t("section.features.telemedicine.title"),
              description: t("section.features.telemedicine.description"),
              icon: <Calendar className="h-8 w-8 text-white" />,
              color: "from-emerald-600 to-green-400",
            },
            {
              title: t("section.features.virtualConsultations.title"),
              description: t("section.features.virtualConsultations.description"),
              icon: <TvMinimal className="h-8 w-8 text-white" />,
              color: "from-green-600 to-teal-400",
            },
            {
              title: t("section.features.expertDoctors.title"),
              description: t("section.features.expertDoctors.description"),
              icon: <Users className="h-8 w-8 text-white" />,
              color: "from-teal-600 to-green-400",
            },
            {
              title: t("section.features.healthQueries.title"),
              description: t("section.features.healthQueries.description"),
              icon: <MessageSquare className="h-8 w-8 text-white" />,
              color: "from-emerald-500 to-teal-400",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl opacity-50 blur-lg group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative h-full bg-gray-800 border border-gray-700 rounded-xl p-6 backdrop-blur-sm overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color}/10 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className={`flex justify-center items-center h-12 w-12 rounded-md bg-gradient-to-r ${feature.color} mx-auto`}>
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-white text-center">{feature.title}</h3>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/80 p-6 rounded-xl">
                    <p className="text-gray-200 text-center">{feature.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
        >
          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 text-center">
            {[
              { label: t("section.stats.doctors"), value: "500+" },
              { label: t("section.stats.patients"), value: "10,000+" },
              { label: t("section.stats.ruralAreas"), value: "200+" },
              { label: t("section.stats.query"), value: "200+" },
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <dt className="text-sm font-medium text-gray-400">{stat.label}</dt>
                <dd className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 text-transparent bg-clip-text">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
