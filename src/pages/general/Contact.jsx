import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from 'react-redux'; // Import useSelector
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useCreateContactMutation } from "../../redux/services/contactService";

export default function Contact() {
  const { theme } = useTheme();
  // Get user from Redux store
  const user = useSelector(state => state.auth.user);
  const [createContact, { isLoading, isSuccess }] = useCreateContactMutation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  // 🎨 Theme styles
  const bg =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      : "bg-gradient-to-br from-white to-gray-50 text-gray-900";
  
  const card =
    theme === "dark"
      ? "bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:bg-gray-700/80"
      : "bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white";
  
  const inputBg =
    theme === "dark" ? "bg-gray-900/50 border-gray-700" : "bg-white/50 border-gray-300";

  // Animation variants (keep your existing animations)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardHoverVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission - UPDATED TO INCLUDE USER ID
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Include user ID in the submission data if user is logged in
      const submissionData = {
        ...formData,
        userId: user?.id || null // Add user ID if available
      };
      
      
      await createContact(submissionData).unwrap();
      
      // Reset form on success
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to submit contact form:", error);
    }
  };

  // Pre-fill form with user data if logged in
  React.useEffect(() => {
    if (user && !formData.name && !formData.email) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);



  // Rest of your component remains exactly the same...
  // (Your existing JSX code for the contact form)

  return (
    <section
      className={`relative min-h-screen py-16 px-6 md:px-16 transition-all duration-500 ${bg}`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
          theme === "dark" ? "bg-purple-900/20" : "bg-purple-200/40"
        } blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full ${
          theme === "dark" ? "bg-pink-900/20" : "bg-pink-200/40"
        } blur-3xl`}></div>
      </div>

      <motion.div
        className="relative max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl tracking-tight font-italiana mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Get in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              Touch
            </span>
          </motion.h2>
          <motion.p
            className="max-w-2xl mx-auto text-lg md:text-xl font-instrument text-gray-500 dark:text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Have questions, bulk order inquiries, or collaboration ideas?  
            We're here to help. Reach out to us anytime — we'd love to hear from you!
          </motion.p>
        </motion.div>

        {/* Contact Content */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Contact Info Cards */}
          <motion.div
            className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full max-w-6xl"
            variants={containerVariants}
          >
            {/* Left Column - Contact Info with Side-by-side Layout */}
            <div className="flex flex-col gap-8">
              {/* Top Row - Address & Email */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Address Card */}
                <motion.div
                  variants={cardHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  className={`p-8 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-300 ${card} cursor-default group relative overflow-hidden`}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <FaMapMarkerAlt className="text-purple-500 text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-gray-800 dark:text-white">Our Location</h3>
                  <p className="text-gray-500 dark:text-gray-300 leading-relaxed text-sm lg:text-base">
                    8/2514, Thiyagi Kumaran St<br />
                    Pandian Nagar, Tiruppur<br />
                    Tamilnadu - 641602
                  </p>
                  
                  {/* Map Button */}
                  <button
                    onClick={() => window.open("https://maps.google.com/?q=8/2514+Thiyagi+Kumaran+St,+Pandian+Nagar,+Tiruppur,+Tamilnadu+641602", "_blank")}
                    className="mt-4 px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-300 text-sm font-medium"
                  >
                    View on Map
                  </button>
                </motion.div>

                {/* Email Card */}
                <motion.div
                  variants={cardHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  className={`p-8 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-300 ${card} cursor-pointer group relative overflow-hidden`}
                  onClick={() => window.location.href = "mailto:contact@Tiruppurgarments.com"}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <FaEnvelope className="text-yellow-500 text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-gray-800 dark:text-white">Email Us</h3>
                  <p className="text-gray-500 lg:text-[14px] dark:text-gray-300 hover:text-purple-500 transition-colors  lg:text-base break-all">
                    retail@tiruppurgarments.in
                  </p>
                  <span className="mt-2 text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to compose email
                  </span>
                </motion.div>
              </div>

              {/* Bottom Row - Phone & WhatsApp */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phone Card */}
                <motion.div
                  variants={cardHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  className={`p-8 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-300 ${card} cursor-pointer group relative overflow-hidden`}
                  onClick={() => window.location.href = "tel:+9196774 11007  "}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <FaPhoneAlt className="text-green-500 text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-gray-800 dark:text-white">Call Us</h3>
                  <p className="text-gray-500 dark:text-gray-300 hover:text-purple-500 transition-colors text-lg font-semibold">
                    +91 96774 11007
                  </p>
                  <span className="mt-2 text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to call now
                  </span>
                  
                  {/* Business Hours */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mon - Sun: 9AM - 8PM
                    </p>
                  </div>
                </motion.div>

                {/* WhatsApp Card */}
                <motion.div
                  variants={cardHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  className={`p-8 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-300 ${card} cursor-pointer group relative overflow-hidden`}
                  onClick={() => {
                    const phoneNumber = "919677411007";
                    const message = "Hello Tiruppur Garments! I would like to get in touch with you.";
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-green-600 rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <FaWhatsapp className="text-green-600 text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-gray-800 dark:text-white">WhatsApp</h3>
                  <p className="text-gray-500 dark:text-gray-300 hover:text-purple-500 transition-colors">
                    Start Chat
                  </p>
                  <span className="mt-2 text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Quick response guaranteed
                  </span>
                  
                  {/* Online Status */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Online Now
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Additional Info Card - Only show on larger screens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={`hidden xl:block p-6 rounded-2xl border-2 ${card}`}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                    Why Choose Us?
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-500 font-bold">✓</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">Quality Guarantee</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-500 font-bold">⚡</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">Fast Delivery</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-500 font-bold">24/7</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">Support</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Contact Form */}
            <motion.form
              variants={formVariants}
              onSubmit={handleSubmit}
              className={`p-10 rounded-3xl border-2 shadow-2xl w-full ${card} backdrop-blur-sm`}
            >
              {/* Success Message */}
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
                >
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <div>
                    <span className="text-green-500 font-medium block">
                      Message sent successfully!
                    </span>
                    <span className="text-green-500/80 text-sm">
                      We'll get back to you within 24 hours.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Form Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Send us a Message
                </h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm">
                  Fill out the form below and we'll respond promptly
                </p>
              </div>

              <div className="grid md:grid-cols-2 text-left gap-6 mb-8">
                {/* Name Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                    className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white transition-all duration-300 ${inputBg}`}
                  />
                </motion.div>

                {/* Phone Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your Phone"
                    required
                    className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white transition-all duration-300 ${inputBg}`}
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    required
                    className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white transition-all duration-300 ${inputBg}`}
                  />
                </motion.div>

                {/* Subject Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Subject of your message"
                    className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white transition-all duration-300 ${inputBg}`}
                  />
                </motion.div>
              </div>

              {/* Message Field */}
              <motion.div variants={itemVariants} className="mb-8 space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                  Your Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Tell us about your inquiry, project, or how we can help you..."
                  required
                  className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white transition-all duration-300 resize-none ${inputBg}`}
                ></textarea>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-500 py-4 rounded-xl hover:opacity-90 transition-all duration-300 font-semibold text-white text-lg shadow-lg ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaPaperPlane className="text-lg" />
                )}
                {isLoading ? "Sending..." : "Send Message"}
              </motion.button>

              {/* Privacy Note */}
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                Your information is secure and will never be shared with third parties.
              </p>
            </motion.form>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          className="mt-20 rounded-3xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className={`h-96 w-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"} relative`}>
            {/* You can integrate Google Maps or any map service here */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FaMapMarkerAlt className={`text-4xl mx-auto mb-4 ${
                  theme === "dark" ? "text-gray-600" : "text-gray-400"
                }`} />
                <p className={`text-lg ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Map Integration Available
                </p>
                <button
                  onClick={() => window.open("https://maps.google.com/?q=8/2514+Thiyagi+Kumaran+St,+Pandian+Nagar,+Tiruppur,+Tamilnadu+641602", "_blank")}
                  className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Open in Google Maps
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}