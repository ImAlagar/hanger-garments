// slices/wishlistSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Helper function to get user-specific storage key
const getWishlistStorageKey = (userId = 'guest') => {
  return `wishlist_${userId}`;
};

// Load initial state from localStorage for specific user
const loadWishlistFromStorage = (userId = 'guest') => {
  if (typeof window === 'undefined') return { items: [], userId };
  
  try {
    const storageKey = getWishlistStorageKey(userId);
    const saved = localStorage.getItem(storageKey);
    return saved ? { items: JSON.parse(saved), userId } : { items: [], userId };
  } catch (error) {
    console.error('Error loading wishlist from storage:', error);
    return { items: [], userId };
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
        // Save to user-specific localStorage
        if (typeof window !== 'undefined') {
          const storageKey = getWishlistStorageKey(state.userId);
          localStorage.setItem(storageKey, JSON.stringify(state.items));
        }
      }
    },
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product._id !== productId);
      // Save to user-specific localStorage
      if (typeof window !== 'undefined') {
        const storageKey = getWishlistStorageKey(state.userId);
        localStorage.setItem(storageKey, JSON.stringify(state.items));
      }
    },
    clearWishlist: (state) => {
      state.items = [];
      // Clear user-specific localStorage
      if (typeof window !== 'undefined') {
        const storageKey = getWishlistStorageKey(state.userId);
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
    },
    // NEW: Switch user wishlist
    switchUserWishlist: (state, action) => {
      const userId = action.payload || 'guest';
      const newWishlist = loadWishlistFromStorage(userId);
      state.items = newWishlist.items;
      state.userId = userId;
    },
    // NEW: Clear wishlist when user logs out
    clearCurrentWishlist: (state) => {
      state.items = [];
      state.userId = 'guest';
      // Clear both current user and guest storage to be safe
      if (typeof window !== 'undefined') {
        const currentKey = getWishlistStorageKey(state.userId);
        const guestKey = getWishlistStorageKey('guest');
        localStorage.setItem(currentKey, JSON.stringify([]));
        localStorage.setItem(guestKey, JSON.stringify([]));
      }
    }
  },
});

export const { 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist, 
  switchUserWishlist,
  clearCurrentWishlist 
} = wishlistSlice.actions;

// Selector for wishlist count
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectWishlistUserId = (state) => state.wishlist.userId;

export default wishlistSlice.reducer;