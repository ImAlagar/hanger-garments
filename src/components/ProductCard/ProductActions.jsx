import React from "react";

const ProductActions = ({ 
  product, 
  hasStock, 
  availableVariants, 
  addingToCart, 
  onAddToCart,
  styles 
}) => {
  const handleAddToCart = async () => {
    if (!hasStock) return;

    if (availableVariants.length > 1) {
      onAddToCart();
      return;
    }

    if (availableVariants.length === 1) {
      onAddToCart();
      return;
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!hasStock || addingToCart}
      className={`w-full mt-3 py-2 px-4 rounded-lg font-instrument text-sm font-medium transition-all duration-200 relative overflow-hidden ${
        !hasStock
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : addingToCart
          ? "bg-gray-400 text-black cursor-not-allowed"
          : "bg-[#e4ce01] text-black hover:bg-[#dfd803] shadow-lg"
      }`}
    >
      {/* Shine effect overlay */}
      {hasStock && !addingToCart && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shine"></div>
        </div>
      )}
      
      {!hasStock ? (
        "Out of Stock"
      ) : addingToCart ? (
        <span className="flex items-center justify-center gap-2 relative z-10">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Adding...
        </span>
      ) : (
        <span className="relative z-10">Add to Cart</span>
      )}
    </button>
  );
};

export default ProductActions;