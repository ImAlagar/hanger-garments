// redux/slices/contactSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  contacts: [],
  currentContact: null,
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
    status: 'ALL' // ALL, PENDING, IN_PROGRESS, RESOLVED, CLOSED
  }
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    // Start loading
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Set all contacts
    setContacts: (state, action) => {
      state.contacts = action.payload.contacts || action.payload;
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

    // Set current contact
    setCurrentContact: (state, action) => {
      state.currentContact = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Update contact
    updateContact: (state, action) => {
      const updatedContact = action.payload;
      const index = state.contacts.findIndex(contact => contact._id === updatedContact._id);
      if (index !== -1) {
        state.contacts[index] = updatedContact;
      }
      if (state.currentContact && state.currentContact._id === updatedContact._id) {
        state.currentContact = updatedContact;
      }
      state.loading = false;
      state.error = null;
    },

    // Delete contact
    deleteContact: (state, action) => {
      const contactId = action.payload;
      state.contacts = state.contacts.filter(contact => contact._id !== contactId);
      if (state.currentContact && state.currentContact._id === contactId) {
        state.currentContact = null;
      }
      state.loading = false;
      state.error = null;
    },

    // Update contact status
    updateContactStatus: (state, action) => {
      const { contactId, status } = action.payload;
      const contact = state.contacts.find(contact => contact._id === contactId);
      if (contact) {
        contact.status = status;
      }
      if (state.currentContact && state.currentContact._id === contactId) {
        state.currentContact.status = status;
      }
    },

    // Set contact stats
    setContactStats: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
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
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear current contact
    clearCurrentContact: (state) => {
      state.currentContact = null;
    },

    // Reset state
    resetContacts: (state) => {
      state.contacts = [];
      state.currentContact = null;
      state.loading = false;
      state.error = null;
      state.stats = null;
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
  setContacts,
  setCurrentContact,
  updateContact,
  deleteContact,
  updateContactStatus,
  setContactStats,
  setPagination,
  setFilters,
  clearPagination,
  setError,
  clearError,
  clearCurrentContact,
  resetContacts,
} = contactSlice.actions;

export default contactSlice.reducer;