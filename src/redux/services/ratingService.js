// redux/services/ratingService.js - UPDATED WITH PAGINATION
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

    // Admin endpoints - UPDATED with pagination
    getAllRatings: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, status, rating } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        
        if (status && status !== 'ALL') {
          queryParams.append('isApproved', status === 'APPROVED' ? 'true' : 'false');
        }
        
        if (rating && rating !== 'ALL') {
          queryParams.append('rating', rating);
        }
        
        return {
          url: `/ratings/admin?${queryParams.toString()}`,
        };
      },
      providesTags: ['Rating'],
      // Transform the response to match our expected structure
      transformResponse: (response) => {
        // Handle different response structures
        if (response.data && response.data.ratings) {
          // If response already has the expected structure
          return response;
        } else if (Array.isArray(response.data)) {
          // If response.data is an array, wrap it in the expected structure
          return {
            data: {
              ratings: response.data,
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
              ratings: response,
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
            ratings: response.data || response || [],
            pagination: response.pagination || {
              currentPage: 1,
              pages: 1,
              total: (response.data || response || []).length
            }
          }
        };
      },
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