// components/admin/orders/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiEdit2,
  FiTrash2,
  FiEye,
  FiPackage,
  FiDollarSign,
  FiUser
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetAllOrdersQuery,
  useDeleteOrderMutation,
  useUpdateOrderStatusMutation,
  useGetOrderStatsQuery,
} from '../../../../redux/services/orderService';
import {
  setPagination,
  setFilters
} from '../../../../redux/slices/orderSlice';

// Component imports
import OrderStats from '../../../../components/admin/stats/OrderStats';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';
import { useTheme } from '../../../../context/ThemeContext';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redux state
  const { 
    pagination,
    filters 
  } = useSelector((state) => state.order);

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    order: null
  });

  // RTK Query hooks with pagination and filters
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useGetAllOrdersQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    status: filters.status === 'ALL' ? undefined : filters.status
  });

  const { data: statsResponse } = useGetOrderStatsQuery();
  
  // Mutations
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [updateOrderStatus, { isLoading: isStatusLoading }] = useUpdateOrderStatusMutation();

  // Extract data
  const orders = ordersResponse?.data?.orders || [];
  const serverPagination = ordersResponse?.data?.pagination || {};
  const totalOrders = serverPagination.total || 0;
  const serverTotalPages = serverPagination.pages || 1;
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

  // Status badge styles
  const statusStyles = {
    PENDING: theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
    CONFIRMED: theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
    PROCESSING: theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
    SHIPPED: theme === 'dark' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800',
    DELIVERED: theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
    CANCELLED: theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
    REFUNDED: theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800',
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleRefresh = () => {
    refetchOrders();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteOrder(deleteModal.order.id).unwrap();
      setDeleteModal({ isOpen: false, order: null });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ 
        orderId, 
        status: newStatus 
      }).unwrap();
    } catch (error) {
      console.error('Status update failed:', error);
    }
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

  const handleStatusFilterChange = (status) => {
    dispatch(setFilters({ 
      status 
    }));
  };

  const openDeleteModal = (order) => {
    setDeleteModal({ isOpen: true, order });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, order: null });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'orderNumber',
      title: 'Order ID',
      dataIndex: 'orderNumber',
      sortable: true,
      render: (value, record) => (
        <div className="min-w-0">
          <p className={`font-medium font-mono text-sm ${themeStyles.text.primary}`}>{value}</p>
          <p className={`text-xs ${themeStyles.text.muted}`}>
            {new Date(record.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
      className: 'min-w-32'
    },
    {
      key: 'customer',
      title: 'Customer',
      dataIndex: 'name',
      render: (value, record) => (
        <div className="min-w-0">
          <p className={`font-medium ${themeStyles.text.primary}`}>{value}</p>
          <p className={`text-sm ${themeStyles.text.muted}`}>{record.email}</p>
        </div>
      ),
      className: 'min-w-48'
    },
    {
      key: 'items',
      title: 'Items',
      dataIndex: 'orderItems',
      render: (items) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
        }`}>
          <FiPackage className="w-3 h-3 mr-1" />
          {items?.length || 0}
        </span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      dataIndex: 'totalAmount',
      sortable: true,
      render: (value) => (
        <span className={`font-medium ${themeStyles.text.primary}`}>
          ₹{parseFloat(value || 0).toFixed(2)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (status, record) => (
        <select
          value={status}
          onChange={(e) => handleStatusUpdate(record.id, e.target.value)}
          disabled={isStatusLoading}
          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${
            statusStyles[status] || statusStyles.PENDING
          } ${isStatusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      )
    },
    {
      key: 'payment',
      title: 'Payment',
      dataIndex: 'paymentMethod',
      render: (method, record) => (
        <div className="text-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            record.paymentStatus === 'SUCCESS' 
              ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
              : theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <FiDollarSign className="w-3 h-3 mr-1" />
            {method}
          </span>
        </div>
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
            to={`/dashboard/orders/view/${value}`}
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
                      
          {/* Delete Button */}
          <button
            onClick={() => openDeleteModal(record)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Delete Order"
            disabled={isDeleting}
            data-action-button="true"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Mobile card renderer
  const renderOrderCard = (order) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${themeStyles.card}`}
      >
        <div className="flex flex-col space-y-3">
          
          {/* Header: Order ID + Date */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-mono font-medium text-sm ${themeStyles.text.primary}`}>
                {order.orderNumber}
              </h3>
              <p className={`text-xs ${themeStyles.text.muted}`}>
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusStyles[order.status] || statusStyles.PENDING
            }`}>
              {order.status}
            </span>
          </div>

          {/* Customer Info */}
          <div className="flex items-center space-x-2">
            <FiUser className={`w-4 h-4 ${themeStyles.text.muted}`} />
            <div>
              <p className={`text-sm font-medium ${themeStyles.text.primary}`}>
                {order.name}
              </p>
              <p className={`text-xs ${themeStyles.text.muted}`}>
                {order.email}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className={themeStyles.text.muted}>Items</p>
              <p className={`font-medium ${themeStyles.text.primary}`}>
                {order.orderItems?.length || 0}
              </p>
            </div>
            <div>
              <p className={themeStyles.text.muted}>Amount</p>
              <p className={`font-medium ${themeStyles.text.primary}`}>
                ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className={themeStyles.text.muted}>Payment</p>
              <p className={`font-medium ${themeStyles.text.primary}`}>
                {order.paymentMethod}
              </p>
            </div>
            <div>
              <p className={themeStyles.text.muted}>Status</p>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                disabled={isStatusLoading}
                className={`text-xs px-2 py-1 rounded border-0 w-full ${
                  statusStyles[order.status] || statusStyles.PENDING
                } ${isStatusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex justify-between pt-3 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Link
              to={`/dashboard/orders/view/${order.id}`}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:bg-blue-900' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              data-action-button="true"
            >
              <FiEye className="w-3 h-3" />
              <span>View</span>
            </Link>
            
            <Link
              to={`/dashboard/orders/edit/${order.id}`}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                theme === 'dark' 
                  ? 'text-green-400 hover:bg-green-900' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              data-action-button="true"
            >
              <FiEdit2 className="w-3 h-3" />
              <span>Edit</span>
            </Link>
            
            <button
              onClick={() => openDeleteModal(order)}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                theme === 'dark' 
                  ? 'text-red-400 hover:bg-red-900' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
              disabled={isDeleting}
              data-action-button="true"
            >
              <FiTrash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
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
                Orders Management
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
                Manage customer orders • {totalOrders} total orders
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={ordersLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="mb-6 lg:mb-8">
            <OrderStats stats={stats} />
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === status
                      ? theme === 'dark' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status === 'ALL' ? 'All Orders' : status}
                  {status !== 'ALL' && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-white bg-opacity-20 rounded">
                      {stats.statusBreakdown?.[status] || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Display */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}>
          {isMobile ? (
            <div className="p-4">
              <DataCard
                data={orders}
                renderItem={renderOrderCard}
                onItemClick={(order) => navigate(`/dashboard/orders/view/${order.id}`)}
                emptyMessage="No orders found"
                emptyAction={
                  <div className="text-center">
                    <p className={`mb-4 ${themeStyles.text.secondary}`}>
                      No orders match your current filter
                    </p>
                    <button
                      onClick={() => handleStatusFilterChange('ALL')}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Show All Orders</span>
                    </button>
                  </div>
                }
                              pagination={{
                serverTotalItems: totalOrders,
                serverTotalPages: serverTotalPages,
                serverCurrentPage: pagination.currentPage,
                serverPageSize: pagination.pageSize,
                onServerPageChange: handleServerPageChange,
                onPageSizeChange: handlePageSizeChange,
                pageSizeOptions: [10, 20, 50]
              }}
                theme={theme}
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={orders}
              keyField="id"
              loading={ordersLoading}
              onRowClick={(order) => navigate(`/dashboard/orders/view/${order.id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <div className={`text-lg mb-2 ${themeStyles.text.secondary}`}>
                    No orders found
                  </div>
                  <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                    {filters.status === 'ALL' 
                      ? 'No orders in the system yet' 
                      : `No orders with status: ${filters.status}`
                    }
                  </p>
                  {filters.status !== 'ALL' && (
                    <button
                      onClick={() => handleStatusFilterChange('ALL')}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Show All Orders</span>
                    </button>
                  )}
                </div>
              }
              pagination={{
                serverTotalItems: totalOrders,
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
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Order"
          message={
            `Are you sure you want to delete order "${deleteModal.order?.orderNumber}"? This action cannot be undone.`
          }
          confirmText="Delete Order"
          isLoading={isDeleting}
          theme={theme}
        />
      </motion.div>
    </div>
  );
};

export default AdminOrders;