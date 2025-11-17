import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FaStar, FaMinus, FaPlus } from "react-icons/fa";

export default function ProductDetails() {
  const { theme } = useTheme();
  const { id } = useParams();

  // 🧩 Static Product Data (replace with backend later)
  const productData = {
    id: 1,
    name: "Hoodie Unisex Solid",
    price: 799,
    oldPrice: 899,
    stock: true,
    description:
      "This unisex solid hoodie is crafted from premium cotton fabric, offering both comfort and durability. Designed for all-day wear with a perfect fit and smooth texture.",
    details: [
      { label: "Fabric", value: "Cotton Raising" },
      { label: "Fit", value: "Regular" },
      { label: "Pattern", value: "Solid" },
      { label: "Country of Origin", value: "India" },
    ],
    variants: [
      {
        color: "Green",
        images: [
          "https://i.imgur.com/gB2bVYB.png",
          "https://i.imgur.com/Z5D9z6s.png",
        ],
        sizes: ["S", "M", "L"],
      },
      {
        color: "Red",
        images: [
          "https://i.imgur.com/xqOeZfZ.png",
          "https://i.imgur.com/ly3Dz6E.png",
        ],
        sizes: ["M", "L", "XL"],
      },
      {
        color: "White",
        images: [
          "https://i.imgur.com/G3sHd5h.png",
          "https://i.imgur.com/Qc6EGzP.png",
        ],
        sizes: ["S", "M", "XL"],
      },
    ],
  };

  // ✅ State management
  const [product, setProduct] = useState(productData);
  const [selectedVariant, setSelectedVariant] = useState(productData.variants[0]);
  const [selectedImage, setSelectedImage] = useState(productData.variants[0].images[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // 🧠 Simulate API Fetch
  useEffect(() => {
    // In future:
    // axios.get(`${BASE_URL}/products/${id}`).then(res => setProduct(res.data))
    setProduct(productData);
  }, [id]);

  // 🎨 Theme classes
  const bg = theme === "dark" ? "bg-black text-white" : "bg-white text-black";
  const cardBg = theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-300";

  return (
    <section className={`min-h-screen ${bg} transition-all duration-500 px-6 lg:px-20 pt-44 pb-16`}>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* 🖼️ Left - Image Gallery */}
        <div className="lg:w-1/2 flex flex-col items-center">
          <div className="border rounded-lg overflow-hidden w-full max-w-md">
            <img
              src={selectedImage}
              alt={selectedVariant.color}
              className="w-full h-[450px] object-cover"
            />
          </div>
          <div className="flex gap-3 mt-4">
            {selectedVariant.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-md object-cover cursor-pointer border-2 ${
                  selectedImage === img
                    ? "border-purple-500"
                    : theme === "dark"
                    ? "border-gray-700"
                    : "border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 🧾 Right - Product Info */}
        <div className="lg:w-1/2 space-y-6">
          <h1 className="text-3xl font-bold font-italiana tracking-wide">
            {product.name} <span className="capitalize">{selectedVariant.color}</span>
          </h1>

          <div className="flex items-center gap-3 text-2xl font-semibold">
            ₹{product.price.toFixed(2)}
            <span className="text-gray-400 line-through text-lg">₹{product.oldPrice}</span>
            <span className="text-green-600 text-sm font-medium">SAVE 11%</span>
          </div>

          <p className="text-green-500 font-instrument">
            Inclusive of All Taxes + Free Shipping
          </p>

          <p className={`font-medium ${product.stock ? "text-green-600" : "text-red-500"}`}>
            {product.stock ? "In Stock" : "Out of Stock"}
          </p>

          {/* Colors */}
          <div>
            <p className="font-semibold mb-2">Choose Color:</p>
            <div className="flex gap-3">
              {product.variants.map((variant) => (
                <div
                  key={variant.color}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setSelectedImage(variant.images[0]);
                    setSelectedSize("");
                  }}
                  className={`cursor-pointer rounded-md border-2 overflow-hidden ${
                    selectedVariant.color === variant.color
                      ? "border-purple-600"
                      : theme === "dark"
                      ? "border-gray-700"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={variant.images[0]}
                    alt={variant.color}
                    className="w-16 h-16 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="font-semibold mb-2">Select Size:</p>
            <div className="flex gap-3 flex-wrap">
              {selectedVariant.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-md border text-sm ${
                    selectedSize === size
                      ? "bg-purple-600 text-white border-purple-600"
                      : theme === "dark"
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-semibold mb-2">Quantity:</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="border rounded-md w-10 h-10 flex items-center justify-center"
              >
                <FaMinus />
              </button>
              <span className="text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="border rounded-md w-10 h-10 flex items-center justify-center"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-4">
            <button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition"
            >
              Add to Cart
            </button>
            <button
              className={`flex-1 border py-3 rounded-md transition ${
                theme === "dark"
                  ? "border-purple-500 hover:bg-purple-700"
                  : "border-purple-600 hover:bg-purple-100"
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* 📋 Product Details */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-4">Product Details</h2>
        <ul className="space-y-2">
          {product.details.map((d, i) => (
            <li key={i}>
              <span className="font-semibold">{d.label}: </span>
              {d.value}
            </li>
          ))}
        </ul>
      </div>

      {/* 📝 Description */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-3">Description</h3>
        <p className="leading-relaxed text-gray-600 dark:text-gray-400 font-instrument">
          {product.description}
        </p>
      </div>
    </section>
  );
}
 