import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useGetAllProductsQuery } from "../../redux/services/productService";
import { useGetAllCategoriesQuery } from '../../redux/services/categoryService';
import { useGetAllSubcategoriesQuery } from '../../redux/services/subcategoryService';
import ProductCard from "../../components/ProductCard/ProductCard";
import CartSidebar from "../../components/layout/CartSidebar";

export default function Shop() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { theme } = useTheme();
  
  // Debug logs
  console.log('Shop - Category param:', category);
  console.log('Shop - Search params:', Object.fromEntries(searchParams.entries()));
  console.log('Shop - Full URL:', location.pathname + location.search);

  // Get user role from Redux store
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // RTK Query hooks
  const { data: productsData, isLoading, error } = useGetAllProductsQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: subcategoriesData } = useGetAllSubcategoriesQuery();
  
  // State management
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    subcategories: searchParams.get('subcategories')?.split(',').filter(Boolean) || [],
    priceRange: [
      parseInt(searchParams.get('minPrice')) || 0,
      parseInt(searchParams.get('maxPrice')) || 10000
    ],
    inStock: searchParams.get('inStock') === 'true',
    isFeatured: searchParams.get('featured') === 'true',
    isNewArrival: searchParams.get('newArrival') === 'true',
    isBestSeller: searchParams.get('bestSeller') === 'true',
    minRating: parseInt(searchParams.get('minRating')) || 0
  });

  // Extract categories and subcategories
  const categories = categoriesData?.data || categoriesData || [];
  const subcategories = subcategoriesData?.data || subcategoriesData || [];

  // Function to update URL with current filters
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (newFilters.categories.length > 0) {
      params.set('categories', newFilters.categories.join(','));
    }
    
    if (newFilters.subcategories.length > 0) {
      params.set('subcategories', newFilters.subcategories.join(','));
    }
    
    if (newFilters.priceRange[0] > 0) {
      params.set('minPrice', newFilters.priceRange[0].toString());
    }
    
    if (newFilters.priceRange[1] < 10000) {
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }
    
    if (newFilters.inStock) {
      params.set('inStock', 'true');
    }
    
    if (newFilters.isFeatured) {
      params.set('featured', 'true');
    }
    
    if (newFilters.isNewArrival) {
      params.set('newArrival', 'true');
    }
    
    if (newFilters.isBestSeller) {
      params.set('bestSeller', 'true');
    }
    
    if (newFilters.minRating > 0) {
      params.set('minRating', newFilters.minRating.toString());
    }
    
    // Update URL without page reload
    setSearchParams(params);
  };

  // Utility function to extract products array from productsData
  const extractProductsArray = useMemo(() => {
    if (!productsData) return [];
    
    if (Array.isArray(productsData)) {
      return productsData;
    } else if (productsData.data && Array.isArray(productsData.data.products)) {
      return productsData.data.products;
    } else if (productsData.data && Array.isArray(productsData.data)) {
      return productsData.data;
    } else if (productsData.products && Array.isArray(productsData.products)) {
      return productsData.products;
    } else if (productsData.success && Array.isArray(productsData.data)) {
      return productsData.data;
    }
    
    return [];
  }, [productsData]);

  // Function to get product count for a category
  const getProductCountByCategory = (categoryName) => {
    return extractProductsArray.filter(product => {
      const productCategory = product.category?.name || product.category;
      return productCategory === categoryName;
    }).length;
  };

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

  // Filter products based on multiple criteria
  useEffect(() => {
    if (productsData && extractProductsArray.length > 0) {
      let filtered = extractProductsArray;
      
      // Filter by URL category first
      if (category && category !== "all") {
        filtered = extractProductsArray.filter((product) => {
          const productCategory = product.category?.name || product.category;
          if (!productCategory) return false;
          
          // Create URL-safe category name for comparison
          const productCategorySlug = productCategory.toLowerCase().replace(/\s+/g, '-');
          return productCategorySlug === category.toLowerCase();
        });
      }

      // Apply additional filters
      filtered = filtered.filter(product => {
        // Category filter (from URL params)
        if (filters.categories.length > 0) {
          const productCategory = product.category?.name || product.category;
          if (!filters.categories.includes(productCategory)) return false;
        }

        // Subcategory filter (from URL params)
        if (filters.subcategories.length > 0) {
          const productSubcategory = product.subcategory?.name || product.subcategory;
          if (!filters.subcategories.includes(productSubcategory)) return false;
        }

        // Price range filter
        const productPrice = product.normalPrice || 0;
        if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) return false;

        // Stock filter
        if (filters.inStock) {
          const hasStock = product.variants?.some(variant => variant.stock > 0);
          if (!hasStock) return false;
        }

        // Featured filter
        if (filters.isFeatured && !product.featured) return false;

        // New arrival filter
        if (filters.isNewArrival && !product.isNewArrival) return false;

        // Best seller filter
        if (filters.isBestSeller && !product.isBestSeller) return false;

        // Rating filter
        if (product.avgRating < filters.minRating) return false;

        return true;
      });
      
      // Split each product by color
      const colorBasedProducts = filtered.flatMap(product => splitProductsByColor(product));
      
      setFilteredProducts(colorBasedProducts);
    } else {
      setFilteredProducts([]);
    }
  }, [productsData, category, isWholesaleUser, filters, extractProductsArray]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      let newFilters;
      
      if (filterType === 'categories' || filterType === 'subcategories') {
        const currentFilters = prev[filterType];
        const updatedFilters = currentFilters.includes(value)
          ? currentFilters.filter(item => item !== value)
          : [...currentFilters, value];
        
        newFilters = { ...prev, [filterType]: updatedFilters };
      } else if (filterType === 'priceRange') {
        newFilters = { ...prev, priceRange: value };
      } else {
        newFilters = { ...prev, [filterType]: value };
      }
      
      // Update URL whenever filters change
      updateURL(newFilters);
      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {
      categories: [],
      subcategories: [],
      priceRange: [0, 10000],
      inStock: false,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      minRating: 0
    };
    
    setFilters(clearedFilters);
    // Clear URL parameters but keep the category
    if (category) {
      setSearchParams({});
    } else {
      navigate('/shop');
    }
  };

  // Function to copy shareable URL
  const copyShareableURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL)
      .then(() => {
        alert('Filtered URL copied to clipboard!');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentURL;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Filtered URL copied to clipboard!');
      });
  };

  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };

  // 🎨 Theme-based colors
  const isDark = theme === "dark";
  const bg = isDark ? "bg-black" : "bg-white";
  const text = isDark ? "text-white" : "text-black";
  const textColor = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Get display name for category
  const getCategoryDisplayName = () => {
    if (!category) return "All Products";
    
    // Find the category by slug
    const foundCategory = categories.find(cat => {
      const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
      return categorySlug === category.toLowerCase();
    });
    
    return foundCategory ? `${foundCategory.name}'s Collections` : `${category}'s Collections`;
  };

  // Loading state
  if (isLoading) {
    return (
      <section className={`pb-10 pt-12 px-6 min-h-screen transition-colors duration-500 ${bg} ${text}`}>
        <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-10 capitalize">
          {category ? getCategoryDisplayName() : "All Products"}
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
          {category ? getCategoryDisplayName() : "Our Collections"}
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
      {/* Page Header */}
      <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-6 capitalize">
        {category ? getCategoryDisplayName() : "All Products"}
      </h1>


      {/* Mobile Filter Button */}
      <div className="lg:hidden flex justify-between items-center mb-6">
        <button
          onClick={() => setShowFilterSidebar(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} transition-colors`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filters
          {Object.values(filters).some(filter => 
            Array.isArray(filter) ? filter.length > 0 : filter !== false && filter !== 0
          ) && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
        
        <div className="text-sm text-gray-500">
          {filteredProducts.length} products found
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <div className={`
          ${showFilterSidebar ? 'fixed inset-0 z-50 lg:static lg:z-auto' : 'hidden lg:block'}
          w-80 flex-shrink-0
        `}>
          {showFilterSidebar && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setShowFilterSidebar(false)}
            />
          )}
          
          <div className={`
            h-full ${bg} ${borderColor} border-r p-6 overflow-y-auto
            ${showFilterSidebar ? 'fixed left-0 top-0 w-80 z-50' : 'relative'}
            transition-transform duration-300
          `}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setShowFilterSidebar(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Categories Filter */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-lg">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => {
                  const categoryName = cat.name;
                  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
                  const isActive = category === categorySlug;
                  
                  return (
                    <label key={cat.id || cat._id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(categoryName) || isActive}
                        onChange={() => handleFilterChange('categories', categoryName)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="group-hover:text-blue-500 transition-colors capitalize">
                        {categoryName}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        ({getProductCountByCategory(categoryName)})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Subcategories Filter */}
            {subcategories.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-lg">Subcategories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {subcategories.map((subcat) => (
                    <label key={subcat.id || subcat._id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.subcategories.includes(subcat.name)}
                        onChange={() => handleFilterChange('subcategories', subcat.name)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="group-hover:text-blue-500 transition-colors capitalize">
                        {subcat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-lg">Price Range</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 10000])}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Status Filters */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-lg">Product Status</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="group-hover:text-blue-500 transition-colors">In Stock Only</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.isFeatured}
                    onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="group-hover:text-blue-500 transition-colors">Featured Products</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.isNewArrival}
                    onChange={(e) => handleFilterChange('isNewArrival', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="group-hover:text-blue-500 transition-colors">New Arrivals</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.isBestSeller}
                    onChange={(e) => handleFilterChange('isBestSeller', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="group-hover:text-blue-500 transition-colors">Best Sellers</span>
                </label>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-lg">Minimum Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="minRating"
                      checked={filters.minRating === rating}
                      onChange={() => handleFilterChange('minRating', rating)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="group-hover:text-blue-500 transition-colors">
                      {rating} Stars & Up
                    </span>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="minRating"
                    checked={filters.minRating === 0}
                    onChange={() => handleFilterChange('minRating', 0)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="group-hover:text-blue-500 transition-colors">All Ratings</span>
                </label>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.categories.length > 0 || filters.subcategories.length > 0 || filters.inStock || filters.isFeatured || filters.isNewArrival || filters.isBestSeller || filters.minRating > 0) && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-lg">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.categories.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {cat}
                      <button 
                        onClick={() => handleFilterChange('categories', cat)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {filters.subcategories.map(subcat => (
                    <span key={subcat} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {subcat}
                      <button 
                        onClick={() => handleFilterChange('subcategories', subcat)}
                        className="hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {filters.inStock && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      In Stock
                      <button 
                        onClick={() => handleFilterChange('inStock', false)}
                        className="hover:text-yellow-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      Featured
                      <button 
                        onClick={() => handleFilterChange('isFeatured', false)}
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.isNewArrival && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
                      New Arrival
                      <button 
                        onClick={() => handleFilterChange('isNewArrival', false)}
                        className="hover:text-pink-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.isBestSeller && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                      Best Seller
                      <button 
                        onClick={() => handleFilterChange('isBestSeller', false)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.minRating > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                      {filters.minRating}+ Stars
                      <button 
                        onClick={() => handleFilterChange('minRating', 0)}
                        className="hover:text-indigo-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {extractProductsArray.length} products
              {category && ` in ${getCategoryDisplayName()}`}
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg mb-4">
                No products found {category ? `in ${getCategoryDisplayName()}` : ""}.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Try adjusting your filters or browse another category.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
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

              {/* Load More Button (Optional) */}
              {filteredProducts.length > 0 && (
                <div className="text-center mt-12">
                  <button className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      /> 
    </section>
  );
}