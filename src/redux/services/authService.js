import { apiSlice } from './api';

export const authService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // User endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    verifyOTP: builder.mutation({
      query: (otpData) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: otpData,
      }),
    }),

    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['Auth'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Wholesaler endpoints
    wholesalerLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    wholesalerRegister: builder.mutation({
      query: (wholesalerData) => ({
        url: '/auth/register', // Use the existing register endpoint
        method: 'POST',
        body: wholesalerData,
      }),
    }),

    sendOTP: builder.mutation({
      query: (phoneData) => ({
        url: '/auth/login',
        method: 'POST',
        body: phoneData,
      }),
    }),

    verifyWholesalerOTP: builder.mutation({
      query: (otpData) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: otpData,
      }),
    }),

    // Admin endpoints
    getPendingWholesalers: builder.query({
      query: () => '/auth/admin/pending-wholesalers',
      providesTags: ['User'],
    }),

    approveWholesaler: builder.mutation({
      query: (wholesalerId) => ({
        url: `/auth/admin/approve-wholesaler/${wholesalerId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),

    rejectWholesaler: builder.mutation({
      query: (wholesalerId) => ({
        url: `/auth/admin/reject-wholesaler/${wholesalerId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),

    // Password management
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),

    forgotPasswordWholesaler: builder.mutation({
  query: (credentials) => ({
    url: '/auth/forgot-password-wholesaler',
    method: 'POST',
    body: credentials,
  }),
}),

    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: resetData,
      }),
    }),

    validateResetToken: builder.query({
      query: ({ token, userId }) => `/auth/validate-reset-token?token=${token}&userId=${userId}`,
    }),

    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwordData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Profile management
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Wholesaler profile
    getWholesalerProfile: builder.query({
      query: () => '/auth/wholesaler/profile',
      providesTags: ['Auth'],
    }),

    updateWholesalerProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/wholesaler/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useGetProfileQuery,
  useLogoutMutation,
  useGetPendingWholesalersQuery,
  useApproveWholesalerMutation,
  useRejectWholesalerMutation,
  useWholesalerLoginMutation,
  useWholesalerRegisterMutation,
  useSendOTPMutation,
  useVerifyWholesalerOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useValidateResetTokenQuery, // Add this
useForgotPasswordWholesalerMutation,
  useUpdateProfileMutation,
  useGetWholesalerProfileQuery,
  useUpdateWholesalerProfileMutation,
} = authService;