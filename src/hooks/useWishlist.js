// hooks/useWishlist.js
import { useDispatch, useSelector } from 'react-redux';
import { 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist,
  switchUserWishlist, // Use switchUserWishlist instead of syncWishlistFromStorage
  clearCurrentWishlist 
} from '../redux/slices/wishlistSlice';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const addItemToWishlist = (product, variant = null) => {
    
    // Ensure we have the correct product structure
    const wishlistItem = {
      product: {
        _id: product.id || product._id,
        name: product.name || product.title, // Try both name and title
        description: product.description || '',
        category: product.category?.name || product.category || 'Uncategorized',
        images: [getProductImage(product)],
        normalPrice: product.normalPrice || product.price || 0,
        offerPrice: product.offerPrice || 0,
        wholesalePrice: product.wholesalePrice || 0,
        isBestSeller: product.isBestSeller || false,
        isNewArrival: product.isNewArrival || false,
        featured: product.featured || false,
        avgRating: product.avgRating || 0,
        totalRatings: product.totalRatings || 0,
      },
      variant: variant || product.variants?.[0] || null,
      addedAt: new Date().toISOString()
    };
    
    dispatch(addToWishlist(wishlistItem));
  };

  const removeItemFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const clearAllWishlist = () => {
    dispatch(clearWishlist());
  };

  const switchWishlistUser = (userId) => {
    dispatch(switchUserWishlist(userId)); // Use the correct action
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product._id === productId);
  };

  const getWishlistItem = (productId) => {
    return wishlistItems.find(item => item.product._id === productId);
  };

  // Improved helper function to get product image
  const getProductImage = (product) => {
    // Try multiple possible image sources
    if (product.image) return product.image;
    if (product.images?.[0]) return product.images[0];
    
    const firstVariant = product.variants?.[0];
    if (firstVariant?.variantImages?.length > 0) {
      return firstVariant.variantImages[0].imageUrl;
    }
    
    return "https://via.placeholder.com/300x300?text=No+Image";
  };

  return {
    wishlistItems,
    addItemToWishlist,
    removeItemFromWishlist,
    clearAllWishlist,
    isInWishlist,
    getWishlistItem,
    switchWishlistUser, // Return the correct function
    wishlistCount: wishlistItems.length
  };
};