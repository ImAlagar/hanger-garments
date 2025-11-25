// src/components/admin/quantity-pricing/ViewQuantityPrice.jsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetQuantityPriceByIdQuery } from '../../../../redux/services/subcategoryService';
import { ArrowLeft, Edit, Calendar, Package, CheckCircle, XCircle, Percent, DollarSign } from 'lucide-react';

const ViewQuantityPrice = () => {
  const { priceId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // ✅ CORRECT: Use the specific quantity price query
  const { 
    data: quantityPriceResponse, 
    isLoading, 
    error 
  } = useGetQuantityPriceByIdQuery(priceId);

  const quantityPrice = quantityPriceResponse?.data;

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

  if (error || !quantityPrice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Quantity Price Not Found</h2>
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
                  Buy {quantityPrice.quantity} - {quantityPrice.subcategory?.name}
                </h1>
                <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                  Quantity Price Details
                </p>
              </div>
            </div>

            {/* Right: Edit Button */}
            <div className="flex sm:flex-row flex-col sm:space-x-3 space-y-2 sm:space-y-0">
              <Link
                to={`/dashboard/quantity-pricing/edit/${quantityPrice.subcategoryId}/${priceId}`}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          {/* Left Column - Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Summary */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Price Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    quantityPrice.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {quantityPrice.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Type</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {quantityPrice.priceType === 'PERCENTAGE' ? 'Percentage Discount' : 'Fixed Price'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Subcategory</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {quantityPrice.subcategory?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Category</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {quantityPrice.subcategory?.category?.name}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Pricing Impact */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Pricing Impact</h2>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  quantityPrice.priceType === 'PERCENTAGE' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {quantityPrice.priceType === 'PERCENTAGE' ? `${quantityPrice.value}%` : `₹${quantityPrice.value}`}
                </div>
                <p className={currentTheme.text.muted}>
                  {quantityPrice.priceType === 'PERCENTAGE' 
                    ? 'Discount applied' 
                    : 'Total price for quantity'
                  }
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>Price Rule Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Quantity Required</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>Buy {quantityPrice.quantity}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Status</label>
                  <div className="flex items-center">
                    {quantityPrice.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className={currentTheme.text.primary}>
                      {quantityPrice.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Price Type</label>
                  <div className="flex items-center">
                    {quantityPrice.priceType === 'PERCENTAGE' ? (
                      <Percent className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-blue-500 mr-2" />
                    )}
                    <span className={currentTheme.text.primary}>
                      {quantityPrice.priceType === 'PERCENTAGE' ? 'Percentage Discount' : 'Fixed Total Price'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Value</label>
                  <p className={`font-medium ${
                    quantityPrice.priceType === 'PERCENTAGE' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {quantityPrice.priceType === 'PERCENTAGE' ? `${quantityPrice.value}% discount` : `₹${quantityPrice.value} total`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Subcategory Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <Package className="w-5 h-5 mr-2" />
                Subcategory Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Subcategory Name</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>{quantityPrice.subcategory?.name}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Category</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>{quantityPrice.subcategory?.category?.name}</p>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Description</label>
                  <p className={`${currentTheme.text.secondary} leading-relaxed`}>
                    {quantityPrice.subcategory?.description || 'No description provided.'}
                  </p>
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
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Created At</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(quantityPrice.createdAt)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Last Updated</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(quantityPrice.updatedAt)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Price Rule ID</label>
                  <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                    {quantityPrice.id}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Subcategory ID</label>
                  <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                    {quantityPrice.subcategoryId}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewQuantityPrice;