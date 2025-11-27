// components/admin/ratings/AdminRatings.jsx - UPDATED WITH PAGINATION
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiTrash2,
  FiEye,
  FiStar,
  FiUser,
  FiCheck,
  FiX,
  FiPackage
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetAllRatingsQuery,
  useDeleteRatingMutation,
  useToggleRatingApprovalMutation,
  useGetRatingStatsQuery,
} from '../../../../redux/services/ratingService';
import {
  setPagination,
  setFilters
} from '../../../../redux/slices/ratingSlice';

// Component imports
import RatingStats from '../../../../components/admin/stats/RatingStats';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';
import { useTheme } from '../../../../context/ThemeContext';

const AdminRatings = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redux state
  const { 
    pagination,
    filters 
  } = useSelector((state) => state.rating);

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    rating: null
  });

  // RTK Query hooks with pagination and filters
  const {
    data: ratingsResponse,
    isLoading: ratingsLoading,
    error: ratingsError,
    refetch: refetchRatings
  } = useGetAllRatingsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    status: filters.status === 'ALL' ? undefined : filters.status,
    rating: filters.rating === 'ALL' ? undefined : filters.rating
  });

  const { data: statsResponse } = useGetRatingStatsQuery();
  
  // Mutations
  const [deleteRating, { isLoading: isDeleting }] = useDeleteRatingMutation();
  const [toggleApproval, { isLoading: isApprovalLoading }] = useToggleRatingApprovalMutation();

  // Extract data with pagination
  const ratingsData = ratingsResponse?.data || {};
  const ratings = Array.isArray(ratingsData) ? ratingsData : 
                 Array.isArray(ratingsData.ratings) ? ratingsData.ratings : 
                 Array.isArray(ratingsData.data) ? ratingsData.data : 
                 Array.isArray(ratingsData.items) ? ratingsData.items : [];
  
  const serverPagination = ratingsResponse?.data?.pagination || {};
  const totalRatings = serverPagination.total || 0;
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

  // Star rating display
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : theme === 'dark' 
                ? 'text-gray-600' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className={`ml-1 text-sm font-medium ${themeStyles.text.secondary}`}>
          {rating}.0
        </span>
      </div>
    );
  };

  // Approval badge styles
  const getApprovalBadge = (isApproved) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    return isApproved 
      ? `${baseClasses} ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`
      : `${baseClasses} ${theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`;
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleRefresh = () => {
    refetchRatings();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteRating(deleteModal.rating.id).unwrap();
      setDeleteModal({ isOpen: false, rating: null });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleApprovalToggle = async (ratingId, currentApproval) => {
    try {
      await toggleApproval({ 
        ratingId, 
        currentApproval 
      }).unwrap();
    } catch (error) {
      console.error('Approval toggle failed:', error);
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

  const handleRatingFilterChange = (rating) => {
    dispatch(setFilters({ 
      rating 
    }));
  };

  const openDeleteModal = (rating) => {
    setDeleteModal({ isOpen: true, rating });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, rating: null });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'user',
      title: 'User',
      dataIndex: 'user',
      sortable: true,
      render: (value, record) => (
        <div className="min-w-0">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <FiUser className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-medium truncate ${themeStyles.text.primary}`}>
                {record.user?.name || 'Anonymous User'}
              </p>
              <p className={`text-sm truncate ${themeStyles.text.muted}`}>
                {record.user?.email || 'No email'}
              </p>
            </div>
          </div>
        </div>
      ),
      className: 'min-w-64'
    },
    {
      key: 'product',
      title: 'Product',
      dataIndex: 'product',
      render: (value, record) => (
        <div className="flex items-center space-x-2">
          <FiPackage className={`w-4 h-4 ${themeStyles.text.muted}`} />
          <span className={themeStyles.text.secondary}>
            {record.product?.name || 'Unknown Product'}
          </span>
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Rating',
      dataIndex: 'rating',
      render: (value) => renderStars(value)
    },
    {
      key: 'comment',
      title: 'Comment',
      dataIndex: 'comment',
      render: (value) => (
        <span className={`truncate max-w-xs block ${themeStyles.text.primary}`}>
          {value || 'No comment'}
        </span>
      )
    },
    {
      key: 'isApproved',
      title: 'Status',
      dataIndex: 'isApproved',
      render: (isApproved, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            handleApprovalToggle(record.id, isApproved);
          }}
          disabled={isApprovalLoading}
          className={`${getApprovalBadge(isApproved)} transition-colors ${
            isApprovalLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
          }`}
          data-action-button="true" 
        >
          {isApproved ? (
            <>
              <FiCheck className="w-3 h-3 mr-1" />
              Approved
            </>
          ) : (
            <>
              <FiX className="w-3 h-3 mr-1" />
              Pending
            </>
          )}
        </button>
      )
    },
    {
      key: 'createdAt',
      title: 'Submitted',
      dataIndex: 'createdAt',
      render: (value) => (
        <div className={themeStyles.text.muted}>
          <div className="text-sm">{value ? new Date(value).toLocaleDateString() : 'N/A'}</div>
          <div className="text-xs">{value ? new Date(value).toLocaleTimeString() : ''}</div>
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
            to={`/dashboard/ratings/view/${value}`}
            onClick={(e) => e.stopPropagation()} // Prevent row click
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
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              openDeleteModal(record);
            }}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Delete Rating"
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
  const renderRatingCard = (rating) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${themeStyles.card}`}
        onClick={() => navigate(`/dashboard/ratings/view/${rating.id}`)} // Card click for navigation
      >
        <div className="flex items-start space-x-4">
          {/* User Avatar */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <FiUser className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>

          {/* Rating Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <div className="min-w-0">
                <h3 className={`font-medium truncate ${themeStyles.text.primary}`}>
                  {rating.user?.name || 'Anonymous User'}
                </h3>
                <p className={`text-sm truncate ${themeStyles.text.muted}`}>
                  {rating.user?.email || 'No email'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <FiPackage className={`w-3 h-3 ${themeStyles.text.muted}`} />
                  <span className={`text-sm ${themeStyles.text.muted}`}>
                    {rating.product?.name || 'Unknown Product'}
                  </span>
                </div>
              </div>

              {/* Approval badge */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  handleApprovalToggle(rating.id, rating.isApproved);
                }}
                disabled={isApprovalLoading}
                className={`${getApprovalBadge(rating.isApproved)} ${
                  isApprovalLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                }`}
                data-action-button="true"
              >
                {rating.isApproved ? (
                  <>
                    <FiCheck className="w-3 h-3 mr-1" />
                    Approved
                  </>
                ) : (
                  <>
                    <FiX className="w-3 h-3 mr-1" />
                    Pending
                  </>
                )}
              </button>
            </div>

            {/* Rating Stars and Comment */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                {renderStars(rating.rating)}
              </div>
              <p className={`text-sm ${themeStyles.text.muted} line-clamp-2`}>
                {rating.comment || 'No comment provided'}
              </p>
            </div>

            {/* Bottom section */}
            <div className={`flex flex-wrap justify-between items-center pt-3 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <span className={`text-xs ${themeStyles.text.muted} mb-2 sm:mb-0`}>
                {rating.createdAt ? `${new Date(rating.createdAt).toLocaleDateString()} • ${new Date(rating.createdAt).toLocaleTimeString()}` : 'Date unknown'}
              </span>
              
              <div className="flex space-x-2">
                {/* View Button */}
                <Link
                  to={`/dashboard/ratings/view/${rating.id}`}
                  onClick={(e) => e.stopPropagation()} // Prevent card click
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-blue-400 hover:bg-blue-900' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                  data-action-button="true"
                >
                  <FiEye className="w-4 h-4" />
                </Link>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    openDeleteModal(rating);
                  }}
                  className={`p-1 rounded transition-colors ${
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
                Ratings Management
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
                Manage product ratings and reviews • {totalRatings} total ratings
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={ratingsLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${ratingsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Rating Statistics */}
          <div className="mb-6 lg:mb-8">
            <RatingStats stats={stats} theme={theme} />
          </div>

        </div>

        {/* Ratings Display */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}>
          {isMobile ? (
            <div className="p-4">
              <DataCard
                data={ratings}
                renderItem={renderRatingCard}
                onItemClick={(rating) => navigate(`/dashboard/ratings/view/${rating.id}`)}
                emptyMessage="No ratings found"
                emptyAction={
                  <div className="text-center">
                    <FiStar className={`w-12 h-12 mx-auto mb-4 ${themeStyles.text.muted}`} />
                    <p className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No ratings yet</p>
                    <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                      {filters.status === 'ALL' && filters.rating === 'ALL' 
                        ? 'Product ratings will appear here when customers submit reviews' 
                        : 'No ratings match your current filters'
                      }
                    </p>
                    {(filters.status !== 'ALL' || filters.rating !== 'ALL') && (
                      <button
                        onClick={() => {
                          handleStatusFilterChange('ALL');
                          handleRatingFilterChange('ALL');
                        }}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>Show All Ratings</span>
                      </button>
                    )}
                  </div>
                }
                              pagination={{
                serverTotalItems: totalRatings,
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
              data={ratings}
              keyField="id"
              loading={ratingsLoading}
              onRowClick={(rating) => navigate(`/dashboard/ratings/view/${rating.id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <FiStar className={`w-16 h-16 mx-auto mb-4 ${themeStyles.text.muted}`} />
                  <div className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No ratings found</div>
                  <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                    {filters.status === 'ALL' && filters.rating === 'ALL' 
                      ? 'Product ratings and reviews will appear here when customers submit them' 
                      : 'No ratings match your current filters'
                    }
                  </p>
                  {(filters.status !== 'ALL' || filters.rating !== 'ALL') && (
                    <button
                      onClick={() => {
                        handleStatusFilterChange('ALL');
                        handleRatingFilterChange('ALL');
                      }}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Show All Ratings</span>
                    </button>
                  )}
                </div>
              }
              pagination={{
                serverTotalItems: totalRatings,
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
          title="Delete Rating"
          message={
            `Are you sure you want to delete the rating from "${deleteModal.rating?.user?.name}"? This action cannot be undone.`
          }
          confirmText="Delete Rating"
          isLoading={isDeleting}
          theme={theme}
        />
      </motion.div>
    </div>
  );
};

export default AdminRatings;