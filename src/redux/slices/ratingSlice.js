// redux/slices/ratingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ratings: [],
  userRatings: [],
  productRatings: [],
  currentRating: null,
  loading: false,
  error: null,
  stats: null,
  // ADDED: Pagination state
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  },
  filters: {
    status: 'ALL', // ALL, APPROVED, PENDING
    rating: 'ALL' // ALL, 1, 2, 3, 4, 5
  }
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    setRatings: (state, action) => {
      state.ratings = action.payload.ratings || action.payload;
      
      // If response includes pagination data, update it
      if (action.payload.pagination) {
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination
        };
      }
    },
    setUserRatings: (state, action) => {
      state.userRatings = action.payload;
    },
    setProductRatings: (state, action) => {
      state.productRatings = action.payload;
    },
    setCurrentRating: (state, action) => {
      state.currentRating = action.payload;
    },
    // ADDED: Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // ADDED: Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setRatings, 
  setUserRatings, 
  setProductRatings, 
  setCurrentRating, 
  setPagination,
  setFilters,
  clearError 
} = ratingSlice.actions;
export default ratingSlice.reducer;