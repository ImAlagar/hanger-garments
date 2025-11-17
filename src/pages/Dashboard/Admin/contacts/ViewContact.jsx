// components/admin/contacts/ViewContact.jsx - FIXED
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetContactByIdQuery, useUpdateContactStatusMutation } from '../../../../redux/services/contactService';
import { ArrowLeft, Edit, Calendar, Mail, Phone, User, MessageSquare, CheckCircle, Clock, Archive, Loader } from 'lucide-react';

const ViewContact = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: contactData, isLoading, error } = useGetContactByIdQuery(contactId);
  const [updateStatus, { isLoading: isStatusLoading }] = useUpdateContactStatusMutation();

  const contact = contactData?.data;

  // Theme-based styling
  const themeClasses = {
    light: {
      bg: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        card: 'bg-white',
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600',
      },
      border: 'border-gray-200',
      shadow: 'shadow-lg',
    },
    dark: {
      bg: {
        primary: 'bg-gray-900',
        secondary: 'bg-gray-800',
        card: 'bg-gray-800',
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-200',
        muted: 'text-gray-400',
      },
      border: 'border-gray-700',
      shadow: 'shadow-lg shadow-gray-900',
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Status badge component - UPDATED to match your API
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      PENDING: { color: 'yellow', icon: Clock, label: 'Pending' },
      IN_PROGRESS: { color: 'blue', icon: Loader, label: 'In Progress' },
      RESOLVED: { color: 'green', icon: CheckCircle, label: 'Resolved' },
      CLOSED: { color: 'gray', icon: Archive, label: 'Closed' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        theme === 'dark' 
          ? `bg-${config.color}-900 text-${config.color}-200`
          : `bg-${config.color}-100 text-${config.color}-800`
      }`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.label}
      </span>
    );
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateStatus({ contactId, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Status update failed:', error);
      // Error toast will be shown by the mutation
    }
  };

  // Status options based on your API
  const statusOptions = [
    { value: 'PENDING', label: 'Pending', description: 'Awaiting response' },
    { value: 'IN_PROGRESS', label: 'In Progress', description: 'Being handled' },
    { value: 'RESOLVED', label: 'Resolved', description: 'Successfully resolved' },
    { value: 'CLOSED', label: 'Closed', description: 'Closed without resolution' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Contact Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>Contact not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* Header */}
      <div className={`border-b ${currentTheme.border} ${currentTheme.bg.primary}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold font-italiana ${currentTheme.text.primary}`}>
                  Message from {contact.name}
                </h1>
                <p className={`${currentTheme.text.muted} font-instrument`}>
                  Contact Details
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <a
                href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Mail size={16} className="mr-2" />
                Reply
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sender Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sender Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                Sender Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <User className={currentTheme.text.muted} size={20} />
                  </div>
                  <div>
                    <p className={`font-medium ${currentTheme.text.primary}`}>{contact.name}</p>
                    <p className={`text-sm ${currentTheme.text.muted}`}>Contact Person</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className={`w-4 h-4 ${currentTheme.text.muted}`} />
                    <a 
                      href={`mailto:${contact.email}`}
                      className={`text-blue-500 hover:text-blue-600 transition-colors`}
                    >
                      {contact.email}
                    </a>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className={`w-4 h-4 ${currentTheme.text.muted}`} />
                      <a 
                        href={`tel:${contact.phone}`}
                        className={`text-blue-500 hover:text-blue-600 transition-colors`}
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Message Status */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                Message Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Current Status</span>
                  <StatusBadge status={contact.status} />
                </div>
                
                <div className="space-y-2">
                  <p className={`text-sm ${currentTheme.text.muted} mb-2`}>Update Status:</p>
                  <div className="flex flex-col gap-2">
                    {statusOptions.map((statusOption) => (
                      <button
                        key={statusOption.value}
                        onClick={() => handleStatusUpdate(statusOption.value)}
                        disabled={contact.status === statusOption.value || isStatusLoading}
                        className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          contact.status === statusOption.value
                            ? 'bg-blue-600 text-white cursor-default'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } ${isStatusLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div>
                          <div className="font-medium">{statusOption.label}</div>
                          <div className="text-xs opacity-75">{statusOption.description}</div>
                        </div>
                        {isStatusLoading && contact.status === statusOption.value && (
                          <Loader className="w-4 h-4 animate-spin" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Timeline Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 flex items-center ${currentTheme.text.primary}`}>
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </h2>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-1`}>Received</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(contact.createdAt)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-1`}>Last Updated</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(contact.updatedAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Message Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message Content */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <MessageSquare className="w-5 h-5 mr-2" />
                Message Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Subject</label>
                  <p className={`text-lg font-medium ${currentTheme.text.primary}`}>
                    {contact.subject || 'No Subject'}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Message</label>
                  <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`whitespace-pre-wrap leading-relaxed ${currentTheme.text.secondary}`}>
                      {contact.message}
                    </p>
                  </div>
                </div>

                {contact.additionalInfo && (
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Additional Information</label>
                    <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <pre className={`whitespace-pre-wrap font-sans ${currentTheme.text.secondary}`}>
                        {JSON.stringify(contact.additionalInfo, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Mail size={16} className="mr-2" />
                  Reply via Email
                </a>
                
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone size={16} className="mr-2" />
                    Call Customer
                  </a>
                )}
                
                <button
                  onClick={() => handleStatusUpdate('CLOSED')}
                  disabled={isStatusLoading}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Archive size={16} className="mr-2" />
                  {isStatusLoading ? 'Updating...' : 'Mark as Closed'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewContact;