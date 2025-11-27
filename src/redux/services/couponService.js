// redux/services/couponService.js
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const couponService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all coupons with optional filters and pagination
    getCoupons: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, status } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        
        if (status && status !== 'ALL') {
          queryParams.append('status', status);
        }
        
        return {
          url: `/coupons?${queryParams.toString()}`,
        };
      },
      providesTags: ['Coupon'],
      // Transform the response to match our expected structure
      transformResponse: (response) => {
        // Handle different response structures
        if (response.data && response.data.coupons) {
          // If response already has the expected structure
          return response;
        } else if (Array.isArray(response.data)) {
          // If response.data is an array, wrap it in the expected structure
          return {
            data: {
              coupons: response.data,
              pagination: response.pagination || {
                currentPage: 1,
                pages: 1,
                total: response.data.length
              }
            }
          };
        } else if (Array.isArray(response)) {
          // If response is directly an array
          return {
            data: {
              coupons: response,
              pagination: {
                currentPage: 1,
                pages: 1,
                total: response.length
              }
            }
          };
        }
        
        // Fallback structure
        return {
          data: {
            coupons: response.data || response || [],
            pagination: response.pagination || {
              currentPage: 1,
              pages: 1,
              total: (response.data || response || []).length
            }
          }
        };
      },
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

    getAvailableCoupons: builder.query({
      query: (subtotal = 0) => ({
        url: '/coupons/available',
        params: { subtotal }
      }),
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