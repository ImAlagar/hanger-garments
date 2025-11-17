// redux/slices/contactSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  contacts: [],
  currentContact: null,
  loading: false,
  error: null,
  stats: null,
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
      state.contacts = action.payload;
      state.loading = false;
      state.error = null;
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
  setError,
  clearError,
  clearCurrentContact,
  resetContacts,
} = contactSlice.actions;

export default contactSlice.reducer;