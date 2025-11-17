// redux/services/couponService.js
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const couponService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all coupons with optional filters
    getCoupons: builder.query({
      query: (params = {}) => ({
        url: '/coupons',
        params,
      }),
      providesTags: ['Coupon'],
    }),

    // Get coupon by ID
    getCoupon: builder.query({
      query: (couponId) => `/coupons/${couponId}`,
      providesTags: (result, error, id) => [{ type: 'Coupon', id }],
    }),

    // Create new coupon
    createCoupon: builder.mutation({
      query: (couponData) => ({
        url: '/coupons',
        method: 'POST',
        body: couponData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Coupon'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Coupon created successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to create coupon');
        }
      },
    }),

    // Update coupon
    updateCoupon: builder.mutation({
      query: ({ couponId, couponData }) => ({
        url: `/coupons/${couponId}`,
        method: 'PUT',
        body: couponData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Coupon'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Coupon updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update coupon');
        }
      },
    }),

    // Delete coupon
    deleteCoupon: builder.mutation({
      query: (couponId) => ({
        url: `/coupons/${couponId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Coupon deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete coupon');
        }
      },
    }),

    // Toggle coupon status
    toggleCouponStatus: builder.mutation({
      query: ({ couponId, currentStatus }) => ({
        url: `/coupons/${couponId}/status`,
        method: 'PATCH',
        body: {
          isActive: !currentStatus
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Coupon'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Coupon status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update coupon status');
        }
      },
    }),

    // Get coupon statistics
    getCouponStats: builder.query({
      query: () => '/coupons/stats',
      providesTags: ['Coupon'],
    }),

    // Public endpoints for coupon validation
    validateCoupon: builder.mutation({
      query: (couponData) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: couponData,
      }),
    }),

    getAvailableCoupons: builder.query({
      query: () => '/coupons/available',
      providesTags: ['Coupon'],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponStatusMutation,
  useGetCouponStatsQuery,
  useValidateCouponMutation,
  useGetAvailableCouponsQuery,
} = couponService;