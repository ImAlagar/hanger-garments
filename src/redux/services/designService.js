// redux/services/designService.js
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const designService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create design
    createDesign: builder.mutation({
      query: (designData) => ({
        url: '/designs',
        method: 'POST',
        body: designData,
      }),
      invalidatesTags: ['Design'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Design created successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to create design');
        }
      },
    }),

    // Get design by ID
    getDesignById: builder.query({
      query: (designId) => `/designs/${designId}`,
      providesTags: (result, error, id) => [{ type: 'Design', id }],
    }),

    // Get user designs
    getUserDesigns: builder.query({
      query: (params = {}) => ({
        url: '/designs/user',
        params: {
          status: params.status || '',
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }),
      providesTags: ['Design'],
    }),

    // Update design
    updateDesign: builder.mutation({
      query: ({ designId, designData }) => ({
        url: `/designs/${designId}`,
        method: 'PUT',
        body: designData,
      }),
      invalidatesTags: (result, error, { designId }) => [
        { type: 'Design', id: designId },
        'Design'
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Design updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update design');
        }
      },
    }),

    // Delete design
    deleteDesign: builder.mutation({
      query: (designId) => ({
        url: `/designs/${designId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Design'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Design deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete design');
        }
      },
    }),

    // Generate design preview
    generateDesignPreview: builder.mutation({
      query: ({ designId, width = 800, height = 600 }) => ({
        url: `/designs/${designId}/preview`,
        method: 'GET',
        params: { width, height },
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to generate preview');
        }
      },
    }),

    // Save design to order
    saveDesignToOrder: builder.mutation({
      query: ({ designId, orderItemId }) => ({
        url: `/designs/${designId}/save-to-order`,
        method: 'PATCH',
        body: { orderItemId },
      }),
      invalidatesTags: ['Design'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Design saved to order!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to save design to order');
        }
      },
    }),
  }),
});

export const {
  useCreateDesignMutation,
  useGetDesignByIdQuery,
  useGetUserDesignsQuery,
  useUpdateDesignMutation,
  useDeleteDesignMutation,
  useGenerateDesignPreviewMutation,
  useSaveDesignToOrderMutation,
} = designService;