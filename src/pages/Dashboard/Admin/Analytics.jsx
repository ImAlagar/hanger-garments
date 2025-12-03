import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  Download,
  BarChart3,
  Eye,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../../../context/ThemeContext";
import {
  useGetAnalyticsDataQuery,
  useGetAnalyticsOverviewQuery,
  useGetRevenueAnalyticsQuery,
  useGetTrafficAnalyticsQuery,
  useGetProductAnalyticsQuery,
  useGetGeographicAnalyticsQuery,
  useExportAnalyticsDataMutation,
} from "../../../redux/services/analyticsService";

const Analytics = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("monthly");
  const [activeTab, setActiveTab] = useState("overview");

  // API calls
  const {
    data: analyticsDataResponse,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
    error: analyticsError,
  } = useGetAnalyticsDataQuery(timeRange);

  const { data: overviewResponse, isLoading: overviewLoading } =
    useGetAnalyticsOverviewQuery(timeRange);

  const { data: revenueResponse, isLoading: revenueLoading } =
    useGetRevenueAnalyticsQuery(timeRange);

  const { data: trafficResponse, isLoading: trafficLoading } =
    useGetTrafficAnalyticsQuery(timeRange);

  const { data: productResponse, isLoading: productLoading } =
    useGetProductAnalyticsQuery({ timeRange, limit: 5 });

  const { data: geographicResponse, isLoading: geographicLoading } =
    useGetGeographicAnalyticsQuery(timeRange);

  const [exportAnalyticsData, { isLoading: exportLoading }] =
    useExportAnalyticsDataMutation();

  // Extract data from API responses
  const analyticsData = analyticsDataResponse?.data;
  const overviewData = overviewResponse?.data;
  const revenueData = revenueResponse?.data;
  const trafficData = trafficResponse?.data;
  const productData = productResponse?.data;
  const geographicData = geographicResponse?.data;

  // Theme classes
  const themeClasses = {
    light: {
      bg: {
        primary: "bg-white",
        secondary: "bg-gray-50",
        card: "bg-white",
      },
      text: {
        primary: "text-gray-900",
        secondary: "text-gray-700",
        muted: "text-gray-600",
      },
      border: "border-gray-200",
    },
    dark: {
      bg: {
        primary: "bg-gray-900",
        secondary: "bg-gray-800",
        card: "bg-gray-800",
      },
      text: {
        primary: "text-white",
        secondary: "text-gray-200",
        muted: "text-gray-400",
      },
      border: "border-gray-700",
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  // Add this helper function after imports but before component
  // Helper function to format numbers with max 2 decimal places
  const formatNumber = (value, options = {}) => {
    if (value === null || value === undefined || value === "N/A") return "N/A";

    const {
      isCurrency = false,
      decimalPlaces = 2,
      showSign = false,
      isPercentage = false,
    } = options;

    // Convert to number if it's a string
    const num = typeof value === "string" ? parseFloat(value) : value;

    // Check if it's a valid number
    if (isNaN(num)) return "N/A";

    if (isCurrency) {
      // For currency values
      const formatted = new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: 0,
      }).format(num);

      return showSign ? `₹${formatted}` : formatted;
    } else if (isPercentage) {
      // For percentage values
      const formatted = new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: 0,
      }).format(num);

      return showSign ? `${formatted}%` : formatted;
    } else {
      // For regular numbers
      return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: 0,
      }).format(num);
    }
  };
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Loading state
  const isLoading =
    analyticsLoading ||
    overviewLoading ||
    revenueLoading ||
    trafficLoading ||
    productLoading ||
    geographicLoading;

  // Error handling
  useEffect(() => {
    if (analyticsError) {
      toast.error("Failed to load analytics data");
    }
  }, [analyticsError]);

  // Handle data refresh
  const handleRefresh = () => {
    refetchAnalytics();
    toast.success("Analytics data refreshed!");
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportAnalyticsData({ timeRange, format: "csv" }).unwrap();
      toast.success("Analytics data exported successfully!");
    } catch (error) {
      toast.error("Failed to export analytics data");
    }
  };

  // Stats Card Component
  const StatCard = ({
    icon: Icon,
    value,
    change,
    label,
    subtitle,
    color = "blue",
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
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
              {value !== undefined && value !== null
                ? typeof value === "number"
                  ? value.toLocaleString()
                  : value
                : "N/A"}
            </p>
            {change !== undefined && change !== null && (
              <div className="flex items-center mt-2 text-sm">
                {change > 0 ? (
                  <ArrowUp size={16} className="mr-1" />
                ) : (
                  <ArrowDown size={16} className="mr-1" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
            {subtitle && <p className="text-xs opacity-80 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <Icon size={24} />
          </div>
        </div>
      </motion.div>
    );
  };

  // Metric Card Component
  const MetricCard = ({ title, value, change, trend = "up" }) => {
    const isCurrencyValue =
      title.toLowerCase().includes("revenue") ||
      title.toLowerCase().includes("value");
    const isPercentageValue =
      title.toLowerCase().includes("rate") ||
      (typeof value === "string" && value.includes("%"));

    return (
      <motion.div
        variants={itemVariants}
        className={`rounded-lg border p-4 ${currentTheme.bg.card} ${currentTheme.border}`}
      >
        <p className={`text-sm font-medium ${currentTheme.text.secondary}`}>
          {title}
        </p>
        <div className="flex items-end justify-between mt-2">
          <p className={`text-2xl font-bold ${currentTheme.text.primary}`}>
            {value !== undefined && value !== null
              ? isCurrencyValue
                ? `₹${formatNumber(value)}`
                : isPercentageValue
                ? `${formatNumber(value, { decimalPlaces: 1 })}`
                : formatNumber(value)
              : "N/A"}
          </p>
          {change !== undefined && change !== null && (
            <div
              className={`flex items-center text-sm ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend === "up" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span>{formatNumber(change, { decimalPlaces: 1 })}%</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Simple Bar Chart Component
  const BarChart = ({ data, labels, height = 200, color = "bg-blue-500" }) => {
    if (!data || data.length === 0) {
      return (
        <div
          className="flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <p className={currentTheme.text.muted}>No data available</p>
        </div>
      );
    }

    const maxValue = Math.max(...data);

    return (
      <div
        className="flex items-end justify-between space-x-1"
        style={{ height: `${height}px` }}
      >
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`${color} rounded-t transition-all duration-500 ease-in-out`}
              style={{
                height: `${(value / maxValue) * 80}%`,
                width: "80%",
              }}
            />
            <span className={`text-xs mt-2 ${currentTheme.text.muted}`}>
              {labels[index]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Simple Pie Chart Component
  const PieChartLegend = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className={currentTheme.text.muted}>No data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className={`text-sm ${currentTheme.text.secondary}`}>
                {item.name}
              </span>
            </div>
            <span
              className={`text-sm font-medium ${currentTheme.text.primary}`}
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${currentTheme.text.primary}`}>
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            {/* Title */}
            <div className="w-full sm:w-auto">
              <h1
                className={`text-xl sm:text-3xl font-bold font-italiana mb-1 sm:mb-2 ${currentTheme.text.primary}`}
              >
                Analytics Dashboard
              </h1>
              <p
                className={`text-sm sm:text-base ${currentTheme.text.muted} line-clamp-2`}
              >
                Comprehensive insights into your store performance and customer
                behavior
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3 mt-2 sm:mt-0">
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} ${currentTheme.text.secondary} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 w-full sm:w-auto`}
              >
                <Download size={16} />
                <span>{exportLoading ? "Exporting..." : "Export"}</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 w-full sm:w-auto`}
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Time Range Filter */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            {/* Time Range Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {["daily", "weekly", "monthly", "yearly"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors text-center ${
                    timeRange === range
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            {/* Date Info */}
            <div className="flex items-center gap-1 sm:gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
              <Calendar size={16} />
              <span>Last 30 days</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 min-w-max">
              {[
                { id: "overview", name: "Overview", icon: BarChart3 },
                { id: "revenue", name: "Revenue", icon: DollarSign },
                { id: "traffic", name: "Traffic", icon: Users },
                { id: "products", name: "Products", icon: Package },
                { id: "geographic", name: "Geographic", icon: Eye },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-3 px-2 sm:px-1 border-b-2 font-medium text-sm sm:text-base min-w-max ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === "overview" &&
          (overviewData || analyticsData?.overview) && (
            <motion.div variants={containerVariants} className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  value={
                    overviewData?.totalVisitors?.value ||
                    analyticsData?.overview?.totalVisitors?.value
                  }
                  change={parseFloat(
                    overviewData?.totalVisitors?.change ||
                      analyticsData?.overview?.totalVisitors?.change
                  )}
                  label="Total Visitors"
                  color="blue"
                />
                <StatCard
                  icon={ShoppingBag}
                  value={
                    overviewData?.totalOrders?.value ||
                    analyticsData?.overview?.totalOrders?.value
                  }
                  change={parseFloat(
                    overviewData?.totalOrders?.change ||
                      analyticsData?.overview?.totalOrders?.change
                  )}
                  label="Total Orders"
                  color="green"
                />
                <StatCard
                  icon={TrendingUp}
                  value={formatNumber(
                    overviewData?.conversionRate?.value ||
                      analyticsData?.overview?.conversionRate?.value ||
                      0,
                    {
                      isPercentage: true,
                      decimalPlaces: 1,
                    }
                  )}
                  change={parseFloat(
                    overviewData?.conversionRate?.change ||
                      analyticsData?.overview?.conversionRate?.change ||
                      0
                  )}
                  label="Conversion Rate"
                  color="purple"
                />
                <StatCard
                  icon={DollarSign}
                  value={formatNumber(
                    overviewData?.averageOrderValue?.value ||
                      analyticsData?.overview?.averageOrderValue?.value ||
                      0
                  )}
                  change={parseFloat(
                    overviewData?.averageOrderValue?.change ||
                      analyticsData?.overview?.averageOrderValue?.change ||
                      0
                  )}
                  label="Avg Order Value"
                  color="orange"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <motion.div
                  variants={itemVariants}
                  className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                  >
                    Revenue Trend
                  </h3>
                  <BarChart
                    data={
                      revenueData?.chart?.data ||
                      analyticsData?.revenue?.chart?.data ||
                      []
                    }
                    labels={
                      revenueData?.chart?.labels ||
                      analyticsData?.revenue?.chart?.labels ||
                      []
                    }
                    color="bg-green-500"
                  />
                </motion.div>

                {/* Traffic Sources */}
                <motion.div
                  variants={itemVariants}
                  className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                  >
                    Traffic Sources
                  </h3>
                  <PieChartLegend
                    data={
                      trafficData?.sources ||
                      analyticsData?.traffic?.sources ||
                      []
                    }
                  />
                </motion.div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Bounce Rate"
                  value={`${
                    overviewData?.bounceRate?.value ||
                    analyticsData?.overview?.bounceRate?.value
                  }%`}
                  change={parseFloat(
                    overviewData?.bounceRate?.change ||
                      analyticsData?.overview?.bounceRate?.change
                  )}
                  trend={
                    parseFloat(
                      overviewData?.bounceRate?.change ||
                        analyticsData?.overview?.bounceRate?.change
                    ) > 0
                      ? "down"
                      : "up"
                  }
                />
                <MetricCard
                  title="Session Duration"
                  value={
                    overviewData?.sessionDuration?.value ||
                    analyticsData?.overview?.sessionDuration?.value
                  }
                  change={parseFloat(
                    overviewData?.sessionDuration?.change ||
                      analyticsData?.overview?.sessionDuration?.change
                  )}
                  trend="up"
                />
                <MetricCard
                  title="Pages per Session"
                  value="4.2"
                  change={3.1}
                  trend="up"
                />
              </div>
            </motion.div>
          )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (revenueData || analyticsData?.revenue) && (
          <motion.div variants={containerVariants} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                variants={itemVariants}
                className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                >
                  Revenue Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={currentTheme.text.secondary}>
                      Current Period
                    </span>
                    <span
                      className={`text-xl font-bold ${currentTheme.text.primary}`}
                    >
                      ₹
                      {(
                        revenueData?.current || analyticsData?.revenue?.current
                      )?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={currentTheme.text.secondary}>
                      Previous Period
                    </span>
                    <span className={currentTheme.text.primary}>
                      ₹
                      {(
                        revenueData?.previous ||
                        analyticsData?.revenue?.previous
                      )?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={currentTheme.text.secondary}>Growth</span>
                    <span
                      className={`font-semibold ${
                        (revenueData?.growth ||
                          analyticsData?.revenue?.growth) > 0
                          ? "text-green-500"
                          : (revenueData?.growth ||
                              analyticsData?.revenue?.growth) < 0
                          ? "text-red-500"
                          : currentTheme.text.primary
                      }`}
                    >
                      {revenueData?.growth !== undefined &&
                      revenueData?.growth !== null
                        ? `${revenueData.growth > 0 ? "+" : ""}${
                            revenueData.growth
                          }%`
                        : analyticsData?.revenue?.growth !== undefined
                        ? `${analyticsData.revenue.growth > 0 ? "+" : ""}${
                            analyticsData.revenue.growth
                          }%`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                >
                  Revenue Chart
                </h3>
                <BarChart
                  data={
                    revenueData?.chart?.data ||
                    analyticsData?.revenue?.chart?.data ||
                    []
                  }
                  labels={
                    revenueData?.chart?.labels ||
                    analyticsData?.revenue?.chart?.labels ||
                    []
                  }
                  color="bg-blue-500"
                  height={150}
                />
              </motion.div>
            </div>

            {/* Additional Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Total Revenue"
                value={formatNumber(
                  revenueData?.current || analyticsData?.revenue?.current || 0
                )}
                change={
                  revenueData?.growth || analyticsData?.revenue?.growth || 0
                }
                trend={
                  (revenueData?.growth || analyticsData?.revenue?.growth || 0) >
                  0
                    ? "up"
                    : "down"
                }
              />
              <MetricCard
                title="Average Order Value"
                value={formatNumber(
                  overviewData?.averageOrderValue?.value ||
                    analyticsData?.overview?.averageOrderValue?.value ||
                    0
                )}
                change={
                  overviewData?.averageOrderValue?.change ||
                  analyticsData?.overview?.averageOrderValue?.change ||
                  0
                }
                trend={
                  (overviewData?.averageOrderValue?.change ||
                    analyticsData?.overview?.averageOrderValue?.change ||
                    0) > 0
                    ? "up"
                    : "down"
                }
              />
              <MetricCard
                title="Revenue per Visitor"
                value={formatNumber(
                  (revenueData?.current ||
                    analyticsData?.revenue?.current ||
                    0) &&
                    (overviewData?.totalVisitors?.value ||
                      analyticsData?.overview?.totalVisitors?.value ||
                      0)
                    ? (revenueData?.current ||
                        analyticsData?.revenue?.current) /
                        (overviewData?.totalVisitors?.value ||
                          analyticsData?.overview?.totalVisitors?.value)
                    : 0
                )}
              />
            </div>
          </motion.div>
        )}

        {/* Traffic Tab */}
        {activeTab === "traffic" && (trafficData || analyticsData?.traffic) && (
          <motion.div variants={containerVariants} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                variants={itemVariants}
                className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                >
                  Daily Traffic
                </h3>
                <BarChart
                  data={
                    trafficData?.chart?.data ||
                    analyticsData?.traffic?.chart?.data ||
                    []
                  }
                  labels={
                    trafficData?.chart?.labels ||
                    analyticsData?.traffic?.chart?.labels ||
                    []
                  }
                  color="bg-purple-500"
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                >
                  Traffic Sources
                </h3>
                <PieChartLegend
                  data={
                    trafficData?.sources ||
                    analyticsData?.traffic?.sources ||
                    []
                  }
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === "products" &&
          (productData || analyticsData?.products) && (
            <motion.div variants={containerVariants} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  variants={itemVariants}
                  className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                  >
                    Top Performing Products
                  </h3>
                  <div className="space-y-4">
                    {(
                      productData?.topPerforming ||
                      analyticsData?.products?.topPerforming ||
                      []
                    )?.map((product, index) => (
                      <div
                        key={product.id || index}
                        className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div>
                          <p
                            className={`font-medium ${currentTheme.text.primary}`}
                          >
                            {product.name}
                          </p>
                          <p className={`text-sm ${currentTheme.text.muted}`}>
                            {product.views} views
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${currentTheme.text.primary}`}
                          >
                            {product.orders} orders
                          </p>
                          <p className="text-sm text-green-500">
                            {product.conversion}% conversion
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                  >
                    Sales by Category
                  </h3>
                  <div className="space-y-4">
                    {(
                      productData?.categories ||
                      analyticsData?.products?.categories ||
                      []
                    )?.map((category, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className={currentTheme.text.secondary}>
                          {category.name}
                        </span>
                        <div className="text-right">
                          <span
                            className={`font-semibold ${currentTheme.text.primary}`}
                          >
                            {category.sales} sales
                          </span>
                          <span
                            className={`text-sm block ${currentTheme.text.muted}`}
                          >
                            ₹
                            {category.revenue
                              ? category.revenue.toLocaleString()
                              : "0"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(productData?.categories?.length === 0 ||
                      analyticsData?.products?.categories?.length === 0) && (
                      <p className={`text-center ${currentTheme.text.muted}`}>
                        No category data available
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

        {/* Geographic Tab */}
        {activeTab === "geographic" &&
          (geographicData || analyticsData?.geographic) && (
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div
                variants={itemVariants}
                className={`rounded-lg border ${currentTheme.border} ${currentTheme.bg.card} p-6`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}
                >
                  Geographic Distribution
                </h3>
                <div className="space-y-4">
                  {(
                    geographicData?.regions ||
                    analyticsData?.geographic?.regions ||
                    []
                  )?.map((region, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div>
                        <p
                          className={`font-medium ${currentTheme.text.primary}`}
                        >
                          {region.name}
                        </p>
                        <p className="text-sm text-green-500">
                          {region.visitors > 0
                            ? formatNumber(
                                (region.orders / region.visitors) * 100,
                                {
                                  decimalPlaces: 1,
                                  isPercentage: true,
                                }
                              )
                            : "0%"}{" "}
                          conversion
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${currentTheme.text.primary}`}
                        >
                          {region.orders} orders
                        </p>
                        <p className="text-sm text-green-500">
                          {region.visitors > 0
                            ? ((region.orders / region.visitors) * 100).toFixed(
                                1
                              )
                            : "0"}
                          % conversion
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

        {/* No Data State */}
        {!analyticsData &&
          !overviewData &&
          !revenueData &&
          !trafficData &&
          !productData &&
          !geographicData &&
          !isLoading && (
            <motion.div variants={itemVariants} className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <BarChart3 size={64} className="mx-auto" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${currentTheme.text.primary}`}
              >
                No Analytics Data Available
              </h3>
              <p className={currentTheme.text.muted}>
                Start getting insights by enabling analytics tracking for your
                store.
              </p>
            </motion.div>
          )}
      </div>
    </motion.section>
  );
};

export default Analytics;
