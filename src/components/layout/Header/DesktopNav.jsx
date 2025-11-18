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
      className="hidden xl:flex items-center gap-6 font-bai-jamjuree tracking-wider font-semibold relative"
      variants={motionVariants.container}
      initial="hidden"
      animate="visible"
    >
      {navItems.map((item) => {
        // Check if this is the Shop item to add dropdown
        const isShopItem = item.name === "SHOP" || item.path === "/shop";
        
        return (
          <motion.li 
            key={item.path} 
            variants={motionVariants.item} 
            ref={isShopItem ? dropdownRef : null}
            className="relative"
          >
            {isShopItem ? (
              // Shop item with dropdown
              <motion.div
                onClick={toggleShop}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-lg text-sm uppercase tracking-widest cursor-pointer transition-colors duration-200 group font-bai-jamjuree ${
                  location.pathname.startsWith("/shop") || location.pathname.startsWith("/collections")
                    ? theme === "dark"
                      ? "text-amber-300 bg-gray-800 border border-gray-600"
                      : "text-amber-600 bg-gray-100 border border-gray-300"
                    : theme === "dark"
                    ? "text-gray-300 hover:text-amber-300 hover:bg-gray-800"
                    : "text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 font-bai-jamjuree">{item.name}</span>
                <motion.span
                  animate={{ rotate: shopOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <FiChevronDown className="size-4" />
                </motion.span>
              </motion.div>
            ) : (
              // Regular navigation item
              <motion.div
                onClick={() => {
                  navigate(item.path);
                  handleLinkClick();
                }}
                className={`relative px-5 py-3 rounded-lg text-sm uppercase tracking-widest cursor-pointer transition-colors duration-200 font-bai-jamjuree ${
                  location.pathname === item.path
                    ? theme === "dark"
                      ? "text-amber-300 bg-gray-800 border border-gray-600"
                      : "text-amber-600 bg-gray-100 border border-gray-300"
                    : theme === "dark"
                    ? "text-gray-300 hover:text-amber-300 hover:bg-gray-800"
                    : "text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-2">
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
              </motion.div>
            )}

            {/* Dropdown for Shop item */}
            {isShopItem && (
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
                    
                    {/* Dropdown Content - Fixed positioning */}
                    <motion.div
                      variants={motionVariants.dropdown}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className={`fixed transform -translate-x-1/2 w-64 rounded-lg shadow-xl overflow-hidden z-50 border ${
                        theme === "dark"
                          ? "bg-gray-900 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                   
                    >
                      {/* Dropdown Header */}
                      <div className={`p-3 border-b ${
                        theme === "dark" 
                          ? "border-gray-700 bg-gray-800" 
                          : "border-gray-200 bg-gray-50"
                      }`}>
                        <h3 className={`font-semibold text-sm uppercase tracking-wider mb-1 ${
                          theme === "dark" ? "text-amber-300" : "text-amber-600"
                        }`}>
                          Categories
                        </h3>
                      </div>

                      {/* Dropdown Items */}
                      <div className="p-2">
                        {tshirtCategories.map((category, index) => (
                          <motion.div
                            key={category}
                            onClick={() => {
                              navigate(`/shop/${category.toLowerCase().replace(/\s+/g, '-')}`);
                              toggleShop();
                              handleLinkClick();
                            }}
                            className={`p-3 cursor-pointer transition-colors duration-200 rounded-md mb-1 ${
                              theme === "dark"
                                ? "text-gray-300 hover:bg-gray-800 hover:text-amber-300"
                                : "text-gray-700 hover:bg-gray-100 hover:text-amber-600"
                            }`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{category}</span>
                              <div className={`w-1 h-3 rounded-full ${
                                theme === "dark" ? "bg-amber-400" : "bg-amber-500"
                              }`} />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Dropdown Footer */}
                      <div className={`p-3 border-t ${
                        theme === "dark" 
                          ? "border-gray-700 bg-gray-800" 
                          : "border-gray-200 bg-gray-50"
                      }`}>
                        <motion.div
                          onClick={() => {
                            navigate('/shop');
                            toggleShop();
                            handleLinkClick();
                          }}
                          className={`text-center p-2 rounded-md cursor-pointer font-semibold text-sm uppercase tracking-wide transition-colors duration-200 ${
                            theme === "dark"
                              ? "bg-amber-600 text-white hover:bg-amber-700"
                              : "bg-amber-500 text-white hover:bg-amber-600"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View All
                        </motion.div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            )}
          </motion.li>
        );
      })}
    </motion.ul>
  );
};

export default DesktopNav;