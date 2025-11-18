// slices/wishlistSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadWishlistFromStorage = () => {
  if (typeof window === 'undefined') return { items: [] };
  
  try {
    const saved = localStorage.getItem('userWishlist');
    return saved ? { items: JSON.parse(saved) } : { items: [] };
  } catch (error) {
    console.error('Error loading wishlist from storage:', error);
    return { items: [] };
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: loadWishlistFromStorage(),
  reducers: {
    addToWishlist: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.product._id === newItem.product._id);
      
      if (!existingItem) {
        state.items.push(newItem);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('userWishlist', JSON.stringify(state.items));
        }
      }
    },
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product._id !== productId);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userWishlist', JSON.stringify(state.items));
      }
    },
    clearWishlist: (state) => {
      state.items = [];
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userWishlist', JSON.stringify([]));
      }
    },
    // Add this to sync with localStorage on app start
    syncWishlistFromStorage: (state) => {
      const saved = loadWishlistFromStorage();
      state.items = saved.items;
    }
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, syncWishlistFromStorage } = wishlistSlice.actions;
export default wishlistSlice.reducer;