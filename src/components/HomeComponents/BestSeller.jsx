import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext"; 
import ProductCard from "../ProductCard/ProductCard";
import { useGetBestSellersQuery } from "../../redux/services/productService";
import { useSelector } from "react-redux";
import CartSidebar from "../layout/CartSidebar";
import { Link } from "react-router-dom";

export default function BestSeller() {
  const { theme } = useTheme();
  const { data: bestSellersData, isLoading, error } = useGetBestSellersQuery();
  
  // Get user role from Redux store
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // Cart sidebar state
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  // Dynamic styles based on theme
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-black" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-400" : "text-gray-600";

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

  // Handle different possible response structures
  let productsArray = [];
  
  if (bestSellersData) {
    // Case 1: Direct array of products
    if (Array.isArray(bestSellersData)) {
      productsArray = bestSellersData;
    }
    // Case 2: Nested data.products structure (most common)
    else if (bestSellersData.data && Array.isArray(bestSellersData.data.products)) {
      productsArray = bestSellersData.data.products;
    }
    // Case 3: Nested data array
    else if (bestSellersData.data && Array.isArray(bestSellersData.data)) {
      productsArray = bestSellersData.data;
    }
    // Case 4: Direct products property
    else if (bestSellersData.products && Array.isArray(bestSellersData.products)) {
      productsArray = bestSellersData.products;
    }
    // Case 5: Success with data array
    else if (bestSellersData.success && Array.isArray(bestSellersData.data)) {
      productsArray = bestSellersData.data;
    }
    // Case 6: Check if there's a bestSellers property
    else if (bestSellersData.bestSellers && Array.isArray(bestSellersData.bestSellers)) {
      productsArray = bestSellersData.bestSellers;
    }
    // Case 7: Check if data itself is an object with bestSellers
    else if (bestSellersData.data && bestSellersData.data.bestSellers && Array.isArray(bestSellersData.data.bestSellers)) {
      productsArray = bestSellersData.data.bestSellers;
    }
    else {
      // Last resort: try to find any array in the response
      for (let key in bestSellersData) {
        if (Array.isArray(bestSellersData[key])) {
          productsArray = bestSellersData[key];
          break;
        }
      }
    }
  }

  // Split each product by color and limit to maximum 8 color-based products
  const colorBasedProducts = productsArray
    .flatMap(product => splitProductsByColor(product))
    .slice(0, 8); // Limit to 8 color-based products

  // Loading state
  if (isLoading) {
    return (
      <section className={`py-12 transition-colors duration-500 ${bgColor}`}>
        <div className="text-center mb-10">
          <h2 className={`text-4xl md:text-5xl font-italiana tracking-widest font-bold ${textColor}`}>
            BESTSELLER
          </h2>
          <div className="w-20 h-[2px] bg-red-500 mx-auto mt-2"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-16">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 rounded-lg aspect-square"></div>
              <div className="mt-2 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`py-12 transition-colors duration-500 ${bgColor}`}>
        <div className="text-center mb-10">
          <h2 className={`text-4xl md:text-5xl font-italiana tracking-widest font-bold ${textColor}`}>
            BESTSELLER
          </h2>
          <div className="w-20 h-[2px] bg-red-500 mx-auto mt-2"></div>
        </div>
        <div className="text-center">
          <p className={`${textColor} text-lg`}>
            Failed to load best sellers. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 transition-colors duration-500 ${bgColor}`}>
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className={`text-4xl md:text-5xl font-italiana tracking-widest font-bold ${textColor}`}>
          BESTSELLER
        </h2>
        <div className="w-20 h-[2px] bg-red-500 mx-auto mt-2"></div>
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

      {/* Product Grid */}
      {colorBasedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 px-6 md:px-16">
            {colorBasedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onCartUpdate={handleCartUpdate}
                selectedColor={product.selectedColor} // Pass color info
              />
            ))}
          </div>

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
            {bestSellersData ? "No best sellers found at the moment." : "Failed to load best sellers."}
          </p>
          <p className={`${subText} text-sm mt-2`}>
            Check back later for new best sellers.
          </p>
          
          {/* Show View All Products button even when no bestsellers */}
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