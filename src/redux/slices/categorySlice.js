// redux/slices/categorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  currentCategory: null,
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
    status: 'ALL' // ALL, ACTIVE, INACTIVE
  }
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    // Start loading
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Set all categories
    setCategories: (state, action) => {
      state.categories = action.payload.categories || action.payload;
      state.loading = false;
      state.error = null;
      
      // If response includes pagination data, update it
      if (action.payload.pagination) {
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination
        };
      }
    },

    // Set current category
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add new category
    addCategory: (state, action) => {
      state.categories.push(action.payload);
      state.loading = false;
      state.error = null;
    },

    // Update category
    updateCategory: (state, action) => {
      const updatedCategory = action.payload;
      const index = state.categories.findIndex(cat => cat._id === updatedCategory._id);
      if (index !== -1) {
        state.categories[index] = updatedCategory;
      }
      if (state.currentCategory && state.currentCategory._id === updatedCategory._id) {
        state.currentCategory = updatedCategory;
      }
      state.loading = false;
      state.error = null;
    },

    // Delete category
    deleteCategory: (state, action) => {
      const categoryId = action.payload;
      state.categories = state.categories.filter(cat => cat._id !== categoryId);
      if (state.currentCategory && state.currentCategory._id === categoryId) {
        state.currentCategory = null;
      }
      state.loading = false;
      state.error = null;
    },

    // Toggle category status
    toggleCategoryStatus: (state, action) => {
      const { categoryId, status } = action.payload;
      const category = state.categories.find(cat => cat._id === categoryId);
      if (category) {
        category.status = status;
        category.isActive = status === 'active';
      }
      if (state.currentCategory && state.currentCategory._id === categoryId) {
        state.currentCategory.status = status;
        state.currentCategory.isActive = status === 'active';
      }
    },

    // Set category stats
    setCategoryStats: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Update category image
    updateCategoryImage: (state, action) => {
      const { categoryId, imageUrl } = action.payload;
      const category = state.categories.find(cat => cat._id === categoryId);
      if (category) {
        category.image = imageUrl;
      }
      if (state.currentCategory && state.currentCategory._id === categoryId) {
        state.currentCategory.image = imageUrl;
      }
    },

    // Remove category image
    removeCategoryImage: (state, action) => {
      const categoryId = action.payload;
      const category = state.categories.find(cat => cat._id === categoryId);
      if (category) {
        category.image = null;
      }
      if (state.currentCategory && state.currentCategory._id === categoryId) {
        state.currentCategory.image = null;
      }
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

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear current category
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },

    // Reset state
    resetCategories: (state) => {
      state.categories = [];
      state.currentCategory = null;
      state.loading = false;
      state.error = null;
      state.stats = null;
      // ADDED: Clear pagination too
      state.pagination = {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
      };
      state.filters = {
        status: 'ALL'
      };
    },
  },
});

export const {
  startLoading,
  setCategories,
  setCurrentCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  setCategoryStats,
  updateCategoryImage,
  removeCategoryImage,
  setPagination,
  setFilters,
  setError,
  clearError,
  clearCurrentCategory,
  resetCategories,
} = categorySlice.actions;

export default categorySlice.reducer;