import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetSubcategoryByIdQuery } from '../../../../redux/services/subcategoryService';
import { ArrowLeft, Edit, Calendar, Package, Image as ImageIcon, CheckCircle, XCircle, Folder } from 'lucide-react';

const ViewSubCategory = () => {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: subcategoryData, isLoading, error } = useGetSubcategoryByIdQuery(subcategoryId);
  const subcategory = subcategoryData?.data;

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Subcategory Not Found</h2>
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

  if (!subcategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>Subcategory not found</h2>
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
                {subcategory.name}
            </h1>
            <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                Subcategory Details
            </p>
            </div>
        </div>

        {/* Right: Edit Button */}
        <div className="flex sm:flex-row flex-col sm:space-x-3 space-y-2 sm:space-y-0">
            <Link
            to={`/dashboard/subcategories/edit/${subcategory.id}`}
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
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Subcategory Image */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Sizechart Image</h2>
              {subcategory.image ? (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={subcategory.image}
                    alt={subcategory.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              ) : (
                <div className={`w-full h-64 flex items-center justify-center rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <ImageIcon size={48} className={currentTheme.text.muted} />
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
                    subcategory.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {subcategory.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Products</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {subcategory.products?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Category</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {subcategory.category?.name}
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
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Subcategory Name</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>{subcategory.name}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Status</label>
                  <div className="flex items-center">
                    {subcategory.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className={currentTheme.text.primary}>
                      {subcategory.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Description</label>
                  <p className={`${currentTheme.text.secondary} leading-relaxed`}>
                    {subcategory.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Category Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <Folder className="w-5 h-5 mr-2" />
                Category Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Category Name</label>
                  <div className="flex items-center space-x-3">
                    {subcategory.category?.image && (
                      <img 
                        src={subcategory.category.image} 
                        alt={subcategory.category.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <p className={`font-medium ${currentTheme.text.primary}`}>
                      {subcategory.category?.name}
                    </p>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Category ID</label>
                  <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                    {subcategory.categoryId}
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
                    {formatDate(subcategory.createdAt)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Last Updated</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(subcategory.updatedAt)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <Package className="w-5 h-5 mr-2" />
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Subcategory ID</label>
                  <p className={`font-mono text-sm ${currentTheme.text.primary}`}>
                    {subcategory.id}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Image Public ID</label>
                  <p className={`font-mono text-sm ${currentTheme.text.primary} break-all`}>
                    {subcategory.imagePublicId || 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Products List */}
            {subcategory.products && subcategory.products.length > 0 && (
              <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>
                  Products ({subcategory.products.length})
                </h2>
                <div className="space-y-3">
                  {subcategory.products.map((product) => (
                    <div key={product.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div>
                        <p className={`font-medium ${currentTheme.text.primary}`}>{product.name}</p>
                        <p className={`text-sm ${currentTheme.text.muted}`}>Code: {product.productCode}</p>
                      </div>
                      <Link
                        to={`/dashboard/products/view/${product.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewSubCategory;