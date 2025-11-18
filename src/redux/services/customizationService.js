// redux/services/customizationService.js
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const customizationService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get customization by product ID
    getCustomizationByProductId: builder.query({
      query: (productId) => `/customizations/product/${productId}`,
      providesTags: ['Customization'],
    }),

    // Create customization (Admin only)
    createCustomization: builder.mutation({
      query: (customizationData) => ({
        url: '/customizations/admin',
        method: 'POST',
        body: customizationData,
      }),
      invalidatesTags: ['Customization'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Customization created successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to create customization');
        }
      },
    }),

    // Update customization (Admin only)
    updateCustomization: builder.mutation({
      query: ({ customizationId, customizationData }) => ({
        url: `/customizations/admin/${customizationId}`,
        method: 'PUT',
        body: customizationData,
      }),
      invalidatesTags: ['Customization'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Customization updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update customization');
        }
      },
    }),

    // Toggle customization status (Admin only)
    toggleCustomizationStatus: builder.mutation({
      query: ({ customizationId, isActive }) => ({
        url: `/customizations/admin/${customizationId}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['Customization'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Customization status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update customization status');
        }
      },
    }),

    // Delete customization (Admin only)
    deleteCustomization: builder.mutation({
      query: (customizationId) => ({
        url: `/customizations/admin/${customizationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customization'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Customization deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete customization');
        }
      },
    }),
  }),
});

export const {
  useGetCustomizationByProductIdQuery,
  useCreateCustomizationMutation,
  useUpdateCustomizationMutation,
  useToggleCustomizationStatusMutation,
  useDeleteCustomizationMutation,
} = customizationService;