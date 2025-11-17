import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Star,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const WholesalerDashboard = () => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  // Mock data - replace with actual API calls
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 1247,
    pendingOrders: 23,
    completedOrders: 1150,
    totalRevenue: 1258475,
    monthlyRevenue: 284750,
    wholesaleProducts: 156,
    topProducts: [
      { id: 1, name: 'Classic T-Shirt', sales: 450, growth: 12 },
      { id: 2, name: 'Denim Jacket', sales: 320, growth: 8 },
      { id: 3, name: 'Sports Hoodie', sales: 280, growth: 15 },
    ],
    recentOrders: [
      { id: 'ORD-001', product: 'Classic T-Shirt', quantity: 50, amount: 12500, status: 'Delivered', date: '2024-01-15' },
      { id: 'ORD-002', product: 'Denim Jacket', quantity: 25, amount: 8750, status: 'Processing', date: '2024-01-14' },
      { id: 'ORD-003', product: 'Sports Hoodie', quantity: 30, amount: 10500, status: 'Shipped', date: '2024-01-13' },
    ]
  });

  const statsCards = [
    {
      title: 'Total Orders',
      value: dashboardStats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Pending Orders',
      value: dashboardStats.pendingOrders,
      icon: Package,
      color: 'orange',
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Total Revenue',
      value: `₹${(dashboardStats.totalRevenue / 100000).toFixed(2)}L`,
      icon: DollarSign,
      color: 'green',
      change: '+18%',
      trend: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(dashboardStats.monthlyRevenue / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'purple',
      change: '+8%',
      trend: 'up'
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <ArrowUp className="w-4 h-4 text-green-500" /> : 
      <ArrowDown className="w-4 h-4 text-red-500" />;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className={`min-h-screen p-6 ${bgColor} transition-colors duration-500`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${textColor}`}>
          Welcome back, {user?.name || 'Wholesaler'}!
        </h1>
        <p className={`${subText} mt-2`}>
          Here's your wholesale business overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`${cardBg} rounded-xl p-6 shadow-lg border ${borderColor} transition-all duration-300 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${subText} text-sm font-medium`}>{stat.title}</p>
                <p className={`${textColor} text-2xl font-bold mt-2`}>{stat.value}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(stat.trend)}
                  <span className={`text-sm ml-1 ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                  <span className={`${subText} text-sm ml-2`}>from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${getColorClasses(stat.color)} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${getColorClasses(stat.color).replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className={`${cardBg} rounded-xl p-6 shadow-lg border ${borderColor}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${textColor}`}>Top Selling Products</h2>
            <TrendingUp className={`w-5 h-5 ${subText}`} />
          </div>
          <div className="space-y-4">
            {dashboardStats.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium ${textColor}`}>{product.name}</p>
                    <p className={`text-sm ${subText}`}>{product.sales} units sold</p>
                  </div>
                </div>
                <div className={`flex items-center ${product.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {product.growth > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="ml-1 text-sm font-medium">{Math.abs(product.growth)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className={`${cardBg} rounded-xl p-6 shadow-lg border ${borderColor}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${textColor}`}>Recent Orders</h2>
            <Calendar className={`w-5 h-5 ${subText}`} />
          </div>
          <div className="space-y-4">
            {dashboardStats.recentOrders.map((order) => (
              <div key={order.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className={`font-semibold ${textColor}`}>{order.id}</p>
                    <p className={`text-sm ${subText}`}>{order.product}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={subText}>Qty: {order.quantity}</span>
                  <span className={`font-semibold ${textColor}`}>₹{order.amount.toLocaleString()}</span>
                  <span className={subText}>{new Date(order.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${cardBg} rounded-xl p-6 shadow-lg border ${borderColor} mt-6`}>
        <h2 className={`text-xl font-semibold ${textColor} mb-4`}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className={`p-4 rounded-lg border ${borderColor} hover:shadow-md transition-all text-left group hover:scale-105`}>
            <Package className="w-6 h-6 text-blue-500 mb-2" />
            <p className={`font-medium ${textColor}`}>Place Order</p>
            <p className={`text-sm ${subText}`}>Bulk purchase</p>
          </button>
          
          <button className={`p-4 rounded-lg border ${borderColor} hover:shadow-md transition-all text-left group hover:scale-105`}>
            <ShoppingCart className="w-6 h-6 text-green-500 mb-2" />
            <p className={`font-medium ${textColor}`}>View Catalog</p>
            <p className={`text-sm ${subText}`}>All products</p>
          </button>
          
          <button className={`p-4 rounded-lg border ${borderColor} hover:shadow-md transition-all text-left group hover:scale-105`}>
            <DollarSign className="w-6 h-6 text-purple-500 mb-2" />
            <p className={`font-medium ${textColor}`}>Price List</p>
            <p className={`text-sm ${subText}`}>Wholesale rates</p>
          </button>
          
          <button className={`p-4 rounded-lg border ${borderColor} hover:shadow-md transition-all text-left group hover:scale-105`}>
            <Users className="w-6 h-6 text-orange-500 mb-2" />
            <p className={`font-medium ${textColor}`}>Support</p>
            <p className={`text-sm ${subText}`}>Get help</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WholesalerDashboard;