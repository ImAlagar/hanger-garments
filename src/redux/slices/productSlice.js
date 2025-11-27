// redux/slices/productSlice.js - UPDATED
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // UI state
  selectedProducts: [],
  filters: {
    search: '',
    category: '',
    subcategory: '', // Make sure this exists
    status: '',
    stockStatus: '',
    merchandising: '', // featured, bestSeller, newArrival
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  },
  // Modal states
  deleteModal: {
    isOpen: false,
    product: null,
    isBulk: false
  },
  // Loading states
  loading: false,
  error: null
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Selection management
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload;
    },
    toggleProductSelection: (state, action) => {
      const productId = action.payload;
      const index = state.selectedProducts.indexOf(productId);
      if (index > -1) {
        state.selectedProducts.splice(index, 1);
      } else {
        state.selectedProducts.push(productId);
      }
    },
    clearSelection: (state) => {
      state.selectedProducts = [];
    },

    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    
    // ADD THIS: Set subcategory filter
    setSubcategoryFilter: (state, action) => {
      state.filters.subcategory = action.payload;
      state.pagination.currentPage = 1;
    },

    // Pagination management
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // Modal management
    openDeleteModal: (state, action) => {
      state.deleteModal.isOpen = true;
      state.deleteModal.product = action.payload?.product || null;
      state.deleteModal.isBulk = action.payload?.isBulk || false;
    },
    closeDeleteModal: (state) => {
      state.deleteModal = initialState.deleteModal;
    },

    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetProductState: () => initialState
  },
});

export const {
  setSelectedProducts,
  toggleProductSelection,
  clearSelection,
  setFilters,
  clearFilters,
  setSubcategoryFilter, // ADD THIS
  setPagination,
  setCurrentPage,
  openDeleteModal,
  closeDeleteModal,
  setLoading,
  setError,
  clearError,
  resetProductState
} = productSlice.actions;

export default productSlice.reducer;