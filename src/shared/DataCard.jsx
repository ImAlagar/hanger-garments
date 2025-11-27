// shared/DataCard.jsx (WITH PAGINATION)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const DataCard = ({ 
  data, 
  keyField = 'id',
  renderItem,
  emptyMessage = "No data found",
  emptyAction,
  className = "",
  layout = true,
  staggerChildren = true,
  onItemClick,
  theme: propTheme,
  disableClickForActions = true,
  // NEW: Pagination props
  pagination = null,
}) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  // Server pagination props
  const {
    serverTotalItems = 0,
    serverTotalPages = 1,
    serverCurrentPage = 1,
    serverPageSize = 10,
    onServerPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50]
  } = pagination || {};

  // Theme-based styles
  const themeStyles = {
    emptyState: {
      container: theme === 'dark' 
        ? 'text-gray-300' 
        : 'text-gray-600',
      icon: theme === 'dark'
        ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-500'
        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400',
      text: {
        primary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
        secondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-400',
      }
    },
    pagination: theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-gray-300'
      : 'bg-white border-gray-200 text-gray-600',
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    text: {
      primary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    },
    hover: {
      button: theme === 'dark'
        ? 'hover:bg-gray-600'
        : 'hover:bg-gray-100',
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: staggerChildren ? 0.1 : 0
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const emptyStateVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };

  const iconVariants = {
    hidden: {
      opacity: 0,
      rotate: -180,
      scale: 0
    },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    }
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  const actionVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.4
      }
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (onServerPageChange) {
      onServerPageChange(page);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  // Handle card click with action button check
  const handleCardClick = (item, event) => {
    const isActionButtonClick = event.target.closest('[data-action-button="true"]');
    
    if (onItemClick && !isActionButtonClick) {
      onItemClick(item);
    }
  };

  // Render pagination component (same as DataTable)
  const renderPagination = () => {
    if (!pagination || serverTotalItems === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 px-4 py-3 rounded-xl shadow-sm border transition-all duration-300 mt-4 ${themeStyles.pagination}`}
      >
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${themeStyles.text.secondary}`}>Show:</span>
          <motion.select
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            value={serverPageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              handlePageSizeChange(newSize);
            }}
            className={`border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeStyles.input}`}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </motion.select>
          <span className={`text-sm ${themeStyles.text.secondary}`}>entries</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Showing Text */}
          <motion.div 
            className={`text-xs sm:text-sm ${themeStyles.text.secondary}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Showing <span className="font-semibold">
              {Math.min((serverCurrentPage - 1) * serverPageSize + 1, serverTotalItems)}
            </span> to{' '}
            <span className="font-semibold">
              {Math.min(serverCurrentPage * serverPageSize, serverTotalItems)}
            </span>{' '}
            of <span className="font-semibold">{serverTotalItems}</span> entries
          </motion.div>

          {/* Pagination Buttons */}
          <div className="flex items-center flex-wrap gap-1 sm:gap-2">

            {/* First Page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(1)}
              disabled={serverCurrentPage === 1}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.text.secondary}`}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Prev Page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(serverCurrentPage - 1)}
              disabled={serverCurrentPage === 1}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.text.secondary}`}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Page Numbers */}
            {[...Array(Math.min(5, serverTotalPages))].map((_, index) => {
              let pageNum;

              if (serverTotalPages <= 5) {
                pageNum = index + 1;
              } else if (serverCurrentPage <= 3) {
                pageNum = index + 1;
              } else if (serverCurrentPage >= serverTotalPages - 2) {
                pageNum = serverTotalPages - 4 + index;
              } else {
                pageNum = serverCurrentPage - 2 + index;
              }

              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    serverCurrentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-sm'
                      : `${themeStyles.text.secondary} ${themeStyles.hover.button}`
                  }`}
                >
                  {pageNum}
                </motion.button>
              );
            })}

            {/* Next Page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(serverCurrentPage + 1)}
              disabled={serverCurrentPage === serverTotalPages}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.text.secondary}`}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>

            {/* Last Page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(serverTotalPages)}
              disabled={serverCurrentPage === serverTotalPages}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.text.secondary}`}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </motion.button>

          </div>
        </div>

      </motion.div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty-state"
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="text-center py-16 px-4"
        >
          <motion.div
            variants={iconVariants}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${themeStyles.emptyState.icon}`}
          >
            <svg 
              className="w-10 h-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
              />
            </svg>
          </motion.div>
          
          <motion.div
            variants={textVariants}
            className={`text-xl font-medium mb-3 ${themeStyles.emptyState.text.primary}`}
          >
            {emptyMessage}
          </motion.div>
          
          <motion.p
            variants={textVariants}
            className={`text-base mb-6 max-w-md mx-auto leading-relaxed ${themeStyles.emptyState.text.secondary}`}
          >
            Try adjusting your search criteria or creating new content
          </motion.p>
          
          {emptyAction && (
            <motion.div
              variants={actionVariants}
            >
              {emptyAction}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Cards Grid */}
      <motion.div
        className={`grid grid-cols-1 gap-4 ${className}`}
        layout={layout ? "position" : false}
      >
        <AnimatePresence mode="popLayout">
          {data.map((item, index) => (
            <motion.div
              key={item[keyField]}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover="hover"
              whileTap="tap"
              layout={layout ? "position" : false}
              custom={index}
              className={`transform-gpu ${onItemClick ? 'cursor-pointer' : ''}`}
              onClick={(e) => handleCardClick(item, e)}
            >
              {renderItem(item)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {renderPagination()}
    </motion.div>
  );
};

export default DataCard;