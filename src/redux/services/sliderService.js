import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const sliderService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoints
    getActiveSliders: builder.query({
      query: () => '/sliders/active',
      providesTags: ['Slider'],
    }),

    // Admin endpoints with pagination
    getAllSliders: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, status, layout, search } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        
        if (status && status !== 'ALL') {
          queryParams.append('status', status);
        }
        
        if (layout && layout !== 'ALL') {
          queryParams.append('layout', layout);
        }

        if (search) {
          queryParams.append('search', search);
        }
        
        return {
          url: `/sliders?${queryParams.toString()}`,
        };
      },
      providesTags: ['Slider'],
      transformResponse: (response) => {
        // Handle different response structures
        if (response.data && response.data.sliders) {
          // If response already has the expected structure
          return response;
        } else if (Array.isArray(response.data)) {
          // If response.data is an array, wrap it in the expected structure
          return {
            data: {
              sliders: response.data,
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
              sliders: response,
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
            sliders: response.data || response || [],
            pagination: response.pagination || {
              currentPage: 1,
              pages: 1,
              total: (response.data || response || []).length
            }
          }
        };
      },
    }),

    getSliderById: builder.query({
      query: (sliderId) => `/sliders/${sliderId}`,
      providesTags: (result, error, id) => [{ type: 'Slider', id }],
    }),

    createSlider: builder.mutation({
      query: (sliderData) => {
        // Handle FormData for file uploads
        if (sliderData instanceof FormData) {
          return {
            url: '/sliders',
            method: 'POST',
            body: sliderData,
            // Let browser set headers automatically for FormData
          };
        }
        
        // Handle regular JSON data
        return {
          url: '/sliders',
          method: 'POST',
          body: sliderData,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['Slider'],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          toast.success('Slider created successfully!');
        } catch (error) {
          console.error('❌ Slider creation failed:', error);
          
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
      query: ({ sliderId, sliderData }) => {
        // Handle FormData for file uploads
        if (sliderData instanceof FormData) {
          return {
            url: `/sliders/${sliderId}`,
            method: 'PUT',
            body: sliderData,
          };
        }
        
        // Handle regular JSON data
        return {
          url: `/sliders/${sliderId}`,
          method: 'PUT',
          body: sliderData,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      transformResponse: (response) => {
        return {
          data: response.data || response || {}
        };
      },
    }),

    getSliderPerformance: builder.query({
      query: () => '/sliders/performance',
      providesTags: ['Slider'],
      transformResponse: (response) => {
        return {
          data: response.data || response || {}
        };
      },
    }),

    // Search sliders
    searchSliders: builder.query({
      query: (searchTerm) => ({
        url: `/sliders/search?q=${encodeURIComponent(searchTerm)}`,
      }),
      providesTags: ['Slider'],
    }),

    // Get sliders by layout
    getSlidersByLayout: builder.query({
      query: (layout) => `/sliders/layout/${layout}`,
      providesTags: ['Slider'],
    }),

    // Bulk operations
    bulkDeleteSliders: builder.mutation({
      query: (sliderIds) => ({
        url: '/sliders/bulk-delete',
        method: 'POST',
        body: { sliderIds },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Slider'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Sliders deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete sliders');
        }
      },
    }),

    bulkUpdateSliderStatus: builder.mutation({
      query: ({ sliderIds, isActive }) => ({
        url: '/sliders/bulk-status',
        method: 'PATCH',
        body: { sliderIds, isActive },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Slider'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Slider status updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update slider status');
        }
      },
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
  useSearchSlidersQuery,
  useGetSlidersByLayoutQuery,
  useBulkDeleteSlidersMutation,
  useBulkUpdateSliderStatusMutation,
} = sliderService;