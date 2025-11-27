import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  stats: null,
  // ADDED: Pagination state
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  },
  filters: {
    role: 'ALL', // ALL, CUSTOMER, WHOLESALER, ADMIN
    status: 'ALL' // ALL, ACTIVE, INACTIVE
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload.users || action.payload;
      
      // If response includes pagination data, update it
      if (action.payload.pagination) {
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination
        };
      }
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateUser: (state, action) => {
      const updatedUser = action.payload;
      const index = state.users.findIndex(user => user._id === updatedUser._id);
      if (index !== -1) {
        state.users[index] = updatedUser;
      }
      if (state.currentUser && state.currentUser._id === updatedUser._id) {
        state.currentUser = updatedUser;
      }
    },
    removeUser: (state, action) => {
      const userId = action.payload;
      state.users = state.users.filter(user => user._id !== userId);
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
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setUsers, 
  setCurrentUser, 
  updateUser, 
  removeUser, 
  setPagination,
  setFilters,
  clearError 
} = userSlice.actions;
export default userSlice.reducer;