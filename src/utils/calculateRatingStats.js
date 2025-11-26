import React from 'react'

// Add this utility function in your ProductDetailsPage or create a separate file

const calculateRatingStats = (ratings = []) => {
  if (!ratings || ratings.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: []
    };
  }

  const totalReviews = ratings.length;
  const totalRating = ratings.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = ratings.filter(review => review.rating === star).length;
    return {
      rating: star,
      count
    };
  });

  return {
    averageRating,
    totalReviews,
    ratingDistribution: distribution
  };
};

export default calculateRatingStats