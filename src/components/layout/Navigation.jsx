import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartSidebar from "./CartSidebar";

const Navigation = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  
  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold">
              Your Store
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link to="/shop" className="hover:text-gray-600 dark:hover:text-gray-300">
                Shop
              </Link>
              
              {/* Cart Icon */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-gray-600 dark:hover:text-gray-300">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <CartSidebar   
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
};

export default Navigation;