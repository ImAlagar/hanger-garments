// components/admin/coupons/AdminCoupons.jsx
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
  FiCalendar,
  FiPercent,
  FiDollarSign
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetCouponsQuery,
  useDeleteCouponMutation,
  useToggleCouponStatusMutation,
  useGetCouponStatsQuery,
} from '../../../../redux/services/couponService';
import {
  setPagination,
  setFilters
} from '../../../../redux/slices/couponSlice';

// Component imports
import CouponStats from '../../../../components/admin/stats/CouponStats';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';
import { useTheme } from '../../../../context/ThemeContext';

const AdminCoupons = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redux state
  const { 
    pagination,
    filters 
  } = useSelector((state) => state.coupon);

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    coupon: null
  });

  // RTK Query hooks with pagination and filters
  const {
    data: couponsResponse,
    isLoading: couponsLoading,
    error: couponsError,
    refetch: refetchCoupons
  } = useGetCouponsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    status: filters.status === 'ALL' ? undefined : filters.status
  });

  const { data: statsResponse } = useGetCouponStatsQuery();

  // Mutations
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();
  const [toggleStatus, { isLoading: isStatusLoading }] = useToggleCouponStatusMutation();

  // Extract data
  const coupons = couponsResponse?.data?.coupons || [];
  const serverPagination = couponsResponse?.data?.pagination || {};
  const totalCoupons = serverPagination.total || 0;
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleRefresh = () => {
    refetchCoupons();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCoupon(deleteModal.coupon.id).unwrap();
      setDeleteModal({ isOpen: false, coupon: null });
      toast.success('Coupon deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.data?.message || 'Failed to delete coupon');
    }
  };

  const handleStatusToggle = async (couponId, currentStatus) => {
    try {
      await toggleStatus({ 
        couponId, 
        currentStatus 
      }).unwrap();
    } catch (error) {
      console.error('Status toggle failed:', error);
      toast.error(error.data?.message || 'Failed to update coupon status');
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

  const openDeleteModal = (coupon) => {
    setDeleteModal({ isOpen: true, coupon });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, coupon: null });
  };

  // Check if coupon is expired
  const isCouponExpired = (coupon) => {
    return new Date(coupon.validUntil) < new Date();
  };

  // Check if coupon is active
  const isCouponActive = (coupon) => {
    const now = new Date();
    return coupon.isActive && 
           new Date(coupon.validFrom) <= now && 
           new Date(coupon.validUntil) >= now;
  };

  // Format discount value
  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    } else {
      return `$${coupon.discountValue}`;
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'code',
      title: 'Coupon Code',
      dataIndex: 'code',
      sortable: true,
      render: (value, record) => (
        <div className="min-w-0">
          <p className={`font-bold text-lg font-mono ${themeStyles.text.primary}`}>{value}</p>
          <p className={`text-sm truncate ${themeStyles.text.muted}`}>
            {record.description || 'No description'}
          </p>
        </div>
      ),
      className: 'min-w-48'
    },
    {
      key: 'discount',
      title: 'Discount',
      dataIndex: 'id',
      render: (value, record) => (
        <div className="flex items-center space-x-2">
          {record.discountType === 'PERCENTAGE' ? (
            <FiPercent className="w-4 h-4 text-green-500" />
          ) : (
            <FiDollarSign className="w-4 h-4 text-blue-500" />
          )}
          <span className={`font-semibold ${themeStyles.text.primary}`}>
            {formatDiscount(record)}
          </span>
          {record.maxDiscount && record.discountType === 'PERCENTAGE' && (
            <span className={`text-xs ${themeStyles.text.muted}`}>
              (max ${record.maxDiscount})
            </span>
          )}
        </div>
      )
    },
    {
      key: 'usage',
      title: 'Usage',
      dataIndex: 'id',
      render: (value, record) => (
        <div className="text-center">
          <span className={`font-semibold ${themeStyles.text.primary}`}>
            {record.usedCount || 0}
          </span>
          <span className={`text-xs block ${themeStyles.text.muted}`}>
            / {record.usageLimit || '∞'}
          </span>
        </div>
      )
    },
    {
      key: 'validity',
      title: 'Validity',
      dataIndex: 'validUntil',
      render: (value, record) => {
        const isExpired = isCouponExpired(record);
        const isValid = isCouponActive(record);
        
        return (
          <div className="flex items-center space-x-2">
            <FiCalendar className={`w-4 h-4 ${
              isExpired ? 'text-red-500' : isValid ? 'text-green-500' : 'text-yellow-500'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                isExpired ? 'text-red-600' : isValid ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {isExpired ? 'Expired' : isValid ? 'Active' : 'Scheduled'}
              </p>
              <p className={`text-xs ${themeStyles.text.muted}`}>
                Until {new Date(value).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'isActive',
      render: (isActive, record) => (
        <button
          onClick={() => handleStatusToggle(record.id, isActive)}
          disabled={isStatusLoading || isCouponExpired(record)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isActive && !isCouponExpired(record)
              ? theme === 'dark' 
                ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          } ${isStatusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-action-button="true"
        >
          {isStatusLoading ? (
            <FiRefreshCw className="w-3 h-3 mr-1 animate-spin" />
          ) : isActive ? (
            <FiToggleRight className="w-3 h-3 mr-1" />
          ) : (
            <FiToggleLeft className="w-3 h-3 mr-1" />
          )}
          {isStatusLoading ? 'Updating...' : isActive ? 'Enabled' : 'Disabled'}
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
            to={`/dashboard/coupons/view/${value}`}
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
          
          {/* Edit Button */}
          <Link
            to={`/dashboard/coupons/edit/${value}`}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-green-400 hover:bg-green-900'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title="Edit Coupon"
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
            title="Delete Coupon"
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
  const renderCouponCard = (coupon) => {
    const isExpired = isCouponExpired(coupon);
    const isValid = isCouponActive(coupon);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${themeStyles.card}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className={`font-bold text-lg font-mono ${themeStyles.text.primary}`}>
              {coupon.code}
            </h3>
            <p className={`text-sm ${themeStyles.text.muted} truncate`}>
              {coupon.description || 'No description'}
            </p>
          </div>

          {/* Status toggle */}
          <button
            onClick={() => handleStatusToggle(coupon.id, coupon.isActive)}
            disabled={isStatusLoading || isExpired}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
              coupon.isActive && !isExpired
                ? theme === 'dark' 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-green-100 text-green-800'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-100 text-gray-800'
            } ${isStatusLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            data-action-button="true"
          >
            {isStatusLoading && (
              <FiRefreshCw className="w-3 h-3 animate-spin" />
            )}
            <span>
              {isStatusLoading
                ? "Updating..."
                : coupon.isActive && !isExpired
                ? "Enabled"
                : "Disabled"}
            </span>
          </button>
        </div>

        {/* Coupon Details */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className={`text-sm ${themeStyles.text.muted}`}>Discount</p>
            <p className={`font-semibold ${themeStyles.text.primary} flex items-center`}>
              {coupon.discountType === 'PERCENTAGE' ? (
                <FiPercent className="w-3 h-3 mr-1 text-green-500" />
              ) : (
                <FiDollarSign className="w-3 h-3 mr-1 text-blue-500" />
              )}
              {formatDiscount(coupon)}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeStyles.text.muted}`}>Usage</p>
            <p className={`font-semibold ${themeStyles.text.primary}`}>
              {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
            </p>
          </div>
        </div>

        {/* Validity */}
        <div className={`flex items-center justify-between mb-3 p-2 rounded ${
          isExpired ? 'bg-red-100 dark:bg-red-900' : 
          isValid ? 'bg-green-100 dark:bg-green-900' : 
          'bg-yellow-100 dark:bg-yellow-900'
        }`}>
          <div className="flex items-center space-x-2">
            <FiCalendar className={`w-4 h-4 ${
              isExpired ? 'text-red-500' : isValid ? 'text-green-500' : 'text-yellow-500'
            }`} />
            <span className={`text-sm font-medium ${
              isExpired ? 'text-red-700 dark:text-red-300' : 
              isValid ? 'text-green-700 dark:text-green-300' : 
              'text-yellow-700 dark:text-yellow-300'
            }`}>
              {isExpired ? 'Expired' : isValid ? 'Active' : 'Scheduled'}
            </span>
          </div>
          <span className={`text-xs ${themeStyles.text.muted}`}>
            Until {new Date(coupon.validUntil).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className={`flex justify-between items-center pt-3 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex space-x-2">
            {/* View Button */}
            <Link
              to={`/dashboard/coupons/view/${coupon.id}`}
              className={`p-2 rounded transition-colors ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:bg-blue-900' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              data-action-button="true"
            >
              <FiEye className="w-4 h-4" />
            </Link>
            
            {/* Edit Button */}
            <Link
              to={`/dashboard/coupons/edit/${coupon.id}`}
              className={`p-2 rounded transition-colors ${
                theme === 'dark' 
                  ? 'text-green-400 hover:bg-green-900' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              data-action-button="true"
            >
              <FiEdit2 className="w-4 h-4" />
            </Link>
            
            {/* Delete Button */}
            <button
              onClick={() => openDeleteModal(coupon)}
              className={`p-2 rounded transition-colors ${
                theme === 'dark' 
                  ? 'text-red-400 hover:bg-red-900' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
              disabled={isDeleting}
              data-action-button="true"
            >
              <FiTrash2 className="w-4 h-4" />
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
              <h1 className={`text-2xl sm:text-3xl font-italiana font-bold truncate ${themeStyles.text.primary}`}>
                Coupons Management
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
                Manage your discount coupons • {totalCoupons} total coupons
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={couponsLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${couponsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <Link
                to="/dashboard/coupons/add"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Coupon</span>
              </Link>
            </div>
          </div>

          {/* Coupon Statistics */}
          <div className="mb-6 lg:mb-8">
            <CouponStats stats={stats} />
          </div>
        </div>

        {/* Coupons Display */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}>
          {isMobile ? (
            <div className="p-4">
              <DataCard
                data={coupons}
                renderItem={renderCouponCard}
                onItemClick={(coupon) => navigate(`/dashboard/coupons/view/${coupon.id}`)}
                emptyMessage="No coupons found"
                emptyAction={
                  <Link
                    to="/dashboard/coupons/add"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Your First Coupon</span>
                  </Link>
                }
                              pagination={{
                serverTotalItems: totalCoupons,
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
              data={coupons}
              keyField="id"
              loading={couponsLoading}
              onRowClick={(coupon) => navigate(`/dashboard/coupons/view/${coupon.id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <div className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No coupons found</div>
                  <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                    {filters.status === 'ALL' 
                      ? 'Get started by creating your first coupon' 
                      : `No coupons with status: ${filters.status}`
                    }
                  </p>
                  {filters.status !== 'ALL' ? (
                    <button
                      onClick={() => handleStatusFilterChange('ALL')}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Show All Coupons</span>
                    </button>
                  ) : (
                    <Link
                      to="/dashboard/coupons/add"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Create New Coupon</span>
                    </Link>
                  )}
                </div>
              }
              pagination={{
                serverTotalItems: totalCoupons,
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
          title="Delete Coupon"
          message={
            `Are you sure you want to delete coupon "${deleteModal.coupon?.code}"? This action cannot be undone.`
          }
          confirmText="Delete Coupon"
          isLoading={isDeleting}
          theme={theme}
        />
      </motion.div>
    </div>
  );
};

export default AdminCoupons;