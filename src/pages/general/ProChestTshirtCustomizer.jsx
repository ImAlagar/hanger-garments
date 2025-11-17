import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";

// T-shirt colors
const tshirtColors = [
  { name: "White", image: "/assets/mockups/tshirt_white.png" },
  { name: "Black", image: "/assets/mockups/tshirt_black.png" },
  { name: "Blue", image: "/assets/mockups/tshirt_blue.png" },
];

// Chest area bounds as % of mockup
const CHEST_AREA = { top: 0.22, left: 0.2, width: 0.6, height: 0.35 };

const ProChestTshirtCustomizer = () => {
  const [elements, setElements] = useState([]);
  const [selectedColor, setSelectedColor] = useState(tshirtColors[0]);
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(24);
  const mockupRef = useRef();

  // Handle image upload
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setElements([
        ...elements,
        {
          id: Date.now(),
          type: "image",
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

  // Add text element
  const handleAddText = () => {
    if (!textInput) return;
    setElements([
      ...elements,
      {
        id: Date.now(),
        type: "text",
        text: textInput,
        width: 200,
        height: 50,
        x: 60,
        y: 80,
        rotation: 0,
        fontSize,
        color: textColor,
      },
    ]);
    setTextInput("");
  };

  // Rotate element
  const rotateElement = (id) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, rotation: (el.rotation + 15) % 360 } : el
      )
    );
  };

  // Export mockup as PNG
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
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
        <input type="file" accept="image/*" onChange={handleUpload} />
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter text"
          className="border px-2 py-1 rounded flex-1"
        />
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="border rounded p-1"
        />
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="border rounded p-1 w-20"
          min={10}
          max={100}
        />
        <button
          onClick={handleAddText}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Text
        </button>
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
        className="relative w-full max-w-md mx-auto border p-2 bg-white"
        style={{ minHeight: "450px" }}
      >
        <img
          src={selectedColor.image}
          alt={`Tshirt ${selectedColor.name}`}
          className="w-full object-contain"
        />

        {elements.map((el) => (
          <Rnd
            key={el.id}
            default={{
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
            }}
            bounds="parent"
            lockAspectRatio={el.type === "image"}
            minWidth={20}
            minHeight={20}
            maxWidth={300}
            maxHeight={300}
          >
            <div
              style={{ transform: `rotate(${el.rotation}deg)` }}
              className="relative w-full h-full"
            >
              {el.type === "image" ? (
                <img src={el.src} alt="Design" className="w-full h-full object-contain" />
              ) : (
                <span
                  style={{ fontSize: el.fontSize, color: el.color }}
                  className="block w-full h-full text-center break-words"
                >
                  {el.text}
                </span>
              )}
              <button
                onClick={() => rotateElement(el.id)}
                className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs p-1 rounded"
              >
                ↻
              </button>
            </div>
          </Rnd>
        ))}

        {/* Chest area highlight (optional visual) */}
        <div
          className="absolute border-2 border-dashed border-gray-400"
          style={{
            top: `${CHEST_AREA.top * 100}%`,
            left: `${CHEST_AREA.left * 100}%`,
            width: `${CHEST_AREA.width * 100}%`,
            height: `${CHEST_AREA.height * 100}%`,
            pointerEvents: "none",
          }}
        />
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

export default ProChestTshirtCustomizer;
