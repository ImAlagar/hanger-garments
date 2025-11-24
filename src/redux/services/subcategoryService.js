// redux/services/subcategoryService.js
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const subcategoryService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoints
    getAllSubcategories: builder.query({
      query: (categoryId = '') => ({
        url: '/subcategory',
        params: categoryId ? { category: categoryId } : {}
      }),
      providesTags: ['Subcategory'],
    }),

    getSubcategoryById: builder.query({
      query: (subcategoryId) => `/subcategory/${subcategoryId}`,
      providesTags: (result, error, id) => [{ type: 'Subcategory', id }],
    }),

    // Get subcategories by category ID
    getSubcategoriesByCategory: builder.query({
      query: (categoryId) => `/subcategory/category/${categoryId}`,
      providesTags: ['Subcategory'],
    }),

    // Admin endpoints
    createSubcategory: builder.mutation({
      query: (subcategoryData) => {
        const formData = new FormData();
        formData.append('name', subcategoryData.name);
        formData.append('description', subcategoryData.description);
        formData.append('categoryId', subcategoryData.categoryId);
        if (subcategoryData.image) {
          formData.append('image', subcategoryData.image);
        }

        return {
          url: '/subcategory/admin',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Subcategory'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Subcategory created successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to create subcategory');
        }
      },
    }),

    updateSubcategory: builder.mutation({
      query: ({ subcategoryId, updateData }) => { // Fixed parameter name
        return {
          url: `/subcategory/admin/${subcategoryId}`,
          method: 'PUT',
          body: updateData, // Use FormData directly
        };
      },
      invalidatesTags: (result, error, { subcategoryId }) => [
        { type: 'Subcategory', id: subcategoryId },
        'Subcategory'
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Subcategory updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update subcategory');
        }
      },
    }),

    deleteSubcategory: builder.mutation({
      query: (subcategoryId) => ({
        url: `/subcategory/admin/${subcategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subcategory'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Subcategory deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete subcategory');
        }
      },
    }),

    toggleSubcategoryStatus: builder.mutation({
      query: ({ subcategoryId, currentStatus }) => ({
        url: `/subcategory/admin/${subcategoryId}/status`,
        method: 'PATCH',
        body: {
          isActive: !currentStatus
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Subcategory'], // Fixed typo
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Subcategory status updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update subcategory status');
        }
      },
    }),

  }),
});

export const {
  useGetAllSubcategoriesQuery,
  useGetSubcategoryByIdQuery,
  useGetSubcategoriesByCategoryQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  useToggleSubcategoryStatusMutation,
} = subcategoryService;