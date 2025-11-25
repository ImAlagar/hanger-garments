// src/components/admin/quantity-pricing/AdminQuantityPricing.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiEdit2,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiPackage,
  FiFolder,
  FiPercent,
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import {
  useGetAllSubcategoriesWithQuantityPricingQuery,
  useDeleteSubcategoryQuantityPriceMutation,
  useToggleSubcategoryQuantityPriceStatusMutation,
} from '../../../../redux/services/subcategoryService';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';

const AdminQuantityPricing = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    price: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  // RTK Query hooks
  const { 
    data: subcategoriesResponse, 
    isLoading, 
    refetch,
    error 
  } = useGetAllSubcategoriesWithQuantityPricingQuery();

  const [deleteQuantityPrice] = useDeleteSubcategoryQuantityPriceMutation();
  const [toggleStatus] = useToggleSubcategoryQuantityPriceStatusMutation();

  const subcategories = subcategoriesResponse?.data || [];

  // ✅ FIXED: Use useMemo instead of useEffect with state updates
  const filteredSubcategories = useMemo(() => {
    if (searchTerm) {
      return subcategories.filter(subcategory =>
        subcategory.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcategory.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcategory.quantityPrices?.some(price => 
          price.quantity?.toString().includes(searchTerm) ||
          price.value?.toString().includes(searchTerm)
        )
      );
    }
    return subcategories;
  }, [searchTerm, subcategories]);

  const themeStyles = useMemo(() => ({
    background: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    },
    table: {
      header: theme === 'dark' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200',
      row: theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50',
    }
  }), [theme]);

  // Handle window resize - ✅ FIXED: Add empty dependency array
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers - ✅ FIXED: Use useCallback to prevent unnecessary re-renders
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteQuantityPrice(deleteModal.price.id).unwrap();
      toast.success('Quantity price deleted successfully!');
      setDeleteModal({ isOpen: false, price: null });
      refetch();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error?.data?.message || 'Failed to delete quantity price');
    }
  }, [deleteModal.price, deleteQuantityPrice, refetch]);

  const handleToggleStatus = useCallback(async (quantityPriceId, currentStatus) => {
    try {
      await toggleStatus({
        quantityPriceId,
        isActive: !currentStatus
      }).unwrap();
      
      toast.success(`Quantity price ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      refetch();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error?.data?.message || 'Failed to update status');
    }
  }, [toggleStatus, refetch]);

  const openDeleteModal = useCallback((price) => {
    setDeleteModal({ isOpen: true, price });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, price: null });
  }, []);

  const handleSubcategoryToggle = useCallback((subcategory) => {
    setSelectedSubcategory(current => 
      current?.id === subcategory.id ? null : subcategory
    );
  }, []);

  // Calculate totals - ✅ FIXED: Use useMemo for derived data
  const { totalSubcategories, totalPricingRules, subcategoriesWithPricing } = useMemo(() => {
    const totalSubcategories = subcategories.length;
    const totalPricingRules = subcategories.reduce((total, subcategory) => 
      total + (subcategory.quantityPrices?.length || 0), 0
    );
    const subcategoriesWithPricing = subcategories.filter(
      subcategory => subcategory.quantityPrices?.length > 0
    ).length;

    return { totalSubcategories, totalPricingRules, subcategoriesWithPricing };
  }, [subcategories]);

  // Table columns for quantity prices - ✅ FIXED: Move inside component but use useMemo
  const quantityPriceColumns = useMemo(() => [
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'quantity',
      sortable: true,
      render: (value) => (
        <span className={`font-semibold ${themeStyles.text.primary}`}>
          Buy {value}
        </span>
      )
    },
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'priceType',
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value === 'PERCENTAGE' ? (
            <FiPercent className="w-4 h-4 text-green-600" />
          ) : (
            <FiDollarSign className="w-4 h-4 text-blue-600" />
          )}
          <span className={`text-sm ${themeStyles.text.primary}`}>
            {value === 'PERCENTAGE' ? 'Percentage' : 'Fixed Price'}
          </span>
        </div>
      )
    },
    {
      key: 'value',
      title: 'Value',
      dataIndex: 'value',
      render: (value, record) => (
        <span className={`font-medium ${
          record.priceType === 'PERCENTAGE' ? 'text-green-600' : 'text-blue-600'
        }`}>
          {record.priceType === 'PERCENTAGE' ? `${value}% off` : `₹${value}`}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'isActive',
      render: (isActive, record) => (
        <button
          onClick={() => handleToggleStatus(record.id, isActive)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isActive
              ? theme === 'dark' 
                  ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {isActive ? (
            <FiToggleRight className="w-3 h-3 mr-1" />
          ) : (
            <FiToggleLeft className="w-3 h-3 mr-1" />
          )}
          {isActive ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      render: (value, record) => (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <Link
            to={`/dashboard/quantity-pricing/view/${selectedSubcategory?.id}/${value}`}
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
            to={`/dashboard/quantity-pricing/edit/${selectedSubcategory?.id}/${value}`}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-green-400 hover:bg-green-900'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title="Edit Price"
          >
            <FiEdit2 className="w-4 h-4" />
          </Link>
          
          {/* Delete Button */}
          <button
            onClick={() => openDeleteModal(record)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Delete Price"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [theme, themeStyles, handleToggleStatus, openDeleteModal, selectedSubcategory?.id]);

  // Mobile card renderer for subcategories
  const renderSubcategoryCard = useCallback((subcategory) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 ${themeStyles.card}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold ${themeStyles.text.primary} mb-1`}>
            {subcategory.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm">
            <FiFolder className={`w-3 h-3 ${themeStyles.text.muted}`} />
            <span className={themeStyles.text.muted}>{subcategory.category?.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              subcategory.quantityPrices?.length > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {subcategory.quantityPrices?.length || 0} rules
            </span>
          </div>
        </div>
        <button
          onClick={() => handleSubcategoryToggle(subcategory)}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {selectedSubcategory?.id === subcategory.id ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quantity Prices for this subcategory */}
      <AnimatePresence>
        {selectedSubcategory?.id === subcategory.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            {subcategory.quantityPrices?.length > 0 ? (
              subcategory.quantityPrices.map((price) => (
                <div
                  key={price.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  } ${!price.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className={`font-medium ${themeStyles.text.primary}`}>
                        Buy {price.quantity}
                      </span>
                      <span className={`text-sm font-medium ${
                        price.priceType === 'PERCENTAGE' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {price.priceType === 'PERCENTAGE' 
                          ? `${price.value}% discount` 
                          : `₹${price.value} total`
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(price.id, price.isActive)}
                        className={`text-xs px-2 py-1 rounded ${
                          price.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {price.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Link
                      to={`/dashboard/quantity-pricing/view/${subcategory.id}/${price.id}`}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <FiEye size={14} />
                    </Link>
                    <Link
                      to={`/dashboard/quantity-pricing/edit/${subcategory.id}/${price.id}`}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <FiEdit2 size={14} />
                    </Link>
                    <button
                      onClick={() => openDeleteModal(price)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-4 ${themeStyles.text.muted}`}>
                <FiPackage className="mx-auto text-2xl mb-2 opacity-50" />
                <p className="text-sm">No quantity prices set</p>
                <Link
                  to={`/dashboard/quantity-pricing/add?subcategory=${subcategory.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block"
                >
                  Add pricing rules
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  ), [theme, themeStyles, selectedSubcategory, handleSubcategoryToggle, handleToggleStatus, openDeleteModal]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiRefreshCw className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading quantity pricing data</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                Quantity Pricing Management
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
                Manage bulk pricing rules across all subcategories
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <Link
                to="/dashboard/quantity-pricing/add"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Quantity Price</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`rounded-lg p-4 ${themeStyles.card} border-l-4 border-blue-500`}>
              <div className="flex items-center">
                <FiPackage className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className={`text-sm ${themeStyles.text.muted}`}>Total Subcategories</p>
                  <p className={`text-2xl font-bold ${themeStyles.text.primary}`}>{totalSubcategories}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-lg p-4 ${themeStyles.card} border-l-4 border-green-500`}>
              <div className="flex items-center">
                <FiPercent className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className={`text-sm ${themeStyles.text.muted}`}>Pricing Rules</p>
                  <p className={`text-2xl font-bold ${themeStyles.text.primary}`}>{totalPricingRules}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-lg p-4 ${themeStyles.card} border-l-4 border-purple-500`}>
              <div className="flex items-center">
                <FiFolder className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className={`text-sm ${themeStyles.text.muted}`}>With Pricing</p>
                  <p className={`text-2xl font-bold ${themeStyles.text.primary}`}>{subcategoriesWithPricing}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className={`rounded-lg p-4 ${themeStyles.card} mb-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeStyles.text.muted}`} />
                <input
                  type="text"
                  placeholder="Search subcategories, categories, or pricing rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex items-center space-x-2">
                <FiFilter className={themeStyles.text.muted} />
                <span className={themeStyles.text.muted}>
                  {filteredSubcategories.length} of {subcategories.length} subcategories
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories List */}
        <div className="space-y-4">
          {filteredSubcategories.length > 0 ? (
            filteredSubcategories.map((subcategory) => (
              <div key={subcategory.id}>
                {isMobile ? (
                  renderSubcategoryCard(subcategory)
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}
                  >
                    {/* Subcategory Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className={`text-xl font-semibold ${themeStyles.text.primary} mb-2`}>
                            {subcategory.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={themeStyles.text.muted}>
                              Category: {subcategory.category?.name || 'Uncategorized'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              subcategory.quantityPrices?.length > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {subcategory.quantityPrices?.length || 0} pricing rules
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {subcategory.products?.length || 0} products
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSubcategoryToggle(subcategory)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                            theme === 'dark' 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white`}
                        >
                          <span>
                            {selectedSubcategory?.id === subcategory.id ? 'Hide' : 'Show'} Pricing
                          </span>
                          {selectedSubcategory?.id === subcategory.id ? (
                            <FiChevronUp className="w-4 h-4" />
                          ) : (
                            <FiChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quantity Prices Table */}
                    <AnimatePresence>
                      {selectedSubcategory?.id === subcategory.id && subcategory.quantityPrices?.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-6"
                        >
                          <DataTable
                            columns={quantityPriceColumns}
                            data={subcategory.quantityPrices}
                            keyField="id"
                            emptyMessage="No quantity prices found for this subcategory"
                            className="border-0"
                            theme={theme}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            ))
          ) : (
            <div className={`text-center py-12 ${themeStyles.text.muted}`}>
              <FiPackage className="mx-auto text-4xl mb-4" />
              <p className="text-lg mb-2">No subcategories found</p>
              <p className="text-sm mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create subcategories first to set up quantity pricing'}
              </p>
              {!searchTerm && (
                <Link
                  to="/dashboard/subcategories/add"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create Subcategory</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Quantity Price"
          message={
            `Are you sure you want to delete the "Buy ${deleteModal.price?.quantity}" pricing rule? This action cannot be undone.`
          }
          confirmText="Delete Price Rule"
          theme={theme}
        />
      </motion.div>
    </div>
  );
};

export default AdminQuantityPricing;