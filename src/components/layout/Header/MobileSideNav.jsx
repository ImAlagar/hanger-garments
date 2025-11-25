import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  FiYoutube,
  FiAward,
  FiStar,
  FiPlus
} from 'react-icons/fi';

// Import constants
import { 
  navItems, 
  motionVariants 
} from '../../../constants/headerConstants';
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';
import { useGetAllCategoriesQuery } from '../../../redux/services/categoryService';
import { useGetAllSubcategoriesQuery } from '../../../redux/services/subcategoryService';

// Import logos
import logowhite from "../../../assets/images/logowhite.png";
import logoblack from "../../../assets/images/logo.png";

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
  getUserDisplayName,
  wishlistCount
}) => {

  const { category } = useParams();
  const [categoryDropdowns, setCategoryDropdowns] = useState({});
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Fetch categories and subcategories
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useGetAllCategoriesQuery();
  
  const { 
    data: subcategoriesData, 
    isLoading: subcategoriesLoading,
    error: subcategoriesError
  } = useGetAllSubcategoriesQuery();

  const categories = categoriesData?.data || categoriesData || [];
  const subcategories = subcategoriesData?.data || subcategoriesData || [];

  // Group subcategories by category
  const subcategoriesByCategory = subcategories.reduce((acc, subcat) => {
    const categoryName = subcat.category?.name || subcat.category;
    if (categoryName) {
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(subcat);
    }
    return acc;
  }, {});

  // Get the appropriate logo based on theme
  const getLogo = () => {
    return theme === "dark" ? logowhite : logoblack;
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleNavItemClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleWishlistClick = () => {
    navigate("/wishlist");
    setMenuOpen(false);
  };

  // Create URL-safe category name
  const createCategorySlug = (categoryName) => {
    return categoryName.toLowerCase().replace(/\s+/g, '-');
  };

  // Check if category is active
  const isCategoryActive = (categoryName) => {
    if (!category) return false;
    return createCategorySlug(categoryName) === category.toLowerCase();
  };

  const toggleCategoryDropdown = (categoryName) => {
    setCategoryDropdowns(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const toggleAuthDropdown = () => {
    setAuthDropdownOpen(!authDropdownOpen);
  };

  const handleCategoryClick = (categoryName) => {
    const categorySlug = createCategorySlug(categoryName);
    navigate(`/shop/${categorySlug}`);
    setMenuOpen(false);
  };

  const handleSubcategoryClick = (categoryName, subcategoryName) => {
    const categorySlug = createCategorySlug(categoryName);
    navigate(`/shop/${categorySlug}?subcategories=${encodeURIComponent(subcategoryName)}`);
    setMenuOpen(false);
  };

  const handleCollectionClick = (url) => {
    navigate(url);
    setMenuOpen(false);
  };

  // Auth navigation handlers
  const handleUserLogin = () => {
    navigate('/login');
    setMenuOpen(false);
  };

  const handleWholesalerLogin = () => {
    navigate('/wholesaler/login');
    setMenuOpen(false);
  };

  const handleUserRegister = () => {
    navigate('/register');
    setMenuOpen(false);
  };

  const handleWholesalerRegister = () => {
    navigate('/wholesaler/register');
    setMenuOpen(false);
  };

  // Close sidebar when clicking on backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setMenuOpen(false);
    }
  };

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen, setMenuOpen]);

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
    { icon: FiInstagram, href: "https://www.instagram.com/hanger_garments/" },
    { icon: FiFacebook, href: "https://www.facebook.com/share/19yyr4QjpU/?mibextid=wwXIfr" },
  ];

  // Collections data
  const collections = [
    { 
      name: "Featured Products", 
      url: "/shop?featured=true",
      icon: FiStar
    },
    { 
      name: "New Arrivals", 
      url: "/shop?newArrival=true",
      icon: FiAward
    },
    { 
      name: "Best Sellers", 
      url: "/shop?bestSeller=true",
      icon: FiTrendingUp
    },
    { 
      name: "In Stock", 
      url: "/shop?inStock=true",
      icon: FiShoppingBag
    }
  ];

  return (
    <AnimatePresence>
      {menuOpen && (
        <>
          {/* Backdrop - Fixed to cover entire screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={handleBackdropClick}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              cursor: 'pointer'
            }}
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
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside sidebar
          >
            {/* Header with Logo */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Logo */}
                  <img 
                    src={getLogo()} 
                    alt="Garments Logo" 
                    className="h-8 w-auto mr-3"
                  />
                  <h2 className="text-xl font-bold tracking-tight font-italiana">Hanger Garments</h2>
                </div>
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
                {/* Home Link */}
                <motion.li key="/" variants={motionVariants.item} className="mb-1">
                  <motion.div
                    onClick={() => handleNavItemClick("/")}
                    className={`flex items-center px-4 py-3 rounded-xl text-base transition-all duration-200 cursor-pointer ${
                      isActivePath("/")
                        ? theme === "dark"
                          ? "text-purple-400 font-semibold"
                          : "text-purple-600 font-semibold"
                        : theme === "dark"
                        ? "text-gray-300 hover:text-purple-300"
                        : "text-gray-700 hover:text-purple-600"
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <FiHome className="mr-3 size-4" />
                    Home
                  </motion.div>
                </motion.li>

                {/* All Products Link */}
                <motion.li key="all-products" variants={motionVariants.item} className="mb-1">
                  <motion.div
                    onClick={() => handleNavItemClick("/shop")}
                    className={`flex items-center px-4 py-3 rounded-xl text-base transition-all duration-200 cursor-pointer ${
                      isActivePath("/shop")
                        ? theme === "dark"
                          ? "text-purple-400 font-semibold"
                          : "text-purple-600 font-semibold"
                        : theme === "dark"
                        ? "text-gray-300 hover:text-purple-300"
                        : "text-gray-700 hover:text-purple-600"
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <FiShoppingBag className="mr-3 size-4" />
                    All Products
                  </motion.div>
                </motion.li>

                {/* Categories with Dropdowns */}
                {categories.map((cat) => {
                  const categoryName = cat.name;
                  const categorySubcategories = subcategoriesByCategory[categoryName] || [];
                  const isActive = isCategoryActive(categoryName);
                  const isDropdownOpen = categoryDropdowns[categoryName];

                  return (
                    <motion.li key={cat.id || cat._id} variants={motionVariants.item} className="mb-1">
                      <motion.div
                        onClick={() => toggleCategoryDropdown(categoryName)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-base transition-all duration-200 cursor-pointer ${
                          isActive
                            ? theme === "dark"
                              ? "text-purple-400 font-semibold"
                              : "text-purple-600 font-semibold"
                            : theme === "dark"
                            ? "text-gray-300 hover:text-purple-300"
                            : "text-gray-700 hover:text-purple-600"
                        }`}
                      >
                        <div className="flex items-center">
                          <span>{categoryName}</span>
                        </div>
                        {categorySubcategories.length > 0 && (
                          <FiChevronDown className={`size-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        )}
                      </motion.div>
                      
                      <AnimatePresence>
                        {isDropdownOpen && categorySubcategories.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-4 mt-1 space-y-1 border-l-2 border-purple-500/20"
                          >
                            {/* View All Category Link */}
                            <motion.div
                              onClick={() => handleCategoryClick(categoryName)}
                              className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                                isActive
                                  ? theme === "dark"
                                    ? "text-purple-400 font-semibold bg-gray-800/50"
                                    : "text-purple-600 font-semibold bg-gray-50"
                                  : theme === "dark"
                                  ? "text-gray-400 hover:text-purple-300 hover:bg-gray-800/50"
                                  : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              👀 View All {categoryName}
                            </motion.div>

                            {/* Subcategories List */}
                            <div className="space-y-1 mb-3">
                              <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Subcategories
                              </div>
                              {categorySubcategories.map((subcat) => (
                                <motion.div
                                  key={subcat.id || subcat._id}
                                  onClick={() => handleSubcategoryClick(categoryName, subcat.name)}
                                  className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                                    theme === "dark"
                                      ? "text-gray-400 hover:text-purple-300 hover:bg-gray-800/50"
                                      : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                                  }`}
                                  whileHover={{ x: 4 }}
                                >
                                  {subcat.name}
                                </motion.div>
                              ))}
                            </div>

                            {/* Featured Links */}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Featured
                              </div>
                              <motion.div
                                onClick={() => handleCollectionClick(`/shop/${createCategorySlug(categoryName)}?newArrival=true`)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors duration-200 mb-1 cursor-pointer"
                                whileHover={{ x: 4 }}
                              >
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                New Arrivals
                              </motion.div>
                              <motion.div
                                onClick={() => handleCollectionClick(`/shop/${createCategorySlug(categoryName)}?bestSeller=true`)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors duration-200 cursor-pointer"
                                whileHover={{ x: 4 }}
                              >
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                Best Sellers
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}

                {/* Collections Dropdown */}
                <motion.li variants={motionVariants.item} className="mb-1">
                  <motion.div
                    onClick={() => setCollectionsOpen(!collectionsOpen)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-base transition-all duration-200 cursor-pointer ${
                      collectionsOpen
                        ? theme === "dark"
                          ? "text-purple-400 font-semibold"
                          : "text-purple-600 font-semibold"
                        : theme === "dark"
                        ? "text-gray-300 hover:text-purple-300"
                        : "text-gray-700 hover:text-purple-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <FiStar className="mr-3 size-4" />
                      Collections
                    </div>
                    <FiChevronDown className={`size-4 transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />
                  </motion.div>
                  
                  <AnimatePresence>
                    {collectionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 mt-1 space-y-1 border-l-2 border-purple-500/20"
                      >
                        {collections.map((collection, index) => (
                          <motion.div
                            key={index}
                            onClick={() => handleCollectionClick(collection.url)}
                            className={`flex items-center px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                              theme === "dark"
                                ? "text-gray-400 hover:text-purple-300 hover:bg-gray-800/50"
                                : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            <collection.icon className="mr-3 size-4" />
                            {collection.name}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>

                {/* Action Buttons */}
                <div className="flex items-center justify-between px-4 py-4 mt-2 border-y border-gray-200 dark:border-gray-800">
                  <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                  
                  {/* Wishlist Button with Count */}
                  <motion.button
                    onClick={handleWishlistClick}
                    className={`p-3 rounded-xl transition-all duration-200 relative ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
                        : "text-gray-600 hover:text-purple-600 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiHeart className="size-5" />
                    {wishlistCount > 0 && (
                      <span className={`absolute -top-1 -right-1 rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium ${
                        theme === "dark" 
                          ? "bg-red-500 text-white" 
                          : "bg-red-500 text-white"
                      }`}>
                        {wishlistCount}
                      </span>
                    )}
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
                    <div className="space-y-2">
                      {/* Auth Dropdown Toggle */}
                      <motion.button
                        onClick={toggleAuthDropdown}
                        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-base transition-all duration-200 ${
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-800/50"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center">
                          <FiUser className="size-4 mr-3 text-purple-500" />
                          Login to Account
                        </div>
                        <FiChevronDown className={`size-4 transition-transform ${authDropdownOpen ? 'rotate-180' : ''}`} />
                      </motion.button>

                      {/* Auth Dropdown Content */}
                      <AnimatePresence>
                        {authDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-4 space-y-2 border-l-2 border-purple-500/20"
                          >
                            {/* Login Options */}
                            <div className="pt-2">
                              <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Login Options
                              </div>
                              
                              {/* User Login */}
                              <motion.button
                                onClick={handleUserLogin}
                                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                                  theme === "dark"
                                    ? "text-gray-400 hover:text-purple-300 hover:bg-gray-800/50"
                                    : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                                }`}
                                whileHover={{ x: 4 }}
                              >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                                  theme === "dark" ? "bg-purple-900" : "bg-purple-100"
                                }`}>
                                  <FiUser className={`size-4 ${theme === "dark" ? "text-purple-300" : "text-purple-600"}`} />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">User Login</div>
                                  <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    For regular customers
                                  </div>
                                </div>
                              </motion.button>

                              {/* Wholesaler Login */}
                              <motion.button
                                onClick={handleWholesalerLogin}
                                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                                  theme === "dark"
                                    ? "text-gray-400 hover:text-purple-300 hover:bg-gray-800/50"
                                    : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                                }`}
                                whileHover={{ x: 4 }}
                              >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                                  theme === "dark" ? "bg-blue-900" : "bg-blue-100"
                                }`}>
                                  <FiShoppingBag className={`size-4 ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`} />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">Wholesaler Login</div>
                                  <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    For business accounts
                                  </div>
                                </div>
                              </motion.button>
                            </div>

                            {/* Register Options */}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Create Account
                              </div>
                              
                              {/* User Register */}
                              <motion.button
                                onClick={handleUserRegister}
                                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                                  theme === "dark"
                                    ? "text-gray-400 hover:text-purple-300 hover:bg-gray-800/50"
                                    : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                                }`}
                                whileHover={{ x: 4 }}
                              >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                                  theme === "dark" ? "bg-green-900" : "bg-green-100"
                                }`}>
                                  <FiPlus className={`size-4 ${theme === "dark" ? "text-green-300" : "text-green-600"}`} />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">User Register</div>
                                  <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Create customer account
                                  </div>
                                </div>
                              </motion.button>

                              {/* Wholesaler Register */}
                              <motion.button
                                onClick={handleWholesalerRegister}
                                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                                  theme === "dark"
                                    ? "text-gray-400 hover:text-purple-300 hover:bg-gray-800/50"
                                    : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                                }`}
                                whileHover={{ x: 4 }}
                              >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                                  theme === "dark" ? "bg-orange-900" : "bg-orange-100"
                                }`}>
                                  <FiPlus className={`size-4 ${theme === "dark" ? "text-orange-300" : "text-orange-600"}`} />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">Wholesaler Register</div>
                                  <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    Create business account
                                  </div>
                                </div>
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Wishlist Link in Menu */}
                      <motion.button
                        onClick={handleWishlistClick}
                        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-base transition-all duration-200 ${
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-800/50"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center">
                          <FiHeart className="size-4 mr-3 text-purple-500" />
                          My Wishlist
                        </div>
                        {wishlistCount > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium min-w-6 text-center ${
                            theme === "dark" 
                              ? "bg-red-500 text-white" 
                              : "bg-red-500 text-white"
                          }`}>
                            {wishlistCount}
                          </span>
                        )}
                      </motion.button>

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