// utils/productUtils.js
export const getCleanProductId = (product) => {
  if (!product) return null;
  
  // Get the raw ID
  const rawId = product._id || product.id;
  if (!rawId) return null;
  
  
  // If ID contains a hyphen and looks like it has a color suffix
  if (rawId.includes('-')) {
    // Split by hyphen and check if the last part is a color name
    const parts = rawId.split('-');
    const lastPart = parts[parts.length - 1];
    
    // Common color names that might be appended
    const colorNames = ['Red', 'Orange', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Pink', 'Gray', 'Brown'];
    
    if (colorNames.includes(lastPart) || /^[A-Z][a-z]+$/.test(lastPart)) {
      // Remove the color suffix
      const cleanId = parts.slice(0, -1).join('-');
      return cleanId;
    }
  }
  
  return rawId;
};

export const getVariantId = (variant) => {
  if (!variant) return null;
  return variant._id || variant.id;
};