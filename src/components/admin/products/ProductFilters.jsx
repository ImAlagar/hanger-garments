// components/admin/products/ProductFilters.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../../redux/slices/productSlice';
import { useTheme } from '../../../context/ThemeContext';

// Import category and subcategory services
import { useGetAllCategoriesQuery } from '../../../redux/services/categoryService';
import { useGetSubcategoriesByCategoryQuery } from '../../../redux/services/subcategoryService';

const ProductFilters = ({ theme: propTheme }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.product);
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  // Fetch categories and subcategories
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { 
    data: subcategoriesResponse, 
    isLoading: subcategoriesLoading,
    isError: subcategoriesError 
  } = useGetSubcategoriesByCategoryQuery(filters.category, { 
    skip: !filters.category 
  });

  // FIX: Properly access categories and subcategories data based on the actual API response structure
  const categories = categoriesResponse?.data?.categories || [];
  const subcategories = subcategoriesResponse?.data || [];


  // Local state for mobile filter panel
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Theme-based styles
  const themeStyles = {
    container: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200',
    text: {
      primary: theme === 'dark' ? 'text-gray-100' : 'text-gray-700',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      label: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
    },
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500',
    button: {
      primary: theme === 'dark'
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: theme === 'dark'
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
      clear: theme === 'dark'
        ? 'text-gray-400 hover:text-gray-200'
        : 'text-gray-600 hover:text-gray-800'
    },
    icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-400',
    badge: theme === 'dark'
      ? 'bg-blue-900 text-blue-200 border-blue-700'
      : 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const handleFilterChange = (key, value) => {
    
    const newFilters = { ...filters };
    
    // Reset subcategory when category changes
    if (key === 'category' && value !== filters.category) {
      newFilters.subcategory = '';
    }
    
    newFilters[key] = value;
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setShowMobileFilters(false);
  };

  const handleClearSingleFilter = (filterKey) => {
    const newFilters = { ...filters };
    
    // Clear subcategory when clearing category
    if (filterKey === 'category') {
      newFilters.subcategory = '';
    }
    
    newFilters[filterKey] = '';
    dispatch(setFilters(newFilters));
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  // Get category name for display
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  // Get subcategory name for display
  const getSubcategoryName = (subcategoryId) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory?.name || 'Unknown Subcategory';
  };

  // Active filters count for mobile badge
  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key] !== '' && filters[key] !== null && filters[key] !== undefined
  ).length;

  // Desktop Filters
  const DesktopFilters = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border shadow-sm mb-4 ${themeStyles.container}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Category Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input}`}
          >
            <option value="">All Categories</option>
            {categoriesLoading ? (
              <option value="" disabled>Loading categories...</option>
            ) : Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No categories available</option>
            )}
          </select>
        </div>

        {/* Subcategory Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Subcategory
          </label>
          <select
            value={filters.subcategory || ''}
            onChange={(e) => handleFilterChange('subcategory', e.target.value)}
            disabled={!filters.category || subcategoriesLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input} ${
              !filters.category ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">All Subcategories</option>
            {subcategoriesLoading ? (
              <option value="" disabled>Loading...</option>
            ) : Array.isArray(subcategories) && subcategories.length === 0 && filters.category ? (
              <option value="" disabled>No subcategories found</option>
            ) : Array.isArray(subcategories) ? (
              subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No subcategories available</option>
            )}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input}`}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Stock Status
          </label>
          <select
            value={filters.stockStatus || ''}
            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input}`}
          >
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${themeStyles.badge}`}>
                Search: "{filters.search}"
                <button
                  onClick={() => handleClearSingleFilter('search')}
                  className="ml-2 hover:opacity-70"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${themeStyles.badge}`}>
                Category: {getCategoryName(filters.category)}
                <button
                  onClick={() => handleClearSingleFilter('category')}
                  className="ml-2 hover:opacity-70"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.subcategory && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${themeStyles.badge}`}>
                Subcategory: {getSubcategoryName(filters.subcategory)}
                <button
                  onClick={() => handleClearSingleFilter('subcategory')}
                  className="ml-2 hover:opacity-70"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${themeStyles.badge}`}>
                Status: {filters.status}
                <button
                  onClick={() => handleClearSingleFilter('status')}
                  className="ml-2 hover:opacity-70"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <motion.button
            onClick={handleClearFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 text-sm transition-colors ${themeStyles.button.clear}`}
          >
            <FiX className="w-4 h-4" />
            <span>Clear All</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  // Mobile Filters Button
  const MobileFiltersButton = () => (
    <div className="lg:hidden mb-4">
      <motion.button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full justify-center ${
          hasActiveFilters ? themeStyles.button.primary : themeStyles.button.secondary
        }`}
      >
        <FiFilter className="w-4 h-4" />
        <span>Filters {hasActiveFilters && `(${activeFiltersCount})`}</span>
      </motion.button>
    </div>
  );

  // Mobile Filters Panel
  const MobileFiltersPanel = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`lg:hidden mobile-filters-panel p-4 rounded-lg border shadow-sm mb-4 ${themeStyles.container}`}
    >
      <div className="space-y-4">

        {/* Category Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input}`}
          >
            <option value="">All Categories</option>
            {categoriesLoading ? (
              <option value="" disabled>Loading categories...</option>
            ) : Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No categories available</option>
            )}
          </select>
        </div>

        {/* Subcategory Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Subcategory
          </label>
          <select
            value={filters.subcategory || ''}
            onChange={(e) => handleFilterChange('subcategory', e.target.value)}
            disabled={!filters.category || subcategoriesLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input} ${
              !filters.category ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">All Subcategories</option>
            {subcategoriesLoading ? (
              <option value="" disabled>Loading...</option>
            ) : Array.isArray(subcategories) && subcategories.length === 0 && filters.category ? (
              <option value="" disabled>No subcategories found</option>
            ) : Array.isArray(subcategories) ? (
              subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No subcategories available</option>
            )}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input}`}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <motion.button
            onClick={() => setShowMobileFilters(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${themeStyles.button.secondary}`}
          >
            Close
          </motion.button>
          
          {hasActiveFilters && (
            <motion.button
              onClick={handleClearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${themeStyles.button.clear}`}
            >
              <FiX className="w-4 h-4" />
              <span>Clear All</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Desktop - Always visible */}
      <div className="hidden lg:block">
        <DesktopFilters />
      </div>

      {/* Mobile - Button and Collapsible Panel */}
      <div className="lg:hidden">
        <MobileFiltersButton />
        {showMobileFilters && <MobileFiltersPanel />}
      </div>
    </>
  );
};

export default ProductFilters;