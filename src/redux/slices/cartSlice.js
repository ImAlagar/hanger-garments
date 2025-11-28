// slices/cartSlice.js - FIXED VERSION
import { createSlice } from '@reduxjs/toolkit';
import placeholderimage from "../../assets/images/placeholder.jpg"


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
      
      // ✅ FIXED: Ensure proper item structure
      const cartItem = {
        id: `${newItem.product._id}_${newItem.variant._id}_${Date.now()}`,
        product: {
          _id: newItem.product._id,
          name: newItem.product.name || 'Unknown Product',
          description: newItem.product.description || '',
          category: newItem.product.category || 'Uncategorized',
          images: newItem.product.images || [],
          image: newItem.product.image || (newItem.product.images && newItem.product.images[0]) || placeholderimage,
        },
        variant: {
          _id: newItem.variant._id,
          color: newItem.variant.color || 'N/A',
          size: newItem.variant.size || 'N/A',
          // ✅ FIXED: Ensure price is always a number
          price: Number(newItem.variant.price) || Number(newItem.product.offerPrice) || Number(newItem.product.normalPrice) || 0,
          stock: newItem.variant.stock || 0,
          sku: newItem.variant.sku || '',
          image: newItem.variant.image || newItem.product.image || (newItem.product.images && newItem.product.images[0]),
        },
        quantity: Math.max(1, Number(newItem.quantity) || 1)
      };

      const existingItemIndex = state.items.findIndex(
        item => 
          item.product._id === cartItem.product._id && 
          item.variant._id === cartItem.variant._id
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += cartItem.quantity;
      } else {
        // Add new item
        state.items.push(cartItem);
      }
      
      // Save to localStorage
      localStorage.setItem(getCartStorageKey(state.userId), JSON.stringify(state.items));
    },
    
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          state.items[itemIndex].quantity = quantity;
        }
        
        // Save to localStorage
        localStorage.setItem(getCartStorageKey(state.userId), JSON.stringify(state.items));
      }
    },
    
    removeCartItem: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);
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
    }
  },
});

export const { 
  addToCart, 
  updateQuantity, 
  removeCartItem,
  clearCart,
  switchUserCart
} = cartSlice.actions;

export default cartSlice.reducer;