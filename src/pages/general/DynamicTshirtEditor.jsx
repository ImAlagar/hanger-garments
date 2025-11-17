import React, { useState } from "react";
import { Rnd } from "react-rnd";

// Example T-shirt colors (replace with your PNG paths)
const tshirtColors = [
  { name: "White", image: "/assets/mockups/tshirt_white.png" },
  { name: "Black", image: "/assets/mockups/tshirt_black.png" },
  { name: "Blue", image: "/assets/mockups/tshirt_blue.png" },
];

const DynamicTshirtEditor = () => {
  const [design, setDesign] = useState(null);
  const [selectedColor, setSelectedColor] = useState(tshirtColors[0]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesign(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Upload Design */}
      <div>
        <label className="block mb-2 font-semibold">Upload Your Design:</label>
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>

      {/* T-shirt color selection */}
      <div className="flex space-x-2">
        {tshirtColors.map((t) => (
          <button
            key={t.name}
            onClick={() => setSelectedColor(t)}
            className={`px-4 py-2 rounded border ${
              selectedColor.name === t.name
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* T-shirt Mockup */}
      <div className="relative w-full max-w-md mx-auto">
        <img
          src={selectedColor.image}
          alt={`Tshirt ${selectedColor.name}`}
          className="w-full object-contain"
        />

        {/* Draggable & Resizable Design */}
        {design && (
          <Rnd
            default={{
              x: 60,
              y: 80,
              width: 150,
              height: 150,
            }}
            bounds="parent"
            lockAspectRatio={true} // maintain aspect ratio
          >
            <img
              src={design}
              alt="Design"
              className="w-full h-full object-contain"
            />
          </Rnd>
        )}
      </div>
    </div>
  );
};

export default DynamicTshirtEditor;
