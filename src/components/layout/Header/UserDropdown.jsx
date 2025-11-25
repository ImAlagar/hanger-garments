import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiChevronDown, FiSettings, FiLogOut, FiShoppingBag, FiPlus } from 'react-icons/fi';
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
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Handle user login navigation
  const handleUserLogin = () => {
    toggleDropdown();
    navigate('/login');
  };

  // Handle wholesaler login navigation
  const handleWholesalerLogin = () => {
    toggleDropdown();
    navigate('/wholesaler/login');
  };

  // Handle user register navigation
  const handleUserRegister = () => {
    toggleDropdown();
    navigate('/register');
  };

  // Handle wholesaler register navigation
  const handleWholesalerRegister = () => {
    toggleDropdown();
    navigate('/wholesaler/register');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleDropdown();
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, toggleDropdown]);

  // Close dropdown when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && dropdownOpen) {
        toggleDropdown();
      }
    };

    if (dropdownOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [dropdownOpen, toggleDropdown]);

  if (!isLoggedIn) {
    return (
      <div className="relative" ref={dropdownRef}>
        <motion.button
          onClick={toggleDropdown}
          className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 text-base border flex items-center gap-2 font-bai-jamjuree tracking-wide ${
            theme === "dark"
              ? "border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              : "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
          }`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiUser className="size-4" />
          Login
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
              className={`absolute right-0 mt-3 w-64 rounded-xl shadow-2xl overflow-hidden z-50 border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Login Section Header */}
              <div className={`px-4 py-3 border-b font-bai-jamjuree font-semibold text-sm ${
                theme === "dark" 
                  ? "border-gray-700 text-gray-300 bg-gray-750" 
                  : "border-gray-100 text-gray-700 bg-gray-50"
              }`}>
                Login Options
              </div>

              {/* User Login Option */}
              <motion.button
                onClick={handleUserLogin}
                className={`flex items-center w-full px-4 py-3 transition-all duration-200 border-b font-instrument tracking-wide ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-gray-700 text-gray-200"
                    : "border-gray-100 hover:bg-gray-50 text-gray-700"
                }`}
                whileHover={{ x: 5 }}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                  theme === "dark" ? "bg-purple-900" : "bg-purple-100"
                }`}>
                  <FiUser className={`size-4 ${theme === "dark" ? "text-purple-300" : "text-purple-600"}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm font-bai-jamjuree">User Login</div>
                  <div className={`text-xs font-instrument ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    For regular customers
                  </div>
                </div>
              </motion.button>

              {/* Wholesaler Login Option */}
              <motion.button
                onClick={handleWholesalerLogin}
                className={`flex items-center w-full px-4 py-3 transition-all duration-200 border-b font-instrument tracking-wide ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-gray-700 text-gray-200"
                    : "border-gray-100 hover:bg-gray-50 text-gray-700"
                }`}
                whileHover={{ x: 5 }}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                  theme === "dark" ? "bg-blue-900" : "bg-blue-100"
                }`}>
                  <FiShoppingBag className={`size-4 ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm font-bai-jamjuree">Wholesaler Login</div>
                  <div className={`text-xs font-instrument ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    For business accounts
                  </div>
                </div>
              </motion.button>

              {/* Register Section Header */}
              <div className={`px-4 py-3 border-b font-bai-jamjuree font-semibold text-sm ${
                theme === "dark" 
                  ? "border-gray-700 text-gray-300 bg-gray-750" 
                  : "border-gray-100 text-gray-700 bg-gray-50"
              }`}>
                Create Account
              </div>

              {/* User Register Option */}
              <motion.button
                onClick={handleUserRegister}
                className={`flex items-center w-full px-4 py-3 transition-all duration-200 border-b font-instrument tracking-wide ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-gray-700 text-gray-200"
                    : "border-gray-100 hover:bg-gray-50 text-gray-700"
                }`}
                whileHover={{ x: 5 }}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                  theme === "dark" ? "bg-green-900" : "bg-green-100"
                }`}>
                  <FiPlus className={`size-4 ${theme === "dark" ? "text-green-300" : "text-green-600"}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm font-bai-jamjuree">User Register</div>
                  <div className={`text-xs font-instrument ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Create customer account
                  </div>
                </div>
              </motion.button>

              {/* Wholesaler Register Option */}
              <motion.button
                onClick={handleWholesalerRegister}
                className={`flex items-center w-full px-4 py-3 transition-all duration-200 font-instrument tracking-wide ${
                  theme === "dark"
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                whileHover={{ x: 5 }}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                  theme === "dark" ? "bg-orange-900" : "bg-orange-100"
                }`}>
                  <FiPlus className={`size-4 ${theme === "dark" ? "text-orange-300" : "text-orange-600"}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm font-bai-jamjuree">Wholesaler Register</div>
                  <div className={`text-xs font-instrument ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Create business account
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={toggleDropdown}
        className={`px-4 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 font-bai-jamjuree tracking-wide ${
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
              className={`flex items-center w-full px-4 py-3 transition-all duration-200 border-b font-instrument tracking-wide ${
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
              className={`flex items-center w-full px-4 py-3 transition-all duration-200 font-instrument tracking-wide ${
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