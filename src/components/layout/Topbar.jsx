import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const Topbar = () => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Content for scrolling animation
  const topbarContent = [
    "🚚 Free shipping for retail orders",
    "✨ New Arrivals Available", 
    "💳 Secure Payment & Accept all cards"
  ];

  // Hide Topbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        // Scrolling down & past 10px - hide topbar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show topbar
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -50,
        height: isVisible ? "auto" : 0
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
      className={`w-full fixed top-0 left-0 z-50 overflow-hidden ${
        theme === "dark"
          ? "bg-gray-900 text-yellow-300 border-b border-gray-700"
          : "bg-gray-100 text-gray-900 border-b border-gray-300"
      }`}
    >
      <div className="relative py-3">
        {/* Scrolling Contact Info */}
        <div className="overflow-hidden whitespace-nowrap">
          <motion.div
            className="inline-flex items-center space-x-8 text-sm font-medium tracking-widest"
            animate={{ 
              x: [0, -1200],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear"
              }
            }}
          >
            {/* Multiple copies for seamless looping */}
            {[...Array(3)].map((_, copyIndex) => (
              <div key={copyIndex} className="inline-flex items-center space-x-8">
                {topbarContent.map((text, index) => (
                  <div key={`${copyIndex}-${index}`} className="inline-flex items-center space-x-2">
                    <span className="flex items-center whitespace-nowrap">
                      {text}
                    </span>
                    {index < topbarContent.length - 1 && (
                      <span className={theme === "dark" ? "text-yellow-300/60" : "text-gray-900/60"}>•</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Social Media Overlay - Right Side */}
        <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 hidden md:flex items-center space-x-4 px-4 py-2 rounded-full backdrop-blur-sm ${
          theme === "dark" ? "bg-black/30" : "bg-white/30"
        }`}>
          {[
            { Icon: FaFacebook, link: "https://www.facebook.com/hangergarments" },
            { Icon: FaInstagram, link: "https://www.instagram.com/hangergarments" },
            { Icon: FaYoutube, link: "https://www.youtube.com/@hangergarments" },
          ].map(({ Icon, link }, index) => (
            <motion.a
              key={index}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                theme === "dark" ? "text-yellow-300 hover:text-white" : "text-gray-900 hover:text-gray-700"
              }`}
              whileHover={{ scale: 1.2, rotate: 10 }}
            >
              <Icon className="w-4 h-4" />
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Topbar;