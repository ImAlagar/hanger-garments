import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiCheck, FiChevronDown, FiChevronUp, FiHome, FiShoppingBag, FiList } from "react-icons/fi";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [orderDetails, setOrderDetails] = useState(null);
  const [showItems, setShowItems] = useState(true);

  useEffect(() => {
    const stateOrder = location.state;
    const storedOrder = localStorage.getItem("lastOrder");

    if (stateOrder) {
      setOrderDetails(stateOrder);
    } else if (storedOrder) {
      setOrderDetails(JSON.parse(storedOrder));
    } else {
      navigate("/");
    }
  }, [navigate, location]);

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-8 text-center border-b border-green-100">
            <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm border border-green-200 mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <FiCheck className="text-white" size={32} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-green-600 font-medium">
              Thank you for your purchase
            </p>
          </div>

          {/* Order Summary */}
          <div className="p-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Order Number</p>
                <p className="text-lg font-semibold text-gray-900">
                  {orderDetails.orderNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Estimated Delivery</p>
                <p className="text-lg font-semibold text-gray-900">
                  {orderDetails.deliveryDate || "3–5 business days"}
                </p>
              </div>
            </div>

            {/* Items Section */}
            <div className="border border-gray-200 rounded-lg">
              {/* Header */}
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowItems(!showItems)}
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    Order Items
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {orderDetails.items?.length || 1} item(s)
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showItems ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </button>
              </div>

              {/* Items List */}
              {showItems && (
                <div className="border-t border-gray-200">
                  {orderDetails.items?.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 flex gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 mt-2">
                          {item.variant?.color && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-500">Color:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {item.variant.color}
                              </span>
                            </div>
                          )}
                          
                          {item.variant?.size && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-500">Size:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {item.variant.size}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-lg font-semibold text-gray-900">
                            ₹{item.variant?.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigate("/user/orders")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
              >
                <FiList size={18} />
                View Order Details
              </button>

              <button
                onClick={() => navigate("/shop")}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors border border-gray-300 hover:border-gray-400"
              >
                <FiShoppingBag size={18} />
                Continue Shopping
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <FiHome size={16} />
                Back to Homepage
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? <a href="#" className="text-green-600 hover:text-green-700 font-medium">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;