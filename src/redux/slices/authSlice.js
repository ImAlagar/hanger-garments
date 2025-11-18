import { createSlice } from '@reduxjs/toolkit';

// Helper function to get initial state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  return {
    user: userData ? JSON.parse(userData) : null,
    token: token,
    isAuthenticated: !!token,
    loading: false,
    initialCheckDone: false,
    error: null,
    role: userData ? JSON.parse(userData)?.role : null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      let user, token;
      
      // Handle different response structures
      if (action.payload.data && action.payload.data.accessToken) {
        user = action.payload.data.user;
        token = action.payload.data.accessToken;
      } 
      else if (action.payload.data && action.payload.data.token) {
        user = action.payload.data.user;
        token = action.payload.data.token;
      }
      else if (action.payload.user && action.payload.accessToken) {
        user = action.payload.user;
        token = action.payload.accessToken;
      }
      else if (action.payload.user && action.payload.token) {
        user = action.payload.user;
        token = action.payload.token;
      }
      else {
        user = action.payload;
        token = action.payload.token || action.payload.accessToken;
      }

      if (user && token) {
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        state.role = user.role || null;
        state.loading = false;
        state.initialCheckDone = true;
        state.error = null;
        
        // Store in localStorage for persistence
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
      } else {
        console.error('Invalid credentials payload:', action.payload);
        state.loading = false;
        state.initialCheckDone = true;
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      state.initialCheckDone = true;
      
      // Clear localStorage on logout
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      sessionStorage.clear(); // Clear sessionStorage as well
      
      // Note: Cart and wishlist will be cleared by separate actions
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setInitialCheckDone: (state, action) => {
      state.initialCheckDone = action.payload;
    },
    
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.initialCheckDone = true;
    },
    
    authCheckComplete: (state) => {
      state.loading = false;
      state.initialCheckDone = true;
    },

    // NEW: Refresh user data from localStorage
    refreshAuth: (state) => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        state.user = JSON.parse(userData);
        state.token = token;
        state.isAuthenticated = true;
        state.role = JSON.parse(userData)?.role;
      }
      state.initialCheckDone = true;
    },

    // NEW: Update user profile
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('userData', JSON.stringify(state.user));
      }
    },
  },
});

export const { 
  setCredentials, 
  logout, 
  clearError, 
  setLoading, 
  setInitialCheckDone,
  authStart,
  authFailure,
  authCheckComplete,
  refreshAuth,
  updateUserProfile
} = authSlice.actions;
export default authSlice.reducer;