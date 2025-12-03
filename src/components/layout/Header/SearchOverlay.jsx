import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiXCircle, FiClock, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import { motionVariants } from '../../../constants/headerConstants';
import { useTheme } from '../../../context/ThemeContext'; // Assuming ThemeContext is in same directory

const SearchOverlay = ({ 
  searchOpen, 
  searchQuery, 
  setSearchQuery, 
  setSearchOpen, 
  handleSearch,
  searchResults,
  isSearchLoading,
  searchError,
  recentSearches = [],
  clearRecentSearches,
  handleProductClick,
  handleViewAllResults
}) => {
  const inputRef = useRef(null);
  const { theme } = useTheme();

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [searchOpen]);

  const handleRecentSearchClick = (recentQuery) => {
    setSearchQuery(recentQuery);
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
  };

  const popularSearches = [
    'T-Shirts',
    'Casual Shirts', 
    'Oversized',
    'Women Dresses',
    'Men Fashion',
    'Summer Collection'
  ];

  // Extract products from search results with safe access
  const products = searchResults?.products || [];
  const totalResults = searchResults?.pagination?.total || 0;

  // Ensure recentSearches is always an array
  const safeRecentSearches = Array.isArray(recentSearches) ? recentSearches : [];

  // Theme-based classes
  const themeClasses = {
    overlay: theme === 'dark' 
      ? 'bg-black/70 backdrop-blur-sm' 
      : 'bg-black/50 backdrop-blur-sm',
    
    container: theme === 'dark'
      ? 'bg-gray-900 text-gray-100'
      : 'bg-white text-gray-900',
    
    input: theme === 'dark'
      ? 'bg-gray-900 text-gray-100 placeholder-gray-400'
      : 'bg-transparent text-gray-900 placeholder-gray-400',
    
    border: theme === 'dark'
      ? 'border-gray-700'
      : 'border-gray-100',
    
    text: {
      primary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      tertiary: theme === 'dark' ? 'text-gray-500' : 'text-gray-500',
      placeholder: theme === 'dark' ? 'text-gray-400' : 'text-gray-400',
    },
    
    button: {
      cancel: theme === 'dark'
        ? 'text-gray-300 hover:text-gray-100'
        : 'text-gray-600 hover:text-gray-800',
      
      clear: theme === 'dark'
        ? 'text-gray-400 hover:text-gray-300'
        : 'text-gray-400 hover:text-gray-600',
      
      tag: theme === 'dark'
        ? 'bg-gray-800 hover:bg-purple-900/30 hover:text-purple-300 text-gray-300'
        : 'bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-700',
    },
    
    hover: {
      item: theme === 'dark'
        ? 'hover:bg-gray-800 hover:border-gray-700'
        : 'hover:bg-gray-50 hover:border-gray-200',
      
      recent: theme === 'dark'
        ? 'hover:bg-gray-800'
        : 'hover:bg-gray-50',
    },
    
    icon: {
      primary: theme === 'dark' ? 'text-gray-400' : 'text-gray-400',
      hover: theme === 'dark' ? 'text-purple-400' : 'text-purple-500',
    },
    
    background: {
      section: theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50',
      fallback: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100',
      badge: theme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800',
    }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 ${themeClasses.overlay}`}
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            variants={motionVariants.search}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`search-container rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden ${themeClasses.container}`}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="relative">
              <div className={`flex items-center px-6 py-5 border-b ${themeClasses.border}`}>
                <FiSearch className={`${themeClasses.icon.primary} size-6 mr-4`} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search t-shirts, collections, styles..."
                  className={`flex-1 text-xl border-none outline-none ${themeClasses.input}`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={`${themeClasses.icon.primary} hover:${themeClasses.icon.hover} transition-colors p-1`}
                  >
                    <FiXCircle className="size-6" />
                  </button>
                )}
              </div>
              
              {/* Search Content */}
              <div className="max-h-96 overflow-y-auto">
                {/* Search Results */}
                {searchQuery && (
                  <div className="p-4">
                    {isSearchLoading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className={`ml-3 ${themeClasses.text.secondary}`}>
                          Searching...
                        </span>
                      </div>
                    )}
                    
                    {searchError && (
                      <div className="text-center py-8">
                        <p className="text-red-400">Error searching products</p>
                        <p className={`text-sm mt-1 ${themeClasses.text.tertiary}`}>
                          Please try again later
                        </p>
                      </div>
                    )}
                    
                    {!isSearchLoading && !searchError && products.length > 0 && (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className={`font-semibold ${themeClasses.text.secondary}`}>
                            Products ({totalResults})
                          </h3>
                          <button
                            type="button"
                            onClick={handleViewAllResults}
                            className="text-purple-500 hover:text-purple-400 text-sm font-medium transition-colors"
                          >
                            View All Results
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {products.slice(0, 5).map((product) => (
                            <div
                              key={product.id}
                              onClick={() => handleProductClick && handleProductClick(product)}
                              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors border border-transparent ${themeClasses.hover.item}`}
                            >
                              {product.variants?.[0]?.variantImages?.[0]?.imageUrl ? (
                                <img
                                  src={product.variants[0].variantImages[0].imageUrl}
                                  alt={product.name}
                                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${themeClasses.background.fallback}`}>
                                  <FiShoppingBag className={`${themeClasses.icon.primary} size-6`} />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium truncate ${themeClasses.text.primary}`}>
                                  {product.name}
                                </h4>
                                <p className={`text-sm truncate ${themeClasses.text.secondary}`}>
                                  {product.category?.name} • {product.subcategory?.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-purple-500 font-semibold">
                                    ₹{product.offerPrice || product.normalPrice}
                                  </span>
                                  {product.offerPrice && product.offerPrice < product.normalPrice && (
                                    <span className={`text-sm line-through ${themeClasses.text.tertiary}`}>
                                      ₹{product.normalPrice}
                                    </span>
                                  )}
                                  {product.isBestSeller && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${themeClasses.background.badge}`}>
                                      Best Seller
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {!isSearchLoading && !searchError && products.length === 0 && searchQuery && (
                      <div className="text-center py-8">
                        <FiSearch className={`mx-auto size-12 mb-3 ${themeClasses.icon.primary}`} />
                        <p className={`mb-2 ${themeClasses.text.secondary}`}>
                          No products found for "{searchQuery}"
                        </p>
                        <p className={`text-sm ${themeClasses.text.tertiary}`}>
                          Try different keywords or check the spelling
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Recent Searches */}
                {!searchQuery && safeRecentSearches.length > 0 && (
                  <div className={`p-4 border-b ${themeClasses.border}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`font-semibold flex items-center gap-2 ${themeClasses.text.secondary}`}>
                        <FiClock className="size-4" />
                        Recent Searches
                      </h3>
                      <button
                        type="button"
                        onClick={() => clearRecentSearches && clearRecentSearches()}
                        className={`text-sm transition-colors ${themeClasses.button.clear}`}
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {safeRecentSearches.map((recentQuery, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleRecentSearchClick(recentQuery)}
                          className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors group ${themeClasses.hover.recent}`}
                        >
                          <FiClock className={`size-4 group-hover:text-purple-500 ${themeClasses.icon.primary}`} />
                          <span className={`group-hover:text-purple-400 ${themeClasses.text.primary}`}>
                            {recentQuery}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Popular Searches */}
                {!searchQuery && (
                  <div className="p-4">
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${themeClasses.text.secondary}`}>
                      <FiTrendingUp className="size-4" />
                      Popular Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleQuickSearch(category)}
                          className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${themeClasses.button.tag}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className={`p-4 border-t ${themeClasses.border} ${themeClasses.background.section}`}>
                <div className="flex justify-between items-center">
                  <div className={`text-sm ${themeClasses.text.tertiary}`}>
                    Press Enter to search
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className={`px-4 py-2 transition-colors text-sm ${themeClasses.button.cancel}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!searchQuery.trim()}
                      className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;