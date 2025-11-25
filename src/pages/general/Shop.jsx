import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useGetAllProductsQuery } from "../../redux/services/productService";
import { useGetAllCategoriesQuery } from '../../redux/services/categoryService';
import { useGetAllSubcategoriesQuery } from '../../redux/services/subcategoryService';
import ProductCard from "../../components/ProductCard/ProductCard";
import CartSidebar from "../../components/layout/CartSidebar";

/* -----------------------
   Helper: slugify / normalize
   ----------------------- */
const createSlug = (name = "") =>
  name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9\s-]/g, "") // remove punctuation
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function Shop() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { theme } = useTheme();

  // user role
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // RTK Query hooks
  const { data: productsData, isLoading, error } = useGetAllProductsQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: subcategoriesData } = useGetAllSubcategoriesQuery();

  // State
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  // Initialize filters from URL
  const initFiltersFromSearch = useCallback(() => {
    const rawSub = searchParams.get('subcategories');
    const subSlugs = rawSub
      ? rawSub.split(',').map(s => decodeURIComponent(s)).filter(Boolean)
      : [];

    return {
      subcategories: subSlugs,
      priceRange: [
        parseInt(searchParams.get('minPrice')) || 0,
        parseInt(searchParams.get('maxPrice')) || 10000
      ],
      inStock: searchParams.get('inStock') === 'true',
      isFeatured: searchParams.get('featured') === 'true',
      isNewArrival: searchParams.get('newArrival') === 'true',
      isBestSeller: searchParams.get('bestSeller') === 'true',
      minRating: parseInt(searchParams.get('minRating')) || 0
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(initFiltersFromSearch);

  // Extract categories and subcategories arrays
  const categories = categoriesData?.data || categoriesData || [];
  const subcategories = subcategoriesData?.data || subcategoriesData || [];

  // Keep filters state in sync when URL/searchParams changes
  useEffect(() => {
    setFilters(initFiltersFromSearch());
  }, [initFiltersFromSearch, location.search]);

  // Function to update URL with current filters
  const updateURL = useCallback((newFilters) => {
    const params = new URLSearchParams();

    // subcategories are already slugs in state; encode for safety
    if (newFilters.subcategories.length > 0) {
      params.set('subcategories', newFilters.subcategories.map(s => encodeURIComponent(s)).join(','));
    }

    if (newFilters.priceRange[0] > 0) {
      params.set('minPrice', newFilters.priceRange[0].toString());
    }

    if (newFilters.priceRange[1] < 10000) {
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }

    if (newFilters.inStock) params.set('inStock', 'true');
    if (newFilters.isFeatured) params.set('featured', 'true');
    if (newFilters.isNewArrival) params.set('newArrival', 'true');
    if (newFilters.isBestSeller) params.set('bestSeller', 'true');
    if (newFilters.minRating > 0) params.set('minRating', newFilters.minRating.toString());

    // Use navigate instead of setSearchParams to avoid render phase updates
    const newSearch = params.toString();
    const newUrl = category ? `/shop/${category}${newSearch ? `?${newSearch}` : ''}` : `/shop${newSearch ? `?${newSearch}` : ''}`;
    
    navigate(newUrl, { replace: true });
  }, [category, navigate]);

  // Update URL when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL(filters);
    }, 300); // Debounce to prevent too frequent updates

    return () => clearTimeout(timeoutId);
  }, [filters, updateURL]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      let newFilters;

      if (filterType === 'subcategories') {
        // allow passing array (toggle-all) or single slug
        if (Array.isArray(value)) {
          newFilters = { ...prev, subcategories: value };
        } else {
          const currentFilters = prev.subcategories;
          const updatedFilters = currentFilters.includes(value)
            ? currentFilters.filter(item => item !== value)
            : [...currentFilters, value];

          newFilters = { ...prev, subcategories: updatedFilters };
        }
      } else if (filterType === 'priceRange') {
        newFilters = { ...prev, priceRange: value };
      } else {
        newFilters = { ...prev, [filterType]: value };
      }

      return newFilters;
    });
  };

  // Utility to extract products array from API data
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

  // Helper: split product by color
  const splitProductsByColor = (apiProduct) => {
    if (!apiProduct || !apiProduct.variants) return [];

    const colorGroups = {};

    apiProduct.variants.forEach(variant => {
      const color = variant.color || 'Default';
      if (!colorGroups[color]) {
        colorGroups[color] = { variants: [], variantImages: [] };
      }
      colorGroups[color].variants.push(variant);

      if (variant.variantImages) {
        variant.variantImages.forEach(img => {
          if (!colorGroups[color].variantImages.some(existing => existing.imageUrl === img.imageUrl)) {
            colorGroups[color].variantImages.push(img);
          }
        });
      }
    });

    return Object.entries(colorGroups).map(([color, colorData]) => {
      const primaryImage = colorData.variantImages.find(img => img.isPrimary)?.imageUrl ||
        colorData.variantImages[0]?.imageUrl ||
        apiProduct.image ||
        (apiProduct.images && apiProduct.images[0]);

      const hasStock = colorData.variants.some(variant => (variant.stock ?? 0) > 0);

      const availableSizes = colorData.variants
        .filter(variant => (variant.stock ?? 0) > 0)
        .map(variant => variant.size)
        .filter(Boolean);

      const formatPrice = (price) => {
        if (price === undefined || price === null) return "₹0";
        return `₹${price}`;
      };

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

      const subcatName = apiProduct.subcategory?.name || apiProduct.subcategory || "";
      const categoryName = apiProduct.category?.name || apiProduct.category || "";

      return {
        id: `${apiProduct.id || apiProduct._id}-${color}`,
        baseProductId: apiProduct.id || apiProduct._id,
        title: apiProduct.name || apiProduct.title || "Unnamed Product",
        displayTitle: `${apiProduct.name || apiProduct.title || "Unnamed Product"} (${color})`,
        color,
        category: categoryName,
        categorySlug: createSlug(categoryName),
        subcategory: subcatName,
        subcategorySlug: createSlug(subcatName),
        price: displayPrice,
        originalPrice,
        priceLabel,
        image: primaryImage,
        variants: colorData.variants,
        variantImages: colorData.variantImages,
        inStock: hasStock,
        availableSizes,
        normalPrice: apiProduct.normalPrice || 0,
        offerPrice: apiProduct.offerPrice || null,
        wholesalePrice: apiProduct.wholesalePrice || null,
        avgRating: apiProduct.avgRating || 0,
        totalRatings: apiProduct.totalRatings || 0,
        isWholesaleUser,
        isFeatured: apiProduct.featured || false,
        isNewArrival: apiProduct.isNewArrival || false,
        isBestSeller: apiProduct.isBestSeller || false,
        productDetails: apiProduct.productDetails || [],
        description: apiProduct.description || "",
        ratings: apiProduct.ratings || [],
        selectedColor: color
      };
    });
  };

  // Filtering effect — runs when data / category / filters change
  useEffect(() => {
    if (extractProductsArray.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = extractProductsArray;

    // Filter by URL category first - this is the main category from navigation
    if (category && category !== "all") {
      filtered = extractProductsArray.filter((product) => {
        const productCategory = product.category?.name || product.category || "";
        const productCategorySlug = createSlug(productCategory);
        return productCategorySlug === category.toLowerCase();
      });
    }

    // Apply additional filters
    filtered = filtered.filter(product => {
      // Subcategory filter (compare slug)
      if (filters.subcategories.length > 0) {
        const productSubName = product.subcategory?.name || product.subcategory || "";
        const productSubSlug = createSlug(productSubName);
        if (!filters.subcategories.includes(productSubSlug)) return false;
      }

      // Price range - use the correct price based on user type
      let productPrice;
      if (isWholesaleUser && product.wholesalePrice) {
        productPrice = product.wholesalePrice;
      } else if (product.offerPrice && product.offerPrice < product.normalPrice) {
        productPrice = product.offerPrice;
      } else {
        productPrice = product.normalPrice || 0;
      }

      if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) return false;

      // Stock filter
      if (filters.inStock) {
        const hasStock = product.variants?.some(variant => (variant.stock ?? 0) > 0);
        if (!hasStock) return false;
      }

      // Featured / new / bestseller / rating filters
      if (filters.isFeatured && !product.featured) return false;
      if (filters.isNewArrival && !product.isNewArrival) return false;
      if (filters.isBestSeller && !product.isBestSeller) return false;
      if ((product.avgRating || 0) < filters.minRating) return false;

      return true;
    });

    // Split by color and produce flattened list
    const colorBasedProducts = filtered.flatMap(product => splitProductsByColor(product));
    setFilteredProducts(colorBasedProducts);
  }, [productsData, category, isWholesaleUser, filters, extractProductsArray]);

  // Clear all filters (preserve main category path)
  const clearAllFilters = () => {
    const clearedFilters = {
      subcategories: [],
      priceRange: [0, 10000],
      inStock: false,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      minRating: 0
    };

    setFilters(clearedFilters);

    // Clear URL params but keep route
    if (category) {
      navigate(`/shop/${category}`, { replace: true });
    } else {
      navigate('/shop', { replace: true });
    }
  };

  // Copy URL helper
  const copyShareableURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard?.writeText(currentURL)
      .then(() => alert('Filtered URL copied to clipboard!'))
      .catch(() => {
        // fallback
        const textArea = document.createElement('textarea');
        textArea.value = currentURL;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Filtered URL copied to clipboard!');
      });
  };

  const handleCartUpdate = () => setShowCartSidebar(true);

  // Theme classes
  const isDark = theme === "dark";
  const bg = isDark ? "bg-black" : "bg-white";
  const text = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";

  // Category display name helper
  const getCategoryDisplayName = () => {
    if (!category) return "All Products";

    const foundCategory = categories.find(cat => {
      const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
      return categorySlug === category.toLowerCase();
    });

    return foundCategory ? `${foundCategory.name}'s Collections` : `${category.replace('-', ' ')}'s Collections`;
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
      {/* Header */}
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

            {/* Header + Clear */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Category info */}
            {category && (
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Viewing: <span className="capitalize">{getCategoryDisplayName()}</span>
                </p>
                <button
                  onClick={() => navigate('/shop')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                >
                  View All Products
                </button>
              </div>
            )}

            {/* Subcategories */}
            {subcategories.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-lg">Subcategories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {subcategories
                    .filter(subcat => {
                      // If we're in a category, only show subcategories for that category
                      if (category) {
                        const categoryName = categories.find(cat => {
                          const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
                          return categorySlug === category.toLowerCase();
                        })?.name;
                        
                        const subcatCategory = subcat.category?.name || subcat.category;
                        return subcatCategory === categoryName;
                      }
                      return true;
                    })
                    .map((subcat) => {
                      const subcatSlug = createSlug(subcat.name);
                      return (
                        <label key={subcat.id || subcat._id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.subcategories.includes(subcatSlug)}
                            onChange={() => handleFilterChange('subcategories', subcatSlug)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="group-hover:text-blue-500 transition-colors capitalize">
                            {subcat.name}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-lg">Price Range</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
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

            {/* Rating */}
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

            {/* Active Filters (chips) */}
            {(filters.subcategories.length > 0 || filters.inStock || filters.isFeatured || filters.isNewArrival || filters.isBestSeller || filters.minRating > 0) && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-lg">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.subcategories.map(subcatSlug => {
                    // Find readable name if available
                    const readable = subcategories.find(s => createSlug(s.name) === subcatSlug)?.name || subcatSlug;
                    return (
                      <span key={subcatSlug} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {readable}
                        <button 
                          onClick={() => handleFilterChange('subcategories', subcatSlug)}
                          className="hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onCartUpdate={handleCartUpdate}
                  />
                ))}
              </div>

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