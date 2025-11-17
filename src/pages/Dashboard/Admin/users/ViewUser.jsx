// components/admin/users/ViewUser.jsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetUserByIdQuery } from '../../../../redux/services/userService';
import { ArrowLeft, Edit, Calendar, Mail, Phone, MapPin, Store, Shield, User, CheckCircle, XCircle } from 'lucide-react';

const ViewUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: userData, isLoading, error } = useGetUserByIdQuery(userId);
  const user = userData?.data;

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

  // Role badge styling
  const getRoleBadgeStyle = (role) => {
    const baseStyles = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    
    switch (role) {
      case 'ADMIN':
        return `${baseStyles} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'WHOLESALER':
        return `${baseStyles} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
      case 'CUSTOMER':
        return `${baseStyles} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">User Not Found</h2>
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>User not found</h2>
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-5 h-5" />;
      case 'WHOLESALER':
        return <Store className="w-5 h-5" />;
      case 'CUSTOMER':
        return <User className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
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
                <h1 className={`text-2xl font-bold font-italiana ${currentTheme.text.primary}`}>{user.name}</h1>
                <p className={`${currentTheme.text.muted} font-instrument`}>
                  User Details
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                to={`/dashboard/users/edit/${user.id}`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Avatar */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Profile Picture</h2>
              <div className="flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className={currentTheme.text.muted} />
                  )}
                </div>
                <h3 className={`text-xl font-semibold mt-4 ${currentTheme.text.primary}`}>{user.name}</h3>
                <div className="mt-2 flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className={getRoleBadgeStyle(user.role)}>
                    {user.role}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-lg font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Email Verified</span>
                  {user.isEmailVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                {user.role === 'WHOLESALER' && (
                  <div className="flex items-center justify-between">
                    <span className={currentTheme.text.muted}>Approved</span>
                    {user.isApproved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={currentTheme.text.muted}>Addresses</span>
                  <span className={`font-medium ${currentTheme.text.primary}`}>
                    {user.addresses?.length || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Full Name</label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>{user.name}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Role</label>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <span className={getRoleBadgeStyle(user.role)}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <p className={`font-medium ${currentTheme.text.primary}`}>{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <p className={`font-medium ${currentTheme.text.primary}`}>{user.phone}</p>
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Status</label>
                  <div className="flex items-center">
                    {user.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className={currentTheme.text.primary}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {user.role === 'WHOLESALER' && (
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Wholesaler Status</label>
                    <div className="flex items-center">
                      {user.isApproved ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-yellow-500 mr-2" />
                      )}
                      <span className={currentTheme.text.primary}>
                        {user.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Wholesaler Information */}
            {user.role === 'WHOLESALER' && user.wholesalerProfile && (
              <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                  <Store className="w-5 h-5 mr-2" />
                  Wholesaler Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Company Name</label>
                    <p className={`font-medium ${currentTheme.text.primary}`}>
                      {user.wholesalerProfile.companyName}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Business Type</label>
                    <p className={`font-medium ${currentTheme.text.primary}`}>
                      {user.wholesalerProfile.businessType}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location
                    </label>
                    <p className={`font-medium ${currentTheme.text.primary}`}>
                      {user.wholesalerProfile.city}, {user.wholesalerProfile.state}
                    </p>
                  </div>
                  {user.wholesalerProfile.gstNumber && (
                    <div>
                      <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>GST Number</label>
                      <p className={`font-medium ${currentTheme.text.primary}`}>
                        {user.wholesalerProfile.gstNumber}
                      </p>
                    </div>
                  )}
                  {user.wholesalerProfile.websiteUrl && (
                    <div>
                      <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Website</label>
                      <a 
                        href={user.wholesalerProfile.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {user.wholesalerProfile.websiteUrl}
                      </a>
                    </div>
                  )}
                  {user.wholesalerProfile.instagramUrl && (
                    <div>
                      <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Instagram</label>
                      <a 
                        href={user.wholesalerProfile.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {user.wholesalerProfile.instagramUrl}
                      </a>
                    </div>
                  )}
                </div>

                {/* Shop Photos */}
                {user.wholesalerProfile.shopPhotos && user.wholesalerProfile.shopPhotos.length > 0 && (
                  <div className="mt-6">
                    <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-4`}>Shop Photos</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {user.wholesalerProfile.shopPhotos.map((photo, index) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          <img
                            src={photo}
                            alt={`Shop photo ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Timeline Information */}
            <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
              <h2 className={`text-xl font-semibold font-instrument mb-6 flex items-center ${currentTheme.text.primary}`}>
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Joined At</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text.muted} mb-2`}>Last Updated</label>
                  <p className={currentTheme.text.primary}>
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Address Information */}
            {user.addresses && user.addresses.length > 0 && (
              <motion.div variants={itemVariants} className={`rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.shadow}`}>
                <h2 className={`text-xl font-semibold font-instrument mb-6 ${currentTheme.text.primary}`}>
                  Addresses ({user.addresses.length})
                </h2>
                <div className="space-y-4">
                  {user.addresses.map((address, index) => (
                    <div key={address.id} className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-medium ${currentTheme.text.primary}`}>
                            {address.name} {address.isDefault && '(Default)'}
                          </p>
                          <p className={`text-sm ${currentTheme.text.muted}`}>
                            {address.street}, {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className={`text-sm ${currentTheme.text.muted}`}>
                            {address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewUser;