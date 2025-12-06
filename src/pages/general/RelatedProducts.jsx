import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useGetRelatedProductsQuery } from '../../redux/services/productService';
import ProductCard from '../../components/ProductCard/ProductCard';
import CartSidebar from '../../components/layout/CartSidebar';

const RelatedProducts = ({ currentProduct, category }) => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const autoScrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Add Cart Sidebar state
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  
  const isDark = theme === "dark";
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  const { data: relatedProductsData, isLoading, error } = useGetRelatedProductsQuery({
    category,
    excludeProductId: currentProduct?.id
  }, {
    skip: !category
  });

  // Cart update handler
  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };

  // Function to split products by color (same as in Shop page)
  const splitProductsByColor = (apiProduct) => {
    if (!apiProduct || !apiProduct.variants) return [];
    
    const colorGroups = {};
    
    // Group variants by color
    apiProduct.variants.forEach(variant => {
      const color = variant.color || 'Default';
      if (!colorGroups[color]) {
        colorGroups[color] = {
          variants: [],
          variantImages: []
        };
      }
      colorGroups[color].variants.push(variant);
      
      // Collect unique images for this color
      if (variant.variantImages) {
        variant.variantImages.forEach(img => {
          if (!colorGroups[color].variantImages.some(existing => existing.imageUrl === img.imageUrl)) {
            colorGroups[color].variantImages.push(img);
          }
        });
      }
    });
    
    // Create separate product objects for each color
    return Object.entries(colorGroups).map(([color, colorData]) => {
      const primaryImage = colorData.variantImages.find(img => img.isPrimary)?.imageUrl || 
                          colorData.variantImages[0]?.imageUrl;
      
      // Calculate if this color has any stock
      const hasStock = colorData.variants.some(variant => variant.stock > 0);
      
      // Get available sizes for this color
      const availableSizes = colorData.variants
        .filter(variant => variant.stock > 0)
        .map(variant => variant.size);
      
      // Format price with currency symbol
      const formatPrice = (price) => {
        if (price === undefined || price === null) return "₹0";
        return `₹${price}`;
      };

      // Determine which price to show based on user role
      let displayPrice;
      let originalPrice;
      let priceLabel = "";

      if (isWholesaleUser && apiProduct.wholesalePrice) {
        displayPrice = formatPrice(apiProduct.wholesalePrice);
        originalPrice = apiProduct.offerPrice || apiProduct.normalPrice;
        priceLabel = "Wholesale";
      } else if (apiProduct.offerPrice && apiProduct.offerPrice < apiProduct.normalPrice) {
        displayPrice = formatPrice(apiProduct.offerPrice);
        originalPrice = apiProduct.normalPrice;
        priceLabel = "Offer";
      } else {
        displayPrice = formatPrice(apiProduct.normalPrice);
        originalPrice = null;
        priceLabel = "";
      }

      return {
        id: `${apiProduct.id || apiProduct._id}-${color}`,
        baseProductId: apiProduct.id || apiProduct._id,
        title: apiProduct.name || apiProduct.title || "Unnamed Product",
        displayTitle: `${apiProduct.name || apiProduct.title || "Unnamed Product"} (${color})`,
        color: color,
        category: apiProduct.category?.name || apiProduct.category || "Uncategorized",
        price: displayPrice,
        originalPrice: originalPrice,
        priceLabel: priceLabel,
        image: primaryImage,
        variants: colorData.variants,
        variantImages: colorData.variantImages,
        inStock: hasStock,
        availableSizes: availableSizes,
        normalPrice: apiProduct.normalPrice,
        offerPrice: apiProduct.offerPrice,
        wholesalePrice: apiProduct.wholesalePrice,
        avgRating: apiProduct.avgRating || 0,
        totalRatings: apiProduct.totalRatings || 0,
        isWholesaleUser: isWholesaleUser,
        isFeatured: apiProduct.featured || false,
        isNewArrival: apiProduct.isNewArrival || false,
        isBestSeller: apiProduct.isBestSeller || false,
        productDetails: apiProduct.productDetails || [],
        description: apiProduct.description,
        subcategory: apiProduct.subcategory,
        ratings: apiProduct.ratings || [],
        selectedColor: color // Crucial for passing to details page
      };
    });
  };

  // Handle different response structures and split by color
  let relatedProducts = [];
  if (relatedProductsData) {
    let productsArray = [];
    
    if (Array.isArray(relatedProductsData)) {
      productsArray = relatedProductsData;
    } else if (relatedProductsData.data && Array.isArray(relatedProductsData.data.products)) {
      productsArray = relatedProductsData.data.products;
    } else if (relatedProductsData.products && Array.isArray(relatedProductsData.products)) {
      productsArray = relatedProductsData.products;
    } else if (Array.isArray(relatedProductsData.data)) {
      productsArray = relatedProductsData.data;
    } else if (relatedProductsData.success && Array.isArray(relatedProductsData.data)) {
      productsArray = relatedProductsData.data;
    }
    
    // Split each product by color and filter out current product
    const colorBasedProducts = productsArray
      .filter(product => product.id !== currentProduct?.id && product._id !== currentProduct?.id)
      .flatMap(product => splitProductsByColor(product));
    
    relatedProducts = colorBasedProducts;
  }

  // Calculate visible items based on container width
  const getVisibleItemsCount = useCallback(() => {
    if (!mounted || typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1;  // mobile
    if (width < 768) return 2;  // tablet
    if (width < 1024) return 3; // small desktop
    return 4; // large desktop
  }, [mounted]);

  // Handle scroll events for button visibility
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !mounted) return;
    
    try {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    } catch (err) {
      // Ignore scroll errors during unmounting
    }
  }, [mounted]);

  // Scroll to specific slide
  const scrollToSlide = useCallback((slideIndex) => {
    if (!scrollContainerRef.current || relatedProducts.length === 0 || !mounted) return;

    try {
      const container = scrollContainerRef.current;
      const cardWidth = 256; // w-64 = 256px
      const gap = 24; // space-x-6 = 24px
      const visibleItems = getVisibleItemsCount();
      const maxSlide = Math.max(0, relatedProducts.length - visibleItems);
      
      const targetSlide = Math.min(slideIndex, maxSlide);
      const scrollPosition = targetSlide * (cardWidth + gap);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setCurrentSlide(targetSlide);
      updateScrollButtons();
    } catch (err) {
      // Ignore scroll errors during unmounting
    }
  }, [relatedProducts.length, getVisibleItemsCount, mounted]);

  // Update scroll button states
  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current || relatedProducts.length === 0 || !mounted) return;
    
    try {
      const container = scrollContainerRef.current;
      const visibleItems = getVisibleItemsCount();
      const maxSlide = Math.max(0, relatedProducts.length - visibleItems);
      
      setCanScrollLeft(currentSlide > 0);
      setCanScrollRight(currentSlide < maxSlide);
    } catch (err) {
      // Ignore errors during unmounting
    }
  }, [currentSlide, relatedProducts.length, getVisibleItemsCount, mounted]);

  // Scroll functions
  const scrollPrev = useCallback(() => {
    scrollToSlide(currentSlide - 1);
  }, [currentSlide, scrollToSlide]);

  const scrollNext = useCallback(() => {
    scrollToSlide(currentSlide + 1);
  }, [currentSlide, scrollToSlide]);

  // Auto-scroll function
  const startAutoScroll = useCallback(() => {
    if (isPaused || relatedProducts.length === 0 || !mounted) return;
    
    try {
      const visibleItems = getVisibleItemsCount();
      const maxSlide = Math.max(0, relatedProducts.length - visibleItems);
      
      if (currentSlide >= maxSlide) {
        // Go back to first slide
        scrollToSlide(0);
      } else {
        // Go to next slide
        scrollToSlide(currentSlide + 1);
      }
    } catch (err) {
      // Ignore auto-scroll errors
    }
  }, [currentSlide, isPaused, relatedProducts.length, scrollToSlide, getVisibleItemsCount, mounted]);

  // Mouse event handlers
  const handleMouseEnter = () => {
    setIsPaused(true);
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (relatedProducts.length > 0 && mounted) {
      autoScrollRef.current = setInterval(startAutoScroll, 4000);
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = () => {
    setIsPaused(true);
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  const handleTouchEnd = () => {
    // Restart auto-scroll after a delay
    setTimeout(() => {
      if (!mounted) return;
      setIsPaused(false);
      if (relatedProducts.length > 0) {
        autoScrollRef.current = setInterval(startAutoScroll, 4000);
      }
    }, 3000);
  };

  // Set mounted state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Setup scroll event listener
  useEffect(() => {
    if (!mounted) return;
    
    const container = scrollContainerRef.current;
    if (container) {
      const scrollHandler = () => handleScroll();
      container.addEventListener('scroll', scrollHandler);
      return () => {
        if (container) {
          container.removeEventListener('scroll', scrollHandler);
        }
      };
    }
  }, [handleScroll, mounted]);

  // Initialize and cleanup
  useEffect(() => {
    if (!mounted) return;
    
    updateScrollButtons();
    
    const handleResize = () => {
      if (mounted) {
        updateScrollButtons();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Start auto-scroll
    if (relatedProducts.length > 0) {
      autoScrollRef.current = setInterval(startAutoScroll, 4000);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [relatedProducts.length, startAutoScroll, updateScrollButtons, mounted]);

  if (isLoading) {
    return (
      <section className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Similar Products
          </h2>
          <div className="flex space-x-6 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64 animate-pulse">
                <div className={`rounded-lg aspect-square ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className="mt-4 space-y-2">
                  <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'} w-3/4`}></div>
                  <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'} w-1/2`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            SIMILAR PRODUCTS
          </h2>
          
          {/* Navigation Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full transition-all duration-200 ${
                canScrollLeft
                  ? isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white cursor-pointer'
                    : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 cursor-pointer'
                  : isDark
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={scrollNext}
              disabled={!canScrollRight}
              className={`p-2 rounded-full transition-all duration-200 ${
                canScrollRight
                  ? isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white cursor-pointer'
                    : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 cursor-pointer'
                  : isDark
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
          >
            {relatedProducts.map((product) => (
              <div
                key={`${product.id}-${product.color}`}
                className="flex-shrink-0 w-80 transition-transform duration-300"
              >
                <ProductCard
                  product={product}
                  onCartUpdate={handleCartUpdate}
                  selectedColor={product.selectedColor}
                />
              </div>
            ))}
          </div>

          {/* Gradient Overlays */}
          <div className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-r ${
            isDark ? 'from-gray-900' : 'from-white'
          } ${!canScrollLeft && 'opacity-0'}`} />
          
          <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l ${
            isDark ? 'from-gray-900' : 'from-white'
          } ${!canScrollRight && 'opacity-0'}`} />
        </div>

        {/* Progress Dots */}
        {relatedProducts.length > 4 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(relatedProducts.length / getVisibleItemsCount()) }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index * getVisibleItemsCount())}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentSlide / getVisibleItemsCount()) === index
                    ? isDark ? 'bg-white w-6' : 'bg-gray-900 w-6'
                    : isDark ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Wholesale User Badge */}
        {isWholesaleUser && (
          <div className="text-center mt-4">
            <p className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm bg-blue-100 dark:bg-blue-900 inline-block px-4 py-2 rounded-full`}>
              🏷️ Special wholesale prices for you!
            </p>
          </div>
        )}
      </div>

      {/* Add Cart Sidebar at the bottom */}
      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
    </section>
  );
};

export default RelatedProducts;