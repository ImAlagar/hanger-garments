// components/mobile/MobileCustomizationView.js - COMPLETE NEAT CODE
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  addDesignLayer, 
  removeDesignLayer, 
  resetDesign,
  updateDesignLayer,
  reorderDesignLayers,
  setPreviewImage
} from '../../redux/slices/customizationSlice';

const MobileCustomizationView = ({
  isOpen,
  onClose,
  product,
  variant,
  customization,
  designData,
  isCreatingDesign,
  createDesign,
  dispatch
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const retryCountRef = useRef(0);
  const imageCacheRef = useRef(new Map());
  
  // Local state
  const [activeTab, setActiveTab] = useState('canvas');
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(0.9);
  const [exportSize, setExportSize] = useState('original');
  const [isExporting, setIsExporting] = useState(false);
  
  // Available fonts and colors
  const availableFonts = customization?.allowedFonts || ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];
  const availableColors = customization?.allowedColors || ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  // Export size options
  const exportSizes = {
    original: { label: 'Original', scale: 1.0 },
    high: { label: 'High (2x)', scale: 2.0 },
    medium: { label: 'Medium (1.5x)', scale: 1.5 },
    low: { label: 'Low (0.75x)', scale: 0.75 }
  };

  // ==================== IMAGE LOADING UTILITIES ====================

  // Create mobile-optimized placeholder
  const createMobilePlaceholder = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 200);
    
    // Border
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 180, 180);
    
    // Text
    ctx.fillStyle = '#adb5bd';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🖼️', 100, 70);
    ctx.font = '12px Arial';
    ctx.fillText('Image Loading', 100, 100);
    ctx.font = '10px Arial';
    ctx.fillText('Tap + to upload', 100, 120);
    
    return canvas.toDataURL('image/png');
  }, []);

  // Get optimized image URL
  const getOptimizedImageUrl = useCallback((url) => {
    if (!url) return null;
    
    // Already data URL or blob
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // Check cache
    if (imageCacheRef.current.has(url)) {
      return imageCacheRef.current.get(url);
    }
    
    // For S3 URLs, use proxy for mobile
    if (url.includes('amazonaws.com') || url.includes('s3.')) {
      // Use your proxy endpoint
      const proxyUrl = `https://tiruppurgarments.com/api/images/proxy?url=${encodeURIComponent(url)}&width=800&quality=80`;
      imageCacheRef.current.set(url, proxyUrl);
      return proxyUrl;
    }
    
    // For other URLs, use direct
    imageCacheRef.current.set(url, url);
    return url;
  }, []);

  // Load image with retry logic
  const loadImage = useCallback(async (src) => {
    const imageUrl = getOptimizedImageUrl(src);
    const cacheKey = imageUrl || src;
    
    // Check memory cache first
    if (imageCacheRef.current.has(`loaded_${cacheKey}`)) {
      return imageCacheRef.current.get(`loaded_${cacheKey}`);
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      
      // Timeout for slow connections
      const timeout = setTimeout(() => {
        console.log(`⏰ Timeout for image: ${src.substring(0, 50)}...`);
        img.src = ''; // Cancel loading
        const placeholder = createMobilePlaceholder();
        const placeholderImg = new Image();
        placeholderImg.onload = () => {
          imageCacheRef.current.set(`loaded_${cacheKey}`, placeholderImg);
          resolve(placeholderImg);
        };
        placeholderImg.src = placeholder;
      }, 10000); // 10 seconds timeout
      
      img.crossOrigin = 'Anonymous';
      img.loading = 'eager';
      img.decoding = 'async';
      
      img.onload = () => {
        clearTimeout(timeout);
        setLoadingProgress(prev => prev + 1);
        imageCacheRef.current.set(`loaded_${cacheKey}`, img);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.warn(`❌ Failed to load: ${src.substring(0, 50)}...`);
        
        // Try direct URL if proxy was used
        if (imageUrl !== src && src.startsWith('http')) {
          setTimeout(() => {
            const fallbackImg = new Image();
            fallbackImg.crossOrigin = 'Anonymous';
            fallbackImg.onload = () => {
              setLoadingProgress(prev => prev + 1);
              imageCacheRef.current.set(`loaded_${cacheKey}`, fallbackImg);
              resolve(fallbackImg);
            };
            fallbackImg.onerror = () => {
              const placeholder = createMobilePlaceholder();
              const placeholderImg = new Image();
              placeholderImg.onload = () => {
                imageCacheRef.current.set(`loaded_${cacheKey}`, placeholderImg);
                resolve(placeholderImg);
              };
              placeholderImg.src = placeholder;
            };
            fallbackImg.src = src;
          }, 500);
        } else {
          const placeholder = createMobilePlaceholder();
          const placeholderImg = new Image();
          placeholderImg.onload = () => {
            imageCacheRef.current.set(`loaded_${cacheKey}`, placeholderImg);
            resolve(placeholderImg);
          };
          placeholderImg.src = placeholder;
        }
      };
      
      img.src = imageUrl || src;
    });
  }, [createMobilePlaceholder, getOptimizedImageUrl]);

  // ==================== CANVAS OPERATIONS ====================

  // Count images to load
  useEffect(() => {
    if (isOpen && designData) {
      let count = 0;
      
      // Base product image
      const baseImageUrl = variant?.variantImages?.[0]?.imageUrl || product?.images?.[0]?.imageUrl;
      if (baseImageUrl) count++;
      
      // Design layer images
      designData.layers.forEach(layer => {
        if (layer.type === 'image' && layer.visible !== false && layer.src) {
          count++;
        }
      });
      
      setTotalImages(count);
      setImagesLoaded(0);
      setLoadingProgress(0);
      setHasLoadingError(false);
      retryCountRef.current = 0;
    }
  }, [isOpen, designData, variant, product]);

  // Initialize canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      setCanvasReady(false);
      
      const initCanvas = async () => {
        try {
          await drawCanvas();
          setCanvasReady(true);
          setHasLoadingError(false);
        } catch (error) {
          console.error('Canvas init error:', error);
          setHasLoadingError(true);
          retryCountRef.current += 1;
          
          // Auto-retry once
          if (retryCountRef.current < 2) {
            setTimeout(async () => {
              try {
                await drawCanvas();
                setCanvasReady(true);
              } catch (retryError) {
                console.error('Retry failed:', retryError);
                setCanvasReady(true); // Still set ready to allow user interaction
              }
            }, 2000);
          } else {
            setCanvasReady(true); // Allow user to continue anyway
          }
        }
      };
      
      initCanvas();
    }
  }, [isOpen, designData]);

  // Update loading progress
  useEffect(() => {
    if (totalImages > 0) {
      const progress = Math.min(100, Math.round((loadingProgress / totalImages) * 100));
      setImagesLoaded(progress);
    }
  }, [loadingProgress, totalImages]);

  // Draw canvas with all elements
  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for performance
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw base product image
    const baseImageUrl = variant?.variantImages?.[0]?.imageUrl || product?.images?.[0]?.imageUrl;
    if (baseImageUrl) {
      try {
        const baseImage = await loadImage(baseImageUrl);
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.warn('Base image failed, using fallback');
        drawFallbackBackground(ctx, canvas);
      }
    } else {
      drawFallbackBackground(ctx, canvas);
    }
    
    // Draw all design layers
    for (const layer of designData.layers) {
      if (layer.visible !== false) {
        await drawLayerOnCanvas(ctx, layer);
      }
    }
    
    // Draw selection outline if layer is selected
    if (selectedLayer) {
      const layer = designData.layers.find(l => l.id === selectedLayer);
      if (layer) {
        drawLayerSelection(ctx, layer);
      }
    }
  }, [variant, product, designData, selectedLayer, loadImage]);

  // Draw fallback background
  const drawFallbackBackground = useCallback((ctx, canvas) => {
    // Solid white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Product placeholder
    ctx.fillStyle = '#6c757d';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛍️', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '14px Arial';
    ctx.fillText(product?.name || 'Product', canvas.width / 2, canvas.height / 2);
    ctx.font = '12px Arial';
    ctx.fillStyle = '#adb5bd';
    ctx.fillText('Add your design below', canvas.width / 2, canvas.height / 2 + 30);
  }, [product]);

  // Draw a single layer
  const drawLayerOnCanvas = useCallback(async (ctx, layer) => {
    ctx.save();
    
    try {
      switch (layer.type) {
        case 'text':
          ctx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize}px ${layer.fontFamily}`;
          ctx.fillStyle = layer.color || '#000000';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(layer.text, layer.x, layer.y);
          break;
          
        case 'image':
          if (layer.src) {
            try {
              const img = await loadImage(layer.src);
              ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
            } catch (error) {
              drawImagePlaceholder(ctx, layer);
            }
          }
          break;
          
        case 'shape':
          ctx.fillStyle = layer.fillColor || '#000000';
          if (layer.shape === 'rectangle') {
            ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          } else if (layer.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, 0, 2 * Math.PI);
            ctx.fill();
          }
          break;
      }
    } catch (error) {
      console.warn('Error drawing layer:', layer.type, error);
    }
    
    ctx.restore();
  }, [loadImage]);

  // Draw image placeholder
  const drawImagePlaceholder = useCallback((ctx, layer) => {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
    
    ctx.fillStyle = '#adb5bd';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🖼️', layer.x + layer.width / 2, layer.y + layer.height / 2 - 10);
    ctx.font = '10px Arial';
    ctx.fillText('Image', layer.x + layer.width / 2, layer.y + layer.height / 2 + 10);
  }, []);

  // Draw layer selection
  const drawLayerSelection = useCallback((ctx, layer) => {
    const width = layer.width || 100;
    const height = layer.height || 50;
    
    // Selection border
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(layer.x - 5, layer.y - 5, width + 10, height + 10);
    ctx.setLineDash([]);
    
    // Resize handles (for images and shapes)
    if (layer.type === 'image' || layer.type === 'shape') {
      ctx.fillStyle = '#007bff';
      const handleSize = 12;
      
      // Corners
      const corners = [
        [layer.x, layer.y], // top-left
        [layer.x + width, layer.y], // top-right
        [layer.x, layer.y + height], // bottom-left
        [layer.x + width, layer.y + height] // bottom-right
      ];
      
      corners.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, []);

  // ==================== TOUCH HANDLERS ====================

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Find touched layer
    const touchedLayer = [...designData.layers]
      .reverse()
      .find(layer => {
        if (!layer.visible) return false;
        
        const width = layer.width || 100;
        const height = layer.height || 50;
        
        // Check for resize handles
        if (selectedLayer === layer.id && (layer.type === 'image' || layer.type === 'shape')) {
          const handleSize = 15;
          const corners = [
            { x: layer.x, y: layer.y, dir: 'nw' },
            { x: layer.x + width, y: layer.y, dir: 'ne' },
            { x: layer.x, y: layer.y + height, dir: 'sw' },
            { x: layer.x + width, y: layer.y + height, dir: 'se' }
          ];
          
          for (const corner of corners) {
            if (Math.abs(x - corner.x) < handleSize && Math.abs(y - corner.y) < handleSize) {
              setIsResizing(true);
              setResizeDirection(corner.dir);
              setDragOffset({ x: x - corner.x, y: y - corner.y });
              return true;
            }
          }
        }
        
        // Check layer body
        return x >= layer.x && x <= layer.x + width && 
               y >= layer.y && y <= layer.y + height;
      });
    
    if (touchedLayer && !isResizing) {
      setSelectedLayer(touchedLayer.id);
      setIsDragging(true);
      setDragOffset({
        x: x - touchedLayer.x,
        y: y - touchedLayer.y
      });
    } else if (!touchedLayer) {
      setSelectedLayer(null);
    }
  }, [designData, selectedLayer, isResizing]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!isDragging && !isResizing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (isDragging && selectedLayer) {
      const newX = Math.max(0, Math.min(canvas.width - 50, x - dragOffset.x));
      const newY = Math.max(0, Math.min(canvas.height - 50, y - dragOffset.y));
      
      dispatch(updateDesignLayer({
        layerId: selectedLayer,
        updates: { x: newX, y: newY }
      }));
    } else if (isResizing && selectedLayer) {
      const layer = designData.layers.find(l => l.id === selectedLayer);
      if (!layer) return;
      
      const currentWidth = layer.width || 100;
      const currentHeight = layer.height || 50;
      let newWidth = currentWidth;
      let newHeight = currentHeight;
      let newX = layer.x;
      let newY = layer.y;
      
      const minSize = 30;
      const maxWidth = canvas.width - newX;
      const maxHeight = canvas.height - newY;
      
      switch (resizeDirection) {
        case 'se': // bottom-right
          newWidth = Math.max(minSize, Math.min(maxWidth, x - layer.x));
          newHeight = Math.max(minSize, Math.min(maxHeight, y - layer.y));
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(minSize, Math.min(layer.x + currentWidth, layer.x + currentWidth - x));
          newHeight = Math.max(minSize, Math.min(maxHeight, y - layer.y));
          newX = x;
          break;
        case 'ne': // top-right
          newWidth = Math.max(minSize, Math.min(maxWidth, x - layer.x));
          newHeight = Math.max(minSize, Math.min(layer.y + currentHeight, layer.y + currentHeight - y));
          newY = y;
          break;
        case 'nw': // top-left
          newWidth = Math.max(minSize, Math.min(layer.x + currentWidth, layer.x + currentWidth - x));
          newHeight = Math.max(minSize, Math.min(layer.y + currentHeight, layer.y + currentHeight - y));
          newX = x;
          newY = y;
          break;
      }
      
      dispatch(updateDesignLayer({
        layerId: selectedLayer,
        updates: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        }
      }));
    }
  }, [isDragging, isResizing, selectedLayer, dragOffset, resizeDirection, designData, dispatch]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
    drawCanvas().catch(console.error);
  }, [drawCanvas]);

  // ==================== DESIGN OPERATIONS ====================

  const handleAddText = useCallback(() => {
    if (!textInput.trim()) {
      alert('Please enter some text');
      return;
    }
    
    const newLayer = {
      id: `text_${Date.now()}`,
      type: 'text',
      text: textInput,
      x: 50,
      y: 50,
      color: textColor,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: 'normal',
      visible: true,
      createdAt: new Date().toISOString()
    };
    
    dispatch(addDesignLayer(newLayer));
    setTextInput('');
    setSelectedLayer(newLayer.id);
    setActiveTab('canvas');
    drawCanvas().catch(console.error);
  }, [textInput, textColor, fontFamily, fontSize, dispatch, drawCanvas]);

  const handleAddImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validation
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newLayer = {
          id: `image_${Date.now()}`,
          type: 'image',
          src: e.target.result,
          x: 50,
          y: 50,
          width: Math.min(img.width, 300),
          height: Math.min(img.height, 300),
          originalWidth: img.width,
          originalHeight: img.height,
          visible: true,
          createdAt: new Date().toISOString()
        };
        
        dispatch(addDesignLayer(newLayer));
        setSelectedLayer(newLayer.id);
        setActiveTab('canvas');
        drawCanvas().catch(console.error);
      };
      img.onerror = () => {
        alert('Failed to load the selected image');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      alert('Failed to read the selected file');
    };
    reader.readAsDataURL(file);
    
    event.target.value = '';
  }, [dispatch, drawCanvas]);

  const handleAddShape = useCallback((shape) => {
    const newLayer = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      shape: shape,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fillColor: textColor,
      visible: true,
      createdAt: new Date().toISOString()
    };
    
    dispatch(addDesignLayer(newLayer));
    setSelectedLayer(newLayer.id);
    setActiveTab('canvas');
    drawCanvas().catch(console.error);
  }, [textColor, dispatch, drawCanvas]);

  const handleSaveDesign = useCallback(async () => {
    if (designData.layers.length === 0) {
      alert('Please add at least one design element before saving.');
      return;
    }
    
    if (!canvasReady) {
      alert('Canvas is still loading. Please wait...');
      return;
    }

    try {
      // Generate preview
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 400;
      previewCanvas.height = 400;
      const previewCtx = previewCanvas.getContext('2d');
      
      // Draw preview
      const baseImageUrl = variant?.variantImages?.[0]?.imageUrl || product?.images?.[0]?.imageUrl;
      if (baseImageUrl) {
        const baseImage = await loadImage(baseImageUrl);
        previewCtx.drawImage(baseImage, 0, 0, 400, 400);
      }
      
      for (const layer of designData.layers) {
        if (layer.visible !== false) {
          await drawLayerOnCanvas(previewCtx, { ...layer, x: layer.x * 0.5, y: layer.y * 0.5, 
            width: layer.width * 0.5, height: layer.height * 0.5, fontSize: layer.fontSize * 0.5 });
        }
      }
      
      const preview = previewCanvas.toDataURL('image/png');
      
      // Prepare design data
      const designDataToSave = {
        customizationId: customization.id,
        designData: {
          layers: designData.layers,
          canvasSize: designData.canvasSize,
          version: '1.0',
          createdAt: new Date().toISOString()
        },
        previewImage: preview,
        thumbnailImage: preview
      };
      
      await createDesign(designDataToSave).unwrap();
      dispatch(setPreviewImage(preview));
      alert('Design saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save design:', error);
      alert('Failed to save design. Please try again.');
    }
  }, [designData, canvasReady, variant, product, customization, createDesign, dispatch, onClose, loadImage, drawLayerOnCanvas]);

  const handleDeleteLayer = useCallback(() => {
    if (selectedLayer) {
      dispatch(removeDesignLayer(selectedLayer));
      setSelectedLayer(null);
      drawCanvas().catch(console.error);
    }
  }, [selectedLayer, dispatch, drawCanvas]);

  const handleResetDesign = useCallback(() => {
    if (window.confirm('Are you sure you want to reset your design? This cannot be undone.')) {
      dispatch(resetDesign());
      setSelectedLayer(null);
      imageCacheRef.current.clear();
      drawCanvas().catch(console.error);
    }
  }, [dispatch, drawCanvas]);

  const handleDuplicateLayer = useCallback(() => {
    if (!selectedLayer) return;
    
    const layer = designData.layers.find(l => l.id === selectedLayer);
    if (layer) {
      const duplicatedLayer = {
        ...layer,
        id: `${layer.type}_${Date.now()}`,
        x: layer.x + 20,
        y: layer.y + 20
      };
      
      dispatch(addDesignLayer(duplicatedLayer));
      setSelectedLayer(duplicatedLayer.id);
      drawCanvas().catch(console.error);
    }
  }, [selectedLayer, designData, dispatch, drawCanvas]);

  const handleReorderLayer = useCallback((direction) => {
    if (!selectedLayer) return;

    const currentIndex = designData.layers.findIndex(l => l.id === selectedLayer);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < designData.layers.length) {
      dispatch(reorderDesignLayers({
        fromIndex: currentIndex,
        toIndex: newIndex
      }));
      drawCanvas().catch(console.error);
    }
  }, [selectedLayer, designData, dispatch, drawCanvas]);

  const handleToggleVisibility = useCallback(() => {
    if (!selectedLayer) return;

    const layer = designData.layers.find(l => l.id === selectedLayer);
    if (layer) {
      dispatch(updateDesignLayer({
        layerId: selectedLayer,
        updates: { visible: !layer.visible }
      }));
      drawCanvas().catch(console.error);
    }
  }, [selectedLayer, designData, dispatch, drawCanvas]);

  const updateSelectedLayer = useCallback((updates) => {
    if (!selectedLayer) return;
    
    dispatch(updateDesignLayer({
      layerId: selectedLayer,
      updates
    }));
    drawCanvas().catch(console.error);
  }, [selectedLayer, dispatch, drawCanvas]);

  const handleRetryLoad = useCallback(() => {
    setHasLoadingError(false);
    retryCountRef.current = 0;
    imageCacheRef.current.clear();
    setCanvasReady(false);
    
    setTimeout(async () => {
      try {
        await drawCanvas();
        setCanvasReady(true);
      } catch (error) {
        console.error('Retry failed:', error);
        setCanvasReady(true);
      }
    }, 500);
  }, [drawCanvas]);

  // ==================== EXPORT FUNCTIONALITY ====================

  const exportDesign = useCallback(async () => {
    if (!canvasReady) {
      alert('Canvas is still loading. Please wait a moment.');
      return;
    }

    if (designData.layers.length === 0) {
      alert('Please add at least one design element before exporting.');
      return;
    }

    setIsExporting(true);

    try {
      const exportCanvas = document.createElement('canvas');
      const scale = exportSizes[exportSize].scale;
      
      exportCanvas.width = designData.canvasSize.width * scale;
      exportCanvas.height = designData.canvasSize.height * scale;
      
      const exportCtx = exportCanvas.getContext('2d');
      exportCtx.imageSmoothingEnabled = true;
      exportCtx.imageSmoothingQuality = 'high';
      
      // White background
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw product image
      const baseImageUrl = variant?.variantImages?.[0]?.imageUrl || product?.images?.[0]?.imageUrl;
      if (baseImageUrl) {
        try {
          const baseImage = await loadImage(baseImageUrl);
          exportCtx.drawImage(baseImage, 0, 0, exportCanvas.width, exportCanvas.height);
        } catch (error) {
          console.warn('Base image not available for export');
        }
      }
      
      // Draw layers
      for (const layer of designData.layers) {
        if (layer.visible !== false) {
          await drawLayerOnCanvas(exportCtx, {
            ...layer,
            x: layer.x * scale,
            y: layer.y * scale,
            width: layer.width * scale,
            height: layer.height * scale,
            fontSize: layer.fontSize * scale
          });
        }
      }
      
      // Generate download
      const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = exportFormat === 'jpeg' ? exportQuality : undefined;
      const dataUrl = exportCanvas.toDataURL(mimeType, quality);
      
      const link = document.createElement('a');
      const extension = mimeType.split('/')[1];
      const fileName = `design-${product?.name?.replace(/\s+/g, '-') || 'custom'}-${Date.now()}.${extension}`;
      
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        alert(`Design exported successfully!\nFile: ${fileName}`);
      }, 100);
      
      setIsExporting(false);
      return dataUrl;
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      setIsExporting(false);
      throw error;
    }
  }, [canvasReady, designData, exportFormat, exportQuality, exportSize, variant, product, loadImage, drawLayerOnCanvas]);

  const handleSaveAndExport = useCallback(async () => {
    try {
      await handleSaveDesign();
      await exportDesign();
    } catch (error) {
      console.error('Save and export failed:', error);
    }
  }, [handleSaveDesign, exportDesign]);

  // ==================== RENDER ====================

  if (!isOpen) return null;

  const selectedLayerData = designData.layers.find(layer => layer.id === selectedLayer);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white p-3 flex items-center justify-between z-20 border-b border-gray-200 shadow-sm">
        <button
          onClick={onClose}
          className="text-2xl text-gray-600 w-10 h-10 flex items-center justify-center"
        >
          ←
        </button>

        <div className="flex-1 px-2 text-center">
          <h2 className="text-lg font-bold truncate">
            Customize {product?.name}
          </h2>
          <div className="text-xs text-gray-500 mt-1">
            {designData.layers.length} layers
            {totalImages > 0 && ` • ${imagesLoaded}% loaded`}
          </div>
        </div>

        <button
          onClick={handleSaveDesign}
          disabled={isCreatingDesign || designData.layers.length === 0 || !canvasReady}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isCreatingDesign ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 pt-16 pb-20 overflow-hidden">
        <div className="h-full flex items-center justify-center p-2 bg-gray-50 relative">
          <canvas
            ref={canvasRef}
            width={designData.canvasSize.width || 400}
            height={designData.canvasSize.height || 400}
            className="bg-white border-2 border-gray-300 rounded-lg shadow-lg max-w-full max-h-full touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          />
          
          {/* Loading Overlay */}
          {!canvasReady && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium mb-2">Loading Design Editor</p>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${imagesLoaded}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {imagesLoaded}% • {loadingProgress}/{totalImages} images
                </p>
                {hasLoadingError && (
                  <button
                    onClick={handleRetryLoad}
                    className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded text-sm"
                  >
                    🔄 Retry Loading
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {designData.layers.length === 0 && canvasReady && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-500 bg-white p-6 rounded-lg border border-gray-200 max-w-xs mx-4 shadow-sm">
                <div className="text-4xl mb-3">🎨</div>
                <p className="font-semibold mb-2">Start Designing!</p>
                <p className="text-sm text-gray-600 mb-3">Tap + button to add elements</p>
              </div>
            </div>
          )}
          
          {/* Selected Layer Hint */}
          {selectedLayerData && canvasReady && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-full">
              {selectedLayerData.type === 'image' || selectedLayerData.type === 'shape' 
                ? 'Drag corners to resize • Tap to move' 
                : 'Tap and drag to move'}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setActiveTab('tools')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-30 active:scale-95"
      >
        +
      </button>

      {/* Bottom Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="flex justify-around p-2">
          {[
            { id: 'canvas', icon: '🎨', label: 'Canvas' },
            { id: 'layers', icon: '📋', label: 'Layers' },
            { id: 'tools', icon: '🛠️', label: 'Tools' },
            { id: 'export', icon: '📤', label: 'Export' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 flex-1 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={handleResetDesign}
            className="flex flex-col items-center p-2 flex-1 text-gray-600"
          >
            <span className="text-xl">🔄</span>
            <span className="text-xs mt-1">Reset</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      {activeTab !== 'canvas' && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setActiveTab('canvas')}
          />
          
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-40 max-h-[85vh] flex flex-col">
            <div className="flex justify-center pt-3">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="px-4 pt-2 pb-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  {activeTab === 'tools' ? 'Design Tools' : 
                   activeTab === 'layers' ? 'Layers' : 
                   'Export Design'}
                </h3>
                <button
                  onClick={() => setActiveTab('canvas')}
                  className="text-gray-500 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Tools Tab */}
              {activeTab === 'tools' && (
                <div className="space-y-6">
                  {/* Text Tool */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📝</span>
                      <span className="font-semibold text-lg">Add Text</span>
                    </div>
                    
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your text here..."
                      className="w-full p-3 border border-gray-300 rounded-lg text-base"
                      rows="3"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Font</label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg text-base"
                        >
                          {availableFonts.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Size: {fontSize}px</label>
                        <input
                          type="range"
                          min="12"
                          max="72"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Color</label>
                        <button
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="text-blue-600 text-sm"
                        >
                          {showColorPicker ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      
                      {showColorPicker && (
                        <div className="p-3 bg-gray-50 rounded-lg mb-3">
                          <div className="grid grid-cols-4 gap-3">
                            {availableColors.map(color => (
                              <button
                                key={color}
                                onClick={() => setTextColor(color)}
                                className={`w-12 h-12 rounded-full border-4 ${textColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleAddText}
                      disabled={!textInput.trim()}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                    >
                      Add Text to Design
                    </button>
                  </div>
                  
                  {/* Image Tool */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🖼️</span>
                      <span className="font-semibold text-lg">Add Image</span>
                    </div>
                    
                    <button
                      onClick={handleAddImage}
                      className="w-full bg-green-600 text-white py-4 rounded-lg text-base font-medium flex items-center justify-center space-x-2"
                    >
                      <span className="text-xl">📁</span>
                      <span>Choose Image</span>
                    </button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  {/* Shapes */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">⬜</span>
                      <span className="font-semibold text-lg">Add Shape</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAddShape('rectangle')}
                        className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-base flex flex-col items-center"
                      >
                        <span className="text-2xl mb-2">▭</span>
                        <span>Rectangle</span>
                      </button>
                      <button
                        onClick={() => handleAddShape('circle')}
                        className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-base flex flex-col items-center"
                      >
                        <span className="text-2xl mb-2">⚪</span>
                        <span>Circle</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Layers Tab */}
              {activeTab === 'layers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">Design Layers</h4>
                    <span className="text-sm text-gray-500">{designData.layers.length} total</span>
                  </div>
                  
                  {designData.layers.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-5xl mb-4 block">📋</span>
                      <p className="text-gray-500 text-lg">No layers yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...designData.layers].reverse().map(layer => (
                        <div
                          key={layer.id}
                          onClick={() => setSelectedLayer(layer.id)}
                          className={`p-4 border-2 rounded-lg ${selectedLayer === layer.id ? 'bg-blue-50 border-blue-500' : 'border-gray-200'} ${!layer.visible ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl">
                                {layer.type === 'text' ? '📝' : 
                                 layer.type === 'image' ? '🖼️' : '⬜'}
                              </span>
                              <div>
                                <p className="font-medium">
                                  {layer.type === 'text' 
                                    ? (layer.text.length > 25 ? `${layer.text.substring(0, 25)}...` : layer.text)
                                    : layer.type.charAt(0).toUpperCase() + layer.type.slice(1)
                                  }
                                </p>
                                {layer.type === 'text' && (
                                  <p className="text-xs text-gray-500">
                                    {layer.fontFamily} • {layer.fontSize}px
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleVisibility();
                                }}
                                className="text-gray-400 p-2"
                              >
                                {layer.visible ? '👁️' : '👁️‍🗨️'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLayer();
                                }}
                                className="text-red-500 p-2"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Export Tab */}
              {activeTab === 'export' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <span className="text-4xl mb-3 block">📤</span>
                    <h3 className="font-bold text-xl">Export Your Design</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold mb-3">Image Format</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setExportFormat('png')}
                          className={`p-4 border-2 rounded-lg text-center ${exportFormat === 'png' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        >
                          <div className="text-xl mb-2">🖼️</div>
                          <div className="font-medium">PNG</div>
                        </button>
                        <button
                          onClick={() => setExportFormat('jpeg')}
                          className={`p-4 border-2 rounded-lg text-center ${exportFormat === 'jpeg' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        >
                          <div className="text-xl mb-2">📸</div>
                          <div className="font-medium">JPEG</div>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-3">Resolution</label>
                      <select
                        value={exportSize}
                        onChange={(e) => setExportSize(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg text-base"
                      >
                        <option value="original">Original Size</option>
                        <option value="high">High Resolution (2x)</option>
                        <option value="medium">Medium Resolution (1.5x)</option>
                      </select>
                    </div>
                    
                    {exportFormat === 'jpeg' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold">Quality: {Math.round(exportQuality * 100)}%</label>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={exportQuality}
                          onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <button
                        onClick={exportDesign}
                        disabled={!canvasReady || designData.layers.length === 0 || isExporting}
                        className="w-full bg-green-600 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium flex items-center justify-center space-x-2"
                      >
                        {isExporting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Exporting...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">📥</span>
                            <span>Download Design</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleSaveAndExport}
                        disabled={!canvasReady || designData.layers.length === 0 || isExporting || isCreatingDesign}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium flex items-center justify-center space-x-2"
                      >
                        {isCreatingDesign || isExporting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">💾</span>
                            <span>Save & Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                {!canvasReady && 'Canvas loading...'}
                {totalImages > 0 && ` • Images: ${imagesLoaded}% loaded`}
                {activeTab === 'export' && ` • Format: ${exportFormat.toUpperCase()}`}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

};

export default MobileCustomizationView;