import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  userOrders: [],
  currentOrder: null,
  loading: false,
  error: null,
  stats: null,
  paymentStatus: null,
  paymentLoading: false,
  calculatedTotals: null,
  // ADDED: Pagination state
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  },
  filters: {
    status: 'ALL'
  }
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Start loading
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Start payment loading
    startPaymentLoading: (state) => {
      state.paymentLoading = true;
    },

    // Set all orders (for admin)
    setOrders: (state, action) => {
      state.orders = action.payload.orders || action.payload;
      state.loading = false;
      state.error = null;
      
      // If response includes pagination data, update it
      if (action.payload.pagination) {
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination
        };
      }
    },

    // Set user orders
    setUserOrders: (state, action) => {
      state.userOrders = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set current order
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add new order
    addOrder: (state, action) => {
      const newOrder = action.payload;
      state.orders.unshift(newOrder);
      state.userOrders.unshift(newOrder);
      state.loading = false;
      state.error = null;
    },

    // Update order
    updateOrder: (state, action) => {
      const updatedOrder = action.payload;
      
      // Update in orders array (admin)
      const orderIndex = state.orders.findIndex(order => order._id === updatedOrder._id);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = updatedOrder;
      }

      // Update in user orders array
      const userOrderIndex = state.userOrders.findIndex(order => order._id === updatedOrder._id);
      if (userOrderIndex !== -1) {
        state.userOrders[userOrderIndex] = updatedOrder;
      }

      // Update current order if it's the same
      if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
        state.currentOrder = updatedOrder;
      }

      state.loading = false;
      state.error = null;
    },

    // Update order status
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      
      const order = state.orders.find(order => order._id === orderId);
      if (order) {
        order.status = status;
      }

      const userOrder = state.userOrders.find(order => order._id === orderId);
      if (userOrder) {
        userOrder.status = status;
      }

      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.status = status;
      }
    },

    // Update tracking info
    updateTrackingInfo: (state, action) => {
      const { orderId, trackingInfo } = action.payload;
      
      const order = state.orders.find(order => order._id === orderId);
      if (order) {
        order.trackingInfo = trackingInfo;
      }

      const userOrder = state.userOrders.find(order => order._id === orderId);
      if (userOrder) {
        userOrder.trackingInfo = trackingInfo;
      }

      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.trackingInfo = trackingInfo;
      }
    },

    // Delete order (admin only)
    deleteOrder: (state, action) => {
      const orderId = action.payload;
      state.orders = state.orders.filter(order => order._id !== orderId);
      state.userOrders = state.userOrders.filter(order => order._id !== orderId);
      
      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder = null;
      }
      
      state.loading = false;
      state.error = null;
    },

    // Set order stats
    setOrderStats: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set payment status
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
      state.paymentLoading = false;
    },

    // Clear payment status
    clearPaymentStatus: (state) => {
      state.paymentStatus = null;
    },

    // Process refund
    processRefund: (state, action) => {
      const { orderId, refundData } = action.payload;
      
      const order = state.orders.find(order => order._id === orderId);
      if (order) {
        order.refundStatus = refundData.status;
        order.refundAmount = refundData.amount;
      }

      const userOrder = state.userOrders.find(order => order._id === orderId);
      if (userOrder) {
        userOrder.refundStatus = refundData.status;
        userOrder.refundAmount = refundData.amount;
      }

      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.refundStatus = refundData.status;
        state.currentOrder.refundAmount = refundData.amount;
      }
    },

    // Calculate order totals result
    setCalculatedTotals: (state, action) => {
      state.calculatedTotals = action.payload;
      state.loading = false;
    },

    // ADDED: Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // ADDED: Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },

    // ADDED: Clear pagination
    clearPagination: (state) => {
      state.pagination = {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
      };
      state.filters = {
        status: 'ALL'
      };
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.paymentLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // Clear all orders
    clearOrders: (state) => {
      state.orders = [];
      state.userOrders = [];
      state.currentOrder = null;
      state.loading = false;
      state.error = null;
      state.stats = null;
      state.paymentStatus = null;
      state.paymentLoading = false;
      state.calculatedTotals = null;
      // ADDED: Clear pagination too
      state.pagination = {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
      };
      state.filters = {
        status: 'ALL'
      };
    },
  },
});

export const {
  startLoading,
  startPaymentLoading,
  setOrders,
  setUserOrders,
  setCurrentOrder,
  addOrder,
  updateOrder,
  updateOrderStatus,
  updateTrackingInfo,
  deleteOrder,
  setOrderStats,
  setPaymentStatus,
  clearPaymentStatus,
  processRefund,
  setCalculatedTotals,
  setPagination,
  setFilters,
  clearPagination,
  setError,
  clearError,
  clearCurrentOrder,
  clearOrders,
} = orderSlice.actions;

export default orderSlice.reducer;