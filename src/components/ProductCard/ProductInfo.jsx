import React, { useState } from "react";

const ProductInfo = ({ product, hasStock, styles }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const stockStatus = hasStock ? "In Stock" : "Out of Stock";
  const stockColor = hasStock ? "text-green-500" : "text-red-500";
  
  
  return (
    <>
      <p className={`${stockColor} font-instrument text-sm mt-2`}>
        {stockStatus}
      </p>
      
      <h3 className={` ${styles.textColor}
        text-gray-800 font-italiana tracking-widest font-semibold 
        text-base lg:text-lg mt-1 leading-tight
        transition-all duration-200
        ${isExpanded 
          ? '' 
          : 'truncate max-w-[200px]'
        }
      `}>
        {product.title}
      </h3>
    
        
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <p className={`${styles.textColor} font-medium font-instrument tracking-widest`}>
          {product.isWholesaleUser 
            ? `₹${product.wholesalePrice}` 
            : product.offerPrice 
              ? `₹${product.offerPrice}`
              : `₹${product.normalPrice}`
          }
        </p>
        
        {product.priceLabel && (
          <span className={`text-xs px-1 py-0.5 rounded ${
            product.isWholesaleUser 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {product.priceLabel}
          </span>
        )}
        
        {!product.isWholesaleUser && product.offerPrice && product.offerPrice < product.normalPrice && (
          <p className={`${styles.subText} line-through text-sm`}>
            ₹{product.normalPrice}
          </p>
        )}
      </div>
    </>
  );
};

export default ProductInfo;