// components/ProductCustomization/FabricCustomizer.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

const FabricCustomizer = ({ 
  productImage, 
  onDesignComplete,
  initialText = '',
  initialTextColor = '#000000'
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [text, setText] = useState(initialText);
  const [textColor, setTextColor] = useState(initialTextColor);
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [selectedObject, setSelectedObject] = useState(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize canvas
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 500,
      backgroundColor: '#ffffff'
    });

    // Load product image
    fabric.Image.fromURL(productImage, (img) => {
      img.scaleToWidth(500);
      img.scaleToHeight(500);
      fabricCanvasRef.current.add(img);
      fabricCanvasRef.current.renderAll();
    });

    // Object selection event
    fabricCanvasRef.current.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvasRef.current.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvasRef.current.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Cleanup
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [productImage]);

  // Add text to canvas
  const addText = () => {
    if (!text.trim()) return;

    const fabricText = new fabric.Text(text, {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      fontWeight: 'normal',
      editable: true,
      hasControls: true,
      hasBorders: true
    });

    fabricCanvasRef.current.add(fabricText);
    fabricCanvasRef.current.setActiveObject(fabricText);
    fabricCanvasRef.current.renderAll();
    setSelectedObject(fabricText);
    setText('');
  };

  // Add image to canvas
  const addImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        img.scaleToWidth(200);
        img.set({
          left: 150,
          top: 150,
          hasControls: true,
          hasBorders: true
        });
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
        setSelectedObject(img);
      });
    };
    reader.readAsDataURL(file);
  };

  // Delete selected object
  const deleteSelected = () => {
    if (!selectedObject) return;
    fabricCanvasRef.current.remove(selectedObject);
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.renderAll();
    setSelectedObject(null);
  };

  // Move object to front
  const bringToFront = () => {
    if (!selectedObject) return;
    fabricCanvasRef.current.bringToFront(selectedObject);
    fabricCanvasRef.current.renderAll();
  };

  // Export design
  const exportDesign = () => {
    if (!fabricCanvasRef.current) return;
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1.0
    });
    
    onDesignComplete(dataURL);
  };

  // Color options
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  // Font options
  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Tools */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Customization Tools</h3>
            
            {/* Text Tool */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Add Text</h4>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full p-3 border rounded mb-3"
                rows="3"
              />
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm mb-1">Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-2">Text Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        textColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={addText}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Add Text to Design
              </button>
            </div>
            
            {/* Image Tool */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Add Image</h4>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files[0] && addImage(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Upload Image
              </button>
              <p className="text-xs text-gray-500 mt-2">Supports: JPG, PNG, GIF (Max 5MB)</p>
            </div>
            
            {/* Object Controls */}
            {selectedObject && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Selected Object</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={bringToFront}
                    className="bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded text-sm"
                  >
                    Bring to Front
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            
            {/* Export Button */}
            <div className="border-t pt-4">
              <button
                onClick={exportDesign}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-semibold"
              >
                Save Design
              </button>
            </div>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Design Preview</h4>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded shadow-sm"
              />
            </div>
            <div className="mt-3 text-sm text-gray-600 text-center">
              <p>• Drag text/images to reposition</p>
              <p>• Click to select • Use corners to resize</p>
              <p>• Drag selected objects to move</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FabricCustomizer;