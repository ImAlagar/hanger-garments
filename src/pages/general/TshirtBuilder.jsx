import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";

const tshirtColors = [
  { name: "White", image: "/assets/mockups/tshirt_white.png" },
  { name: "Black", image: "/assets/mockups/tshirt_black.png" },
  { name: "Blue", image: "/assets/mockups/tshirt_blue.png" },
];

const TshirtBuilder = () => {
  const [designs, setDesigns] = useState([]);
  const [selectedColor, setSelectedColor] = useState(tshirtColors[0]);
  const mockupRef = useRef();

  // Handle image upload
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesigns([
        ...designs,
        {
          id: Date.now(),
          src: URL.createObjectURL(file),
          width: 150,
          height: 150,
          x: 60,
          y: 80,
          rotation: 0,
        },
      ]);
    }
  };

  // Rotate design
  const rotateDesign = (id) => {
    setDesigns((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, rotation: (d.rotation + 15) % 360 } : d
      )
    );
  };

  // Export final mockup as PNG
  const exportMockup = () => {
    if (mockupRef.current) {
      html2canvas(mockupRef.current, { backgroundColor: null }).then((canvas) => {
        const link = document.createElement("a");
        link.download = "tshirt_mockup.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Upload */}
      <div>
        <label className="block mb-2 font-semibold">Upload Design:</label>
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
      <div
        ref={mockupRef}
        className="relative w-full max-w-md mx-auto border p-2"
        style={{ background: "transparent" }}
      >
        <img
          src={selectedColor.image}
          alt={`Tshirt ${selectedColor.name}`}
          className="w-full object-contain"
        />

        {designs.map((d) => (
          <Rnd
            key={d.id}
            default={{
              x: d.x,
              y: d.y,
              width: d.width,
              height: d.height,
            }}
            bounds="parent"
            lockAspectRatio={true}
          >
            <div
              style={{ transform: `rotate(${d.rotation}deg)` }}
              className="w-full h-full"
            >
              <img
                src={d.src}
                alt="Design"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => rotateDesign(d.id)}
                className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs p-1 rounded"
              >
                ↻
              </button>
            </div>
          </Rnd>
        ))}
      </div>

      <button
        onClick={exportMockup}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold"
      >
        Export PNG
      </button>
    </div>
  );
};

export default TshirtBuilder;
