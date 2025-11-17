import React from "react";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.variant.price * item.quantity);
  }, 0);

  // Redirect if not logged in or cart is empty
  React.useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }
  }, [user, cartItems, navigate]);

  if (!user || cartItems.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <div className="text-center">
          <p className={textColor}>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-6 ${bgColor} ${textColor}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping and Payment Information */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className={`border ${borderColor} rounded-lg p-6`}>
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address"
                  className={`w-full p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className={`w-full p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className={`border ${borderColor} rounded-lg p-6`}>
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="payment" defaultChecked />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="payment" />
                  <span>UPI Payment</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="payment" />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={`border ${borderColor} rounded-lg p-6 h-fit`}>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm opacity-75">
                      {item.variant.color} | {item.variant.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">₹{(item.variant.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className={`space-y-2 border-t ${borderColor} pt-4`}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => alert('Order placed successfully!')}
              className={`w-full py-3 rounded-lg font-semibold mt-6 ${
                isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
              } transition-colors`}
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;