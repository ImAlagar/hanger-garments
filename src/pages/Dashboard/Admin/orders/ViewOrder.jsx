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
  Palette
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

  // Extract filename without extension for display
  const getDisplayFilename = (filename) => {
    if (!filename) return 'Custom Design';
    return filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
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
                  <span className={`font-medium text-lg ${currentTheme.text.primary}`}>
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>
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
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>Order Items</h2>
              <div className="space-y-4">
                {order.orderItems?.map((item, index) => (
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
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className={`font-medium ${currentTheme.text.primary}`}>
                          ₹{item.price} x {item.quantity}
                        </p>
                        <p className={`text-lg font-semibold ${currentTheme.text.primary}`}>
                          ₹{item.price * item.quantity}
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
                ))}
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
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={currentTheme.text.muted}>Subtotal</span>
                  <span className={currentTheme.text.primary}>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className={currentTheme.text.muted}>Discount</span>
                  <span className={currentTheme.text.primary}>-₹{order.discount}</span>
                </div>
                <div className="flex justify-between">
                  <span className={currentTheme.text.muted}>Shipping Cost</span>
                  <span className={currentTheme.text.primary}>₹{order.shippingCost}</span>
                </div>
                <div className={`border-t ${currentTheme.border} pt-3`}>
                  <div className="flex justify-between">
                    <span className={`font-semibold ${currentTheme.text.primary}`}>Total Amount</span>
                    <span className={`font-semibold text-lg ${currentTheme.text.primary}`}>
                      ₹{order.totalAmount}
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewOrder;