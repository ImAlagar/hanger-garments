import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from "../../../redux/slices/authSlice";
import { clearCart } from "../../../redux/slices/cartSlice";
import { clearCurrentWishlist } from "../../../redux/slices/wishlistSlice";
import { FiSearch, FiShoppingCart, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { useTheme } from "../../../context/ThemeContext";
import { useSelector } from 'react-redux';

// Custom hooks
import { useHeaderState } from '../../../hooks/useHeaderState';
import { useScrollEffects } from '../../../hooks/useScrollEffects';
import { useSearch } from '../../../hooks/useSearch';

// Components
import PromotionalTopbar from './PromotionalTopbar';
import DesktopNav from './DesktopNav';
import MobileSideNav from './MobileSideNav';
import SearchOverlay from './SearchOverlay';
import ThemeToggle from '../../Toggle/ThemeToggle';
import UserDropdown from './UserDropdown';
import CartSidebar from '../CartSidebar';

// Import wishlist selector
import { selectWishlistCount } from '../../../redux/slices/wishlistSlice';

// Import logos
import logowhite from "../../../assets/images/logowhite.png";
import logoblack from "../../../assets/images/logo.png";

const MainHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Use the correct property names from your auth slice
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistCount = useSelector(selectWishlistCount);
  const { theme, toggleTheme } = useTheme();
  
  // Cart sidebar state
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Custom hooks
  const { 
    dropdownOpen, 
    menuOpen, 
    shopOpen, 
    setDropdownOpen, 
    setMenuOpen, 
    toggleDropdown, 
    toggleMenu, 
    toggleShop 
  } = useHeaderState();
  
  const { scrolled, topbarVisible } = useScrollEffects();
  
  // Use only useSearch for search-related state
  const { 
    searchQuery, 
    searchOpen, 
    setSearchQuery, 
    setSearchOpen, 
    handleSearch 
  } = useSearch();

  // Get the appropriate logo based on theme
  const getLogo = () => {
    return theme === "dark" ? logowhite : logoblack;
  };

  const handleLogout = () => {
    // Clear cart and wishlist first (user-specific data)
    dispatch(clearCart());
    dispatch(clearCurrentWishlist());
    
    // Then logout from auth
    dispatch(logout());
    
    // Close any open menus/dropdowns
    setDropdownOpen(false);
    setMenuOpen(false);
    
    // Navigate to home
    navigate("/");
  };

  const handleOrdersClick = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/user/orders");
  };

  const handleLoginClick = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const handleLinkClick = () => setMenuOpen(false);

  const getUserDisplayName = () => {
    if (!user) return "My Account";
    return user.name || user.email?.split("@")[0] || "My Account";
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleWishlistClick = () => {
    navigate("/wishlist");
  };

  return (
    <>
      {/* Promotional Topbar */}
      <PromotionalTopbar theme={theme} topbarVisible={topbarVisible} />

      {/* Main Header */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled 
            ? "shadow-xl backdrop-blur-md translate-y-0" 
            : "shadow-md translate-y-0"
        } ${
          theme === "dark"
            ? "bg-gray-900/95 text-white"
            : "bg-white/95 text-gray-900"
        }`}
      >
        {/* Main Container */}
        <div className="mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 relative">
          {/* Logo */}
          <motion.div
            onClick={() => navigate("/")}
            className="flex items-center z-50 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Logo Image */}
            <img 
              src={getLogo()} 
              alt="Garments Logo" 
              className="h-16 lg:h-16 xl:h-16 w-20" // Adjust height as needed
            />
            
            {/* Optional: Keep text logo as fallback or remove it */}
            {/* <h1 className="font-italiana tracking-widest font-semibold uppercase text-2xl lg:text-3xl ml-3">
              Garments
            </h1> */}
          </motion.div>

          {/* Desktop Navigation */}
          <DesktopNav
            theme={theme}
            location={location}
            navigate={navigate}
            shopOpen={shopOpen}
            toggleShop={toggleShop}
            handleLinkClick={handleLinkClick}
          />

          {/* Desktop Right Section */}
          <div className="hidden xl:flex items-center gap-3 relative z-50">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            <motion.button
              onClick={() => setSearchOpen(true)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                theme === "dark"
                  ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
                  : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSearch className="size-5" />
            </motion.button>

            {/* Wishlist Button with Badge */}
            <motion.button
              onClick={handleWishlistClick}
              className={`p-3 rounded-xl transition-all duration-300 relative ${
                theme === "dark"
                  ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
                  : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiHeart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </motion.button>

            {/* Cart Button with Badge */}
            <motion.button
              onClick={handleCartClick}
              className={`p-3 rounded-xl transition-all duration-300 relative ${
                theme === "dark"
                  ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
                  : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiShoppingCart className="size-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium">
                  {cartItems.length}
                </span>
              )}
            </motion.button>

            <UserDropdown
              theme={theme}
              dropdownOpen={dropdownOpen}
              toggleDropdown={toggleDropdown}
              user={user}
              isLoggedIn={isAuthenticated}
              handleLogout={handleLogout}
              handleOrdersClick={handleOrdersClick}
              handleLoginClick={handleLoginClick}
              getUserDisplayName={getUserDisplayName}
            />
          </div>

          {/* Mobile Right Section */}
          <div className="xl:hidden flex items-center gap-3 z-50">
            <motion.button
              onClick={() => setSearchOpen(true)}
              className={`p-3 rounded-xl transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
                  : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiSearch className="size-5" />
            </motion.button>

            {/* Mobile Cart Button with Badge */}
            <motion.button
              onClick={handleCartClick}
              className={`p-3 rounded-xl transition-colors relative ${
                theme === "dark"
                  ? "text-gray-300 hover:text-purple-300 hover:bg-gray-800"
                  : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiShoppingCart className="size-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium">
                  {cartItems.length}
                </span>
              )}
            </motion.button>

            <motion.button
              onClick={toggleMenu}
              className={`text-xl w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-900"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </motion.button>
          </div>
        </div>

        {/* Search Overlay */}
        <SearchOverlay
          searchOpen={searchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSearchOpen={setSearchOpen}
          handleSearch={handleSearch}
        />

        {/* Mobile Side Navigation */}
        <MobileSideNav
          theme={theme}
          menuOpen={menuOpen}
          shopOpen={shopOpen}
          toggleShop={toggleShop}
          location={location}
          navigate={navigate}
          isLoggedIn={isAuthenticated}
          user={user}
          handleLinkClick={handleLinkClick}
          handleOrdersClick={handleOrdersClick}
          handleLoginClick={handleLoginClick}
          handleLogout={handleLogout}
          toggleTheme={toggleTheme}
          setSearchOpen={setSearchOpen}
          setMenuOpen={setMenuOpen}
          getUserDisplayName={getUserDisplayName}
          wishlistCount={wishlistCount}
          
        />

        {/* Cart Sidebar */}
        <CartSidebar 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      </motion.nav>
    </>
  );
};

export default MainHeader;