// redux/services/contactService.js
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

    // Admin endpoints - UPDATED with pagination
    getAllContacts: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, status } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        
        if (status && status !== 'ALL') {
          queryParams.append('status', status);
        }
        
        return {
          url: `/contacts/admin?${queryParams.toString()}`,
        };
      },
      providesTags: ['Contact'],
      // Transform the response to match our expected structure
      transformResponse: (response) => {
        // Handle different response structures
        if (response.data && response.data.contacts) {
          // If response already has the expected structure
          return response;
        } else if (Array.isArray(response.data)) {
          // If response.data is an array, wrap it in the expected structure
          return {
            data: {
              contacts: response.data,
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
              contacts: response,
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
            contacts: response.data || response || [],
            pagination: response.pagination || {
              currentPage: 1,
              pages: 1,
              total: (response.data || response || []).length
            }
          }
        };
      },
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