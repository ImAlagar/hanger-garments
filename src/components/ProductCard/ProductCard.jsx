import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../../redux/slices/wishlistSlice";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import ProductActions from "./ProductActions";
import { useProductCardStyles } from "./styles";
import VariantModal from "./VariantModal";

const ProductCard = ({ product, onCartUpdate }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  
  const styles = useProductCardStyles();
  const availableVariants = product.variants?.filter(variant => variant.stock > 0) || [];
  const hasStock = availableVariants.length > 0;
  const isInWishlist = wishlistItems.some(item => item.product._id === product.id);

  const getProductImage = () => {
    const firstVariant = product.variants?.[0];
    if (firstVariant?.variantImages?.length > 0) {
      return firstVariant.variantImages[0].imageUrl;
    }
    return "https://via.placeholder.com/300x300?text=No+Image";
  };

  const handleWishlistToggle = async () => {
    if (!user) return;

    setTogglingWishlist(true);
    try {
      if (isInWishlist) {
        dispatch(removeFromWishlist({ productId: product.id }));
      } else {
        const wishlistItem = {
          product: {
            _id: product.id,
            name: product.name,
            description: product.description,
            category: product.category?.name || product.category,
            images: [getProductImage()],
            normalPrice: product.normalPrice,
            offerPrice: product.offerPrice,
            wholesalePrice: product.wholesalePrice,
            isBestSeller: product.isBestSeller,
            isNewArrival: product.isNewArrival,
            featured: product.featured,
          },
          variant: availableVariants[0] || null
        };
        
        dispatch(addToWishlist(wishlistItem));
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setTogglingWishlist(false);
    }
  };

  const addVariantToCart = async (variant, qty = quantity) => {
    setAddingToCart(true);
    try {
      const cartItem = {
        product: {
          _id: product.id,
          name: product.name,
          description: product.description,
          category: product.category?.name || product.category,
          images: [getProductImage()],
          normalPrice: product.normalPrice,
          offerPrice: product.offerPrice,
          wholesalePrice: product.wholesalePrice,
        },
        variant: {
          _id: variant.id,
          color: variant.color,
          size: variant.size,
          price: product.isWholesaleUser ? product.wholesalePrice : (product.offerPrice || product.normalPrice),
          stock: variant.stock,
          sku: variant.sku,
        },
        quantity: qty
      };
      
      dispatch(addToCart(cartItem));
      
      // Close modal
      setShowVariantModal(false);
      setSelectedVariant(null);
      setQuantity(1);
      
      // Trigger cart sidebar opening
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleVariantSelect = (variant) => {
    if (variant.stock > 0) {
      setSelectedVariant(variant);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (selectedVariant && newQuantity > selectedVariant.stock) return;
    setQuantity(newQuantity);
  };

  const closeModal = () => {
    setShowVariantModal(false);
    setSelectedVariant(null);
    setQuantity(1);
  };


  return (
    <>
      <div
        className={`flex flex-col shadow-2xl px-5 py-3 rounded-xl ${styles.cardBg} ${
          styles.theme === "dark" ? "shadow-gray-800" : ""
        } items-start text-left group cursor-pointer relative transition-all duration-300 hover:shadow-xl`}
      >
        <ProductImage 
          product={product}
          styles={styles}
          isInWishlist={isInWishlist}
          user={user}
          togglingWishlist={togglingWishlist}
          onWishlistToggle={handleWishlistToggle}
        />
        
        <ProductInfo 
          product={product}
          hasStock={hasStock}
          styles={styles}
        />

        <ProductActions
          product={product}
          hasStock={hasStock}
          availableVariants={availableVariants}
          addingToCart={addingToCart}
          onAddToCart={() => setShowVariantModal(true)}
          styles={styles}
        />
      </div>

      {showVariantModal && (
        <VariantModal
          product={product}
          availableVariants={availableVariants}
          selectedVariant={selectedVariant}
          quantity={quantity}
          addingToCart={addingToCart}
          styles={styles}
          onClose={closeModal}
          onVariantSelect={handleVariantSelect}
          onQuantityChange={handleQuantityChange}
          onAddToCart={() => selectedVariant && addVariantToCart(selectedVariant, quantity)}
        />
      )}
    </>
  );
};

export default ProductCard;