import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tshirtCategories, motionVariants } from '../../constants/headerConstants';
import { useGetAllProductsQuery } from '../../redux/services/productService';
import ProductCard from '../../components/ProductCard/ProductCard';
import CartSidebar from '../../components/layout/CartSidebar';
import { useSelector } from 'react-redux';

const Collections = () => {
  const [activeCategory, setActiveCategory] = useState('Men');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  // Get user role from Redux store
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  const { data: productsData, isLoading, error } = useGetAllProductsQuery({
    category: activeCategory === 'All' ? '' : activeCategory
  });

  // Function to split products by color (same as in other components)
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

  // Transform API data to match ProductCard expectations with auth-based pricing
  const transformProductData = (products) => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    // Split each product by color
    const colorBasedProducts = products.flatMap(product => splitProductsByColor(product));
    
    return colorBasedProducts;
  };

  // Filter products when category changes or data loads
  useEffect(() => {
    // Try different possible data structures
    let productsArray = [];
    
    if (productsData?.data?.products) {
      productsArray = productsData.data.products;
    } else if (productsData?.products) {
      productsArray = productsData.products;
    } else if (Array.isArray(productsData?.data)) {
      productsArray = productsData.data;
    } else if (Array.isArray(productsData)) {
      productsArray = productsData;
    }
        
    if (productsArray.length > 0) {
      const transformedProducts = transformProductData(productsArray);
      
      if (activeCategory === 'All') {
        setFilteredProducts(transformedProducts);
      } else {
        const filtered = transformedProducts.filter(product => {
          const productCategory = product.category?.toLowerCase();
          const activeCategoryLower = activeCategory.toLowerCase();
          const matches = productCategory === activeCategoryLower;
          return matches;
        });
        setFilteredProducts(filtered);
      }
    } else {
      setFilteredProducts([]);
    }
  }, [productsData, activeCategory, isWholesaleUser]);

  // Handle cart update from ProductCard
  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500 text-lg">
          Error loading products: {error?.data?.message || 'Please try again later'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-4xl md:text-5xl font-italiana font-bold text-gray-900 mb-4"
          variants={motionVariants.item}
          initial="hidden"
          animate="visible"
        >
          POPULAR T-SHIRTS
        </motion.h1>
        
        <motion.p 
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          variants={motionVariants.item}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          Discover our premium collection of comfortable and stylish t-shirts for everyone
        </motion.p>

        {/* Wholesale User Badge */}
        {isWholesaleUser && (
          <motion.div 
            className="mt-4"
            variants={motionVariants.item}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full border border-blue-200">
              🏷️ Special wholesale prices for you!
            </span>
          </motion.div>
        )}
      </div>

      {/* Categories Tabs */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4 mb-12"
        variants={motionVariants.container}
        initial="hidden"
        animate="visible"
      >
        {[...tshirtCategories].map((category) => (
          <motion.button
            key={category}
            variants={motionVariants.item}
            className={`px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 border-2 ${
              activeCategory === category
                ? 'bg-black text-white border-black shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:bg-gray-50'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      {/* Products Count */}
      <motion.div 
        className="text-center mb-6"
        variants={motionVariants.item}
        initial="hidden"
        animate="visible"
      >
        <p className="text-gray-600">
          Showing {filteredProducts.length} color variant{filteredProducts.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' && ` in ${activeCategory}`}
          {isWholesaleUser && ' • Wholesale pricing applied'}
        </p>
      </motion.div>

      {/* Products Grid using your ProductCard */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={motionVariants.container}
        initial="hidden"
        animate="visible"
      >
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={motionVariants.item}
            layout
          >
            <ProductCard
              product={product}
              onCartUpdate={handleCartUpdate}
              selectedColor={product.selectedColor} // Pass color info
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !isLoading && (
        <motion.div 
          className="text-center py-16"
          variants={motionVariants.item}
        >
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-6">
            {activeCategory === 'Men' 
              ? "We're restocking our collection. Please check back soon!"
              : `No ${activeCategory.toLowerCase()} t-shirts available at the moment.`
            }
          </p>
          {activeCategory !== 'Men' && (
            <button 
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-300"
              onClick={() => setActiveCategory('Men')}
            >
              View All Products
            </button>
          )}
        </motion.div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white rounded-xl shadow-md p-4">
              <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-6 rounded w-1/2 mb-4"></div>
              <div className="bg-gray-200 h-10 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
    </div>
  );
};

export default Collections;