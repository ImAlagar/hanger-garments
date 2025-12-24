import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate import
import { motionVariants } from '../../constants/headerConstants';
import { useGetAllCategoriesQuery } from '../../redux/services/categoryService';
import { useGetAllSubcategoriesQuery } from '../../redux/services/subcategoryService';
import { useGetAllProductsQuery } from '../../redux/services/productService';
import ProductCard from '../../components/ProductCard/ProductCard';
import CartSidebar from '../../components/layout/CartSidebar';
import { useSelector } from 'react-redux';
import CategoryCollections from './CategoryCollections';

const Collections = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const navigate = useNavigate(); // useNavigate hook

  // Get user role from Redux store
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // Fetch categories
  const { data: categoriesData } = useGetAllCategoriesQuery({
    status: 'ACTIVE'
  });

  // Fetch subcategories for each category
  const { data: subcategoriesData } = useGetAllSubcategoriesQuery({
    status: 'ACTIVE'
  });

  // Fetch products
  const { data: productsData, isLoading, error } = useGetAllProductsQuery({
    category: activeCategory === 'All' ? '' : activeCategory
  });

  // Organize categories with their subcategories - Men first
  useEffect(() => {
    if (categoriesData?.data?.categories && subcategoriesData?.data?.subcategories) {
      const activeCategories = categoriesData.data.categories.filter(cat => cat.isActive);
      
      // Sort categories - Men first, then others
      const sortedCategories = [...activeCategories].sort((a, b) => {
        // Put "Men" category first
        if (a.name.toLowerCase() === 'men') return -1;
        if (b.name.toLowerCase() === 'men') return 1;
        
        // Then put "Women" category second
        if (a.name.toLowerCase() === 'women') return -1;
        if (b.name.toLowerCase() === 'women') return 1;
        
        // Then by creation date or alphabetically
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      const categoriesWithSubcategories = sortedCategories.map(category => {
        const categorySubcategories = subcategoriesData.data.subcategories.filter(
          sub => sub.categoryId === category.id && sub.isActive
        );
        
        return {
          ...category,
          subcategories: categorySubcategories
        };
      });

      setCategories(categoriesWithSubcategories);
      
      // Set default active category to "Men" if available
      if (categoriesWithSubcategories.length > 0) {
        const menCategory = categoriesWithSubcategories.find(cat => 
          cat.name.toLowerCase() === 'men'
        );
        if (menCategory) {
          setActiveCategory(menCategory.name);
        } else {
          setActiveCategory(categoriesWithSubcategories[0].name);
        }
      }
    }
  }, [categoriesData, subcategoriesData]);

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
        selectedColor: color
      };
    });
  };

  // Transform API data to match ProductCard expectations with auth-based pricing
  const transformProductData = (products) => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    const colorBasedProducts = products.flatMap(product => splitProductsByColor(product));
    return colorBasedProducts;
  };

  // Filter products when category changes or data loads
  useEffect(() => {
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
        setDisplayedProducts(transformedProducts.slice(0, 8));
      } else {
        const filtered = transformedProducts.filter(product => {
          const productCategory = product.category?.toLowerCase();
          const activeCategoryLower = activeCategory.toLowerCase();
          const matches = productCategory === activeCategoryLower;
          return matches;
        });
        setFilteredProducts(filtered);
        setDisplayedProducts(filtered.slice(0, 8));
      }
    } else {
      setFilteredProducts([]);
      setDisplayedProducts([]);
    }
  }, [productsData, activeCategory, isWholesaleUser]);

  // Handle cart update from ProductCard
  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };

  // Handle subcategory click - filter products by subcategory
  const handleSubcategoryClick = (subcategoryName, categoryName) => {
    // Create URL-friendly subcategory name
    const urlFriendlySubcategory = subcategoryName
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, ''); // Remove special characters
    
    // Create URL-friendly category name
    const urlFriendlyCategory = categoryName.toLowerCase();
    
    // Navigate to the shop page with query parameters
    navigate(`/shop/${urlFriendlyCategory}?subcategories=${urlFriendlySubcategory}`);
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
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Categories with Subcategories Horizontal Scrollers - Men first */}
      <CategoryCollections 
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        handleSubcategoryClick={handleSubcategoryClick}
      />

      {/* Categories Tabs for Product Filtering */}
      {categories.length > 0 && (
        <motion.div 
          id="products-section"
          className="mb-12"
          variants={motionVariants.container}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            Featured Products
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 border ${
                activeCategory === 'All'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-black'
              }`}
              onClick={() => setActiveCategory('All')}
            >
              All Products
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 border ${
                  activeCategory === category.name
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                }`}
                onClick={() => setActiveCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Count */}
          <motion.div 
            className="text-center mb-6"
            variants={motionVariants.item}
            initial="hidden"
            animate="visible"
          >
            <p className="text-gray-600">
              Showing {displayedProducts.length} of {filteredProducts.length} color variant{filteredProducts.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
              {isWholesaleUser && ' • Wholesale pricing applied'}
            </p>
          </motion.div>

          {/* Products Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6"
            variants={motionVariants.container}
            initial="hidden"
            animate="visible"
          >
            {displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={motionVariants.item}
                layout
              >
                <ProductCard
                  product={product}
                  onCartUpdate={handleCartUpdate}
                  selectedColor={product.selectedColor}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* View All Products Button */}
          {filteredProducts.length > 8 && (
            <motion.div 
              className="text-center mt-12 mb-8"
              variants={motionVariants.item}
              initial="hidden"
              animate="visible"
            >
              <Link 
                to="/shop" 
                className="inline-flex items-center justify-center bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View All {filteredProducts.length} Products
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          )}

          {/* Empty State */}
          {displayedProducts.length === 0 && !isLoading && (
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
                No products found in {activeCategory}
              </h3>
              <p className="text-gray-500 mb-6">
                Try selecting a different category or check back soon!
              </p>
            </motion.div>
          )}
        </motion.div>
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