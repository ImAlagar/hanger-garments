import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useGetAllProductsQuery } from "../../redux/services/productService";
import ProductCard from "../../components/ProductCard/ProductCard";
import CartSidebar from "../../components/layout/CartSidebar";

export default function Shop() {
  const { category } = useParams();
  const { theme } = useTheme();
  
  // Get user role from Redux store
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // Use RTK Query hook to fetch all products
  const { data: productsData, isLoading, error } = useGetAllProductsQuery();
  
  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState([]);


  const [showCartSidebar, setShowCartSidebar] = useState(false);



  // Filter products based on category
  useEffect(() => {
    if (productsData) {
      
      // Handle different possible response structures
      let productsArray = [];
      
      if (Array.isArray(productsData)) {
        // If response is directly an array
        productsArray = productsData;
      } else if (productsData.data && Array.isArray(productsData.data.products)) {
        // If response has data.products property (your case)
        productsArray = productsData.data.products;
      } else if (productsData.data && Array.isArray(productsData.data)) {
        // If response has data property that's an array
        productsArray = productsData.data;
      } else if (productsData.products && Array.isArray(productsData.products)) {
        // If response has products property
        productsArray = productsData.products;
      } else if (productsData.success && Array.isArray(productsData.data)) {
        // If response has success and data properties
        productsArray = productsData.data;
      }
      
      
      let filtered = productsArray;
      
      // Filter by category if specified
      if (category && category !== "all") {
        filtered = productsArray.filter((product) => {
          const productCategory = product.category?.name;
          if (!productCategory) return false;
          
          // Compare both in lowercase for case-insensitive matching
          return productCategory.toLowerCase() === category.toLowerCase();
        });
      }
      
      setFilteredProducts(filtered);
    }
  }, [productsData, category]);

  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };  

  // Transform API data to match ProductCard component structure
  const transformProductData = (apiProduct) => {
    if (!apiProduct) return null;
    
    // Get the first variant's primary image
    const primaryVariant = apiProduct.variants?.[0];
    const primaryImage = primaryVariant?.variantImages?.find(img => img.isPrimary)?.imageUrl || 
                        primaryVariant?.variantImages?.[0]?.imageUrl;
    
    // FIXED: Calculate if product is in stock (any variant has stock > 0)
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
      // FIXED: Pass the actual variants array to ProductCard
      variants: apiProduct.variants || [],
      // FIXED: Use hasStock instead of inStock
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

  const transformedProducts = filteredProducts
    .map(transformProductData)
    .filter(product => product !== null);

  // 🎨 Theme-based colors
  const isDark = theme === "dark";
  const bg = isDark ? "bg-black" : "bg-white";
  const text = isDark ? "text-white" : "text-black";
  const textColor = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-400" : "text-gray-600";

  // Loading state
  if (isLoading) {
    return (
      <section className={`pb-10 pt-12 px-6 min-h-screen transition-colors duration-500 ${bg} ${text}`}>
        <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-10 capitalize">
          {category ? `${category}'s Collections` : "All Products"}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, index) => (
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
      <section className={`pb-10 pt-12 px-6 min-h-screen transition-colors duration-500 ${bg} ${text}`}>
        <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-10 capitalize">
          {category ? `${category}'s Collections` : "All Products"}
        </h1>
        <div className="text-center">
          <p className="text-red-500 text-lg">
            Failed to load products. Please try again later.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Error: {error.message || "Unknown error"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`pb-10 pt-12 px-6 min-h-screen transition-colors duration-500 ${bg} ${text}`}>
      <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-10 capitalize">
        {category ? `${category}'s Collections` : "All Products"}
      </h1>

      {isWholesaleUser && (
        <div className="text-center mb-6">
          <p className={`${textColor} text-sm bg-blue-100 dark:bg-blue-900 inline-block px-4 py-2 rounded-full`}>
            🏷️ Special wholesale prices for you!
          </p>
        </div>
      )}

      {transformedProducts.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">
            No products found {category && category !== "all" ? `in ${category} category` : ""}.
          </p>
          <p className="text-gray-400 text-sm">
            {productsData ? "Try checking another category or check if products exist." : "Products data is not available."}
          </p>
        </div>
      ) : (
        <>


          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {transformedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onCartUpdate={handleCartUpdate}
              />
            ))}
          </div>

          <CartSidebar 
          isOpen={showCartSidebar} 
          onClose={() => setShowCartSidebar(false)} 
        />
        </>
      )}
    </section>
  );
}