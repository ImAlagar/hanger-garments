import React, { memo } from "react";

const WishlistButton = memo(({ isInWishlist, user, togglingWishlist, onToggle, styles }) => {
  return (
    <button
      onClick={onToggle}
      disabled={togglingWishlist || !user}
      className={`absolute top-3 right-3 p-2 rounded-full ${styles.buttonBg} transition-all duration-200 z-10 ${
        isInWishlist ? "text-red-500" : styles.textColor
      } ${togglingWishlist || !user ? "opacity-50" : "hover:scale-110"}`}
      title={!user ? "Login to add to wishlist" : isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {togglingWishlist ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill={isInWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={isInWishlist ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
});

WishlistButton.displayName = 'WishlistButton';

export default WishlistButton;