// components/admin/users/AdminUsers.jsx
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
  FiUser,
  FiUserCheck,
  FiUserX,
  FiShoppingBag,
  FiShield
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useChangeUserRoleMutation,
  useApproveWholesalerMutation,
  useGetUserStatsQuery,
} from '../../../../redux/services/userService';
import {
  setPagination,
  setFilters
} from '../../../../redux/slices/userSlice';

// Component imports
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';
import { useTheme } from '../../../../context/ThemeContext';
import UserStats from '../../../../components/admin/stats/UserStats';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redux state
  const { 
    pagination,
    filters 
  } = useSelector((state) => state.user);

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null
  });
  const [roleChangeModal, setRoleChangeModal] = useState({
    isOpen: false,
    user: null,
    newRole: ''
  });

  // RTK Query hooks with pagination and filters
  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useGetAllUsersQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    role: filters.role === 'ALL' ? undefined : filters.role,
    status: filters.status === 'ALL' ? undefined : filters.status
  });

  const { data: statsResponse } = useGetUserStatsQuery();

  // Mutations
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleStatus, { isLoading: isStatusLoading }] = useToggleUserStatusMutation();
  const [changeRole, { isLoading: isRoleLoading }] = useChangeUserRoleMutation();
  const [approveWholesaler, { isLoading: isApprovalLoading }] = useApproveWholesalerMutation();

  // Extract data
  const users = usersResponse?.data?.users || [];
  const serverPagination = usersResponse?.data?.pagination || {};
  const totalUsers = serverPagination.total || 0;
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

  // Role badge styling
  const getRoleBadgeStyle = (role) => {
    const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (role) {
      case 'ADMIN':
        return `${baseStyles} ${
          theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
        }`;
      case 'WHOLESALER':
        return `${baseStyles} ${
          theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
        }`;
      case 'CUSTOMER':
        return `${baseStyles} ${
          theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
        }`;
      default:
        return `${baseStyles} ${
          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
        }`;
    }
  };

  // Status badge styling
  const getStatusBadgeStyle = (isActive) => {
    const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    return isActive 
      ? `${baseStyles} ${
          theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
        }`
      : `${baseStyles} ${
          theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
        }`;
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleRefresh = () => {
    refetchUsers();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteModal.user.id).unwrap();
      setDeleteModal({ isOpen: false, user: null });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await toggleStatus({ 
        userId, 
        currentStatus 
      }).unwrap();
    } catch (error) {
      console.error('Status toggle failed:', error);
    }
  };

  const handleRoleChange = async () => {
    try {
      await changeRole({ 
        userId: roleChangeModal.user.id, 
        role: roleChangeModal.newRole 
      }).unwrap();
      setRoleChangeModal({ isOpen: false, user: null, newRole: '' });
    } catch (error) {
      console.error('Role change failed:', error);
    }
  };

  const handleWholesalerApproval = async (userId, currentApproval) => {
    try {
      await approveWholesaler({ 
        userId, 
        isApproved: !currentApproval 
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

  const handleRoleFilterChange = (role) => {
    dispatch(setFilters({ 
      role 
    }));
  };

  const handleStatusFilterChange = (status) => {
    dispatch(setFilters({ 
      status 
    }));
  };

  const openDeleteModal = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const openRoleChangeModal = (user, newRole) => {
    setRoleChangeModal({ isOpen: true, user, newRole });
  };

  const closeRoleChangeModal = () => {
    setRoleChangeModal({ isOpen: false, user: null, newRole: '' });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'avatar',
      title: 'Avatar',
      dataIndex: 'id',
      render: (value, record) => (
        <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          {record.avatar ? (
            <img 
              src={record.avatar} 
              alt={record.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${record.avatar ? 'hidden' : 'flex'}`}>
            <FiUser className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>
      ),
      className: 'w-12'
    },
    {
      key: 'name',
      title: 'User Details',
      dataIndex: 'name',
      sortable: true,
      render: (value, record) => (
        <div className="min-w-0">
          <p className={`font-medium truncate ${themeStyles.text.primary}`}>{value}</p>
          <p className={`text-sm truncate ${themeStyles.text.muted}`}>
            {record.email}
          </p>
          {record.phone && (
            <p className={`text-sm truncate ${themeStyles.text.muted}`}>
              {record.phone}
            </p>
          )}
        </div>
      ),
      className: 'min-w-48'
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      render: (value, record) => (
        <div className="flex flex-col space-y-1">
          <span className={getRoleBadgeStyle(value)}>
            {value === 'ADMIN' && <FiShield className="w-3 h-3 mr-1" />}
            {value === 'WHOLESALER' && <FiShoppingBag className="w-3 h-3 mr-1" />}
            {value === 'CUSTOMER' && <FiUser className="w-3 h-3 mr-1" />}
            {value}
          </span>
          {record.role === 'WHOLESALER' && (
            <button
              onClick={() => handleWholesalerApproval(record.id, record.isApproved)}
              disabled={isApprovalLoading}
              className={`text-xs px-2 py-1 rounded ${
                record.isApproved
                  ? theme === 'dark' 
                    ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                  : theme === 'dark'
                    ? 'bg-yellow-900 text-yellow-200 hover:bg-yellow-800'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              } ${isApprovalLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isApprovalLoading ? '...' : record.isApproved ? 'Approved' : 'Pending'}
            </button>
          )}
        </div>
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
          data-action-button="true"
        >
          {isStatusLoading ? (
            <FiRefreshCw className="w-3 h-3 mr-1 animate-spin" />
          ) : isActive ? (
            <FiUserCheck className="w-3 h-3 mr-1" />
          ) : (
            <FiUserX className="w-3 h-3 mr-1" />
          )}
          {isStatusLoading ? 'Updating...' : isActive ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'createdAt',
      title: 'Joined',
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
            to={`/dashboard/users/view/${value}`}
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
          
          {/* Role Change Buttons */}
          {record.role !== 'ADMIN' && (
            <>
              <button
                onClick={() => openRoleChangeModal(record, 'ADMIN')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-red-400 hover:bg-red-900'
                    : 'text-red-600 hover:bg-red-50'
                }`}
                title="Make Admin"
                disabled={isRoleLoading}
                data-action-button="true"
              >
                <FiShield className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => openRoleChangeModal(record, 'WHOLESALER')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-purple-400 hover:bg-purple-900'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
                title="Make Wholesaler"
                disabled={isRoleLoading}
                data-action-button="true"
              >
                <FiShoppingBag className="w-4 h-4" />
              </button>
            </>
          )}
          
          {/* Delete Button */}
          <button
            onClick={() => openDeleteModal(record)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Delete User"
            disabled={isDeleting}
            data-action-button="true"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Mobile card renderer (keep your existing renderUserCard function)
  const renderUserCard = (user) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${themeStyles.card}`}
      >
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center ${
                user.avatar ? "hidden" : "flex"
              }`}
            >
              <FiUser className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className={`font-medium truncate ${themeStyles.text.primary}`}>
                  {user.name}
                </h3>
                <p className={`text-sm truncate ${themeStyles.text.muted}`}>
                  {user.email}
                </p>
                {user.phone && (
                  <p className={`text-sm truncate ${themeStyles.text.muted}`}>
                    {user.phone}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end space-y-2">
                {/* Status toggle */}
                <button
                  onClick={() => handleStatusToggle(user.id, user.isActive)}
                  disabled={isStatusLoading}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    user.isActive
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
                      : user.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </button>

                {/* Role badge */}
                <span className={getRoleBadgeStyle(user.role)}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Bottom section */}
            <div className={`flex flex-wrap justify-between items-center mt-3 pt-3 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 text-sm">
                <span className={themeStyles.text.muted}>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex space-x-2">
                {/* View Button */}
                <Link
                  to={`/dashboard/users/view/${user.id}`}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-blue-400 hover:bg-blue-900' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                  data-action-button="true"
                >
                  <FiEye className="w-4 h-4" />
                </Link>
                
                {/* Role Change Buttons */}
                {user.role !== 'ADMIN' && (
                  <>
                    <button
                      onClick={() => openRoleChangeModal(user, 'ADMIN')}
                      className={`p-1 rounded transition-colors ${
                        theme === 'dark' 
                          ? 'text-red-400 hover:bg-red-900' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      disabled={isRoleLoading}
                      data-action-button="true"
                    >
                      <FiShield className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => openRoleChangeModal(user, 'WHOLESALER')}
                      className={`p-1 rounded transition-colors ${
                        theme === 'dark' 
                          ? 'text-purple-400 hover:bg-purple-900' 
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                      disabled={isRoleLoading}
                      data-action-button="true"
                    >
                      <FiShoppingBag className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                {/* Delete Button */}
                <button
                  onClick={() => openDeleteModal(user)}
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
                Users Management
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
                Manage your platform users • {totalUsers} total users
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={usersLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <Link
                to="/dashboard/users/add"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add User</span>
              </Link>
            </div>
          </div>

          {/* User Stats */}
          <UserStats stats={stats} />

          {/* Filters Section */}
          <div className="mb-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Role Filter */}
              <div className="flex flex-wrap gap-2">
                {['ALL', 'CUSTOMER', 'WHOLESALER', 'ADMIN'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleFilterChange(role)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.role === role
                        ? theme === 'dark' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-600 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {role === 'ALL' ? 'All Roles' : role}
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Users Display */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}>
          {isMobile ? (
            <div className="p-4">
              <DataCard
                data={users}
                renderItem={renderUserCard}
                onItemClick={(user) => navigate(`/dashboard/users/view/${user.id}`)}
                emptyMessage="No users found"
                emptyAction={
                  <div className="text-center">
                    <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                      Users will appear here when they register
                    </p>
                  </div>
                }
                              pagination={{
                serverTotalItems: totalUsers,
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
              data={users}
              keyField="id"
              loading={usersLoading}
              onRowClick={(user) => navigate(`/dashboard/users/view/${user.id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <div className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No users found</div>
                  <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                    {filters.role !== 'ALL' || filters.status !== 'ALL' 
                      ? `No users match your current filters` 
                      : 'Users will appear here when they register on your platform'
                    }
                  </p>
                  {(filters.role !== 'ALL' || filters.status !== 'ALL') && (
                    <button
                      onClick={() => {
                        handleRoleFilterChange('ALL');
                        handleStatusFilterChange('ALL');
                      }}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Show All Users</span>
                    </button>
                  )}
                </div>
              }
              pagination={{
                serverTotalItems: totalUsers,
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
          title="Delete User"
          message={
            `Are you sure you want to delete "${deleteModal.user?.name}"? This action cannot be undone and will permanently remove all user data.`
          }
          confirmText="Delete User"
          isLoading={isDeleting}
          theme={theme}
        />

        {/* Role Change Confirmation Modal */}
        <AnimatePresence>
          {roleChangeModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`rounded-xl p-6 max-w-md w-full ${themeStyles.card}`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${themeStyles.text.primary}`}>
                  Change User Role
                </h3>
                <p className={`mb-6 ${themeStyles.text.secondary}`}>
                  Are you sure you want to change {roleChangeModal.user?.name}'s role to <strong>{roleChangeModal.newRole}</strong>?
                </p>
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={closeRoleChangeModal}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRoleChange}
                    disabled={isRoleLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isRoleLoading ? 'Changing...' : 'Change Role'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminUsers;