import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Pill, Users, Video, Map, Bell, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ServiceCards: React.FC = () => {
    const { t } = useTranslation("serviceCard");
    const services = [
        {
            title: t('services.videoConsultations.title'),
            description: t('services.videoConsultations.description'),
            icon: <Video className="h-8 w-8 text-white" />,
            delay: 0.1,
        },
        {
            title: t('services.appointmentBooking.title'),
            description: t('services.appointmentBooking.description'),
            icon: <Calendar className="h-8 w-8 text-white" />,
            delay: 0.2,
        },
        {
            title: t('services.healthTrack.title'),
            description: t('services.healthTrack.description'),
            icon: <Pill className="h-8 w-8 text-white" />,
            delay: 0.3,
        },
        {
            title: t('services.healthQueries.title'),
            description: t('services.healthQueries.description'),
            icon: <MessageSquare className="h-8 w-8 text-white" />,
            delay: 0.6,
        },
    ];
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-4xl font-bold text-gray-900"
                    >
                        {t("title.line1")} <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 text-transparent bg-clip-text"> {t("title.line2")}</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-4 max-w-2xl mx-auto text-xl text-gray-600"
                    >
                        {t("title.line3")}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: service.delay }}
                            whileHover={{
                                y: -10,
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                            }}
                            className="bg-white rounded-xl shadow-md overflow-hidden relative group"
                        >
                            <div className="p-6">
                                <div className="flex justify-center">
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 flex items-center justify-center">
                                        {service.icon}
                                    </div>
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">{service.title}</h3>

                                {/* Description overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 flex items-center justify-center opacity-0 group-hover:opacity-95 transition-opacity duration-300 p-6">
                                    <p className="text-white text-center">{service.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServiceCards;
