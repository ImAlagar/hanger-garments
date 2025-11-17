// components/admin/ratings/ViewRating.jsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetRatingByIdQuery, useToggleRatingApprovalMutation } from '../../../../redux/services/ratingService';
import { ArrowLeft, Star, Calendar, User, Package, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

const ViewRating = () => {
  const { ratingId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: ratingData, isLoading, error } = useGetRatingByIdQuery(ratingId);
  const [toggleApproval, { isLoading: isApprovalLoading }] = useToggleRatingApprovalMutation();

  const rating = ratingData?.data;

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

  // Star rating display
  const renderStars = (ratingValue) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${
              star <= ratingValue
                ? 'text-yellow-400 fill-current'
                : theme === 'dark' 
                ? 'text-gray-600' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className={`ml-2 text-lg font-bold ${currentTheme.text.primary}`}>
          {ratingValue}.0
        </span>
      </div>
    );
  };

const handleApprovalToggle = async () => {
  try {
    await toggleApproval({ 
      ratingId, 
      currentApproval: rating.isApproved 
    }).unwrap();
  } catch (error) {
    console.error('Approval toggle failed:', error);
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Rating Not Found</h2>
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

  if (!rating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>Rating not found</h2>
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
                  Rating Details
                </h1>
                <p className={`${currentTheme.text.muted} font-instrument`}>
                  Review from {rating.user?.name || 'Anonymous User'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User & Product Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                User Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <User className={currentTheme.text.muted} size={20} />
                  </div>
                  <div>
                    <p className={`font-medium ${currentTheme.text.primary}`}>
                      {rating.user?.name || 'Anonymous User'}
                    </p>
                    <p className={`text-sm ${currentTheme.text.muted}`}>Reviewer</p>
                  </div>
                </div>
                
                {rating.user?.email && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${currentTheme.text.muted}`}>Email:</span>
                      <span className={`text-sm ${currentTheme.text.primary}`}>
                        {rating.user.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                Product Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <Package className={currentTheme.text.muted} size={20} />
                  </div>
                  <div>
                    <p className={`font-medium ${currentTheme.text.primary}`}>
                      {rating.product?.name || 'Unknown Product'}
                    </p>
                    <p className={`text-sm ${currentTheme.text.muted}`}>Rated Product</p>
                  </div>
                </div>
                
                {rating.product?.category && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${currentTheme.text.muted}`}>Category:</span>
                      <span className={`text-sm ${currentTheme.text.primary}`}>
                        {rating.product.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Rating Status */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                Rating Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Approval Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    rating.isApproved
                      ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      : theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rating.isApproved ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approved
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Pending
                      </>
                    )}
                  </span>
                </div>
                
                <button
                onClick={handleApprovalToggle}
                disabled={isApprovalLoading}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    rating.isApproved
                    ? theme === 'dark' 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                {isApprovalLoading ? 'Updating...' : 
                rating.isApproved ? 'Mark as Pending' : 'Approve Rating'}
                </button>
              </div>
            </motion.div>

            {/* Timeline Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 flex items-center ${currentTheme.text.primary}`}>
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </h2>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-1`}>Submitted</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(rating.createdAt)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-1`}>Last Updated</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(rating.updatedAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Rating Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rating Content */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <MessageSquare className="w-5 h-5 mr-2" />
                Rating Details
              </h2>
              
              <div className="space-y-6">
                {/* Star Rating */}
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-4`}>Rating</label>
                  {renderStars(rating.rating)}
                </div>

                {/* Comment */}
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Review Comment</label>
                  <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`whitespace-pre-wrap leading-relaxed ${currentTheme.text.secondary}`}>
                      {rating.comment || 'No comment provided.'}
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Additional Information</label>
                  <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className={`text-sm ${currentTheme.text.muted}`}>Rating ID:</span>
                        <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                          {rating.id}
                        </p>
                      </div>
                      <div>
                        <span className={`text-sm ${currentTheme.text.muted}`}>Product ID:</span>
                        <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                          {rating.productId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className={`text-sm ${currentTheme.text.muted}`}>User ID:</span>
                        <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                          {rating.userId || 'N/A'}
                        </p>
                      </div>
                    </div>
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

export default ViewRating;