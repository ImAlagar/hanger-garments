// redux/services/analyticsService.js
import { apiSlice } from './api';

export const analyticsService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get complete analytics data
    getAnalyticsData: builder.query({
      query: (timeRange = 'monthly') => ({
        url: `/analytics?timeRange=${timeRange}`,
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),

    // Get analytics overview
    getAnalyticsOverview: builder.query({
      query: (timeRange = 'monthly') => ({
        url: `/analytics/overview?timeRange=${timeRange}`,
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),

    // Get revenue analytics
    getRevenueAnalytics: builder.query({
      query: (timeRange = 'monthly') => ({
        url: `/analytics/revenue?timeRange=${timeRange}`,
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),

    // Get traffic analytics
    getTrafficAnalytics: builder.query({
      query: (timeRange = 'monthly') => ({
        url: `/analytics/traffic?timeRange=${timeRange}`,
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),

    // Get product analytics
    getProductAnalytics: builder.query({
      query: ({ timeRange = 'monthly', limit = 5 }) => ({
        url: `/analytics/products?timeRange=${timeRange}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),

    // Get geographic analytics
    getGeographicAnalytics: builder.query({
      query: (timeRange = 'monthly') => ({
        url: `/analytics/geographic?timeRange=${timeRange}`,
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),

    // Export analytics data
    exportAnalyticsData: builder.mutation({
      query: ({ timeRange = 'monthly', format = 'json' }) => ({
        url: `/analytics/export?timeRange=${timeRange}&format=${format}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetAnalyticsDataQuery,
  useGetAnalyticsOverviewQuery,
  useGetRevenueAnalyticsQuery,
  useGetTrafficAnalyticsQuery,
  useGetProductAnalyticsQuery,
  useGetGeographicAnalyticsQuery,
  useExportAnalyticsDataMutation,
} = analyticsService;