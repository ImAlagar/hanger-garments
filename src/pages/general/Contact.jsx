import React from "react";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaPaperPlane,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function Contact() {
  const { theme } = useTheme();

  // 🎨 Theme styles
  const bg =
    theme === "dark"
      ? "bg-gray-900 text-white"
      : "bg-white text-gray-900";
  const card =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
      : "bg-gray-100 border-gray-300 hover:bg-gray-200";
  const inputBg =
    theme === "dark" ? "bg-gray-900" : "bg-white";

  return (
    <section
      className={`relative lg:py-8 py-8 pb-20 px-6 md:px-16 transition-all duration-500 ${bg}`}
    >
      <div className="flex flex-col items-center text-center">
        {/* Header */}
        <h2 className="text-3xl md:text-5xl tracking-wider font-italiana mb-6">
          Get in Touch with{" "}
          <span className="text-purple-500 font-medium">Hanger Garments</span>
        </h2>
        <p className="max-w-2xl font-instrument text-gray-500 dark:text-gray-300 mb-14">
          Have questions, bulk order inquiries, or collaboration ideas?  
          We’re here to help. Reach out to us anytime — we’d love to hear from you!
        </p>

        {/* Flex Layout: Contact Info + Form */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-10 w-full max-w-7xl">
          {/* Contact Info Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl font-instrument tracking-widest">
            {/* Address */}
            <div
              className={`p-6 rounded-xl border flex flex-col items-center text-center transition ${card}`}
            >
              <FaMapMarkerAlt className="text-purple-500 text-3xl mb-3" />
              <h3 className="font-semibold text-lg mb-1">Address</h3>
              <p className="text-gray-500 dark:text-gray-300">
                8/2514 . Thiyagi Kumaran St, Pandian Nagar , Tiruppur , Tamilnadu  - 641602
              </p>
            </div>

            {/* Email */}
            <div
              className={`p-6 rounded-xl border flex flex-col items-center text-center transition ${card}`}
            >
              <FaEnvelope className="text-yellow-500 text-3xl mb-3" />
              <h3 className="font-semibold text-lg mb-1">Email</h3>
              <a
                href="mailto:contact@hangergarments.com"
                className="text-gray-500 dark:text-gray-300 hover:text-purple-500 transition"
              >
                contact@hangergarments.com
              </a>
            </div>

            {/* Phone */}
            <div
              className={`p-6 rounded-xl border flex flex-col items-center text-center transition ${card}`}
            >
              <FaPhoneAlt className="text-green-500 text-3xl mb-3" />
              <h3 className="font-semibold text-lg mb-1">Phone</h3>
              <a
                href="tel:+918122747148"
                className="text-gray-500 dark:text-gray-300 hover:text-purple-500 transition"
              >
                +91 88833 85888
              </a>
            </div>

            {/* WhatsApp */}
            <div
              className={`p-6 rounded-xl border flex flex-col items-center text-center transition ${card}`}
            >
              <FaWhatsapp className="text-green-600 text-3xl mb-3" />
              <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
              <a
                href="https://wa.me/918122747148"
                target="_blank"
                rel="noreferrer"
                className="text-gray-500 dark:text-gray-300 hover:text-purple-500 transition"
              >
                Chat with Us
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <form
            action="https://api.web3forms.com/submit"
            method="POST"
            className={`p-8 rounded-2xl font-instrument border shadow-md w-full max-w-3xl ${card}`}
          >
            <input
              type="hidden"
              name="access_key"
              value="YOUR_WEB3FORMS_ACCESS_KEY"
            />

            <div className="grid md:grid-cols-2 text-left gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm text-gray-500 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  className={`w-full p-3 rounded-md border focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white border-gray-400 dark:border-gray-600 ${inputBg}`}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-500 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Your Phone"
                  required
                  className={`w-full p-3 rounded-md border focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white border-gray-400 dark:border-gray-600 ${inputBg}`}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-500 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  className={`w-full p-3 rounded-md border focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white border-gray-400 dark:border-gray-600 ${inputBg}`}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-500 dark:text-gray-300">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  className={`w-full p-3 rounded-md border focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white border-gray-400 dark:border-gray-600 ${inputBg}`}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm text-left text-gray-500 dark:text-gray-300">
                Message
              </label>
              <textarea
                name="message"
                rows="4"
                placeholder="Type your message..."
                required
                className={`w-full p-3 rounded-md border focus:outline-none focus:border-purple-500 text-gray-800 dark:text-white border-gray-400 dark:border-gray-600 ${inputBg}`}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 py-3 rounded-md hover:opacity-90 transition font-medium text-white"
            >
              <FaPaperPlane /> Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
