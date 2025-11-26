import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMinus, FiPlus, FiTrash2, FiImage, FiPercent, FiDollarSign, FiShoppingBag, FiArrowLeft, FiCheck } from "react-icons/fi";
import { removeCartItem, updateQuantity, clearCart } from "../../redux/slices/cartSlice";
import { useCalculateCartPricesMutation, useCalculateQuantityPriceMutation } from "../../redux/services/productService";
import QuantityDiscountBadge from "../../components/discount/QuantityDiscountBadge";

const Cart = () => {
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
  const [showEmptyAnimation, setShowEmptyAnimation] = useState(false);

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const cardBg = isDark ? "bg-gray-800" : "bg-gray-50";

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

  // Calculate item totals safely
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

  // Get item discount if available
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

  // Get discount type and value for an item
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

  // Handle clear cart
  const handleClearCart = () => {
    dispatch(clearCart());
    setShowEmptyAnimation(true);
    setTimeout(() => setShowEmptyAnimation(false), 3000);
  };

  // SIMPLIFIED: Get product image
  const getProductImage = (item) => {
    if (!item) return '/images/placeholder-product.jpg';

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

    return '/images/placeholder-product.jpg';
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

  // Render discount badge for items
  const renderItemDiscountBadge = (discountInfo, itemDiscount) => {
    if (!discountInfo || itemDiscount <= 0) return null;

    const isFixedAmount = discountInfo.type === 'FIXED_AMOUNT';
    
    return (
      <div className={`absolute -top-1 -right-1 text-white text-xs px-2 py-1 rounded-full ${
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
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
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
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
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

  // Empty Cart Animation Component
  const EmptyCartAnimation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className={`${bgColor} rounded-2xl p-8 max-w-md mx-4 text-center`}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <FiCheck className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">Cart Cleared!</h3>
        <p className="text-gray-500 mb-4">All items have been removed from your cart</p>
        <button
          onClick={() => setShowEmptyAnimation(false)}
          className={`px-6 py-2 rounded-lg ${
            isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          } transition-colors`}
        >
          Continue Shopping
        </button>
      </motion.div>
    </motion.div>
  );

  // Empty Cart State
  if (cartItems.length === 0 && !showEmptyAnimation) {
    return (
      <div className={`min-h-screen py-12 px-6 ${bgColor} ${textColor}`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="flex justify-center mb-6">
              <FiShoppingBag className="w-24 h-24 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4 font-italiana tracking-wider">YOUR CART IS EMPTY</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
              There is nothing in your cart. Let's add some items and make it beautiful!
            </p>
            <Link 
              to="/shop"
              className={`inline-flex items-center px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 ${
                isDark 
                  ? "bg-white text-black hover:bg-gray-200" 
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              CONTINUE SHOPPING
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${bgColor} ${textColor}`}>
      <AnimatePresence>
        {showEmptyAnimation && <EmptyCartAnimation />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/shop"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${hoverBg} transition-colors`}
            >
              <FiArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-italiana tracking-wider mb-2">
            SHOPPING CART ({cartItems.length})
          </h1>
          <div className="flex items-center justify-between">
            <p className={`text-lg ${subText}`}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
            {calculatingDiscounts && (
              <p className="text-sm text-blue-500 flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
                Calculating discounts...
              </p>
            )}
          </div>
          <div className={`border-b ${borderColor} mt-4`}></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              {cartItems.map((item, index) => {
                const imageUrl = getProductImage(item);
                const hasValidImage = imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined';
                const itemTotal = calculateItemTotal(item, index);
                const itemDiscount = getItemDiscount(item, index);
                const discountInfo = getItemDiscountInfo(item, index);
                const hasDiscount = itemDiscount > 0;
                const originalItemTotal = (Number(item.variant?.price) || Number(item.price) || 0) * item.quantity;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`border ${borderColor} rounded-xl p-4 ${cardBg} transition-all duration-300 hover:shadow-lg`}
                  >
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
                        
                        {/* QUANTITY DISCOUNT BADGE */}
                        <div className="mt-2">
                          <QuantityDiscountBadge 
                            product={item.product}
                            variant={item.variant}
                            currentQuantity={item.quantity}
                          />
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
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="sticky top-8"
            >
              <div className={`border ${borderColor} rounded-xl p-6 ${cardBg}`}>
                <h3 className="text-2xl font-bold font-italiana tracking-wider mb-6">ORDER SUMMARY</h3>
                
                {/* Savings Information */}
                {renderSavings()}
                {renderBestDeal()}

                {/* Order Breakdown */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
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

                {/* Action Buttons */}
                <div className="space-y-3 mt-6">
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
                  
                  <Link
                    to="/shop"
                    className={`w-full py-3 border ${borderColor} rounded-lg font-medium text-center ${hoverBg} transition-colors block`}
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
                
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                  Free shipping & Returns • Secure checkout
                </p>

                {/* Bulk Purchase Tip */}
                {totalSavings === 0 && cartItems.some(item => item.quantity === 1) && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-4">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
                      💡 <strong>Tip:</strong> Increase quantities to unlock bulk discounts!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;