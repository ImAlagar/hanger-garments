// hooks/useQuantityDiscounts.js - FIXED VERSION
import { useState, useEffect, useMemo } from 'react';
import { useGetSubcategoriesWithQuantityPricingQuery } from '../redux/services/productService';

export const useQuantityDiscounts = (product, variant, currentQuantity = 1) => {
  const { data: subcategoriesData, isLoading } = useGetSubcategoriesWithQuantityPricingQuery();
  const [quantityTiers, setQuantityTiers] = useState([]);
  const [currentDiscount, setCurrentDiscount] = useState(null);

  // Clean price by removing currency symbols and converting to number
  const cleanPrice = (price) => {
    if (!price) return 0;
    
    // Handle string prices with currency symbols
    if (typeof price === 'string') {
      // Remove ₹, $, , (commas) and any other non-numeric characters except decimal point
      const cleaned = price.replace(/[^\d.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // Handle number prices directly
    return typeof price === 'number' ? price : 0;
  };

  // Get subcategory name from product - handle both string and object
  const getProductSubcategoryName = (product) => {
    if (!product?.subcategory) return null;
    
    // If subcategory is a string, return it directly
    if (typeof product.subcategory === 'string') {
      return product.subcategory;
    }
    
    // If subcategory is an object with name property
    if (product.subcategory?.name && typeof product.subcategory.name === 'string') {
      return product.subcategory.name;
    }
    
    // If subcategory is an object with other properties, try to find a string value
    if (typeof product.subcategory === 'object') {
      // Try common property names
      const possibleNames = ['name', 'title', 'value', 'subcategoryName'];
      for (const prop of possibleNames) {
        if (product.subcategory[prop] && typeof product.subcategory[prop] === 'string') {
          return product.subcategory[prop];
        }
      }
    }
    
    console.warn('⚠️ Could not extract subcategory name from:', product.subcategory);
    return null;
  };

  // Find the subcategory for the current product
  const productSubcategory = useMemo(() => {
    const subcategoryName = getProductSubcategoryName(product);
    
    if (!subcategoryName || !subcategoriesData?.data) {
      return null;
    }
    

    // Try to find by name match
    const foundSubcategory = subcategoriesData.data.find(
      subcat => subcat.name.toLowerCase() === subcategoryName.toLowerCase()
    );

    return foundSubcategory;
  }, [product?.subcategory, subcategoriesData]);

  // Calculate pricing based on subcategory quantity rules
  useEffect(() => {
    // Get base price and clean it
    const rawBasePrice = variant?.price || product?.price || product?.normalPrice;
    const basePrice = cleanPrice(rawBasePrice);
    
    if (!productSubcategory || !basePrice || basePrice === 0) {

      setQuantityTiers([]);
      setCurrentDiscount(null);
      return;
    }

    const quantityRules = productSubcategory.quantityPrices || [];
    


    // Sort rules by quantity
    const sortedRules = [...quantityRules]
      .filter(rule => rule.isActive)
      .sort((a, b) => a.quantity - b.quantity);

    if (sortedRules.length === 0) {
      setQuantityTiers([]);
      setCurrentDiscount(null);
      return;
    }

    // Calculate pricing for different quantities
    const quantities = [2, 3, 4];
    const pricingResults = [];

    quantities.forEach(qty => {
      // Find applicable rule for this quantity (highest quantity <= current qty)
      const applicableRule = [...sortedRules]
        .reverse()
        .find(rule => qty >= rule.quantity);

      if (applicableRule) {
        let finalPrice;
        let discountValue = 0;

        if (applicableRule.priceType === 'PERCENTAGE') {
          discountValue = applicableRule.value;
          finalPrice = (basePrice * qty) * (1 - discountValue / 100);
        } else if (applicableRule.priceType === 'FIXED') {
          discountValue = (applicableRule.value / (basePrice * qty)) * 100;
          finalPrice = (basePrice * qty) - applicableRule.value;
        } else {
          // No discount
          finalPrice = basePrice * qty;
        }

        pricingResults.push({
          quantity: qty,
          price: Math.round(finalPrice),
          unitPrice: Math.round(finalPrice / qty),
          discount: discountValue,
          originalPrice: basePrice * qty,
          rule: applicableRule
        });
      } else {
        // No discount rule applies
        pricingResults.push({
          quantity: qty,
          price: basePrice * qty,
          unitPrice: basePrice,
          discount: 0,
          originalPrice: basePrice * qty,
          rule: null
        });
      }
    });


    // Find current discount
    const currentPricing = pricingResults.find(r => r.quantity === currentQuantity);
    if (currentPricing?.discount > 0) {
      setCurrentDiscount(currentPricing.discount);
    } else {
      setCurrentDiscount(null);
    }

    // Create meaningful tiers - show ALL discount tiers
    const tiers = pricingResults.filter(tier => tier.discount > 0);
    setQuantityTiers(tiers);


  }, [productSubcategory, product?.price, variant?.price, product?.normalPrice, currentQuantity]);

  return {
    quantityTiers,
    currentDiscount,
    loading: isLoading,
    hasDiscounts: quantityTiers.length > 0,
    subcategory: productSubcategory
  };
};