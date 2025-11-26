import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { FiChevronRight, FiUser, FiBell, FiLogOut, FiSettings } from "react-icons/fi";
import { MdOutlineLightMode } from "react-icons/md";
import { CiDark } from "react-icons/ci";
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { logout } from '../../../redux/slices/authSlice';
import { useTheme } from "../../../context/ThemeContext";
import generateBreadcrumb from "./generateBreadcrumb";


const AdminHeader = ({ onMenuClick, sidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // ✅ Theme context
  const { theme, toggleTheme } = useTheme();

  // ✅ Redux state
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/admin/login');
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/admin/profile');
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    navigate('/admin/settings');
  };

  // Check if user is admin

  // Get current page title from pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/admin") return "Dashboard";
    if (path.includes("/dashboard/products") && !path.includes("/add") && !path.includes("/edit") && !path.includes("/view") ) return "Products"  ;
    if (path.includes("/dashboard/products/add")) return "Add Product";
    if (path.includes("/dashboard/products/edit")) return "Edit Product";
    if (path.includes("/dashboard/products/view")) return "View Product";

    if (path.includes("/dashboard/sliders") && !path.includes("/add") && !path.includes("/edit")) return "Products";
    if (path.includes("/dashboard/sliders/add")) return "Add sliders";
    if (path.includes("/dashboard/sliders/edit")) return "Edit sliders";
    if (path.includes("/dashboard/sliders/view")) return "View sliders";

    if (path.includes("/dashboard/categories")) return "Categories";
    if (path.includes("/dashboard/orders")) return "Orders";
    if (path.includes("/dashboard/users")) return "Users";
    if (path.includes("/dashboard/contact")) return "Contact";
    if (path.includes("/dashboard/review")) return "Review";
    if (path.includes("/dashboard/coupons")) return "Coupons";
    return "Dashboard";
  };



  const breadcrumb = generateBreadcrumb();
  const currentPageTitle = getPageTitle();

  // Get user display data
  const getUserData = () => {
    if (!user) {
      return {
        name: "Admin User",
        email: "",
        role: "Administrator",
        avatar: null
      };
    }

    return {
      name: user.name || user.fullName || "Admin User",
      email: user.email || "",
      role: user.role || "Administrator",
      avatar: user.avatar || null
    };
  };

  const userData = getUserData();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between p-3 sm:p-4">
        {/* Left Section - Menu & Breadcrumb */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden flex-shrink-0"
            aria-label="Toggle menu"
          >
            <RxHamburgerMenu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* Desktop menu button - Only when sidebar is closed */}
          {!sidebarOpen && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden lg:block flex-shrink-0"
              aria-label="Toggle menu"
            >
              <RxHamburgerMenu size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
          
          {/* Page Title for Mobile */}
          <div className="lg:hidden min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {currentPageTitle}
            </h1>
            {breadcrumb.length > 1 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {breadcrumb[breadcrumb.length - 2]}
              </p>
            )}
          </div>

          {/* Breadcrumb - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 min-w-0 flex-1">
            <span className="font-medium text-gray-900 dark:text-white truncate">Admin</span>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={item}>
                <FiChevronRight size={14} className="flex-shrink-0" />
                <span className={`truncate ${
                  index === breadcrumb.length - 1 
                    ? "text-blue-600 dark:text-blue-400 font-medium" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Section - Theme Toggle & User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              theme === "dark" 
                ? "bg-gray-700 hover:bg-gray-600 text-yellow-300" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <MdOutlineLightMode size={18} />
            ) : (
              <CiDark size={18} />
            )}
          </button>

          {/* Notifications (Optional - you can uncomment if needed) */}
          {/*
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
            <FiBell size={18} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          */}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {/* User Info - Hidden on mobile, visible on sm and up */}
              <div className="hidden sm:block text-right min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px] lg:max-w-[140px]">
                  {userData.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] lg:max-w-[140px]">
                  {userData.role}
                </p>
              </div>
              
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt={userData.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FiUser size={16} className="text-white" />
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userData.email}
                  </p>
                </div>



                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FiLogOut size={16} className="mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Breadcrumb */}
      {breadcrumb.length > 2 && (
        <div className="lg:hidden px-3 pb-3 -mt-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto hide-scrollbar">
            {breadcrumb.slice(0, -1).map((item, index) => (
              <React.Fragment key={item}>
                <span className="truncate">{item}</span>
                {index < breadcrumb.length - 2 && (
                  <FiChevronRight size={12} className="flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default AdminHeader;