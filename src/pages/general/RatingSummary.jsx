// components/Product/RatingSummary.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import RatingDisplay from './RatingDisplay';

const RatingSummary = ({ ratingStats = {}, onFilterChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { 
    averageRating = 0, 
    totalReviews = 0, 
    ratingDistribution = [] 
  } = ratingStats;

  const handleRatingFilter = (rating) => {
    if (onFilterChange) {
      onFilterChange(rating);
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Customer Reviews
      </h3>

      {/* Overall Rating */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold mb-2">{(averageRating || 0).toFixed(1)}</div>
        <RatingDisplay 
          averageRating={averageRating} 
          totalReviews={totalReviews} 
          size="large" 
        />
      </div>

      {/* Rating Distribution */}
      {totalReviews > 0 ? (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const distribution = ratingDistribution.find(d => d.rating === star) || { count: 0 };
            const percentage = totalReviews > 0 ? (distribution.count / totalReviews) * 100 : 0;
            
            return (
              <button
                key={star}
                onClick={() => handleRatingFilter(star)}
                className={`flex items-center space-x-2 w-full p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <span className="w-8 text-sm">{star} star</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-12 text-xs text-right">
                  {distribution.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            No reviews yet
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  );
};

export default RatingSummary;