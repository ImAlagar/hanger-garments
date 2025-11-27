// redux/services/categoryService.js - UPDATED WITH PAGINATION
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const categoryService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // UPDATED: Get all categories with pagination
    getAllCategories: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, status } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        
        if (status && status !== 'ALL') {
          queryParams.append('isActive', status === 'ACTIVE' ? 'true' : 'false');
        }
        
        return {
          url: `/category?${queryParams.toString()}`,
        };
      },
      providesTags: ['Category'],
      // Transform the response to match our expected structure
      transformResponse: (response) => {
        // Handle different response structures
        if (response.data && response.data.categories) {
          // If response already has the expected structure
          return response;
        } else if (Array.isArray(response.data)) {
          // If response.data is an array, wrap it in the expected structure
          return {
            data: {
              categories: response.data,
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
              categories: response,
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
            categories: response.data || response || [],
            pagination: response.pagination || {
              currentPage: 1,
              pages: 1,
              total: (response.data || response || []).length
            }
          }
        };
      },
    }),

    getCategoryById: builder.query({
      query: (categoryId) => `/category/${categoryId}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation({
      query: (categoryData) => {
        const formData = new FormData();
        formData.append('name', categoryData.name);
        formData.append('description', categoryData.description);
        if (categoryData.image) {
          formData.append('image', categoryData.image);
        }

        return {
          url: '/category/admin',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Category'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Category created successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to create category');
        }
      },
    }),

    updateCategory: builder.mutation({
      query: ({ categoryId, categoryData }) => {
        const formData = new FormData();
        Object.keys(categoryData).forEach(key => {
          if (key === 'image' && categoryData.image) {
            formData.append('image', categoryData.image);
          } else {
            formData.append(key, categoryData[key]);
          }
        });

        return {
          url: `/category/admin/${categoryId}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Category'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Category updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update category');
        }
      },
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/category/admin/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Category deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete category');
        }
      },
    }),

    toggleCategoryStatus: builder.mutation({
      query: ({ categoryId, currentStatus }) => ({
        url: `/category/admin/${categoryId}/status`,
        method: 'PATCH',
        body: {
          isActive: !currentStatus
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Category'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Category status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update category status');
        }
      },
    }),

    getCategoryStats: builder.query({
      query: () => '/category/admin/stats',
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  useGetCategoryStatsQuery,
} = categoryService;