// src/components/admin/quantity-pricing/SubcategoryQuantityPricing.jsx
import React, { useState } from 'react';
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
  FiTrendingUp,
  FiSave,
  FiX,
  FiArrowRight,
  FiPercent,
  FiDollarSign
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import {
  useGetAllSubcategoriesQuery,
  useAddSubcategoryQuantityPriceMutation,
  useUpdateSubcategoryQuantityPriceMutation,
  useDeleteSubcategoryQuantityPriceMutation,
  useToggleSubcategoryQuantityPriceStatusMutation,
} from '../../../../redux/services/subcategoryService';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';

const SubcategoryQuantityPricing = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    price: null
  });
  const [newPrice, setNewPrice] = useState({
    quantity: '',
    priceType: 'PERCENTAGE',
    value: ''
  });
  
  const [editingPrice, setEditingPrice] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: '',
    priceType: 'PERCENTAGE',
    value: ''
  });

  // RTK Query hooks
  const { 
    data: subcategoriesResponse, 
    isLoading, 
    refetch,
    error 
  } = useGetAllSubcategoriesQuery();

  const [addQuantityPrice] = useAddSubcategoryQuantityPriceMutation();
  const [updateQuantityPrice] = useUpdateSubcategoryQuantityPriceMutation();
  const [deleteQuantityPrice] = useDeleteSubcategoryQuantityPriceMutation();
  const [toggleStatus] = useToggleSubcategoryQuantityPriceStatusMutation();

  const subcategories = subcategoriesResponse?.data || [];

  const themeStyles = {
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
  };

  // Handlers
  const handleAddPrice = async (subcategoryId) => {
    if (!newPrice.quantity || !newPrice.value) {
      toast.error('Please fill all fields');
      return;
    }

    if (parseInt(newPrice.quantity) < 2) {
      toast.error('Quantity must be at least 2');
      return;
    }

    if (newPrice.priceType === 'PERCENTAGE' && parseFloat(newPrice.value) > 100) {
      toast.error('Discount percentage cannot exceed 100%');
      return;
    }

    try {
      await addQuantityPrice({
        subcategoryId,
        quantityPriceData: {
          quantity: parseInt(newPrice.quantity),
          priceType: newPrice.priceType,
          value: parseFloat(newPrice.value)
        }
      }).unwrap();

      setNewPrice({ quantity: '', priceType: 'PERCENTAGE', value: '' });
      toast.success('Quantity price added successfully!');
      refetch();
    } catch (error) {
      console.error('Add price error:', error);
      toast.error(error?.data?.message || 'Failed to add quantity price');
    }
  };

  const handleEditPrice = (price) => {
    setEditingPrice(price.id);
    setEditForm({
      quantity: price.quantity.toString(),
      priceType: price.priceType,
      value: price.value.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setEditForm({
      quantity: '',
      priceType: 'PERCENTAGE',
      value: ''
    });
  };

  const handleUpdatePrice = async (quantityPriceId) => {
    if (!editForm.quantity || !editForm.value) {
      toast.error('Please fill all fields');
      return;
    }

    if (parseInt(editForm.quantity) < 2) {
      toast.error('Quantity must be at least 2');
      return;
    }

    if (editForm.priceType === 'PERCENTAGE' && parseFloat(editForm.value) > 100) {
      toast.error('Discount percentage cannot exceed 100%');
      return;
    }

    try {
      await updateQuantityPrice({
        quantityPriceId,
        updateData: {
          quantity: parseInt(editForm.quantity),
          priceType: editForm.priceType,
          value: parseFloat(editForm.value)
        }
      }).unwrap();

      setEditingPrice(null);
      setEditForm({ quantity: '', priceType: 'PERCENTAGE', value: '' });
      refetch();
      toast.success('Quantity price updated successfully!');
    } catch (error) {
      console.error('Update price error:', error);
      toast.error(error?.data?.message || 'Failed to update quantity price');
    }
  };

  const handleDeletePrice = async (priceId) => {
    try {
      await deleteQuantityPrice(priceId).unwrap();
      toast.success('Quantity price deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Delete price error:', error);
      toast.error(error?.data?.message || 'Failed to delete quantity price');
    }
  };

  const handleToggleStatus = async (quantityPriceId, currentStatus) => {
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
  };

  const openDeleteModal = (price) => {
    setDeleteModal({ isOpen: true, price });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, price: null });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.price) {
      await handleDeletePrice(deleteModal.price.id);
      closeDeleteModal();
    }
  };

  const handleSubcategoryToggle = (subcategory) => {
    if (selectedSubcategory?.id === subcategory.id) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategory);
    }
    setEditingPrice(null);
    setEditForm({ quantity: '', priceType: 'PERCENTAGE', value: '' });
  };

  const handleCreateSubcategory = () => {
    navigate('/admin/categories');
  };

  // Table columns for quantity prices
  const quantityPriceColumns = [
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
          <span className={themeStyles.text.primary}>
            {value === 'PERCENTAGE' ? 'Percentage Discount' : 'Fixed Price'}
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
          {/* Edit Button */}
          {editingPrice === record.id ? (
            <>
              <button
                onClick={() => handleUpdatePrice(record.id)}
                className="p-2 text-green-600 hover:text-green-700 transition-colors rounded-lg hover:bg-green-50"
                title="Save"
              >
                <FiSave size={16} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-600 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
                title="Cancel"
              >
                <FiX size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleEditPrice(record)}
                className="p-2 text-blue-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                title="Edit"
              >
                <FiEdit2 size={16} />
              </button>
              
              {/* Delete Button */}
              <button
                onClick={() => openDeleteModal(record)}
                className="p-2 text-red-600 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50"
                title="Delete"
              >
                <FiTrash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  // Mobile card renderer for quantity prices
  const renderQuantityPriceCard = (price) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 ${themeStyles.card} ${!price.isActive ? 'opacity-60' : ''}`}
    >
      {editingPrice === price.id ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${themeStyles.text.primary}`}>Buy</span>
            <input
              type="number"
              value={editForm.quantity}
              onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
              className="w-20 px-2 py-1 border rounded text-sm"
              min="2"
            />
          </div>
          <select
            value={editForm.priceType}
            onChange={(e) => setEditForm({...editForm, priceType: e.target.value})}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="PERCENTAGE">Percentage Discount</option>
            <option value="FIXED_AMOUNT">Fixed Total Price</option>
          </select>
          <input
            type="number"
            value={editForm.value}
            onChange={(e) => setEditForm({...editForm, value: e.target.value})}
            className="w-full px-2 py-1 border rounded text-sm"
            step="0.01"
            min="0"
            max={editForm.priceType === 'PERCENTAGE' ? '100' : ''}
            placeholder={editForm.priceType === 'PERCENTAGE' ? 'Discount %' : 'Total Price'}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => handleUpdatePrice(price.id)}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`font-semibold ${themeStyles.text.primary}`}>
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
            <div className="flex items-center space-x-4">
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditPrice(price)}
              className="p-2 text-blue-600 hover:text-blue-700"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => openDeleteModal(price)}
              className="p-2 text-red-600 hover:text-red-700"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiRefreshCw className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${themeStyles.background}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${themeStyles.text.primary}`}>
            Quantity Pricing Management
          </h1>
          <p className={themeStyles.text.secondary}>
            Set quantity-based pricing for subcategories (Buy 2, Buy 3, etc.)
          </p>
        </div>

        {/* Navigation Menu */}
        <div className={`mb-8 p-4 rounded-lg border ${themeStyles.card}`}>
          <div className="flex flex-wrap gap-4 text-sm">
            <button className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${themeStyles.text.primary}`}>
              Categories
            </button>
            <button className={`px-4 py-2 rounded-lg bg-blue-600 text-white font-medium`}>
              SubCategories
            </button>
            <button className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${themeStyles.text.primary}`}>
              Orders
            </button>
            <button className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${themeStyles.text.primary}`}>
              Users
            </button>
            <button className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${themeStyles.text.primary}`}>
              Contact
            </button>
            <button className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${themeStyles.text.primary}`}>
              Review
            </button>
            <button className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${themeStyles.text.primary}`}>
              Logout
            </button>
          </div>
        </div>

        {/* Subcategories List */}
        {subcategories.length > 0 ? (
          <div className="space-y-6">
            {subcategories.map((subcategory) => (
              <motion.div
                key={subcategory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border ${themeStyles.card} shadow-sm`}
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
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubcategoryToggle(subcategory)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {selectedSubcategory?.id === subcategory.id ? 'Hide' : 'Manage Pricing'}
                    </button>
                  </div>
                </div>

                {/* Add Price Form & Pricing Table */}
                <AnimatePresence>
                  {selectedSubcategory?.id === subcategory.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6"
                    >
                      {/* Add New Price Form */}
                      <div className="mb-6 p-4 border rounded-lg bg-opacity-50"
                        style={{
                          backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.8)'
                        }}
                      >
                        <h4 className={`font-semibold mb-3 ${themeStyles.text.primary} flex items-center gap-2`}>
                          <FiPlus className="text-green-600" />
                          Add New Quantity Price
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-3">
                            <input
                              type="number"
                              placeholder="Quantity (min 2)"
                              value={newPrice.quantity}
                              onChange={(e) => setNewPrice({...newPrice, quantity: e.target.value})}
                              className={`w-full px-3 py-2 border rounded-lg ${themeStyles.text.primary} ${themeStyles.card}`}
                              min="2"
                            />
                          </div>
                          
                          <div className="md:col-span-4">
                            <select
                              value={newPrice.priceType}
                              onChange={(e) => setNewPrice({...newPrice, priceType: e.target.value})}
                              className={`w-full px-3 py-2 border rounded-lg ${themeStyles.text.primary} ${themeStyles.card}`}
                            >
                              <option value="PERCENTAGE">Percentage Discount</option>
                              <option value="FIXED_AMOUNT">Fixed Total Price</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-3">
                            <input
                              type="number"
                              placeholder={newPrice.priceType === 'PERCENTAGE' ? 'Discount %' : 'Total Price (₹)'}
                              value={newPrice.value}
                              onChange={(e) => setNewPrice({...newPrice, value: e.target.value})}
                              className={`w-full px-3 py-2 border rounded-lg ${themeStyles.text.primary} ${themeStyles.card}`}
                              step="0.01"
                              min="0"
                              max={newPrice.priceType === 'PERCENTAGE' ? '100' : ''}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <button
                              onClick={() => handleAddPrice(subcategory.id)}
                              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                              <FiPlus size={16} />
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Prices Table */}
                      <div>
                        <h4 className={`font-semibold mb-4 ${themeStyles.text.primary} flex items-center gap-2`}>
                          <FiPackage className="text-blue-600" />
                          Quantity Pricing Rules ({subcategory.quantityPrices?.length || 0})
                        </h4>
                        
                        {subcategory.quantityPrices?.length > 0 ? (
                          <>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                              <table className="w-full">
                                <thead className={themeStyles.table.header}>
                                  <tr>
                                    {quantityPriceColumns.map((column) => (
                                      <th 
                                        key={column.key}
                                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                      >
                                        {column.title}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {subcategory.quantityPrices.map((price) => (
                                    <tr 
                                      key={price.id}
                                      className={`${themeStyles.table.row} ${!price.isActive ? 'opacity-60' : ''}`}
                                    >
                                      {quantityPriceColumns.map((column) => (
                                        <td key={column.key} className="px-4 py-4 whitespace-nowrap">
                                          {column.render ? column.render(price[column.dataIndex], price) : price[column.dataIndex]}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                              {subcategory.quantityPrices.map((price) => (
                                <div key={price.id}>
                                  {renderQuantityPriceCard(price)}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className={`text-center py-8 ${themeStyles.text.muted} border-2 border-dashed rounded-lg`}>
                            <FiPackage className="mx-auto text-3xl mb-3 opacity-50" />
                            <p className="font-medium">No quantity prices set for this subcategory</p>
                            <p className="text-sm mt-1">Add your first quantity pricing rule above</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-16 ${themeStyles.text.muted}`}
          >
            <FiTrendingUp className="mx-auto text-5xl mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No subcategories found</h3>
            <p className="text-sm max-w-md mx-auto mb-6">
              You need to create subcategories first before setting up quantity pricing.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCreateSubcategory}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <FiPlus size={16} />
                Create Subcategories
                <FiArrowRight size={16} />
              </button>
              <button
                onClick={refetch}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <FiRefreshCw size={16} />
                Refresh Data
              </button>
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Quantity Price"
          message={
            `Are you sure you want to delete this quantity price rule? This action cannot be undone.`
          }
          confirmText="Delete Price Rule"
          theme={theme}
        />
      </div>
    </div>
  );
};

export default SubcategoryQuantityPricing;