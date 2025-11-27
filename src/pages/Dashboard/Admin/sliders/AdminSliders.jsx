// components/admin/sliders/AdminSliders.jsx
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
  FiImage,
  FiLayout,
  FiSearch
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetAllSlidersQuery,
  useDeleteSliderMutation,
  useToggleSliderStatusMutation,
  useGetSliderStatsQuery,
} from '../../../../redux/services/sliderService';
import {
  setPagination,
  setFilters,
  searchSliders
} from '../../../../redux/slices/sliderSlice';

// Component imports
import SliderStats from '../../../../components/admin/stats/SliderStats';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';
import { useTheme } from '../../../../context/ThemeContext';

const AdminSliders = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redux state
  const { 
    pagination,
    filters 
  } = useSelector((state) => state.slider);

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    slider: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  // RTK Query hooks with pagination and filters
  const {
    data: slidersResponse,
    isLoading: slidersLoading,
    error: slidersError,
    refetch: refetchSliders
  } = useGetAllSlidersQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    status: filters.status === 'ALL' ? undefined : filters.status,
    layout: filters.layout === 'ALL' ? undefined : filters.layout,
    search: searchTerm || undefined
  });

  const { data: statsResponse } = useGetSliderStatsQuery();

  // Mutations
  const [deleteSlider, { isLoading: isDeleting }] = useDeleteSliderMutation();
  const [toggleStatus, { isLoading: isStatusLoading }] = useToggleSliderStatusMutation();

  // Extract data with pagination
  const slidersData = slidersResponse?.data || {};
  const sliders = Array.isArray(slidersData) ? slidersData : 
                 Array.isArray(slidersData.sliders) ? slidersData.sliders : 
                 Array.isArray(slidersData.data) ? slidersData.data : 
                 Array.isArray(slidersData.items) ? slidersData.items : [];
  
  const serverPagination = slidersResponse?.data?.pagination || {};
  const totalSliders = serverPagination.total || 0;
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
    refetchSliders();
    toast.success('Sliders refreshed!');
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSlider(deleteModal.slider.id).unwrap();
      setDeleteModal({ isOpen: false, slider: null });
      toast.success('Slider deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.data?.message || 'Failed to delete slider');
    }
  };

  const handleStatusToggle = async (sliderId, currentStatus) => {
    try {
      await toggleStatus({ 
        sliderId, 
        currentStatus 
      }).unwrap();
    } catch (error) {
      console.error('Status toggle failed:', error);
      toast.error(error.data?.message || 'Failed to update slider status');
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

  const handleLayoutFilterChange = (layout) => {
    dispatch(setFilters({ 
      layout 
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(searchSliders(searchTerm));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Optional: Implement debounced search
  };

  const clearSearch = () => {
    setSearchTerm('');
    dispatch(searchSliders(''));
  };

  const openDeleteModal = (slider) => {
    setDeleteModal({ isOpen: true, slider });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, slider: null });
  };

  // Check if slider is active based on dates
  const isSliderActive = (slider) => {
    const now = new Date();
    if (!slider.isActive) return false;
    
    if (!slider.startDate && !slider.endDate) return true;
    if (slider.startDate && !slider.endDate) return new Date(slider.startDate) <= now;
    if (!slider.startDate && slider.endDate) return new Date(slider.endDate) >= now;
    
    return new Date(slider.startDate) <= now && new Date(slider.endDate) >= now;
  };

  // Check if slider is expired
  const isSliderExpired = (slider) => {
    if (!slider.endDate) return false;
    return new Date(slider.endDate) < new Date();
  };

  // Check if slider is scheduled
  const isSliderScheduled = (slider) => {
    if (!slider.startDate) return false;
    return new Date(slider.startDate) > new Date();
  };

  // Format layout name
  const formatLayout = (layout) => {
    return layout ? layout.charAt(0).toUpperCase() + layout.slice(1) : 'Default';
  };

  // Available layout options (you can customize this based on your app)
  const layoutOptions = ['ALL', 'hero', 'banner', 'featured', 'promo'];

  // Table columns configuration
  const columns = [
    {
      key: 'image',
      title: 'Image',
      dataIndex: 'id',
      render: (value, record) => (
        <div className={`w-16 h-12 rounded-lg overflow-hidden flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          {record.image ? (
            <img 
              src={record.image} 
              alt={record.title}
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
      className: 'w-20'
    },
    {
      key: 'title',
      title: 'Slider Title',
      dataIndex: 'title',
      sortable: true,
      render: (value, record) => (
        <div className="min-w-0">
          <p className={`font-medium truncate ${themeStyles.text.primary}`}>{value}</p>
          <p className={`text-sm truncate ${themeStyles.text.muted}`}>
            {record.subtitle || 'No subtitle'}
          </p>
        </div>
      ),
      className: 'min-w-48'
    },
    {
      key: 'layout',
      title: 'Layout',
      dataIndex: 'layout',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <FiLayout className="w-4 h-4 text-blue-500" />
          <span className={`font-medium ${themeStyles.text.primary}`}>
            {formatLayout(value)}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'isActive',
      render: (isActive, record) => {
        const isActiveWithDates = isSliderActive(record);
        const isExpired = isSliderExpired(record);
        const isScheduled = isSliderScheduled(record);
        
        let statusText = 'Inactive';
        let statusColor = 'gray';
        
        if (isActiveWithDates) {
          statusText = 'Active';
          statusColor = 'green';
        } else if (isExpired) {
          statusText = 'Expired';
          statusColor = 'red';
        } else if (isScheduled) {
          statusText = 'Scheduled';
          statusColor = 'yellow';
        }

        return (
          <button
            onClick={() => handleStatusToggle(record.id, isActive)}
            disabled={isStatusLoading || isExpired}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusColor === 'green'
                ? theme === 'dark' 
                  ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                : statusColor === 'red'
                ? theme === 'dark'
                  ? 'bg-red-900 text-red-200'
                  : 'bg-red-100 text-red-800'
                : statusColor === 'yellow'
                ? theme === 'dark'
                  ? 'bg-yellow-900 text-yellow-200'
                  : 'bg-yellow-100 text-yellow-800'
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
            {isStatusLoading ? 'Updating...' : statusText}
          </button>
        );
      }
    },
    {
      key: 'dates',
      title: 'Dates',
      dataIndex: 'startDate',
      render: (value, record) => {
        const hasDates = record.startDate || record.endDate;
        
        if (!hasDates) {
          return <span className={themeStyles.text.muted}>No date range</span>;
        }

        return (
          <div className="text-sm">
            {record.startDate && (
              <div className={themeStyles.text.primary}>
                From: {new Date(record.startDate).toLocaleDateString()}
              </div>
            )}
            {record.endDate && (
              <div className={themeStyles.text.muted}>
                To: {new Date(record.endDate).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'order',
      title: 'Order',
      dataIndex: 'order',
      render: (value) => (
        <span className={`font-mono font-bold ${themeStyles.text.primary}`}>
          #{value}
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
            to={`/dashboard/sliders/view/${value}`}
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
            to={`/dashboard/sliders/edit/${value}`}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-green-400 hover:bg-green-900'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title="Edit Slider"
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
            title="Delete Slider"
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
  const renderSliderCard = (slider) => {
    const isActiveWithDates = isSliderActive(slider);
    const isExpired = isSliderExpired(slider);
    const isScheduled = isSliderScheduled(slider);

    let statusText = 'Inactive';
    let statusColor = 'gray';

    if (isActiveWithDates) {
        statusText = 'Active';
        statusColor = 'green';
    } else if (isExpired) {
        statusText = 'Expired';
        statusColor = 'red';
    } else if (isScheduled) {
        statusText = 'Scheduled';
        statusColor = 'yellow';
    }

    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${themeStyles.card}`}
        >
        {/* Responsive Image + Details */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
            {/* Slider Image */}
            <div
            className={`w-full sm:w-20 h-40 sm:h-16 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            >
            {slider.image ? (
                <img
                src={slider.image}
                alt={slider.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
                />
            ) : null}
            <div
                className={`w-full h-full flex items-center justify-center ${
                slider.image ? 'hidden' : 'flex'
                }`}
            >
                <FiImage
                className={`w-6 h-6 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}
                />
            </div>
            </div>

            {/* Slider Details */}
            <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div className="min-w-0">
                <h3 className={`font-medium truncate ${themeStyles.text.primary}`}>
                    {slider.title}
                </h3>
                <p className={`text-sm truncate ${themeStyles.text.muted}`}>
                    {slider.subtitle || 'No subtitle'}
                </p>
                </div>

                {/* Status toggle */}
                <button
                onClick={() => handleStatusToggle(slider.id, slider.isActive)}
                disabled={isStatusLoading || isExpired}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    statusColor === 'green'
                    ? theme === 'dark'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-green-100 text-green-800'
                    : statusColor === 'red'
                    ? theme === 'dark'
                        ? 'bg-red-900 text-red-200'
                        : 'bg-red-100 text-red-800'
                    : statusColor === 'yellow'
                    ? theme === 'dark'
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-yellow-100 text-yellow-800'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-800'
                } ${isStatusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-action-button="true"
                >
                {isStatusLoading && (
                    <FiRefreshCw className="w-3 h-3 animate-spin" />
                )}
                <span>
                    {isStatusLoading ? 'Updating...' : statusText}
                </span>
                </button>
            </div>

            {/* Slider Info */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                <p className={`text-sm ${themeStyles.text.muted}`}>Layout</p>
                <p
                    className={`font-semibold ${themeStyles.text.primary} flex items-center`}
                >
                    <FiLayout className="w-3 h-3 mr-1 text-blue-500" />
                    {formatLayout(slider.layout)}
                </p>
                </div>
                <div>
                <p className={`text-sm ${themeStyles.text.muted}`}>Order</p>
                <p className={`font-semibold ${themeStyles.text.primary}`}>
                    #{slider.order}
                </p>
                </div>
            </div>

            {/* Dates */}
            {(slider.startDate || slider.endDate) && (
                <div
                className={`flex items-center justify-between mb-3 p-2 rounded ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}
                >
                <div className="flex items-center space-x-2">
                    <FiCalendar className={`w-4 h-4 ${themeStyles.text.muted}`} />
                    <div className="text-xs">
                    {slider.startDate && (
                        <div className={themeStyles.text.primary}>
                        From: {new Date(slider.startDate).toLocaleDateString()}
                        </div>
                    )}
                    {slider.endDate && (
                        <div className={themeStyles.text.muted}>
                        To: {new Date(slider.endDate).toLocaleDateString()}
                        </div>
                    )}
                    </div>
                </div>
                </div>
            )}
            </div>
        </div>

        {/* Actions */}
        <div
            className={`flex flex-wrap justify-between items-center pt-3 border-t gap-2 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
        >
            <div className="flex space-x-2">
            {/* View Button */}
            <Link
                to={`/dashboard/sliders/view/${slider.id}`}
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
                to={`/dashboard/sliders/edit/${slider.id}`}
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
                onClick={() => openDeleteModal(slider)}
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
              <h1 className={`text-2xl font-italiana sm:text-3xl font-bold truncate ${themeStyles.text.primary}`}>
                Sliders Management
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
                Manage your home page sliders • {totalSliders} total sliders
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={slidersLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${slidersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <Link
                to="/dashboard/sliders/add"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Slider</span>
              </Link>
            </div>
          </div>

          {/* Slider Statistics */}
          <div className="mb-6 lg:mb-8">
            <SliderStats stats={stats} />
          </div>



        </div>

        {/* Sliders Display */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}>
          {isMobile ? (
            <div className="p-4">
              <DataCard
                data={sliders}
                renderItem={renderSliderCard}
                onItemClick={(slider) => navigate(`/dashboard/sliders/view/${slider.id}`)}
                emptyMessage="No sliders found"
                emptyAction={
                  <div className="text-center">
                    <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                      {filters.status === 'ALL' && filters.layout === 'ALL' && !searchTerm
                        ? 'Get started by creating your first slider' 
                        : `No sliders found with current filters`
                      }
                    </p>
                    {filters.status !== 'ALL' || filters.layout !== 'ALL' || searchTerm ? (
                      <button
                        onClick={() => {
                          handleStatusFilterChange('ALL');
                          handleLayoutFilterChange('ALL');
                          clearSearch();
                        }}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>Clear Filters</span>
                      </button>
                    ) : (
                      <Link
                        to="/dashboard/sliders/add"
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                        <span>Add Your First Slider</span>
                      </Link>
                    )}
                  </div>
                }
                              pagination={{
                serverTotalItems: totalSliders,
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
              data={sliders}
              keyField="id"
              loading={slidersLoading}
              onRowClick={(slider) => navigate(`/dashboard/sliders/view/${slider.id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <div className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No sliders found</div>
                  <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                    {filters.status === 'ALL' && filters.layout === 'ALL' && !searchTerm
                      ? 'Get started by creating your first slider' 
                      : `No sliders found with current filters`
                    }
                  </p>
                  {filters.status !== 'ALL' || filters.layout !== 'ALL' || searchTerm ? (
                    <button
                      onClick={() => {
                        handleStatusFilterChange('ALL');
                        handleLayoutFilterChange('ALL');
                        clearSearch();
                      }}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Clear Filters</span>
                    </button>
                  ) : (
                    <Link
                      to="/dashboard/sliders/add"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add New Slider</span>
                    </Link>
                  )}
                </div>
              }
              pagination={{
                serverTotalItems: totalSliders,
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
          title="Delete Slider"
          message={
            `Are you sure you want to delete slider "${deleteModal.slider?.title}"? This action cannot be undone.`
          }
          confirmText="Delete Slider"
          isLoading={isDeleting}
          theme={theme}
        />
      </motion.div>
    </div>
  );
};

export default AdminSliders;