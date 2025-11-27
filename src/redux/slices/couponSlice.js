import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  coupons: [],
  availableCoupons: [],
  currentCoupon: null,
  loading: false,
  error: null,
  stats: null,
  validationResult: null,
  // ADDED: Pagination state
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  },
  filters: {
    status: 'ALL' // ALL, ACTIVE, EXPIRED, SCHEDULED
  }
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    // Start loading
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Set all coupons
    setCoupons: (state, action) => {
      state.coupons = action.payload.coupons || action.payload;
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

    // Set available coupons (for public use)
    setAvailableCoupons: (state, action) => {
      state.availableCoupons = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set current coupon
    setCurrentCoupon: (state, action) => {
      state.currentCoupon = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add new coupon
    addCoupon: (state, action) => {
      state.coupons.push(action.payload);
      state.loading = false;
      state.error = null;
    },

    // Update coupon
    updateCoupon: (state, action) => {
      const updatedCoupon = action.payload;
      const index = state.coupons.findIndex(coupon => coupon.id === updatedCoupon.id);
      if (index !== -1) {
        state.coupons[index] = updatedCoupon;
      }
      if (state.currentCoupon && state.currentCoupon.id === updatedCoupon.id) {
        state.currentCoupon = updatedCoupon;
      }
      state.loading = false;
      state.error = null;
    },

    // Delete coupon
    deleteCoupon: (state, action) => {
      const couponId = action.payload;
      state.coupons = state.coupons.filter(coupon => coupon.id !== couponId);
      if (state.currentCoupon && state.currentCoupon.id === couponId) {
        state.currentCoupon = null;
      }
      state.loading = false;
      state.error = null;
    },

    // Toggle coupon status
    toggleCouponStatus: (state, action) => {
      const { couponId, isActive } = action.payload;
      const coupon = state.coupons.find(coupon => coupon.id === couponId);
      if (coupon) {
        coupon.isActive = isActive;
      }
      if (state.currentCoupon && state.currentCoupon.id === couponId) {
        state.currentCoupon.isActive = isActive;
      }
    },

    // Set coupon stats
    setCouponStats: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set validation result
    setValidationResult: (state, action) => {
      state.validationResult = action.payload;
    },

    // Clear validation result
    clearValidationResult: (state) => {
      state.validationResult = null;
    },

    // Update coupon usage
    updateCouponUsage: (state, action) => {
      const { couponId, usedCount, totalDiscounts } = action.payload;
      const coupon = state.coupons.find(coupon => coupon.id === couponId);
      if (coupon) {
        coupon.usedCount = usedCount;
        coupon.totalDiscounts = totalDiscounts;
      }
      if (state.currentCoupon && state.currentCoupon.id === couponId) {
        state.currentCoupon.usedCount = usedCount;
        state.currentCoupon.totalDiscounts = totalDiscounts;
      }
    },

    // Increment coupon usage (when coupon is applied)
    incrementCouponUsage: (state, action) => {
      const { couponId, discountAmount } = action.payload;
      const coupon = state.coupons.find(coupon => coupon.id === couponId);
      if (coupon) {
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        coupon.totalDiscounts = (coupon.totalDiscounts || 0) + discountAmount;
      }
      if (state.currentCoupon && state.currentCoupon.id === couponId) {
        state.currentCoupon.usedCount = (state.currentCoupon.usedCount || 0) + 1;
        state.currentCoupon.totalDiscounts = (state.currentCoupon.totalDiscounts || 0) + discountAmount;
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

    // ADDED: Clear pagination
    clearPagination: (state) => {
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

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear current coupon
    clearCurrentCoupon: (state) => {
      state.currentCoupon = null;
    },

    // Reset state
    resetCoupons: (state) => {
      state.coupons = [];
      state.availableCoupons = [];
      state.currentCoupon = null;
      state.loading = false;
      state.error = null;
      state.stats = null;
      state.validationResult = null;
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
  setCoupons,
  setAvailableCoupons,
  setCurrentCoupon,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  setCouponStats,
  setValidationResult,
  clearValidationResult,
  updateCouponUsage,
  incrementCouponUsage,
  setPagination,
  setFilters,
  clearPagination,
  setError,
  clearError,
  clearCurrentCoupon,
  resetCoupons,
} = couponSlice.actions;

export default couponSlice.reducer;