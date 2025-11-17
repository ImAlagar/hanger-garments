import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetProductByIdQuery } from '../../../../redux/services/productService';
import { ArrowLeft, Edit, Trash2, Tag, Package, Layers, Image as ImageIcon } from 'lucide-react';

const ViewProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: productData, isLoading, error } = useGetProductByIdQuery(productId);
  const product = productData?.data;

  // Theme-based styling - FIXED TEXT COLORS
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
        label: 'text-gray-700',
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
        secondary: 'text-gray-200', // Changed from gray-300 to gray-200 for better contrast
        muted: 'text-gray-300', // Changed from gray-400 to gray-300 for better visibility
        label: 'text-gray-300', // Added specific label color
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h2>
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>Product not found</h2>
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

  // Get all product images (primary images + variant images)
  const getAllImages = () => {
    const images = [];
    
    // Add primary product images
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }
    
    // Add variant images
    if (product.variants) {
      product.variants.forEach(variant => {
        if (variant.variantImages && variant.variantImages.length > 0) {
          images.push(...variant.variantImages);
        }
      });
    }
    
    return images;
  };

  const allImages = getAllImages();
  const primaryImage = allImages.find(img => img.isPrimary) || allImages[0];

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
            <ArrowLeft size={20} />
            </button>
            <div>
            <h1 className={`text-xl sm:text-2xl font-bold font-italiana ${currentTheme.text.primary}`}>
                {product.name}
            </h1>
            <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                Product Code: {product.productCode}
            </p>
            </div>
        </div>

        {/* Right Section */}
        <div className="flex sm:flex-row flex-col sm:space-x-3 space-y-2 sm:space-y-0">
            <Link
            to={`/dashboard/products/edit/${product.id}`}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Main Image */}
            <div className={`rounded-xl ${currentTheme.shadow} overflow-hidden`}>
              {primaryImage ? (
                <img
                  src={primaryImage.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className={`w-full h-96 flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <ImageIcon size={48} className={currentTheme.text.muted} />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : currentTheme.border
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Basic Info Card */}
            <div className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${currentTheme.text.muted}`}>Product Name</p>
                  <p className={`font-medium ${currentTheme.text.primary}`}>{product.name}</p>
                </div>
                <div>
                  <p className={`text-sm ${currentTheme.text.muted}`}>Product Code</p>
                  <p className={`font-medium ${currentTheme.text.primary}`}>{product.productCode}</p>
                </div>
                <div>
                  <p className={`text-sm ${currentTheme.text.muted}`}>Category</p>
                  <p className={`font-medium ${currentTheme.text.primary}`}>
                    {product.category?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${currentTheme.text.muted}`}>Subcategory</p>
                  <p className={`font-medium ${currentTheme.text.primary}`}>
                    {product.subcategory?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${currentTheme.text.muted}`}>Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : product.status === 'INACTIVE'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <div>
                  <p className={`text-sm ${currentTheme.text.muted}`}>Featured</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.featured 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {product.featured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-4 flex items-center ${currentTheme.text.primary}`}>
                <Tag size={20} className="mr-2" />
                Pricing Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${currentTheme.text.muted}`}>Normal Price</p>
                  <p className={`text-lg font-bold ${currentTheme.text.primary}`}>
                    ₹{product.normalPrice}
                  </p>
                </div>
                {product.offerPrice && (
                  <div>
                    <p className={`text-sm ${currentTheme.text.muted}`}>Offer Price</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{product.offerPrice}
                    </p>
                  </div>
                )}
                {product.wholesalePrice && (
                  <div>
                    <p className={`text-sm ${currentTheme.text.muted}`}>Wholesale Price</p>
                    <p className={`text-lg font-bold ${currentTheme.text.primary}`}>
                      ₹{product.wholesalePrice}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            {product.description && (
              <div className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h2 className={`text-xl font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Description</h2>
                <p className={`${currentTheme.text.secondary} leading-relaxed`}>
                  {product.description}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div variants={itemVariants} className="mt-8">
          {/* Tab Headers */}
          <div className={`border-b ${currentTheme.border}`}>
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'details', name: 'Product Details', icon: Layers },
                { id: 'variants', name: 'Variants', icon: Package },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : `border-transparent ${currentTheme.text.muted} hover:${currentTheme.text.secondary} hover:border-gray-300 dark:hover:border-gray-600`
                    }`}
                  >
                    <IconComponent size={16} className="mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'details' && (
              <div className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h3 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Product Specifications</h3>
                {product.productDetails && product.productDetails.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.productDetails.map((detail, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${currentTheme.border}`}>
                        <h4 className={`font-medium mb-2 ${currentTheme.text.primary}`}>{detail.title}</h4>
                        <p className={currentTheme.text.secondary}>{detail.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={currentTheme.text.muted}>No product details available.</p>
                )}
              </div>
            )}

            {activeTab === 'variants' && (
              <div className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h3 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Product Variants</h3>
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-4">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className={`border rounded-lg p-4 ${currentTheme.border}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className={`font-medium capitalize ${currentTheme.text.primary}`}>
                              Color: {variant.color}
                            </h4>
                            <p className={`text-sm ${currentTheme.text.muted}`}>Size: {variant.size}</p>
                            <p className={`text-sm ${currentTheme.text.muted}`}>SKU: {variant.sku}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            variant.stock > 0 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            Stock: {variant.stock}
                          </span>
                        </div>
                        
                        {/* Variant Images */}
                        {variant.variantImages && variant.variantImages.length > 0 && (
                          <div className="flex space-x-2 overflow-x-auto">
                            {variant.variantImages.map((image) => (
                              <div key={image.id} className="flex-shrink-0">
                                <img
                                  src={image.imageUrl}
                                  alt={`${variant.color} ${variant.size}`}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={currentTheme.text.muted}>No variants available.</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ViewProduct;