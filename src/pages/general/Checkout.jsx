import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  useCalculateOrderTotalsMutation, 
  useInitiatePaymentMutation,
  useCreateCODOrderMutation,
} from "../../redux/services/orderService";
import { clearCart } from "../../redux/slices/cartSlice";
import { useValidateCouponMutation } from "../../redux/services/couponService";

const Checkout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  // API mutations
  const [calculateOrderTotals] = useCalculateOrderTotalsMutation();
  const [initiatePayment] = useInitiatePaymentMutation();
  const [createCODOrder] = useCreateCODOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();

  // State
  const [orderData, setOrderData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
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
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const inputBg = isDark ? "bg-gray-800" : "bg-gray-50";

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
        totalAmount: subtotal
      });
    } catch (error) {
      console.error("Error calculating totals:", error);
    }
  };

  // Extract clean product ID
  const getCleanProductId = (productId) => {
    if (!productId) return null;
    
    const colorSuffixes = ['-Red', '-Blue', '-Green', '-Black', '-White', '-Yellow', '-Purple', '-Pink', '-Orange', '-Gray'];
    
    let cleanId = productId;
    for (const suffix of colorSuffixes) {
      if (productId.endsWith(suffix)) {
        cleanId = productId.slice(0, -suffix.length);
        break;
      }
    }
    
    return cleanId;
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

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setLoading(true);
      const orderItemsData = getOrderItemsData();
      
      const result = await validateCoupon({
        couponCode: couponCode.trim(),
        orderItems: orderItemsData
      }).unwrap();
      
      if (result.success) {
        setAppliedCoupon(result.data.coupon);
        
        const calculatedTotals = await calculateOrderTotals({
          orderItems: orderItemsData,
          couponCode: couponCode.trim()
        }).unwrap();

        if (calculatedTotals.success) {
          setTotals(calculatedTotals.data);
          toast.success("Coupon applied successfully!");
        }
      }
    } catch (error) {
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
    
    const orderItemsData = getOrderItemsData();
    const calculatedTotals = await calculateOrderTotals({
      orderItems: orderItemsData
    }).unwrap();

    if (calculatedTotals.success) {
      setTotals(calculatedTotals.data);
      toast.info("Coupon removed");
    }
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

  // Handle online payment
  const handleOnlinePayment = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before proceeding");
      return;
    }

    try {
      setLoading(true);
      
      const orderItemsData = getOrderItemsData();
      
      const paymentData = {
        orderData: {
          ...orderData,
          orderItems: orderItemsData,
          couponCode: appliedCoupon?.code || null
        },
        redirectUrl: `${window.location.origin}/payment-success`,
        callbackUrl: `${import.meta.env.VITE_APP_API_BASE_URL}/orders/payment-callback`
      };

      const result = await initiatePayment(paymentData).unwrap();
      
      if (result.success && result.data.payment.redirectUrl) {
        window.location.href = result.data.payment.redirectUrl;
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      const errorMessage = error.data?.message || "Payment initiation failed";
      toast.error(`Payment failed: ${errorMessage}`);
    } finally {
      setLoading(false);
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
      
      const result = await createCODOrder({
        orderData: {
          ...orderData,
          orderItems: orderItemsData,
          couponCode: appliedCoupon?.code || null
        }
      }).unwrap();
      
      if (result.success) {
        // Store order details for success page
        localStorage.setItem('lastOrder', JSON.stringify({
          orderNumber: result.data.orderNumber,
          totalAmount: result.data.totalAmount,
          items: cartItems
        }));
        
        toast.success("Order placed successfully!");
        dispatch(clearCart());
        navigate(`/order-success`, { 
          state: { 
            orderNumber: result.data.orderNumber,
            totalAmount: result.data.totalAmount
          }
        });
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
      handleOnlinePayment();
    }
  };

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    
    if (cartItems.length === 0) {
      navigate("/");
      return;
    }
  }, [user, cartItems, navigate]);

  if (!user || cartItems.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <div className="text-center">
          <p className={textColor}>Redirecting...</p>
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
                <span className="text-sm font-semibold">1</span>
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Cart</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-2"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <span className="text-sm font-semibold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Checkout</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 flex items-center justify-center">
                <span className="text-sm font-semibold">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Confirmation</span>
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

            {/* Coupon Section */}
            <div className={`border ${borderColor} rounded-xl p-6 shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2">
                  <span className="text-purple-600 dark:text-purple-400 text-sm">2</span>
                </span>
                Apply Coupon
              </h2>
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
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      isDark 
                        ? "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400" 
                        : "bg-purple-500 text-white hover:bg-purple-600 disabled:bg-purple-300"
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
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    <span className="font-semibold">{appliedCoupon.code}</span> applied successfully! 
                    You saved ₹{totals.discount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className={`border ${borderColor} rounded-xl p-6 shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-2">
                  <span className="text-orange-600 dark:text-orange-400 text-sm">3</span>
                </span>
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 ${
                  orderData.paymentMethod === "ONLINE" 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg cursor-pointer transition-all`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="ONLINE"
                    checked={orderData.paymentMethod === "ONLINE"}
                    onChange={() => setOrderData(prev => ({...prev, paymentMethod: "ONLINE"}))}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-semibold">Credit/Debit Card / UPI / Net Banking</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pay securely with multiple payment options</p>
                  </div>
                </label>
                <label className={`flex items-center p-4 border-2 ${
                  orderData.paymentMethod === "COD" 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg cursor-pointer transition-all`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="COD"
                    checked={orderData.paymentMethod === "COD"}
                    onChange={() => setOrderData(prev => ({...prev, paymentMethod: "COD"}))}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-semibold">Cash on Delivery</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pay when you receive your order</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className={`border ${borderColor} rounded-xl p-6 shadow-sm sticky top-6`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-2">
                  <span className="text-green-600 dark:text-green-400 text-sm">4</span>
                </span>
                Order Summary
              </h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {cartItems.map((item) => {
                  const price = item.variant?.price || item.product?.price || 0;
                  const quantity = item.quantity || 0;
                  const itemTotal = price * quantity;

                  return (
                    <div key={item.id} className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-600">
                      <img
                        src={item.product.images?.[0] || "/images/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-product.jpg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.variant?.color || 'N/A'} | {item.variant?.size || 'N/A'} × {quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">₹{itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                
                {totals.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-₹{totals.discount.toFixed(2)}</span>
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

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`w-full py-4 rounded-lg font-semibold text-lg mt-6 transition-all ${
                  isDark 
                    ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 shadow-lg shadow-blue-500/25" 
                    : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 shadow-lg shadow-blue-500/25"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  orderData.paymentMethod === "COD" ? "PLACE ORDER (COD)" : "PROCEED TO PAYMENT"
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
                  <span>🔒</span>
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