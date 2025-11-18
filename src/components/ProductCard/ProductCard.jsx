// ProductCard.js
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../redux/slices/cartSlice";
import { useWishlist } from "../../hooks/useWishlist";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import ProductActions from "./ProductActions";
import { useProductCardStyles } from "./styles";
import VariantModal from "./VariantModal";
import { generateProductSlug } from "../../utils/slugify";
import ModalPortal from "./ModalPortal";

const ProductCard = ({ product, onCartUpdate }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const { 
    isInWishlist, 
    addItemToWishlist, 
    removeItemFromWishlist
  } = useWishlist();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const styles = useProductCardStyles();
  
  // Safe product data with fallbacks
  const safeProduct = product || {};
  const availableVariants = safeProduct.variants?.filter(variant => variant?.stock > 0) || [];
  const hasStock = availableVariants.length > 0;

  // Generate product slug with error handling
  const productSlug = generateProductSlug(safeProduct);

  const getProductImage = () => {
    const firstVariant = safeProduct.variants?.[0];
    if (firstVariant?.variantImages?.length > 0) {
      return firstVariant.variantImages[0].imageUrl;
    }
    return "https://via.placeholder.com/300x300?text=No+Image";
  };

  // Handle card click to navigate to product details
  const handleCardClick = (e) => {
    if (!safeProduct.id && !safeProduct._id) {
      console.error('Product missing ID, cannot navigate');
      return;
    }

    if (
      e.target.closest('button') || 
      e.target.closest('.wishlist-btn') ||
      e.target.closest('.add-to-cart-btn') ||
      e.target.closest('.variant-selector')
    ) {
      return;
    }
    
    navigate(`/collections/${productSlug}`);
  };

  // Handle wishlist click
  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (!safeProduct.id && !safeProduct._id) {
      console.error('Product missing ID, cannot add to wishlist');
      return;
    }

    setTogglingWishlist(true);
    try {
      const productId = safeProduct.id || safeProduct._id;
      if (isInWishlist(productId)) {
        removeItemFromWishlist(productId);
      } else {
        addItemToWishlist(safeProduct, availableVariants[0]);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setTogglingWishlist(false);
    }
  };

  // Handle add to cart click
  const handleAddToCartClick = () => {
    setShowVariantModal(true);
  };

  const addVariantToCart = async (variant, qty = quantity) => {
    if (!safeProduct.id && !safeProduct._id) {
      console.error('Product missing ID, cannot add to cart');
      return;
    }

    setAddingToCart(true);
    try {
      const cartItem = {
        product: {
          _id: safeProduct.id || safeProduct._id,
          name: safeProduct.name || 'Unknown Product',
          description: safeProduct.description || '',
          category: safeProduct.category?.name || safeProduct.category || 'Uncategorized',
          images: [getProductImage()],
          normalPrice: safeProduct.normalPrice || 0,
          offerPrice: safeProduct.offerPrice || 0,
          wholesalePrice: safeProduct.wholesalePrice || 0,
        },
        variant: {
          _id: variant.id,
          color: variant.color,
          size: variant.size,
          price: safeProduct.isWholesaleUser ? safeProduct.wholesalePrice : (safeProduct.offerPrice || safeProduct.normalPrice),
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
    if (variant?.stock > 0) {
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

  // Don't render if product is invalid
  if (!safeProduct || (!safeProduct.id && !safeProduct._id)) {
    console.warn('ProductCard: Invalid product data', safeProduct);
    return null;
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`flex flex-col shadow-2xl px-5 py-3 rounded-xl ${styles.cardBg} ${
          styles.theme === "dark" ? "shadow-gray-800" : ""
        } items-start text-left group cursor-pointer relative transition-all duration-300 hover:shadow-xl`}
      >
        <ProductImage 
          product={safeProduct}
          styles={styles}
          isInWishlist={isInWishlist(safeProduct.id || safeProduct._id)}
          user={user}
          togglingWishlist={togglingWishlist}
          onWishlistToggle={handleWishlistClick}
        />
        
        <ProductInfo 
          product={safeProduct}
          hasStock={hasStock}
          styles={styles}
        />

        <ProductActions
          product={safeProduct}
          hasStock={hasStock}
          availableVariants={availableVariants}
          addingToCart={addingToCart}
          onAddToCart={handleAddToCartClick}
          styles={styles}
        />
      </div>

      {showVariantModal && (
        <ModalPortal>
          <VariantModal
            product={safeProduct}
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
        </ModalPortal>
      )}
    </>
  );
};

export default ProductCard;