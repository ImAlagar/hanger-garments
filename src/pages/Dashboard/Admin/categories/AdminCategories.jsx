// components/admin/categories/AdminCategories.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiEdit2,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiImage,
  FiPackage
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetAllCategoriesQuery,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  useGetCategoryStatsQuery,
} from '../../../../redux/services/categoryService';

// Component imports
import CategoryStats from '../../../../components/admin/stats/CategoryStats';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';
import { useTheme } from '../../../../context/ThemeContext';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null
  });

  // RTK Query hooks
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useGetAllCategoriesQuery();

  const { data: statsResponse } = useGetCategoryStatsQuery();
  
  // Mutations
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleStatus, { isLoading: isStatusLoading }] = useToggleCategoryStatusMutation();

  // Extract data
  const categories = categoriesResponse?.data || [];
  const stats = statsResponse?.data || {};

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleRefresh = () => {
    refetchCategories();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(deleteModal.category.id).unwrap();
      setDeleteModal({ isOpen: false, category: null });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

const handleStatusToggle = async (categoryId, currentStatus) => {
  try {
    await toggleStatus({ 
      categoryId, 
      currentStatus 
    }).unwrap();
  } catch (error) {
    console.error('Status toggle failed:', error);
  }
};

  const openDeleteModal = (category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'image',
      title: 'Image',
      dataIndex: 'id',
      render: (value, record) => (
        <div className={`w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          {record.image ? (
            <img 
              src={record.image} 
              alt={record.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${record.image ? 'hidden' : 'flex'}`}>
            <FiImage className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>
      ),
      className: 'w-16'
    },
    {
      key: 'name',
      title: 'Category Name',
      dataIndex: 'name',
      sortable: true,
      render: (value, record) => (
        <div className="min-w-0">
          <p className={`font-medium truncate ${themeStyles.text.primary}`}>{value}</p>
          <p className={`text-sm truncate ${themeStyles.text.muted}`}>
            {record.description || 'No description'}
          </p>
        </div>
      ),
      className: 'min-w-48'
    },
    {
      key: 'products',
      title: 'Products',
      dataIndex: 'id',
      render: (value, record) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
        }`}>
          <FiPackage className="w-3 h-3 mr-1" />
          {record._count?.products || 0}
        </span>
      )
    },
{
  key: 'status',
  title: 'Status',
  dataIndex: 'isActive',
  render: (isActive, record) => (
    <button
      onClick={() => handleStatusToggle(record.id, isActive)}
      disabled={isStatusLoading}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        isActive
          ? theme === 'dark' 
            ? 'bg-green-900 text-green-200 hover:bg-green-800' 
            : 'bg-green-100 text-green-800 hover:bg-green-200'
          : theme === 'dark'
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } ${isStatusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-action-button="true" // ADD THIS
    >
      {isStatusLoading ? (
        <FiRefreshCw className="w-3 h-3 mr-1 animate-spin" />
      ) : isActive ? (
        <FiToggleRight className="w-3 h-3 mr-1" />
      ) : (
        <FiToggleLeft className="w-3 h-3 mr-1" />
      )}
      {isStatusLoading ? 'Updating...' : isActive ? 'Active' : 'Inactive'}
    </button>
  )
},
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      render: (value) => (
        <span className={themeStyles.text.muted}>
          {new Date(value).toLocaleDateString()}
        </span>
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
        to={`/dashboard/categories/view/${value}`}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'text-blue-400 hover:bg-blue-900'
            : 'text-blue-600 hover:bg-blue-50'
        }`}
        title="View Details"
        data-action-button="true"
      >
        <FiEye className="w-4 h-4" />
      </Link>
      
      {/* Edit Button - ADD THIS */}
      <Link
        to={`/dashboard/categories/edit/${value}`}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'text-green-400 hover:bg-green-900'
            : 'text-green-600 hover:bg-green-50'
        }`}
        title="Edit Category"
        data-action-button="true"
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
        title="Delete Category"
        disabled={isDeleting}
        data-action-button="true"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
  ];

    const renderCategoryCard = (category) => {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${themeStyles.card}`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
            
            {/* Category Image */}
            <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${category.image ? "hidden" : "flex"}`}>
                <FiImage className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
            </div>

            {/* Category Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              
              {/* Top section: Name, Description, Status */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2 w-full">
                <div className="min-w-0">
                  <h3 className={`font-medium truncate text-ellipsis overflow-hidden ${themeStyles.text.primary}`}>
                    {category.name}
                  </h3>
                  <p className={`text-sm line-clamp-2 overflow-hidden text-ellipsis ${themeStyles.text.muted}`}>
                    {category.description || 'No description'}
                  </p>
                </div>

                {/* Status toggle */}
                <button
                  onClick={() => handleStatusToggle(category.id, category.isActive)}
                  disabled={isStatusLoading}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 mt-2 sm:mt-0 whitespace-nowrap ${
                    category.isActive
                      ? theme === 'dark' 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-green-100 text-green-800'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-800'
                  } ${isStatusLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  data-action-button="true"
                >
                  {isStatusLoading && <FiRefreshCw className="w-3 h-3 animate-spin" />}
                  <span>
                    {isStatusLoading
                      ? "Updating..."
                      : category.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </button>
              </div>

              {/* Bottom section: Count + Action buttons */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } gap-2 sm:gap-0 w-full`}>
                
                {/* Product count */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  <FiPackage className="w-3 h-3 mr-1" />
                  {category._count?.products || 0} products
                </span>
                
                {/* Action buttons */}
                <div className="flex flex-wrap sm:flex-nowrap space-x-2 mt-2 sm:mt-0">
                  <Link
                    to={`/dashboard/categories/view/${category.id}`}
                    className={`p-1 rounded transition-colors ${
                      theme === 'dark' ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    data-action-button="true"
                  >
                    <FiEye className="w-4 h-4" />
                  </Link>
                  
                  <Link
                    to={`/dashboard/categories/edit/${category.id}`}
                    className={`p-1 rounded transition-colors ${
                      theme === 'dark' ? 'text-green-400 hover:bg-green-900' : 'text-green-600 hover:bg-green-50'
                    }`}
                    data-action-button="true"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => openDeleteModal(category)}
                    className={`p-1 rounded transition-colors ${
                      theme === 'dark' ? 'text-red-400 hover:bg-red-900' : 'text-red-600 hover:bg-red-50'
                    }`}
                    disabled={isDeleting}
                    data-action-button="true"
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
                Categories Management
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
                Manage your product categories • {categories.length} total categories
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={categoriesLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${categoriesLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <Link
                to="/dashboard/categories/add"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Category</span>
              </Link>
            </div>
          </div>

          {/* Category Statistics */}
          <div className="mb-6 lg:mb-8">
            <CategoryStats stats={stats} />
          </div>
        </div>

        {/* Categories Display */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}>
          {isMobile ? (
            <div className="p-4">
              <DataCard
                data={categories}
                renderItem={renderCategoryCard}
                onItemClick={(category) => navigate(`/dashboard/categories/view/${category.id}`)}
                emptyMessage="No categories found"
                emptyAction={
                  <Link
                    to="/dashboard/categories/add"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Your First Category</span>
                  </Link>
                }
                theme={theme}
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={categories}
              keyField="id"
              loading={categoriesLoading}
              onRowClick={(category) => navigate(`/dashboard/categories/view/${category.id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <div className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No categories found</div>
                  <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                    Get started by creating your first category
                  </p>
                  <Link
                    to="/dashboard/categories/add"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add New Category</span>
                  </Link>
                </div>
              }
              className="border-0"
              theme={theme}
            />
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Category"
          message={
            `Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone.`
          }
          confirmText="Delete Category"
          isLoading={isDeleting}
          theme={theme}
        />
      </motion.div>
    </div>
  );
};

export default AdminCategories;