import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { removeFromCart, updateQuantity } from "../../redux/slices/cartSlice";

const CartSidebar = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.variant.price * item.quantity);
  }, 0);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart({ itemId }));
      return;
    }
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart({ itemId }));
  };

const handleProceedToBuy = () => {
  onClose();
  
  // More robust user check
  if (!user || !user.id) {
    navigate("/login", { 
      state: { 
        from: "/checkout",
        message: "Please login to proceed with checkout"
      } 
    });
    return;
  }
  
  if (cartItems.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  
  navigate("/checkout");
};
  const handleViewCart = () => {
    onClose();
    navigate("/");
  };

  const sidebarVariants = {
    closed: {
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const backdropVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  // Custom Shopping Cart SVG
  const ShoppingCartSVG = () => (
    <svg 
      className="w-24 h-24 text-gray-400 dark:text-gray-500 mb-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.2} 
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21"
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.2} 
        d="M9 21a1 1 0 100-2 1 1 0 000 2zM17 21a1 1 0 100-2 1 1 0 000 2z"
        opacity="0.7"
      />
    </svg>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`fixed top-0 right-0 h-screen w-80 max-w-[90vw] z-[101] shadow-2xl sm:w-96 ${bgColor} ${textColor} flex flex-col`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h2 className="text-xl font-semibold font-italiana tracking-widest">
                Your Cart ({cartItems.length})
              </h2>
              <button 
                onClick={onClose} 
                className={`p-2 rounded-lg ${hoverBg} transition-colors`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  {/* SVG Icon */}
                  <ShoppingCartSVG />
                  
                  {/* Text Content */}
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 font-medium">
                    Your cart is empty
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-1">
                    There is nothing in your cart.
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
                    Let's add some items
                  </p>
                  
                  {/* Continue Shopping Button */}
                  <Link to={'/shop'}
                    onClick={onClose}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      isDark 
                        ? "bg-white text-black hover:bg-gray-200" 
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className={`border ${borderColor} rounded-lg p-4 ${hoverBg} transition-colors`}>
                      <div className="flex gap-4">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                          <p className="text-xs opacity-75 mt-1">
                            Color: {item.variant.color} | Size: {item.variant.size}
                          </p>
                          <p className="font-semibold text-sm mt-2">₹{item.variant.price}</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className={`w-8 h-8 rounded-lg border ${borderColor} flex items-center justify-center text-sm ${hoverBg} transition-colors`}
                              >
                                <FiMinus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className={`w-8 h-8 rounded-lg border ${borderColor} flex items-center justify-center text-sm ${hoverBg} transition-colors`}
                              >
                                <FiPlus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-2"
                              title="Remove item"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className={`border-t ${borderColor} p-6 space-y-4`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-semibold text-lg">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleProceedToBuy}
                    className={`w-full py-3 rounded-lg font-semibold text-center transition-colors ${
                      isDark 
                        ? "bg-white text-black hover:bg-gray-200" 
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {user ? "PROCEED TO PAY" : "LOGIN TO CONTINUE"}
                  </button>
                  
                  <button
                    onClick={handleViewCart}
                    className={`w-full py-3 border ${borderColor} rounded-lg font-medium text-center ${hoverBg} transition-colors`}
                  >
                    VIEW CART
                  </button>
                </div>
                
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Free shipping
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;