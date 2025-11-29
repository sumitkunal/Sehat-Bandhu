import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/pagination';
// @ts-ignore
import 'swiper/css/navigation';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  source: string;
  url: string;
}

const NewsSlider: React.FC = () => {
  const [loading, setLoading] = useState(true);
  setTimeout(() => setLoading(false), 2000);
  const { t } = useTranslation("newsSlider");
  const placeholderNews: NewsItem[] = [
    {
      id: '1',
      title: 'COVID-19 Update: New Variant Emerges',
      content:
        'Scientists are monitoring a new COVID-19 variant that appears to be more transmissible but causes milder symptoms in most cases.',
      image_url:
        'https://images.unsplash.com/photo-1584118624012-df056829fbd0?auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'Max Healthcare',
      url: 'https://www.maxhealthcare.in/blogs/jn-1-covid-variant-symptoms',
    },
    {
      id: '2',
      title: 'Dengue Fever Outbreak in Southern Regions',
      content:
        'Health authorities are warning about a dengue fever outbreak in southern regions. Take precautions against mosquito bites.',
      image_url:
        'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'WHO',
      url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue',
    },
    {
      id: '3',
      title: 'Ayurvedic Remedies for Seasonal Allergies',
      content:
        'Traditional Ayurvedic remedies can help manage seasonal allergies naturally. Learn about effective herbs and practices.',
      image_url:
        'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'Ayush Ministry',
      url: 'https://arthayurvedaworld.com/blogs/news/breathe-easy-ayurvedic-approaches-to-seasonal-allergies?srsltid=AfmBOoo1pvYvpAlcMTqAajjeieN8_zMM3yn2tKZ1_v9LQQQAQbsEmjST',
    },
  ];

  const formatDate = (dateString: string) =>
    format(new Date(dateString), 'MMM d, yyyy');

  return (
    <section className="py-20 bg-[#0B0C10] relative overflow-hidden">
      {/*  Floating medical-green gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background:
                'radial-gradient(circle, #05966940, #10B98140, #14B8A640)', //  Emerald → Green → Teal (hex: #059669, #10B981, #14B8A6)
              width: `${Math.random() * 400 + 250}px`,
              height: `${Math.random() * 400 + 250}px`,
              filter: 'blur(100px)',
            }}
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-white"
          >
            {t("line1")} {' '}
            <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 text-transparent bg-clip-text">
              {t("line2")}
            </span>{' '}
            {t("line3")}
          </motion.h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            {t("line4")}
          </p>
        </div>

        {/* ✨ Swiper Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#10B981] border-r-transparent"></div>
            <span className="ml-3 text-gray-300">Loading health news...</span>
          </div>
        ) : (
          <Swiper
            spaceBetween={30}
            centeredSlides
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            navigation
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
          >
            {placeholderNews.map((item) => (
              <SwiperSlide key={item.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center 
                             bg-white/10 backdrop-blur-lg border border-white/20 
                             rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] 
                             transition-transform duration-300"
                >
                  <div className="h-64 md:h-96 overflow-hidden rounded-xl">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center text-gray-400 mb-2 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-[#10B981]" /> {/* 🌿 #10B981 */}
                      <span>{formatDate(item.created_at)}</span>
                      <span className="mx-2">•</span>
                      <span>{item.source}</span>
                    </div>

                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 mb-6">{item.content}</p>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 rounded-md font-medium 
                                 text-white bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 
                                 hover:opacity-90 transition-all"
                    >
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default NewsSlider;
