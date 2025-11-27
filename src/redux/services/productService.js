// redux/services/productService.js - UPDATED WITH TOAST
import { apiSlice } from './api';
import { toast } from 'react-toastify';

export const productService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin product endpoints
    getAdminProducts: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        // Add pagination
        queryParams.append('page', params.page || 1);
        queryParams.append('limit', params.limit || 10);
        
        // Add filters
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.category) queryParams.append('category', params.category);
        if (params.subcategory) queryParams.append('subcategory', params.subcategory); // Make sure this is included
        if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
        
        // Add sorting
        queryParams.append('sortBy', params.sortBy || 'createdAt');
        queryParams.append('sortOrder', params.sortOrder || 'desc');


        return {
          url: `/products?${queryParams.toString()}`,
        };
      },
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

    // Variant Management Endpoints
    addProductVariant: builder.mutation({
      query: ({ productId, variantData }) => ({
        url: `/products/admin/${productId}/variants`,
        method: 'POST',
        body: variantData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product'
      ],
    }),

    updateProductVariant: builder.mutation({
      query: ({ productId, variantId, variantData }) => ({
        url: `/products/admin/${productId}/variants/${variantId}`,
        method: 'PUT',
        body: variantData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product'
      ],
    }),

    deleteProductVariant: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: `/products/admin/${productId}/variants/${variantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product'
      ],
    }),

    updateVariantStock: builder.mutation({
      query: ({ productId, variantId, stockData }) => ({
        url: `/products/admin/${productId}/variants/${variantId}/stock`,
        method: 'PATCH',
        body: stockData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product'
      ],
    }),



    // Calculate quantity price for a product
    calculateQuantityPrice: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/products/${productId}/calculate-quantity-price`,
        method: 'POST',
        body: { quantity },
      }),
    }),

    // Get products with quantity offers in a subcategory
    getProductsWithQuantityOffers: builder.query({
      query: (subcategoryId) => `/products/subcategory/${subcategoryId}/quantity-offers`,
      providesTags: ['Product'],
    }),

    // Calculate cart prices with quantity discounts
    calculateCartPrices: builder.mutation({
      query: (items) => ({
        url: '/products/calculate-cart-prices',
        method: 'POST',
        body: { items },
      }),
    }),

    // Get all subcategories with quantity pricing
    getSubcategoriesWithQuantityPricing: builder.query({
      query: () => '/products/subcategories/with-pricing',
      providesTags: ['Subcategory'],
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
  useAddProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateVariantStockMutation,

  useCalculateQuantityPriceMutation,
  useGetProductsWithQuantityOffersQuery,
  useCalculateCartPricesMutation,
  useGetSubcategoriesWithQuantityPricingQuery,
  
  // Admin quantity pricing exports
  useAddSubcategoryQuantityPriceMutation,

} = productService;