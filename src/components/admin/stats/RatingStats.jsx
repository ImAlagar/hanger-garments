// components/admin/stats/RatingStats.jsx
import React from 'react';
import { Star, StarHalf, TrendingUp, Users, Package, CheckCircle, Clock } from 'lucide-react';
import StatsGrid from '../../../shared/StatsGrid';
import StatCard from '../../../shared/StatCard';

const RatingStats = ({ stats = {}, theme }) => {
  const {
    totalRatings = 0,
    approvedRatings = 0,
    pendingRatings = 0,
    averageRating = 0,
    ratingsByProduct = [],
    ratingsByUser = []
  } = stats;

  // Calculate ratings with comments (you might need to add this to your API)
  const ratingsWithComments = 0; // This would come from your API

  const ratingStatsData = [
    {
      title: "Total Ratings",
      value: totalRatings,
      change: 0,
      icon: Star,
      color: "blue",
      description: "All ratings",
      trend: "up"
    },
    {
      title: "Average Rating",
      value: averageRating?.toFixed(1) || '0.0',
      change: 0,
      icon: StarHalf,
      color: "yellow",
      description: "Overall average",
      trend: "up"
    },
    {
      title: "Approved Ratings",
      value: approvedRatings,
      change: 0,
      icon: CheckCircle,
      color: "green",
      description: "Visible to users",
      trend: "up"
    },
    {
      title: "Pending Approval",
      value: pendingRatings,
      change: 0,
      icon: Clock,
      color: "orange",
      description: "Awaiting moderation",
      trend: "up"
    }
  ];

  // Calculate rating distribution from available data
  // Since you don't have distribution in API, we'll show top products instead
  const topProducts = ratingsByProduct.slice(0, 5).map(item => ({
    productId: item.productId,
    ratingCount: item._count?.id || 0,
    averageRating: item._avg?.rating || 0
  }));

  const topUsers = ratingsByUser.slice(0, 5).map(item => ({
    userId: item.userId,
    ratingCount: item._count?.id || 0
  }));

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <StatsGrid columns={{ base: 1, sm: 2, lg: 4 }}>
        {ratingStatsData.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            index={index}
          />
        ))}
      </StatsGrid>

      {/* Detailed Statistics */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <TrendingUp className="w-5 h-5 mr-2" />
          Detailed Statistics
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div>
            <h4 className={`text-md font-medium mb-4 flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Package className="w-4 h-4 mr-2" />
              Top Rated Products
            </h4>
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div 
                    key={product.productId} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <span className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          Product {product.productId.slice(0, 8)}...
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= product.averageRating
                                    ? 'text-yellow-400 fill-current'
                                    : theme === 'dark' 
                                    ? 'text-gray-600' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {product.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {product.ratingCount} rating{product.ratingCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div className={`text-center py-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No product ratings yet
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats & Top Users */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div>
              <h4 className={`text-md font-medium mb-4 flex items-center ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Users className="w-4 h-4 mr-2" />
                User Activity
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`} />
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-green-300' : 'text-green-800'
                      }`}>
                        Approved
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-green-200' : 'text-green-700'
                    }`}>
                      {approvedRatings}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {totalRatings ? ((approvedRatings / totalRatings) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-yellow-800 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className={`w-5 h-5 mr-2 ${
                        theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                      }`} />
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                      }`}>
                        Pending
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                    }`}>
                      {pendingRatings}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    Awaiting moderation
                  </p>
                </div>
              </div>
            </div>

            {/* Most Active Users */}
            <div>
              <h4 className={`text-md font-medium mb-4 flex items-center ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Users className="w-4 h-4 mr-2" />
                Most Active Users
              </h4>
              <div className="space-y-2">
                {topUsers.length > 0 ? (
                  topUsers.map((user, index) => (
                    <div 
                      key={user.userId} 
                      className={`flex items-center justify-between p-2 rounded ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <span className={`text-xs font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          User {user.userId.slice(0, 6)}...
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {user.ratingCount} review{user.ratingCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No user ratings yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className={`mt-6 pt-6 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`}>
                {totalRatings}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Total Ratings
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-green-300' : 'text-green-600'
              }`}>
                {averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Average Rating
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`}>
                {ratingsByProduct.length}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Rated Products
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingStats;