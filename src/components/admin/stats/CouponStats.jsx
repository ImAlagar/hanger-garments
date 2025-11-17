// components/admin/stats/CouponStats.jsx
import React from 'react';
import { Tag, CheckCircle, Clock, XCircle, TrendingUp, Users, DollarSign, Percent } from 'lucide-react';
import StatsGrid from '../../../shared/StatsGrid';
import StatCard from '../../../shared/StatCard';

const CouponStats = ({ stats = {} }) => {
  const {
    totalCoupons = 0,
    activeCoupons = 0,
    expiredCoupons = 0,
    inactiveCoupons = 0,
    totalUsage = 0,
    totalDiscounts = 0,
    couponsByType = {}
  } = stats;

  const couponStatsData = [
    {
      title: "Total Coupons",
      value: totalCoupons,
      change: 12,
      icon: Tag,
      color: "blue",
      description: "All coupons created",
      trend: "up"
    },
    {
      title: "Active Coupons",
      value: activeCoupons,
      change: 8,
      icon: CheckCircle,
      color: "green",
      description: "Currently valid",
      trend: "up"
    },
    {
      title: "Total Usage",
      value: totalUsage.toLocaleString(),
      change: 25,
      icon: Users,
      color: "purple",
      description: "Times used",
      trend: "up"
    },
    {
      title: "Total Discounts",
      value: `₹${totalDiscounts?.toLocaleString() || 0}`,
      change: 18,
      icon: DollarSign,
      color: "orange",
      description: "Amount saved by customers",
      trend: "up"
    },
    {
      title: "Expired Coupons",
      value: expiredCoupons,
      change: -5,
      icon: XCircle,
      color: "red",
      description: "No longer valid",
      trend: "down"
    },
    {
      title: "Inactive Coupons",
      value: inactiveCoupons,
      change: 2,
      icon: Clock,
      color: "gray",
      description: "Manually disabled",
      trend: "neutral"
    }
  ];

  // Additional stats for discount types
  const discountTypeStats = [
    {
      title: "Percentage Coupons",
      value: couponsByType.percentage || 0,
      icon: Percent,
      color: "green",
      description: "Discount by percentage"
    },
    {
      title: "Fixed Amount Coupons",
      value: couponsByType.fixed || 0,
      icon: DollarSign,
      color: "blue",
      description: "Fixed discount amount"
    }
  ];

  return (
    <div className="space-y-6">
      <StatsGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
        {couponStatsData.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            index={index}
          />
        ))}
      </StatsGrid>

      {/* Discount Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discountTypeStats.map((stat, index) => (
          <div
            key={stat.title}
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Summary */}
      {(stats.topUsedCoupons || stats.recentCoupons) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Used Coupons */}
          {stats.topUsedCoupons && stats.topUsedCoupons.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Top Used Coupons
              </h3>
              <div className="space-y-3">
                {stats.topUsedCoupons.map((coupon, index) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                        {index + 1}
                      </span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {coupon.code}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {coupon.usedCount} uses
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ₹{coupon.totalDiscounts?.toLocaleString() || 0} saved
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Coupons */}
          {stats.recentCoupons && stats.recentCoupons.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Coupons
              </h3>
              <div className="space-y-3">
                {stats.recentCoupons.map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-3">
                      <span className={`w-2 h-2 rounded-full ${
                        coupon.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {coupon.code}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(coupon.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponStats;