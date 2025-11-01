import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ContactUs: React.FC = () => {
    const {t} = useTranslation("ContactUs");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      //@ts-ignore 
      const response = await fetch(`https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else throw new Error('Failed to send message');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            {t("title.line1")}{' '}
            {/* 🎨 updated gradient color theme */}
            <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 text-transparent bg-clip-text">
              {t("title.line2")}
            </span>{' '}
            {t("title.line3")}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-600"
          >
            {t("title.line4")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gray-50 rounded-xl p-8 h-full">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t("contact.line1")}</h3>
              
              <div className="space-y-6">
                {/* 🎨 icon background updated */}
                {[
                  { icon: <MapPin className="h-5 w-5 text-white" />, title: t('contact.line2'), text: t('contact.line3') },
                  { icon: <Phone className="h-5 w-5 text-white" />, title: t('contact.line4'), text: '9876543210' },
                  { icon: <Mail className="h-5 w-5 text-white" />, title:  t('contact.line5'), text: 'sumitkunal103@gmail.com' },
                  { icon: <Clock className="h-5 w-5 text-white" />, title:  t('contact.line6'), text:  t('contact.line7') },
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
                      <p className="mt-1 text-gray-600 whitespace-pre-line">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6"> {t("message.line1")}</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  {['name', 'email', 'phone', 'message'].map((field) => (
                    <div key={field}>
                      <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                        {field === 'message' ?  t('message.line1') : field === 'phone' ? t('message.line4') : field === 'email' ? t('message.line3') : t('message.line2')}
                      </label>
                      {field !== 'message' ? (
                        <input
                          type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                          id={field}
                          name={field}
                          value={(formData as any)[field]}
                          onChange={handleChange}
                          required={field !== 'phone'}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm" 
                        />
                      ) : (
                        <textarea
                          id={field}
                          name={field}
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm" 
                        />
                      )}
                    </div>
                  ))}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600" // 🎨 updated button gradient & focus ring
                    >
                      {loading ? (
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      ) : (
                        <>
                          {t('message.line6')} <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
