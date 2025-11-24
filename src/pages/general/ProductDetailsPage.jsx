import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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

const ProductDetailsPage = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [productId, setProductId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isDesignMode = useSelector((state) => state.customization.isDesignMode);
  const designData = useSelector((state) => state.customization.designData);
  const dispatch = useDispatch();
  
  const isDark = theme === "dark";
  
  // Get initial color from multiple sources (priority order)
  const initialColorFromState = location.state?.selectedColor;
  const initialColorFromURL = searchParams.get('color');
  const initialColor = initialColorFromURL || initialColorFromState;

  // Theme-based color variables
  const themeColors = {
    bgPrimary: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDark ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-700',
    textTertiary: isDark ? 'text-gray-400' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-500' : 'text-gray-400',
    borderPrimary: isDark ? 'border-gray-700' : 'border-gray-300',
    borderSecondary: isDark ? 'border-gray-600' : 'border-gray-200',
    borderHover: isDark ? 'border-gray-500' : 'border-gray-400',
    borderActive: isDark ? 'border-blue-400' : 'border-blue-500',
    ringActive: isDark ? 'ring-blue-400' : 'ring-blue-500',
    shadowActive: isDark ? 'shadow-blue-500/20' : 'shadow-blue-500/30',
    btnPrimary: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700',
    btnSecondary: isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    success: isDark ? 'text-green-400' : 'text-green-600',
    warning: isDark ? 'text-orange-400' : 'text-orange-600',
    error: isDark ? 'text-red-400' : 'text-red-600',
    info: isDark ? 'text-blue-400' : 'text-blue-600'
  };

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

  // Get available colors with their primary images
  const getAvailableColors = () => {
    if (!product?.variants) return [];
    
    const colorMap = new Map();
    
    product.variants.forEach(variant => {
      if (!colorMap.has(variant.color)) {
        // Find primary image for this color variant
        const primaryImage = variant.variantImages?.find(img => img.isPrimary) || variant.variantImages?.[0];
        if (primaryImage) {
          colorMap.set(variant.color, {
            name: variant.color,
            image: primaryImage.imageUrl,
            variantId: variant.id,
            isAvailable: variant.stock > 0
          });
        }
      }
    });
    
    return Array.from(colorMap.values());
  };

  const availableColors = getAvailableColors();

  // ✅ FIXED: Set initial selected variant when product loads - NO URL UPDATE HERE
  useEffect(() => {
    if (product?.variants?.length > 0) {
      let firstVariant;
      
      // If we have an initial color from URL or navigation state, use that
      if (initialColor) {
        // First try to find an in-stock variant of this color
        const colorVariant = product.variants.find(variant => 
          variant.color === initialColor && variant.stock > 0
        ) || product.variants.find(variant => variant.color === initialColor);
        
        if (colorVariant) {
          firstVariant = colorVariant;
          setSelectedColor(initialColor);
        } else {
          console.log('Color variant not found, using default');
        }
      }
      
      // If no initial color or color variant not found, use first available variant
      if (!firstVariant) {
        firstVariant = product.variants.find(variant => variant.stock > 0) || product.variants[0];
        setSelectedColor(firstVariant?.color);
      }
      
      setSelectedVariant(firstVariant);
      setSelectedSize(firstVariant?.size);
    }
  }, [product, initialColor]); // ✅ Removed searchParams and setSearchParams from dependencies

  // ✅ FIXED: Update URL only when color changes via user interaction, not on initial load
  const updateURLWithColor = (color) => {
    const currentColor = searchParams.get('color');
    
    // Only update if the color actually changed and we're not on initial load
    if (color && currentColor !== color) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('color', color);
      
      // Use replace instead of set to avoid adding to history stack
      setSearchParams(newSearchParams, { replace: true });
    }
  };

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
            size: variant.size,
            variantId: variant.id
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

  // Format price with two decimal places
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Calculate save percentage
  const calculateSavePercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    const saveAmount = originalPrice - currentPrice;
    const savePercentage = (saveAmount / originalPrice) * 100;
    return Math.round(savePercentage);
  };

  // Auth-based pricing logic with customization price
  const getProductPricing = () => {
    if (!product) return { 
      displayPrice: 0, 
      originalPrice: null, 
      priceLabel: '', 
      finalPrice: 0, 
      savePercentage: 0 
    };

    let displayPrice;
    let originalPrice;
    let priceLabel = "";
    let customizationPrice = 0;
    let savePercentage = 0;

    // Add customization price if in design mode
    if (isDesignMode && hasCustomization) {
      customizationPrice = customizationData.data.basePrice || 0;
    }

    if (isWholesaleUser && product.wholesalePrice) {
      displayPrice = product.wholesalePrice;
      originalPrice = product.offerPrice || product.normalPrice;
      priceLabel = "Wholesale";
      savePercentage = calculateSavePercentage(product.normalPrice, displayPrice);
    } else if (product.offerPrice && product.offerPrice < product.normalPrice) {
      displayPrice = product.offerPrice;
      originalPrice = product.normalPrice;
      priceLabel = "Offer";
      savePercentage = calculateSavePercentage(originalPrice, displayPrice);
    } else {
      displayPrice = product.normalPrice;
      originalPrice = null;
      priceLabel = "";
    }

    const finalPrice = displayPrice + customizationPrice;

    return { 
      displayPrice, 
      originalPrice, 
      priceLabel, 
      finalPrice, 
      customizationPrice,
      savePercentage 
    };
  };

  const { 
    displayPrice, 
    originalPrice, 
    priceLabel, 
    finalPrice, 
    customizationPrice,
    savePercentage 
  } = getProductPricing();

  // ✅ FIXED: Handle color selection with proper URL update
  const handleColorSelect = (color) => {
    const newColor = color.name;
    setSelectedColor(newColor);
    
    // Find the best variant for this color (prefer in-stock)
    const variantsForColor = product.variants.filter(v => v.color === newColor);
    const variantForColor = variantsForColor.find(v => v.stock > 0) || variantsForColor[0];
    
    if (variantForColor) {
      setSelectedVariant(variantForColor);
      setSelectedSize(variantForColor?.size);
    }
    
    setActiveImageIndex(0); // Reset to first image when color changes
    
    // ✅ FIXED: Update URL after state is set
    updateURLWithColor(newColor);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const variant = variantsForSelectedColor.find(v => v.size === size);
    if (variant) {
      setSelectedVariant(variant);
      setActiveImageIndex(0); // Reset to first image when size changes
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setAddingToCart(true);
    try {
      // ✅ FIXED: Ensure consistent image structure
      const productImages = variantImages.map(img => img.imageUrl).filter(url => 
        url && !url.includes('via.placeholder.com') && !url.includes('No+Image')
      );
      
      // If no valid images, use placeholder
      const finalImages = productImages.length > 0 ? productImages : ['/images/placeholder-product.jpg'];

      const cartItem = {
        product: {
          _id: product.id,
          name: product.name,
          description: product.description,
          category: product.category?.name || product.category,
          // ✅ FIXED: Use consistent images structure
          images: finalImages,
          image: finalImages[0], // Add main image
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
          // ✅ Add variant image
          image: selectedVariant.image || finalImages[0],
        },
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

  const handleBuyNow = async () => {
    if (!selectedVariant) return;

    try {
      setAddingToCart(true);

      // Use the same image structure as handleAddToCart
      const productImages = variantImages.map(img => img.imageUrl).filter(url => 
        url && !url.includes('via.placeholder.com') && !url.includes('No+Image')
      );
      
      const finalImages = productImages.length > 0 ? productImages : ['/images/placeholder-product.jpg'];

      if (isDesignMode && hasCustomization) {
        const customProduct = {
          id: `custom-${product.id}-${Date.now()}`,
          product: {
            _id: product.id,
            name: `${product.name} (Custom)`,
            description: product.description,
            category: product.category?.name || product.category,
            images: finalImages,
            image: finalImages[0],
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
            image: selectedVariant.image || finalImages[0],
          },
          quantity: quantity,
          customization: {
            designData: designData,
            customizationId: customizationData.data.id,
            customizationPrice: customizationPrice,
            previewImage: null
          },
          isCustom: true
        };

        dispatch(addToCart(customProduct));
      } else {
        const cartItem = {
          id: `${product.id}-${selectedVariant.id}`,
          product: {
            _id: product.id,
            name: product.name,
            description: product.description,
            category: product.category?.name || product.category,
            images: finalImages,
            image: finalImages[0],
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
            image: selectedVariant.image || finalImages[0],
          },
          quantity: quantity,
          price: finalPrice
        };

        dispatch(addToCart(cartItem));
      }

      // Navigate to checkout immediately
      navigate('/checkout');
      
    } catch (error) {
      console.error('Error in Buy Now:', error);
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

  // Stock status
  const isOutOfStock = selectedVariant?.stock === 0;
  const lowStock = selectedVariant?.stock > 0 && selectedVariant?.stock <= 10;

  // Loading state
  if (isLoading || (product?.isCustomizable && isLoadingCustomization)) {
    return (
      <div className={`min-h-screen ${themeColors.bgPrimary} ${themeColors.textPrimary}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`h-96 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
              <div className="space-y-4">
                <div className={`h-8 rounded w-3/4 ${isDark ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
                <div className={`h-6 rounded w-1/2 ${isDark ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
                <div className={`h-20 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen ${themeColors.bgPrimary} ${themeColors.textPrimary}`}>
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
    <div className={`min-h-screen transition-colors duration-500 ${themeColors.bgPrimary} ${themeColors.textPrimary}`}>
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
                        ? `${themeColors.borderActive} ring-2 ${themeColors.ringActive} shadow-lg ${themeColors.shadowActive}`
                        : `${themeColors.borderPrimary} hover:${themeColors.borderHover}`
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                    />
                    {activeImageIndex === index && (
                      <div className={`absolute inset-0 border-2 ${themeColors.borderActive} rounded-lg`}></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Main Image for Mobile */}
              <div 
                className={`relative rounded-lg overflow-hidden cursor-zoom-in ${themeColors.bgSecondary}`}
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
                        ? `${themeColors.borderActive} ring-2 ${themeColors.ringActive} shadow-md`
                        : `${themeColors.borderPrimary} hover:${themeColors.borderHover}`
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 object-cover"
                    />
                    
                    {activeImageIndex === index && (
                      <div className={`absolute inset-0 border-2 ${themeColors.borderActive} rounded-lg`}></div>
                    )}
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200"></div>
                  </button>
                ))}
              </div>

              {/* Main Large Image - RIGHT SIDE */}
              <div className="flex-1">
                <div 
                  className={`relative rounded-lg overflow-hidden cursor-zoom-in ${themeColors.bgSecondary}`}
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

              {!isOutOfStock && (
                <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1.5 sm:mr-2"></span>
                  In Stock
                </span>
              )}
            </div>
          </div>
          
          {/* Product Info - RIGHT SIDE */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Product Title and Category */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2">
                {product.name}
                {selectedColor && (
                  <span className="text-lg sm:text-xl lg:text-2xl ml-2 opacity-75">
                    ({selectedColor})
                  </span>
                )}
              </h1>

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
            </div>

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold">₹{formatPrice(finalPrice)}</span>
                {originalPrice && originalPrice !== finalPrice && (
                  <span className={`text-lg sm:text-xl line-through ${themeColors.textMuted}`}>
                    ₹{formatPrice(originalPrice)}
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
              
              {/* Save Percentage */}
              {savePercentage > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    🎉 You save {savePercentage}% 
                  </span>
                  {originalPrice && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      (₹{formatPrice(originalPrice - displayPrice)})
                    </span>
                  )}
                </div>
              )}
              
              {isWholesaleUser && (
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                  🏷️ Special wholesale pricing applied
                </p>
              )}
            </div>

            {/* Tax and Shipping Info */}
            <div>
              <p className={`font-medium text-sm sm:text-base ${themeColors.success}`}>
                ✅ Inclusive of All Taxes + Free Shipping
              </p>
            </div>

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <p className={`font-medium text-sm sm:text-base ${themeColors.error}`}>Out of Stock</p>
              ) : lowStock ? (
                <p className={`font-medium text-sm sm:text-base ${themeColors.warning}`}>
                  Only {selectedVariant?.stock} left in stock!
                </p>
              ) : (
                <p className={`font-medium text-sm sm:text-base ${themeColors.success}`}>In Stock</p>
              )}
            </div>

            {/* Color Selection with Images */}
            {availableColors.length > 0 && (
              <div>
                <h3 className={`font-semibold mb-3 text-sm sm:text-base ${themeColors.textPrimary}`}>
                  Choose Color: <span className={`font-normal ${themeColors.textSecondary}`}>{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {availableColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                        selectedColor === color.name
                          ? `${themeColors.borderActive} ring-2 ${themeColors.ringActive} shadow-md`
                          : `${themeColors.borderPrimary} hover:${themeColors.borderHover}`
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
                <h3 className={`font-semibold mb-3 text-sm sm:text-base ${themeColors.textPrimary}`}>Choose Size</h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {availableSizes.map(size => {
                    const variant = variantsForSelectedColor.find(v => v.size === size);
                    const isAvailable = variant?.stock > 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && handleSizeSelect(size)}
                        disabled={!isAvailable}
                        className={`px-3 py-2 sm:px-4 sm:py-2 rounded border text-xs sm:text-sm transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : !isAvailable
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : `${themeColors.borderPrimary} ${themeColors.bgCard} ${themeColors.textSecondary} hover:${themeColors.borderHover}`
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
                <label className={`font-semibold text-sm sm:text-base ${themeColors.textPrimary}`}>Quantity:</label>
                <div className={`flex items-center border rounded ${themeColors.borderPrimary}`}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`px-3 py-1 sm:px-3 sm:py-1 text-sm sm:text-base ${
                      quantity <= 1 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : themeColors.btnSecondary
                    }`}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className={`px-3 sm:px-4 py-1 min-w-8 sm:min-w-12 text-center text-sm sm:text-base ${themeColors.textPrimary}`}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedVariant && quantity >= selectedVariant.stock}
                    className={`px-3 py-1 sm:px-3 sm:py-1 text-sm sm:text-base ${
                      (selectedVariant && quantity >= selectedVariant.stock)
                        ? 'bg-gray-300 cursor-not-allowed'
                        : themeColors.btnSecondary
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                      : themeColors.btnPrimary
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
              
              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || addingToCart || !selectedVariant}
                className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  isOutOfStock || addingToCart || !selectedVariant
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {addingToCart ? (
                  <>
                    <span>⏳</span>
                    <span>Processing...</span>
                  </>
                ) : isOutOfStock ? (
                  <>
                    <span>❌</span>
                    <span>Out of Stock</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Buy Now</span>
                  </>
                )}
              </button>
              
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={!user}
                className={`p-2 sm:p-3 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                  isInWishlist
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : `${themeColors.bgCard} ${themeColors.borderPrimary} ${themeColors.textSecondary} hover:${themeColors.borderHover}`
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!user ? "Login to add to wishlist" : isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isInWishlist ? '❤️' : '🤍'}
              </button>
            </div>
            </div>

            {/* Product Specifications */}
            {product.productDetails && product.productDetails.length > 0 && (
              <div className={`pt-4 sm:pt-6 border-t ${themeColors.borderPrimary}`}>
                <h3 className={`font-semibold mb-3 text-sm sm:text-base ${themeColors.textPrimary}`}>Specifications</h3>
                <div className="space-y-1">
                  {product.productDetails.map((detail, index) => (
                    <div key={detail.id || index} className="flex items-center">
                      <span className={`font-semibold text-sm mr-2 ${themeColors.textPrimary}`}>
                        {detail.title}:
                      </span>
                      <span className={`text-sm ${themeColors.textSecondary}`}>
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