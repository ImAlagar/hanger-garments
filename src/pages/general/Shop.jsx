import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useGetAllProductsQuery } from "../../redux/services/productService";
import ProductCard from "../../components/ProductCard/ProductCard";
import CartSidebar from "../../components/layout/CartSidebar";

export default function Shop() {
  const { category } = useParams();
  const navigate = useNavigate();
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

  // Function to split products by color
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

  // Filter products based on category and split by color
  useEffect(() => {
    if (productsData) {
      let productsArray = [];
      
      if (Array.isArray(productsData)) {
        productsArray = productsData;
      } else if (productsData.data && Array.isArray(productsData.data.products)) {
        productsArray = productsData.data.products;
      } else if (productsData.data && Array.isArray(productsData.data)) {
        productsArray = productsData.data;
      } else if (productsData.products && Array.isArray(productsData.products)) {
        productsArray = productsData.products;
      } else if (productsData.success && Array.isArray(productsData.data)) {
        productsArray = productsData.data;
      }
      
      let filtered = productsArray;
      
      // Filter by category if specified
      if (category && category !== "all") {
        filtered = productsArray.filter((product) => {
          const productCategory = product.category?.name;
          if (!productCategory) return false;
          return productCategory.toLowerCase() === category.toLowerCase();
        });
      }
      
      // Split each product by color
      const colorBasedProducts = filtered.flatMap(product => splitProductsByColor(product));
      
      setFilteredProducts(colorBasedProducts);
    }
  }, [productsData, category, isWholesaleUser]);

  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };

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
          {category ? `${category}'s Collections` : "Our Collections"}
        </h1>
        <div className="text-center">
          <p className="text-red-500 text-lg">
            Failed to load products. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`pb-10 pt-12 px-6 min-h-screen transition-colors duration-500 ${bg} ${text}`}>
 
      {/* Category Specific with Background Images */}
      {category ? (
        <div className="relative rounded-md p-8 md:p-12 mb-12 text-center text-white overflow-hidden">
          <img 
            src={
              category.toLowerCase() === 'men' 
                ? "https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                : category.toLowerCase() === 'women'
                ? "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                : category.toLowerCase() === 'kids'
                ? "https://images.unsplash.com/photo-1519457431-44ccd64a579b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            }
            alt={`${category} Fashion`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-black opacity-40"></div>
          
          <div className="relative z-10 h-96 flex flex-col justify-center items-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/30">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Exclusive Collection</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-3 font-italiana tracking-tight capitalize">
              {category}'s Fashion
            </h2>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-6 leading-relaxed">
              Curated styles designed specifically for {category.toLowerCase()}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">Premium Quality</span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">Latest Trends</span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">Perfect Fit</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-md p-8 md:p-12 mb-12 text-center text-white overflow-hidden xl:h-96">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Complete Fashion Collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-black opacity-40"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center items-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/30">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Complete Catalog</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-3 font-italiana tracking-tight">
              Fashion For Everyone
            </h2>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-6 leading-relaxed">
              Explore our entire collection of premium clothing and accessories
            </p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-10 capitalize">
        {category ? `${category}'s Collections` : "Our Collections"}
      </h1>

      {isWholesaleUser && (
        <div className="text-center mb-6">
          <p className={`${textColor} text-sm bg-blue-100 dark:bg-blue-900 inline-block px-4 py-2 rounded-full`}>
            🏷️ Special wholesale prices for you!
          </p>
        </div>
      )}

      {filteredProducts.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
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