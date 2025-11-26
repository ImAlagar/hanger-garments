// components/discount/VerticalAutoScrollBadge.js - UPDATED
import React from "react";
import { useQuantityDiscounts } from "../../hooks/useQuantityDiscounts";

const VerticalAutoScrollBadge = ({ product, variant, quantity, className = "" }) => {
  const { quantityTiers, loading, hasDiscounts } = useQuantityDiscounts(
    product,
    variant,
    quantity
  );

  // Show loading state briefly
  if (loading) {
    return (
      <div className={`relative h-[28px] overflow-hidden w-fit bg-gray-800 text-white text-[11px] px-3 py-1 rounded-lg border border-gray-700 ${className}`}>
        <div className="animate-pulse py-[3px] text-center">Loading offers...</div>
      </div>
    );
  }

  // Only show if we have discount tiers
  if (!hasDiscounts || quantityTiers.length === 0) {
    return null;
  }

  // Format tiers for display - show all discount tiers
  const tiers = quantityTiers.map(t => ({
    text: `Buy ${t.quantity} @ ₹${t.price}`,
    discount: t.discount,
    quantity: t.quantity,
    unitPrice: t.unitPrice
  }));

  // Don't show if no valid tiers
  if (tiers.length === 0) return null;

  return (
    <div className={`relative h-[28px] overflow-hidden w-fit bg-gradient-to-r from-gray-900 to-black text-white text-[11px] px-3 py-1 rounded-lg border border-gray-700 shadow-sm ${className}`}>
      <div className="animate-vertical-scroll-smooth">
        {tiers.map((tier, i) => (
          <div 
            key={i} 
            className="py-[3px] text-center font-medium leading-tight transition-opacity duration-300 flex items-center justify-center gap-1"
          >
            <span>{tier.text}</span>
            {tier.discount > 0 && (
              <span className="text-green-400 text-[10px]">
                ({tier.discount}% off)
              </span>
            )}
          </div>
        ))}
        
        {/* Duplicate for seamless loop */}
        {tiers.map((tier, i) => (
          <div 
            key={`dup_${i}`} 
            className="py-[3px] text-center font-medium leading-tight transition-opacity duration-300 flex items-center justify-center gap-1"
          >
            <span>{tier.text}</span>
            {tier.discount > 0 && (
              <span className="text-green-400 text-[10px]">
                ({tier.discount}% off)
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Gradient overlays for smooth edges */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default VerticalAutoScrollBadge;