// components/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  useCalculateOrderTotalsMutation, 
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useCreateCODOrderMutation,
} from "../../redux/services/orderService";
import { clearCart } from "../../redux/slices/cartSlice";
import { useGetAvailableCouponsQuery, useValidateCouponMutation } from "../../redux/services/couponService";
import { useCalculateQuantityPriceMutation } from "../../redux/services/productService";
import { CreditCard, MapPin, ShoppingCart, Shield, Truck, Upload, X, Percent, Tag } from "lucide-react";
import razorpayService from "../../utils/razorpayService";
import QuantityDiscountBadge from "../../components/discount/QuantityDiscountBadge";

const Checkout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  // API mutations
  const [calculateOrderTotals] = useCalculateOrderTotalsMutation();
  const [initiatePayment] = useInitiatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [createCODOrder] = useCreateCODOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();
  const [calculateQuantityPrice] = useCalculateQuantityPriceMutation();
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  // State for quantity discounts
  const [individualItemTotals, setIndividualItemTotals] = useState({});
  const [quantityDiscounts, setQuantityDiscounts] = useState({});
  const [calculatingDiscounts, setCalculatingDiscounts] = useState(false);

  // Get available coupons based on subtotal
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.variant?.price || item.product?.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);

  const { 
    data: availableCouponsData, 
    isLoading: couponsLoading,
    refetch: refetchCoupons 
  } = useGetAvailableCouponsQuery(subtotal, {
    skip: subtotal === 0
  });

  const availableCoupons = availableCouponsData?.data || [];

  // State
  const [orderData, setOrderData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "ONLINE"
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    shippingCost: 0,
    totalAmount: 0,
    quantityDiscount: 0,
    couponDiscount: 0
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  
  // Updated state for multiple images
  const [customImages, setCustomImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const inputBg = isDark ? "bg-gray-800" : "bg-gray-50";

  // Calculate individual item totals with quantity discounts
  useEffect(() => {
    const calculateIndividualTotals = async () => {
      if (cartItems.length === 0) {
        setIndividualItemTotals({});
        setQuantityDiscounts({});
        return;
      }

      setCalculatingDiscounts(true);
      const newTotals = {};
      const newDiscounts = {};
      let totalQuantityDiscount = 0;
      
      for (const item of cartItems) {
        try {
          const cleanProductId = getCleanProductId(item.product?._id);
          if (!cleanProductId) continue;

          const result = await calculateQuantityPrice({
            productId: cleanProductId,
            variantId: item.variant?._id,
            quantity: item.quantity
          }).unwrap();

          if (result.success) {
            const originalPrice = (item.variant?.price || item.product?.price || 0) * item.quantity;
            const discountedPrice = result.data.finalPrice;
            const itemDiscount = originalPrice - discountedPrice;

            newTotals[item.id] = {
              finalPrice: discountedPrice,
              originalPrice: originalPrice,
              discount: result.data.applicableDiscount,
              savings: result.data.totalSavings
            };

            newDiscounts[item.id] = {
              discount: itemDiscount,
              discountInfo: result.data.applicableDiscount,
              originalPrice: originalPrice,
              discountedPrice: discountedPrice
            };

            totalQuantityDiscount += itemDiscount;
          }
        } catch (error) {
          // Fallback to original calculation
          const price = Number(item.variant?.price) || Number(item.product?.price) || 0;
          const originalPrice = price * item.quantity;
          newTotals[item.id] = {
            finalPrice: originalPrice,
            originalPrice: originalPrice,
            discount: null,
            savings: 0
          };
          newDiscounts[item.id] = {
            discount: 0,
            discountInfo: null,
            originalPrice: originalPrice,
            discountedPrice: originalPrice
          };
        }
      }
      
      setIndividualItemTotals(newTotals);
      setQuantityDiscounts(newDiscounts);
      
      // Update totals with quantity discounts
      const discountedSubtotal = Object.values(newTotals).reduce((total, item) => total + item.finalPrice, 0);
      const originalSubtotal = Object.values(newTotals).reduce((total, item) => total + item.originalPrice, 0);
      
      setTotals(prev => ({
        ...prev,
        subtotal: discountedSubtotal,
        quantityDiscount: originalSubtotal - discountedSubtotal,
        totalAmount: discountedSubtotal - (appliedCoupon ? totals.couponDiscount : 0)
      }));
      
      setCalculatingDiscounts(false);
    };

    calculateIndividualTotals();
  }, [cartItems, calculateQuantityPrice]);

  // Calculate initial totals
  useEffect(() => {
    calculateInitialTotals();
  }, [cartItems]);

  const calculateInitialTotals = async () => {
    if (cartItems.length === 0) return;

    try {
      const subtotal = cartItems.reduce((total, item) => {
        const price = item.variant?.price || item.product?.price || 0;
        const quantity = item.quantity || 0;
        return total + (price * quantity);
      }, 0);

      setTotals({
        subtotal,
        discount: 0,
        shippingCost: 0,
        totalAmount: subtotal,
        quantityDiscount: 0,
        couponDiscount: 0
      });
    } catch (error) {
      console.error("Error calculating totals:", error);
    }
  };

  // Extract clean product ID
  const getCleanProductId = (productId) => {
    if (!productId) return null;
    
    const colorSuffixes = ['-Red', '-Blue', '-Green', '-Black', '-White', '-Yellow', '-Purple', '-Pink', '-Orange', '-Gray', '-Navy', '-Sandle'];
    
    let cleanId = productId;
    for (const suffix of colorSuffixes) {
      if (productId.endsWith(suffix)) {
        cleanId = productId.slice(0, -suffix.length);
        break;
      }
    }
    
    return cleanId;
  };

  // Calculate item total with quantity discounts
  const calculateItemTotal = (item) => {
    if (individualItemTotals[item.id]) {
      return individualItemTotals[item.id].finalPrice;
    }
    
    // Fallback calculation
    const price = item.variant?.price || item.product?.price || 0;
    const quantity = item.quantity || 0;
    return price * quantity;
  };

  // Get item discount information
  const getItemDiscountInfo = (item) => {
    if (quantityDiscounts[item.id]) {
      return quantityDiscounts[item.id].discountInfo;
    }
    return null;
  };

  // Get item discount amount
  const getItemDiscountAmount = (item) => {
    if (quantityDiscounts[item.id]) {
      return quantityDiscounts[item.id].discount;
    }
    return 0;
  };

  // Render discount badge for items
  const renderItemDiscountBadge = (item) => {
    const discountInfo = getItemDiscountInfo(item);
    const discountAmount = getItemDiscountAmount(item);

    if (!discountInfo || discountAmount <= 0) return null;

    const isFixedAmount = discountInfo.priceType === 'FIXED_AMOUNT';
    
    return (
      <div className={`absolute -top-1 -right-1 text-white text-xs px-2 py-1 rounded-full ${
        isFixedAmount ? 'bg-purple-500' : 'bg-green-500'
      }`}>
        {isFixedAmount ? (
          <>-₹{discountAmount.toFixed(0)}</>
        ) : (
          <>{discountInfo.value}% OFF</>
        )}
      </div>
    );
  };

  // Render discount type indicator for items
  const renderItemDiscountType = (item) => {
    const discountInfo = getItemDiscountInfo(item);
    if (!discountInfo) return null;

    const isFixedAmount = discountInfo.priceType === 'FIXED_AMOUNT';
    
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

  // Map cart items to order items
  const getOrderItemsData = () => {
    return cartItems.map(item => {
      const originalProductId = item.product?._id;
      const cleanProductId = getCleanProductId(originalProductId);
      const productId = cleanProductId || originalProductId;
      const variantId = item.variant?._id;

      const orderItem = {
        productId: productId,
        quantity: item.quantity || 1
      };

      if (variantId && variantId !== productId) {
        orderItem.productVariantId = variantId;
      }

      if (!orderItem.productId) {
        throw new Error(`Missing product ID for: ${item.product?.name}`);
      }

      return orderItem;
    });
  };

  // Handle multiple image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // Validate files
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB per file
    const maxFiles = 5; // Maximum number of images allowed

    // Check if adding these files would exceed the maximum limit
    if (customImages.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (!validTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} - Invalid file type`);
      } else if (file.size > maxSize) {
        invalidFiles.push(`${file.name} - File too large (max 5MB)`);
      } else {
        validFiles.push(file);
      }
    });

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      toast.error(`Some files were invalid:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    // Add files to customImages state
    setCustomImages(prev => [...prev, ...validFiles]);

    // Create previews for new files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Clear file input
    event.target.value = '';
  };

  // Remove specific image
  const handleRemoveImage = (index) => {
    setCustomImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all images
  const handleClearAllImages = () => {
    setCustomImages([]);
    setImagePreviews([]);
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setLoading(true);
      
      const result = await validateCoupon({
        code: couponCode.trim(),
        subtotal: totals.subtotal
      }).unwrap();
      
      if (result.success) {
        setAppliedCoupon(result.data.coupon);
        const couponDiscount = result.data.discount;
        
        setTotals(prev => ({
          ...prev,
          couponDiscount: couponDiscount,
          totalAmount: prev.subtotal - couponDiscount
        }));
        
        toast.success("Coupon applied successfully!");
      }
    } catch (error) {
      console.error('Coupon validation error details:', error);
      toast.error(error.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = async () => {
    setCouponCode("");
    setAppliedCoupon(null);
    
    setTotals(prev => ({
      ...prev,
      couponDiscount: 0,
      totalAmount: prev.subtotal
    }));
    
    toast.info("Coupon removed");
  };

  const handleApplyAvailableCoupon = (coupon) => {
    setCouponCode(coupon.code);
    setTimeout(() => {
      handleApplyCoupon();
    }, 100);
    setShowAvailableCoupons(false);
  };

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length >= 2 ? '' : 'Name must be at least 2 characters';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email';
      case 'phone':
        return /^\d{10}$/.test(value) ? '' : 'Please enter a valid 10-digit phone number';
      case 'address':
        return value.trim().length >= 10 ? '' : 'Address must be at least 10 characters';
      case 'city':
        return value.trim().length >= 2 ? '' : 'Please enter a valid city';
      case 'state':
        return value.trim().length >= 2 ? '' : 'Please enter a valid state';
      case 'pincode':
        return /^\d{6}$/.test(value) ? '' : 'Please enter a valid 6-digit pincode';
      default:
        return '';
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, orderData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle successful order completion
  const handleOrderSuccess = (successData) => {
    // Set order as completed to prevent redirect
    setOrderCompleted(true);
    
    // Store order details for success page
    localStorage.setItem('orderSuccessData', JSON.stringify(successData));
    
    // Clear cart
    dispatch(clearCart());
    
    // Navigate to success page
    navigate('/payment-success', { 
      state: successData,
      replace: true
    });
  };

  // Handle Razorpay Payment

const handleRazorpayPayment = async () => {
  if (!validateForm()) {
    toast.error("Please fix the form errors before proceeding");
    return;
  }

  try {
    setPaymentProcessing(true);
    
    const orderItemsData = getOrderItemsData();
    
    // Prepare custom images data
    const customImageData = customImages.map((file, index) => ({
      url: imagePreviews[index]?.url || '',
      key: `custom-image-${Date.now()}-${index}`,
      filename: file.name || `custom-image-${Date.now()}-${index}.jpg`
    }));
    
    // Step 1: Initiate payment with backend (this will calculate quantity discounts)
    const paymentData = {
      orderData: {
        ...orderData,
        orderItems: orderItemsData,
        couponCode: appliedCoupon?.code || null,
        customImages: customImageData
      }
    };

    const result = await initiatePayment(paymentData).unwrap();
    
    
    if (result.success) {
      const { razorpayOrder, tempOrderData, calculatedTotals } = result.data;

      // Step 2: Open Razorpay checkout with the calculated amount
      const razorpayResponse = await razorpayService.openRazorpayCheckout({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Hanger Garments",
        description: `Order Payment - ${tempOrderData.orderNumber}`,
        prefill: {
          name: orderData.name,
          email: orderData.email,
          contact: orderData.phone
        },
        notes: {
          orderNumber: tempOrderData.orderNumber
        },
        theme: {
          color: "#3399cc"
        }
      });


      // Step 3: Verify payment with backend
      const verificationResult = await verifyPayment({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        orderData: {
          ...orderData,
          orderItems: orderItemsData,
          couponCode: appliedCoupon?.code || null,
          customImages: customImageData
        }
      }).unwrap();


      if (verificationResult.success) {
        // Payment successful
        const order = verificationResult.data;
        
        const successData = {
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          items: cartItems,
          paymentMethod: 'ONLINE',
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          razorpayPaymentId: razorpayResponse.razorpay_payment_id,
          customImages: order.customImages || [],
          calculatedTotals: calculatedTotals
        };
        
        toast.success("Payment successful! Order confirmed.");
        handleOrderSuccess(successData);
      }
    }
  } catch (error) {
    console.error("Payment processing failed:", error);
    console.error("Error details:", {
      status: error.status,
      data: error.data,
      message: error.message
    });
    
    if (error.message === 'Payment cancelled by user') {
      toast.info("Payment was cancelled");
    } else {
      const errorMessage = error.data?.message || "Payment processing failed";
      toast.error(`Payment failed: ${errorMessage}`);
    }
  } finally {
    setPaymentProcessing(false);
  }
};
  // Handle COD order
  const handleCODOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before proceeding");
      return;
    }

    try {
      setLoading(true);
      
      const orderItemsData = getOrderItemsData();
      
      // Prepare custom images data for the order API
      const customImageData = customImages.map((file, index) => ({
        url: imagePreviews[index]?.url || '', // Use preview URL as temporary reference
        key: `custom-image-${Date.now()}-${index}`,
        filename: file.name || `custom-image-${Date.now()}-${index}.jpg`
      }));
      
      const result = await createCODOrder({
        orderData: {
          ...orderData,
          orderItems: orderItemsData,
          couponCode: appliedCoupon?.code || null,
          customImages: customImageData // Pass file data directly to order API
        }
      }).unwrap();
      
      if (result.success) {
        const successData = {
          orderNumber: result.data.orderNumber,
          totalAmount: result.data.totalAmount,
          items: cartItems,
          paymentMethod: 'COD',
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          customImages: result.data.customImages || [] // Get from order response
        };
        
        toast.success("Order placed successfully!");
        handleOrderSuccess(successData);
      }
    } catch (error) {
      console.error("COD order failed:", error);
      const errorMessage = error.data?.message || "Order creation failed";
      toast.error(`Order failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle place order
  const handlePlaceOrder = () => {
    if (orderData.paymentMethod === "COD") {
      handleCODOrder();
    } else {
      handleRazorpayPayment();
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Redirect if not logged in or cart is empty (only if order hasn't been completed)
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    
    // Only redirect to cart if cart is empty AND we're not coming from a successful order
    if (cartItems.length === 0 && !orderCompleted) {
      // Check if we're already on success page or coming from order completion
      const orderSuccessData = localStorage.getItem('orderSuccessData');
      const isFromSuccess = location.state?.from === 'order-success';
      
      if (!orderSuccessData && !isFromSuccess) {
        navigate("/cart");
        return;
      }
    }
  }, [user, cartItems, navigate, orderCompleted, location]);

  // Check if we're returning from a successful order
  useEffect(() => {
    const orderSuccessData = localStorage.getItem('orderSuccessData');
    if (orderSuccessData && cartItems.length === 0) {
      setOrderCompleted(true);
    }
  }, [cartItems]);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <div className="text-center">
          <p className={textColor}>Redirecting...</p>
        </div>
      </div>
    );
  }

  // If order is completed and cart is empty, show a different state or redirect
  if (orderCompleted && cartItems.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <div className="text-center">
          <p className={`text-xl ${textColor} mb-4`}>Order Completed Successfully!</p>
          <p className="text-gray-500 mb-4">Redirecting to order details...</p>
          <button
            onClick={() => navigate('/user/orders')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${bgColor} ${textColor}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
          <p className="text-gray-600 dark:text-gray-400">Complete your order securely</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Cart</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-2"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Address</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Shipping and Payment */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className={`border ${borderColor} rounded-xl p-6 shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">1</span>
                </span>
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={orderData.name}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.name ? 'border-red-500' : borderColor} rounded-lg ${inputBg} ${textColor} transition-colors`}
                      required
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
                      value={orderData.email}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.email ? 'border-red-500' : borderColor} rounded-lg ${inputBg} ${textColor} transition-colors`}
                      required
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                </div>
                
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number *"
                    value={orderData.phone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${formErrors.phone ? 'border-red-500' : borderColor} rounded-lg ${inputBg} ${textColor} transition-colors`}
                    required
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
                
                <div>
                  <input
                    type="text"
                    name="address"
                    placeholder="Full Address *"
                    value={orderData.address}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${formErrors.address ? 'border-red-500' : borderColor} rounded-lg ${inputBg} ${textColor} transition-colors`}
                    required
                  />
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City *"
                      value={orderData.city}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.city ? 'border-red-500' : borderColor} rounded-lg ${inputBg} ${textColor} transition-colors`}
                      required
                    />
                    {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="state"
                      placeholder="State *"
                      value={orderData.state}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.state ? 'border-red-500' : borderColor} rounded-lg ${inputBg} ${textColor} transition-colors`}
                      required
                    />
                    {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode *"
                      value={orderData.pincode}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${formErrors.pincode ? 'border-red-500' : borderColor} rounded-lg ${inputBg} ${textColor} transition-colors`}
                      required
                    />
                    {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Image Upload Section */}
            <div className={`border ${borderColor} rounded-xl p-6 shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2">
                    <span className="text-purple-600 dark:text-purple-400 text-sm">2</span>
                  </span>
                  Custom Images (Optional)
                </div>
                {imagePreviews.length > 0 && (
                  <button
                    onClick={handleClearAllImages}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear All
                  </button>
                )}
              </h2>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload custom images for your order (e.g., reference images, designs, etc.)
                </p>

                {/* Image Upload Area */}
                <div className={`border-2 border-dashed ${borderColor} rounded-lg p-6 text-center transition-colors hover:border-blue-400`}>
                  {imagePreviews.length === 0 ? (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Drag & drop your images here or click to browse
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                        Supports: JPG, PNG, GIF, WebP (Max 5MB per file, up to 5 images)
                      </p>
                      <label htmlFor="customImages" className="cursor-pointer">
                        <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}>
                          Choose Images
                        </span>
                        <input
                          id="customImages"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {imagePreviews.length} image(s) selected
                      </p>
                      <label htmlFor="customImages" className="cursor-pointer">
                        <span className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}>
                          Add More Images
                        </span>
                        <input
                          id="customImages"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Image Previews Grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={preview.id} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Custom order preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                          <p className="truncate">{preview.name}</p>
                          <p>{formatFileSize(preview.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className={`border ${borderColor} rounded-xl p-6 shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2">
                  <span className="text-purple-600 dark:text-purple-400 text-sm">3</span>
                </span>
                Payment Method
              </h2>
              
              <div className="space-y-4">
                {/* Online Payment Option */}
                <div 
                  className={`border-2 ${
                    orderData.paymentMethod === "ONLINE" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg p-4 cursor-pointer transition-all`}
                  onClick={() => setOrderData(prev => ({ ...prev, paymentMethod: "ONLINE" }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">Pay Online</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Credit/Debit Card, UPI, Net Banking
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      orderData.paymentMethod === "ONLINE" 
                        ? "bg-blue-500 border-blue-500" 
                        : "border-gray-400"
                    }`}></div>
                  </div>
                  
                  {orderData.paymentMethod === "ONLINE" && (
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center space-x-6 mb-4">
                        {/* Razorpay Icon */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Razorpay</span>
                        </div>
                        
                        {/* UPI Icon */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">UPI</span>
                        </div>
                        
                        {/* Cards Icon */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Cards</span>
                        </div>
                        
                        {/* Wallet Icon */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Wallet</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Secure payment powered by Razorpay
                      </p>
                    </div>
                  )}
                </div>

                {/* COD Option */}
                <div 
                  className={`border-2 ${
                    orderData.paymentMethod === "COD" 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg p-4 cursor-pointer transition-all`}
                  onClick={() => setOrderData(prev => ({ ...prev, paymentMethod: "COD" }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-6 h-6 text-green-500" />
                      <div>
                        <h3 className="font-semibold">Cash on Delivery</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pay when you receive your order
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      orderData.paymentMethod === "COD" 
                        ? "bg-green-500 border-green-500" 
                        : "border-gray-400"
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className={`border ${borderColor} rounded-xl p-6 shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-2">
                    <span className="text-orange-600 dark:text-orange-400 text-sm">4</span>
                  </span>
                  Apply Coupon
                </div>
                {availableCoupons.length > 0 && (
                  <button
                    onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showAvailableCoupons ? 'Hide' : 'Show'} Available Coupons ({availableCoupons.length})
                  </button>
                )}
              </h2>

              {/* Available Coupons Dropdown */}
              {showAvailableCoupons && availableCoupons.length > 0 && (
                <div className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">
                    Available Coupons for your order:
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        onClick={() => handleApplyAvailableCoupon(coupon)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-green-700 dark:text-green-400">
                              {coupon.code}
                            </span>
                            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                              {coupon.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-green-700 dark:text-green-400">
                              {coupon.discountType === 'PERCENTAGE' 
                                ? `${coupon.discountValue}% OFF`
                                : `₹${coupon.discountValue} OFF`
                              }
                            </span>
                            {coupon.minOrderAmount > 0 && (
                              <p className="text-xs text-green-600 dark:text-green-300">
                                Min. order: ₹{coupon.minOrderAmount}
                              </p>
                            )}
                          </div>
                        </div>
                        {coupon.validUntil && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Valid until: {new Date(coupon.validUntil).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupon Input Section */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                  className={`flex-1 p-3 border ${borderColor} rounded-lg ${inputBg} ${textColor} ${
                    appliedCoupon ? 'opacity-50' : ''
                  } transition-colors`}
                />
                {!appliedCoupon ? (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={loading || !couponCode.trim()}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      isDark 
                        ? "bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed" 
                        : "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
                    }`}
                  >
                    {loading ? "..." : "Apply"}
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Applied Coupon Display */}
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-700 dark:text-green-400 font-semibold">
                        {appliedCoupon.code} applied successfully!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                        {appliedCoupon.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-700 dark:text-green-400 font-bold">
                        -₹{totals.couponDiscount.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        {appliedCoupon.discountType === 'PERCENTAGE' 
                          ? `${appliedCoupon.discountValue}% discount`
                          : `₹${appliedCoupon.discountValue} off`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* No Coupons Available Message */}
              {availableCoupons.length === 0 && subtotal > 0 && !couponsLoading && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    No coupons available for your current order value.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className={`border ${borderColor} rounded-xl p-6 shadow-sm sticky top-6`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-2">
                  <span className="text-green-600 dark:text-green-400 text-sm">5</span>
                </span>
                Order Summary
              </h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {cartItems.map((item) => {
                  const itemTotal = calculateItemTotal(item);
                  const discountInfo = getItemDiscountInfo(item);
                  const discountAmount = getItemDiscountAmount(item);
                  const hasDiscount = discountAmount > 0;
                  const originalPrice = (item.variant?.price || item.product?.price || 0) * item.quantity;

                  return (
                    <div key={item.id} className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-600">
                      <div className="relative">
                        <img
                          src={item.product.images?.[0] || "/images/placeholder-product.jpg"}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "/images/placeholder-product.jpg";
                          }}
                        />
                        {renderItemDiscountBadge(item)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.variant?.color || 'N/A'} | {item.variant?.size || 'N/A'} × {item.quantity}
                        </p>
                        {hasDiscount && renderItemDiscountType(item)}
                        

                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-sm">₹{itemTotal.toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-xs line-through text-gray-500 block">
                            ₹{originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Images Preview in Order Summary */}
              {imagePreviews.length > 0 && (
                <div className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Custom Images Included ({imagePreviews.length}):
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.slice(0, 3).map((preview, index) => (
                      <img
                        key={preview.id}
                        src={preview.url}
                        alt={`Custom order preview ${index + 1}`}
                        className="w-full h-12 object-cover rounded border"
                      />
                    ))}
                    {imagePreviews.length > 3 && (
                      <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          +{imagePreviews.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Totals */}
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                
                {/* Quantity Discounts */}
                {totals.quantityDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center">
                      <Percent className="w-3 h-3 mr-1" />
                      Quantity Discounts
                    </span>
                    <span>-₹{totals.quantityDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Coupon Discount */}
                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      Coupon Discount
                    </span>
                    <span>-₹{totals.couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-green-600 dark:text-green-400">FREE</span>
                </div>
                
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-3">
                  <span>Total Amount</span>
                  <span className="text-blue-600 dark:text-blue-400">₹{totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Savings Summary */}
              {(totals.quantityDiscount > 0 || totals.couponDiscount > 0) && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                    🎉 You're saving ₹{(totals.quantityDiscount + totals.couponDiscount).toFixed(2)}!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                    {totals.quantityDiscount > 0 && `₹${totals.quantityDiscount.toFixed(2)} from quantity discounts`}
                    {totals.quantityDiscount > 0 && totals.couponDiscount > 0 && ' + '}
                    {totals.couponDiscount > 0 && `₹${totals.couponDiscount.toFixed(2)} from coupon`}
                  </p>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || paymentProcessing || calculatingDiscounts}
                className={`w-full py-4 rounded-lg font-semibold text-lg mt-6 transition-all ${
                  isDark 
                    ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 shadow-lg shadow-blue-500/25" 
                    : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 shadow-lg shadow-blue-500/25"
                }`}
              >
                {paymentProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing Payment...
                  </div>
                ) : loading || calculatingDiscounts ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {calculatingDiscounts ? 'Calculating Discounts...' : 'Processing...'}
                  </div>
                ) : orderData.paymentMethod === "COD" ? (
                  "PLACE ORDER (COD)"
                ) : (
                  "PROCEED TO PAYMENT"
                )}
              </button>

              {orderData.paymentMethod === "COD" && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  💰 Pay when your order is delivered
                </p>
              )}

              {/* Security Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Secure & Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;