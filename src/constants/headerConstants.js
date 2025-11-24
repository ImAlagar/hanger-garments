export const topbarMessages = [
    "🚚 Free shipping for all orders",
    "✨ New Arrivals Available", 
    "💳 Secure Payment & Accept all cards",
  "⭐ Premium Quality Cotton T-shirts!",
  "💫 Custom Printing Available - Create Your Style!"
];

export const navItems = [
  { name: "Mens", path: "/mens" },
  { name: "Womens", path: "/womens" },
  { name: "Kids", path: "/kids" },
  { name: "Unisex", path: "/unisex" },
  { name: "Customised Design", path: "/customiseddesign" },
  { name: "Exclusive Pre Order", path: "/exclusivepreorder" },

];

export const tshirtCategories = [
  "Men",
  "Women", 
  "Kids",
  "Unisex",
];

export const motionVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
  dropdown: {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } },
  },
  mobileMenu: {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: "auto", transition: { duration: 0.4 } },
  },
  search: {
    hidden: { opacity: 0, scale: 0.8, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
  },
  topbar: {
    visible: { 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hidden: { 
      y: -100,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  }
};