import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Star,
  Calendar,
  ShoppingCart,
  Award,
  MessageSquare,
  BarChart3,
  Eye,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext';
import { useGetDashboardDataQuery } from '../../../redux/services/dashboardService';

const Dashboard = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('monthly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Theme classes
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
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  // API call with timeRange parameter
  const { 
    data: dashboardResponse, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useGetDashboardDataQuery(timeRange, {
    pollingInterval: 300000, // Auto-refresh every 5 minutes
  });

  // Extract data from API response
  const dashboardData = dashboardResponse?.data;

  // Update last updated timestamp
  useEffect(() => {
    if (dashboardData?.timestamp) {
      setLastUpdated(new Date(dashboardData.timestamp));
    }
  }, [dashboardData]);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    toast.info('Refreshing dashboard data...');
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

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

  // Stats Card Component
  const StatCard = ({ icon: Icon, value, change, label, color = "blue" }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };

    return (
      <motion.div
        variants={itemVariants}
        className={`rounded-xl bg-gradient-to-br ${colorClasses[color]} p-6 text-white shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{label}</p>
            <p className="text-2xl font-bold mt-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change !== undefined && change !== null && (
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>+{change}%</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <Icon size={24} />
          </div>
        </div>
      </motion.div>
    );
  };

  // Metric Card Component
  const MetricCard = ({ icon: Icon, value, label, subtitle, color = "gray" }) => {
    const colorClasses = {
      gray: `${currentTheme.bg.card} ${currentTheme.border}`,
      green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    };

    const iconColors = {
      gray: 'text-gray-600 dark:text-gray-400',
      green: 'text-green-600 dark:text-green-400',
      red: 'text-red-600 dark:text-red-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      blue: 'text-blue-600 dark:text-blue-400'
    };

    return (
      <motion.div
        variants={itemVariants}
        className={`rounded-lg border p-4 ${colorClasses[color]}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${currentTheme.text.secondary}`}>
              {label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${currentTheme.text.primary}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className={`text-xs mt-1 ${currentTheme.text.muted}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-full ${iconColors[color]}`}>
            <Icon size={20} />
          </div>
        </div>
      </motion.div>
    );
  };

  // Activity Item Component
  const ActivityItem = ({ activity, index }) => {
    const iconMap = {
      order: ShoppingCart,
      user: Users,
      product: Package,
      contact: MessageSquare
    };

    const colorMap = {
      order: 'text-green-500 dark:text-green-400',
      user: 'text-blue-500 dark:text-blue-400',
      product: 'text-purple-500 dark:text-purple-400',
      contact: 'text-orange-500 dark:text-orange-400'
    };

    const IconComponent = iconMap[activity.type] || MessageSquare;
    const iconColor = colorMap[activity.type] || 'text-gray-500 dark:text-gray-400';

    return (
      <div key={index} className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${iconColor} bg-opacity-20 dark:bg-opacity-10`}>
          <IconComponent size={16} />
        </div>
        <div className="flex-1">
          <p className={`font-medium ${currentTheme.text.primary}`}>
            {activity.message}
          </p>
          <p className={`text-sm ${currentTheme.text.muted}`}>
            {activity.time}
          </p>
        </div>
      </div>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${currentTheme.text.primary}`}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500 dark:text-red-400" size={24} />
          </div>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Failed to Load Dashboard</h2>
          <p className={`mb-4 ${currentTheme.text.secondary}`}>
            {error?.data?.message || 'Unable to fetch dashboard data. Please try again.'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Default data if API returns empty
  const defaultData = {
    overview: {
      totalRevenue: { value: 0, change: 0, label: 'Total Revenue' },
      totalOrders: { value: 0, change: 0, label: 'Total Orders' },
      totalProducts: { value: 0, change: 0, label: 'Active Products' },
      totalCustomers: { value: 0, change: 0, label: 'Customers' },
    },
    business: {
      activeSliders: { value: 0, label: 'Active Sliders' },
      pendingOrders: { value: 0, label: 'Pending Orders' },
      lowStockProducts: { value: 0, label: 'Low Stock' },
      pendingContacts: { value: 0, label: 'Pending Contacts' },
      conversionRate: { value: 0, change: 0, label: 'Conversion Rate' },
      averageOrderValue: { value: 0, change: 0, label: 'Avg Order Value' },
    },
    recentActivities: [],
    topProducts: [],
    quickStats: {
      wholesalers: { count: 0, pending: 0 },
      categories: { count: 0, active: 0 },
      subcategories: { count: 0, active: 0 },
      ratings: { pending: 0, total: 0 }
    }
  };

  const data = dashboardData || defaultData;

  // Show More/Less functionality for activities
  const initialActivityCount = 3;
  const activitiesToShow = showAllActivities 
    ? data.recentActivities 
    : data.recentActivities.slice(0, initialActivityCount);

  const hasMoreActivities = data.recentActivities.length > initialActivityCount;

  const toggleShowActivities = () => {
    setShowAllActivities(!showAllActivities);
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with Refresh Button */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="w-full sm:w-auto">
              <h1 className={`text-2xl sm:text-3xl font-bold font-italiana mb-1 sm:mb-2 ${currentTheme.text.primary}`}>
                Dashboard Overview
              </h1>
              <p className={`text-sm sm:text-base ${currentTheme.text.muted}`}>
                Welcome back! Here's what's happening with your store today.
                {lastUpdated && (
                  <span className="text-xs sm:text-sm ml-1 sm:ml-2">
                    (Updated: {lastUpdated.toLocaleTimeString()})
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className={`flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${
                isFetching 
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              <span className="text-sm">{isFetching ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </motion.div>


        {/* Time Range Filter */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              disabled={isFetching}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[70px] text-center ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : `${currentTheme.bg.card} ${currentTheme.text.secondary} ${currentTheme.border} border hover:bg-gray-50 dark:hover:bg-gray-700`
              } ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={DollarSign}
            value={data.overview.totalRevenue.value}
            change={data.overview.totalRevenue.change}
            label={data.overview.totalRevenue.label}
            color="green"
          />
          <StatCard
            icon={ShoppingBag}
            value={data.overview.totalOrders.value}
            change={data.overview.totalOrders.change}
            label={data.overview.totalOrders.label}
            color="blue"
          />
          <StatCard
            icon={Package}
            value={data.overview.totalProducts.value}
            change={data.overview.totalProducts.change}
            label={data.overview.totalProducts.label}
            color="purple"
          />
          <StatCard
            icon={Users}
            value={data.overview.totalCustomers.value}
            change={data.overview.totalCustomers.change}
            label={data.overview.totalCustomers.label}
            color="orange"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Business Metrics */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Business Metrics */}
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className={`text-lg sm:text-xl font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                Business Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <MetricCard icon={Eye} value={data.business.activeSliders.value} label={data.business.activeSliders.label} color="blue" />
                <MetricCard icon={ShoppingCart} value={data.business.pendingOrders.value} label={data.business.pendingOrders.label} subtitle="Need attention" color="yellow" />
                <MetricCard icon={AlertTriangle} value={data.business.lowStockProducts.value} label={data.business.lowStockProducts.label} subtitle="Restock needed" color="red" />
                <MetricCard icon={MessageSquare} value={data.business.pendingContacts.value} label={data.business.pendingContacts.label} subtitle="Awaiting response" color="yellow" />
                <MetricCard icon={TrendingUp} value={`${data.business.conversionRate.value}%`} label={data.business.conversionRate.label} subtitle={`+${data.business.conversionRate.change}%`} color="green" />
                <MetricCard icon={DollarSign} value={`₹${data.business.averageOrderValue.value}`} label={data.business.averageOrderValue.label} subtitle={`+${data.business.averageOrderValue.change}%`} color="green" />
              </div>
            </motion.div>

            {/* Top Products */}
          <motion.div variants={itemVariants} className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-4 sm:p-6`}>
            <h2 className={`text-lg sm:text-xl font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
              Top Performing Products
            </h2>
            <div className="space-y-3">
              {data.topProducts && data.topProducts.length > 0 ? (
                data.topProducts.map((product, index) => (
                  <div
                    key={product.id || index}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg ${currentTheme.bg.secondary} gap-2 sm:gap-0`}
                  >
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="truncate">
                        <p className={`font-medium ${currentTheme.text.primary} truncate`}>{product.name}</p>
                        <p className={`text-sm ${currentTheme.text.muted}`}>{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right mt-2 sm:mt-0 sm:ml-auto">
                      <p className={`font-semibold ${currentTheme.text.primary}`}>₹{product.revenue?.toLocaleString() || 0}</p>
                      <p className="text-sm text-green-500 dark:text-green-400">+{product.growth}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Package size={48} className={`mx-auto ${currentTheme.text.muted} mb-2`} />
                  <p className={currentTheme.text.muted}>No products data available</p>
                </div>
              )}
            </div>
          </motion.div>

          </div>

          {/* Right Column - Quick Stats & Activities */}
          <div className="flex flex-col gap-6">
            {/* Quick Stats */}
            <motion.div variants={itemVariants} className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                Quick Stats
              </h2>
              <div className="space-y-3">
                {Object.entries(data.quickStats).map(([key, stats]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className={currentTheme.text.secondary}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <div className="text-right">
                      <span className={`font-semibold ${currentTheme.text.primary}`}>{stats.count}</span>
                      {stats.pending > 0 && <span className="text-yellow-500 dark:text-yellow-400 text-sm ml-2">({stats.pending} pending)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div variants={itemVariants} className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                Recent Activities
              </h2>
              {data.recentActivities && data.recentActivities.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {activitiesToShow.map((activity, index) => (
                      <ActivityItem key={index} activity={activity} index={index} />
                    ))}
                  </div>
                  {hasMoreActivities && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={toggleShowActivities}
                        className="flex items-center justify-center space-x-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors mx-auto text-sm"
                      >
                        <span className="font-medium">{showAllActivities ? 'Show Less' : 'Show More'}</span>
                        {showAllActivities ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare size={48} className={`mx-auto ${currentTheme.text.muted} mb-2`} />
                  <p className={currentTheme.text.muted}>No recent activities</p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-semibold font-instrument mb-4 ${currentTheme.text.primary}`}>
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  className="p-3 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                  onClick={() => window.location.href = '/dashboard/products/add'}
                >
                  Add Product
                </button>
                <button 
                  className="p-3 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                  onClick={() => window.location.href = '/dashboard/orders'}
                >
                  View Orders
                </button>
                <button 
                  className="p-3 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors"
                  onClick={() => window.location.href = '/dashboard/categories'}
                >
                  Manage Categories
                </button>
                <button 
                  className="p-3 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
                  onClick={() => window.location.href = '/dashboard/analytics'}
                >
                  View Analytics
                </button>
              </div>
            </motion.div>
          </div>
        </div>


        {/* Data Status Footer */}
        <motion.div variants={itemVariants} className="text-center">
          <p className={`text-sm ${currentTheme.text.muted}`}>
            {isFetching ? 'Updating data...' : 'Data loaded successfully'}
            {lastUpdated && ` • Last updated: ${lastUpdated.toLocaleString()}`}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Dashboard;