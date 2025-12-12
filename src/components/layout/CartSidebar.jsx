import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiPlus, FiTrash2, FiImage, FiPercent, FiDollarSign, FiUserCheck } from "react-icons/fi";
import { removeCartItem, updateQuantity } from "../../redux/slices/cartSlice";
import { useCalculateCartPricesMutation, useCalculateQuantityPriceMutation } from "../../redux/services/productService";
import placeholderimage from "../../assets/images/placeholder.jpg"

const CartSidebar = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  
  // Check if user is wholesaler
  const isWholesaleUser = user?.role === 'WHOLESALER';

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

  // Calculate ORIGINAL RETAIL price (without any wholesale or discounts)
  const calculateOriginalRetailPrice = (item) => {
    const product = item.product || {};
    const variant = item.variant || {};
    
    // Priority 1: Variant price (retail)
    if (variant.price) {
      return Number(variant.price);
    }
    
    // Priority 2: Product offer price (retail)
    if (product.offerPrice) {
      return Number(product.offerPrice);
    }
    
    // Priority 3: Product normal price (retail)
    if (product.normalPrice) {
      return Number(product.normalPrice);
    }
    
    return 0;
  };

  // Calculate WHOLESALE price (for wholesale users)
  const calculateWholesalePrice = (item) => {
    const product = item.product || {};
    const variant = item.variant || {};
    
    // Priority 1: Variant wholesale price
    if (variant.wholesalePrice) {
      return Number(variant.wholesalePrice);
    }
    
    // Priority 2: Product wholesale price
    if (product.wholesalePrice) {
      return Number(product.wholesalePrice);
    }
    
    // Fallback to retail price if no wholesale price defined
    return calculateOriginalRetailPrice(item);
  };

  // Calculate item price based on user type
  const calculateItemPrice = (item) => {
    if (isWholesaleUser) {
      return calculateWholesalePrice(item);
    }
    return calculateOriginalRetailPrice(item);
  };

  // Calculate item total with wholesale pricing
  const calculateItemTotal = (item, itemIndex) => {
    const basePrice = calculateItemPrice(item);
    const quantity = Number(item.quantity) || 0;
    
    // First check individual item totals from API
    if (individualItemTotals[item.id]) {
      return individualItemTotals[item.id].finalPrice;
    }
    
    // Then check discounted totals from API
    if (discountedTotals?.cartItems?.[itemIndex]) {
      return discountedTotals.cartItems[itemIndex].finalPrice;
    }
    
    // Fallback to base calculation (wholesale or retail)
    return basePrice * quantity;
  };

  // Calculate original retail total (without any discounts)
  const calculateOriginalRetailTotal = (item) => {
    const basePrice = calculateOriginalRetailPrice(item);
    const quantity = Number(item.quantity) || 0;
    return basePrice * quantity;
  };

  // Calculate wholesale total (without any additional discounts)
  const calculateWholesaleTotal = (item) => {
    const wholesalePrice = calculateWholesalePrice(item);
    const quantity = Number(item.quantity) || 0;
    return wholesalePrice * quantity;
  };

  // Calculate individual item totals with quantity discounts and wholesale pricing
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
          if (!cleanProductId) {
            // Use direct calculation if no product ID
            const itemTotal = calculateWholesaleTotal(item);
            newTotals[item.id] = {
              finalPrice: itemTotal,
              originalPrice: itemTotal,
              retailPrice: calculateOriginalRetailTotal(item),
              discount: null,
              savings: 0,
              isWholesalePrice: isWholesaleUser
            };
            continue;
          }

          // Calculate with API, passing user type
          const result = await calculateQuantityPrice({
            productId: cleanProductId,
            variantId: item.variant?._id,
            quantity: item.quantity,
            isWholesaleUser: isWholesaleUser // Pass user type to API
          }).unwrap();

          if (result.success) {
            // For wholesale users, ensure we're using wholesale price as base
            let finalPrice = result.data.finalPrice;
            let originalPrice = result.data.originalPrice;
            
            if (isWholesaleUser) {
              // Always use wholesale price as the minimum
              const wholesaleTotal = calculateWholesaleTotal(item);
              if (finalPrice > wholesaleTotal) {
                finalPrice = wholesaleTotal;
              }
              if (originalPrice > wholesaleTotal) {
                originalPrice = wholesaleTotal;
              }
            }
            
            newTotals[item.id] = {
              finalPrice: finalPrice,
              originalPrice: originalPrice,
              retailPrice: calculateOriginalRetailTotal(item),
              discount: result.data.applicableDiscount,
              savings: result.data.totalSavings,
              isWholesalePrice: isWholesaleUser
            };
          }
        } catch (error) {
          // Fallback to direct calculation
          const itemTotal = isWholesaleUser ? calculateWholesaleTotal(item) : calculateOriginalRetailTotal(item);
          newTotals[item.id] = {
            finalPrice: itemTotal,
            originalPrice: itemTotal,
            retailPrice: calculateOriginalRetailTotal(item),
            discount: null,
            savings: 0,
            isWholesalePrice: isWholesaleUser
          };
        }
      }
      
      setIndividualItemTotals(newTotals);
    };

    calculateIndividualTotals();
  }, [cartItems, calculateQuantityPrice, isWholesaleUser]);

  // Calculate cart totals with quantity discounts and wholesale pricing
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
          variantId: item.variant?._id,
          isWholesaleUser: isWholesaleUser // Pass user type to API
        }));

        const result = await calculateCartPrices(items).unwrap();
        
        if (result.success) {
          // For wholesale users, adjust prices to ensure wholesale is applied
          if (isWholesaleUser && result.data.cartItems) {
            const adjustedCartItems = result.data.cartItems.map((cartItem, index) => {
              const item = cartItems[index];
              const wholesaleTotal = calculateWholesaleTotal(item);
              
              // Ensure wholesale price is the minimum
              return {
                ...cartItem,
                finalPrice: Math.min(cartItem.finalPrice, wholesaleTotal),
                originalPrice: Math.min(cartItem.originalPrice, wholesaleTotal),
                wholesalePrice: wholesaleTotal,
                isWholesale: true
              };
            });
            
            // Recalculate summary
            const subtotal = adjustedCartItems.reduce((sum, item) => sum + item.finalPrice, 0);
            const originalSubtotal = adjustedCartItems.reduce((sum, item) => sum + item.originalPrice, 0);
            const totalSavings = originalSubtotal - subtotal;
            const retailSubtotal = cartItems.reduce((sum, item) => sum + calculateOriginalRetailTotal(item), 0);
            
            setDiscountedTotals({
              ...result.data,
              cartItems: adjustedCartItems,
              summary: {
                ...result.data.summary,
                subtotal: subtotal,
                originalSubtotal: originalSubtotal,
                totalSavings: totalSavings,
                retailSubtotal: retailSubtotal
              }
            });
          } else {
            setDiscountedTotals(result.data);
          }
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
  }, [cartItems, calculateCartPrices, isWholesaleUser]);

  // Calculate RETAIL subtotal (original retail prices - NO wholesale)
  const calculateRetailSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + calculateOriginalRetailTotal(item);
    }, 0);
  };

  // Calculate WHOLESALE subtotal (wholesale prices - NO additional discounts)
  const calculateWholesaleSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + calculateWholesaleTotal(item);
    }, 0);
  };

  // Calculate ACTUAL subtotal with wholesale pricing AND discounts
  const calculateActualSubtotal = () => {
    if (Object.keys(individualItemTotals).length > 0) {
      const totalFromIndividualTotals = Object.values(individualItemTotals).reduce((total, itemTotal) => {
        return total + (itemTotal.finalPrice || 0);
      }, 0);
      
      // For wholesale users, ensure we never exceed wholesale subtotal
      if (isWholesaleUser) {
        const wholesaleSubtotal = calculateWholesaleSubtotal();
        return Math.min(totalFromIndividualTotals, wholesaleSubtotal);
      }
      
      return totalFromIndividualTotals;
    }
    
    // Fallback to discounted totals
    if (discountedTotals?.summary?.subtotal) {
      if (isWholesaleUser) {
        const wholesaleSubtotal = calculateWholesaleSubtotal();
        return Math.min(discountedTotals.summary.subtotal, wholesaleSubtotal);
      }
      return discountedTotals.summary.subtotal;
    }
    
    // Last fallback
    if (isWholesaleUser) {
      return calculateWholesaleSubtotal();
    }
    
    return calculateRetailSubtotal();
  };

  // Calculate total discount/savings
  const calculateTotalSavings = () => {
    const retailSubtotal = calculateRetailSubtotal();
    const actualSubtotal = calculateActualSubtotal();
    
    return retailSubtotal - actualSubtotal;
  };

  // Calculate wholesale savings (separate from quantity discounts)
  const calculateWholesaleSavings = () => {
    if (!isWholesaleUser) return 0;
    
    const retailSubtotal = calculateRetailSubtotal();
    const wholesaleSubtotal = calculateWholesaleSubtotal();
    
    return Math.max(0, retailSubtotal - wholesaleSubtotal);
  };

  // Calculate additional quantity discounts (beyond wholesale)
  const calculateAdditionalDiscounts = () => {
    const wholesaleSavings = calculateWholesaleSavings();
    const totalSavings = calculateTotalSavings();
    
    return Math.max(0, totalSavings - wholesaleSavings);
  };

  // Get actual totals for display
  const retailSubtotal = calculateRetailSubtotal();
  const wholesaleSubtotal = calculateWholesaleSubtotal();
  const actualSubtotal = calculateActualSubtotal();
  const totalSavings = calculateTotalSavings();
  const wholesaleSavings = calculateWholesaleSavings();
  const additionalDiscounts = calculateAdditionalDiscounts();
  const totalAmount = actualSubtotal;

  // Get item discount if available
  const getItemDiscount = (item, itemIndex) => {
    // Use individual item totals first
    if (individualItemTotals[item.id]) {
      const itemTotal = individualItemTotals[item.id];
      const retailPrice = calculateOriginalRetailTotal(item);
      return retailPrice - itemTotal.finalPrice;
    }
    
    // Fallback to discounted totals
    if (discountedTotals?.cartItems?.[itemIndex]) {
      const discountedItem = discountedTotals.cartItems[itemIndex];
      const retailPrice = calculateOriginalRetailTotal(item);
      return retailPrice - discountedItem.finalPrice;
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
        message: individualItemTotals[item.id].discount?.message,
        isWholesale: individualItemTotals[item.id]?.isWholesalePrice
      };
    }
    
    // Fallback to discounted totals
    if (discountedTotals?.cartItems?.[itemIndex]) {
      const discountedItem = discountedTotals.cartItems[itemIndex];
      return {
        type: discountedItem.applicableDiscount?.priceType,
        value: discountedItem.applicableDiscount?.value,
        message: discountedItem.applicableDiscount?.message,
        isWholesale: isWholesaleUser
      };
    }
    
    return {
      isWholesale: isWholesaleUser
    };
  };

  // Enhanced quantity handler
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
              quantity: numericQuantity,
              isWholesaleUser: isWholesaleUser
            }).unwrap();

            if (result.success) {
              // For wholesale users, ensure wholesale price is applied
              let finalPrice = result.data.finalPrice;
              let originalPrice = result.data.originalPrice;
              
              if (isWholesaleUser) {
                const wholesaleTotal = calculateWholesalePrice(item) * numericQuantity;
                finalPrice = Math.min(finalPrice, wholesaleTotal);
                originalPrice = Math.min(originalPrice, wholesaleTotal);
              }

              setIndividualItemTotals(prev => ({
                ...prev,
                [itemId]: {
                  finalPrice: finalPrice,
                  originalPrice: originalPrice,
                  retailPrice: calculateOriginalRetailPrice(item) * numericQuantity,
                  discount: result.data.applicableDiscount,
                  savings: result.data.totalSavings,
                  isWholesalePrice: isWholesaleUser
                }
              }));
            }
          }
        } catch (error) {
          // If API call fails, update with direct calculation
          const itemTotal = isWholesaleUser 
            ? calculateWholesalePrice(item) * numericQuantity 
            : calculateOriginalRetailPrice(item) * numericQuantity;
            
          setIndividualItemTotals(prev => ({
            ...prev,
            [itemId]: {
              finalPrice: itemTotal,
              originalPrice: itemTotal,
              retailPrice: calculateOriginalRetailPrice(item) * numericQuantity,
              discount: null,
              savings: 0,
              isWholesalePrice: isWholesaleUser
            }
          }));
        }
      }
    }
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem(itemId));
  };

  // Get product image
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
    
    e.target.style.display = 'none';
    
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

  // Render item price with wholesale indicator
  const renderItemPrice = (item) => {
    const retailPrice = calculateOriginalRetailPrice(item);
    const wholesalePrice = calculateWholesalePrice(item);
    const displayPrice = isWholesaleUser ? wholesalePrice : retailPrice;
    const discountInfo = getItemDiscountInfo(item, cartItems.findIndex(i => i.id === item.id));
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">
            ₹{displayPrice.toFixed(2)}
          </p>
          {isWholesaleUser && (
            <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-1.5 py-0.5 rounded">
              <FiUserCheck className="w-3 h-3 inline mr-1" />
              WHOLESALE
            </span>
          )}
        </div>
        {/* Show retail price crossed out for wholesale users */}
        {isWholesaleUser && wholesalePrice < retailPrice && (
          <p className="text-xs line-through text-gray-500">
            ₹{retailPrice.toFixed(2)}
          </p>
        )}
      </div>
    );
  };

  // Render discount badge for items
  const renderItemDiscountBadge = (discountInfo, itemDiscount) => {
    if (!discountInfo || itemDiscount <= 0) return null;

    const isWholesale = discountInfo.isWholesale;
    const isFixedAmount = discountInfo.type === 'FIXED_AMOUNT';
    
    return (
      <div className={`absolute -top-1 -right-1 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center ${
        isWholesale ? 'bg-green-600' : 
        isFixedAmount ? 'bg-purple-500' : 'bg-blue-500'
      }`}>
        {isWholesale ? (
          <>
            <FiUserCheck className="w-2.5 h-2.5 mr-0.5" />
            WHOLESALE
          </>
        ) : isFixedAmount ? (
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

    const isWholesale = discountInfo.isWholesale;
    const isFixedAmount = discountInfo.type === 'FIXED_AMOUNT';
    
    if (isWholesale) {
      return (
        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center">
          <FiUserCheck className="w-3 h-3 mr-1" />
          Wholesale Price
        </span>
      );
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded ${
        isFixedAmount 
          ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' 
          : 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      }`}>
        {isFixedAmount ? 'Fixed Price' : 'Bulk Save'}
      </span>
    );
  };

  // Render savings information with wholesale indicator
  const renderSavings = () => {
    if (totalSavings > 0) {
      return (
        <div className={`p-3 rounded-lg mt-4 border ${
          isWholesaleUser 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className={`flex justify-between items-center ${
            isWholesaleUser 
              ? 'text-green-700 dark:text-green-400' 
              : 'text-blue-700 dark:text-blue-400'
          }`}>
            <span className="text-sm font-semibold flex items-center">
              {isWholesaleUser ? (
                <>
                  <FiUserCheck className="w-4 h-4 mr-1" />
                  Total Savings
                </>
              ) : (
                <>
                  <FiPercent className="w-4 h-4 mr-1" />
                  Quantity Discounts
                </>
              )}
            </span>
            <span className="font-bold">-₹{totalSavings.toFixed(2)}</span>
          </div>
          
          {isWholesaleUser && wholesaleSavings > 0 && (
            <div className="text-xs mt-1 text-green-600 dark:text-green-300">
              <div className="flex justify-between">
                <span>• Wholesale Discount:</span>
                <span>-₹{wholesaleSavings.toFixed(2)}</span>
              </div>
              {additionalDiscounts > 0 && (
                <div className="flex justify-between">
                  <span>• Additional Quantity Discount:</span>
                  <span>-₹{additionalDiscounts.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
          
          {!isWholesaleUser && (
            <p className="text-xs mt-1 text-blue-600 dark:text-blue-300">
              You saved {((totalSavings / retailSubtotal) * 100).toFixed(1)}% through bulk pricing
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Render wholesale user badge in header
  const renderUserTypeBadge = () => {
    if (isWholesaleUser) {
      return (
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-0.5 rounded-full flex items-center">
            <FiUserCheck className="w-3 h-3 mr-1" />
            WHOLESALE ACCOUNT
          </span>
          <p className="text-xs text-green-600 dark:text-green-400">
            Special prices applied
          </p>
        </div>
      );
    }
    return null;
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
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold font-italiana tracking-widest">
                    Your Cart ({cartItems.length})
                  </h2>
                  {isWholesaleUser && (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-0.5 rounded-full">
                      WHOLESALE
                    </span>
                  )}
                </div>
                {renderUserTypeBadge()}
                {calculatingDiscounts && (
                  <p className="text-xs text-blue-500 mt-1">Calculating discounts...</p>
                )}
              </div>
              <button 
                onClick={onClose} 
                className={`p-2 rounded-lg ${hoverBg} transition-colors ml-4`}
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
                    const retailItemTotal = calculateOriginalRetailTotal(item);
                    
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
                              {renderItemPrice(item)}
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
                                      ₹{retailItemTotal.toFixed(2)}
                                    </span>
                                    <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                      {isWholesaleUser 
                                        ? 'Wholesale price applied' 
                                        : `Save ₹${itemDiscount.toFixed(2)}`
                                      }
                                    </div>
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

                {/* Order Summary */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                  {/* Show retail price for wholesale users, regular price for others */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {isWholesaleUser ? 'Original Retail Price' : 'Original Subtotal'}
                    </span>
                    <span className={isWholesaleUser ? 'line-through text-gray-500' : ''}>
                      ₹{retailSubtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Wholesale discount line */}
                  {isWholesaleUser && wholesaleSavings > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span className="flex items-center">
                        <FiUserCheck className="w-3 h-3 mr-1" />
                        Wholesale Discount
                      </span>
                      <span>-₹{wholesaleSavings.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Additional quantity discounts */}
                  {additionalDiscounts > 0 && (
                    <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                      <span>Quantity Discounts</span>
                      <span>-₹{additionalDiscounts.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-green-600 dark:text-green-400">FREE</span>
                  </div>
                  
                  {/* Total Amount */}
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-3">
                    <span>Total Amount</span>
                    <span className={`${isWholesaleUser ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Wholesale savings note */}
                  {isWholesaleUser && totalSavings > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
                      <p className="text-xs text-green-700 dark:text-green-400">
                        🎉 You saved ₹{totalSavings.toFixed(2)} with wholesale pricing!
                      </p>
                    </div>
                  )}
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
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;