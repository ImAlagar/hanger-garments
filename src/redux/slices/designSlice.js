// redux/slices/designSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // User designs
  designs: [],
  selectedDesigns: [],
  // Filters and pagination
  filters: {
    status: '',
    search: '',
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
    design: null,
  },
  // Loading states
  loading: false,
  error: null
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    // Designs management
    setDesigns: (state, action) => {
      state.designs = action.payload;
    },
    addDesign: (state, action) => {
      state.designs.unshift(action.payload);
    },
    updateDesign: (state, action) => {
      const { designId, updates } = action.payload;
      const index = state.designs.findIndex(design => design.id === designId);
      if (index !== -1) {
        state.designs[index] = { ...state.designs[index], ...updates };
      }
    },
    removeDesign: (state, action) => {
      state.designs = state.designs.filter(design => design.id !== action.payload);
    },

    // Selection management
    setSelectedDesigns: (state, action) => {
      state.selectedDesigns = action.payload;
    },
    toggleDesignSelection: (state, action) => {
      const designId = action.payload;
      const index = state.selectedDesigns.indexOf(designId);
      if (index > -1) {
        state.selectedDesigns.splice(index, 1);
      } else {
        state.selectedDesigns.push(designId);
      }
    },
    clearSelection: (state) => {
      state.selectedDesigns = [];
    },

    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
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
      state.deleteModal.design = action.payload;
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
    resetDesignState: () => initialState
  },
});

export const {
  setDesigns,
  addDesign,
  updateDesign,
  removeDesign,
  setSelectedDesigns,
  toggleDesignSelection,
  clearSelection,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentPage,
  openDeleteModal,
  closeDeleteModal,
  setLoading,
  setError,
  clearError,
  resetDesignState,
} = designSlice.actions;

export default designSlice.reducer;