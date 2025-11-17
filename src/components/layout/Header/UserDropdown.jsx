import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiChevronDown, FiSettings, FiLogOut } from 'react-icons/fi';
import { motionVariants } from '../../../constants/headerConstants';

const UserDropdown = ({
  theme,
  dropdownOpen,
  toggleDropdown,
  user,
  isLoggedIn,
  handleLogout,
  handleOrdersClick,
  handleLoginClick,
  getUserDisplayName
}) => {
  if (!isLoggedIn) {
    return (
      <motion.button
        onClick={handleLoginClick}
        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 text-base border ${
          theme === "dark"
            ? "border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            : "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        Login
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={toggleDropdown}
        className={`px-4 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 ${
          theme === "dark"
            ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
            : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
        }`}
        whileHover={{ y: -2 }}
      >
        <FiUser className="size-4" />
        <span className="text-sm">{getUserDisplayName()}</span>
        <motion.span
          animate={{ rotate: dropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="size-3" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            variants={motionVariants.dropdown}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute right-0 mt-3 w-48 rounded-xl shadow-2xl overflow-hidden z-50 border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <motion.button
              onClick={handleOrdersClick}
              className={`flex items-center w-full px-4 py-3 transition-all duration-200 border-b ${
                theme === "dark"
                  ? "border-gray-700 hover:bg-gray-700 text-gray-200"
                  : "border-gray-100 hover:bg-gray-50 text-gray-700"
              }`}
              whileHover={{ x: 5 }}
            >
              <FiSettings className="size-4 mr-2 text-purple-500" />
              My Orders
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-3 transition-all duration-200 ${
                theme === "dark"
                  ? "text-red-400 hover:bg-red-900/50"
                  : "text-red-600 hover:bg-red-50"
              }`}
              whileHover={{ x: 5 }}
            >
              <FiLogOut className="size-4 mr-2" />
              Logout
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;