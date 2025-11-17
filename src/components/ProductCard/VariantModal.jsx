import React from "react";

const VariantModal = ({
  product,
  availableVariants,
  selectedVariant,
  quantity,
  styles,
  onClose,
  onVariantSelect,
  onQuantityChange,
  onAddToCart,
  addingToCart = false
}) => {
  const discountPercentage =
    product.offerPrice && product.normalPrice
      ? Math.round(
          ((product.normalPrice - product.offerPrice) / product.normalPrice) * 100
        )
      : 0;

  const getProductImage = () => {
    const firstVariant = product.variants?.[0];
    if (firstVariant?.variantImages?.length > 0) {
      return firstVariant.variantImages[0].imageUrl;
    }
    return "https://via.placeholder.com/300x300?text=No+Image";
  };

  return (
    <div
      className="
        fixed inset-0 bg-black/50 flex justify-center z-50
        items-end md:items-center 
        p-0 md:p-4 scrollbar-hide
      "
    >
      <div className={`
        ${styles.modalBg} 
        rounded-t-2xl md:rounded-lg 
        w-full max-w-xl 
        max-h-[85vh] 
        overflow-y-auto 
        shadow-lg 
        p-4 scrollbar-hide
      `}>
        {/* Header */}
        <div className={`flex justify-between items-center pb-4 border-b ${styles.isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold ${styles.modalText}`}>Add to Cart</h3>
          <button onClick={onClose} className={`p-2 rounded-xl text-xl hover:text-red-500 ${styles.modalText}`}>✕</button>
        </div>

        {/* Main Content */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">

          {/* IMAGE */}
          <div className="flex justify-center items-start">
            <img
              src={getProductImage()}
              alt={product.name}
              className="w-[160px] md:w-[200px] rounded-lg object-cover shadow"
            />
          </div>

          {/* DETAILS */}
          <div>
            <h2 className={`text-lg truncate font-semibold mb-1 ${styles.modalText}`}>{product.title}</h2>

            {/* Price */}
            <div className="flex items-center gap-2 mb-1">
              <p className={`text-xl font-bold ${styles.modalText}`}>₹{product.offerPrice || product.normalPrice}</p>

              {product.offerPrice &&
                product.offerPrice < product.normalPrice && (
                  <>
                    <p className={`line-through text-sm ${styles.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      ₹{product.normalPrice}
                    </p>
                    <span className={`font-semibold text-sm ${styles.discountText}`}>
                      ({discountPercentage}% off)
                    </span>
                  </>
                )}
            </div>

            <p className={`text-xs mb-4 ${styles.isDark ? 'text-gray-400' : 'text-gray-500'}`}>(Inclusive of all taxes)</p>

            {/* Size */}
            <h4 className={`font-semibold text-base mb-2 ${styles.modalText}`}>Select a Size</h4>

            <div className="grid grid-cols-6 gap-2 mb-4">
              {availableVariants.map((variant) => {
                const isAvailable = variant.stock > 0;
                const isSelected = selectedVariant?.id === variant.id;

                return (
                  <button
                    key={variant.id}
                    onClick={() => onVariantSelect(variant)}
                    disabled={!isAvailable}
                    className={`
                      py-2 border ${styles.modalText} rounded-lg text-sm font-medium 
                      transition
                      ${isSelected
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : `${styles.isDark ? 'border-gray-600 hover:border-white' : 'border-gray-400 hover:border-black'}`
                      }
                      ${!isAvailable ? "opacity-50 line-through" : ""}
                    `}
                  >
                    {variant.size}
                  </button>
                );
              })}
            </div>

            {/* Qty */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-base font-medium ${styles.modalText}`}>Qty:</span>

              <div className={`flex items-center border rounded-lg ${styles.isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                <button
                  onClick={() => onQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className={`px-3 py-1.5 border-r text-sm disabled:opacity-40 ${styles.isDark ? 'border-gray-600' : 'border-gray-300'} ${styles.modalText}`}
                >
                  -
                </button>

                <span className={`px-4 py-1.5 text-sm font-medium ${styles.modalText}`}>{quantity}</span>

                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  disabled={selectedVariant && quantity >= selectedVariant.stock}
                  className={`px-3 py-1.5 border-l text-sm disabled:opacity-40 ${styles.isDark ? 'border-gray-600' : 'border-gray-300'} ${styles.modalText}`}
                >
                  +
                </button>
              </div>
            </div>

            {/* ADD TO CART */}
            <button
            onClick={onAddToCart}
            disabled={!selectedVariant || addingToCart}
            className={`
                w-full py-2 rounded-lg text-sm font-semibold transition relative overflow-hidden
                ${
                !selectedVariant || addingToCart
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#e4ce01] hover:bg-[#dfd803] shadow-lg"
                }
            `}
            >
            {/* Shine effect overlay */}
            {(!selectedVariant || addingToCart) ? null : (
                <span className="
                absolute top-0 left-0 h-full w-1/2 
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                animate-shine
                "></span>
            )}
            
            {/* Button text */}
            <span className="relative z-10">
                {addingToCart ? "Adding..." : "ADD TO CART"}
            </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantModal;