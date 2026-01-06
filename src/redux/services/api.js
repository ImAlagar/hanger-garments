import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});


const baseQueryWithAutoLogout = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    api.dispatch(logout());
    window.location.href = '/login';
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithAutoLogout,
  tagTypes: ['Auth', 'User', 'Product', 'Order'],
  endpoints: () => ({}),
});