// components/discount/EnhancedQuantityDiscountBadge.js
import React from 'react';
import { useQuantityDiscounts } from '../../hooks/useQuantityDiscounts';
import { FiTag, FiShoppingCart, FiArrowUp } from 'react-icons/fi';

const EnhancedQuantityDiscountBadge = ({ product, variant, currentQuantity, className = "" }) => {
  const { quantityTiers, loading, hasDiscounts } = useQuantityDiscounts(
    product,
    variant,
    currentQuantity
  );

  if (loading) {
    return (
      <div className={`flex items-center text-xs text-gray-500 animate-pulse ${className}`}>
        <FiTag className="w-3 h-3 mr-1" />
        Loading bulk offers...
      </div>
    );
  }

  if (!hasDiscounts || quantityTiers.length < 2) {
    return null;
  }

  const discountTiers = quantityTiers.filter(tier => tier.quantity > 1);
  const nextTier = discountTiers.find(tier => tier.quantity > currentQuantity);
  const activeTier = discountTiers.find(tier => currentQuantity >= tier.quantity);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Active Tier Badge */}
      {activeTier && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg border border-yellow-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiShoppingCart className="w-3 h-3 mr-1" />
              <span>Active: Buy {activeTier.quantity} @ ₹{Math.round(activeTier.price)}</span>
            </div>
            <span className="bg-yellow-700 px-2 py-1 rounded text-xs">
              Save {activeTier.savings}%
            </span>
          </div>
        </div>
      )}

      {/* Next Available Tiers */}
      {discountTiers
        .filter(tier => !activeTier || tier.quantity > activeTier.quantity)
        .map((tier) => (
          <div
            key={tier.quantity}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border border-green-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiArrowUp className="w-3 h-3 mr-1" />
                <span>Buy {tier.quantity} @ ₹{Math.round(tier.price)}</span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default EnhancedQuantityDiscountBadge;