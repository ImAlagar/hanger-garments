import React from 'react';
import { motion } from 'framer-motion';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <motion.button
      onClick={toggleTheme}
      className={`p-3 rounded-xl transition-all duration-300 ${
        theme === "dark"
          ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
          : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {theme === "light" ? (
        <MdOutlineDarkMode className="size-5" />
      ) : (
        <MdOutlineLightMode className="size-5" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;