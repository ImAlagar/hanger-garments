// components/admin/contacts/AdminContacts.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMail,
  FiPhone,
  FiUser,
  FiMessageSquare
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetAllContactsQuery,
  useDeleteContactMutation,
  useUpdateContactStatusMutation,
  useGetContactStatsQuery,
} from '../../../../redux/services/contactService';
import {
  setPagination,
  setFilters
} from '../../../../redux/slices/contactSlice';

// Component imports
import ContactStats from '../../../../components/admin/stats/ContactStats';
import DeleteConfirmationModal from '../../../../shared/DeleteConfirmationModal';
import DataCard from '../../../../shared/DataCard';
import DataTable from '../../../../shared/DataTable';
import { useTheme } from '../../../../context/ThemeContext';

const AdminContacts = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redux state
  const { 
    pagination,
    filters 
  } = useSelector((state) => state.contact);

  // Local state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    contact: null
  });

  // RTK Query hooks with pagination and filters
  const {
    data: contactsResponse,
    isLoading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts
  } = useGetAllContactsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    status: filters.status === 'ALL' ? undefined : filters.status
  });

  const { data: statsResponse } = useGetContactStatsQuery();
  
  // Mutations
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();
  const [updateStatus, { isLoading: isStatusLoading }] = useUpdateContactStatusMutation();

  // Extract data with pagination
  const contactsData = contactsResponse?.data || {};
  const contacts = Array.isArray(contactsData) ? contactsData : 
                  Array.isArray(contactsData.contacts) ? contactsData.contacts : 
                  Array.isArray(contactsData.data) ? contactsData.data : 
                  Array.isArray(contactsData.items) ? contactsData.items : [];
  
  const serverPagination = contactsResponse?.data?.pagination || {};
  const totalContacts = serverPagination.total || 0;
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
  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'PENDING':
        return `${baseClasses} ${theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`;
      case 'IN_PROGRESS':
        return `${baseClasses} ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`;
      case 'RESOLVED':
        return `${baseClasses} ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`;
      case 'CLOSED':
        return `${baseClasses} ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`;
      default:
        return `${baseClasses} ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`;
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
    refetchContacts();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteContact(deleteModal.contact.id).unwrap();
      setDeleteModal({ isOpen: false, contact: null });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleStatusUpdate = async (contactId, currentStatus) => {
    try {
      // Map status transitions based on your API
      const statusMap = {
        'PENDING': 'IN_PROGRESS',
        'IN_PROGRESS': 'RESOLVED',
        'RESOLVED': 'CLOSED',
        'CLOSED': 'PENDING'
      };
      
      const newStatus = statusMap[currentStatus] || 'PENDING';
      
      await updateStatus({ 
        contactId, 
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

  const openDeleteModal = (contact) => {
    setDeleteModal({ isOpen: true, contact });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, contact: null });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      title: 'Contact',
      dataIndex: 'name',
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
              <p className={`font-medium truncate ${themeStyles.text.primary}`}>{value || 'Unknown'}</p>
              <p className={`text-sm truncate ${themeStyles.text.muted}`}>{record.email || 'No email'}</p>
            </div>
          </div>
        </div>
      ),
      className: 'min-w-64'
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <FiPhone className={`w-4 h-4 ${themeStyles.text.muted}`} />
          <span className={themeStyles.text.secondary}>{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'message',
      title: 'Message',
      dataIndex: 'message',
      render: (value) => (
        <span className={`font-medium ${themeStyles.text.primary}`}>
          {value || 'No Subject'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (status, record) => (
        <button
          onClick={() => handleStatusUpdate(record.id, status)}
          disabled={isStatusLoading}
          className={`${getStatusBadge(status)} transition-colors ${
            isStatusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
          }`}
          data-action-button="true"
        >
          {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ') : 'Unknown'}
        </button>
      )
    },
    {
      key: 'createdAt',
      title: 'Received',
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
            to={`/dashboard/contacts/view/${value}`}
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
          
          {/* Reply Button */}
          <a
            href={`mailto:${record.email}?subject=Re: ${record.subject}`}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-green-400 hover:bg-green-900'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title="Reply via Email"
            data-action-button="true"
          >
            <FiMail className="w-4 h-4" />
          </a>
          
          {/* Delete Button */}
          <button
            onClick={() => openDeleteModal(record)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Delete Contact"
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
  const renderContactCard = (contact) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all ${themeStyles.card}`}
      >
        <div className="flex items-start space-x-4">
          {/* Contact Avatar */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <FiUser className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>

          {/* Contact Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <div className="min-w-0">
                <h3 className={`font-medium truncate ${themeStyles.text.primary}`}>
                  {contact.name || 'Unknown'}
                </h3>
                <p className={`text-sm truncate ${themeStyles.text.muted}`}>
                  {contact.email || 'No email'}
                </p>
                {contact.phone && (
                  <p className={`text-sm truncate ${themeStyles.text.muted} flex items-center space-x-1`}>
                    <FiPhone className="w-3 h-3" />
                    <span>{contact.phone}</span>
                  </p>
                )}
              </div>

              {/* Status badge */}
              <button
                onClick={() => handleStatusUpdate(contact.id, contact.status)}
                disabled={isStatusLoading}
                className={`${getStatusBadge(contact.status)} ${
                  isStatusLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                }`}
                data-action-button="true"
              >
                {contact.status ? contact.status.charAt(0).toUpperCase() + contact.status.slice(1).toLowerCase().replace('_', ' ') : 'Unknown'}
              </button>
            </div>

            {/* Subject and Message Preview */}
            <div className="mb-3">
              <h4 className={`font-medium text-sm ${themeStyles.text.primary} mb-1`}>
                {contact.subject || 'No Subject'}
              </h4>
              <p className={`text-sm ${themeStyles.text.muted} line-clamp-2`}>
                {contact.message || 'No message content'}
              </p>
            </div>

            {/* Bottom section */}
            <div className={`flex flex-wrap justify-between items-center pt-3 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <span className={`text-xs ${themeStyles.text.muted} mb-2 sm:mb-0`}>
                {contact.createdAt ? `${new Date(contact.createdAt).toLocaleDateString()} • ${new Date(contact.createdAt).toLocaleTimeString()}` : 'Date unknown'}
              </span>
              
              <div className="flex space-x-2">
                {/* View Button */}
                <Link
                  to={`/dashboard/contacts/view/${contact.id}`}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-blue-400 hover:bg-blue-900' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                  data-action-button="true"
                >
                  <FiEye className="w-4 h-4" />
                </Link>
                
                {/* Reply Button */}
                <a
                  href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'text-green-400 hover:bg-green-900' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  data-action-button="true"
                >
                  <FiMail className="w-4 h-4" />
                </a>
                
                {/* Delete Button */}
                <button
                  onClick={() => openDeleteModal(contact)}
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
              <h1 className={`text-2xl sm:text-3xl font-italiana font-bold truncate ${themeStyles.text.primary}`}>
                Contact Messages
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${themeStyles.text.secondary}`}>
                Manage customer inquiries and messages • {totalContacts} total messages
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">              
              <button
                onClick={handleRefresh}
                disabled={contactsLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${contactsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Contact Statistics */}
          <div className="mb-6 lg:mb-8">
            <ContactStats stats={stats} theme={theme} />
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
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
                  {status === 'ALL' ? 'All Messages' : status.replace('_', ' ')}
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

        {/* Contacts Display */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${themeStyles.card}`}>
          {isMobile ? (
            <div className="p-4">
              <DataCard
                data={contacts}
                renderItem={renderContactCard}
                onItemClick={(contact) => navigate(`/dashboard/contacts/view/${contact.id}`)}
                emptyMessage="No contact messages found"
                emptyAction={
                  <div className="text-center">
                    <FiMessageSquare className={`w-12 h-12 mx-auto mb-4 ${themeStyles.text.muted}`} />
                    <p className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No messages yet</p>
                    <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                      {filters.status === 'ALL' 
                        ? 'Customer contact messages will appear here' 
                        : `No messages with status: ${filters.status}`
                      }
                    </p>
                    {filters.status !== 'ALL' && (
                      <button
                        onClick={() => handleStatusFilterChange('ALL')}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>Show All Messages</span>
                      </button>
                    )}
                  </div>
                }
                              pagination={{
                serverTotalItems: totalContacts,
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
              data={contacts}
              keyField="id"
              loading={contactsLoading}
              onRowClick={(contact) => navigate(`/dashboard/contacts/view/${contact.id}`)}
              emptyMessage={
                <div className="text-center py-12">
                  <FiMessageSquare className={`w-16 h-16 mx-auto mb-4 ${themeStyles.text.muted}`} />
                  <div className={`text-lg mb-2 ${themeStyles.text.secondary}`}>No contact messages found</div>
                  <p className={`text-sm mb-4 ${themeStyles.text.muted}`}>
                    {filters.status === 'ALL' 
                      ? 'Customer inquiries and messages will appear here when they contact you' 
                      : `No messages with status: ${filters.status}`
                    }
                  </p>
                  {filters.status !== 'ALL' && (
                    <button
                      onClick={() => handleStatusFilterChange('ALL')}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Show All Messages</span>
                    </button>
                  )}
                </div>
              }
              pagination={{
                serverTotalItems: totalContacts,
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
          title="Delete Contact Message"
          message={
            `Are you sure you want to delete the message from "${deleteModal.contact?.name}"? This action cannot be undone.`
          }
          confirmText="Delete Message"
          isLoading={isDeleting}
          theme={theme}
        />
      </motion.div>
    </div>
  );
};

export default AdminContacts;