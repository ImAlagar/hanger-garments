import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ratings: [],
  userRatings: [],
  productRatings: [],
  currentRating: null,
  loading: false,
  error: null,
  stats: null,
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    setRatings: (state, action) => {
      state.ratings = action.payload;
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
  clearError 
} = ratingSlice.actions;
export default ratingSlice.reducer;