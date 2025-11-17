// redux/services/userService.js - UPDATED
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const userService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin endpoints
    getAllUsers: builder.query({
      query: (params = {}) => ({
        url: '/auth/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),

    getUserById: builder.query({
      query: (userId) => `/auth/users/${userId}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation({
      query: (userData) => {
        // Check if we have files (wholesaler) or just data (admin/customer)
        const hasFiles = userData.shopPhotos && userData.shopPhotos.length > 0;
        
        if (hasFiles) {
          // Use FormData for wholesaler (with files)
          const formData = new FormData();
          Object.keys(userData).forEach(key => {
            if (key === 'shopPhotos' && Array.isArray(userData[key])) {
              userData[key].forEach(file => {
                formData.append('shopPhotos', file);
              });
            } else {
              formData.append(key, userData[key]);
            }
          });

          return {
            url: '/auth/admin/users',
            method: 'POST',
            body: formData,
            // Don't set Content-Type header for FormData - browser will set it with boundary
          };
        } else {
          // Use JSON for admin/customer (no files)
          return {
            url: '/auth/admin/users',
            method: 'POST',
            body: userData,
            headers: {
              'Content-Type': 'application/json',
            },
          };
        }
      },
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/auth/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('User deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete user');
        }
      },
    }),

    // Update toggleUserStatus mutation
    toggleUserStatus: builder.mutation({
      query: ({ userId, currentStatus }) => ({
        url: `/auth/admin/users/${userId}/status`,
        method: 'PATCH',
        body: {
          isActive: !currentStatus
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('User status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update user status');
        }
      },
    }),

    // Update changeUserRole mutation
    changeUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/auth/admin/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('User role updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update user role');
        }
      },
    }),

    approveWholesaler: builder.mutation({
      query: ({ userId, isApproved }) => ({
        url: `/auth/admin/approve-wholesaler/${userId}`,
        method: 'PATCH',
        body: { isApproved },
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(`Wholesaler ${arg.isApproved ? 'approved' : 'rejected'}!`);
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update wholesaler approval');
        }
      },
    }),

    getUserStats: builder.query({
      query: () => '/auth/admin/users/stats',
      providesTags: ['User'],
    }),

    // User profile endpoints
    updateProfile: builder.mutation({
      query: ({ userId, profileData }) => ({
        url: `/auth/users/${userId}/profile`,
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    updateWholesalerProfile: builder.mutation({
      query: ({ userId, profileData }) => {
        const formData = new FormData();
        Object.keys(profileData).forEach(key => {
          if (key === 'shopPhotos' && Array.isArray(profileData[key])) {
            profileData[key].forEach(file => {
              formData.append('shopPhotos', file);
            });
          } else {
            formData.append(key, profileData[key]);
          }
        });

        return {
          url: `/auth/users/${userId}/wholesaler-profile`,
          method: 'PATCH',
          body: formData,
        };
      },
      invalidatesTags: ['User'],
    }),

    updateAvatar: builder.mutation({
      query: ({ userId, avatar }) => {
        const formData = new FormData();
        formData.append('avatar', avatar);

        return {
          url: `/auth/users/${userId}/avatar`,
          method: 'PATCH',
          body: formData,
        };
      },
      invalidatesTags: ['User'],
    }),

    removeAvatar: builder.mutation({
      query: (userId) => ({
        url: `/auth/users/${userId}/avatar`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    deleteShopPhoto: builder.mutation({
      query: ({ userId, photoUrl }) => ({
        url: `/auth/users/${userId}/shop-photos/${encodeURIComponent(photoUrl)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation, // ADD THIS
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useChangeUserRoleMutation,
  useApproveWholesalerMutation,
  useGetUserStatsQuery,
  useUpdateProfileMutation,
  useUpdateWholesalerProfileMutation,
  useUpdateAvatarMutation,
  useRemoveAvatarMutation,
  useDeleteShopPhotoMutation,
} = userService;