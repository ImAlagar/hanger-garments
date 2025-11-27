// components/Product/ReviewForm.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useCreateRatingMutation } from '../../redux/services/ratingService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const user = useSelector((state) => state.auth.user);
  
  const [createRating, { isLoading }] = useCreateRatingMutation();
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review: '', // Changed from 'comment' to 'review'
    isAnonymous: false
  });
  
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rating) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.review.trim()) { // Changed from formData.comment
      toast.error('Please write a review');
      return;
    }

    try {
      await createRating({
        productId,
        rating: formData.rating,
        title: formData.title,
        review: formData.review, // Changed from comment to review
        isAnonymous: formData.isAnonymous
      }).unwrap();

      // Reset form
      setFormData({
        rating: 0,
        title: '',
        review: '', // Changed from comment
        isAnonymous: false
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      toast.success('Review submitted successfully!');

    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error?.data?.message || 'Failed to submit review');
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 ${
                star <= (hoverRating || formData.rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Please <Link to={'/login'} className="text-blue-600 hover:underline">login</Link> to write a review
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Write a Review
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Your Rating *
          </label>
          {renderStarRating()}
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="title" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Review Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Summarize your experience"
            maxLength={100}
          />
        </div>

        {/* Review Content */}
        <div>
          <label htmlFor="review" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Your Review *
          </label>
          <textarea
            id="review" // Changed from comment to review
            name="review" // Changed from comment to review
            value={formData.review} // Changed from comment to review
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Share your experience with this product..."
            required
          />
        </div>

        {/* Anonymous Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAnonymous"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="isAnonymous" className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Post anonymously
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.rating || !formData.review.trim()} // Changed from comment to review
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            isLoading || !formData.rating || !formData.review.trim() // Changed from comment to review
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;