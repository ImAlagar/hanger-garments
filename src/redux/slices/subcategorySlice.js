// redux/slices/subcategorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subcategories: [],
  currentSubcategory: null,
  loading: false,
  error: null,
  // ADDED: Pagination state
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  },
  filters: {
    status: 'ALL', // ALL, ACTIVE, INACTIVE
    category: 'ALL' // ALL, or specific category ID
  }
};

const subcategorySlice = createSlice({
  name: 'subcategory',
  initialState,
  reducers: {
    setSubcategories: (state, action) => {
      state.subcategories = action.payload.subcategories || action.payload;
      
      // If response includes pagination data, update it
      if (action.payload.pagination) {
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination
        };
      }
    },
    setCurrentSubcategory: (state, action) => {
      state.currentSubcategory = action.payload;
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
  setSubcategories, 
  setCurrentSubcategory, 
  setPagination,
  setFilters,
  clearError 
} = subcategorySlice.actions;
export default subcategorySlice.reducer;