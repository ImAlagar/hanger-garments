// src/pages/UserOrders.jsx
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingBag,
  FaSearch,
  FaEye,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBox,
  FaMoneyBillWave,
  FaStore,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaListUl,
  FaMapMarkerAlt,
  FaReceipt,
  FaCalendarAlt,
  FaTag,
  FaShippingFast,
  FaCreditCard,
  FaUser,
  FaPalette,
  FaImage
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetUserOrdersQuery, useGetOrderByOrderNumberQuery } from '../../../redux/services/orderService';
import placeholderimage from "../../../assets/images/placeholder.jpg"



const UserOrders = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isWholesaleUser = user?.role === 'WHOLESALER';
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // RTK Query with pagination
  const { 
    data: ordersResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetUserOrdersQuery({ page: currentPage, limit: itemsPerPage });

  // State for selected order and filters
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [activeTab, setActiveTab] = useState('items');
  const [hoveredOrder, setHoveredOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get order details when selected
  const { data: orderDetails } = useGetOrderByOrderNumberQuery(
    selectedOrder?.orderNumber, 
    { skip: !selectedOrder }
  );

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/orders' } });
    }
  }, [user, navigate]);

  const orders = ordersResponse?.data?.orders || [];
  const pagination = ordersResponse?.data?.pagination || {};

  const getFilteredOrders = () => {
    let filtered = orders.filter(order => 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (viewMode) {
      case 'active':
        filtered = filtered.filter(order => 
          !['DELIVERED', 'CANCELLED', 'delivered', 'cancelled'].includes(order.status)
        );
        break;
      case 'delivered':
        filtered = filtered.filter(order => 
          ['DELIVERED', 'delivered'].includes(order.status)
        );
        break;
      case 'cancelled':
        filtered = filtered.filter(order => 
          ['CANCELLED', 'cancelled'].includes(order.status)
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const totalPages = pagination.pages || Math.ceil(filteredOrders.length / itemsPerPage);

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    const configs = {
      'confirmed': { 
        icon: FaCheckCircle, 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-50',
        gradient: 'from-emerald-50 to-green-50',
        borderColor: 'border-emerald-200'
      },
      'processing': { 
        icon: FaBox, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50',
        gradient: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200'
      },
      'shipped': { 
        icon: FaTruck, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50',
        gradient: 'from-orange-50 to-amber-50',
        borderColor: 'border-orange-200'
      },
      'delivered': { 
        icon: FaCheckCircle, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        gradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200'
      },
      'cancelled': { 
        icon: FaTimesCircle, 
        color: 'text-rose-600', 
        bgColor: 'bg-rose-50',
        gradient: 'from-rose-50 to-red-50',
        borderColor: 'border-rose-200'
      },
      'pending': {
        icon: FaClock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        gradient: 'from-amber-50 to-yellow-50',
        borderColor: 'border-amber-200'
      }
    };
    
    return configs[statusLower] || { 
      icon: FaClock, 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-50',
      gradient: 'from-gray-50 to-slate-50',
      borderColor: 'border-gray-200'
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
    setActiveTab('items');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedOrder(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getViewModeCount = (mode) => {
    switch (mode) {
      case 'active':
        return orders.filter(order => !['DELIVERED', 'CANCELLED', 'delivered', 'cancelled'].includes(order.status)).length;
      case 'delivered':
        return orders.filter(order => ['DELIVERED', 'delivered'].includes(order.status)).length;
      case 'cancelled':
        return orders.filter(order => ['CANCELLED', 'cancelled'].includes(order.status)).length;
      default:
        return orders.length;
    }
  };

  // Get correct image URL (from second project)
  const getProductImage = (orderItem) => {
    if (orderItem.productVariant?.variantImages?.length > 0) {
      return orderItem.productVariant.variantImages[0]?.imageUrl;
    }
    if (orderItem.product?.images?.length > 0) {
      const firstImage = orderItem.product.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage?.imageUrl;
    }
    return placeholderimage;
  };

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
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    hover: {
      y: -2,
      scale: 1.01,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

const tabs = [
  { key: 'items', label: 'Order Items', icon: FaListUl, color: 'text-blue-600' },
  { key: 'custom', label: 'Custom Designs', icon: FaPalette, color: 'text-purple-600' }, // Add this
  { key: 'shipping', label: 'Shipping Info', icon: FaMapMarkerAlt, color: 'text-purple-600' },
  { key: 'tracking', label: 'Order Tracking', icon: FaShippingFast, color: 'text-orange-600' },
  { key: 'summary', label: 'Order Summary', icon: FaReceipt, color: 'text-emerald-600' }
];

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-80">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
                >
                  <FaShoppingBag className="w-6 h-6 text-white" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 text-sm"
                >
                  Loading your orders...
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center max-w-md mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <FaTimesCircle className="w-8 h-8 text-rose-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Orders</h2>
              <p className="text-gray-600 text-sm mb-6">We encountered an issue while loading your orders.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refetch}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm"
              >
                Try Again
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
          >
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md"
              >
                <FaShoppingBag className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  My Orders {isWholesaleUser && <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Wholesale</span>}
                </h1>
                <p className="text-gray-600 text-sm mt-1">Track and manage your purchases</p>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/products"
                className="group flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-300 text-sm"
              >
                <FaStore className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                <span className="font-medium text-gray-700 group-hover:text-blue-700">Continue Shopping</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Filter and Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4 mb-6"
          >
            {/* View Mode Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: 'all', label: 'All Orders', count: getViewModeCount('all') },
                { key: 'active', label: 'Active', count: getViewModeCount('active') },
                { key: 'delivered', label: 'Delivered', count: getViewModeCount('delivered') },
                { key: 'cancelled', label: 'Cancelled', count: getViewModeCount('cancelled') }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setViewMode(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                    viewMode === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="font-medium">{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    viewMode === tab.key 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Search */}
            <motion.div 
              className="relative max-w-xl"
              whileFocus={{ scale: 1.01 }}
            >
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by order number, status, or recipient name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm placeholder-gray-400"
              />
            </motion.div>
          </motion.div>

          {/* Stats and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4"
          >
            <div className="flex items-center space-x-3 mb-3 lg:mb-0">
              <p className="text-gray-600 text-sm">
                Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of{' '}
                <span className="font-semibold text-gray-900">{filteredOrders.length}</span> orders
              </p>
            </div>

          </motion.div>

          {/* Orders List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 mb-8"
          >
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-8 text-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center"
                >
                  <FaShoppingBag className="w-8 h-8 text-gray-400" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                  {searchTerm 
                    ? "No orders match your search criteria. Try adjusting your search terms." 
                    : `You don't have any ${viewMode !== 'all' ? viewMode : ''} orders yet.`}
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/products"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <FaStore className="w-4 h-4" />
                    <span>Explore Products</span>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              filteredOrders.map((order) => {
                const { icon: StatusIcon, color, bgColor, gradient, borderColor } = getStatusConfig(order.status);
                
                return (
                  <motion.div
                    key={order.id || order.orderNumber}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    onHoverStart={() => setHoveredOrder(order.id)}
                    onHoverEnd={() => setHoveredOrder(null)}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md border transition-all duration-300 ${
                      expandedOrder === order.id 
                        ? 'border-blue-300 ring-2 ring-blue-500/10' 
                        : borderColor
                    } overflow-hidden`}
                  >
                    {/* Order Header */}
                    <motion.div 
                      className={`p-4 cursor-pointer bg-gradient-to-r ${gradient} transition-all duration-300`}
                      onClick={() => toggleOrderExpansion(order.id || order.orderNumber)}
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mb-3">
                            <div className="flex items-center space-x-3 mb-2 lg:mb-0">
                              <h3 className="text-lg font-bold text-gray-900">
                                #{order.orderNumber}
                              </h3>
                              <motion.span 
                                whileHover={{ scale: 1.02 }}
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${bgColor} ${color} border ${borderColor}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                <span>{order.status}</span>
                              </motion.span>
                            </div>
                            
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                                <span>{formatDate(order.createdAt)}</span>
                              </div>
                              {order.name && (
                                <div className="flex items-center space-x-1">
                                  <FaUser className="w-3 h-3 text-gray-400" />
                                  <span>{order.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-xs">
                                <FaListUl className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-gray-600">Items</p>
                                <p className="font-semibold text-gray-900">
                                  {order.orderItems?.length || 0} products
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-xs">
                                <FaMoneyBillWave className="w-4 h-4 text-green-500" />
                              </div>
                              <div>
                                <p className="text-gray-600">Total Amount</p>
                                <p className="font-semibold text-gray-900">
                                  {formatCurrency(order.totalAmount)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-xs">
                                <FaCreditCard className="w-4 h-4 text-purple-500" />
                              </div>
                              <div>
                                <p className="text-gray-600">Payment</p>
                                <p className={`font-semibold text-xs ${
                                  order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' ? 'text-green-600' : 
                                  order.paymentStatus === 'PENDING' || order.paymentStatus === 'pending' ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {order.paymentStatus}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-4 xl:mt-0 xl:ml-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300 text-blue-600 hover:text-blue-700 text-xs"
                          >
                            <FaEye className="w-3 h-3" />
                            <span className="font-medium">Quick View</span>
                          </motion.button>
                          
                          <motion.div
                            animate={{ 
                              rotate: expandedOrder === (order.id || order.orderNumber) ? 180 : 0,
                              scale: hoveredOrder === order.id ? 1.1 : 1
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="text-gray-400"
                          >
                            <FaChevronDown className="w-4 h-4" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Expanded Order Details */}
                    <AnimatePresence>
                      {expandedOrder === (order.id || order.orderNumber) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="border-t border-gray-200 overflow-hidden"
                        >
                          <div className="p-6 bg-gray-50/50">
                            {/* Enhanced Tab Navigation */}
                            <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-6">
                              {tabs.map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                  <motion.button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`relative flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-1 min-w-[120px] justify-center ${
                                      activeTab === tab.key
                                        ? 'bg-white shadow-md border border-gray-100 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <TabIcon className={`w-4 h-4 ${
                                      activeTab === tab.key ? tab.color : 'text-gray-400'
                                    }`} />
                                    <span className={`font-medium text-sm ${
                                      activeTab === tab.key ? 'text-gray-900' : 'text-gray-600'
                                    }`}>
                                      {tab.label}
                                    </span>
                                    {activeTab === tab.key && (
                                      <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                      />
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>

                            {/* Tab Content */}
                            <motion.div
                              key={activeTab}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="min-h-[300px]"
                            >
                              {/* Order Items Tab */}
                              {activeTab === 'items' && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      Order Items ({order.orderItems?.length || 0})
                                    </h4>
                                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                                      Total: {formatCurrency(order.totalAmount)}
                                    </span>
                                  </div>
                                  
                                  <div className="grid gap-3">
                                    {order.orderItems?.map((item, index) => (
                                      <motion.div
                                        key={item.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                      >
                                        <motion.img
                                          whileHover={{ scale: 1.05 }}
                                          src={getProductImage(item)}
                                          alt={item.product?.name || "Product"}
                                          className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                                          onError={(e) => {
                                            e.target.src = placeholderimage;
                                          }}
                                        />
                                        
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                            <h5 className="font-semibold text-gray-900 text-sm leading-tight">
                                              {item.product?.name || "Product Name"}
                                            </h5>
                                            <span className="font-semibold text-gray-900 text-sm">
                                              {formatCurrency(item.price * item.quantity)}
                                            </span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                            <div className="flex items-center space-x-2 text-gray-600">
                                              <FaTag className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                              <span>Qty: <strong>{item.quantity}</strong></span>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2 text-gray-600">
                                              <FaMoneyBillWave className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                              <span>Unit: <strong>{formatCurrency(item.price)}</strong></span>
                                            </div>
                                            
                                            {item.productVariant?.color && (
                                              <div className="flex items-center space-x-2 text-gray-600">
                                                <div 
                                                  className="w-3 h-3 rounded-full border border-gray-300"
                                                  style={{ backgroundColor: item.productVariant.color.toLowerCase() }}
                                                />
                                                <span>Color: <strong>{item.productVariant.color}</strong></span>
                                              </div>
                                            )}
                                            
                                            {item.productVariant?.size && (
                                              <div className="flex items-center space-x-2 text-gray-600">
                                                <span>Size: <strong>{item.productVariant.size}</strong></span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>

                                  
                                </div>
                              )}

                              {/* Custom Designs Tab */}
                              {activeTab === 'custom' && (
                                <div className="space-y-4">
                                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FaPalette className="w-5 h-5 text-purple-600 mr-2" />
                                    Custom Design Images ({order.customImages?.length || 0})
                                  </h4>
                                  
                                  {order.customImages && order.customImages.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {order.customImages.map((customImage, index) => (
                                        <motion.div
                                          key={customImage.id}
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: 0.1 * index }}
                                          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                                        >
                                          <img
                                            src={customImage.imageUrl}
                                            alt={customImage.filename || `Custom Design ${index + 1}`}
                                            className="w-full h-48 object-cover"
                                          />
                                          <div className="p-3">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {customImage.filename ? customImage.filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ') : `Custom Design ${index + 1}`}
                                            </p>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
                                      <FaImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                      <p className="text-gray-600">No custom design images for this order</p>
                                    </div>
                                  )}
                                </div>
                              )}


                              {/* Shipping Address Tab */}
                              {activeTab === 'shipping' && (
                                <div className="space-y-4">
                                  <h4 className="text-lg font-semibold text-gray-900">Shipping Details</h4>
                                  
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                                  >
                                    <div className="flex flex-col lg:flex-row gap-6">
                                      <div className="flex items-start space-x-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                                          <FaMapMarkerAlt className="w-6 h-6 text-blue-600" />
                                        </div>
                                        
                                        <div className="space-y-3 flex-1">
                                          <div>
                                            <h5 className="font-semibold text-gray-900 text-sm mb-2">Delivery Address</h5>
                                            <div className="space-y-1 text-sm text-gray-600">
                                              <p className="font-medium text-gray-900">{order.name}</p>
                                              <p className="leading-relaxed">{order.address}</p>
                                              <p>{order.city}, {order.state} - {order.pincode}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                            <FaUser className="w-4 h-4 text-gray-600" />
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 font-medium">Contact Person</p>
                                            <p className="font-semibold text-gray-900 text-sm">{order.name}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                            <FaShippingFast className="w-4 h-4 text-gray-600" />
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                            <p className="font-semibold text-gray-900 text-sm">{order.phone}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                </div>
                              )}

                              {/* Order Summary Tab */}
                              {activeTab === 'summary' && (
                                <div className="space-y-4">
                                  <h4 className="text-lg font-semibold text-gray-900">Order Summary</h4>
                                  
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                                  >
                                    <div className="space-y-3 mb-6">
                                      {[
                                        { label: 'Items Subtotal', value: order.subtotal, icon: FaShoppingBag },
                                        { label: 'Shipping Cost', value: order.shippingCost, icon: FaShippingFast },
                                        ...(order.discount > 0 ? [{ 
                                          label: 'Discount', 
                                          value: -order.discount, 
                                          icon: FaTag,
                                          color: 'text-green-600' 
                                        }] : []),
                                      ].map((item, index) => (
                                        <motion.div
                                          key={item.label}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 }}
                                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <item.icon className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 text-sm">{item.label}</span>
                                          </div>
                                          <span className={`font-semibold text-sm ${item.color || 'text-gray-900'}`}>
                                            {item.value < 0 ? '-' : ''}{formatCurrency(Math.abs(item.value))}
                                          </span>
                                        </motion.div>
                                      ))}
                                    </div>
                                    
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.3 }}
                                      className="border-t border-gray-200 pt-4"
                                    >
                                      <div className="flex justify-between items-center py-2">
                                        <span className="text-base font-semibold text-gray-900">Total Amount</span>
                                        <span className="text-lg font-bold text-gray-900">
                                          {formatCurrency(order.totalAmount)}
                                        </span>
                                      </div>
                                    </motion.div>

                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.4 }}
                                      className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-blue-200">
                                          <FaCreditCard className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500 font-medium">Payment Method</p>
                                          <p className="font-semibold text-gray-900 text-sm capitalize">
                                            {order.paymentMethod?.toLowerCase()}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-green-200">
                                          <FaCheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500 font-medium">Payment Status</p>
                                          <p className={`font-semibold text-sm ${
                                            order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' 
                                              ? 'text-green-600' 
                                              : order.paymentStatus === 'PENDING' || order.paymentStatus === 'pending' 
                                              ? 'text-yellow-600' 
                                              : 'text-red-600'
                                          }`}>
                                            {order.paymentStatus}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </motion.div>
                                </div>
                              )}

                              {/* Tracking Tab */}
                              {activeTab === 'tracking' && (
                                <div className="space-y-4">
                                  <h4 className="text-lg font-semibold text-gray-900">Order Tracking</h4>
                                  
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                                  >
                                    {(order.trackingNumber || order.carrier) ? (
                                      <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {order.trackingNumber && (
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                              <span className="text-sm text-gray-600 font-medium">Tracking Number:</span>
                                              <span className="font-semibold text-gray-900 text-sm">{order.trackingNumber}</span>
                                            </div>
                                          )}
                                          
                                          {order.carrier && (
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                              <span className="text-sm text-gray-600 font-medium">Carrier:</span>
                                              <span className="font-semibold text-gray-900 text-sm">{order.carrier}</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {order.trackingUrl && (
                                          <motion.a
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            href={order.trackingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md font-semibold text-sm"
                                          >
                                            <FaExternalLinkAlt className="inline w-4 h-4 mr-2" />
                                            Track Package
                                          </motion.a>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <FaTruck className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h5 className="font-semibold text-gray-900 mb-2">Tracking Unavailable</h5>
                                        <p className="text-gray-600 text-sm max-w-md mx-auto">
                                          Tracking information will be available once your order has been shipped and processed by the carrier.
                                        </p>
                                      </div>
                                    )}
                                  </motion.div>
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0"
            >
              <div className="text-gray-600 text-sm">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300 shadow-xs hover:shadow-sm text-sm"
                >
                  <FaChevronLeft className="w-3 h-3" />
                </motion.button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg border transition-all duration-300 font-medium text-sm ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-sm'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs hover:shadow-sm'
                        }`}
                      >
                        {page}
                      </motion.button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 py-2 text-gray-500 font-medium text-sm">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300 shadow-xs hover:shadow-sm text-sm"
                >
                  <FaChevronRight className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrders;