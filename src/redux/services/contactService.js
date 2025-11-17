import { toast } from 'react-toastify';
import { apiSlice } from './api';

export const contactService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoints
    createContact: builder.mutation({
      query: (contactData) => ({
        url: '/contacts',
        method: 'POST',
        body: contactData,
      }),
      invalidatesTags: ['Contact'],
    }),

    // User endpoints
    getUserContacts: builder.query({
      query: () => '/contacts/user/my-contacts',
      providesTags: ['Contact'],
    }),

    // Admin endpoints
    getAllContacts: builder.query({
      query: (params = {}) => ({
        url: '/contacts/admin',
        params,
      }),
      providesTags: ['Contact'],
    }),


    getContactById: builder.query({
      query: (contactId) => `/contacts/admin/${contactId}`,
      providesTags: (result, error, id) => [{ type: 'Contact', id }],
    }),


    updateContactStatus: builder.mutation({
      query: ({ contactId, status }) => ({
        url: `/contacts/admin/${contactId}/status`,
        method: 'PATCH',
        body: { status },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Contact'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Contact status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update contact status');
        }
      },
    }),

    updateContact: builder.mutation({
      query: ({ contactId, contactData }) => ({
        url: `/contacts/admin/${contactId}`,
        method: 'PUT',
        body: contactData,
      }),
      invalidatesTags: ['Contact'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Contact updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update contact');
        }
      },
    }),

    deleteContact: builder.mutation({
      query: (contactId) => ({
        url: `/contacts/admin/${contactId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Contact deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete contact');
        }
      },
    }),

    bulkUpdateContactStatus: builder.mutation({
      query: (statusData) => ({
        url: '/contacts/admin/bulk/status',
        method: 'PATCH',
        body: statusData,
      }),
      invalidatesTags: ['Contact'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Contacts status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update contacts status');
        }
      },
    }),


    getContactStats: builder.query({
      query: () => '/contacts/admin/stats',
      providesTags: ['Contact'],
    }),
  }),
});

export const {
  useCreateContactMutation,
  useGetUserContactsQuery,
  useGetAllContactsQuery,
  useGetContactByIdQuery,
  useUpdateContactStatusMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
  useBulkUpdateContactStatusMutation,
  useGetContactStatsQuery,
} = contactService;