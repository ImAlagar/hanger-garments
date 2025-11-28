import React, { useState, useCallback, lazy, Suspense, memo, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../redux/slices/cartSlice";
import { useWishlist } from "../../hooks/useWishlist";
import { useProductCardStyles } from "./styles";
import { generateProductSlug } from "../../utils/slugify";
import placeholderimage from "../../assets/images/placeholder.jpg"


// Lazy load heavy components
const ProductImage = lazy(() => import("./ProductImage"));
const ProductInfo = lazy(() => import("./ProductInfo"));
const ProductActions = lazy(() => import("./ProductActions"));
const VariantModal = lazy(() => import("./VariantModal"));
const ModalPortal = lazy(() => import("./ModalPortal"));
const VerticalAutoScrollBadge = lazy(() => import("../discount/VerticalAutoScrollBadge"));

// Loading components for lazy loading
const ProductImageLoader = () => (
  <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse"></div>
);

const ProductInfoLoader = () => (
  <div className="space-y-2 mt-2">
    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
  </div>
);

const ProductActionsLoader = () => (
  <div className="h-10 bg-gray-200 rounded-lg mt-3 animate-pulse"></div>
);

// Memoized product data processor
const processProductData = (product) => {
  if (!product) return null;
  
  const safeProduct = { ...product };
  const availableVariants = safeProduct.variants?.filter(variant => variant?.stock > 0) || [];
  const hasStock = availableVariants.length > 0;
  
  return {
    safeProduct,
    availableVariants,
    hasStock,
    productSlug: generateProductSlug(safeProduct)
  };
};

// Memoized cart item creator
const createCartItem = (product, variant, quantity) => {
  const getProductImages = () => {
    if (product.images?.length > 0) {
      const validImages = product.images.filter(img => 
        img && !img.includes('via.placeholder.com') && !img.includes('No+Image')
      );
      if (validImages.length > 0) return validImages;
    }
    
    if (variant?.image && !variant.image.includes('via.placeholder.com')) {
      return [variant.image];
    }
    
    if (product.image && !product.image.includes('via.placeholder.com')) {
      return [product.image];
    }
    
    return placeholderimage;
  };

  const calculatePrice = () => {
    if (variant?.price) return Number(variant.price);
    
    if (product.isWholesaleUser && product.wholesalePrice) {
      return Number(product.wholesalePrice);
    }
    if (product.offerPrice) {
      return Number(product.offerPrice);
    }
    if (product.normalPrice) {
      return Number(product.normalPrice);
    }
    
    return 0;
  };

  return {
    product: {
      _id: product.id || product._id,
      name: product.title || product.name || 'Unknown Product',
      description: product.description || '',
      category: product.category?.name || product.category || 'Uncategorized',
      images: getProductImages(),
      image: getProductImages()[0],
      normalPrice: Number(product.normalPrice) || 0,
      offerPrice: Number(product.offerPrice) || 0,
      wholesalePrice: Number(product.wholesalePrice) || 0,
    },
    variant: {
      _id: variant.id || `variant_${Date.now()}`,
      color: variant.color || product.color || 'N/A',
      size: variant.size || 'N/A',
      price: calculatePrice(),
      stock: variant.stock || 0,
      sku: variant.sku || '',
      image: variant.image || getProductImages()[0],
    },
    quantity: Math.max(1, Number(quantity) || 1)
  };
};

const ProductCard = memo(({ product, onCartUpdate }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [showDiscountBadge, setShowDiscountBadge] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const { 
    isInWishlist, 
    addItemToWishlist, 
    removeItemFromWishlist
  } = useWishlist();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const styles = useProductCardStyles();
  
  // Process product data with useMemo to prevent unnecessary recalculations
  const processedData = useMemo(() => processProductData(product), [product]);
  
  if (!processedData) {
    console.warn('ProductCard: Invalid product data', product);
    return null;
  }

  const { safeProduct, availableVariants, hasStock, productSlug } = processedData;

  // Memoized event handlers
  const handleMouseEnter = useCallback(() => {
    setShowDiscountBadge(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowDiscountBadge(false);
  }, []);

  const handleCardClick = useCallback((e) => {
    if (!safeProduct.id && !safeProduct._id) {
      console.error('Product missing ID, cannot navigate');
      return;
    }

    // Check if click was on interactive elements
    if (
      e.target.closest('button') || 
      e.target.closest('.wishlist-btn') ||
      e.target.closest('.add-to-cart-btn') ||
      e.target.closest('.variant-selector') ||
      e.target.closest('.discount-badge-container')
    ) {
      return;
    }
    
    navigate(`/collections/${productSlug}`, {
      state: {
        selectedColor: safeProduct.color,
        baseProductId: safeProduct.baseProductId
      }
    });
  }, [safeProduct, productSlug, navigate]);

  const handleWishlistClick = useCallback(async (e) => {
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
        await removeItemFromWishlist(productId);
      } else {
        await addItemToWishlist(safeProduct, availableVariants[0]);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setTogglingWishlist(false);
    }
  }, [user, safeProduct, availableVariants, isInWishlist, addItemToWishlist, removeItemFromWishlist, navigate]);

  const handleAddToCartClick = useCallback(() => {
    setShowVariantModal(true);
  }, []);

  const addVariantToCart = useCallback(async (variant, qty = quantity) => {
    if (!safeProduct.id && !safeProduct._id) {
      console.error('Product missing ID, cannot add to cart');
      return;
    }

    setAddingToCart(true);
    try {
      const cartItem = createCartItem(safeProduct, variant, qty);
      dispatch(addToCart(cartItem));
      
      setShowVariantModal(false);
      setSelectedVariant(null);
      setQuantity(1);
      
      onCartUpdate?.();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  }, [safeProduct, quantity, dispatch, onCartUpdate]);

  const handleVariantSelect = useCallback((variant) => {
    if (variant?.stock > 0) {
      setSelectedVariant(variant);
    }
  }, []);

  const handleQuantityChange = useCallback((newQuantity) => {
    if (newQuantity < 1) return;
    if (selectedVariant && newQuantity > selectedVariant.stock) return;
    setQuantity(newQuantity);
  }, [selectedVariant]);

  const closeModal = useCallback(() => {
    setShowVariantModal(false);
    setSelectedVariant(null);
    setQuantity(1);
  }, []);

  const handleModalAddToCart = useCallback(() => {
    if (selectedVariant) {
      addVariantToCart(selectedVariant, quantity);
    }
  }, [selectedVariant, quantity, addVariantToCart]);

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`flex flex-col shadow-2xl px-5 py-3 rounded-xl ${styles.cardBg} ${
          styles.theme === "dark" ? "shadow-gray-800" : ""
        } items-start text-left group cursor-pointer relative transition-all duration-300 hover:shadow-xl overflow-hidden`}
      >
        
        {/* Discount Badge */}
        <div className="absolute top-2 left-2 z-20">
          <Suspense fallback={<div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>}>
            <VerticalAutoScrollBadge
              product={safeProduct}
              variant={safeProduct.variants?.[0]}
              quantity={quantity}
            />
          </Suspense>
        </div>

        {/* Product Image with Lazy Loading */}
        <Suspense fallback={<ProductImageLoader />}>
          <ProductImage 
            product={safeProduct}
            styles={styles}
            isInWishlist={isInWishlist(safeProduct.id || safeProduct._id)}
            user={user}
            togglingWishlist={togglingWishlist}
            onWishlistToggle={handleWishlistClick}
          />
        </Suspense>
        
        {/* Product Info with Lazy Loading */}
        <Suspense fallback={<ProductInfoLoader />}>
          <ProductInfo 
            product={safeProduct}
            hasStock={hasStock}
            styles={styles}
          />
        </Suspense>

        {/* Product Actions with Lazy Loading */}
        <Suspense fallback={<ProductActionsLoader />}>
          <ProductActions
            product={safeProduct}
            hasStock={hasStock}
            availableVariants={availableVariants}
            addingToCart={addingToCart}
            onAddToCart={handleAddToCartClick}
            styles={styles}
          />
        </Suspense>
      </div>

      {/* Modal with Lazy Loading */}
      {showVariantModal && (
        <Suspense fallback={null}>
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
              onAddToCart={handleModalAddToCart}
            />
          </ModalPortal>
        </Suspense>
      )}
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;