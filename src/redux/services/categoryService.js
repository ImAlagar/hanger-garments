// redux/services/categoryService.js - FIXED TOGGLE STATUS WITH PROPER HEADERS
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const categoryService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => '/category',
      providesTags: ['Category'],
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
          'Content-Type': 'application/json', // ADD THIS HEADER
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