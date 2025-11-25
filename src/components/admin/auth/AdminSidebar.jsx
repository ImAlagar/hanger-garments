import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import logo from '../../../assets/images/logo.png';
import logowhite from '../../../assets/images/logowhite.png';
import { FolderPlus, Home, Mail, MessageSquare, Package, ShoppingBag, Sliders, TicketPercent, Users } from 'lucide-react';
import { FiChevronLeft, FiChevronRight, FiGift, FiLogOut, FiStar, FiTrendingUp } from 'react-icons/fi';
import { useTheme } from "../../../context/ThemeContext";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const { theme } = useTheme();
  const [userData] = useState({
    name: "Admin User",
    role: "Administrator",
    avatar: null
  });

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { name: "Slider", icon: <Sliders size={20} />, path: "/dashboard/sliders" },
    { name: "Products", icon: <Package size={20} />, path: "/dashboard/products" },
    { name: "Quantity Pricing", icon: <FiTrendingUp size={20} />, path: "/dashboard/quantity-pricing" },
    { name: "Categories", icon: <FolderPlus size={20} />, path: "/dashboard/categories" },
    { name: "SubCategories", icon: <FolderPlus size={20} />, path: "/dashboard/subcategories" },
    { name: "Orders", icon: <ShoppingBag size={20} />, path: "/dashboard/orders" },
    { name: "Users", icon: <Users size={20} />, path: "/dashboard/users" },
    { name: "Contact", icon: <Mail size={20} />, path: "/dashboard/contacts" },
    { name: "Review", icon: <FiStar size={20} />, path: "/dashboard/ratings" },
    { name: "Coupons", icon: <FiGift size={20} />, path: "/dashboard/coupons" },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("adminSidebarOpen");
    window.location.href = "/admin/login";
  };

  const isActiveLink = (path) => {
    // Exact match for dashboard
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    
    if (path !== "/dashboard" && location.pathname.startsWith(path)) {
      return true;
    }
    
    return false;
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Theme-based styles
  const sidebarBg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const sidebarBorder = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const headerBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-800";
  const textMuted = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const activeBg = theme === "dark" ? "bg-blue-900" : "bg-blue-50";
  const activeText = theme === "dark" ? "text-blue-300" : "text-blue-600";
  const activeBorder = theme === "dark" ? "border-blue-700" : "border-blue-100";
  const logoutHover = theme === "dark" ? "hover:bg-red-900" : "hover:bg-red-50";

  if (!isOpen && !isMobile) return null;

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            initial={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed lg:relative z-50 w-64 shadow-xl border-r flex flex-col h-screen transition-all duration-300 flex-shrink-0 ${sidebarBg} ${sidebarBorder}`}
          >
            {/* Sidebar Header */}
            <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${headerBg} ${sidebarBorder}`}>
              <div className="flex items-center space-x-3">
                <img 
                  src={theme === "dark" ? logowhite : logo} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className={`text-xl font-italiana font-bold ${textColor}`}>
                  Admin Panel
                </span>
              </div>
              
              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === "dark" 
                      ? "hover:bg-gray-700 text-gray-300" 
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <FiChevronLeft size={16} />
                </button>
              )}
              {isMobile && (
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === "dark" 
                      ? "hover:bg-gray-700 text-gray-300" 
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <RxCross2 size={20} />
                </button>
              )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
              {menuItems.map((item) => {
                const isActive = isActiveLink(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      if (isMobile) {
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                      isActive
                        ? `${activeBg} ${activeText} border ${activeBorder} shadow-sm`
                        : `${textMuted} ${hoverBg} hover:text-gray-900 dark:hover:text-white`
                    }`}
                  >
                    <div className={
                      isActive 
                        ? activeText 
                        : theme === "dark" 
                          ? "text-gray-400 group-hover:text-gray-200" 
                          : "text-gray-400 group-hover:text-gray-600"
                    }>
                      {item.icon}
                    </div>
                    <span className="font-medium flex-1">{item.name}</span>
                    {isActive && (
                      <FiChevronRight 
                        size={16} 
                        className={activeText} 
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className={`p-4 border-t space-y-2 flex-shrink-0 ${sidebarBorder}`}>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 ${logoutHover} transition-all duration-200 group`}
              >
                <FiLogOut 
                  size={20} 
                  className={
                    theme === "dark" 
                      ? "text-red-500 group-hover:text-red-400" 
                      : "text-red-400 group-hover:text-red-600"
                  } 
                />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;