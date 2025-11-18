export const slugify = (text) => {
  if (!text) {
    console.warn('slugify: text is undefined or null');
    return 'unknown-product';
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
    return 'unknown-product';
  }
};

export const generateProductSlug = (product) => {
  if (!product) {
    console.warn('generateProductSlug: product is undefined');
    return 'unknown-product';
  }

  try {
    // Use product name or fallback to ID
    const name = product.name || product.title || `product-${product.id}`;
    const id = product.id || product._id || 'unknown';
    
    // Create slug from name and append ID for uniqueness
    const nameSlug = slugify(name);
    const idSlug = slugify(id.toString());
    
    return `${nameSlug}-${idSlug}`;
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