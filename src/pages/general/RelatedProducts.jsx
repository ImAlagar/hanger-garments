import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useGetRelatedProductsQuery } from '../../redux/services/productService';
import ProductCard from '../../components/ProductCard/ProductCard';

const RelatedProducts = ({ currentProduct, category }) => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const autoScrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const isDark = theme === "dark";
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  const { data: relatedProductsData, isLoading, error } = useGetRelatedProductsQuery({
    category,
    excludeProductId: currentProduct?.id
  }, {
    skip: !category
  });

  // Handle different response structures
  let relatedProducts = [];
  if (relatedProductsData) {
    if (Array.isArray(relatedProductsData)) {
      relatedProducts = relatedProductsData;
    } else if (relatedProductsData.data && Array.isArray(relatedProductsData.data.products)) {
      relatedProducts = relatedProductsData.data.products;
    } else if (relatedProductsData.products && Array.isArray(relatedProductsData.products)) {
      relatedProducts = relatedProductsData.products;
    } else if (Array.isArray(relatedProductsData.data)) {
      relatedProducts = relatedProductsData.data;
    }
  }

  // Transform products for ProductCard
  const transformProductData = (apiProduct) => {
    if (!apiProduct) return null;

    const primaryVariant = apiProduct.variants?.[0];
    const primaryImage = primaryVariant?.variantImages?.find(img => img.isPrimary)?.imageUrl || 
                        primaryVariant?.variantImages?.[0]?.imageUrl;
    
    const hasStock = apiProduct.variants?.some(variant => variant.stock > 0) || false;

    // Auth-based pricing
    let displayPrice;
    let originalPrice;
    let priceLabel = "";

    if (isWholesaleUser && apiProduct.wholesalePrice) {
      displayPrice = apiProduct.wholesalePrice;
      originalPrice = apiProduct.offerPrice || apiProduct.normalPrice;
      priceLabel = "Wholesale";
    } else if (apiProduct.offerPrice && apiProduct.offerPrice < apiProduct.normalPrice) {
      displayPrice = apiProduct.offerPrice;
      originalPrice = apiProduct.normalPrice;
      priceLabel = "Offer";
    } else {
      displayPrice = apiProduct.normalPrice;
      originalPrice = null;
      priceLabel = "";
    }

    return {
      id: apiProduct.id,
      title: apiProduct.name,
      category: apiProduct.category?.name || apiProduct.category,
      price: displayPrice,
      originalPrice: originalPrice,
      priceLabel: priceLabel,
      image: primaryImage,
      variants: apiProduct.variants || [],
      inStock: hasStock,
      normalPrice: apiProduct.normalPrice,
      offerPrice: apiProduct.offerPrice,
      wholesalePrice: apiProduct.wholesalePrice,
      isWholesaleUser: isWholesaleUser,
      avgRating: apiProduct.avgRating || 0,
      totalRatings: apiProduct.totalRatings || 0
    };
  };

  const transformedProducts = relatedProducts
    .map(transformProductData)
    .filter(product => product !== null && product.id !== currentProduct?.id)
    .slice(0, 8);

  // Calculate visible items based on container width
  const getVisibleItemsCount = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1;  // mobile
    if (width < 768) return 2;  // tablet
    if (width < 1024) return 3; // small desktop
    return 4; // large desktop
  }, []);

  // Scroll to specific slide
  const scrollToSlide = useCallback((slideIndex) => {
    if (!scrollContainerRef.current || transformedProducts.length === 0) return;

    const container = scrollContainerRef.current;
    const cardWidth = 256; // w-64 = 256px
    const gap = 24; // space-x-6 = 24px
    const visibleItems = getVisibleItemsCount();
    const maxSlide = Math.max(0, transformedProducts.length - visibleItems);
    
    const targetSlide = Math.min(slideIndex, maxSlide);
    const scrollPosition = targetSlide * (cardWidth + gap);
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
    
    setCurrentSlide(targetSlide);
    updateScrollButtons();
  }, [transformedProducts.length, getVisibleItemsCount]);

  // Update scroll button states
  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current || transformedProducts.length === 0) return;
    
    const container = scrollContainerRef.current;
    const visibleItems = getVisibleItemsCount();
    const maxSlide = Math.max(0, transformedProducts.length - visibleItems);
    
    setCanScrollLeft(currentSlide > 0);
    setCanScrollRight(currentSlide < maxSlide);
  }, [currentSlide, transformedProducts.length, getVisibleItemsCount]);

  // Scroll functions
  const scrollPrev = useCallback(() => {
    scrollToSlide(currentSlide - 1);
  }, [currentSlide, scrollToSlide]);

  const scrollNext = useCallback(() => {
    scrollToSlide(currentSlide + 1);
  }, [currentSlide, scrollToSlide]);

  // Auto-scroll function
  const startAutoScroll = useCallback(() => {
    if (isPaused || transformedProducts.length === 0) return;
    
    const visibleItems = getVisibleItemsCount();
    const maxSlide = Math.max(0, transformedProducts.length - visibleItems);
    
    if (currentSlide >= maxSlide) {
      // Go back to first slide
      scrollToSlide(0);
    } else {
      // Go to next slide
      scrollToSlide(currentSlide + 1);
    }
  }, [currentSlide, isPaused, transformedProducts.length, scrollToSlide, getVisibleItemsCount]);

  // Initialize and cleanup
  useEffect(() => {
    updateScrollButtons();
    
    const handleResize = () => {
      updateScrollButtons();
    };

    window.addEventListener('resize', handleResize);
    
    // Start auto-scroll
    if (transformedProducts.length > 0) {
      autoScrollRef.current = setInterval(startAutoScroll, 4000);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [transformedProducts.length, startAutoScroll, updateScrollButtons]);

  // Handle scroll events for button visibility
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Mouse event handlers
  const handleMouseEnter = () => {
    setIsPaused(true);
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (transformedProducts.length > 0) {
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
      setIsPaused(false);
      if (transformedProducts.length > 0) {
        autoScrollRef.current = setInterval(startAutoScroll, 4000);
      }
    }, 3000);
  };

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

  if (error || transformedProducts.length === 0) {
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
            onScroll={handleScroll}
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
            {transformedProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-64 transition-transform duration-300 hover:scale-105"
              >
                <ProductCard
                  product={product}
                  onCartUpdate={() => {}}
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
        {transformedProducts.length > 4 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(transformedProducts.length / getVisibleItemsCount()) }).map((_, index) => (
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
      </div>
    </section>
  );
};

export default RelatedProducts;