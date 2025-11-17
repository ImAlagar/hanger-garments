import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  coupons: [],
  availableCoupons: [],
  currentCoupon: null,
  loading: false,
  error: null,
  stats: null,
  validationResult: null,
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
      state.coupons = action.payload;
      state.loading = false;
      state.error = null;
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
  setError,
  clearError,
  clearCurrentCoupon,
  resetCoupons,
} = couponSlice.actions;

export default couponSlice.reducer;