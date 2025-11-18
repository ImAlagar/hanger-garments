// components/ProductDetailsPage.js - UPDATED WITH LEFT-SIDE IMAGE GALLERY
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useGetProductBySlugQuery } from '../../redux/services/productService';
import { useGetCustomizationByProductIdQuery } from '../../redux/services/customizationService';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { setDesignMode, setCustomizationOptions, resetDesign } from '../../redux/slices/customizationSlice';
import CartSidebar from '../../components/layout/CartSidebar';
import RelatedProducts from './RelatedProducts';
import CustomizationModal from '../../components/Common/CustomizationModal';
import VirtualTryOn from '../../components/Common/VirtualTryOn';

const ProductDetailsPage = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const [productId, setProductId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isDesignMode = useSelector((state) => state.customization.isDesignMode);
  const designData = useSelector((state) => state.customization.designData);
  const dispatch = useDispatch();
  
  const isDark = theme === "dark";
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // Extract product ID from slug
  useEffect(() => {
    if (productSlug) {
      const parts = productSlug.split('-');
      const id = parts[parts.length - 1];
      setProductId(id);
    }
  }, [productSlug]);

  const { data: productResponse, isLoading, error } = useGetProductBySlugQuery(productId, {
    skip: !productId
  });

  // Get customization data
  const { data: customizationData, isLoading: isLoadingCustomization } = useGetCustomizationByProductIdQuery(productId, {
    skip: !productId || !productResponse?.data?.isCustomizable
  });

  const product = productResponse?.data || productResponse;
  
  // Check if product is customizable
  const isCustomizable = product?.isCustomizable && customizationData?.data?.isActive;
  const hasCustomization = customizationData?.data && customizationData.data.isActive;

  // Set initial selected variant when product loads
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstAvailableVariant = product.variants.find(variant => variant.stock > 0) || product.variants[0];
      setSelectedVariant(firstAvailableVariant);
      setSelectedColor(firstAvailableVariant?.color);
      setSelectedSize(firstAvailableVariant?.size);
    }
  }, [product]);

  // Set customization options when available
  useEffect(() => {
    if (customizationData?.data) {
      dispatch(setCustomizationOptions(customizationData.data));
    }
  }, [customizationData, dispatch]);

  // Reset design when modal closes
  useEffect(() => {
    if (!showCustomizationModal && isDesignMode) {
      dispatch(setDesignMode(false));
    }
  }, [showCustomizationModal, isDesignMode, dispatch]);

  // Check if product is in wishlist
  const isInWishlist = wishlistItems.some(item => item.product._id === product?.id);

  // Get available colors with their primary images
  const getAvailableColors = () => {
    if (!product?.variants) return [];
    
    const colorMap = new Map();
    
    product.variants.forEach(variant => {
      if (!colorMap.has(variant.color)) {
        // Find primary image for this color variant
        const primaryImage = variant.variantImages?.find(img => img.is_primary) || variant.variantImages?.[0];
        if (primaryImage) {
          colorMap.set(variant.color, {
            name: variant.color,
            image: primaryImage.imageUrl,
            variantId: variant.id
          });
        }
      }
    });
    
    return Array.from(colorMap.values());
  };

  const availableColors = getAvailableColors();
  const availableSizes = [...new Set(product?.variants?.map(v => v.size).filter(Boolean))];

  // Get variants for selected color
  const variantsForSelectedColor = product?.variants?.filter(v => v.color === selectedColor) || [];

  // Get ALL unique variant images for selected color (remove duplicates)
  const getAllVariantImagesForSelectedColor = () => {
    if (!selectedColor) return [];
    
    const allImages = [];
    const imageUrls = new Set();
    
    variantsForSelectedColor.forEach(variant => {
      variant.variantImages?.forEach(image => {
        if (!imageUrls.has(image.imageUrl)) {
          imageUrls.add(image.imageUrl);
          allImages.push({
            ...image,
            color: variant.color,
            size: variant.size
          });
        }
      });
    });
    
    return allImages;
  };

  const variantImages = getAllVariantImagesForSelectedColor();
  const mainProductImage = variantImages[activeImageIndex]?.imageUrl || variantImages[0]?.imageUrl;

  // Handle image zoom
  const handleImageZoom = (image) => {
    setZoomedImage(image);
    setShowZoomModal(true);
  };

  // Auth-based pricing logic with customization price
  const getProductPricing = () => {
    if (!product) return { displayPrice: 0, originalPrice: null, priceLabel: '', finalPrice: 0 };

    let displayPrice;
    let originalPrice;
    let priceLabel = "";
    let customizationPrice = 0;

    // Add customization price if in design mode
    if (isDesignMode && hasCustomization) {
      customizationPrice = customizationData.data.basePrice || 0;
    }

    if (isWholesaleUser && product.wholesalePrice) {
      displayPrice = product.wholesalePrice;
      originalPrice = product.offerPrice || product.normalPrice;
      priceLabel = "Wholesale";
    } else if (product.offerPrice && product.offerPrice < product.normalPrice) {
      displayPrice = product.offerPrice;
      originalPrice = product.normalPrice;
      priceLabel = "Offer";
    } else {
      displayPrice = product.normalPrice;
      originalPrice = null;
      priceLabel = "";
    }

    const finalPrice = displayPrice + customizationPrice;

    return { displayPrice, originalPrice, priceLabel, finalPrice, customizationPrice };
  };

  const { displayPrice, originalPrice, priceLabel, finalPrice, customizationPrice } = getProductPricing();

  // Handle variant selection
  const handleColorSelect = (color) => {
    setSelectedColor(color.name);
    const variantForColor = variantsForSelectedColor.find(v => v.stock > 0) || variantsForSelectedColor[0];
    setSelectedVariant(variantForColor);
    setSelectedSize(variantForColor?.size);
    setActiveImageIndex(0); // Reset to first image when color changes
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const variant = variantsForSelectedColor.find(v => v.size === size);
    if (variant) {
      setSelectedVariant(variant);
      setActiveImageIndex(0); // Reset to first image when size changes
    }
  };

  // Handle try-on completion
  const handleTryOnComplete = (resultImage) => {
    setTryOnResult(resultImage);
    
    // Auto-add to cart with try-on image
    if (selectedVariant) {
      const cartItem = {
        product: {
          _id: product.id,
          name: product.name,
          description: product.description,
          category: product.category?.name || product.category,
          images: variantImages.map(img => img.imageUrl),
          normalPrice: product.normalPrice,
          offerPrice: product.offerPrice,
          wholesalePrice: product.wholesalePrice,
          isCustomizable: product.isCustomizable,
        },
        variant: {
          _id: selectedVariant.id,
          color: selectedVariant.color,
          size: selectedVariant.size,
          price: finalPrice,
          stock: selectedVariant.stock,
          sku: selectedVariant.sku,
        },
        quantity: quantity,
        tryOnImage: resultImage,
        hasTryOn: true,
        ...(isDesignMode && hasCustomization && {
          customization: {
            designData: designData,
            customizationId: customizationData.data.id,
            customizationPrice: customizationPrice,
            previewImage: null
          }
        })
      };
      
      dispatch(addToCart(cartItem));
      setShowCartSidebar(true);
      
      // Reset design mode after adding to cart
      if (isDesignMode) {
        dispatch(setDesignMode(false));
        dispatch(resetDesign());
      }
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setAddingToCart(true);
    try {
      const cartItem = {
        product: {
          _id: product.id,
          name: product.name,
          description: product.description,
          category: product.category?.name || product.category,
          images: variantImages.map(img => img.imageUrl),
          normalPrice: product.normalPrice,
          offerPrice: product.offerPrice,
          wholesalePrice: product.wholesalePrice,
          isCustomizable: product.isCustomizable,
        },
        variant: {
          _id: selectedVariant.id,
          color: selectedVariant.color,
          size: selectedVariant.size,
          price: finalPrice,
          stock: selectedVariant.stock,
          sku: selectedVariant.sku,
        },
        quantity: quantity,
        ...(tryOnResult && {
          tryOnImage: tryOnResult,
          hasTryOn: true
        }),
        ...(isDesignMode && hasCustomization && {
          customization: {
            designData: designData,
            customizationId: customizationData.data.id,
            customizationPrice: customizationPrice,
            previewImage: null
          }
        })
      };
      
      dispatch(addToCart(cartItem));
      setShowCartSidebar(true);
      
      // Reset design mode after adding to cart
      if (isDesignMode) {
        dispatch(setDesignMode(false));
        dispatch(resetDesign());
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle customization
  const handleCustomize = () => {
    if (!user) {
      navigate('/login', { state: { returnUrl: window.location.pathname } });
      return;
    }
    
    if (!hasCustomization) {
      alert('Customization is not available for this product.');
      return;
    }
    
    setShowCustomizationModal(true);
    dispatch(setDesignMode(true));
  };

  // Handle quick add to cart
  const handleQuickAddToCart = () => {
    if (isCustomizable) {
      handleAddToCart();
    } else {
      handleAddToCart();
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!user) {
      navigate('/login', { state: { returnUrl: window.location.pathname } });
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist({ productId: product.id }));
    } else {
      const wishlistItem = {
        product: {
          _id: product.id,
          name: product.name,
          description: product.description,
          category: product.category?.name || product.category,
          images: variantImages.map(img => img.imageUrl),
          normalPrice: product.normalPrice,
          offerPrice: product.offerPrice,
          wholesalePrice: product.wholesalePrice,
        },
        variant: selectedVariant || product.variants?.[0]
      };
      
      dispatch(addToWishlist(wishlistItem));
    }
  };

  // Handle virtual try-on
  const handleVirtualTryOn = () => {
    if (!user) {
      navigate('/login', { state: { returnUrl: window.location.pathname } });
      return;
    }
    
    setShowTryOnModal(true);
  };

  // Stock status
  const isOutOfStock = selectedVariant?.stock === 0;
  const lowStock = selectedVariant?.stock > 0 && selectedVariant?.stock <= 10;

  // Loading state
  if (isLoading || (product?.isCustomizable && isLoadingCustomization)) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-gray-300 h-8 rounded w-3/4"></div>
                <div className="bg-gray-300 h-6 rounded w-1/2"></div>
                <div className="bg-gray-300 h-20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Product Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
        {/* Product Images - LEFT SIDE */}
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile: Horizontal Thumbnails on top */}
          <div className="block lg:hidden">
            {/* Thumbnail Carousel for Mobile */}
            <div className="flex space-x-2 overflow-x-auto pb-3 mb-4">
              {variantImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    activeImageIndex === index
                      ? 'border-blue-500 ring-2 ring-blue-300 shadow-md'
                      : isDark 
                        ? 'border-gray-600 hover:border-gray-400' 
                        : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                  />
                  {activeImageIndex === index && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Main Image for Mobile */}
            <div 
              className={`relative rounded-lg overflow-hidden cursor-zoom-in ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}
              onClick={() => handleImageZoom(variantImages[activeImageIndex] || variantImages[0])}
            >
              <img
                src={mainProductImage}
                alt={`${product.name} - Main view`}
                className="w-full h-64 sm:h-80 object-contain"
              />
              
              <div className="absolute top-3 right-3 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-1.5 sm:p-2 transition-all duration-300 shadow-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>

              <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                {activeImageIndex + 1} / {variantImages.length}
              </div>
            </div>
          </div>

          {/* Desktop: Vertical Thumbnails + Main Image */}
          <div className="hidden lg:flex flex-row space-x-4 lg:space-x-6">
            {/* Vertical Thumbnails - LEFT SIDE */}
            <div className="flex flex-col space-y-3 lg:space-y-4 overflow-y-auto pb-2 max-h-80 xl:max-h-96">
              {variantImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    activeImageIndex === index
                      ? 'border-blue-500 ring-2 ring-blue-300 shadow-md'
                      : isDark 
                        ? 'border-gray-600 hover:border-gray-400' 
                        : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 object-cover"
                  />
                  
                  {activeImageIndex === index && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg"></div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200"></div>
                </button>
              ))}
            </div>

            {/* Main Large Image - RIGHT SIDE */}
            <div className="flex-1">
              <div 
                className={`relative rounded-lg overflow-hidden cursor-zoom-in ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}
                onClick={() => handleImageZoom(variantImages[activeImageIndex] || variantImages[0])}
              >
                <img
                  src={mainProductImage}
                  alt={`${product.name} - Main view`}
                  className="w-full h-80 lg:h-96 xl:h-[500px] object-contain"
                />
                
                <div className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-2 transition-all duration-300 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>

                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                  {activeImageIndex + 1} / {variantImages.length}
                </div>
              </div>
            </div>
          </div>

          {/* Product Badges */}
          <div className="flex flex-wrap gap-2 pt-2 sm:pt-4">
            {isCustomizable && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-1.5 sm:mr-2"></span>
                Customizable
              </span>
            )}
            <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2"></span>
              Virtual Try-On
            </span>
            {!isOutOfStock && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1.5 sm:mr-2"></span>
                In Stock
              </span>
            )}
          </div>

          {/* Try-On Result Preview */}
          {tryOnResult && (
            <div className="p-3 sm:p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <img 
                    src={tryOnResult} 
                    alt="Virtual try-on result" 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border-2 border-green-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 text-xs sm:text-sm mb-1">
                    ✅ Your Virtual Try-On Result
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                    This image will be included with your order for reference.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowTryOnModal(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Edit Try-On
                    </button>
                    <button
                      onClick={() => setTryOnResult(null)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Product Info - RIGHT SIDE */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Product Title and Category */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2">{product.name}</h1>
            <p className={`text-base sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              {product.category?.name || product.category}
            </p>
            
            {/* Customization Badge */}
            {isCustomizable && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-block px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 text-xs sm:text-sm font-medium rounded-full">
                  🎨 Customizable
                </span>
                {customizationData?.data?.basePrice > 0 && (
                  <span className="text-xs sm:text-sm text-purple-600">
                    + ₹{customizationData.data.basePrice} customization fee
                  </span>
                )}
              </div>
            )}

            {/* Try-On Available Badge */}
            <div className="flex items-center">
              <span className="inline-block px-2 sm:px-3 py-1 bg-orange-100 text-orange-800 text-xs sm:text-sm font-medium rounded-full">
                👕 Virtual Try-On Available
              </span>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold">₹{finalPrice}</span>
              {originalPrice && originalPrice !== finalPrice && (
                <span className={`text-lg sm:text-xl line-through ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ₹{originalPrice}
                </span>
              )}
              {priceLabel && (
                <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded ${
                  priceLabel === 'Wholesale' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {priceLabel}
                </span>
              )}
            </div>
            
            {isWholesaleUser && (
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                🏷️ Special wholesale pricing applied
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {isOutOfStock ? (
              <p className="text-red-600 font-medium text-sm sm:text-base">Out of Stock</p>
            ) : lowStock ? (
              <p className="text-orange-600 font-medium text-sm sm:text-base">
                Only {selectedVariant?.stock} left in stock!
              </p>
            ) : (
              <p className="text-green-600 font-medium text-sm sm:text-base">In Stock</p>
            )}
          </div>

          {/* Color Selection with Images */}
          {availableColors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-sm sm:text-base">
                Choose Color: <span className="text-gray-700 font-normal">{selectedColor}</span>
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {availableColors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 overflow-hidden ${
                      selectedColor === color.name
                        ? 'border-blue-500 ring-2 ring-blue-300'
                        : isDark 
                          ? 'border-gray-600' 
                          : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={color.image}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Choose Size</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {availableSizes.map(size => {
                  const variant = variantsForSelectedColor.find(v => v.size === size);
                  const isAvailable = variant?.stock > 0;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && handleSizeSelect(size)}
                      disabled={!isAvailable}
                      className={`px-3 py-2 sm:px-4 sm:py-2 rounded border text-xs sm:text-sm ${
                        selectedSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : !isAvailable
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isDark 
                              ? 'border-gray-600 bg-gray-800 text-gray-300' 
                              : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Action Buttons */}
          <div className="space-y-4 sm:space-y-6 pt-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <label className="font-semibold text-sm sm:text-base">Quantity:</label>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`px-3 py-1 sm:px-3 sm:py-1 text-sm sm:text-base ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-3 sm:px-4 py-1 min-w-8 sm:min-w-12 text-center text-sm sm:text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={selectedVariant && quantity >= selectedVariant.stock}
                  className={`px-3 py-1 sm:px-3 sm:py-1 text-sm sm:text-base ${
                    (selectedVariant && quantity >= selectedVariant.stock)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : isDark 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Virtual Try-On Button */}
              <button
                onClick={handleVirtualTryOn}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>👕</span>
                <span className="whitespace-nowrap">Virtual Try-On</span>
              </button>

              {/* Customize Button for customizable products */}
              {isCustomizable && !isDesignMode && (
                <button
                  onClick={handleCustomize}
                  className="flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span>🎨</span>
                  <span className="whitespace-nowrap">Customize Design</span>
                </button>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={isDesignMode ? handleAddToCart : handleQuickAddToCart}
                disabled={isOutOfStock || addingToCart || !selectedVariant}
                className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  isOutOfStock || addingToCart || !selectedVariant
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isDesignMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {addingToCart ? (
                  <>
                    <span>⏳</span>
                    <span>Adding...</span>
                  </>
                ) : isOutOfStock ? (
                  <>
                    <span>❌</span>
                    <span>Out of Stock</span>
                  </>
                ) : isDesignMode ? (
                  <>
                    <span>🛒</span>
                    <span className="whitespace-nowrap">Add Custom to Cart</span>
                  </>
                ) : (
                  <>
                    <span>🛒</span>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={!user}
                className={`p-2 sm:p-3 rounded-lg border flex items-center justify-center ${
                  isInWishlist
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : isDark
                      ? 'bg-gray-800 border-gray-600 text-gray-300'
                      : 'bg-white border-gray-300 text-gray-700'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!user ? "Login to add to wishlist" : isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isInWishlist ? '❤️' : '🤍'}
              </button>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Description</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-sm sm:text-base`}>
                {product.description}
              </p>
            </div>
          )}

            {/* Product Specifications */}
            {product.productDetails && product.productDetails.length > 0 && (
              <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-3 text-sm sm:text-base">Specifications</h3>
                <div className="space-y-1">
                  {product.productDetails.map((detail, index) => (
                    <div key={detail.id || index} className="flex items-center">
                      <span className={`font-semibold text-sm mr-2 ${
                        isDark ? 'text-white' : 'text-black'
                      }`}>
                        {detail.title}:
                      </span>
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {detail.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts 
        currentProduct={product}
        category={product.category?.name || product.category}
      />

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />

      {/* Customization Modal */}
      {showCustomizationModal && isCustomizable && hasCustomization && (
        <CustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => {
            setShowCustomizationModal(false);
            dispatch(setDesignMode(false));
          }}
          product={product}
          variant={selectedVariant}
          customization={customizationData.data}
        />
      )}

      {/* Virtual Try-On Modal */}
      {showTryOnModal && (
        <VirtualTryOn
          productImage={mainProductImage}
          onTryOnComplete={handleTryOnComplete}
          isOpen={showTryOnModal}
          onClose={() => setShowTryOnModal(false)}
        />
      )}

      {/* Image Zoom Modal */}
      {showZoomModal && zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={zoomedImage.imageUrl}
              alt="Zoomed product view"
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setShowZoomModal(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-sm">
              {zoomedImage.color}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default ProductDetailsPage;