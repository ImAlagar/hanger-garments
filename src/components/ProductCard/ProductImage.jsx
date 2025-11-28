import React, { useState, useEffect, useCallback, memo } from "react";
import WishlistButton from "./WishlistButton";
import placeholderimage from "../../assets/images/placeholder.jpg"


const ProductImage = memo(({ product, styles, isInWishlist, user, togglingWishlist, onWishlistToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Memoized image processing
  const { displayImages, hoverImages } = React.useMemo(() => {
    const firstVariant = product.variants?.[0];
    const variantImages = firstVariant?.variantImages || [];
    
    const primaryImages = variantImages.filter(img => img.isPrimary);
    const secondaryImages = variantImages.filter(img => !img.isPrimary);
    
    return {
      displayImages: primaryImages.length > 0 ? primaryImages : variantImages,
      hoverImages: secondaryImages.length > 0 ? secondaryImages : variantImages
    };
  }, [product.variants]);

  // Memoized current image URL
  const currentImage = React.useMemo(() => {
    if (imageError) {
      return placeholderimage;
    }
    const images = isHovered ? hoverImages : displayImages;
    return images[currentImageIndex]?.imageUrl || placeholderimage;
  }, [isHovered, hoverImages, displayImages, currentImageIndex, imageError]);

  // Optimized auto-cycle effect
  useEffect(() => {
    if (!isHovered || hoverImages.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % hoverImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered, hoverImages.length]);

  const discountPercentage = product.offerPrice && product.normalPrice 
    ? Math.round(((product.normalPrice - product.offerPrice) / product.normalPrice) * 100)
    : 0;

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div className="relative w-full">
      {/* Discount Badge */}
      {!product.isWholesaleUser && product.offerPrice && product.offerPrice < product.normalPrice && (
        <div className="absolute bottom-3 right-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
          {discountPercentage}% OFF
        </div>
      )}

      {/* Wholesale Badge */}
      {product.isWholesaleUser && (
        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
          WHOLESALE
        </div>
      )}

      {/* Wishlist Button */}
      <WishlistButton
        isInWishlist={isInWishlist}
        user={user}
        togglingWishlist={togglingWishlist}
        onToggle={onWishlistToggle}
        styles={styles}
      />

      {/* Optimized Image Container */}
      <div 
        className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        <img
          src={currentImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
});

ProductImage.displayName = 'ProductImage';

export default ProductImage;