import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext"; 
import ProductCard from "../ProductCard/ProductCard";
import { useGetFeaturedProductsQuery } from "../../redux/services/productService";
import { useSelector } from "react-redux";
import CartSidebar from "../layout/CartSidebar"; // Import CartSidebar

export default function FeaturedProducts() {
  const { theme } = useTheme();
  const { data: featuredProductsData, isLoading, error } = useGetFeaturedProductsQuery();
  
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

  // Transform API data to match ProductCard component structure (same as Shop component)
  const transformProductData = (apiProduct) => {
    if (!apiProduct) return null;
    
    
    // Get the first variant's primary image
    const primaryVariant = apiProduct.variants?.[0];
    const primaryImage = primaryVariant?.variantImages?.find(img => img.isPrimary)?.imageUrl || 
                        primaryVariant?.variantImages?.[0]?.imageUrl;
    
    // Calculate if product is in stock (any variant has stock > 0)
    const hasStock = apiProduct.variants?.some(variant => {
      return variant.stock > 0;
    }) || false;
    

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
      // Show wholesale price for wholesale users
      displayPrice = formatPrice(apiProduct.wholesalePrice);
      originalPrice = apiProduct.offerPrice || apiProduct.normalPrice;
      priceLabel = "Wholesale";
    } else if (apiProduct.offerPrice && apiProduct.offerPrice < apiProduct.normalPrice) {
      // Show offer price for retail users when there's a discount
      displayPrice = formatPrice(apiProduct.offerPrice);
      originalPrice = apiProduct.normalPrice;
      priceLabel = "Offer";
    } else {
      // Show normal price
      displayPrice = formatPrice(apiProduct.normalPrice);
      originalPrice = null;
      priceLabel = "";
    }

    return {
      id: apiProduct.id || apiProduct._id,
      title: apiProduct.name || apiProduct.title || "Unnamed Product",
      category: apiProduct.category?.name || apiProduct.category || "Uncategorized",
      price: displayPrice,
      originalPrice: originalPrice,
      priceLabel: priceLabel,
      image: primaryImage,
      // Pass the actual variants array to ProductCard
      variants: apiProduct.variants || [],
      // Use hasStock instead of inStock
      inStock: hasStock,
      // Additional price data for different user types
      normalPrice: apiProduct.normalPrice,
      offerPrice: apiProduct.offerPrice,
      wholesalePrice: apiProduct.wholesalePrice,
      avgRating: apiProduct.avgRating || 0,
      totalRatings: apiProduct.totalRatings || 0,
      // User role info for conditional rendering
      isWholesaleUser: isWholesaleUser,
      // Product flags
      isFeatured: apiProduct.featured || false,
      isNewArrival: apiProduct.isNewArrival || false,
      isBestSeller: apiProduct.isBestSeller || false
    };
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

  const transformedProducts = productsArray
    .map(transformProductData)
    .filter(product => product !== null);

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
          <p className={`${subText} text-sm mt-2`}>
            Error: {error.message || "Unknown error"}
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
      </div>

      {/* Product Grid */}
      {transformedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-16">
          {transformedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onCartUpdate={handleCartUpdate} // Pass the cart update handler
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className={`${textColor} text-lg`}>
            No featured products found at the moment.
          </p>
          <p className={`${subText} text-sm mt-2`}>
            Check back later for new featured products.
          </p>
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