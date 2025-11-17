// components/admin/coupons/ViewCoupon.jsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetCouponQuery } from '../../../../redux/services/couponService';
import { ArrowLeft, Edit, Calendar, Percent, DollarSign, Hash, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const ViewCoupon = () => {
  const { couponId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: couponData, isLoading, error } = useGetCouponQuery(couponId);
  const coupon = couponData?.data;

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Coupon Not Found</h2>
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

  if (!coupon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>Coupon not found</h2>
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

  const isCouponExpired = () => {
    return new Date(coupon.validUntil) < new Date();
  };

  const isCouponActive = () => {
    const now = new Date();
    return coupon.isActive && 
           new Date(coupon.validFrom) <= now && 
           new Date(coupon.validUntil) >= now;
  };

  const formatDiscount = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else {
      return `$${coupon.discountValue}`;
    }
  };

  const getStatusInfo = () => {
    if (isCouponExpired()) {
      return { text: 'Expired', color: 'red', icon: XCircle };
    } else if (isCouponActive()) {
      return { text: 'Active', color: 'green', icon: CheckCircle };
    } else {
      return { text: 'Scheduled', color: 'yellow', icon: Clock };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* Header */}
      <div className={`border-b ${currentTheme.border} ${currentTheme.bg.primary}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold font-italiana ${currentTheme.text.primary}`}>
                  {coupon.code}
                </h1>
                <p className={`${currentTheme.text.muted} font-instrument`}>
                  Coupon Details
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                to={`/dashboard/coupons/edit/${coupon.id}`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Coupon Code Card */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Coupon Code</h2>
              <div className="text-center">
                <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg mb-4`}>
                  <Hash className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">{coupon.code}</p>
                </div>
                <p className={`text-sm ${currentTheme.text.muted}`}>
                  Share this code with customers
                </p>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusInfo.color === 'green' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : statusInfo.color === 'red'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.text}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Times Used</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {coupon.usedCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Remaining Uses</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {coupon.usageLimit ? (coupon.usageLimit - (coupon.usedCount || 0)) : '∞'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Total Discount</span>
                  <span className={`font-medium text-green-600`}>
                    ${coupon.totalDiscounts || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Coupon Code</label>
                  <p className={`font-bold text-lg font-mono ${currentTheme.text.primary}`}>{coupon.code}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Discount Type</label>
                  <div className="flex items-center">
                    {coupon.discountType === 'percentage' ? (
                      <Percent className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-blue-500 mr-2" />
                    )}
                    <span className={currentTheme.text.primary}>
                      {coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Discount Value</label>
                  <p className={`text-2xl font-bold ${currentTheme.text.primary}`}>
                    {formatDiscount()}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Minimum Order</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>
                    ${coupon.minOrderAmount || 0}
                  </p>
                </div>
                {coupon.maxDiscountAmount && (
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Max Discount</label>
                    <p className={`font-medium ${currentTheme.text.primary}`}>
                      ${coupon.maxDiscountAmount}
                    </p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Description</label>
                  <p className={`${currentTheme.text.secondary} leading-relaxed`}>
                    {coupon.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Validity Period */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <Calendar className="w-5 h-5 mr-2" />
                Validity Period
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Valid From</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(coupon.validFrom)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Valid Until</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(coupon.validUntil)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className={`p-3 rounded-lg ${
                    isCouponExpired() 
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : isCouponActive()
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    <div className="flex items-center">
                      <StatusIcon className="w-5 h-5 mr-2" />
                      <span className="font-medium">{statusInfo.text}</span>
                    </div>
                    {isCouponExpired() && (
                      <p className="text-sm mt-1">This coupon has expired and can no longer be used.</p>
                    )}
                    {isCouponActive() && (
                      <p className="text-sm mt-1">This coupon is currently active and can be used.</p>
                    )}
                    {!isCouponActive() && !isCouponExpired() && (
                      <p className="text-sm mt-1">This coupon is scheduled to become active in the future.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Usage Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <Users className="w-5 h-5 mr-2" />
                Usage Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Usage Limit</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>
                    {coupon.usageLimit || 'Unlimited'}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Times Used</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>
                    {coupon.usedCount || 0}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Remaining Uses</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>
                    {coupon.usageLimit ? (coupon.usageLimit - (coupon.usedCount || 0)) : '∞'}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Total Discount Given</label>
                  <p className={`font-medium text-green-600`}>
                    ${coupon.totalDiscounts || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Coupon ID</label>
                  <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                    {coupon.id}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Created At</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(coupon.createdAt)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Last Updated</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(coupon.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Active Status</label>
                  <div className="flex items-center">
                    {coupon.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className={currentTheme.text.primary}>
                      {coupon.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewCoupon;