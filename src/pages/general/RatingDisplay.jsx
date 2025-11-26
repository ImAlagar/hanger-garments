// components/Product/RatingDisplay.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const RatingDisplay = ({ 
  averageRating = 0, 
  totalReviews = 0, 
  ratingDistribution = [],
  showDistribution = false,
  size = 'medium'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const starSize = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const renderStars = (rating = 0, size = 'medium') => {
    // Ensure rating is a valid number between 0-5
    const validRating = Math.max(0, Math.min(5, Number(rating) || 0));
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex items-center space-x-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <svg
            key={`full-${i}`}
            className={`${starSize[size]} text-yellow-400 fill-current`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <svg
            className={`${starSize[size]} text-yellow-400 fill-current`}
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id="half-star">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#half-star)" 
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
            />
          </svg>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <svg
            key={`empty-${i}`}
            className={`${starSize[size]} text-yellow-400 fill-current`}
            viewBox="0 0 20 20"
          >
            <path 
              fill="transparent"
              stroke="currentColor"
              strokeWidth="1"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} ${sizeClasses[size]}`}>
      <div className="flex items-center space-x-2">
        {renderStars(averageRating, size)}
        <span className="font-semibold">{(averageRating || 0).toFixed(1)}</span>
        {totalReviews > 0 && (
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        )}
        {totalReviews === 0 && (
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            No reviews yet
          </span>
        )}
      </div>

      {showDistribution && ratingDistribution.length > 0 && (
        <div className="mt-2 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const distribution = ratingDistribution.find(d => d.rating === star) || { count: 0 };
            const percentage = totalReviews > 0 ? (distribution.count / totalReviews) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center space-x-2">
                <span className="w-8 text-sm">{star} star</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-xs text-right">
                  {distribution.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;