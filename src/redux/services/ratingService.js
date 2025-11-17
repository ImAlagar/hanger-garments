// redux/services/ratingService.js - UPDATED WITH TOAST MESSAGES
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const ratingService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoints
    getProductRatings: builder.query({
      query: (productId) => `/ratings/product/${productId}`,
      providesTags: ['Rating'],
    }),

    // User endpoints
    createRating: builder.mutation({
      query: (ratingData) => ({
        url: '/ratings',
        method: 'POST',
        body: ratingData,
      }),
      invalidatesTags: ['Rating'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Rating submitted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to submit rating');
        }
      },
    }),

    updateRating: builder.mutation({
      query: ({ ratingId, ratingData }) => ({
        url: `/ratings/${ratingId}`,
        method: 'PUT',
        body: ratingData,
      }),
      invalidatesTags: ['Rating'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Rating updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update rating');
        }
      },
    }),

    deleteRating: builder.mutation({
      query: (ratingId) => ({
        url: `/ratings/${ratingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rating'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Rating deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete rating');
        }
      },
    }),

    getUserRatings: builder.query({
      query: () => '/ratings/user/my-ratings',
      providesTags: ['Rating'],
    }),

    // Admin endpoints
    getAllRatings: builder.query({
      query: (params = {}) => ({
        url: '/ratings/admin',
        params,
      }),
      providesTags: ['Rating'],
    }),

    getRatingById: builder.query({
      query: (ratingId) => `/ratings/admin/${ratingId}`,
      providesTags: (result, error, id) => [{ type: 'Rating', id }],
    }),

    toggleRatingApproval: builder.mutation({
      query: ({ ratingId, currentApproval }) => ({
        url: `/ratings/admin/${ratingId}/approval`,
        method: 'PATCH',
        body: {
          isApproved: !currentApproval
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Rating'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Rating approval status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update rating approval');
        }
      },
    }),

    bulkUpdateRatingApproval: builder.mutation({
      query: (approvalData) => ({
        url: '/ratings/admin/bulk/approval',
        method: 'PATCH',
        body: approvalData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Rating'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Ratings approval status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update ratings approval');
        }
      },
    }),

    getRatingStats: builder.query({
      query: () => '/ratings/admin/stats',
      providesTags: ['Rating'],
    }),
  }),
});

export const {
  useGetProductRatingsQuery,
  useCreateRatingMutation,
  useUpdateRatingMutation,
  useDeleteRatingMutation,
  useGetUserRatingsQuery,
  useGetAllRatingsQuery,
  useGetRatingByIdQuery,
  useToggleRatingApprovalMutation,
  useBulkUpdateRatingApprovalMutation,
  useGetRatingStatsQuery,
} = ratingService;