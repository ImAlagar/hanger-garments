// redux/services/subcategoryService.js - UPDATED WITH PAGINATION
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

    // UPDATED: Get all subcategories with pagination
    getAllSubcategories: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, category, status } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        
        if (category && category !== 'ALL') {
          queryParams.append('category', category);
        }
        
        if (status && status !== 'ALL') {
          queryParams.append('isActive', status === 'ACTIVE' ? 'true' : 'false');
        }
        
        return {
          url: `/subcategory?${queryParams.toString()}`,
        };
      },
      providesTags: ['Subcategory'],
      // Transform the response to match our expected structure
      transformResponse: (response) => {
        // Handle different response structures
        if (response.data && response.data.subcategories) {
          // If response already has the expected structure
          return response;
        } else if (Array.isArray(response.data)) {
          // If response.data is an array, wrap it in the expected structure
          return {
            data: {
              subcategories: response.data,
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
              subcategories: response,
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
            subcategories: response.data || response || [],
            pagination: response.pagination || {
              currentPage: 1,
              pages: 1,
              total: (response.data || response || []).length
            }
          }
        };
      },
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
  useGetQuantityPriceByIdQuery,

  useAddSubcategoryQuantityPriceMutation,
  useUpdateSubcategoryQuantityPriceMutation,
  useDeleteSubcategoryQuantityPriceMutation,
  useToggleSubcategoryQuantityPriceStatusMutation,
  useGetSubcategoryQuantityPricesQuery,
  
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  useToggleSubcategoryStatusMutation,
} = subcategoryService;