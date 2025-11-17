import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const sliderService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoints
    getActiveSliders: builder.query({
      query: () => '/sliders/active',
      providesTags: ['Slider'],
    }),

    // Admin endpoints
    getAllSliders: builder.query({
      query: (params = {}) => ({
        url: '/sliders',
        params,
      }),
      providesTags: ['Slider'],
    }),

    getSliderById: builder.query({
      query: (sliderId) => `/sliders/${sliderId}`,
      providesTags: (result, error, id) => [{ type: 'Slider', id }],
    }),

    createSlider: builder.mutation({
      query: (sliderData) => {
        
        return {
          url: '/sliders',
          method: 'POST',
          body: sliderData,
          // Let browser set headers automatically for FormData
        };
      },
      invalidatesTags: ['Slider'],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          toast.success('Slider created successfully!');
        } catch (error) {
          console.error('❌ Slider creation failed:', error);
          
          // Enhanced error logging

          
          let errorMessage = 'Failed to create slider';
          
          if (error.error?.status === 400) {
            errorMessage = error.error?.data?.message || 'Validation failed';
            if (error.error?.data?.errors) {
              errorMessage += ': ' + error.error.data.errors.map(err => err.message).join(', ');
            }
          } else if (error.error?.status === 401) {
            errorMessage = 'Authentication failed. Please login again.';
          } else if (error.error?.status === 413) {
            errorMessage = 'File size too large. Please select smaller images.';
          } else if (error.error?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          toast.error(errorMessage);
        }
      },
    }),

    updateSlider: builder.mutation({
      query: ({ sliderId, sliderData }) => ({
        url: `/sliders/${sliderId}`,
        method: 'PUT',
        body: sliderData,
      }),
      invalidatesTags: (result, error, { sliderId }) => [
        'Slider',
        { type: 'Slider', id: sliderId }
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Slider updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update slider');
        }
      },
    }),

    deleteSlider: builder.mutation({
      query: (sliderId) => ({
        url: `/sliders/${sliderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Slider'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Slider deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete slider');
        }
      },
    }),

  toggleSliderStatus: builder.mutation({
    query: ({ sliderId, currentStatus }) => ({
      url: `/sliders/${sliderId}/status`,
      method: 'PATCH',
      body: {
        isActive: !currentStatus
      },
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    invalidatesTags: (result, error, { sliderId }) => [
      'Slider',
      { type: 'Slider', id: sliderId }
    ],
    async onQueryStarted(arg, { queryFulfilled }) {
      try {
        await queryFulfilled;
        toast.success('Slider status updated!');
      } catch (error) {
        toast.error(error.error?.data?.message || 'Failed to update slider status');
      }
    },
  }),

    reorderSliders: builder.mutation({
      query: (sliderOrder) => ({
        url: '/sliders/reorder',
        method: 'PATCH',
        body: sliderOrder,
      }),
      invalidatesTags: ['Slider'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Sliders reordered successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to reorder sliders');
        }
      },
    }),

    // Add slider stats endpoint
    getSliderStats: builder.query({
      query: () => '/sliders/stats',
      providesTags: ['Slider'],
    }),

    getSliderPerformance: builder.query({
      query: () => '/sliders/performance',
      providesTags: ['Slider'],
    }),
  }),
});

export const {
  useGetActiveSlidersQuery,
  useGetAllSlidersQuery,
  useGetSliderByIdQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
  useToggleSliderStatusMutation,
  useReorderSlidersMutation,
  useGetSliderStatsQuery,
  useGetSliderPerformanceQuery,
} = sliderService;