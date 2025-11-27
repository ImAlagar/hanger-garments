// components/admin/products/AdminProducts.jsx - WITH CLIENT-SIDE FILTERING
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiStar,
  FiTrendingUp,
  FiClock,
  FiPackage,
  FiAlertCircle
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
  useToggleProductStatusMutation,
  useGetProductStatsQuery,
  useBulkDeleteProductsMutation,
  useToggleBestSellerMutation,
  useToggleFeaturedMutation,
  useToggleNewArrivalMutation
} from '../../../../redux/services/productService';
import {
  setSelectedProducts,
  toggleProductSelection,
  clearSelection,
  setFilters,
  setPagination,
  openDeleteModal,
  closeDeleteModal,
  clearError
} from '../../../../redux/slices/productSlice';

// Component imports
import ProductStats from '../../../../components/admin/stats/ProductStats';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';
import ProductFilters from '../../../../components/admin/products/ProductFilters';
import BulkActions from '../../../../components/admin/products/BulkActions';
import { useTheme } from '../../../../context/ThemeContext';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  // Redux state
  const { 
    selectedProducts, 
    filters, 
    pagination,
    deleteModal 
  } = useSelector((state) => state.product);

  // Get all products without filtering (for client-side filtering)
  const {
    data: productsResponse,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useGetAdminProductsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    subcategory: filters.subcategory || undefined,
      status: filters.status || undefined,

  });

  const { data: statsResponse } = useGetProductStatsQuery();
  
  // Mutations
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleStatus, { isLoading: isStatusLoading }] = useToggleProductStatusMutation();
  const [bulkDelete, { isLoading: isBulkDeleting }] = useBulkDeleteProductsMutation();
  const [toggleBestSeller, { isLoading: isBestSellerLoading }] = useToggleBestSellerMutation();
  const [toggleFeatured, { isLoading: isFeaturedLoading }] = useToggleFeaturedMutation();
  const [toggleNewArrival, { isLoading: isNewArrivalLoading }] = useToggleNewArrivalMutation();

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    status: {},
    featured: {},
    bestSeller: {},
    newArrival: {}
  });

  const navigate = useNavigate();

    const serverPagination = productsResponse?.data?.pagination || {};
const serverTotalPages = serverPagination.pages || 1;
  // Extract all products from response
  const allProducts = productsResponse?.data?.products || [];
const totalProducts = serverPagination.total || 0;
  const stats = statsResponse?.data || {};



    // Helper function to get total stock from variants
  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  // CLIENT-SIDE FILTERING FUNCTION
  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];


    let filtered = allProducts;

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm) ||
        product.productCode?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category?.id === filters.category
      );
    }

    // Subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter(product => 
        product.subcategory?.id === filters.subcategory
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(product => 
        product.status === filters.status
      );
    }

    // Stock Status filter
    if (filters.stockStatus) {
      filtered = filtered.filter(product => {
        const totalStock = getTotalStock(product);
        switch (filters.stockStatus) {
          case 'in_stock':
            return totalStock > 10;
          case 'low_stock':
            return totalStock > 0 && totalStock <= 10;
          case 'out_of_stock':
            return totalStock === 0;
          default:
            return true;
        }
      });
    }

    return filtered;

  }, [allProducts, filters]);



  // Theme-based styles
  const themeStyles = {
    background: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    },
    button: {
      primary: theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
      danger: theme === 'dark' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
    },
    input: theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    table: {
      header: theme === 'dark' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200',
      row: theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50',
    }
  };

  // Update pagination when data changes
  useEffect(() => {
    if (productsResponse?.data?.pagination) {
      dispatch(setPagination({
        currentPage: productsResponse.data.pagination.page,
        pageSize: productsResponse.data.pagination.limit,
        totalItems: productsResponse.data.pagination.total,
        totalPages: productsResponse.data.pagination.pages
      }));
    }
  }, [productsResponse, dispatch]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSelection());
    };
  }, [dispatch]);

  // Handlers
  const handleRefresh = () => {
    refetchProducts();
    dispatch(clearSelection());
  };


  const handleServerPageChange = (page) => {
  dispatch(setPagination({ 
    currentPage: page 
  }));
};

const handlePageSizeChange = (newSize) => {
  dispatch(setPagination({ 
    pageSize: newSize,
    currentPage: 1
  }));
};

  const handleDeleteConfirm = async () => {
    try {
      if (deleteModal.isBulk) {
        await bulkDelete(selectedProducts).unwrap();
        dispatch(clearSelection());
      } else {
        await deleteProduct(deleteModal.product.id).unwrap();
      }
      dispatch(closeDeleteModal());
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Set loading state for a specific action and product
  const setActionLoading = (actionType, productId, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [actionType]: {
        ...prev[actionType],
        [productId]: isLoading
      }
    }));
  };

  // Status toggle with loading state
  const handleStatusToggle = async (productId, currentStatus) => {
    setActionLoading('status', productId, true);
    try {
      await toggleStatus({ 
        productId, 
        currentStatus 
      }).unwrap();
    } catch (error) {
      console.error('Status toggle failed:', error);
    } finally {
      setActionLoading('status', productId, false);
    }
  };

  const handleMerchandisingToggle = async (type, productId, currentValue) => {
    setActionLoading(type, productId, true);
    try {
      const newValue = !currentValue;
      
      switch (type) {
        case 'bestSeller':
          await toggleBestSeller({ 
            productId, 
            isBestSeller: newValue 
          }).unwrap();
          break;
        case 'featured':
          await toggleFeatured({ 
            productId, 
            featured: newValue 
          }).unwrap();
          break;
        case 'newArrival':
          await toggleNewArrival({ 
            productId, 
            isNewArrival: newValue 
          }).unwrap();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`${type} toggle failed:`, error);
    } finally {
      setActionLoading(type, productId, false);
    }
  };

  const handleBulkDelete = () => {
    dispatch(openDeleteModal({ isBulk: true }));
  };

  // Helper function to check if any action is loading for a product
  const isProductActionLoading = (productId) => {
    return Object.values(loadingStates).some(state => state[productId]);
  };


  // Helper function to get primary image
  const getPrimaryImage = (product) => {
    const variantWithImage = product.variants?.find(v => 
      v.variantImages && v.variantImages.length > 0
    );
    return variantWithImage?.variantImages?.[0]?.imageUrl || null;
  };

  // Table columns configuration
  const columns = [
    {
      key: 'image',
      title: 'Image',
      dataIndex: 'id',
      render: (value, record) => {
        const imageUrl = getPrimaryImage(record);
        return (
          <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={record.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
              <FiPackage className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
        );
      },
      className: 'w-12'
    },
    {
      key: 'name',
      title: 'Product Name',
      dataIndex: 'name',
      sortable: true,
      render: (value, record) => (
        <div className="min-w-0">
          <p className={`font-medium truncate ${themeStyles.text.primary}`}>{value}</p>
          <p className={`text-sm truncate ${themeStyles.text.muted}`}>{record.productCode}</p>
          <div className="flex items-center space-x-2 mt-1">
            {record.isBestSeller && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
              }`}>
                <FiTrendingUp className="w-3 h-3 mr-1" />
                Best Seller
              </span>
            )}
            {record.isNewArrival && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                <FiClock className="w-3 h-3 mr-1" />
                New
              </span>
            )}
            {record.featured && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
              }`}>
                <FiStar className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
          </div>
        </div>
      ),
      className: 'min-w-48'
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'category',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
        }`}>
          {value?.name || 'Uncategorized'}
        </span>
      )
    },

    {
      key: 'price',
      title: 'Price',
      dataIndex: 'normalPrice',
      sortable: true,
      render: (value, record) => {
        const normalPrice = parseFloat(record.normalPrice || 0);
        const offerPrice = parseFloat(record.offerPrice || 0);
        const hasSpecialOffer = offerPrice > 0 && offerPrice !== normalPrice;
        
        return (
          <div>
            <span className={`font-medium ${themeStyles.text.primary}`}>
              ₹{normalPrice.toFixed(2)}
            </span>
            {hasSpecialOffer && (
              <span className={`text-sm ml-1 ${
                offerPrice < normalPrice ? 'text-green-600' : 'text-orange-600'
              }`}>
                {offerPrice < normalPrice ? 'Offer: ' : 'Premium: '}
                ₹{offerPrice.toFixed(2)}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'stock',
      title: 'Stock',
      dataIndex: 'id',
      sortable: true,
      render: (value, record) => {
        const totalStock = getTotalStock(record);
        const isOutOfStock = totalStock === 0;
        const isLowStock = totalStock > 0 && totalStock < 10;
        
        return (
          <div className="flex items-center space-x-2">
            <span className={
              isOutOfStock ? 'text-red-600 font-medium' : 
              isLowStock ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'
            }>
              {totalStock}
            </span>
            {isOutOfStock && (
              <FiAlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (status, record) => {
        const isLoading = loadingStates.status[record.id];
        return (
          <button
            onClick={() => handleStatusToggle(record.id, status)}
            disabled={isLoading}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              status === 'ACTIVE'
                ? theme === 'dark' 
                  ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <FiRefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : null}
            {isLoading ? 'Updating...' : status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </button>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      render: (value, record) => {
        const isFeaturedLoading = loadingStates.featured[record.id];
        const isBestSellerLoading = loadingStates.bestSeller[record.id];
        const isNewArrivalLoading = loadingStates.newArrival[record.id];
        const isAnyActionLoading = isProductActionLoading(record.id);

        return (
          <div className="flex items-center space-x-2">
            {/* Featured Toggle */}
            <button
              onClick={() => handleMerchandisingToggle('featured', record.id, record.featured)}
              disabled={isFeaturedLoading || isAnyActionLoading}
              className={`p-2 rounded-lg transition-colors ${
                record.featured 
                  ? theme === 'dark'
                    ? 'text-purple-400 bg-purple-900 hover:bg-purple-800'
                    : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-400 hover:bg-gray-100'
              } ${isFeaturedLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={record.featured ? 'Remove from Featured' : 'Add to Featured'}
            >
              {isFeaturedLoading ? (
                <FiRefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FiStar className="w-4 h-4" />
              )}
            </button>
            
            {/* Best Seller Toggle */}
            <button
              onClick={() => handleMerchandisingToggle('bestSeller', record.id, record.isBestSeller)}
              disabled={isBestSellerLoading || isAnyActionLoading}
              className={`p-2 rounded-lg transition-colors ${
                record.isBestSeller 
                  ? theme === 'dark'
                    ? 'text-yellow-400 bg-yellow-900 hover:bg-yellow-800'
                    : 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-400 hover:bg-gray-100'
              } ${isBestSellerLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={record.isBestSeller ? 'Remove from Best Sellers' : 'Add to Best Sellers'}
            >
              {isBestSellerLoading ? (
                <FiRefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FiTrendingUp className="w-4 h-4" />
              )}
            </button>

            {/* New Arrival Toggle */}
            <button
              onClick={() => handleMerchandisingToggle('newArrival', record.id, record.isNewArrival)}
              disabled={isNewArrivalLoading || isAnyActionLoading}
              className={`p-2 rounded-lg transition-colors ${
                record.isNewArrival 
                  ? theme === 'dark'
                    ? 'text-blue-400 bg-blue-900 hover:bg-blue-800'
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-400 hover:bg-gray-100'
              } ${isNewArrivalLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={record.isNewArrival ? 'Remove from New Arrivals' : 'Add to New Arrivals'}
            >
              {isNewArrivalLoading ? (
                <FiRefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FiClock className="w-4 h-4" />
              )}
            </button>
            
            {/* View Button */}
            <Link
              to={`/dashboard/products/view/${value}`}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-blue-400 hover:bg-blue-900'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              title="View Details"
            >
              <FiEye className="w-4 h-4" />
            </Link>
            
            {/* Edit Button */}
            <Link
              to={`/dashboard/products/edit/${value}`}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-green-400 hover:bg-green-900'
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title="Edit Product"
            >
              <FiEdit2 className="w-4 h-4" />
            </Link>
            
            {/* Delete Button */}
            <button
              onClick={() => dispatch(openDeleteModal({ product: record }))}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-red-400 hover:bg-red-900'
                  : 'text-red-600 hover:bg-red-50'
              }`}
              title="Delete Product"
              disabled={isDeleting || isAnyActionLoading}
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  // Mobile card renderer
  const renderProductCard = (product) => {
    const imageUrl = getPrimaryImage(product);
    const totalStock = getTotalStock(product);
    const isOutOfStock = totalStock === 0;
    const isLowStock = totalStock > 0 && totalStock < 10;

    const isStatusLoading = loadingStates.status[product.id];
    const isFeaturedLoading = loadingStates.featured[product.id];
    const isBestSellerLoading = loadingStates.bestSeller[product.id];
    const isAnyActionLoading = isProductActionLoading(product.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${themeStyles.card}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
          {/* Product Image */}
          <div className={`w-20 h-20 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center ${
                imageUrl ? "hidden" : "flex"
              }`}
            >
              <FiPackage className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0 w-full">
            {/* Top section: name + actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
              {/* Left: Name + Code + Badges */}
              <div className="min-w-0">
                <h3 className={`font-medium truncate text-center sm:text-left ${themeStyles.text.primary}`}>
                  {product.name}
                </h3>
                <p className={`text-center sm:text-left text-sm ${themeStyles.text.muted}`}>
                  {product.productCode}
                </p>

                {/* Merchandising badges */}
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1 mt-1">
                  {product.isBestSeller && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <FiTrendingUp className="w-3 h-3 mr-1" /> Best
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    }`}>
                      <FiClock className="w-3 h-3 mr-1" /> New
                    </span>
                  )}
                  {product.featured && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                    }`}>
                      <FiStar className="w-3 h-3 mr-1" /> Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Status + Merch Buttons */}
              <div className="flex flex-col sm:items-end items-center space-y-2">
                {/* Status toggle */}
                <button
                  onClick={() => handleStatusToggle(product.id, product.status)}
                  disabled={isStatusLoading || isAnyActionLoading}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    product.status === "ACTIVE"
                      ? theme === 'dark' 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-green-100 text-green-800'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-800'
                  } ${isStatusLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isStatusLoading && (
                    <FiRefreshCw className="w-3 h-3 animate-spin" />
                  )}
                  <span>
                    {isStatusLoading
                      ? "Updating..."
                      : product.status === "ACTIVE"
                      ? "Active"
                      : "Inactive"}
                  </span>
                </button>

                {/* Merchandising toggles */}
                <div className="flex space-x-1">
                  <button
                    onClick={() =>
                      handleMerchandisingToggle(
                        "featured",
                        product.id,
                        product.featured
                      )
                    }
                    disabled={isFeaturedLoading || isAnyActionLoading}
                    className={`p-1 rounded ${
                      product.featured
                        ? theme === 'dark' 
                          ? 'text-purple-400 bg-purple-900' 
                          : 'text-purple-600 bg-purple-50'
                        : theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-400'
                    } ${
                      isFeaturedLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isFeaturedLoading ? (
                      <FiRefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <FiStar className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleMerchandisingToggle(
                        "bestSeller",
                        product.id,
                        product.isBestSeller
                      )
                    }
                    disabled={isBestSellerLoading || isAnyActionLoading}
                    className={`p-1 rounded ${
                      product.isBestSeller
                        ? theme === 'dark' 
                          ? 'text-yellow-400 bg-yellow-900' 
                          : 'text-yellow-600 bg-yellow-50'
                        : theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-400'
                    } ${
                      isBestSellerLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isBestSellerLoading ? (
                      <FiRefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <FiTrendingUp className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Price + Stock */}
            <div className="flex flex-wrap justify-between items-center text-sm mt-2">
              <div className="flex flex-col">
                <span className={`font-medium ${themeStyles.text.primary}`}>
                  ₹{parseFloat(product.normalPrice || 0).toFixed(2)}
                </span>
                {product.offerPrice && product.offerPrice > 0 && product.offerPrice !== product.normalPrice && (
                  <span className={`text-xs ${product.offerPrice < product.normalPrice ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.offerPrice < product.normalPrice ? 'Offer: ' : 'Premium: '}
                    ₹{parseFloat(product.offerPrice).toFixed(2)}
                  </span>
                )}
              </div>
              <span
                className={`font-medium ${
                  isOutOfStock
                    ? "text-red-600"
                    : isLowStock
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {totalStock} in stock
              </span>
            </div>

            {/* Bottom: Category + Actions */}
            <div className={`flex flex-wrap justify-between items-center mt-3 pt-3 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex flex-col">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                } mb-1`}>
                  {product.category?.name || "Uncategorized"}
                </span>
                {product.subcategory?.name && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.subcategory.name}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/dashboard/products/view/${product.id}`}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-blue-400 hover:bg-blue-900' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <FiEye className="w-4 h-4" />
                </Link>
                <Link
                  to={`/dashboard/products/edit/${product.id}`}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-green-400 hover:bg-green-900' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  <FiEdit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => dispatch(openDeleteModal({ product }))}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-red-400 hover:bg-red-900' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  disabled={isDeleting || isAnyActionLoading}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen p-3 sm:p-4 lg:p-6 ${themeStyles.background}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl font-italiana sm:text-3xl font-bold truncate ${themeStyles.text.primary}`}>
                Products Management
              </h1>
            <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
              Manage your product inventory • {totalProducts} total products
            </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={productsLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${productsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center space-x-2 border px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <Link
                to="/dashboard/products/add"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Product</span>
              </Link>
            </div>
          </div>

          {/* Product Statistics */}
          <div className="mb-6 lg:mb-8">
            <ProductStats stats={stats} theme={theme} />
          </div>
        </div>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ProductFilters theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <BulkActions 
            selectedCount={selectedProducts.length}
            onBulkDelete={handleBulkDelete}
            isLoading={isBulkDeleting}
            theme={theme}
          />
        )}

        {/* Products Display */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}>
      {isMobile ? (
        <div className="p-4">
          <DataCard
            data={filteredProducts}
            renderItem={renderProductCard}
            onItemClick={(product) => navigate(`/dashboard/products/view/${product.id}`)}
            emptyMessage="No products found"
            emptyAction={
              <Link
                to="/dashboard/products/add"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Your First Product</span>
              </Link>
            }
            theme={theme}
            // NEW: Add pagination props
            pagination={{
              serverTotalItems: totalProducts,
              serverTotalPages: serverTotalPages,
              serverCurrentPage: pagination.currentPage,
              serverPageSize: pagination.pageSize,
              onServerPageChange: handleServerPageChange,
              onPageSizeChange: handlePageSizeChange,
              pageSizeOptions: [10, 20, 50]
            }}
          />
        </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredProducts}
              keyField="id"
              loading={productsLoading}
              onRowClick={(product) => navigate(`/dashboard/products/view/${product.id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <div className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No products found</div>
                  <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                    Try adjusting your filters or add a new product
                  </p>
                  <Link
                    to="/dashboard/products/add"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </Link>
                </div>
              }

              pagination={{
                  serverTotalItems: totalProducts,
                  serverTotalPages: serverTotalPages,
                  serverCurrentPage: pagination.currentPage,
                  serverPageSize: pagination.pageSize,
                  onServerPageChange: handleServerPageChange,
                  onPageSizeChange: handlePageSizeChange,
                  pageSizeOptions: [10, 20, 50]
                }}
              className="border-0"
              theme={theme}
            />
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => dispatch(closeDeleteModal())}
          onConfirm={handleDeleteConfirm}
          title={deleteModal.isBulk ? 'Delete Multiple Products' : 'Delete Product'}
          message={
            deleteModal.isBulk
              ? `Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`
              : `Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`
          }
          confirmText={deleteModal.isBulk ? `Delete ${selectedProducts.length} Products` : 'Delete Product'}
          isLoading={isDeleting || isBulkDeleting}
          theme={theme}
        />
      </motion.div>
    </div>
  );
};

export default AdminProducts;