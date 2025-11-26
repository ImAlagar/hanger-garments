// components/discount/QuantityDiscountBadge.js
import React from 'react';
import { useQuantityDiscounts } from '../../hooks/useQuantityDiscounts';

const QuantityDiscountBadge = ({ product, variant, currentQuantity, className = "" }) => {
  const { quantityTiers, loading, hasDiscounts } = useQuantityDiscounts(
    product,
    variant,
    currentQuantity
  );

  if (loading) {
    return (
      <div className={`text-xs text-gray-500 animate-pulse ${className}`}>
        Loading offers...
      </div>
    );
  }

  if (!hasDiscounts || quantityTiers.length < 2) {
    return null;
  }

  // Filter out base tier (quantity 1) and get only discount tiers
  const discountTiers = quantityTiers.filter(tier => tier.quantity > 1);
  
  if (discountTiers.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {discountTiers.map((tier, index) => (
        <DiscountTierItem 
          key={tier.quantity}
          tier={tier}
          currentQuantity={currentQuantity}
          isLast={index === discountTiers.length - 1}
        />
      ))}
    </div>
  );
};

// Individual tier component
const DiscountTierItem = ({ tier, currentQuantity, isLast }) => {
  const isCurrentOrBetter = currentQuantity >= tier.quantity;
  
  return (
    <div className={`
      bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold 
      px-3 py-2 rounded-lg shadow-lg border border-green-300
      transition-all duration-200
      ${isCurrentOrBetter ? 'ring-2 ring-yellow-400 ring-opacity-70' : ''}
      ${!isLast ? 'mb-1' : ''}
    `}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <span className="font-bold">
            Buy {tier.quantity} @ ₹{Math.round(tier.price)}
          </span>
          {isCurrentOrBetter && (
            <span className="text-yellow-300 text-xs">✓ Eligible</span>
          )}
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs opacity-90">
            Save {tier.savings}% • ₹{Math.round(tier.unitPrice)}/piece
          </span>
          {tier.discount?.priceType === 'PERCENTAGE' && (
            <span className="text-xs bg-green-700 px-1 rounded">
              {tier.discount.value}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuantityDiscountBadge;