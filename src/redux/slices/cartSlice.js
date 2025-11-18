// slices/cartSlice.js (Final version)
import { createSlice } from '@reduxjs/toolkit';

const getCartStorageKey = (userId = 'guest') => `cart_${userId}`;

const loadCartFromStorage = (userId = 'guest') => {
  if (typeof window === 'undefined') return { items: [], userId };
  
  try {
    const storageKey = getCartStorageKey(userId);
    const saved = localStorage.getItem(storageKey);
    return saved ? { items: JSON.parse(saved), userId } : { items: [], userId };
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return { items: [], userId };
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(
        item => 
          item.product._id === newItem.product._id && 
          item.variant._id === newItem.variant._id
      );
      
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push({
          id: Date.now().toString(),
          ...newItem
        });
      }
      
      // Save to user-specific localStorage
      localStorage.setItem(getCartStorageKey(state.userId), JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem(getCartStorageKey(state.userId), JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
      localStorage.setItem(getCartStorageKey(state.userId), JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.setItem(getCartStorageKey(state.userId), JSON.stringify([]));
    },
    switchUserCart: (state, action) => {
      const userId = action.payload || 'guest';
      const newCart = loadCartFromStorage(userId);
      state.items = newCart.items;
      state.userId = userId;
    },
    clearCurrentCart: (state) => {
      state.items = [];
      state.userId = 'guest';
      localStorage.setItem(getCartStorageKey('guest'), JSON.stringify([]));
    }
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  switchUserCart,
  clearCurrentCart 
} = cartSlice.actions;

export default cartSlice.reducer;