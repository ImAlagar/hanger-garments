// components/admin/products/ProductFilters.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../../redux/slices/productSlice';
import { useTheme } from '../../../context/ThemeContext';

const ProductFilters = ({ theme: propTheme }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.product);
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

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
    button: theme === 'dark'
      ? 'text-gray-400 hover:text-gray-200'
      : 'text-gray-600 hover:text-gray-800',
    icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border shadow-sm mb-4 ${themeStyles.container}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Search Products
          </label>
          <div className="relative">
            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeStyles.icon}`} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or SKU..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${themeStyles.input}`}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input}`}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Stock Status */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Stock Status
          </label>
          <select
            value={filters.stockStatus}
            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input}`}
          >
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeStyles.text.label}`}>
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${themeStyles.input}`}
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="updatedAt">Last Updated</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <motion.button
            onClick={handleClearFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 text-sm transition-colors ${themeStyles.button}`}
          >
            <FiX className="w-4 h-4" />
            <span>Clear All Filters</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default ProductFilters;