import React, { useEffect, useState, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useGetAllProductsQuery } from "../../redux/services/productService";
import { useGetAllCategoriesQuery } from '../../redux/services/categoryService';
import { useGetAllSubcategoriesQuery } from '../../redux/services/subcategoryService';

// Lazy load components
const ProductCard = lazy(() => import("../../components/ProductCard/ProductCard"));
const CartSidebar = lazy(() => import("../../components/layout/CartSidebar"));

/* -----------------------
   Helper: slugify / normalize
   ----------------------- */
const createSlug = (name = "") =>
  name
    .toString()
    .trim()   
    .toLowerCase()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Constants
const PRODUCTS_PER_PAGE = 12;
const DEBOUNCE_DELAY = 300;
const LAZY_LOAD_DELAY = 100; // Delay for lazy loading

// Memoized helper functions outside component
const getCategoriesFromData = (data) => {
  if (!data) return [];
  
  if (data.data?.categories) return data.data.categories;
  if (data.categories) return data.categories;
  if (Array.isArray(data)) return data;
  if (data.data) return data.data;
  
  console.warn('Unexpected categories data structure:', data);
  return [];
};

const getSubcategoriesFromData = (data) => {
  if (!data) return [];
  
  if (data.data?.subcategories) return data.data.subcategories;
  if (data.subcategories) return data.subcategories;
  if (Array.isArray(data)) return data;
  if (data.data) return data.data;
  
  console.warn('Unexpected subcategories data structure:', data);
  return [];
};

// Pre-calculate price formatter
const formatPrice = (price, isWholesaleUser = false) => {
  if (price === undefined || price === null) return "₹0";
  return `₹${price}`;
};

// Optimized product splitting with caching
const splitProductsByColor = (apiProduct, isWholesaleUser) => {
  if (!apiProduct?.variants) return [];

  const colorGroups = {};
  const productId = apiProduct.id || apiProduct._id;

  // Single pass through variants
  apiProduct.variants.forEach(variant => {
    const color = variant.color || 'Default';
    if (!colorGroups[color]) {
      colorGroups[color] = { 
        variants: [], 
        variantImages: new Set(), // Use Set for faster lookups
        hasStock: false 
      };
    }
    
    colorGroups[color].variants.push(variant);
    
    // Check stock once
    if (!colorGroups[color].hasStock && (variant.stock ?? 0) > 0) {
      colorGroups[color].hasStock = true;
    }

    // Add images efficiently
    if (variant.variantImages) {
      variant.variantImages.forEach(img => {
        if (img.imageUrl) {
          colorGroups[color].variantImages.add(img.imageUrl);
        }
      });
    }
  });

  // Convert to array format in one operation
  return Object.entries(colorGroups).map(([color, colorData]) => {
    const variantImagesArray = Array.from(colorData.variantImages);
    const primaryImage = variantImagesArray[0] || apiProduct.image || (apiProduct.images?.[0]);

    const availableSizes = colorData.variants
      .filter(variant => (variant.stock ?? 0) > 0)
      .map(variant => variant.size)
      .filter(Boolean);

    // Price calculation optimized
    let displayPrice, originalPrice, priceLabel;
    const normalPrice = apiProduct.normalPrice || 0;
    const offerPrice = apiProduct.offerPrice;
    const wholesalePrice = apiProduct.wholesalePrice;

    if (isWholesaleUser && wholesalePrice) {
      displayPrice = formatPrice(wholesalePrice);
      originalPrice = offerPrice || normalPrice;
      priceLabel = "Wholesale";
    } else if (offerPrice && offerPrice < normalPrice) {
      displayPrice = formatPrice(offerPrice);
      originalPrice = normalPrice;
      priceLabel = "Offer";
    } else {
      displayPrice = formatPrice(normalPrice);
      originalPrice = null;
      priceLabel = "";
    }

    const subcatName = apiProduct.subcategory?.name || apiProduct.subcategory || "";
    const categoryName = apiProduct.category?.name || apiProduct.category || "";

    return {
      id: `${productId}-${color}`,
      baseProductId: productId,
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
      variantImages: variantImagesArray,
      inStock: colorData.hasStock,
      availableSizes,
      normalPrice,
      offerPrice,
      wholesalePrice,
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

// Loading component for lazy loading
const ProductCardLoader = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300 rounded-lg aspect-square"></div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
    </div>
  </div>
);

// Filter Sidebar Component
const FilterSidebar = ({ 
  showFilterSidebar, 
  setShowFilterSidebar, 
  filters, 
  handleFilterChange, 
  clearAllFilters, 
  subcategories, 
  categories, 
  category, 
  navigate, 
  themeClasses 
}) => {
  const getCategoryDisplayName = useCallback(() => {
    if (!category) return "All Products";

    const foundCategory = categories.find(cat => {
      const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
      return categorySlug === category.toLowerCase();
    });

    return foundCategory ? `${foundCategory.name}'s Collections` : `${category.replace('-', ' ')}'s Collections`;
  }, [category, categories]);

  return (
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
        h-full ${themeClasses.bg} ${themeClasses.borderColor} border-r p-6 overflow-y-auto
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
  );
};

// Lazy Product Grid Component
const LazyProductGrid = ({ products, onCartUpdate }) => {
  const [visibleProducts, setVisibleProducts] = useState([]);
  const observerRef = useRef(null);
  const productRefs = useRef(new Map());

  useEffect(() => {
    // Initially load first few products immediately
    setVisibleProducts(products.slice(0, 6));

    // Then load the rest with delay for better performance
    const timer = setTimeout(() => {
      setVisibleProducts(products);
    }, LAZY_LOAD_DELAY);

    return () => clearTimeout(timer);
  }, [products]);

  // Intersection Observer for lazy loading images
  useEffect(() => {
    if (!products.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = entry.target.dataset.productId;
            const product = products.find(p => p.id === productId);
            if (product && !visibleProducts.find(p => p.id === productId)) {
              setVisibleProducts(prev => [...prev, product]);
            }
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: '100px 0px', // Start loading 100px before element enters viewport
        threshold: 0.1 
      }
    );

    // Observe all product elements
    productRefs.current.forEach((ref, productId) => {
      if (ref) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [products, visibleProducts]);

  const setProductRef = useCallback((element, productId) => {
    if (element) {
      productRefs.current.set(productId, element);
    } else {
      productRefs.current.delete(productId);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-8">
      {products.map((product, index) => {
        const isVisible = visibleProducts.some(p => p.id === product.id);
        
        return (
          <div
            key={product.id}
            ref={(el) => setProductRef(el, product.id)}
            data-product-id={product.id}
            className="min-h-[400px]" // Ensure consistent height for layout stability
          >
            {isVisible ? (
              <Suspense fallback={<ProductCardLoader />}>
                <ProductCard 
                  product={product} 
                  onCartUpdate={onCartUpdate}
                />
              </Suspense>
            ) : (
              <ProductCardLoader />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  goToPage, 
  loadMoreProducts, 
  hasMore, 
  paginatedProducts, 
  totalItems, 
  themeClasses 
}) => {
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="mt-12 flex flex-col items-center gap-6">
      {/* Load More Button (for infinite scroll style) */}
      {hasMore && (
        <button
          onClick={loadMoreProducts}
          className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          Load More Products ({totalItems - (currentPage * PRODUCTS_PER_PAGE)} remaining)
        </button>
      )}

      {/* Traditional Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : `${themeClasses.borderColor} ${themeClasses.hoverBg} transition-colors`
            }`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === page
                  ? 'bg-blue-500 text-white border-blue-500'
                  : `${themeClasses.borderColor} ${themeClasses.hoverBg} transition-colors`
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === totalPages
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : `${themeClasses.borderColor} ${themeClasses.hoverBg} transition-colors`
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Page Info */}
      <div className={`text-sm ${themeClasses.subText}`}>
        Page {currentPage} of {totalPages} • Showing {paginatedProducts.length} of {totalItems} products
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ category, categoryDisplayName, clearAllFilters }) => (
  <div className="text-center py-12">
    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <p className="text-gray-500 text-lg mb-4">
      No products found {category ? `in ${categoryDisplayName}` : ""}.
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
);

// Main Shop Component
export default function Shop() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { theme } = useTheme();

  // Refs for expensive operations
  const productsCacheRef = useRef(new Map());
  const filterTimeoutRef = useRef(null);

  // user role
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // RTK Query hooks
  const { data: productsData, isLoading, error } = useGetAllProductsQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: subcategoriesData } = useGetAllSubcategoriesQuery();

  // State
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized filters initialization
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
      // REMOVED: category filter from here
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(initFiltersFromSearch);

  // Sync filters with URL - optimized
  useEffect(() => {
    setFilters(initFiltersFromSearch());
  }, [location.search, initFiltersFromSearch]);

  // Reset to page 1 when filters or category change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, category]);

  // Optimized URL update with proper cleanup
const updateURL = useCallback((newFilters) => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();

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

      const newSearch = params.toString();
      // Build URL based on whether we have a category or not
      const newUrl = category 
        ? `/shop/${category}${newSearch ? `?${newSearch}` : ''}` 
        : `/shop${newSearch ? `?${newSearch}` : ''}`;
      
      navigate(newUrl, { replace: true });
    }, DEBOUNCE_DELAY);
  }, [category, navigate]);


useEffect(() => {
    // Check if there's a category in query params (old format)
    const queryCategory = searchParams.get('category');
    
    if (queryCategory && !category) {
        // Redirect from old format to new format
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('category'); // Remove category from query params
        
        const newUrl = `/shop/${queryCategory}${newParams.toString() ? `?${newParams.toString()}` : ''}`;
        navigate(newUrl, { replace: true });
    }
}, [searchParams, category, navigate]);


  // Update URL when filters change
  useEffect(() => {
    updateURL(filters);

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [filters, updateURL]);

  // Optimized filter handler
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => {
      if (filterType === 'subcategories') {
        if (Array.isArray(value)) {
          return { ...prev, subcategories: value };
        } else {
          const currentFilters = prev.subcategories;
          const updatedFilters = currentFilters.includes(value)
            ? currentFilters.filter(item => item !== value)
            : [...currentFilters, value];
          return { ...prev, subcategories: updatedFilters };
        }
      } else if (filterType === 'priceRange') {
        return { ...prev, priceRange: value };
      } else {
        return { ...prev, [filterType]: value };
      }
    });
  }, []);

  // Extract categories and subcategories
  const categories = useMemo(() => getCategoriesFromData(categoriesData), [categoriesData]);
  const subcategories = useMemo(() => getSubcategoriesFromData(subcategoriesData), [subcategoriesData]);

  // Optimized product processing with caching
  const allProducts = useMemo(() => {
    if (!productsData?.data?.products) return [];
    
    const cacheKey = `${productsData.data.products.length}-${isWholesaleUser}`;
    
    if (productsCacheRef.current.has(cacheKey)) {
      return productsCacheRef.current.get(cacheKey);
    }

    const products = productsData.data.products.flatMap(product => 
      splitProductsByColor(product, isWholesaleUser)
    );
    
    productsCacheRef.current.set(cacheKey, products);
    return products;
  }, [productsData, isWholesaleUser]);

  // Optimized filtering with early returns
  const filteredProducts = useMemo(() => {
    // Early return if no products
    if (allProducts.length === 0) return [];

    let filtered = allProducts;

    // Filter by category first
    if (category && category !== "all") {
      filtered = allProducts.filter((product) => {
        return product.categorySlug === category.toLowerCase();
      });
    }

    // Apply additional filters with early termination
    filtered = filtered.filter(product => {
      // Subcategory filter
      if (filters.subcategories.length > 0) {
        if (!filters.subcategories.includes(product.subcategorySlug)) return false;
      }

      // Price range - use pre-calculated numeric price
      const productPrice = product.isWholesaleUser && product.wholesalePrice 
        ? product.wholesalePrice 
        : (product.offerPrice && product.offerPrice < product.normalPrice) 
          ? product.offerPrice 
          : product.normalPrice || 0;

      if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) return false;

      // Stock filter
      if (filters.inStock && !product.inStock) return false;

      // Boolean filters
      if (filters.isFeatured && !product.isFeatured) return false;
      if (filters.isNewArrival && !product.isNewArrival) return false;
      if (filters.isBestSeller && !product.isBestSeller) return false;
      if ((product.avgRating || 0) < filters.minRating) return false;

      return true;
    });

    return filtered;
  }, [allProducts, category, filters]);

  // Optimized pagination
  const { paginatedProducts, totalItems, totalPages, hasMore } = useMemo(() => {
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    const hasMore = currentPage < totalPages;

    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return { paginatedProducts, totalItems, totalPages, hasMore };
  }, [filteredProducts, currentPage]);

  // Optimized event handlers
  const loadMoreProducts = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const goToPage = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

const clearAllFilters = useCallback(() => {
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
    setCurrentPage(1);

    // Keep category in the URL when clearing filters
    if (category) {
      navigate(`/shop/${category}`, { replace: true });
    } else {
      navigate('/shop', { replace: true });
    }
  }, [category, navigate]);

  const handleCartUpdate = useCallback(() => setShowCartSidebar(true), []);

  // Theme classes - memoized
  const themeClasses = useMemo(() => {
    const isDark = theme === "dark";
    return {
      bg: isDark ? "bg-black" : "bg-white",
      text: isDark ? "text-white" : "text-black",
      subText: isDark ? "text-gray-400" : "text-gray-600",
      borderColor: isDark ? "border-gray-700" : "border-gray-200",
      hoverBg: isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
    };
  }, [theme]);

  // Category display name - memoized
  const categoryDisplayName = useMemo(() => {
    if (!category) return "All Products";

    const foundCategory = categories.find(cat => {
      const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
      return categorySlug === category.toLowerCase();
    });

    return foundCategory ? `${foundCategory.name}'s Collections` : `${category.replace('-', ' ')}'s Collections`;
  }, [category, categories]);

  // Loading state
  if (isLoading) {
    return (
      <section className={`pb-10 pt-12 px-6 min-h-screen transition-colors duration-500 ${themeClasses.bg} ${themeClasses.text}`}>
        <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-10 capitalize">
          {category ? categoryDisplayName : "All Products"}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, index) => (
            <ProductCardLoader key={index} />
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`pb-10 pt-12 px-6 min-h-screen transition-colors duration-500 ${themeClasses.bg} ${themeClasses.text}`}>
        <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-10 capitalize">
          {category ? categoryDisplayName : "Our Collections"}
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
    <section className={`pb-10 pt-12 px-6 min-h-screen transition-colors duration-500 ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Header */}
      <h1 className="text-3xl font-bold font-italiana tracking-widest lg:text-5xl text-center mb-6 capitalize">
        {category ? categoryDisplayName : "All Products"}
      </h1>

      {/* Results Count */}
      <div className="text-center mb-6">
        <p className={`text-lg ${themeClasses.subText}`}>
          Showing {paginatedProducts.length} of {totalItems} products
          {category && ` in ${categoryDisplayName}`}
        </p>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden flex justify-between items-center mb-6">
        <button
          onClick={() => setShowFilterSidebar(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${themeClasses.borderColor} ${themeClasses.hoverBg} transition-colors`}
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
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <FilterSidebar
          showFilterSidebar={showFilterSidebar}
          setShowFilterSidebar={setShowFilterSidebar}
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearAllFilters={clearAllFilters}
          subcategories={subcategories}
          categories={categories}
          category={category}
          navigate={navigate}
          themeClasses={themeClasses}
        />

        {/* Main Content */}
        <div className="flex-1">
          {paginatedProducts.length === 0 ? (
            <EmptyState 
              category={category}
              categoryDisplayName={categoryDisplayName}
              clearAllFilters={clearAllFilters}
            />
          ) : (
            <>
              <LazyProductGrid 
                products={paginatedProducts} 
                onCartUpdate={handleCartUpdate}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                goToPage={goToPage}
                loadMoreProducts={loadMoreProducts}
                hasMore={hasMore}
                paginatedProducts={paginatedProducts}
                totalItems={totalItems}
                themeClasses={themeClasses}
              />
            </>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <CartSidebar 
          isOpen={showCartSidebar} 
          onClose={() => setShowCartSidebar(false)} 
        />
      </Suspense>
    </section>
  );
}