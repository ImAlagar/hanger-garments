// utils/slugify.js
export const slugify = (text) => {
  if (!text) {
    console.warn('slugify: text is undefined or null');
    return 'unknown';
  }
  
  try {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  } catch (error) {
    console.error('Error in slugify:', error);
    return 'unknown';
  }
};

export const generateProductSlug = (product) => {
  if (!product) {
    console.warn('generateProductSlug: product is undefined');
    return 'unknown-product';
  }

  try {
    // Handle both original products and color-split products
    const name = product.name || product.title || `product-${product.id}`;
    const id = product.baseProductId || product.id || product._id || 'unknown';
    const color = product.color ? `-${slugify(product.color)}` : '';
    
    // Create slug from name and append ID for uniqueness
    const nameSlug = slugify(name);
    const idSlug = slugify(id.toString());
    
    return `${nameSlug}${color}-${idSlug}`;
  } catch (error) {
    console.error('Error generating product slug:', error);
    return 'unknown-product';
  }
};

// Alternative simpler version for just names
export const generateSlugFromName = (name) => {
  if (!name) {
    console.warn('generateSlugFromName: name is undefined');
    return 'unknown';
  }
  
  return slugify(name);
};