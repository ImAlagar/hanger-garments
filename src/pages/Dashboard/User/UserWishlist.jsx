import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useWishlist } from '../../../hooks/useWishlist';
import { useEffect, useState } from 'react';
import ProductCard from '../../../components/ProductCard/ProductCard';
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import CartSidebar from '../../../components/layout/CartSidebar';
import { useSelector } from 'react-redux';
import placeholderimage from "../../../assets/images/placeholder.jpg"


const UserWishlist = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { 
    wishlistItems, 
    clearAllWishlist, 
    removeItemFromWishlist,
    wishlistCount 
  } = useWishlist();

  const [showCartSidebar, setShowCartSidebar] = useState(false);


  // Dynamic styles based on theme
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-black" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-400" : "text-gray-600";

  // Cart update handler
  const handleCartUpdate = () => {
    setShowCartSidebar(true);
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = (productId) => {
    removeItemFromWishlist(productId);
  };

  // Transform wishlist items for ProductCard with better debugging
const transformWishlistItem = (wishlistItem, index) => {
  
  if (!wishlistItem?.product) {
    console.warn('Invalid wishlist item:', wishlistItem);
    return null;
  }

  const product = wishlistItem.product;
  
  // Get color from variant or product
  const color = wishlistItem.variant?.color || product.color || '';

  // Clean the ID - remove the color suffix if it exists
  const rawId = product.baseProductId || product._id || product.id;
  let cleanId = rawId;
  
  // Remove color from ID if it's appended
  if (color && rawId.endsWith(`-${color}`)) {
    cleanId = rawId.replace(`-${color}`, '');
  } else if (color && rawId.endsWith(`-${color.toLowerCase()}`)) {
    cleanId = rawId.replace(`-${color.toLowerCase()}`, '');
  } else if (color && rawId.endsWith(`-${color.toUpperCase()}`)) {
    cleanId = rawId.replace(`-${color.toUpperCase()}`, '');
  }


  const transformedProduct = {
    id: cleanId, // Use the cleaned ID
    _id: cleanId, // Use the cleaned ID
    name: product.name || 'Unknown Product',
    title: product.name || 'Unknown Product',
    category: product.category || 'Uncategorized',
    price: `₹${product.normalPrice || 0}`,
    originalPrice: product.offerPrice && product.normalPrice && product.offerPrice < product.normalPrice 
      ? `₹${product.normalPrice}` 
      : null,
    priceLabel: product.offerPrice && product.normalPrice && product.offerPrice < product.normalPrice 
      ? "Offer" 
      : "",
    image: product.images?.[0] || placeholderimage,
    variants: wishlistItem.variant ? [wishlistItem.variant] : [],
    inStock: wishlistItem.variant?.stock > 0 || false,
    normalPrice: product.normalPrice || 0,
    offerPrice: product.offerPrice || 0,
    wholesalePrice: product.wholesalePrice || 0,
    isWholesaleUser: user?.role === 'WHOLESALER',
    avgRating: product.avgRating || 0,
    totalRatings: product.totalRatings || 0,
    isFeatured: product.featured || false,
    isNewArrival: product.isNewArrival || false,
    isBestSeller: product.isBestSeller || false,
    // Add color property for correct URL generation
    color: color,
    // Use the cleaned base product ID
    baseProductId: cleanId
  };

  return transformedProduct;
};

  // Filter out invalid products
  const transformedProducts = wishlistItems
    .map(transformWishlistItem)
    .filter(product => product !== null && (product.id || product._id));


  return (
    <section className={`py-12 transition-colors duration-500 ${bgColor} min-h-screen`}>
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className={`text-4xl md:text-5xl font-italiana tracking-widest font-bold ${textColor}`}>
          MY WISHLIST
        </h2>
        <div className="w-20 h-[2px] bg-red-500 mx-auto mt-2"></div>
        
        {/* Wishlist Stats */}
        <div className="mt-4 flex justify-center items-center gap-6">
          <p className={`${textColor} text-lg`}>
            {transformedProducts.length} {transformedProducts.length === 1 ? 'item' : 'items'}
          </p>
          {transformedProducts.length > 0 && (
            <button
              onClick={clearAllWishlist}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {transformedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-col-4 gap-8 px-6 md:px-16">
          {transformedProducts.map((product) => (
            <div key={product.id || product._id} className="relative">
              <ProductCard 
                product={product} 
                onCartUpdate={handleCartUpdate}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <Heart size={64} className="text-gray-300" />
          </div>
          <p className={`${textColor} text-xl mb-2`}>
            {wishlistCount > 0 ? 'Some wishlist items could not be loaded' : 'Your wishlist is empty'}
          </p>
          <p className={`${subText} text-sm mb-6`}>
            {wishlistCount > 0 
              ? 'There might be issues with some products in your wishlist'
              : 'Start adding products you love to your wishlist'
            }
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ShoppingBag size={18} />
            Browse Products
          </button>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
    </section>
  );
}

export default UserWishlist