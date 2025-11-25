// redux/services/subcategoryService.js
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const subcategoryService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ UPDATED: Use the correct admin quantity pricing routes
    getAllSubcategoriesWithQuantityPricing: builder.query({
      query: () => '/admin/subcategory-quantity-prices', // This matches your route
      providesTags: ['SubcategoryQuantityPricing'],
    }),

    getQuantityPriceById: builder.query({
      query: (quantityPriceId) => `/admin/subcategory-quantity-prices/${quantityPriceId}`,
      providesTags: (result, error, id) => [{ type: 'SubcategoryQuantityPricing', id }],
    }),
    // ✅ UPDATED: Correct endpoints for admin quantity pricing
    addSubcategoryQuantityPrice: builder.mutation({
      query: ({ subcategoryId, quantityPriceData }) => ({
        url: `/admin/subcategory-quantity-prices/${subcategoryId}`,
        method: 'POST',
        body: quantityPriceData,
      }),
      invalidatesTags: ['SubcategoryQuantityPricing', 'Subcategory'],
    }),

    updateSubcategoryQuantityPrice: builder.mutation({
      query: ({ quantityPriceId, updateData }) => ({
        url: `/admin/subcategory-quantity-prices/${quantityPriceId}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['SubcategoryQuantityPricing', 'Subcategory'],
    }),

    deleteSubcategoryQuantityPrice: builder.mutation({
      query: (quantityPriceId) => ({
        url: `/admin/subcategory-quantity-prices/${quantityPriceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubcategoryQuantityPricing', 'Subcategory'],
    }),

    toggleSubcategoryQuantityPriceStatus: builder.mutation({
      query: ({ quantityPriceId, isActive }) => ({
        url: `/admin/subcategory-quantity-prices/${quantityPriceId}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['SubcategoryQuantityPricing', 'Subcategory'],
    }),

    // Get quantity prices for specific subcategory
    getSubcategoryQuantityPrices: builder.query({
      query: (subcategoryId) => `/admin/subcategory-quantity-prices/subcategory/${subcategoryId}`,
      providesTags: ['SubcategoryQuantityPricing'],
    }),



    // Existing endpoints remain the same...
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

    getSubcategoriesByCategory: builder.query({
      query: (categoryId) => `/subcategory/category/${categoryId}`,
      providesTags: ['Subcategory'],
    }),

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
      query: ({ subcategoryId, updateData }) => {
        return {
          url: `/subcategory/admin/${subcategoryId}`,
          method: 'PUT',
          body: updateData,
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
      invalidatesTags: ['Subcategory'],
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
  useGetAllSubcategoriesWithQuantityPricingQuery,
  useGetQuantityPriceByIdQuery, // ✅ ADD THIS EXPORT

  useAddSubcategoryQuantityPriceMutation,
  useUpdateSubcategoryQuantityPriceMutation,
  useDeleteSubcategoryQuantityPriceMutation,
  useToggleSubcategoryQuantityPriceStatusMutation,
  useGetSubcategoryQuantityPricesQuery, // ✅ ADDED
  
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  useToggleSubcategoryStatusMutation,
} = subcategoryService;