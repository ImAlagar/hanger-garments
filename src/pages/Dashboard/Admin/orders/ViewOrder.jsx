// components/admin/orders/ViewOrder.jsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetOrderByIdQuery } from '../../../../redux/services/orderService';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Image,
  Palette,
  MessageSquare,
  Package2
} from 'lucide-react';

const ViewOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: orderData, isLoading, error } = useGetOrderByIdQuery(orderId);
  const order = orderData?.data;

  // Theme-based styling
  const themeClasses = {
    light: {
      bg: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        card: 'bg-white',
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600',
      },
      border: 'border-gray-200',
      shadow: 'shadow-lg',
    },
    dark: {
      bg: {
        primary: 'bg-gray-900',
        secondary: 'bg-gray-800',
        card: 'bg-gray-800',
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-200',
        muted: 'text-gray-400',
      },
      border: 'border-gray-700',
      shadow: 'shadow-lg shadow-gray-900',
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  // Status styles
  const statusStyles = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PROCESSING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  // Payment status styles
  const paymentStatusStyles = {
    SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  // Courier options mapping
  const courierOptions = {
    'delhivery': { label: 'Delhivery', description: 'Fast delivery (2-4 days)' },
    'dtdc': { label: 'DTDC', description: 'Economy delivery (4-7 days)' },
    'bluedart': { label: 'Blue Dart', description: 'Premium delivery (1-3 days)' },
    'fedex': { label: 'FedEx', description: 'International & Express delivery' },
    'xpressbees': { label: 'XpressBees', description: 'Reliable service across India' },
    'ekart': { label: 'Ekart', description: "Flipkart's logistics service" },
    'professional': { label: 'Professional Courier', description: 'Standard delivery (3-5 days)' },
    'others': { label: 'Others', description: 'We will choose the best available courier' }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>Order not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  // Get courier info
  const getCourierInfo = () => {
    if (!order.preferredCourier) return null;
    
    const courier = courierOptions[order.preferredCourier];
    if (!courier) return null;
    
    return {
      ...courier,
      value: order.preferredCourier
    };
  };

  const courierInfo = getCourierInfo();

  // Extract filename without extension for display
  const getDisplayFilename = (filename) => {
    if (!filename) return 'Custom Design';
    return filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
  };


  // Add these helper functions for wholesale price calculation
const calculateItemPrice = (orderItem, userRole) => {
  // Check if user is WHOLESALER
  if (userRole === 'WHOLESALER' && orderItem.product?.wholesalePrice) {
    return orderItem.product.wholesalePrice;
  }
  return orderItem.price || orderItem.product?.offerPrice || 0;
};

const calculateOrderTotal = (order) => {
  // Get user role from order data
  const userRole = order.user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';
  
  if (!order?.orderItems) return order.totalAmount || 0;
  
  return order.orderItems.reduce((total, item) => {
    const itemPrice = calculateItemPrice(item, userRole);
    const quantity = item.quantity || 1;
    return total + (itemPrice * quantity);
  }, 0);
};

// Calculate regular total for comparison
const calculateRegularTotal = (order) => {
  if (!order?.orderItems) return order.totalAmount || 0;
  
  return order.orderItems.reduce((total, item) => {
    const itemPrice = item.price || item.product?.offerPrice || 0;
    const quantity = item.quantity || 1;
    return total + (itemPrice * quantity);
  }, 0);
};

// Get price info for display
const getOrderPriceInfo = (order) => {
  const userRole = order.user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';
  const wholesaleTotal = calculateOrderTotal(order);
  const regularTotal = calculateRegularTotal(order);
  const savings = regularTotal - wholesaleTotal;
  
  return {
    userRole: userRole,
    isWholesaleOrder: isWholesaleUser,
    displayTotal: isWholesaleUser ? wholesaleTotal : regularTotal,
    regularTotal: regularTotal,
    savings: savings,
    isPriceAdjusted: isWholesaleUser && wholesaleTotal !== regularTotal
  };
};

// Get item price info
const getItemPriceInfo = (item, userRole) => {
  const isWholesaleUser = userRole === 'WHOLESALER';
  const wholesalePrice = item.product?.wholesalePrice || 0;
  const itemPrice = calculateItemPrice(item, userRole);
  const regularPrice = item.price || item.product?.offerPrice || 0;
  const itemTotal = itemPrice * (item.quantity || 1);
  const regularTotal = regularPrice * (item.quantity || 1);
  const itemSavings = regularTotal - itemTotal;
  
  return {
    itemPrice,
    itemTotal,
    regularPrice,
    regularTotal,
    wholesalePrice,
    isWholesaleItem: isWholesaleUser && wholesalePrice > 0 && itemPrice === wholesalePrice,
    itemSavings
  };
};

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* Header */}
      <div className={`border-b ${currentTheme.border} ${currentTheme.bg.primary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          
          {/* Left: Back Button + Title */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              >
              <ArrowLeft size={20} />
              </button>
              <div>
              <h1 className={`text-xl sm:text-2xl font-bold font-italiana ${currentTheme.text.primary}`}>
                  Order #{order.orderNumber}
              </h1>
              <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                  Order Details
              </p>
              </div>
          </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Status */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Order Status</h2>
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(order.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status]}`}>
                  {order.status}
                </span>
                
                {/* Show wholesale badge */}
                {order.user?.role === 'WHOLESALER' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                  }`}>
                    WHOLESALE
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusStyles[order.paymentStatus]}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Payment Method</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Total Amount</span>
                  <div className="text-right">
                    <span className={`font-medium text-lg ${currentTheme.text.primary}`}>
                      ₹{calculateOrderTotal(order)}
                    </span>
                    
                  </div>
                </div>
                
                {/* Show user role */}
                {order.user?.role && (
                  <div className="flex items-center justify-between">
                    <span className={currentTheme.text.muted}>Account Type</span>
                    <span className={`font-medium ${
                      order.user.role === 'WHOLESALER' 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : currentTheme.text.primary
                    }`}>
                      {order.user.role}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Courier Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 flex items-center ${currentTheme.text.primary}`}>
                <Package2 className="w-5 h-5 mr-2" />
                Courier Information
              </h2>
              
              {courierInfo ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={currentTheme.text.muted}>Preferred Courier</span>
                    <span className={`font-medium ${currentTheme.text.primary}`}>
                      {courierInfo.label}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm ${currentTheme.text.muted} mb-1`}>Service Description</p>
                    <p className={`text-sm ${currentTheme.text.primary}`}>
                      {courierInfo.description}
                    </p>
                  </div>
                  
                  {order.courierInstructions && (
                    <div>
                      <div className="flex items-center mb-1">
                        <MessageSquare className="w-4 h-4 text-gray-500 mr-2" />
                        <span className={`text-sm font-medium ${currentTheme.text.muted}`}>Customer Instructions</span>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                      }`}>
                        <p className={`text-sm ${currentTheme.text.primary}`}>
                          {order.courierInstructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`p-4 rounded-lg text-center ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className={`text-sm ${currentTheme.text.muted}`}>
                    No courier preference specified by customer
                  </p>
                </div>
              )}
            </motion.div>

            {/* Customer Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 flex items-center ${currentTheme.text.primary}`}>
                <User className="w-5 h-5 mr-2" />
                Customer
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className={currentTheme.text.primary}>{order.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className={currentTheme.text.primary}>{order.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className={currentTheme.text.primary}>{order.phone}</span>
                </div>
                
                {/* Show user role */}
                {order.user?.role && (
                  <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.user.role === 'WHOLESALER'
                        ? theme === 'dark' 
                          ? 'bg-purple-900 text-purple-200' 
                          : 'bg-purple-100 text-purple-800'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-200 text-gray-700'
                    }`}>
                      {order.user.role}
                    </div>
                    <span className={`text-xs ${currentTheme.text.muted}`}>
                      Account Type
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 flex items-center ${currentTheme.text.primary}`}>
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className={currentTheme.text.primary}>{order.address}</p>
                <p className={currentTheme.text.primary}>{order.city}, {order.state}</p>
                <p className={currentTheme.text.primary}>PIN: {order.pincode}</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
{/* Order Items */}
<motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
  <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>Order Items</h2>
  <div className="space-y-4">
    {order.orderItems?.map((item, index) => {
      const priceInfo = getItemPriceInfo(item, order.user?.role);
      
      return (
        <div key={item.id} className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex items-start space-x-4">
            {/* Product Image */}
            <div className="flex-shrink-0">
              {item.productVariant?.variantImages?.length > 0 ? (
                <img
                  src={item.productVariant.variantImages[0].imageUrl}
                  alt={item.product?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <Package className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-medium ${currentTheme.text.primary}`}>
                    {item.product?.name}
                  </h3>
                  <p className={`text-sm ${currentTheme.text.muted}`}>
                    {item.productVariant?.color} • {item.productVariant?.size}
                  </p>
                  <p className={`text-sm ${currentTheme.text.muted}`}>
                    Product Code: {item.product?.productCode}
                  </p>
                  <p className={`text-sm ${currentTheme.text.muted}`}>
                    SKU: {item.productVariant?.sku}
                  </p>
                </div>
                
                {/* Wholesale badge for item */}
                {priceInfo.isWholesaleItem && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                  }`}>
                    Wholesale
                  </span>
                )}
              </div>
              

            </div>
            
            {/* Price */}
            <div className="text-right">
              <p className={`font-medium ${currentTheme.text.primary}`}>
                ₹{priceInfo.itemPrice} x {item.quantity}
              </p>
              <p className={`text-lg font-semibold ${
                priceInfo.isWholesaleItem ? 'text-purple-600 dark:text-purple-400' : currentTheme.text.primary
              }`}>
                ₹{priceInfo.itemTotal}
              </p>
              

            </div>
          </div>

          {/* Variant Images Gallery */}
          {item.productVariant?.variantImages?.length > 0 && (
            <div className="mt-4">
              <h4 className={`text-sm font-medium mb-2 flex items-center ${currentTheme.text.primary}`}>
                <Image className="w-4 h-4 mr-1" />
                Product Images
              </h4>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {item.productVariant.variantImages.map((variantImage, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={variantImage.imageUrl}
                    alt={`${item.product?.name} - ${variantImage.color}`}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
</motion.div>

            {/* Custom Images Section */}
            {order.customImages && order.customImages.length > 0 && (
              <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                  <Palette className="w-5 h-5 mr-2" />
                  Custom Design Images
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.customImages.map((customImage, index) => (
                    <div key={customImage.id} className={`rounded-lg overflow-hidden border ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <img
                        src={customImage.imageUrl}
                        alt={customImage.filename || `Custom Design ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className={`p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm font-medium truncate ${currentTheme.text.primary}`}>
                          {getDisplayFilename(customImage.filename)}
                        </p>
                        {customImage.description && (
                          <p className={`text-xs mt-1 ${currentTheme.text.muted}`}>
                            {customImage.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

{/* Order Summary */}
<motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
  <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>Order Summary</h2>
  
  {order.user?.role === 'WHOLESALER' && (
    <div className={`mb-4 p-3 rounded-lg ${
      theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${currentTheme.text.primary}`}>Wholesale Pricing Applied</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
        }`}>
          WHOLESALE
        </span>
      </div>
    </div>
  )}
  
  <div className="space-y-3">
    {/* Regular Total for comparison (wholesale only) */}
    {order.user?.role === 'WHOLESALER' && calculateRegularTotal(order) !== calculateOrderTotal(order) && (
      <div className="flex justify-between items-center">
        <span className={`text-sm ${currentTheme.text.muted}`}>
          Regular Items Total
          <span className="ml-2 text-xs text-gray-500">(for comparison)</span>
        </span>
        <span className={`text-sm line-through ${currentTheme.text.muted}`}>
          ₹{calculateRegularTotal(order)}
        </span>
      </div>
    )}
    
    {/* Wholesale Savings */}
    {order.user?.role === 'WHOLESALER' && (
      <div className="flex justify-between items-center">
        <span className={`text-sm ${currentTheme.text.muted}`}>Wholesale Savings</span>
        <span className="text-sm font-medium text-green-600">
          -₹{calculateRegularTotal(order) - calculateOrderTotal(order)}
        </span>
      </div>
    )}
    
    <div className="flex justify-between">
      <span className={currentTheme.text.muted}>Items Subtotal</span>
      <span className={`font-medium ${
        order.user?.role === 'WHOLESALER' ? 'text-purple-600 dark:text-purple-400' : currentTheme.text.primary
      }`}>
        ₹{calculateOrderTotal(order)}
      </span>
    </div>
    
    <div className="flex justify-between">
      <span className={currentTheme.text.muted}>Discount</span>
      <span className="text-green-600">-₹{order.discount}</span>
    </div>
    
    <div className="flex justify-between">
      <span className={currentTheme.text.muted}>Shipping Cost</span>
      <span className={currentTheme.text.primary}>₹{order.shippingCost}</span>
    </div>
    
    <div className={`border-t ${currentTheme.border} pt-3`}>
      <div className="flex justify-between">
        <span className={`font-semibold ${currentTheme.text.primary}`}>Total Amount</span>
        <span className={`font-semibold text-lg ${
          order.user?.role === 'WHOLESALER' ? 'text-purple-600 dark:text-purple-400' : currentTheme.text.primary
        }`}>
          ₹{calculateOrderTotal(order) - order.discount + order.shippingCost}
        </span>
      </div>
    </div>
  </div>
</motion.div>

            {/* Timeline Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Order Created</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Last Updated</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
                {order.shippedAt && (
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Shipped At</label>
                    <p className={currentTheme.text.primary}>
                      {formatDate(order.shippedAt)}
                    </p>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Delivered At</label>
                    <p className={currentTheme.text.primary}>
                      {formatDate(order.deliveredAt)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                  <Truck className="w-5 h-5 mr-2" />
                  Tracking Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={currentTheme.text.muted}>Tracking Number</span>
                    <span className={`font-mono ${currentTheme.text.primary}`}>
                      {order.trackingNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={currentTheme.text.muted}>Carrier</span>
                    <span className={currentTheme.text.primary}>{order.carrier}</span>
                  </div>
                  {order.trackingUrl && (
                    <div className="flex justify-between">
                      <span className={currentTheme.text.muted}>Tracking URL</span>
                      <a 
                        href={order.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        View Tracking
                      </a>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className={currentTheme.text.muted}>Estimated Delivery</span>
                      <span className={currentTheme.text.primary}>
                        {formatDate(order.estimatedDelivery)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Courier vs Actual Shipping Info */}
            {(courierInfo || order.carrier) && (
              <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                  <Package2 className="w-5 h-5 mr-2" />
                  Shipping Comparison
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Preference */}
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${currentTheme.text.primary}`}>
                      Customer Preference
                    </h3>
                    {courierInfo ? (
                      <div className="space-y-2">
                        <div>
                          <label className={`text-xs ${currentTheme.text.muted}`}>Preferred Courier</label>
                          <p className={`font-medium ${currentTheme.text.primary}`}>
                            {courierInfo.label}
                          </p>
                        </div>
                        <div>
                          <label className={`text-xs ${currentTheme.text.muted}`}>Service Type</label>
                          <p className={`text-sm ${currentTheme.text.primary}`}>
                            {courierInfo.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm ${currentTheme.text.muted}`}>
                        No preference specified
                      </p>
                    )}
                  </div>

                  {/* Actual Shipping */}
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${currentTheme.text.primary}`}>
                      Actual Shipping
                    </h3>
                    {order.carrier ? (
                      <div className="space-y-2">
                        <div>
                          <label className={`text-xs ${currentTheme.text.muted}`}>Courier Used</label>
                          <p className={`font-medium ${currentTheme.text.primary}`}>
                            {order.carrier}
                          </p>
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <label className={`text-xs ${currentTheme.text.muted}`}>Tracking Number</label>
                            <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                              {order.trackingNumber}
                            </p>
                          </div>
                        )}
                        {courierInfo && order.carrier && (
                          <div className={`mt-2 p-2 rounded text-xs ${
                            order.carrier.toLowerCase().includes(courierInfo.value.toLowerCase()) 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {order.carrier.toLowerCase().includes(courierInfo.value.toLowerCase()) 
                              ? '✓ Customer preference matched'
                              : '⚠ Different courier used'
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className={`text-sm ${currentTheme.text.muted}`}>
                        Not shipped yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Courier Instructions Summary */}
                {order.courierInstructions && (
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mr-2" />
                      <span className={`text-sm font-medium ${currentTheme.text.primary}`}>
                        Customer Instructions Summary
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-blue-50'
                    }`}>
                      <p className={`text-sm ${currentTheme.text.primary}`}>
                        {order.courierInstructions}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewOrder;