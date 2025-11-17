import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useGetProductBySlugQuery } from '../../redux/services/productService';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import CartSidebar from '../../components/layout/CartSidebar';
import RelatedProducts from './RelatedProducts';

const ProductDetailsPage = () => {
  const { productSlug } = useParams();
  const [productId, setProductId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  
  const isDark = theme === "dark";
  const userRole = user?.role;
  const isWholesaleUser = userRole === 'WHOLESALER';

  // Extract product ID from slug
  useEffect(() => {
    if (productSlug) {
      const parts = productSlug.split('-');
      const id = parts[parts.length - 1];
      setProductId(id);
    }
  }, [productSlug]);

  const { data: productResponse, isLoading, error } = useGetProductBySlugQuery(productId, {
    skip: !productId
  });

  const product = productResponse?.data || productResponse;

  // Set initial selected variant when product loads
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstAvailableVariant = product.variants.find(variant => variant.stock > 0) || product.variants[0];
      setSelectedVariant(firstAvailableVariant);
      setSelectedColor(firstAvailableVariant?.color);
      setSelectedSize(firstAvailableVariant?.size);
    }
  }, [product]);

  // Check if product is in wishlist
  const isInWishlist = wishlistItems.some(item => item.product._id === product?.id);

  // Get available colors and sizes
  const availableColors = [...new Set(product?.variants?.map(v => v.color).filter(Boolean))];
  const availableSizes = [...new Set(product?.variants?.map(v => v.size).filter(Boolean))];

  // Get variants for selected color
  const variantsForSelectedColor = product?.variants?.filter(v => v.color === selectedColor) || [];

  // Get available images for selected variant
  const variantImages = selectedVariant?.variantImages || [];
  const allProductImages = product?.variants?.flatMap(v => v.variantImages) || [];

  // Auth-based pricing logic
  const getProductPricing = () => {
    if (!product) return { displayPrice: 0, originalPrice: null, priceLabel: '' };

    let displayPrice;
    let originalPrice;
    let priceLabel = "";

    if (isWholesaleUser && product.wholesalePrice) {
      displayPrice = product.wholesalePrice;
      originalPrice = product.offerPrice || product.normalPrice;
      priceLabel = "Wholesale";
    } else if (product.offerPrice && product.offerPrice < product.normalPrice) {
      displayPrice = product.offerPrice;
      originalPrice = product.normalPrice;
      priceLabel = "Offer";
    } else {
      displayPrice = product.normalPrice;
      originalPrice = null;
      priceLabel = "";
    }

    return { displayPrice, originalPrice, priceLabel };
  };

  const { displayPrice, originalPrice, priceLabel } = getProductPricing();

  // Handle variant selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const variantForColor = variantsForSelectedColor.find(v => v.stock > 0) || variantsForSelectedColor[0];
    setSelectedVariant(variantForColor);
    setSelectedSize(variantForColor?.size);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const variant = variantsForSelectedColor.find(v => v.size === size);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setAddingToCart(true);
    try {
      const cartItem = {
        product: {
          _id: product.id,
          name: product.name,
          description: product.description,
          category: product.category?.name || product.category,
          images: selectedVariant.variantImages?.map(img => img.imageUrl) || [],
          normalPrice: product.normalPrice,
          offerPrice: product.offerPrice,
          wholesalePrice: product.wholesalePrice,
        },
        variant: {
          _id: selectedVariant.id,
          color: selectedVariant.color,
          size: selectedVariant.size,
          price: displayPrice,
          stock: selectedVariant.stock,
          sku: selectedVariant.sku,
        },
        quantity: quantity
      };
      
      dispatch(addToCart(cartItem));
      setShowCartSidebar(true);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!user) return;

    if (isInWishlist) {
      dispatch(removeFromWishlist({ productId: product.id }));
    } else {
      const wishlistItem = {
        product: {
          _id: product.id,
          name: product.name,
          description: product.description,
          category: product.category?.name || product.category,
          images: selectedVariant?.variantImages?.map(img => img.imageUrl) || [],
          normalPrice: product.normalPrice,
          offerPrice: product.offerPrice,
          wholesalePrice: product.wholesalePrice,
        },
        variant: selectedVariant || product.variants?.[0]
      };
      
      dispatch(addToWishlist(wishlistItem));
    }
  };

  // Stock status
  const isOutOfStock = selectedVariant?.stock === 0;
  const lowStock = selectedVariant?.stock > 0 && selectedVariant?.stock <= 10;

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-gray-300 h-8 rounded w-3/4"></div>
                <div className="bg-gray-300 h-6 rounded w-1/2"></div>
                <div className="bg-gray-300 h-20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-4">The product you're looking for doesn't exist.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a 
                href="/" 
                className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Home
              </a>
            </li>
            <li className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/</li>
            <li>
              <a 
                href="/shop" 
                className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Collections
              </a>
            </li>
            <li className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/</li>
            <li className={`${isDark ? 'text-gray-300' : 'text-gray-900'} font-medium`}>
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <img
                src={variantImages[activeImageIndex]?.imageUrl || allProductImages[0]?.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {variantImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {variantImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 ${
                      activeImageIndex === index 
                        ? 'border-blue-500' 
                        : isDark ? 'border-gray-600' : 'border-gray-300'
                    } overflow-hidden`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title and Category */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {product.category?.name || product.category}
              </p>
            </div>

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold">₹{displayPrice}</span>
                {originalPrice && (
                  <span className={`text-lg line-through ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ₹{originalPrice}
                  </span>
                )}
                {priceLabel && (
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    priceLabel === 'Wholesale' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {priceLabel}
                  </span>
                )}
              </div>
              {isWholesaleUser && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  🏷️ Special wholesale pricing applied
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <p className="text-red-600 font-medium">Out of Stock</p>
              ) : lowStock ? (
                <p className="text-orange-600 font-medium">
                  Only {selectedVariant.stock} left in stock!
                </p>
              ) : (
                <p className="text-green-600 font-medium">In Stock</p>
              )}
            </div>

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Color: {selectedColor}</h3>
                <div className="flex space-x-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 py-2 rounded border ${
                        selectedColor === color
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : isDark 
                            ? 'border-gray-600 bg-gray-800 text-gray-300' 
                            : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Size: {selectedSize}</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => {
                    const variant = variantsForSelectedColor.find(v => v.size === size);
                    const isAvailable = variant?.stock > 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && handleSizeSelect(size)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded border ${
                          selectedSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : !isAvailable
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isDark 
                                ? 'border-gray-600 bg-gray-800 text-gray-300' 
                                : 'border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-semibold">Quantity:</label>
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`px-3 py-1 ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedVariant && quantity >= selectedVariant.stock}
                    className={`px-3 py-1 ${
                      (selectedVariant && quantity >= selectedVariant.stock)
                        ? 'bg-gray-300 cursor-not-allowed'
                        : isDark 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold ${
                    isOutOfStock || addingToCart
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {addingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-lg border ${
                    isInWishlist
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : isDark
                        ? 'bg-gray-800 border-gray-600 text-gray-300'
                        : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  {isInWishlist ? '❤️' : '🤍'}
                </button>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            {product.productDetails && product.productDetails.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <div className="space-y-2">
                  {product.productDetails.map(detail => (
                    <div key={detail.id}>
                      <strong>{detail.title}:</strong>
                      <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {detail.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          currentProduct={product}
          category={product.category?.name || product.category}
        />

        {/* Cart Sidebar */}
        <CartSidebar 
          isOpen={showCartSidebar} 
          onClose={() => setShowCartSidebar(false)} 
        />
      </div>
    </div>
  );
};

export default ProductDetailsPage;