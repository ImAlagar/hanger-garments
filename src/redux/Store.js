// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import categoryReducer from './slices/categorySlice';
import subcategoryReducer from './slices/subcategorySlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import couponReducer from './slices/couponSlice';
import ratingReducer from './slices/ratingSlice';
import contactReducer from './slices/contactSlice';
import sliderReducer from './slices/sliderSlice';
import customizationReducer from './slices/customizationSlice'; // Add this
import designReducer from './slices/designSlice'; // Add this
import { apiSlice } from './services/api';

// Configure the store
const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    category: categoryReducer,
    subcategory: subcategoryReducer,
    product: productReducer,
    order: orderReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    coupon: couponReducer,
    rating: ratingReducer,
    contact: contactReducer,
    slider: sliderReducer,
    customization: customizationReducer, // Add this
    design: designReducer, // Add this
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;