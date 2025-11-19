// hooks/useUserSession.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { switchUserWishlist, clearCurrentWishlist } from '../slices/wishlistSlice';
import { switchUserCart, clearCurrentCart } from '../slices/cartSlice';

export const useUserSession = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // User logged in - switch to their personal cart and wishlist
      const userId = user._id || user.id;
      
      dispatch(switchUserCart(userId));
      dispatch(switchUserWishlist(userId)); // Use the correct action
    } else {
      // User logged out or not authenticated - switch to guest cart and wishlist
      dispatch(switchUserCart('guest'));
      dispatch(switchUserWishlist('guest')); // Use the correct action
    }
  }, [isAuthenticated, user, dispatch]);

  // Function to clear everything on logout
  const clearUserData = () => {
    dispatch(clearCurrentCart());
    dispatch(clearCurrentWishlist());
  };

  return { clearUserData };
};