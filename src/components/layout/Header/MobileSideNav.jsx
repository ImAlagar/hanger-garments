import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiShoppingBag,
  FiX,
  FiTrendingUp,
  FiShoppingCart,
  FiUsers,
  FiMail,
  FiChevronDown,
  FiHeart,
  FiSearch,
  FiSettings,
  FiLogOut,
  FiUser,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube
} from 'react-icons/fi';

// Import constants
import { 
  navItems, 
  tshirtCategories, 
  motionVariants 
} from '../../../constants/headerConstants';
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';

const MobileSideNav = ({
  theme,
  menuOpen,
  shopOpen,
  toggleShop,
  location,
  navigate,
  isLoggedIn,
  user,
  handleLinkClick,
  handleOrdersClick,
  handleLoginClick,
  handleLogout,
  toggleTheme,
  setSearchOpen,
  setMenuOpen,
  getUserDisplayName
}) => {

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleNavItemClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const ThemeToggle = ({ theme, toggleTheme }) => (
    <motion.button
      onClick={toggleTheme}
      className={`p-3 rounded-xl border transition-all duration-300 ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700"
          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-white"
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

  const socialIcons = [
    { icon: FiInstagram, href: "https://instagram.com" },
    { icon: FiFacebook, href: "https://facebook.com" },
    { icon: FiTwitter, href: "https://twitter.com" },
    { icon: FiYoutube, href: "https://youtube.com" }
  ];

  return (
    <AnimatePresence>
      {menuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />

          {/* Side Navigation */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={motionVariants.dropdown}
            className={`fixed top-0 right-0 h-screen w-80 max-w-[90vw] z-[60] shadow-2xl ${
              theme === 'dark' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-900'
            }`}
          >
            {/* Header */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Hanger Garments</h2>
                <motion.button
                  onClick={() => setMenuOpen(false)}
                  className={`p-2 rounded-xl ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX className="text-xl" />
                </motion.button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="h-full scrollbar-hide overflow-y-auto pb-20">
              <motion.ul
                className="flex flex-col px-4 py-4 font-medium"
                variants={motionVariants.container}
                initial="hidden"
                animate="visible"
              >
                {/* Navigation Links */}
                {navItems.map((item) => (
                  <motion.li key={item.path} variants={motionVariants.item} className="mb-1">
                    <motion.div
                      onClick={() => handleNavItemClick(item.path)}
                      className={`flex items-center px-4 py-3 rounded-xl text-base transition-all duration-200 cursor-pointer ${
                        isActivePath(item.path)
                          ? theme === "dark"
                            ? "text-purple-400 font-semibold"
                            : "text-purple-600 font-semibold"
                          : theme === "dark"
                          ? "text-gray-300 hover:text-purple-300"
                          : "text-gray-700 hover:text-purple-600"
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      {item.name}
                    </motion.div>
                  </motion.li>
                ))}

                {/* T-Shirts Dropdown */}
                <motion.li variants={motionVariants.item} className="mb-1">
                  <motion.div
                    onClick={toggleShop}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-base transition-all duration-200 cursor-pointer ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-purple-300"
                        : "text-gray-700 hover:text-purple-600"
                    }`}
                  >
                    T-Shirts
                    <FiChevronDown className={`size-4 transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
                  </motion.div>
                  
                  <AnimatePresence>
                    {shopOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 mt-1 space-y-1 border-l-2 border-purple-500/20"
                      >
                        {tshirtCategories.map((category) => (
                          <motion.div
                            key={category}
                            onClick={() => {
                              navigate(`/collections/${category.toLowerCase().replace(/\s+/g, '-')}`);
                              setMenuOpen(false);
                            }}
                            className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                              theme === "dark"
                                ? "text-gray-400 hover:text-purple-300 hover:bg-gray-800/50"
                                : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            {category}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>

                {/* Action Buttons */}
                <div className="flex items-center justify-between px-4 py-4 mt-2 border-y border-gray-200 dark:border-gray-800">
                  <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                  
                  <motion.button
                    onClick={() => navigate("/wishlist")}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
                        : "text-gray-600 hover:text-purple-600 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiHeart className="size-5" />
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
                        : "text-gray-600 hover:text-purple-600 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiSearch className="size-5" />
                  </motion.button>
                </div>

                {/* User Info */}
                {isLoggedIn && (
                  <motion.li
                    variants={motionVariants.item}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl mt-4 ${
                      theme === "dark" ? "bg-gray-800/50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold text-sm">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {getUserDisplayName()}
                      </span>
                      <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Welcome back
                      </span>
                    </div>
                  </motion.li>
                )}

                {/* Auth Section */}
                <div className={`mt-4 space-y-2 ${
                  theme === "dark" ? "border-gray-800" : "border-gray-200"
                }`}>
                  {!isLoggedIn ? (
                    <motion.button
                      onClick={handleLoginClick}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-3.5 rounded-xl shadow-lg text-base font-semibold transition-all duration-300 hover:shadow-purple-500/25 hover:scale-[1.02]"
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiUser className="inline mr-2 size-4" />
                      Login to Account
                    </motion.button>
                  ) : (
                    <div className="space-y-2">
                      <motion.button
                        onClick={handleOrdersClick}
                        className={`flex items-center w-full px-4 py-3.5 rounded-xl text-base transition-all duration-200 ${
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-800/50"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <FiShoppingBag className="size-4 mr-3 text-purple-500" />
                        My Orders
                      </motion.button>
                      <motion.button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-3.5 rounded-xl text-base transition-all duration-200 ${
                          theme === "dark"
                            ? "text-red-400 hover:bg-red-900/30"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <FiLogOut className="size-4 mr-3" />
                        Logout
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Social Icons */}
                <div className="flex justify-center gap-4 px-4 py-6 mt-4 border-t border-gray-200 dark:border-gray-800">
                  {socialIcons.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400 hover:bg-gray-800"
                          : "text-gray-500 hover:text-purple-600 hover:bg-gray-100"
                      }`}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <social.icon className="size-4" />
                    </motion.a>
                  ))}
                </div>
              </motion.ul>

              {/* Footer */}
              <div className={`px-4 py-3 border-t ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
              }`}>
                <p className={`text-center text-xs ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  © 2024 Hanger Garments. All rights reserved.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSideNav;