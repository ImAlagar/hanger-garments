// redux/slices/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = getState().auth?.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Don't set Content-Type for FormData - let browser set it automatically
    return headers;
  },
  credentials: 'include', // Important for cookies/auth
});

export const apiSlice = createApi({
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    
    return result;
  },
  tagTypes: ['Slider'],
  endpoints: (builder) => ({}),
});