// Wishlist.js
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";
import { useTheme } from "../../context/ThemeContext";
import CartSidebar from "../../components/layout/CartSidebar";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";

export default function Wishlist() {
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

  // Debug: Log wishlist items
  useEffect(() => {
    console.log('Wishlist Items:', wishlistItems);
    console.log('Wishlist Count:', wishlistCount);
  }, [wishlistItems, wishlistCount]);

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
    console.log(`Transforming wishlist item ${index}:`, wishlistItem);
    
    if (!wishlistItem?.product) {
      console.warn('Invalid wishlist item:', wishlistItem);
      return null;
    }

    const product = wishlistItem.product;
    
    // Debug the product structure
    console.log(`Product ${index} structure:`, {
      id: product._id || product.id,
      name: product.name,
      category: product.category,
      price: product.normalPrice
    });

    const transformedProduct = {
      id: product._id || product.id,
      _id: product._id || product.id,
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
      image: product.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image",
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
      isBestSeller: product.isBestSeller || false
    };

    console.log(`Transformed product ${index}:`, transformedProduct);
    return transformedProduct;
  };

  // Filter out invalid products
  const transformedProducts = wishlistItems
    .map(transformWishlistItem)
    .filter(product => product !== null && (product.id || product._id));

  console.log('Final transformed products:', transformedProducts);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-16">
          {transformedProducts.map((product) => (
            <div key={product.id || product._id} className="relative">
              <ProductCard 
                product={product} 
                onCartUpdate={handleCartUpdate}
              />
              {/* Remove from wishlist button */}
              <button
                onClick={() => handleRemoveFromWishlist(product.id || product._id)}
                className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors group wishlist-btn"
                title="Remove from wishlist"
              >
                <Heart 
                  size={20} 
                  className="text-red-500 fill-red-500 group-hover:scale-110 transition-transform" 
                />
              </button>
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