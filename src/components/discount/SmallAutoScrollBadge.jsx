import React from "react";
import { useQuantityDiscounts } from "../../hooks/useQuantityDiscounts";

const SmallAutoScrollBadge = ({ product, variant, quantity }) => {
  const { quantityTiers, loading, hasDiscounts } = useQuantityDiscounts(
    product,
    variant,
    quantity
  );

  if (loading || !hasDiscounts) return null;

  const tiers = quantityTiers
    .filter(t => t.quantity > 1)
    .map(t => `Buy ${t.quantity} @ ₹${Math.round(t.price)}`);

  return (
    <div className="overflow-hidden whitespace-nowrap w-[120px] bg-black text-white text-[10px] px-2 py-1 rounded-md">
      <div className="animate-scroll inline-block">
        {tiers.join("   •   ")}   •   {tiers.join("   •   ")}
      </div>

      <style>
        {`
          .animate-scroll {
            display: inline-block;
            animation: scrollLeft 6s linear infinite;
          }
          @keyframes scrollLeft {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
};

export default SmallAutoScrollBadge;
