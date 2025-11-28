import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiPlus, FiTrash2, FiImage, FiPercent, FiDollarSign } from "react-icons/fi";
import { removeCartItem, updateQuantity } from "../../redux/slices/cartSlice";
import { useCalculateCartPricesMutation, useCalculateQuantityPriceMutation } from "../../redux/services/productService";
import placeholderimage from "../../assets/images/placeholder.jpg"

const CartSidebar = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  // API mutations
  const [calculateCartPrices] = useCalculateCartPricesMutation();
  const [calculateQuantityPrice] = useCalculateQuantityPriceMutation();
  
  const [discountedTotals, setDiscountedTotals] = useState(null);
  const [calculatingDiscounts, setCalculatingDiscounts] = useState(false);
  const [individualItemTotals, setIndividualItemTotals] = useState({});

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Helper function to clean product ID
  const cleanProductIdFunc = (product) => {
    if (!product) return null;
    const rawId = product._id || product.id;
    if (!rawId) return null;
    
    if (rawId.includes('-')) {
      const parts = rawId.split('-');
      const lastPart = parts[parts.length - 1];
      if (/^[A-Z][a-z]*$/.test(lastPart)) {
        return parts.slice(0, -1).join('-');
      }
    }
    return rawId;
  };

  // Calculate individual item totals with quantity discounts
  useEffect(() => {
    const calculateIndividualTotals = async () => {
      if (cartItems.length === 0) {
        setIndividualItemTotals({});
        return;
      }

      const newTotals = {};
      
      for (const item of cartItems) {
        try {
          const cleanProductId = cleanProductIdFunc(item.product);
          if (!cleanProductId) continue;

          const result = await calculateQuantityPrice({
            productId: cleanProductId,
            variantId: item.variant?._id,
            quantity: item.quantity
          }).unwrap();

          if (result.success) {
            newTotals[item.id] = {
              finalPrice: result.data.finalPrice,
              originalPrice: result.data.originalPrice,
              discount: result.data.applicableDiscount,
              savings: result.data.totalSavings
            };
          }
        } catch (error) {
          // Fallback to original calculation
          const price = Number(item.variant?.price) || Number(item.price) || 0;
          newTotals[item.id] = {
            finalPrice: price * item.quantity,
            originalPrice: price * item.quantity,
            discount: null,
            savings: 0
          };
        }
      }
      
      setIndividualItemTotals(newTotals);
    };

    calculateIndividualTotals();
  }, [cartItems, calculateQuantityPrice]);

  // Calculate cart totals with quantity discounts
  useEffect(() => {
    const calculateDiscountedCart = async () => {
      if (cartItems.length === 0) {
        setDiscountedTotals(null);
        return;
      }

      setCalculatingDiscounts(true);
      try {
        const items = cartItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          variantId: item.variant?._id
        }));

        const result = await calculateCartPrices(items).unwrap();
        
        if (result.success) {
          setDiscountedTotals(result.data);
        } else {
          setDiscountedTotals(null);
        }
      } catch (error) {
        console.error('Error calculating cart discounts:', error);
        setDiscountedTotals(null);
      } finally {
        setCalculatingDiscounts(false);
      }
    };

    calculateDiscountedCart();
  }, [cartItems, calculateCartPrices]);

  // Calculate original subtotal (without discounts)
  const calculateOriginalSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.variant?.price) || Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return total + (price * qty);
    }, 0);
  };

  // Calculate ACTUAL subtotal with individual discounts
  const calculateActualSubtotal = () => {
    if (Object.keys(individualItemTotals).length > 0) {
      return Object.values(individualItemTotals).reduce((total, itemTotal) => {
        return total + (itemTotal.finalPrice || 0);
      }, 0);
    }
    
    // Fallback to discounted totals or original calculation
    return discountedTotals?.summary?.subtotal || calculateOriginalSubtotal();
  };

  // Calculate total discount
  const calculateTotalDiscount = () => {
    const originalSubtotal = calculateOriginalSubtotal();
    const actualSubtotal = calculateActualSubtotal();
    return originalSubtotal - actualSubtotal;
  };

  const originalSubtotal = calculateOriginalSubtotal();
  const actualSubtotal = calculateActualSubtotal();
  const totalDiscount = calculateTotalDiscount();
  const totalAmount = actualSubtotal; // Shipping is free
  const totalSavings = totalDiscount;

  // Calculate item totals safely - UPDATED
  const calculateItemTotal = (item, itemIndex) => {
    // Use individual item totals first
    if (individualItemTotals[item.id]) {
      return individualItemTotals[item.id].finalPrice;
    }
    
    // Fallback to discounted totals
    if (discountedTotals?.cartItems?.[itemIndex]) {
      return discountedTotals.cartItems[itemIndex].finalPrice;
    }
    
    // Final fallback
    const price = Number(item.variant?.price) || Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return price * qty;
  };

  // Get item discount if available - UPDATED
  const getItemDiscount = (item, itemIndex) => {
    // Use individual item totals first
    if (individualItemTotals[item.id]) {
      const itemTotal = individualItemTotals[item.id];
      const originalPrice = (Number(item.variant?.price) || Number(item.price) || 0) * item.quantity;
      return originalPrice - itemTotal.finalPrice;
    }
    
    // Fallback to discounted totals
    if (discountedTotals?.cartItems?.[itemIndex]) {
      const discountedItem = discountedTotals.cartItems[itemIndex];
      const originalPrice = (Number(item.variant?.price) || Number(item.price) || 0) * item.quantity;
      return originalPrice - discountedItem.finalPrice;
    }
    
    return 0;
  };

  // Get discount type and value for an item - UPDATED
  const getItemDiscountInfo = (item, itemIndex) => {
    // Use individual item totals first
    if (individualItemTotals[item.id]?.discount) {
      return {
        type: individualItemTotals[item.id].discount?.priceType,
        value: individualItemTotals[item.id].discount?.value,
        message: individualItemTotals[item.id].discount?.message
      };
    }
    
    // Fallback to discounted totals
    if (discountedTotals?.cartItems?.[itemIndex]) {
      const discountedItem = discountedTotals.cartItems[itemIndex];
      return {
        type: discountedItem.applicableDiscount?.priceType,
        value: discountedItem.applicableDiscount?.value,
        message: discountedItem.applicableDiscount?.message
      };
    }
    
    return null;
  };

  // Enhanced quantity handler with immediate feedback
  const handleQuantityChange = async (itemId, newQuantity) => {
    const numericQuantity = Number(newQuantity);
    if (isNaN(numericQuantity) || numericQuantity < 0) return;
    
    if (numericQuantity === 0) {
      dispatch(removeCartItem(itemId));
    } else {
      dispatch(updateQuantity({ itemId, quantity: numericQuantity }));
      
      // Immediately update individual total for this item
      const item = cartItems.find(item => item.id === itemId);
      if (item) {
        try {
          const cleanProductId = cleanProductIdFunc(item.product);
          if (cleanProductId) {
            const result = await calculateQuantityPrice({
              productId: cleanProductId,
              variantId: item.variant?._id,
              quantity: numericQuantity
            }).unwrap();

            if (result.success) {
              setIndividualItemTotals(prev => ({
                ...prev,
                [itemId]: {
                  finalPrice: result.data.finalPrice,
                  originalPrice: result.data.originalPrice,
                  discount: result.data.applicableDiscount,
                  savings: result.data.totalSavings
                }
              }));
            }
          }
        } catch (error) {
          // If API call fails, it will be updated in the next useEffect cycle
        }
      }
    }
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem(itemId));
  };

  // SIMPLIFIED: Get product image
  const getProductImage = (item) => {
    if (!item) return placeholderimage;

    // Priority 1: Variant image
    if (item.variant?.image && isValidImage(item.variant.image)) {
      return item.variant.image;
    }

    // Priority 2: Product main image
    if (item.product?.image && isValidImage(item.product.image)) {
      return item.product.image;
    }

    // Priority 3: Product images array
    if (item.product?.images && item.product.images.length > 0) {
      const validImage = item.product.images.find(img => isValidImage(img));
      if (validImage) return validImage;
    }

    return placeholderimage;
  };

  // Helper function to validate images
  const isValidImage = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') return false;
    if (imageUrl === 'null' || imageUrl === 'undefined') return false;
    if (imageUrl.includes('via.placeholder.com')) return false;
    if (imageUrl.includes('No+Image')) return false;
    return true;
  };

  // Handle image error
  const handleImageError = (e, item) => {
    console.error(`❌ Image failed to load for: ${item.product?.name}`, {
      attemptedSrc: e.target.src,
      itemData: item
    });
    
    // Hide broken image and show placeholder
    e.target.style.display = 'none';
    
    // Create placeholder if it doesn't exist
    const parent = e.target.parentElement;
    if (parent && !parent.querySelector('.image-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = "image-placeholder w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center";
      placeholder.innerHTML = '<FiImage class="w-6 h-6 text-gray-400" />';
      parent.appendChild(placeholder);
    }
  };

  // Image Placeholder Component
  const ImagePlaceholder = () => (
    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
      <FiImage className="w-6 h-6 text-gray-400" />
    </div>
  );

  const handleProceedToBuy = () => {
    onClose();
    
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
    navigate("/cart");
  };

  // Render discount badge for items
  const renderItemDiscountBadge = (discountInfo, itemDiscount) => {
    if (!discountInfo || itemDiscount <= 0) return null;

    const isFixedAmount = discountInfo.type === 'FIXED_AMOUNT';
    
    return (
      <div className={`absolute -top-1 -right-1 text-white text-xs px-1 py-0.5 rounded-full ${
        isFixedAmount ? 'bg-purple-500' : 'bg-green-500'
      }`}>
        {isFixedAmount ? (
          <>-₹{itemDiscount.toFixed(0)}</>
        ) : (
          <>{discountInfo.value}% OFF</>
        )}
      </div>
    );
  };

  // Render discount type indicator for items
  const renderItemDiscountType = (discountInfo) => {
    if (!discountInfo) return null;

    const isFixedAmount = discountInfo.type === 'FIXED_AMOUNT';
    
    return (
      <span className={`text-xs px-2 py-1 rounded ${
        isFixedAmount 
          ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' 
          : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      }`}>
        {isFixedAmount ? 'Fixed Price' : 'Bulk Save'}
      </span>
    );
  };

  // Render savings information
  const renderSavings = () => {
    if (totalSavings > 0) {
      return (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4 border border-green-200 dark:border-green-800">
          <div className="flex justify-between items-center text-green-700 dark:text-green-400">
            <span className="text-sm font-semibold flex items-center">
              <FiPercent className="w-4 h-4 mr-1" />
              Quantity Discounts Applied
            </span>
            <span className="font-bold">-₹{totalSavings.toFixed(2)}</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-300 mt-1">
            You saved {((totalSavings / originalSubtotal) * 100).toFixed(1)}% through bulk pricing
          </p>
        </div>
      );
    }
    return null;
  };

  // Render best deal information
  const renderBestDeal = () => {
    if (discountedTotals?.bestDeal) {
      const { bestDeal } = discountedTotals;
      const isFixedAmount = bestDeal.discountType === 'FIXED_AMOUNT';
      
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-3 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center">
            {isFixedAmount ? "💰 Fixed Price Deal" : "💰 Best Bulk Deal"}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            {bestDeal.message}
          </p>
          {bestDeal.savings > 0 && (
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Save ₹{bestDeal.savings.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Render discount breakdown for items
  const renderItemDiscountBreakdown = (discountInfo, itemDiscount, originalItemTotal) => {
    if (!discountInfo || itemDiscount <= 0) return null;

    const isFixedAmount = discountInfo.type === 'FIXED_AMOUNT';
    
    return (
      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
        {isFixedAmount ? (
          <>Fixed price applied: Save ₹{itemDiscount.toFixed(2)}</>
        ) : (
          <>{discountInfo.value}% off: Save ₹{itemDiscount.toFixed(2)}</>
        )}
      </div>
    );
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

  // Empty Cart Component
  const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <ShoppingCartSVG />
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 font-medium">
        Your cart is empty
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-sm mb-1">
        There is nothing in your cart.
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
        Let's add some items
      </p>
      <Link 
        to={'/shop'}
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
              <div>
                <h2 className="text-xl font-semibold font-italiana tracking-widest">
                  Your Cart ({cartItems.length})
                </h2>
                {calculatingDiscounts && (
                  <p className="text-xs text-blue-500 mt-1">Calculating discounts...</p>
                )}
              </div>
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
                <EmptyCart />
              ) : (
                <div className="p-4 space-y-4">
                  {cartItems.map((item, index) => {
                    const imageUrl = getProductImage(item);
                    const hasValidImage = imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined';
                    const itemTotal = calculateItemTotal(item, index);
                    const itemDiscount = getItemDiscount(item, index);
                    const discountInfo = getItemDiscountInfo(item, index);
                    const hasDiscount = itemDiscount > 0;
                    const originalItemTotal = (Number(item.variant?.price) || Number(item.price) || 0) * item.quantity;
                    
                    return (
                      <div key={item.id} className={`border ${borderColor} rounded-lg p-4 ${hoverBg} transition-colors`}>
                        <div className="flex gap-4">
                          {/* Image Container */}
                          <div className="flex-shrink-0">
                            {hasValidImage ? (
                              <div className="relative">
                                <img
                                  src={imageUrl}
                                  alt={item.product?.name || 'Product image'}
                                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                                  onError={(e) => handleImageError(e, item)}
                                  loading="lazy"
                                />
                                {renderItemDiscountBadge(discountInfo, itemDiscount)}
                              </div>
                            ) : (
                              <ImagePlaceholder />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.product?.name || 'Unnamed Product'}</h4>
                            <p className="text-xs opacity-75 mt-1">
                              Color: {item.variant?.color || item.color || 'N/A'} | Size: {item.variant?.size || item.size || 'N/A'}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="font-semibold text-sm">
                                ₹{((item.variant?.price || item.price || 0)).toFixed(2)}
                              </p>
                              {hasDiscount && renderItemDiscountType(discountInfo)}
                            </div>
                            

                            
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
                            
                            {/* Item Total */}
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                              <span className="text-xs text-gray-500">Item Total:</span>
                              <div className="text-right">
                                <span className="font-semibold text-sm">
                                  ₹{itemTotal.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                  <>
                                    <span className="text-xs line-through text-gray-500 block">
                                      ₹{originalItemTotal.toFixed(2)}
                                    </span>
                                    {renderItemDiscountBreakdown(discountInfo, itemDiscount, originalItemTotal)}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className={`border-t ${borderColor} p-6 space-y-4`}>
                {/* Savings Information */}
                {renderSavings()}
                {renderBestDeal()}

                {/* Order Summary */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Original Subtotal</span>
                    <span>₹{originalSubtotal.toFixed(2)}</span>
                  </div>
                  
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Quantity Discounts</span>
                      <span>-₹{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-green-600 dark:text-green-400">FREE</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-3">
                    <span>Total Amount</span>
                    <span className="text-blue-600 dark:text-blue-400">₹{totalAmount.toFixed(2)}</span>
                  </div>
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
                  Free shipping & Returns
                </p>

                {/* Bulk Purchase Tip */}
                {totalSavings === 0 && cartItems.some(item => item.quantity === 1) && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
                      💡 <strong>Tip:</strong> Increase quantities to unlock bulk discounts!
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;