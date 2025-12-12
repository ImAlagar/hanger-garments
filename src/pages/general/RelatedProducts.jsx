import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useGetRelatedProductsQuery } from '../../redux/services/productService';
import ProductCard from '../../components/ProductCard/ProductCard';
import CartSidebar from '../../components/layout/CartSidebar';
import { motion } from 'framer-motion';

const RelatedProducts = ({ currentProduct, category }) => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
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

  // Duplicate products for seamless infinite scroll (same as Salon section)
  const duplicatedProducts = [...relatedProducts, ...relatedProducts];

  // Mouse event handlers to pause animation
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    // Restart animation after a delay
    setTimeout(() => {
      if (!mounted) return;
      setIsPaused(false);
    }, 3000);
  };

  // Set mounted state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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
        {/* Heading */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-10 items-start lg:items-center w-full mb-8">
          <div className="relative">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              SIMILAR PRODUCTS
            </h2>
            <div className={`absolute w-12 h-[1px] ${isDark ? 'bg-white' : 'bg-gray-900'} -top-1`}></div>
          </div>
          
          <div className="max-w-lg">
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Explore similar items that match your style and preferences
            </p>
          </div>
        </div>

        {/* Continuous Horizontal Scroll Track */}
        <div 
          className="mt-6 relative w-full overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            className="flex gap-4 lg:gap-6"
            animate={{ 
              x: ["0%", "-100%"] 
            }}
            transition={{
              ease: "linear",
              duration: relatedProducts.length * 15, // Adjust speed based on items count
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 0,
            }}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {duplicatedProducts.map((product, index) => (
              <div
                key={`${product.id}-${product.color}-${index}`}
                className="flex-shrink-0 w-64 lg:w-72"
              >
                <ProductCard
                  product={product}
                  onCartUpdate={handleCartUpdate}
                  selectedColor={product.selectedColor}
                />
              </div>
            ))}
          </motion.div>

          {/* Gradient Overlays (optional) */}
          <div className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-r ${
            isDark ? 'from-gray-900 via-gray-900/80 to-transparent' : 'from-white via-white/80 to-transparent'
          }`} />
          
          <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l ${
            isDark ? 'from-gray-900 via-gray-900/80 to-transparent' : 'from-white via-white/80 to-transparent'
          }`} />
        </div>

        {/* Wholesale User Badge */}
        {isWholesaleUser && (
          <div className="text-center mt-8">
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