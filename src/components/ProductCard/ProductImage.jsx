import { useState, useEffect } from "react";
import WishlistButton from "./WishlistButton";

const ProductImage = ({ product, styles, isInWishlist, user, togglingWishlist, onWishlistToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all images for the first variant
  const firstVariant = product.variants?.[0];
  const variantImages = firstVariant?.variantImages || [];
  
  // Separate primary and secondary images
  const primaryImages = variantImages.filter(img => img.isPrimary);
  const secondaryImages = variantImages.filter(img => !img.isPrimary);
  
  // Use primary images by default, fallback to all images
  const displayImages = primaryImages.length > 0 ? primaryImages : variantImages;
  const hoverImages = secondaryImages.length > 0 ? secondaryImages : variantImages;

  // Get the current image to display
  const getCurrentImage = () => {
    const images = isHovered ? hoverImages : displayImages;
    return images[currentImageIndex]?.imageUrl || "https://via.placeholder.com/300x300?text=No+Image";
  };

  // Auto-cycle through images when hovered
  useEffect(() => {
    let interval;
    if (isHovered && hoverImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % hoverImages.length);
      }, 1000); // Change image every second
    } else {
      setCurrentImageIndex(0); // Reset to first image when not hovered
    }
    
    return () => clearInterval(interval);
  }, [isHovered, hoverImages.length]);

  const discountPercentage = product.offerPrice && product.normalPrice 
    ? Math.round(((product.normalPrice - product.offerPrice) / product.normalPrice) * 100)
    : 0;

  return (
    <>
      {!product.isWholesaleUser && product.offerPrice && product.offerPrice < product.normalPrice && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
          {discountPercentage}% OFF
        </div>
      )}

      {product.isWholesaleUser && (
        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
          WHOLESALE
        </div>
      )}

      <WishlistButton
        isInWishlist={isInWishlist}
        user={user}
        togglingWishlist={togglingWishlist}
        onToggle={onWishlistToggle}
        styles={styles}
      />

      <div 
        className="overflow-hidden rounded-lg w-full relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={getCurrentImage()}
          alt={product.name}
          className="w-full aspect-square object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
          }}
        />
        

      </div>
    </>
  );
};

export default ProductImage;