import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import categoryReducer from './slices/categorySlice';
import subcategoryReducer from './slices/subcategorySlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice'; // Add this import
import couponReducer from './slices/couponSlice';
import ratingReducer from './slices/ratingSlice';
import contactReducer from './slices/contactSlice';
import sliderReducer from './slices/sliderSlice';
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
    wishlist: wishlistReducer, // Add this line
    coupon: couponReducer,
    rating: ratingReducer,
    contact: contactReducer,
    slider: sliderReducer,
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