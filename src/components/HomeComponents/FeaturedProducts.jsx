import React, { useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext"; 
import ProductCard from "../ProductCard/ProductCard";
import { useGetFeaturedProductsQuery } from "../../redux/services/productService";
import { useSelector } from "react-redux";
import CartSidebar from "../layout/CartSidebar";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function FeaturedProducts() {
  const { theme } = useTheme();
  const { data: featuredProductsData, isLoading, error } = useGetFeaturedProductsQuery();
  
  // Get user role from Redux store
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // Cart sidebar state
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  
  // Scroll ref for horizontal scrolling
  const scrollRef = useRef(null);

  // Dynamic styles based on theme
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-black" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-400" : "text-gray-600";
  const arrowButtonBg = isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100";
  const arrowButtonText = isDark ? "text-gray-300" : "text-gray-700";
  const arrowButtonBorder = isDark ? "border-gray-700" : "border-gray-300";

  // Cart update handler
  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
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
        subcategory: apiProduct.subcategory?.name || apiProduct.subcategory || "",
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
        ratings: apiProduct.ratings || [],
        selectedColor: color // Crucial for passing to details page
      };
    });
  };

  // Handle different possible response structures (same as Shop component)
  let productsArray = [];
  if (featuredProductsData) {
    if (Array.isArray(featuredProductsData)) {
      productsArray = featuredProductsData;
    } else if (featuredProductsData.data && Array.isArray(featuredProductsData.data.products)) {
      productsArray = featuredProductsData.data.products;
    } else if (featuredProductsData.data && Array.isArray(featuredProductsData.data)) {
      productsArray = featuredProductsData.data;
    } else if (featuredProductsData.products && Array.isArray(featuredProductsData.products)) {
      productsArray = featuredProductsData.products;
    } else if (featuredProductsData.success && Array.isArray(featuredProductsData.data)) {
      productsArray = featuredProductsData.data;
    }
  }

  // Split each product by color
  const colorBasedProducts = productsArray.flatMap(product => splitProductsByColor(product));

  // Loading state
  if (isLoading) {
    return (
      <section className={`py-12 transition-colors duration-500 ${bgColor}`}>
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className={`text-4xl md:text-5xl font-italiana tracking-widest font-bold ${textColor}`}>
            FEATURED PRODUCTS
          </h2>
          <div className="w-40 h-[2px] bg-red-500 mx-auto mt-2"></div>
        </div>
        <div className="relative px-4 md:px-8 lg:px-16">
          {/* Left Arrow Placeholder */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-300 dark:bg-gray-700 rounded-full opacity-50">
            <ArrowLeft className="h-6 w-6" />
          </div>
          
          {/* Products Grid Placeholder */}
          <div className="flex space-x-4 overflow-x-auto pb-4 px-8">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64 md:w-72 animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 rounded-lg aspect-square"></div>
                <div className="mt-2 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Arrow Placeholder */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-300 dark:bg-gray-700 rounded-full opacity-50">
            <ArrowRight className="h-6 w-6" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`py-12 transition-colors duration-500 ${bgColor}`}>
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className={`text-4xl md:text-5xl font-italiana tracking-widest font-bold ${textColor}`}>
            FEATURED PRODUCTS
          </h2>
          <div className="w-40 h-[2px] bg-red-500 mx-auto mt-2"></div>
        </div>
        <div className="text-center">
          <p className={`${textColor} text-lg`}>
            Failed to load featured products. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 transition-colors duration-500 ${bgColor}`}>
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className={`text-4xl md:text-5xl font-italiana tracking-widest font-bold ${textColor}`}>
          FEATURED PRODUCTS
        </h2>
        <div className="w-40 h-[2px] bg-red-500 mx-auto mt-2"></div>
        {isWholesaleUser && (
          <p className={`${textColor} mt-2 text-sm bg-blue-100 dark:bg-blue-900 inline-block px-4 py-2 rounded-full`}>
            🏷️ Special wholesale prices for you!
          </p>
        )}
        
        {/* Show color-based product info */}
        {colorBasedProducts.length > 0 && (
          <p className={`${subText} mt-3 text-sm`}>
            Showing {colorBasedProducts.length} color variants
          </p>
        )}
      </div>

      {/* Product Horizontal Scroller */}
      {colorBasedProducts.length > 0 ? (
        <>
          <div className="relative px-4 md:px-8 lg:px-16">
            {/* Left Arrow - Show only if there are items to scroll to */}
            {colorBasedProducts.length > 4 && (
              <button
                onClick={scrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 ${arrowButtonBg} ${arrowButtonText} rounded-full shadow-lg border ${arrowButtonBorder} hover:shadow-xl transition-all duration-300`}
                aria-label="Scroll left"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}

            {/* Products Horizontal Scroller */}
            <div
              ref={scrollRef}
              className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {colorBasedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-64 md:w-72 lg:w-80"
                >
                  <ProductCard 
                    product={product} 
                    onCartUpdate={handleCartUpdate}
                    selectedColor={product.selectedColor}
                  />
                </div>
              ))}
            </div>

            {/* Right Arrow - Show only if there are items to scroll to */}
            {colorBasedProducts.length > 4 && (
              <button
                onClick={scrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 ${arrowButtonBg} ${arrowButtonText} rounded-full shadow-lg border ${arrowButtonBorder} hover:shadow-xl transition-all duration-300`}
                aria-label="Scroll right"
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Scroll Indicator Dots */}
          {colorBasedProducts.length > 4 && (
            <div className="flex justify-center mt-6 space-x-2">
              {[...Array(Math.min(4, Math.ceil(colorBasedProducts.length / 4)))].map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (scrollRef.current) {
                      const scrollAmount = scrollRef.current.offsetWidth * index;
                      scrollRef.current.scrollTo({
                        left: scrollAmount,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isDark ? 'bg-gray-600 hover:bg-gray-400' : 'bg-gray-300 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* View All Products Button */}
          {productsArray.length > 0 && (
            <div className="flex justify-center mt-12">
              <Link 
                to="/shop" 
                className={`
                  px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 
                  transform hover:scale-105 active:scale-95 border-2
                  ${isDark 
                    ? 'bg-transparent border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white' 
                    : 'bg-transparent border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                  }
                  shadow-lg hover:shadow-xl
                `}
              >
                View All Products
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className={`${textColor} text-lg`}>
            No featured products found at the moment.
          </p>
          <p className={`${subText} text-sm mt-2`}>
            Check back later for new featured products.
          </p>
          
          {/* Show View All Products button even when no featured products */}
          {productsArray.length === 0 && (
            <div className="flex justify-center mt-8">
              <Link 
                to="/shop" 
                className={`
                  px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 
                  transform hover:scale-105 active:scale-95 border-2
                  ${isDark 
                    ? 'bg-transparent border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white' 
                    : 'bg-transparent border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                  }
                  shadow-lg hover:shadow-xl
                `}
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
    </section>
  );
}