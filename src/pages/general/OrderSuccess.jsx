import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from "../../context/ThemeContext";
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiTruck, FiHome, FiShoppingBag } from 'react-icons/fi';

const OrderSuccess = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const cardBg = isDark ? "bg-gray-800" : "bg-gray-50";

  useEffect(() => {
    // Get order details from location state or localStorage
    const stateOrder = location.state;
    const storedOrder = localStorage.getItem('lastOrder');
    
    if (stateOrder) {
      setOrderDetails(stateOrder);
    } else if (storedOrder) {
      setOrderDetails(JSON.parse(storedOrder));
    } else {
      // Redirect to home if no order details
      navigate('/');
    }

    // Countdown for automatic redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, location]);

  if (!orderDetails) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={textColor}>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${bgColor} ${textColor}`}>
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Thank you for your purchase
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Order #<span className="font-semibold">{orderDetails.orderNumber}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`lg:col-span-2 rounded-2xl p-6 ${cardBg} shadow-lg`}
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <FiShoppingBag className="mr-3 text-blue-500" />
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {orderDetails.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.images?.[0] || "/images/placeholder-product.jpg"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.variant?.color || 'N/A'} | {item.variant?.size || 'N/A'} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    ₹{((item.variant?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-blue-600 dark:text-blue-400">
                  ₹{orderDetails.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Order Timeline & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Order Timeline */}
            <div className={`rounded-2xl p-6 ${cardBg} shadow-lg`}>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FiTruck className="mr-3 text-orange-500" />
                Order Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Order Confirmed</p>
                    <p className="text-sm text-gray-500">Your order has been confirmed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiPackage className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-sm text-gray-500">We're preparing your order</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <FiTruck className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-gray-500">Shipped</p>
                    <p className="text-sm text-gray-500">On its way to you</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <FiHome className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-gray-500">Delivered</p>
                    <p className="text-sm text-gray-500">Expected in 3-5 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`rounded-2xl p-6 ${cardBg} shadow-lg`}>
              <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/user/orders')}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  View Order Details
                </button>
                <button
                  onClick={() => navigate('/shop')}
                  className="w-full border border-gray-300 dark:border-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-gray-600 dark:text-gray-400 py-3 rounded-lg font-semibold hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Go to Homepage
                </button>
              </div>
            </div>

            {/* Support Info */}
            <div className={`rounded-2xl p-6 ${cardBg} shadow-lg`}>
              <h3 className="text-xl font-semibold mb-3">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our customer support team is here to help with any questions.
              </p>
              <div className="space-y-2 text-sm">
                <p>📞 <strong>Support:</strong> +91-9876543210</p>
                <p>✉️ <strong>Email:</strong> support@yourstore.com</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Auto Redirect Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <p className="text-blue-700 dark:text-blue-300">
            You will be redirected to the homepage in {countdown} seconds...
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;