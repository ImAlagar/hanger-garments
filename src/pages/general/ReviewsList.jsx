// components/Product/ReviewsList.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import RatingDisplay from './RatingDisplay';

const ReviewsList = ({ reviews = [], currentUser }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        No reviews found. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div 
          key={review.id || review._id} 
          className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {/* Review Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {review.isAnonymous ? 'Anonymous' : review.userName || review.user?.name || 'User'}
                </span>
                {currentUser && (review.userId === currentUser.id || review.user?._id === currentUser.id) && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    You
                  </span>
                )}
              </div>
              <RatingDisplay averageRating={review.rating} size="small" />
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatDate(review.createdAt)}
            </span>
          </div>

          {/* Review Title */}
          {review.title && (
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {review.title}
            </h4>
          )}

          {/* Review Content */}
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
            {review.review || review.comment}
          </p>

          {/* Admin Badge if approved */}
          {review.isApproved && (
            <div className="mt-2 flex items-center space-x-1">
              <span className="text-green-500">✓</span>
              <span className="text-xs text-green-600 dark:text-green-400">
                Verified Review
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;