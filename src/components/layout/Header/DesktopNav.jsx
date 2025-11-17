import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { navItems, tshirtCategories, motionVariants } from '../../../constants/headerConstants';

const DesktopNav = ({
  theme,
  location,
  navigate,
  shopOpen,
  toggleShop,
  handleLinkClick
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (shopOpen) {
          toggleShop();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shopOpen, toggleShop]);

  return (
    <motion.ul
      className="hidden lg:flex items-center gap-6 font-bai-jamjuree tracking-wider font-semibold"
      variants={motionVariants.container}
      initial="hidden"
      animate="visible"
    >
      {navItems.map((item) => (
        <motion.li key={item.path} variants={motionVariants.item}>
          <motion.div
            onClick={() => {
              navigate(item.path);
              handleLinkClick();
            }}
            className={`relative px-5 py-3 rounded-xl text-sm uppercase tracking-widest cursor-pointer transition-all duration-300 group font-bai-jamjuree ${
              location.pathname === item.path
                ? theme === "dark"
                  ? "text-amber-300 bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-400/30 shadow-lg"
                  : "text-amber-600 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 shadow-md"
                : theme === "dark"
                ? "text-gray-300 hover:text-amber-300 hover:bg-gray-800/60 hover:shadow-lg"
                : "text-gray-700 hover:text-amber-600 hover:bg-white hover:shadow-md"
            }`}
            whileHover={{ 
              y: -2,
              scale: 1.05,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Active Link Glow Effect */}
            {location.pathname === item.path && (
              <motion.div
                className={`absolute inset-0 rounded-xl ${
                  theme === "dark" 
                    ? "bg-amber-400/10" 
                    : "bg-amber-500/10"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Hover Gradient Effect */}
            <motion.div
              className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 via-purple-400/5 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
            
            {/* Main Text with Shine Effect */}
            <span className="relative z-10 flex items-center gap-2 font-bai-jamjuree">
              {item.name}
              {location.pathname === item.path && (
                <motion.span
                  className={`w-1 h-1 rounded-full ${
                    theme === "dark" ? "bg-amber-400" : "bg-amber-500"
                  }`}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </span>

            {/* Active Link Underline Animation */}
            {location.pathname === item.path && (
              <motion.div
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 ${
                  theme === "dark" 
                    ? "bg-gradient-to-r from-transparent via-amber-400 to-transparent" 
                    : "bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                }`}
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}

            {/* Hover Border Animation */}
            <motion.div
              className={`absolute inset-0 rounded-xl border ${
                theme === "dark" 
                  ? "border-amber-400/30" 
                  : "border-amber-300/40"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.li>
      ))}
      {/* T-Shirts Dropdown */}
      <motion.li className="relative" variants={motionVariants.item} ref={dropdownRef}>
        <motion.div
          onClick={toggleShop}
          className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm uppercase tracking-widest cursor-pointer transition-all duration-300 group font-bai-jamjuree ${
            location.pathname.startsWith("/shop") || location.pathname.startsWith("/collections")
              ? theme === "dark"
                ? "text-amber-300 bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-400/30 shadow-lg"
                : "text-amber-600 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 shadow-md"
              : theme === "dark"
              ? "text-gray-300 hover:text-amber-300 hover:bg-gray-800/60 hover:shadow-lg"
              : "text-gray-700 hover:text-amber-600 hover:bg-white hover:shadow-md"
          }`}
          whileHover={{ 
            y: -2,
            scale: 1.05,
            transition: { type: "spring", stiffness: 400, damping: 25 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Active Link Glow Effect */}
          {(location.pathname.startsWith("/shop") || location.pathname.startsWith("/collections")) && (
            <motion.div
              className={`absolute inset-0 rounded-xl ${
                theme === "dark" 
                  ? "bg-amber-400/10" 
                  : "bg-amber-500/10"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Hover Gradient Effect */}
          <motion.div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 via-purple-400/5 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
          
          {/* Main Content */}
          <span className="relative z-10 font-bai-jamjuree">T-SHIRTS</span>
          <motion.span
            animate={{ 
              rotate: shopOpen ? 180 : 0,
              scale: shopOpen ? 1.1 : 1
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative z-10"
          >
            <FiChevronDown className="size-4" />
          </motion.span>

          {/* Active Link Underline Animation */}
          {(location.pathname.startsWith("/shop") || location.pathname.startsWith("/collections")) && (
            <motion.div
              className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 ${
                theme === "dark" 
                  ? "bg-gradient-to-r from-transparent via-amber-400 to-transparent" 
                  : "bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              }`}
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}

          {/* Hover Border Animation */}
          <motion.div
            className={`absolute inset-0 rounded-xl border ${
              theme === "dark" 
                ? "border-amber-400/30" 
                : "border-amber-300/40"
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileHover={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Pulse animation when dropdown is open */}
          {shopOpen && (
            <motion.div
              className={`absolute inset-0 rounded-xl border ${
                theme === "dark" ? "border-amber-400/50" : "border-amber-400/60"
              }`}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        <AnimatePresence>
          {shopOpen && (
            <>
              {/* Backdrop for outside clicks */}
              <motion.div
                className="fixed inset-0 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleShop}
              />
              
              {/* Dropdown Content */}
              <motion.div
                variants={motionVariants.dropdown}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={`absolute top-16 left-0 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 border backdrop-blur-xl font-instrument-sans ${
                  theme === "dark"
                    ? "bg-gray-900/95 border-gray-600/50 shadow-2xl"
                    : "bg-white/97 border-gray-200/80 shadow-xl"
                }`}
              >
                {/* Dropdown Header */}
                <div className={`p-4 border-b ${
                  theme === "dark" 
                    ? "border-gray-700 bg-gradient-to-r from-amber-900/20 to-purple-900/10" 
                    : "border-gray-100 bg-gradient-to-r from-amber-50 to-purple-50"
                }`}>
                  <h3 className={`font-bold text-sm uppercase tracking-widest mb-1 font-bai-jamjuree ${
                    theme === "dark" ? "text-amber-300" : "text-amber-600"
                  }`}>
                    Explore Collections
                  </h3>
                  <p className={`text-xs font-instrument-sans ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Premium quality t-shirts for every style
                  </p>
                </div>

                {/* Dropdown Items */}
                <div className="p-3">
                  {tshirtCategories.map((category, index) => (
                    <motion.div
                      key={category}
                      onClick={() => {
                        navigate(`/shop/${category.toLowerCase().replace(/\s+/g, '-')}`);
                        toggleShop();
                        handleLinkClick();
                      }}
                      className={`p-3 cursor-pointer transition-all duration-300 rounded-xl group relative overflow-hidden mb-1 font-instrument-sans ${
                        theme === "dark"
                          ? "hover:bg-gradient-to-r hover:from-amber-900/30 hover:to-purple-900/20 text-gray-300"
                          : "hover:bg-gradient-to-r hover:from-amber-50 hover:to-purple-50 text-gray-700"
                      }`}
                      whileHover={{ 
                        x: 6,
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 400, damping: 25 }
                      }}
                      custom={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Hover Background Gradient */}
                      <motion.div
                        className={`absolute inset-0 rounded-xl  opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                          theme === "dark" 
                            ? "bg-gradient-to-r from-amber-400/10 via-purple-400/5 to-transparent" 
                            : "bg-gradient-to-r from-amber-100/50 via-purple-100/30 to-transparent"
                        }`}
                      />
                      
                      {/* Content */}
                      <div className="relative  flex items-center gap-3">
                        <motion.div
                          className={`w-2 h-2 rounded-full ${
                            theme === "dark" ? "bg-amber-400" : "bg-amber-500"
                          }`}
                          whileHover={{ scale: 1.3 }}
                          transition={{ duration: 0.2 }}
                        />
                        <span className="text-sm font-medium flex-1 font-instrument-sans">{category}</span>
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className={`w-1 h-4 rounded-full ${
                            theme === "dark" ? "bg-amber-400" : "bg-amber-500"
                          }`} />
                        </motion.div>
                      </div>

                      {/* Bottom border on hover */}
                      <motion.div
                        className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full ${
                          theme === "dark" ? "bg-amber-400" : "bg-amber-500"
                        }`}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Dropdown Footer */}
                <div className={`p-3 border-t ${
                  theme === "dark" 
                    ? "border-gray-700 bg-gray-800/50" 
                    : "border-gray-100 bg-gray-50/80"
                }`}>
                  <motion.div
                    onClick={() => {
                      navigate('/shop');
                      toggleShop();
                      handleLinkClick();
                    }}
                    className={`text-center p-2 rounded-lg cursor-pointer font-semibold text-sm uppercase tracking-wide transition-all duration-300 font-bai-jamjuree ${
                      theme === "dark"
                        ? "bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30"
                        : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View All Products
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.li>
    </motion.ul>
  );
};

export default DesktopNav;