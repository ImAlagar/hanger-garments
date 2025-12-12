// slices/cartSlice.js - FIXED VERSION WITH PRODUCT ID CLEANING
import { createSlice } from '@reduxjs/toolkit';
import placeholderimage from "../../assets/images/placeholder.jpg"

// Helper function to clean product IDs (remove color suffixes)
const cleanProductId = (productId) => {
  if (!productId) return null;
  
  // Common color suffixes to remove
  const colorSuffixes = [
    '-Beige', '-Red', '-Blue', '-Green', '-Black', '-White', '-Yellow',
    '-Pink', '-Purple', '-Orange', '-Brown', '-Gray', '-Grey', '-Silver',
    '-Gold', '-Navy', '-Maroon', '-Teal', '-Olive', '-Lavender',
    '-Coral', '-Indigo', '-Violet', '-Magenta', '-Turquoise', '-Charcoal',
    '-Royal Blue', '-Sky Blue', '-Dark Blue', '-Light Blue', '-Navy Blue',
    '-Baby Blue', '-Royal-Blue', '-Sky-Blue', '-Dark-Blue', '-Light-Blue',
    '-Baby-Blue', '-Navy-Blue', '-RoyalBlue', '-SkyBlue', '-DarkBlue',
    '-LightBlue', '-BabyBlue', '-NavyBlue'
  ];
  
  // Convert to lowercase for case-insensitive matching
  const lowerId = productId.toLowerCase();
  
  // Check for any color suffix
  for (const suffix of colorSuffixes) {
    const lowerSuffix = suffix.toLowerCase();
    if (lowerId.endsWith(lowerSuffix)) {
      // Find the actual case from the original string
      const actualSuffix = productId.substring(productId.length - suffix.length);
      const cleanId = productId.substring(0, productId.length - actualSuffix.length);
      console.log(`Cleaned product ID: ${productId} -> ${cleanId} (removed: ${actualSuffix})`);
      return cleanId;
    }
  }
  
  // Also handle patterns with spaces
  const colorPatterns = [
    ' royal blue', ' sky blue', ' dark blue', ' light blue', ' baby blue', ' navy blue',
    ' royal-blue', ' sky-blue', ' dark-blue', ' light-blue', ' baby-blue', ' navy-blue'
  ];
  
  for (const pattern of colorPatterns) {
    if (lowerId.includes(pattern)) {
      const startIndex = lowerId.indexOf(pattern);
      const cleanId = productId.substring(0, startIndex);
      console.log(`Cleaned product ID with space: ${productId} -> ${cleanId}`);
      return cleanId;
    }
  }
  
  // If no color suffix found, try splitting by last hyphen if the last part is all letters
  const parts = productId.split('-');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    // Check if last part could be a color (contains only letters, no numbers)
    if (/^[A-Za-z\s]+$/.test(lastPart)) {
      const cleanId = parts.slice(0, -1).join('-');
      console.log(`Split by hyphen: ${productId} -> ${cleanId} (last part: ${lastPart})`);
      return cleanId;
    }
  }
  
  console.log(`No cleaning needed: ${productId}`);
  return productId;
};

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
      
      // ✅ Clean the product ID
      const cleanedProductId = cleanProductId(newItem.product._id);
      
      // ✅ FIXED: Ensure proper item structure
      const cartItem = {
        id: `${cleanedProductId}_${newItem.variant._id}_${Date.now()}`,
        product: {
          _id: cleanedProductId, // Use cleaned ID
          originalId: newItem.product._id, // Store original ID for reference
          name: newItem.product.name || 'Unknown Product',
          description: newItem.product.description || '',
          category: newItem.product.category || 'Uncategorized',
          images: newItem.product.images || [],
          image: newItem.product.image || (newItem.product.images && newItem.product.images[0]) || placeholderimage,
          // Add price fields for wholesale calculations
          normalPrice: Number(newItem.product.normalPrice) || 0,
          offerPrice: Number(newItem.product.offerPrice) || 0,
          wholesalePrice: Number(newItem.product.wholesalePrice) || 0,
          isWholesaleUser: newItem.product.isWholesaleUser || false
        },
        variant: {
          _id: newItem.variant._id,
          color: newItem.variant.color || 'N/A',
          size: newItem.variant.size || 'N/A',
          // ✅ FIXED: Ensure price is always a number
          price: Number(newItem.variant.price) || Number(newItem.product.offerPrice) || Number(newItem.product.normalPrice) || 0,
          // Add variant wholesale price if available
          wholesalePrice: Number(newItem.variant.wholesalePrice) || 0,
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
    },
    
    // ✅ NEW: Clean all existing cart items (for migration)
    cleanCartItems: (state) => {
      state.items = state.items.map(item => {
        const cleanedProductId = cleanProductId(item.product._id);
        return {
          ...item,
          product: {
            ...item.product,
            _id: cleanedProductId,
            originalId: item.product._id // Keep original
          },
          id: `${cleanedProductId}_${item.variant._id}_${Date.now()}`
        };
      });
      localStorage.setItem(getCartStorageKey(state.userId), JSON.stringify(state.items));
    }
  },
});

export const { 
  addToCart, 
  updateQuantity, 
  removeCartItem,
  clearCart,
  switchUserCart,
  cleanCartItems // Export the new action
} = cartSlice.actions;

export default cartSlice.reducer;