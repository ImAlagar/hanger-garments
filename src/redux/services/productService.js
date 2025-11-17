// redux/services/productService.js - UPDATED WITH TOAST
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const productService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin product endpoints
    getAdminProducts: builder.query({
      query: (params = {}) => ({
        url: '/products',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || '', // Send as-is: "active", "inactive"
          category: params.category || '',
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc'
        },
      }),
      providesTags: ['Product'],
    }),

    getProductById: builder.query({
      query: (productId) => `/products/${productId}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    getProductBySlug: builder.query({
      query: (productId) => `/products/${productId}`,
    }),
    
    createProduct: builder.mutation({
      query: (formData) => ({
        url: '/products/admin',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Product created successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to create product');
        }
      },
    }),

    updateProduct: builder.mutation({
      query: ({ productId, productData }) => ({
        url: `/products/admin/${productId}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product'
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Product updated successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update product');
        }
      },
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/admin/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Product deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete product');
        }
      },
    }),

    toggleProductStatus: builder.mutation({
      query: ({ productId, currentStatus }) => ({
        url: `/products/admin/${productId}/status`,
        method: 'PATCH',
        body: { 
          status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' 
        }
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product'
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Product status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update status');
        }
      },
    }),

    // Product stats
    getProductStats: builder.query({
      query: () => '/products/admin/stats',
      providesTags: ['ProductStats'],
    }),

    // Bulk operations
    bulkDeleteProducts: builder.mutation({
      query: (productIds) => ({
        url: '/products/admin/bulk/delete',
        method: 'POST',
        body: { productIds },
      }),
      invalidatesTags: ['Product'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Products deleted successfully!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to delete products');
        }
      },
    }),

    toggleBestSeller: builder.mutation({
      query: ({ productId, isBestSeller }) => ({
        url: `/products/admin/${productId}/best-seller`,
        method: 'PATCH',
        body: { isBestSeller }
      }),
      invalidatesTags: ['Product'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Best seller status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update best seller status');
        }
      },
    }),

    toggleFeatured: builder.mutation({
      query: ({ productId, featured }) => ({
        url: `/products/admin/${productId}/featured`,
        method: 'PATCH',
        body: { featured }
      }),
      invalidatesTags: ['Product'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Featured status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update featured status');
        }
      },
    }),

    toggleNewArrival: builder.mutation({
      query: ({ productId, isNewArrival }) => ({
        url: `/products/admin/${productId}/new-arrival`,
        method: 'PATCH',
        body: { isNewArrival }
      }),
      invalidatesTags: ['Product'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('New arrival status updated!');
        } catch (error) {
          toast.error(error.error?.data?.message || 'Failed to update new arrival status');
        }
      },
    }),

    // Public endpoints
    getAllProducts: builder.query({
      query: (params = {}) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),

    searchProducts: builder.query({
      query: (searchParams) => ({
        url: '/products/search',
        params: searchParams,
      }),
    }),

    getFeaturedProducts: builder.query({
      query: () => '/products/featured/products',
      providesTags: ['Product'],
    }),

    getNewArrivals: builder.query({
      query: () => '/products/new-arrivals/products',
      providesTags: ['Product'],
    }),

    getBestSellers: builder.query({
      query: () => '/products/best-sellers/products',
      providesTags: ['Product'],
    }),

    getRelatedProducts: builder.query({
    query: ({ category, excludeProductId }) => 
      `/products/related?category=${category}&exclude=${excludeProductId}&limit=10`,
  }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductStatusMutation,
  useGetProductStatsQuery,
  useBulkDeleteProductsMutation,
  useToggleBestSellerMutation,
  useToggleFeaturedMutation,
  useToggleNewArrivalMutation,
  useGetAllProductsQuery,
  useSearchProductsQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetBestSellersQuery,
  useGetRelatedProductsQuery,
} = productService;