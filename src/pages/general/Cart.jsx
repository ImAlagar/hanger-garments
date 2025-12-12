import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMinus, 
  FiPlus, 
  FiTrash2, 
  FiImage, 
  FiPercent, 
  FiDollarSign, 
  FiShoppingBag, 
  FiArrowLeft, 
  FiCheck,
  FiTruck,
  FiPackage,
  FiUserCheck,
  FiStar,
  FiShield,
  FiCreditCard,
  FiAlertCircle
} from "react-icons/fi";
import { removeCartItem, updateQuantity, clearCart } from "../../redux/slices/cartSlice";
import { useCalculateCartPricesMutation, useCalculateQuantityPriceMutation } from "../../redux/services/productService";
import QuantityDiscountBadge from "../../components/discount/QuantityDiscountBadge";
import placeholderimage from "../../assets/images/placeholder.jpg";

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

  // User role detection
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // Theme colors - Matching Checkout/ProductDetails style
  const isDark = theme === "dark";
  const themeColors = {
    bgPrimary: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDark ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-700',
    textTertiary: isDark ? 'text-gray-400' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-500' : 'text-gray-400',
    borderPrimary: isDark ? 'border-gray-700' : 'border-gray-300',
    borderSecondary: isDark ? 'border-gray-600' : 'border-gray-200',
    borderHover: isDark ? 'border-gray-500' : 'border-gray-400',
    borderActive: isDark ? 'border-blue-400' : 'border-blue-500',
    ringActive: isDark ? 'ring-blue-400' : 'ring-blue-500',
    shadowActive: isDark ? 'shadow-blue-500/20' : 'shadow-blue-500/30',
    btnPrimary: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700',
    btnSecondary: isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    success: isDark ? 'text-green-400' : 'text-green-600',
    warning: isDark ? 'text-orange-400' : 'text-orange-600',
    error: isDark ? 'text-red-400' : 'text-red-600',
    info: isDark ? 'text-blue-400' : 'text-blue-600',
    fontProductTitle: isDark ? 'font-bai-jamjuree' : 'font-bai-jamjuree',
    fontProductInfo: isDark ? 'font-instrument' : 'font-instrument',
    fontProductDesc: isDark ? 'font-instrument' : 'font-instrument',
    fontProductPrice: isDark ? 'font-bai-jamjuree' : 'font-bai-jamjuree',
  };

  const bgColor = themeColors.bgPrimary;
  const textColor = themeColors.textPrimary;
  const subText = themeColors.textTertiary;
  const borderColor = themeColors.borderPrimary;
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const cardBg = themeColors.bgCard;

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

  // Calculate individual item totals with quantity discounts AND wholesale pricing
  useEffect(() => {
    const calculateIndividualTotals = async () => {
      if (cartItems.length === 0) {
        setIndividualItemTotals({});
        return;
      }

      const newTotals = {};
      
      for (const item of cartItems) {
        try {
          // FOR WHOLESALE USERS: Use wholesale price directly
          if (isWholesaleUser && item.product?.wholesalePrice) {
            const wholesalePrice = item.product.wholesalePrice;
            const quantity = item.quantity || 1;
            const originalPrice = item.product.normalPrice * quantity;
            const finalPrice = wholesalePrice * quantity;
            
            newTotals[item.id] = {
              finalPrice: finalPrice,
              originalPrice: originalPrice,
              discount: {
                priceType: 'WHOLESALE',
                value: ((originalPrice - finalPrice) / originalPrice * 100).toFixed(1),
                message: 'Wholesale Discount Applied'
              },
              savings: originalPrice - finalPrice,
              priceType: 'WHOLESALE'
            };
          } else {
            // FOR REGULAR USERS: Calculate quantity discounts
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
                savings: result.data.totalSavings,
                priceType: result.data.applicableDiscount?.priceType || 'REGULAR'
              };
            }
          }
        } catch (error) {
          // Fallback to original calculation
          const price = isWholesaleUser && item.product?.wholesalePrice 
            ? item.product.wholesalePrice 
            : Number(item.variant?.price) || Number(item.price) || 0;
          
          newTotals[item.id] = {
            finalPrice: price * item.quantity,
            originalPrice: price * item.quantity,
            discount: null,
            savings: 0,
            priceType: isWholesaleUser ? 'WHOLESALE' : 'REGULAR'
          };
        }
      }
      
      setIndividualItemTotals(newTotals);
    };

    calculateIndividualTotals();
  }, [cartItems, calculateQuantityPrice, isWholesaleUser]);

  // Calculate cart totals with quantity discounts
  useEffect(() => {
    const calculateDiscountedCart = async () => {
      if (cartItems.length === 0) {
        setDiscountedTotals(null);
        return;
      }

      setCalculatingDiscounts(true);
      try {
        // Skip bulk discount calculation for wholesale users
        if (isWholesaleUser) {
          const wholesaleSummary = {
            subtotal: cartItems.reduce((sum, item) => {
              const price = item.product?.wholesalePrice || item.variant?.price || 0;
              return sum + (price * item.quantity);
            }, 0),
            originalSubtotal: cartItems.reduce((sum, item) => {
              const price = item.product?.normalPrice || item.variant?.price || 0;
              return sum + (price * item.quantity);
            }, 0),
            totalDiscount: 0,
            totalSavings: 0,
            wholesaleDiscount: cartItems.reduce((sum, item) => {
              if (item.product?.wholesalePrice && item.product?.normalPrice) {
                return sum + ((item.product.normalPrice - item.product.wholesalePrice) * item.quantity);
              }
              return sum;
            }, 0)
          };
          
          setDiscountedTotals({
            summary: wholesaleSummary,
            cartItems: cartItems.map(item => ({
              ...item,
              finalPrice: (item.product?.wholesalePrice || item.variant?.price || 0) * item.quantity,
              originalPrice: (item.product?.normalPrice || item.variant?.price || 0) * item.quantity
            }))
          });
        } else {
          // Regular user: calculate bulk discounts
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

  // Calculate original subtotal (without discounts)
  const calculateOriginalSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = isWholesaleUser 
        ? (item.product?.normalPrice || Number(item.variant?.price) || Number(item.price) || 0)
        : Number(item.variant?.price) || Number(item.price) || 0;
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

  // Calculate wholesale savings separately
  const calculateWholesaleSavings = () => {
    if (!isWholesaleUser) return 0;
    
    return cartItems.reduce((savings, item) => {
      if (item.product?.wholesalePrice && item.product?.normalPrice) {
        const regularTotal = item.product.normalPrice * item.quantity;
        const wholesaleTotal = item.product.wholesalePrice * item.quantity;
        return savings + (regularTotal - wholesaleTotal);
      }
      return savings;
    }, 0);
  };

  const originalSubtotal = calculateOriginalSubtotal();
  const actualSubtotal = calculateActualSubtotal();
  const totalDiscount = calculateTotalDiscount();
  const wholesaleSavings = calculateWholesaleSavings();
  const totalAmount = actualSubtotal; // Shipping will be calculated separately for wholesale
  const totalSavings = isWholesaleUser ? wholesaleSavings : totalDiscount;

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
    const price = isWholesaleUser && item.product?.wholesalePrice
      ? item.product.wholesalePrice
      : Number(item.variant?.price) || Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return price * qty;
  };

  // Get item discount if available
  const getItemDiscount = (item, itemIndex) => {
    // Use individual item totals first
    if (individualItemTotals[item.id]) {
      const itemTotal = individualItemTotals[item.id];
      const originalPrice = isWholesaleUser && item.product?.normalPrice
        ? item.product.normalPrice * item.quantity
        : (Number(item.variant?.price) || Number(item.price) || 0) * item.quantity;
      return originalPrice - itemTotal.finalPrice;
    }
    
    // Fallback to discounted totals
    if (discountedTotals?.cartItems?.[itemIndex]) {
      const discountedItem = discountedTotals.cartItems[itemIndex];
      const originalPrice = isWholesaleUser && item.product?.normalPrice
        ? item.product.normalPrice * item.quantity
        : (Number(item.variant?.price) || Number(item.price) || 0) * item.quantity;
      return originalPrice - discountedItem.finalPrice;
    }
    
    return 0;
  };

  // Get discount type and value for an item
  const getItemDiscountInfo = (item, itemIndex) => {
    // Use individual item totals first
    if (individualItemTotals[item.id]?.discount) {
      const discount = individualItemTotals[item.id].discount;
      return {
        type: discount?.priceType || 'WHOLESALE',
        value: discount?.value,
        message: discount?.message || 'Wholesale Price'
      };
    }
    
    // Fallback to discounted totals
    if (discountedTotals?.cartItems?.[itemIndex]) {
      const discountedItem = discountedTotals.cartItems[itemIndex];
      return {
        type: discountedItem.applicableDiscount?.priceType || 'REGULAR',
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
          if (isWholesaleUser && item.product?.wholesalePrice) {
            // Update wholesale price calculation
            const wholesalePrice = item.product.wholesalePrice;
            const normalPrice = item.product.normalPrice || wholesalePrice;
            
            setIndividualItemTotals(prev => ({
              ...prev,
              [itemId]: {
                finalPrice: wholesalePrice * numericQuantity,
                originalPrice: normalPrice * numericQuantity,
                discount: {
                  priceType: 'WHOLESALE',
                  value: ((normalPrice - wholesalePrice) / normalPrice * 100).toFixed(1),
                  message: 'Wholesale Discount Applied'
                },
                savings: (normalPrice - wholesalePrice) * numericQuantity,
                priceType: 'WHOLESALE'
              }
            }));
          } else {
            // Regular user calculation
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
                    savings: result.data.totalSavings,
                    priceType: result.data.applicableDiscount?.priceType || 'REGULAR'
                  }
                }));
              }
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
  const renderItemDiscountBadge = (discountInfo, itemDiscount, priceType) => {
    if (!discountInfo || itemDiscount <= 0) return null;

    const isFixedAmount = discountInfo.type === 'FIXED_AMOUNT';
    const isWholesale = priceType === 'WHOLESALE';
    
    let badgeColor = 'bg-green-500';
    let badgeText = '';
    
    if (isWholesale) {
      badgeColor = 'bg-amber-500';
      badgeText = 'WHOLESALE';
    } else if (isFixedAmount) {
      badgeColor = 'bg-purple-500';
      badgeText = `-₹${itemDiscount.toFixed(0)}`;
    } else {
      badgeText = `${discountInfo.value}% OFF`;
    }

    return (
      <div className={`absolute -top-1 -right-1 text-white text-xs px-2 py-1 rounded-full ${badgeColor}`}>
        {badgeText}
      </div>
    );
  };

  // Render discount type indicator for items
  const renderItemDiscountType = (discountInfo, priceType) => {
    if (!discountInfo && priceType !== 'WHOLESALE') return null;

    const isFixedAmount = discountInfo?.type === 'FIXED_AMOUNT';
    const isWholesale = priceType === 'WHOLESALE';
    
    if (isWholesale) {
      return (
        <span className="text-xs px-2 py-1 rounded text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
          Wholesale
        </span>
      );
    } else if (isFixedAmount) {
      return (
        <span className="text-xs px-2 py-1 rounded text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400">
          Fixed Price
        </span>
      );
    } else if (discountInfo) {
      return (
        <span className="text-xs px-2 py-1 rounded text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
          Bulk Save
        </span>
      );
    }
    
    return null;
  };

  // Render savings information
  const renderSavings = () => {
    if (totalSavings > 0) {
      return (
        <div className={`p-4 rounded-lg border ${
          isWholesaleUser 
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}>
          <div className={`flex justify-between items-center ${
            isWholesaleUser 
              ? 'text-amber-700 dark:text-amber-400' 
              : 'text-green-700 dark:text-green-400'
          }`}>
            <span className="text-sm font-semibold flex items-center">
              {isWholesaleUser ? (
                <>
                  <FiUserCheck className="w-4 h-4 mr-1" />
                  Wholesale Discount Applied
                </>
              ) : (
                <>
                  <FiPercent className="w-4 h-4 mr-1" />
                  Quantity Discounts Applied
                </>
              )}
            </span>
            <span className="font-bold">-₹{totalSavings.toFixed(2)}</span>
          </div>
          <p className={`text-xs ${
            isWholesaleUser 
              ? 'text-amber-600 dark:text-amber-300' 
              : 'text-green-600 dark:text-green-300'
          } mt-1`}>
            {isWholesaleUser 
              ? `Wholesale pricing saves you ${((totalSavings / originalSubtotal) * 100).toFixed(1)}%`
              : `You saved ${((totalSavings / originalSubtotal) * 100).toFixed(1)}% through bulk pricing`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  // Render best deal information
  const renderBestDeal = () => {
    if (discountedTotals?.bestDeal && !isWholesaleUser) {
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

  // Render wholesale benefits
  const renderWholesaleBenefits = () => {
    if (isWholesaleUser) {
      return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <FiPackage className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">🎯 Wholesale Benefits</h4>
              <ul className="text-xs text-amber-700 dark:text-amber-400 mt-2 space-y-1">
                <li className="flex items-center">
                  <FiCheck className="w-3 h-3 mr-2 text-green-500" />
                  <span>Special wholesale pricing on all items</span>
                </li>
                <li className="flex items-center">
                  <FiCheck className="w-3 h-3 mr-2 text-green-500" />
                  <span>Priority order processing</span>
                </li>
                <li className="flex items-center">
                  <FiCheck className="w-3 h-3 mr-2 text-green-500" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <FiCheck className="w-3 h-3 mr-2 text-green-500" />
                  <span>Custom shipping solutions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render discount breakdown for items
  const renderItemDiscountBreakdown = (discountInfo, itemDiscount, originalItemTotal, priceType) => {
    if ((!discountInfo && priceType !== 'WHOLESALE') || itemDiscount <= 0) return null;

    const isFixedAmount = discountInfo?.type === 'FIXED_AMOUNT';
    const isWholesale = priceType === 'WHOLESALE';
    
    if (isWholesale) {
      return (
        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Wholesale pricing: Save ₹{itemDiscount.toFixed(2)} ({((itemDiscount / originalItemTotal) * 100).toFixed(1)}% off)
        </div>
      );
    } else if (isFixedAmount) {
      return (
        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
          Fixed price applied: Save ₹{itemDiscount.toFixed(2)}
        </div>
      );
    } else if (discountInfo) {
      return (
        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
          {discountInfo.value}% off: Save ₹{itemDiscount.toFixed(2)}
        </div>
      );
    }
    
    return null;
  };

  // Render shipping note for wholesale
  const renderWholesaleShippingNote = () => {
    if (isWholesaleUser) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
          <div className="flex items-start space-x-2">
            <FiTruck className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                🚚 Shipping Information
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Shipping charges will be calculated based on your location and order volume. 
                Our team will contact you with the final amount.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
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

  // Wholesale Badge Component
  const WholesaleBadge = () => (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold mb-4">
      <FiPackage className="w-4 h-4 mr-2" />
      WHOLESALE CART
    </div>
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
            {isWholesaleUser && (
              <div className="flex justify-center mb-4">
                <WholesaleBadge />
              </div>
            )}
            <div className="flex justify-center mb-6">
              <FiShoppingBag className="w-24 h-24 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className={`text-3xl font-bold mb-4 ${themeColors.fontProductTitle}`}>
              {isWholesaleUser ? 'YOUR WHOLESALE CART IS EMPTY' : 'YOUR CART IS EMPTY'}
            </h1>
            <p className={`text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto ${themeColors.fontProductInfo}`}>
              {isWholesaleUser 
                ? "Add wholesale items to your cart to enjoy special pricing and benefits!"
                : "There is nothing in your cart. Let's add some items and make it beautiful!"
              }
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <Link 
              to="/shop"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${hoverBg} transition-colors ${themeColors.fontProductInfo}`}
            >
              <FiArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            
            <div className="flex items-center gap-4">
              {isWholesaleUser && <WholesaleBadge />}
              
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
          </div>

          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${themeColors.fontProductTitle}`}>
            {isWholesaleUser ? 'WHOLESALE CART' : 'SHOPPING CART'} ({cartItems.length})
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className={`text-lg ${subText} ${themeColors.fontProductInfo}`}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your {isWholesaleUser ? 'wholesale ' : ''}cart
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
                Calculating {isWholesaleUser ? 'wholesale prices' : 'discounts'}...
              </p>
            )}
          </div>
          <div className={`border-b ${borderColor} mt-4`}></div>
        </motion.div>

        {/* Wholesale Benefits */}
        {renderWholesaleBenefits()}

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
                const priceType = individualItemTotals[item.id]?.priceType || (isWholesaleUser ? 'WHOLESALE' : 'REGULAR');
                const hasDiscount = itemDiscount > 0;
                const originalItemTotal = isWholesaleUser && item.product?.normalPrice
                  ? item.product.normalPrice * item.quantity
                  : (Number(item.variant?.price) || Number(item.price) || 0) * item.quantity;
                
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
                            {renderItemDiscountBadge(discountInfo, itemDiscount, priceType)}
                          </div>
                        ) : (
                          <ImagePlaceholder />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm truncate ${themeColors.fontProductInfo}`}>
                          {item.product?.name || 'Unnamed Product'}
                        </h4>
                        <p className={`text-xs opacity-75 mt-1 ${themeColors.fontProductInfo}`}>
                          Color: {item.variant?.color || item.color || 'N/A'} | Size: {item.variant?.size || item.size || 'N/A'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            {isWholesaleUser && item.product?.wholesalePrice ? (
                              <>
                                <p className="font-semibold text-sm text-amber-600 dark:text-amber-400">
                                  ₹{item.product.wholesalePrice.toFixed(2)} <span className="text-xs">(wholesale)</span>
                                </p>
                                <p className="text-xs line-through text-gray-500">
                                  ₹{item.product.normalPrice?.toFixed(2) || '0.00'}
                                </p>
                              </>
                            ) : (
                              <p className={`font-semibold text-sm ${themeColors.fontProductInfo}`}>
                                ₹{((item.variant?.price || item.price || 0)).toFixed(2)}
                              </p>
                            )}
                          </div>
                          {renderItemDiscountType(discountInfo, priceType)}
                        </div>
                        
                        {/* QUANTITY DISCOUNT BADGE (only for regular users) */}
                        {!isWholesaleUser && (
                          <div className="mt-2">
                            <QuantityDiscountBadge 
                              product={item.product}
                              variant={item.variant}
                              currentQuantity={item.quantity}
                            />
                          </div>
                        )}
                        
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
                          <span className={`text-xs text-gray-500 ${themeColors.fontProductInfo}`}>Item Total:</span>
                          <div className="text-right">
                            <span className={`font-semibold text-sm ${themeColors.fontProductInfo}`}>
                              ₹{itemTotal.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <>
                                <span className="text-xs line-through text-gray-500 block">
                                  ₹{originalItemTotal.toFixed(2)}
                                </span>
                                {renderItemDiscountBreakdown(discountInfo, itemDiscount, originalItemTotal, priceType)}
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-2xl font-bold ${themeColors.fontProductTitle}`}>
                    {isWholesaleUser ? 'WHOLESALE ORDER' : 'ORDER SUMMARY'}
                  </h3>
                  {isWholesaleUser && (
                    <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-bold">
                      WHOLESALE
                    </div>
                  )}
                </div>
                
                {/* Savings Information */}
                {renderSavings()}
                {!isWholesaleUser && renderBestDeal()}
                {renderWholesaleShippingNote()}

                {/* Order Breakdown */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className={`text-gray-600 dark:text-gray-400 ${themeColors.fontProductInfo}`}>
                      {isWholesaleUser ? 'Regular Price Subtotal' : 'Original Subtotal'}
                    </span>
                    <span className={themeColors.fontProductInfo}>₹{originalSubtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Wholesale Discount */}
                  {isWholesaleUser && wholesaleSavings > 0 && (
                    <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
                      <span className={themeColors.fontProductInfo}>Wholesale Discount</span>
                      <span className={`font-semibold ${themeColors.fontProductInfo}`}>
                        -₹{wholesaleSavings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {/* Quantity Discount (regular users only) */}
                  {!isWholesaleUser && totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span className={themeColors.fontProductInfo}>Quantity Discounts</span>
                      <span className={themeColors.fontProductInfo}>-₹{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span className={`text-gray-600 dark:text-gray-400 ${themeColors.fontProductInfo}`}>Shipping</span>
                    {isWholesaleUser ? (
                      <div className="text-right">
                        <span className={`text-sm font-medium text-amber-600 dark:text-amber-400 ${themeColors.fontProductInfo}`}>
                          To be calculated
                        </span>
                        <p className={`text-xs text-gray-500 ${themeColors.fontProductInfo}`}>
                          Based on location & volume
                        </p>
                      </div>
                    ) : (
                      <span className={`text-green-600 dark:text-green-400 ${themeColors.fontProductInfo}`}>FREE</span>
                    )}
                  </div>
                  
                  {/* Total Amount */}
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-3">
                    <span className={themeColors.fontProductTitle}>
                      {isWholesaleUser ? 'Order Value' : 'Total Amount'}
                    </span>
                    <div className="text-right">
                      <span className={`text-blue-600 dark:text-blue-400 ${themeColors.fontProductPrice}`}>
                        {isWholesaleUser 
                          ? `₹${totalAmount.toFixed(2)} + Shipping`
                          : `₹${totalAmount.toFixed(2)}`
                        }
                      </span>
                      {isWholesaleUser && (
                        <p className={`text-xs text-gray-500 ${themeColors.fontProductInfo} mt-1`}>
                          Final amount will be confirmed
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Wholesale Total Savings */}
                {isWholesaleUser && wholesaleSavings > 0 && (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg mt-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium text-green-700 dark:text-green-300 ${themeColors.fontProductInfo}`}>
                        🎉 Wholesale Savings
                      </span>
                      <span className={`font-bold text-green-700 dark:text-green-300 ${themeColors.fontProductInfo}`}>
                        ₹{wholesaleSavings.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

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
                    {isWholesaleUser 
                      ? (user ? "REQUEST WHOLESALE ORDER" : "LOGIN FOR WHOLESALE")
                      : (user ? "PROCEED TO PAY" : "LOGIN TO CONTINUE")
                    }
                  </button>
                  
                  <Link
                    to="/shop"
                    className={`w-full py-3 border ${borderColor} rounded-lg font-medium text-center ${hoverBg} transition-colors block ${themeColors.fontProductInfo}`}
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <FiShield className="w-3 h-3" />
                    <span>Secure checkout</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <FiTruck className="w-3 h-3" />
                    <span>{isWholesaleUser ? 'Priority shipping' : 'Free shipping'}</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <FiCreditCard className="w-3 h-3" />
                    <span>Safe payment</span>
                  </div>
                  
                  {!isWholesaleUser && cartItems.some(item => item.quantity === 1) && totalSavings === 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
                        💡 <strong>Tip:</strong> Increase quantities to unlock bulk discounts!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;