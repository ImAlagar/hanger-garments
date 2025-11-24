import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { removeCartItem, updateQuantity } from "../../redux/slices/cartSlice";

const Cart = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.variant.price * item.quantity);
  }, 0);

  const discount = cartItems.reduce((total, item) => {
    const originalPrice = item.product.normalPrice;
    const sellingPrice = item.variant.price;
    return total + ((originalPrice - sellingPrice) * item.quantity);
  }, 0);

  const total = subtotal;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem({ itemId }));
  };

  const handleProceedToBuy = () => {
    if (!user) {
      // Redirect to login with return url
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className={`min-h-screen py-12 px-6 ${bgColor} ${textColor}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Cart</h1>
          <div className="text-center py-12">
            <p className="text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate("/shop")}
              className={`px-6 py-2 rounded-lg ${
                isDark ? "bg-white text-black" : "bg-black text-white"
              } hover:opacity-80 transition-opacity`}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-6 ${bgColor} ${textColor}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cart</h1>
        
        <div className={`border-b ${borderColor} mb-6`}></div>

        {/* Cart Items */}
        <div className="space-y-6 mb-8">
          {cartItems.map((item) => (
            <div key={item.id} className={`border ${borderColor} rounded-lg p-4`}>
              <div className="flex gap-4">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className={subText}>
                    Color: {item.variant.color} | Size: {item.variant.size}
                  </p>
                  <p className="font-semibold mt-1">₹{item.variant.price}</p>
                  
                  {item.product.normalPrice > item.variant.price && (
                    <p className={subText}>
                      <span className="line-through">₹{item.product.normalPrice}</span>
                      <span className="text-green-500 ml-2">
                        {Math.round(((item.product.normalPrice - item.variant.price) / item.product.normalPrice) * 100)}% off
                      </span>
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 mb-2 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className={`w-8 h-8 rounded-full border ${borderColor} flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className={`w-8 h-8 rounded-full border ${borderColor} flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className={`border ${borderColor} rounded-lg p-6`}>
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className={`flex justify-between font-semibold text-lg pt-2 border-t ${borderColor}`}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToBuy}
            className={`w-full py-3 rounded-lg font-semibold ${
              isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
            } transition-colors`}
          >
            PROCEED TO BUY ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;