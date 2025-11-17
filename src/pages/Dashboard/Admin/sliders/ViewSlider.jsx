// components/admin/sliders/ViewSlider.jsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetSliderByIdQuery } from '../../../../redux/services/sliderService';
import { ArrowLeft, Edit, Calendar, Image, Layout, MousePointer, CheckCircle, XCircle, Clock } from 'lucide-react';

const ViewSlider = () => {
  const { sliderId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: sliderData, isLoading, error } = useGetSliderByIdQuery(sliderId);
  const slider = sliderData?.data;

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Slider Not Found</h2>
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

  if (!slider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>Slider not found</h2>
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
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLayout = (layout) => {
    return layout.charAt(0).toUpperCase() + layout.slice(1) + ' Aligned';
  };

  const isSliderActiveWithDates = () => {
    const now = new Date();
    if (!slider.isActive) return false;
    
    if (!slider.startDate && !slider.endDate) return true;
    if (slider.startDate && !slider.endDate) return new Date(slider.startDate) <= now;
    if (!slider.startDate && slider.endDate) return new Date(slider.endDate) >= now;
    
    return new Date(slider.startDate) <= now && new Date(slider.endDate) >= now;
  };

  const isSliderExpired = () => {
    if (!slider.endDate) return false;
    return new Date(slider.endDate) < new Date();
  };

  const isSliderScheduled = () => {
    if (!slider.startDate) return false;
    return new Date(slider.startDate) > new Date();
  };

  const getStatusInfo = () => {
    if (!slider.isActive) {
      return { text: 'Inactive', color: 'red', icon: XCircle };
    } else if (isSliderExpired()) {
      return { text: 'Expired', color: 'red', icon: XCircle };
    } else if (isSliderScheduled()) {
      return { text: 'Scheduled', color: 'yellow', icon: Clock };
    } else if (isSliderActiveWithDates()) {
      return { text: 'Active', color: 'green', icon: CheckCircle };
    } else {
      return { text: 'Inactive', color: 'gray', icon: XCircle };
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Section: Back button + Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
            <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-fit`}
            >
            <ArrowLeft size={20} />
            </button>

            <div>
            <h1 className={`text-xl sm:text-2xl font-bold font-italiana ${currentTheme.text.primary}`}>
                {slider.title}
            </h1>
            <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                Slider Details
            </p>
            </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
            <Link
            to={`/dashboard/sliders/edit/${slider.id}`}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
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
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-6">
            {/* Background Image */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Background Image</h2>
              {slider.bgImage ? (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={slider.bgImage}
                    alt="Background"
                    className="w-full h-48 object-cover"
                  />
                </div>
              ) : (
                <div className={`w-full h-48 flex items-center justify-center rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <Image size={48} className={currentTheme.text.muted} />
                </div>
              )}
            </motion.div>

            {/* Main Image */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Main Image</h2>
              {slider.image ? (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={slider.image}
                    alt="Main"
                    className="w-full h-48 object-contain"
                  />
                </div>
              ) : (
                <div className={`w-full h-48 flex items-center justify-center rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <Image size={48} className={currentTheme.text.muted} />
                </div>
              )}
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
                      : statusInfo.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.text}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Layout</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {formatLayout(slider.layout)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Order</span>
                  <span className={`font-bold ${currentTheme.text.primary}`}>
                    #{slider.order}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Has Button</span>
                  <span className={`font-medium ${slider.buttonText ? 'text-green-600' : 'text-gray-500'}`}>
                    {slider.buttonText ? 'Yes' : 'No'}
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
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Title</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>{slider.title}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Layout</label>
                  <div className="flex items-center">
                    <Layout className="w-5 h-5 text-blue-500 mr-2" />
                    <span className={currentTheme.text.primary}>
                      {formatLayout(slider.layout)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Subtitle</label>
                  <p className={currentTheme.text.primary}>
                    {slider.subtitle || 'No subtitle'}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Order</label>
                  <p className={`font-bold ${currentTheme.text.primary}`}>
                    #{slider.order}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Description</label>
                  <p className={`${currentTheme.text.secondary} leading-relaxed`}>
                    {slider.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>Text Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Small Text</label>
                  <p className={currentTheme.text.primary}>
                    {slider.smallText || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Offer Text</label>
                  <p className={currentTheme.text.primary}>
                    {slider.offerText || 'Not set'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            {(slider.buttonText || slider.buttonLink) && (
              <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                  <MousePointer className="w-5 h-5 mr-2" />
                  Call to Action
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Button Text</label>
                    <p className={`font-medium ${currentTheme.text.primary}`}>
                      {slider.buttonText}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Button Link</label>
                    <p className={`font-medium text-blue-600 break-all`}>
                      {slider.buttonLink}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Schedule Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <Calendar className="w-5 h-5 mr-2" />
                Schedule
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Start Date</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(slider.startDate)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>End Date</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(slider.endDate)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className={`p-3 rounded-lg ${
                    statusInfo.color === 'green' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : statusInfo.color === 'red'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    <div className="flex items-center">
                      <StatusIcon className="w-5 h-5 mr-2" />
                      <span className="font-medium">{statusInfo.text}</span>
                    </div>
                    {statusInfo.text === 'Active' && (
                      <p className="text-sm mt-1">This slider is currently active and visible on the home page.</p>
                    )}
                    {statusInfo.text === 'Inactive' && (
                      <p className="text-sm mt-1">This slider is inactive and not visible on the home page.</p>
                    )}
                    {statusInfo.text === 'Expired' && (
                      <p className="text-sm mt-1">This slider has expired and is no longer visible.</p>
                    )}
                    {statusInfo.text === 'Scheduled' && (
                      <p className="text-sm mt-1">This slider is scheduled to become active in the future.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

                {/* Additional Information */}
                <motion.div
                variants={itemVariants}
                className={`rounded-xl p-4 sm:p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}
                >
                <h2
                    className={`text-lg sm:text-xl font-semibold font-instrument mb-4 sm:mb-6 ${currentTheme.text.primary}`}
                >
                    Additional Information
                </h2>

                {/* Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Slider ID */}
                    <div className="break-words">
                    <label
                        className={`block text-sm font-medium ${currentTheme.text.muted} mb-1 sm:mb-2`}
                    >
                        Slider ID
                    </label>
                    <p className={`font-mono text-sm sm:text-base ${currentTheme.text.primary}`}>
                        {slider.id}
                    </p>
                    </div>

                    {/* Created At */}
                    <div>
                    <label
                        className={`block text-sm font-medium ${currentTheme.text.muted} mb-1 sm:mb-2`}
                    >
                        Created At
                    </label>
                    <p className={`text-sm sm:text-base ${currentTheme.text.primary}`}>
                        {formatDate(slider.createdAt)}
                    </p>
                    </div>

                    {/* Last Updated */}
                    <div>
                    <label
                        className={`block text-sm font-medium ${currentTheme.text.muted} mb-1 sm:mb-2`}
                    >
                        Last Updated
                    </label>
                    <p className={`text-sm sm:text-base ${currentTheme.text.primary}`}>
                        {formatDate(slider.updatedAt)}
                    </p>
                    </div>

                    {/* Active Status */}
                    <div>
                    <label
                        className={`block text-sm font-medium ${currentTheme.text.muted} mb-1 sm:mb-2`}
                    >
                        Active Status
                    </label>
                    <div className="flex items-center">
                        {slider.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm sm:text-base ${currentTheme.text.primary}`}>
                        {slider.isActive ? 'Enabled' : 'Disabled'}
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

export default ViewSlider;