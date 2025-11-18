// components/Common/VirtualTryOn.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const VirtualTryOn = ({ productImage, onTryOnComplete, isOpen, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const canvasRef = useRef(null);
  const [userImage, setUserImage] = useState(null);
  const [position, setPosition] = useState({ x: 300, y: 250 });
  const [scale, setScale] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Draw everything on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw product image (t-shirt)
    const productImg = new Image();
    productImg.crossOrigin = "anonymous";
    productImg.onload = () => {
      // Scale product image to fit canvas
      const scaleX = canvas.width / productImg.width;
      const scaleY = canvas.height / productImg.height;
      const scale = Math.min(scaleX, scaleY);
      
      const width = productImg.width * scale;
      const height = productImg.height * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
      
      ctx.drawImage(productImg, x, y, width, height);

      // Draw user image if available
      if (userImage) {
        ctx.save();
        
        // Move to position
        ctx.translate(position.x, position.y);
        
        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Apply scale
        const userWidth = userImage.width * scale;
        const userHeight = userImage.height * scale;
        
        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw user image (centered)
        ctx.drawImage(userImage, -userWidth / 2, -userHeight / 2, userWidth, userHeight);
        
        ctx.restore();
      }
      
      // Draw positioning guide
      if (userImage) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(position.x, position.y, 50, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }
    };
    productImg.src = productImage;
  }, [productImage, userImage, position, scale, rotation]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File validation
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        // Center the image on the t-shirt
        setPosition({ x: 300, y: 250 });
        setScale(0.5);
        setRotation(0);
        setIsLoading(false);
      };
      img.onerror = () => {
        setIsLoading(false);
        alert('Error loading image. Please try another image.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setIsLoading(false);
      alert('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  // Handle mouse events for dragging
  const handleMouseDown = (e) => {
    if (!userImage) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is near the image
    const distance = Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2));
    if (distance < 100) { // Click within 100px of image center
      setIsDragging(true);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !userImage) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.1));
  };

  // Handle rotation
  const handleRotate = (angle) => {
    setRotation(prev => (prev + angle) % 360);
  };

  // Reset to default position
  const handleReset = () => {
    setPosition({ x: 300, y: 250 });
    setScale(0.5);
    setRotation(0);
  };

  // Auto-fit image to t-shirt
  const handleAutoFit = () => {
    if (!userImage) return;
    
    // Calculate optimal scale to fit t-shirt area
    const optimalScale = 0.6;
    setScale(optimalScale);
    setPosition({ x: 300, y: 250 });
    setRotation(0);
  };

  // Export final image
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas || !userImage) return;

    setIsLoading(true);
    
    // Small delay to ensure canvas is rendered
    setTimeout(() => {
      try {
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        onTryOnComplete(dataUrl);
        setIsLoading(false);
        onClose();
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('Error saving image. Please try again.');
        setIsLoading(false);
      }
    }, 100);
  };

  // Redraw canvas when dependencies change
  useEffect(() => {
    if (isOpen) {
      drawCanvas();
    }
  }, [drawCanvas, isOpen]);

  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!userImage) return;
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setPosition(prev => ({ ...prev, y: prev.y - 5 }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPosition(prev => ({ ...prev, y: prev.y + 5 }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPosition(prev => ({ ...prev, x: prev.x - 5 }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPosition(prev => ({ ...prev, x: prev.x + 5 }));
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleReset();
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, userImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 max-w-6xl w-full max-h-[95vh] overflow-auto ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Virtual Try-On</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="xl:col-span-3">
            <div className={`border-2 rounded-lg p-4 ${
              isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
            }`}>
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className={`w-full h-auto max-h-[600px] object-contain ${
                  userImage ? 'cursor-move' : 'cursor-default'
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-white text-lg">Processing...</div>
                </div>
              )}
            </div>
            
            {/* Instructions */}
            <div className={`mt-4 p-4 rounded-lg ${
              isDark ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-800'
            }`}>
              <h4 className="font-semibold mb-2">🎯 How to use:</h4>
              <ul className="text-sm space-y-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <li>• <strong>Upload</strong> your design using the upload button</li>
                <li>• <strong>Drag</strong> to position your design on the t-shirt</li>
                <li>• Use <strong>zoom controls</strong> to resize your design</li>
                <li>• Use <strong>rotation controls</strong> to adjust angle</li>
                <li>• <strong>Arrow keys</strong> for precise positioning</li>
                <li>• Click <strong>"Save Try-On Result"</strong> when done</li>
              </ul>
              
              {userImage && (
                <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800 rounded">
                  <p className="text-sm font-semibold">🎮 Quick Controls:</p>
                  <p className="text-xs mt-1">
                    Arrow Keys: Move | +/-: Zoom | R: Reset | Click & Drag: Reposition
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-4">
            {/* Image Upload */}
            <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
              isDark ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="try-on-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="try-on-upload"
                className={`block cursor-pointer p-4 rounded-lg transition-colors ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed'
                    : isDark 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                }`}
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="font-semibold">Upload Your Design</p>
                <p className="text-sm opacity-75 mt-1">
                  PNG with transparency recommended
                </p>
                <p className="text-xs opacity-60 mt-1">
                  Max 5MB • JPG, PNG, WebP
                </p>
              </label>
              
              {userImage && (
                <div className={`mt-3 p-2 rounded text-sm ${
                  isDark ? 'bg-green-900 text-green-300' : 'bg-green-50 text-green-700'
                }`}>
                  ✅ Design uploaded! Drag to adjust
                </div>
              )}
            </div>

            {/* Transformation Controls */}
            {userImage && (
              <div className={`p-4 rounded-lg space-y-4 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <h3 className="font-semibold mb-2">Design Controls</h3>
                
                {/* Position Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={`p-2 rounded ${
                    isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    <div className="text-xs opacity-75">Position</div>
                    <div>X: {Math.round(position.x)} Y: {Math.round(position.y)}</div>
                  </div>
                  <div className={`p-2 rounded ${
                    isDark ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    <div className="text-xs opacity-75">Scale & Rotation</div>
                    <div>{scale.toFixed(1)}x • {rotation}°</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAutoFit}
                    className={`py-2 px-3 rounded text-sm ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-blue-500 hover:bg-blue-400'
                    } text-white`}
                  >
                    🎯 Auto Fit
                  </button>
                  <button
                    onClick={handleReset}
                    className={`py-2 px-3 rounded text-sm ${
                      isDark
                        ? 'bg-yellow-600 hover:bg-yellow-500'
                        : 'bg-yellow-500 hover:bg-yellow-400'
                    } text-white`}
                  >
                    🔄 Reset
                  </button>
                </div>

                {/* Zoom Controls */}
                <div>
                  <label className="block text-sm mb-2">Zoom: {scale.toFixed(1)}x</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleZoomOut}
                      disabled={scale <= 0.1}
                      className={`flex-1 py-2 px-3 rounded text-sm ${
                        scale <= 0.1
                          ? 'bg-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-gray-600 hover:bg-gray-500'
                            : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      🔍−
                    </button>
                    <button
                      onClick={handleZoomIn}
                      disabled={scale >= 3}
                      className={`flex-1 py-2 px-3 rounded text-sm ${
                        scale >= 3
                          ? 'bg-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-gray-600 hover:bg-gray-500'
                            : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      🔍+
                    </button>
                  </div>
                </div>

                {/* Rotation Controls */}
                <div>
                  <label className="block text-sm mb-2">Rotation: {rotation}°</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRotate(-15)}
                      className={`py-2 px-3 rounded text-sm ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      ↶ -15°
                    </button>
                    <button
                      onClick={() => handleRotate(15)}
                      className={`py-2 px-3 rounded text-sm ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      ↷ +15°
                    </button>
                  </div>
                </div>

                {/* Fine Position Controls */}
                <div>
                  <label className="block text-sm mb-2">Fine Adjustment:</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setPosition(prev => ({ ...prev, y: prev.y - 5 }))}
                      className={`py-2 rounded ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => setPosition(prev => ({ ...prev, y: prev.y + 5 }))}
                      className={`py-2 rounded ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => setPosition(prev => ({ ...prev, x: prev.x - 5 }))}
                      className={`py-2 rounded ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setPosition(prev => ({ ...prev, x: prev.x + 5 }))}
                      className={`py-2 rounded ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      →
                    </button>
                    <button
                      onClick={() => setScale(prev => Math.max(prev - 0.05, 0.1))}
                      className={`py-2 rounded ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      -
                    </button>
                    <button
                      onClick={() => setScale(prev => Math.min(prev + 0.05, 3))}
                      className={`py-2 rounded ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleExport}
                disabled={!userImage || isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  !userImage || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading ? '⏳ Processing...' : '💾 Save Try-On Result'}
              </button>
              
              <button
                onClick={onClose}
                className={`w-full py-2 px-4 rounded border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
            </div>

            {/* Tips */}
            <div className={`p-3 rounded-lg text-sm ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className="font-semibold mb-1">💡 Pro Tips:</h4>
              <ul className="space-y-1">
                <li>• Use PNG with transparent background</li>
                <li>• Arrow keys for precise positioning</li>
                <li>• Auto-fit for perfect placement</li>
                <li>• Use zoom for detailed adjustments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;