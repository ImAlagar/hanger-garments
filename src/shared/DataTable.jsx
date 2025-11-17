// shared/DataTable.jsx (Fixed Action & Status Button Issue)
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  loading = false,
  emptyMessage = 'No data found',
  className = '',
  rowClassName = '',
  headerClassName = '',
  bodyClassName = '',
  pagination = true,
  pageSize = 5,
  showSizeChanger = true,
  onPageChange,
  theme: propTheme, // Optional prop to override context theme
  disableRowClickForActions = true // NEW: Add this prop to fix action button issue
}) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Theme-based styles
  const themeStyles = {
    container: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200',
    header: theme === 'dark'
      ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300'
      : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700',
    body: theme === 'dark'
      ? 'bg-gray-800 divide-gray-700'
      : 'bg-white divide-gray-200',
    text: {
      primary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    },
    hover: {
      row: theme === 'dark' 
        ? 'hover:bg-gray-700' 
        : 'hover:bg-blue-50',
      header: theme === 'dark'
        ? 'hover:bg-gray-600'
        : 'hover:bg-gray-200',
      button: theme === 'dark'
        ? 'hover:bg-gray-600'
        : 'hover:bg-gray-100',
    },
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-300',
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    pagination: theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-gray-300'
      : 'bg-white border-gray-200 text-gray-600',
    emptyState: theme === 'dark'
      ? 'bg-gray-700 text-gray-400'
      : 'bg-gray-100 text-gray-400'
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * currentPageSize;
    return sortedData.slice(startIndex, startIndex + currentPageSize);
  }, [sortedData, currentPage, currentPageSize, pagination]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / currentPageSize);

  // Page size options
  const pageSizeOptions = [5, 10, 20, 50];

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // NEW: Handle row click with action column check
  const handleRowClick = (row, event) => {
    // Check if the click came from an action column or status column
    const isActionColumnClick = event.target.closest('[data-action-cell="true"]');
    const isStatusColumnClick = event.target.closest('[data-status-cell="true"]');
    
    if (onRowClick && !isActionColumnClick && !isStatusColumnClick) {
      onRowClick(row);
    }
  };

  // Safe render function
  const safeRender = (render, value, record, index) => {
    try {
      if (typeof render === 'function') {
        const result = render(value, record, index);
        // Ensure we return a valid React child
        if (result === null || result === undefined) {
          return '-';
        }
        if (typeof result === 'object' && !React.isValidElement(result)) {
          return JSON.stringify(result); // Fallback for objects
        }
        return result;
      }
      // Default rendering for primitive values
      if (value == null) return '-';
      if (typeof value === 'object') {
        return JSON.stringify(value); // Fallback for objects
      }
      return String(value);
    } catch (error) {
      console.error('Error rendering cell:', error);
      return 'Error';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${themeStyles.container}`}
      >
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              className={`p-4 border-b last:border-b-0 ${themeStyles.border}`}
            >
              <div className="flex space-x-4">
                {columns.map((col, colIndex) => (
                  <div key={colIndex} className="flex-1">
                    <div className={`h-4 rounded-lg transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                        : 'bg-gradient-to-r from-gray-200 to-gray-300'
                    }`}></div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div
        className={`rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md ${themeStyles.container} ${className}`}
      >
        <div className="transition-all duration-300 overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className={themeStyles.header}>
              <tr>
                {columns.map((column, index) => (
                  <motion.th
                    key={column.key || index}
                    whileHover={column.sortable ? { 
                      backgroundColor: theme === 'dark' ? "rgba(75, 85, 99, 0.8)" : "rgba(229, 231, 235, 0.8)" 
                    } : {}}
                    whileTap={column.sortable ? { scale: 0.98 } : {}}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      column.className || ''
                    } ${
                      column.sortable ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.dataIndex)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <motion.div 
                          className="flex flex-col space-y-0.5"
                          initial={false}
                          animate={{
                            rotate: sortConfig.key === column.dataIndex && sortConfig.direction === 'desc' ? 180 : 0
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M5 15l7-7 7 7" 
                              stroke={sortConfig.key === column.dataIndex ? "#3b82f6" : theme === 'dark' ? "#9ca3af" : "#6b7280"}
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y transition-all duration-300 ${themeStyles.body} ${bodyClassName}`}>
              <AnimatePresence mode="popLayout">
                {paginatedData.length === 0 ? (
                  <motion.tr
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <motion.div 
                        className="flex flex-col items-center justify-center space-y-3 transition-all duration-300"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {typeof emptyMessage === 'string' ? (
                          <>
                            <motion.div 
                              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                              }`}
                              whileHover={{ scale: 1.05, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg className={`w-8 h-8 ${themeStyles.text.muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </motion.div>
                            <motion.div 
                              className={`text-sm font-medium ${themeStyles.text.muted}`}
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              {emptyMessage}
                            </motion.div>
                          </>
                        ) : (
                          emptyMessage
                        )}
                      </motion.div>
                    </td>
                  </motion.tr>
                ) : (
                  paginatedData.map((row, rowIndex) => (
                    <motion.tr
                      key={row[keyField] || rowIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      whileHover={{ 
                        backgroundColor: theme === 'dark' ? "rgba(55, 65, 81, 0.8)" : "rgba(59, 130, 246, 0.05)" 
                      }}
                      whileTap={{ scale: 0.998 }}
                      layout
                      className={`transition-all duration-200 ${
                        onRowClick ? 'cursor-pointer' : ''
                      } ${rowClassName}`}
                      onClick={(e) => handleRowClick(row, e)}
                    >
                      {columns.map((column, colIndex) => (
                        <motion.td
                          key={colIndex}
                          layout="position"
                          // NEW: Add data attributes for action and status columns
                          data-action-cell={column.key === 'actions' ? "true" : undefined}
                          data-status-cell={column.key === 'status' ? "true" : undefined}
                          className={`px-4 py-4 transition-all duration-200 ${
                            column.cellClassName || ''
                          } ${
                            colIndex === 0 
                              ? `sm:px-6 font-medium ${themeStyles.text.primary}` 
                              : `sm:px-4 ${themeStyles.text.secondary}`
                          } ${
                            // NEW: Prevent pointer events on action and status cells to fix click issue
                            column.key === 'actions' || column.key === 'status' ? 'pointer-events-auto' : ''
                          }`}
                        >
                          <div className={column.key === 'actions' || column.key === 'status' ? 'pointer-events-auto' : 'pointer-events-none'}>
                            {safeRender(
                              column.render, 
                              column.dataIndex ? row[column.dataIndex] : row,
                              row, 
                              rowIndex
                            )}
                          </div>
                        </motion.td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 px-4 py-3 rounded-xl shadow-sm border transition-all duration-300 ${themeStyles.pagination}`}
        >
          <div className="flex items-center space-x-2">
            {showSizeChanger && (
              <>
                <span className={`text-sm ${themeStyles.text.secondary}`}>Show:</span>
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  value={currentPageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setCurrentPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  className={`border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeStyles.input}`}
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </motion.select>
                <span className={`text-sm ${themeStyles.text.secondary}`}>entries</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <motion.div 
              className={`text-sm ${themeStyles.text.secondary}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Showing <span className="font-semibold">{(currentPage - 1) * currentPageSize + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(currentPage * currentPageSize, sortedData.length)}
              </span>{' '}
              of <span className="font-semibold">{sortedData.length}</span> entries
            </motion.div>

            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: theme === 'dark' ? "rgba(55, 65, 81, 1)" : "rgba(243, 244, 246, 1)" 
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.text.secondary}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: theme === 'dark' ? "rgba(55, 65, 81, 1)" : "rgba(243, 244, 246, 1)" 
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.text.secondary}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-sm'
                        : `${themeStyles.text.secondary} ${themeStyles.hover.button}`
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: theme === 'dark' ? "rgba(55, 65, 81, 1)" : "rgba(243, 244, 246, 1)" 
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.text.secondary}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: theme === 'dark' ? "rgba(55, 65, 81, 1)" : "rgba(243, 244, 246, 1)" 
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.text.secondary}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DataTable;