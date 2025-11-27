import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sliders: [],
  activeSliders: [],
  currentSlider: null,
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
    status: 'ALL', // ALL, ACTIVE, INACTIVE, EXPIRED, SCHEDULED
    layout: 'ALL' // ALL, or specific layout type
  },
  // Stats and performance data
  stats: null,
  performance: null,
  // UI states
  successMessage: null,
  operationLoading: false
};

const sliderSlice = createSlice({
  name: 'slider',
  initialState,
  reducers: {
    // Basic state setters
    setSliders: (state, action) => {
      state.sliders = action.payload.sliders || action.payload;
      
      // If response includes pagination data, update it
      if (action.payload.pagination) {
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination
        };
      }
    },
    setActiveSliders: (state, action) => {
      state.activeSliders = action.payload;
    },
    setCurrentSlider: (state, action) => {
      state.currentSlider = action.payload;
    },
    
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setOperationLoading: (state, action) => {
      state.operationLoading = action.payload;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.operationLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Success messages
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // ADDED: Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.pageSize = action.payload;
    },
    
    // ADDED: Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'ALL',
        layout: 'ALL'
      };
    },
    
    // Stats and performance
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setPerformance: (state, action) => {
      state.performance = action.payload;
    },
    
    // Slider operations
    addSlider: (state, action) => {
      state.sliders.unshift(action.payload);
      state.successMessage = 'Slider created successfully';
    },
    updateSlider: (state, action) => {
      const index = state.sliders.findIndex(slider => slider.id === action.payload.id);
      if (index !== -1) {
        state.sliders[index] = action.payload;
      }
      // Also update current slider if it's the one being edited
      if (state.currentSlider && state.currentSlider.id === action.payload.id) {
        state.currentSlider = action.payload;
      }
      state.successMessage = 'Slider updated successfully';
    },
    deleteSlider: (state, action) => {
      state.sliders = state.sliders.filter(slider => slider.id !== action.payload);
      state.successMessage = 'Slider deleted successfully';
    },
    
    // Toggle slider status
    toggleSliderStatus: (state, action) => {
      const { sliderId, isActive } = action.payload;
      const slider = state.sliders.find(s => s.id === sliderId);
      if (slider) {
        slider.isActive = isActive;
        slider.updatedAt = new Date().toISOString();
      }
      // Also update in active sliders
      if (isActive) {
        // Add to active sliders if not already there
        const exists = state.activeSliders.find(s => s.id === sliderId);
        if (!exists && slider) {
          state.activeSliders.push(slider);
        }
      } else {
        // Remove from active sliders
        state.activeSliders = state.activeSliders.filter(s => s.id !== sliderId);
      }
      // Update current slider if it's the one being toggled
      if (state.currentSlider && state.currentSlider.id === sliderId) {
        state.currentSlider.isActive = isActive;
      }
    },
    
    // Reorder sliders
    reorderSliders: (state, action) => {
      const updatedSliders = action.payload;
      updatedSliders.forEach(updatedSlider => {
        const index = state.sliders.findIndex(s => s.id === updatedSlider.id);
        if (index !== -1) {
          state.sliders[index].order = updatedSlider.order;
        }
      });
      // Sort sliders by order
      state.sliders.sort((a, b) => a.order - b.order);
      state.activeSliders.sort((a, b) => a.order - b.order);
      state.successMessage = 'Sliders reordered successfully';
    },
    
    // Reset state
    resetSliderState: (state) => {
      return {
        ...initialState,
        // Keep some states if needed, otherwise use initialState
        activeSliders: state.activeSliders // Keep active sliders for home page
      };
    },
    
    // Clear current slider
    clearCurrentSlider: (state) => {
      state.currentSlider = null;
    },
    
    // Bulk operations
    setBulkSelection: (state, action) => {
      const { sliderIds, selected } = action.payload;
      state.sliders = state.sliders.map(slider => 
        sliderIds.includes(slider.id) 
          ? { ...slider, selected }
          : slider
      );
    },
    
    clearBulkSelection: (state) => {
      state.sliders = state.sliders.map(slider => ({
        ...slider,
        selected: false
      }));
    },
    
    // Search and filter
    searchSliders: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when searching
    }
  },
});

export const { 
  setSliders, 
  setActiveSliders, 
  setCurrentSlider,
  setLoading,
  setOperationLoading,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  setPagination,
  setPage,
  setLimit,
  setFilters,
  clearFilters,
  setStats,
  setPerformance,
  addSlider,
  updateSlider,
  deleteSlider,
  toggleSliderStatus,
  reorderSliders,
  resetSliderState,
  clearCurrentSlider,
  setBulkSelection,
  clearBulkSelection,
  searchSliders
} = sliderSlice.actions;

export default sliderSlice.reducer;