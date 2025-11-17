// redux/services/dashboardService.js
import { apiSlice } from './api';

export const dashboardService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get complete dashboard data
    getDashboardData: builder.query({
      query: (timeRange = 'monthly') => ({
        url: `/dashboard?timeRange=${timeRange}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Get dashboard overview
    getDashboardOverview: builder.query({
      query: (timeRange = 'monthly') => ({
        url: `/dashboard/overview?timeRange=${timeRange}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Get business metrics
    getBusinessMetrics: builder.query({
      query: () => ({
        url: '/dashboard/business-metrics',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Get recent activities
    getRecentActivities: builder.query({
      query: (limit = 10) => ({
        url: `/dashboard/recent-activities?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Get top products
    getTopProducts: builder.query({
      query: (limit = 5) => ({
        url: `/dashboard/top-products?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Get quick stats
    getQuickStats: builder.query({
      query: () => ({
        url: '/dashboard/quick-stats',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Get sales data for charts
    getSalesData: builder.query({
      query: (timeRange = 'monthly') => ({
        url: `/dashboard/sales-data?timeRange=${timeRange}`,
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Get real-time updates
    getDashboardUpdates: builder.query({
      query: () => ({
        url: '/dashboard/updates',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetDashboardOverviewQuery,
  useGetBusinessMetricsQuery,
  useGetRecentActivitiesQuery,
  useGetTopProductsQuery,
  useGetQuickStatsQuery,
  useGetSalesDataQuery,
  useGetDashboardUpdatesQuery,
} = dashboardService;