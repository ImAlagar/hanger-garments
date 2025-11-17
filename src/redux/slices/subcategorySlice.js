import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subcategories: [],
  currentSubcategory: null,
  loading: false,
  error: null,
};

const subcategorySlice = createSlice({
  name: 'subcategory',
  initialState,
  reducers: {
    setSubcategories: (state, action) => {
      state.subcategories = action.payload;
    },
    setCurrentSubcategory: (state, action) => {
      state.currentSubcategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setSubcategories, 
  setCurrentSubcategory, 
  clearError 
} = subcategorySlice.actions;
export default subcategorySlice.reducer;