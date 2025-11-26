import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiXCircle, FiClock, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import { motionVariants } from '../../../constants/headerConstants';

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

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            variants={motionVariants.search}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="search-container bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center px-6 py-5 border-b border-gray-100">
                <FiSearch className="text-gray-400 size-6 mr-4" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search t-shirts, collections, styles..."
                  className="flex-1 text-xl bg-transparent border-none outline-none placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                        <span className="ml-3 text-gray-600">Searching...</span>
                      </div>
                    )}
                    
                    {searchError && (
                      <div className="text-center py-8 text-red-500">
                        <p>Error searching products</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Please try again later
                        </p>
                      </div>
                    )}
                    
                    {!isSearchLoading && !searchError && products.length > 0 && (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-gray-700">
                            Products ({totalResults})
                          </h3>
                          <button
                            type="button"
                            onClick={handleViewAllResults}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            View All Results
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {products.slice(0, 5).map((product) => (
                            <div
                              key={product.id}
                              onClick={() => handleProductClick && handleProductClick(product)}
                              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                            >
                              {product.variants?.[0]?.variantImages?.[0]?.imageUrl ? (
                                <img
                                  src={product.variants[0].variantImages[0].imageUrl}
                                  alt={product.name}
                                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <FiShoppingBag className="text-gray-400 size-6" />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-500 truncate">
                                  {product.category?.name} • {product.subcategory?.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-purple-600 font-semibold">
                                    ₹{product.offerPrice || product.normalPrice}
                                  </span>
                                  {product.offerPrice && product.offerPrice < product.normalPrice && (
                                    <span className="text-gray-400 text-sm line-through">
                                      ₹{product.normalPrice}
                                    </span>
                                  )}
                                  {product.isBestSeller && (
                                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
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
                        <FiSearch className="mx-auto text-gray-300 size-12 mb-3" />
                        <p className="text-gray-500 mb-2">No products found for "{searchQuery}"</p>
                        <p className="text-sm text-gray-400">
                          Try different keywords or check the spelling
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Recent Searches */}
                {!searchQuery && safeRecentSearches.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <FiClock className="size-4" />
                        Recent Searches
                      </h3>
                      <button
                        type="button"
                        onClick={() => clearRecentSearches && clearRecentSearches()}
                        className="text-gray-400 hover:text-gray-600 text-sm"
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
                          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 text-left transition-colors group"
                        >
                          <FiClock className="text-gray-400 size-4 group-hover:text-purple-500" />
                          <span className="text-gray-700 group-hover:text-purple-600">
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
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiTrendingUp className="size-4" />
                      Popular Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleQuickSearch(category)}
                          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-700 text-sm transition-colors duration-200"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Press Enter to search
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
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
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;