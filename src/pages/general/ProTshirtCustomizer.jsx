import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";

const tshirtColors = [
  { name: "White", image: "/assets/mockups/tshirt_white.png" },
  { name: "Black", image: "/assets/mockups/tshirt_black.png" },
  { name: "Blue", image: "/assets/mockups/tshirt_blue.png" },
];

const ProTshirtCustomizer = () => {
  const [elements, setElements] = useState([]); // images + texts
  const [selectedColor, setSelectedColor] = useState(tshirtColors[0]);
  const [textInput, setTextInput] = useState("");
  const mockupRef = useRef();

  // Upload image
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

  // Add text
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
        fontSize: 24,
        color: "#000000",
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

  // Export PNG
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
      {/* Upload Image */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
        <input type="file" accept="image/*" onChange={handleUpload} />
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter text"
          className="border px-2 py-1 rounded flex-1"
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

      {/* T-shirt mockup */}
      <div
        ref={mockupRef}
        className="relative w-full max-w-md mx-auto border p-2 bg-white"
        style={{ minHeight: "400px" }}
      >
        <img
          src={selectedColor.image}
          alt={`Tshirt ${selectedColor.name}`}
          className="w-full object-contain"
        />

        {elements.map((el) => (
          <Rnd
            key={el.id}
            default={{ x: el.x, y: el.y, width: el.width, height: el.height }}
            bounds="parent"
            lockAspectRatio={el.type === "image"}
          >
            <div style={{ transform: `rotate(${el.rotation}deg)` }} className="relative w-full h-full">
              {el.type === "image" && (
                <img src={el.src} alt="Design" className="w-full h-full object-contain" />
              )}
              {el.type === "text" && (
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

export default ProTshirtCustomizer;
