import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  stats: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
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
  clearError 
} = userSlice.actions;
export default userSlice.reducer;