import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";

const tshirtColors = [
  { name: "White", image: "/assets/mockups/tshirt_white.png" },
  { name: "Black", image: "/assets/mockups/tshirt_black.png" },
  { name: "Blue", image: "/assets/mockups/tshirt_blue.png" },
];

// Chest area bounds as % of mockup
const CHEST_AREA = { top: 0.22, left: 0.2, width: 0.6, height: 0.35 };

const FullProTshirtEditor = () => {
  const [elements, setElements] = useState([]); // images + texts
  const [selectedColor, setSelectedColor] = useState(tshirtColors[0]);
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(24);
  const [fontStyle, setFontStyle] = useState({ bold: false, italic: false, underline: false });
  const [selectedElementId, setSelectedElementId] = useState(null);
  const mockupRef = useRef();

  // Auto-fit inside chest area
  const getChestPosition = (mockupWidth, mockupHeight) => {
    return {
      x: CHEST_AREA.left * mockupWidth,
      y: CHEST_AREA.top * mockupHeight,
      width: CHEST_AREA.width * mockupWidth,
      height: CHEST_AREA.height * mockupHeight,
    };
  };

  // Upload image
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && mockupRef.current) {
      const { clientWidth: w, clientHeight: h } = mockupRef.current;
      const chest = getChestPosition(w, h);
      setElements([
        ...elements,
        {
          id: Date.now(),
          type: "image",
          src: URL.createObjectURL(file),
          x: chest.x + chest.width / 4,
          y: chest.y + chest.height / 4,
          width: chest.width / 2,
          height: chest.height / 2,
          rotation: 0,
        },
      ]);
    }
  };

  // Add text
  const handleAddText = () => {
    if (!textInput || !mockupRef.current) return;
    const { clientWidth: w, clientHeight: h } = mockupRef.current;
    const chest = getChestPosition(w, h);
    setElements([
      ...elements,
      {
        id: Date.now(),
        type: "text",
        text: textInput,
        x: chest.x + chest.width / 4,
        y: chest.y + chest.height / 4,
        width: chest.width / 2,
        height: chest.height / 4,
        rotation: 0,
        fontSize,
        color: textColor,
        style: fontStyle,
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

  // Delete element
  const deleteElement = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // Bring forward / send backward
  const bringForward = (id) => {
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx < prev.length - 1) {
        const newArr = [...prev];
        [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
        return newArr;
      }
      return prev;
    });
  };

  const sendBackward = (id) => {
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx > 0) {
        const newArr = [...prev];
        [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
        return newArr;
      }
      return prev;
    });
  };

  // Update text style for selected element
  const updateTextStyle = (key) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElementId
          ? { ...el, style: { ...el.style, [key]: !el.style[key] } }
          : el
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

      {/* Font style buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => updateTextStyle("bold")}
          className="px-2 py-1 border rounded"
        >
          Bold
        </button>
        <button
          onClick={() => updateTextStyle("italic")}
          className="px-2 py-1 border rounded"
        >
          Italic
        </button>
        <button
          onClick={() => updateTextStyle("underline")}
          className="px-2 py-1 border rounded"
        >
          Underline
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

        {/* Chest area visual */}
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

        {/* Render elements */}
        {elements.map((el, idx) => (
          <Rnd
            key={el.id}
            default={{ x: el.x, y: el.y, width: el.width, height: el.height }}
            bounds="parent"
            lockAspectRatio={el.type === "image"}
            onClick={() => setSelectedElementId(el.id)}
          >
            <div
              style={{ transform: `rotate(${el.rotation}deg)` }}
              className={`relative w-full h-full ${
                selectedElementId === el.id ? "outline outline-2 outline-blue-500" : ""
              }`}
            >
              {el.type === "image" ? (
                <img src={el.src} alt="Design" className="w-full h-full object-contain" />
              ) : (
                <span
                  style={{
                    fontSize: el.fontSize,
                    color: el.color,
                    fontWeight: el.style.bold ? "bold" : "normal",
                    fontStyle: el.style.italic ? "italic" : "normal",
                    textDecoration: el.style.underline ? "underline" : "none",
                  }}
                  className="block w-full h-full text-center break-words"
                >
                  {el.text}
                </span>
              )}

              {/* Action buttons */}
              {selectedElementId === el.id && (
                <div className="absolute top-0 right-0 flex space-x-1">
                  <button
                    onClick={() => rotateElement(el.id)}
                    className="bg-blue-500 text-white text-xs p-1 rounded"
                  >
                    ↻
                  </button>
                  <button
                    onClick={() => bringForward(el.id)}
                    className="bg-gray-500 text-white text-xs p-1 rounded"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => sendBackward(el.id)}
                    className="bg-gray-500 text-white text-xs p-1 rounded"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => deleteElement(el.id)}
                    className="bg-red-600 text-white text-xs p-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              )}
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

export default FullProTshirtEditor;
