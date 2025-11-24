// components/admin/customization/AdminCustomization.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSettings,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Redux imports
import {
  useGetCustomizationByProductIdQuery,
  useCreateCustomizationMutation,
  useUpdateCustomizationMutation,
  useToggleCustomizationStatusMutation,
  useDeleteCustomizationMutation
} from '../../../../redux/services/customizationService';
import { useTheme } from '../../../../context/ThemeContext';

const AdminCustomization = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dispatch = useDispatch();

  // RTK Query hooks
  const { 
    data: customizationResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetCustomizationByProductIdQuery(productId);

  const [createCustomization] = useCreateCustomizationMutation();
  const [updateCustomization] = useUpdateCustomizationMutation();
  const [toggleStatus] = useToggleCustomizationStatusMutation();
  const [deleteCustomization] = useDeleteCustomizationMutation();

  const customization = customizationResponse?.data;
  const product = customization?.product;

  // Theme styles
  const themeStyles = {
    background: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleStatus({ 
        customizationId: customization.id, 
        isActive: !customization.isActive 
      }).unwrap();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customization?')) {
      try {
        await deleteCustomization(customization.id).unwrap();
        navigate('/dashboard/products');
      } catch (error) {
        console.error('Failed to delete customization:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeStyles.background}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${themeStyles.background}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className={`text-3xl font-bold ${themeStyles.text.primary}`}>
                Product Customization
              </h1>
              <p className={`mt-2 ${themeStyles.text.secondary}`}>
                {product ? `Manage customization for: ${product.name}` : 'Create new customization'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => refetch()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/products')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Back to Products</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customization Details */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl border p-6 ${themeStyles.card}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${themeStyles.text.primary}`}>
                  Customization Options
                </h2>
                {customization ? (
                  <button
                    onClick={handleToggleStatus}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      customization.isActive
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {customization.isActive ? (
                      <FiToggleRight className="w-5 h-5" />
                    ) : (
                      <FiToggleLeft className="w-5 h-5" />
                    )}
                    <span>{customization.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                ) : (
                  <Link
                    to={`/dashboard/products/customization/add/${productId}`}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Customization</span>
                  </Link>
                )}
              </div>

              {customization ? (
                <div className="space-y-6">
                  {/* Customization Options List */}
                  <div>
                    <h3 className={`text-lg font-medium mb-4 ${themeStyles.text.primary}`}>
                      Available Options
                    </h3>
                    {/* Add options list here */}
                    <div className={`text-center py-8 ${themeStyles.text.muted}`}>
                      <FiSettings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Customization options will be displayed here</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to={`/dashboard/products/customization/edit/${customization.id}`}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      <span>Edit Customization</span>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-12 ${themeStyles.text.muted}`}>
                  <FiSettings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Customization Found</h3>
                  <p className="mb-6">Create customization options for this product</p>
                  <Link
                    to={`/dashboard/products/customization/add/${productId}`}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>Create Customization</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Product Info Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl border p-6 ${themeStyles.card}`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeStyles.text.primary}`}>
                Product Information
              </h3>
              {product ? (
                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium ${themeStyles.text.secondary}`}>
                      Product Name
                    </label>
                    <p className={`mt-1 ${themeStyles.text.primary}`}>{product.name}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${themeStyles.text.secondary}`}>
                      Product Code
                    </label>
                    <p className={`mt-1 ${themeStyles.text.primary}`}>{product.productCode}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${themeStyles.text.secondary}`}>
                      Category
                    </label>
                    <p className={`mt-1 ${themeStyles.text.primary}`}>
                      {product.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${themeStyles.text.secondary}`}>
                      Price
                    </label>
                    <p className={`mt-1 ${themeStyles.text.primary}`}>
                      ₹{parseFloat(product.normalPrice || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className={themeStyles.text.muted}>Product information not available</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCustomization;