import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useGetRelatedProductsQuery } from '../../redux/services/productService';
import ProductCard from '../../components/ProductCard/ProductCard';
import CartSidebar from '../../components/layout/CartSidebar';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const RelatedProducts = ({ currentProduct, category }) => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);

  const isDark = theme === 'dark';
  const isWholesaleUser = user?.role === 'WHOLESALER';

  const scrollContainerRef = useRef(null);
  const autoScrollRef = useRef(null);

  const [isPaused, setIsPaused] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  const { data, isLoading, error } = useGetRelatedProductsQuery(
    {
      category,
      excludeProductId: currentProduct?.id,
    },
    { skip: !category }
  );

  /* -------------------- PRICE NORMALIZER -------------------- */
  const getPriceDetails = (product) => {
    const normalPrice =
      product.normalPrice ??
      product.price ??
      product.mrp ??
      product.sellingPrice ??
      0;

    const offerPrice = product.offerPrice ?? product.offer_price ?? null;
    const wholesalePrice = product.wholesalePrice ?? product.wholesale_price ?? null;

    return { normalPrice, offerPrice, wholesalePrice };
  };

  /* -------------------- PRODUCT TRANSFORM -------------------- */
  const splitProductsByColor = (apiProduct) => {
    if (!apiProduct || !apiProduct.variants) return [];
    
    const colorGroups = {};
    
    // Group variants by color
    apiProduct.variants.forEach(variant => {
      const color = variant.color || 'Default';
      if (!colorGroups[color]) {
        colorGroups[color] = {
          variants: [],
          variantImages: []
        };
      }
      colorGroups[color].variants.push(variant);
      
      // Collect unique images for this color
      if (variant.variantImages) {
        variant.variantImages.forEach(img => {
          if (!colorGroups[color].variantImages.some(existing => existing.imageUrl === img.imageUrl)) {
            colorGroups[color].variantImages.push(img);
          }
        });
      }
    });
    
    // Create separate product objects for each color
    return Object.entries(colorGroups).map(([color, colorData]) => {
      const primaryImage = colorData.variantImages.find(img => img.isPrimary)?.imageUrl || 
                          colorData.variantImages[0]?.imageUrl;
      
      // Calculate if this color has any stock
      const hasStock = colorData.variants.some(variant => variant.stock > 0);
      
      // Get available sizes for this color
      const availableSizes = colorData.variants
        .filter(variant => variant.stock > 0)
        .map(variant => variant.size);
      
      // Format price with currency symbol
      const formatPrice = (price) => {
        if (price === undefined || price === null) return "₹0";
        return `₹${price}`;
      };

      // Determine which price to show based on user role
      let displayPrice;
      let originalPrice;
      let priceLabel = "";

      if (isWholesaleUser && apiProduct.wholesalePrice) {
        displayPrice = formatPrice(apiProduct.wholesalePrice);
        originalPrice = apiProduct.offerPrice || apiProduct.normalPrice;
        priceLabel = "Wholesale";
      } else if (apiProduct.offerPrice && apiProduct.offerPrice < apiProduct.normalPrice) {
        displayPrice = formatPrice(apiProduct.offerPrice);
        originalPrice = apiProduct.normalPrice;
        priceLabel = "Offer";
      } else {
        displayPrice = formatPrice(apiProduct.normalPrice);
        originalPrice = null;
        priceLabel = "";
      }

      return {
        id: `${apiProduct.id || apiProduct._id}-${color}`,
        baseProductId: apiProduct.id || apiProduct._id,
        title: apiProduct.name || apiProduct.title || "Unnamed Product",
        displayTitle: `${apiProduct.name || apiProduct.title || "Unnamed Product"} (${color})`,
        color: color,
        category: apiProduct.category?.name || apiProduct.category || "Uncategorized",
        price: displayPrice,
        originalPrice: originalPrice,
        priceLabel: priceLabel,
        image: primaryImage,
        variants: colorData.variants,
        variantImages: colorData.variantImages,
        inStock: hasStock,
        availableSizes: availableSizes,
        normalPrice: apiProduct.normalPrice,
        offerPrice: apiProduct.offerPrice,
        wholesalePrice: apiProduct.wholesalePrice,
        avgRating: apiProduct.avgRating || 0,
        totalRatings: apiProduct.totalRatings || 0,
        isWholesaleUser: isWholesaleUser,
        isFeatured: apiProduct.featured || false,
        isNewArrival: apiProduct.isNewArrival || false,
        isBestSeller: apiProduct.isBestSeller || false,
        productDetails: apiProduct.productDetails || [],
        description: apiProduct.description,
        subcategory: apiProduct.subcategory,
        ratings: apiProduct.ratings || [],
        selectedColor: color // Crucial for passing to details page
      };
    });
  };

  /* -------------------- API RESPONSE NORMALIZER -------------------- */
  const getProductsArray = (apiData) => {
    if (!apiData) return [];
    if (Array.isArray(apiData)) return apiData;
    if (Array.isArray(apiData.products)) return apiData.products;
    if (Array.isArray(apiData.data?.products)) return apiData.data.products;
    if (Array.isArray(apiData.data)) return apiData.data;
    return [];
  };

  const productsArray = getProductsArray(data);

  const relatedProducts = productsArray
    .filter((p) => p.id !== currentProduct?.id && p._id !== currentProduct?.id)
    .flatMap(splitProductsByColor);

  /* -------------------- SCROLLER LOGIC -------------------- */
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (isPaused || relatedProducts.length === 0) return;

    autoScrollRef.current = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;

      container.scrollTo({
        left: isAtEnd ? 0 : container.scrollLeft + container.clientWidth,
        behavior: 'smooth',
      });
    }, 4000);

    return () => clearInterval(autoScrollRef.current);
  }, [isPaused, relatedProducts.length]);

  /* -------------------- UI STATES -------------------- */
  if (isLoading || error || relatedProducts.length === 0) return null;

  return (
    <section className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              SIMILAR PRODUCTS
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Explore products you may like
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsPaused((p) => !p)}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>

            <button onClick={() => scroll('left')}>
              <ChevronLeft />
            </button>

            <button onClick={() => scroll('right')}>
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* SCROLLER */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {relatedProducts.map((product, index) => (
            <div key={`${product.id}-${index}`} className="flex-shrink-0 w-64 md:w-72 lg:w-80">
              <ProductCard
                product={product}
                onCartUpdate={() => setShowCartSidebar(true)}
                selectedColor={product.selectedColor}
              />
            </div>
          ))}
        </div>

        {/* Wholesale Badge */}
        {isWholesaleUser && (
          <div className="text-center mt-8">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700">
              🏷️ Special wholesale prices for you
            </span>
          </div>
        )}
      </div>

      <CartSidebar isOpen={showCartSidebar} onClose={() => setShowCartSidebar(false)} />
    </section>
  );
};

export default RelatedProducts;
