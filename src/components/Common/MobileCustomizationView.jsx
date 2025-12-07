// components/mobile/MobileCustomizationView.js - WITH EXPORT FUNCTIONALITY
import React, { useState, useRef, useEffect } from 'react';
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
  
  // Local state
  const [activeTab, setActiveTab] = useState('canvas'); // canvas, layers, tools, export
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizeSlider, setShowFontSizeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(0.9);
  const [exportSize, setExportSize] = useState('original');
  const [isExporting, setIsExporting] = useState(false);
  
  // Available fonts and colors from customization
  const availableFonts = customization?.allowedFonts || ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];
  const availableColors = customization?.allowedColors || ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  // Export size options
  const exportSizes = {
    original: { label: 'Original', scale: 1.0 },
    high: { label: 'High (2x)', scale: 2.0 },
    medium: { label: 'Medium (1.5x)', scale: 1.5 },
    low: { label: 'Low (0.75x)', scale: 0.75 }
  };

  // Convert S3 URL to proxy URL (IMPORTANT FOR MOBILE)
  const getProxiedImageUrl = (url) => {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // For mobile, we need to handle CORS differently
    // Use proxy for external images
    if (url.includes('s3.amazonaws.com') || url.includes('velan-ecom-images.s3.ap-south-1.amazonaws.com')) {
      // Use your proxy endpoint
      return `http://localhost:5000/api/images/proxy?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  };

  // Load image with CORS handling - MOBILE OPTIMIZED
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const proxiedSrc = getProxiedImageUrl(src);
      
      // For mobile, we need to handle CORS
      img.crossOrigin = 'Anonymous';
      img.loading = 'eager'; // Mobile optimization
      
      img.onload = () => {
        setImagesLoaded(prev => prev + 1);
        resolve(img);
      };
      
      img.onerror = (err) => {
        console.error('❌ Mobile: Failed to load image:', src, err);
        
        // Try without proxy
        if (proxiedSrc !== src) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setImagesLoaded(prev => prev + 1);
            resolve(fallbackImg);
          };
          fallbackImg.onerror = () => {
            setImagesLoaded(prev => prev + 1);
            // Create placeholder for mobile
            const placeholder = createMobilePlaceholder();
            const placeholderImg = new Image();
            placeholderImg.onload = () => resolve(placeholderImg);
            placeholderImg.src = placeholder;
          };
          fallbackImg.src = src;
        } else {
          setImagesLoaded(prev => prev + 1);
          const placeholder = createMobilePlaceholder();
          const placeholderImg = new Image();
          placeholderImg.onload = () => resolve(placeholderImg);
          placeholderImg.src = placeholder;
        }
      };
      
      // Set timeout for mobile slow connections
      setTimeout(() => {
        if (!img.complete) {
          console.warn('⚠️ Mobile: Image loading timeout, using placeholder');
          setImagesLoaded(prev => prev + 1);
          const placeholder = createMobilePlaceholder();
          const placeholderImg = new Image();
          placeholderImg.onload = () => resolve(placeholderImg);
          placeholderImg.src = placeholder;
        }
      }, 5000);
      
      img.src = proxiedSrc;
    });
  };

  // Create mobile-optimized placeholder
  const createMobilePlaceholder = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Gradient background for mobile
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 200);
    
    // Border
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 180, 180);
    
    // Text
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Image', 100, 70);
    ctx.font = '10px Arial';
    ctx.fillText('Loading...', 100, 95);
    ctx.fillText('or upload custom', 100, 110);
    
    return canvas.toDataURL();
  };

  // Count total images to load
  useEffect(() => {
    if (isOpen && designData) {
      let count = 1; // Base product image
      designData.layers.forEach(layer => {
        if (layer.type === 'image' && layer.visible !== false) {
          count++;
        }
      });
      setTotalImages(count);
      setImagesLoaded(0);
    }
  }, [isOpen, designData]);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      setCanvasReady(false);
      setImagesLoaded(0);
      drawCanvas().then(() => {
        setCanvasReady(true);
      }).catch(error => {
        console.error('Mobile canvas initialization error:', error);
        setCanvasReady(true);
      });
    }
  }, [isOpen, designData]);

  // Draw everything on canvas - MOBILE OPTIMIZED
  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      // Draw product base image
      const baseImageUrl = variant?.variantImages?.[0]?.imageUrl || product?.images?.[0]?.imageUrl;
      if (baseImageUrl) {
        const baseImage = await loadImage(baseImageUrl);
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback background for mobile
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Product Image', canvas.width / 2, canvas.height / 2);
      }
      
      // Draw design layers
      for (const layer of designData.layers) {
        if (layer.visible !== false) {
          await drawLayer(ctx, layer);
        }
      }
      
      // Draw selection if layer is selected
      if (selectedLayer) {
        const layer = designData.layers.find(l => l.id === selectedLayer);
        if (layer) {
          drawLayerSelection(ctx, layer);
        }
      }
    } catch (error) {
      console.error('Error drawing canvas on mobile:', error);
      // Mobile-friendly error display
      ctx.fillStyle = '#fff5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#dc3545';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Canvas Error', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText('Please try again', canvas.width / 2, canvas.height / 2 + 10);
    }
  };

  // Draw text layer
  const drawTextLayer = (ctx, layer) => {
    ctx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize}px ${layer.fontFamily}`;
    ctx.fillStyle = layer.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const metrics = ctx.measureText(layer.text);
    const width = metrics.width;
    const height = layer.fontSize;
    
    ctx.fillText(layer.text, layer.x, layer.y);
    
    return { width, height };
  };

  // Draw image layer
  const drawImageLayer = async (ctx, layer) => {
    try {
      const img = await loadImage(layer.src);
      ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
    } catch (error) {
      console.warn('Mobile: Could not draw image layer:', error);
      // Draw placeholder
      ctx.fillStyle = '#e9ecef';
      ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 1;
      ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
      
      ctx.fillStyle = '#6c757d';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Image', layer.x + layer.width / 2, layer.y + layer.height / 2);
    }
  };

  // Draw shape layer
  const drawShapeLayer = (ctx, layer) => {
    ctx.fillStyle = layer.fillColor || '#000000';
    
    switch (layer.shape) {
      case 'rectangle':
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
  };

  // Draw layer
  const drawLayer = async (ctx, layer) => {
    ctx.save();
    
    try {
      switch (layer.type) {
        case 'text':
          drawTextLayer(ctx, layer);
          break;
        case 'image':
          await drawImageLayer(ctx, layer);
          break;
        case 'shape':
          drawShapeLayer(ctx, layer);
          break;
      }
    } catch (error) {
      console.error('Mobile: Error drawing layer:', error);
    }
    
    ctx.restore();
  };

  // Draw layer for export (scaled version)
  const drawLayerForExport = async (ctx, layer, scale) => {
    ctx.save();
    
    try {
      switch (layer.type) {
        case 'text':
          ctx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize * scale}px ${layer.fontFamily}`;
          ctx.fillStyle = layer.color;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(layer.text, layer.x * scale, layer.y * scale);
          break;
          
        case 'image':
          try {
            const img = await loadImage(layer.src);
            ctx.drawImage(
              img, 
              layer.x * scale, 
              layer.y * scale, 
              layer.width * scale, 
              layer.height * scale
            );
          } catch (error) {
            console.warn('Skipping image in export:', layer.src);
          }
          break;
          
        case 'shape':
          ctx.fillStyle = layer.fillColor || '#000000';
          if (layer.shape === 'rectangle') {
            ctx.fillRect(
              layer.x * scale, 
              layer.y * scale, 
              layer.width * scale, 
              layer.height * scale
            );
          } else if (layer.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(
              (layer.x + layer.width / 2) * scale,
              (layer.y + layer.height / 2) * scale,
              (layer.width / 2) * scale,
              0, 2 * Math.PI
            );
            ctx.fill();
          }
          break;
      }
    } catch (error) {
      console.error('Error drawing layer for export:', layer, error);
    }
    
    ctx.restore();
  };

  // Draw layer selection (for touch)
  const drawLayerSelection = (ctx, layer) => {
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
      const handleSize = 10; // Larger for touch
      
      // Top-left
      ctx.fillRect(layer.x - handleSize/2, layer.y - handleSize/2, handleSize, handleSize);
      // Top-right
      ctx.fillRect(layer.x + width - handleSize/2, layer.y - handleSize/2, handleSize, handleSize);
      // Bottom-left
      ctx.fillRect(layer.x - handleSize/2, layer.y + height - handleSize/2, handleSize, handleSize);
      // Bottom-right
      ctx.fillRect(layer.x + width - handleSize/2, layer.y + height - handleSize/2, handleSize, handleSize);
    }
  };

  // EXPORT FUNCTIONALITY FOR MOBILE
  const exportDesign = async () => {
    if (!canvasReady) {
      alert('Canvas is still loading. Please wait a moment and try again.');
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
      
      // White background for export
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw product base image
      const baseImageUrl = variant?.variantImages?.[0]?.imageUrl || product?.images?.[0]?.imageUrl;
      if (baseImageUrl) {
        try {
          const baseImage = await loadImage(baseImageUrl);
          exportCtx.drawImage(baseImage, 0, 0, exportCanvas.width, exportCanvas.height);
        } catch (error) {
          console.warn('Could not load base image for export:', error);
        }
      }
      
      // Draw design layers
      for (const layer of designData.layers) {
        if (layer.visible !== false) {
          await drawLayerForExport(exportCtx, layer, scale);
        }
      }
      
      // Generate data URL
      let dataUrl;
      const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = exportFormat === 'jpeg' ? exportQuality : undefined;
      
      dataUrl = exportCanvas.toDataURL(mimeType, quality);
      
      // Download the image
      downloadImage(dataUrl, mimeType);
      
      setIsExporting(false);
      return dataUrl;
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again or use a different format.');
      setIsExporting(false);
      throw error;
    }
  };

  // Download image helper
  const downloadImage = (dataUrl, mimeType) => {
    const link = document.createElement('a');
    const extension = mimeType.split('/')[1];
    const fileName = `design-${product?.name || 'custom'}-${Date.now()}.${extension}`;
    
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mobile-friendly alert
    setTimeout(() => {
      alert(`✅ Design exported successfully!\nFile: ${fileName}`);
    }, 100);
  };

  // Handle save and export
  const handleSaveAndExport = async () => {
    try {
      await handleSaveDesign();
      await exportDesign();
    } catch (error) {
      console.error('Save and export failed:', error);
    }
  };

  // Touch handlers for canvas
  const handleTouchStart = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if touch is on a layer
    const touchedLayer = [...designData.layers]
      .reverse()
      .find(layer => {
        if (!layer.visible) return false;
        
        const width = layer.width || 100;
        const height = layer.height || 50;
        
        // Check resize handles first (for images/shapes)
        if (selectedLayer === layer.id && (layer.type === 'image' || layer.type === 'shape')) {
          const handleSize = 15; // Touch-friendly size
          
          // Top-left
          if (x >= layer.x - handleSize/2 && x <= layer.x + handleSize/2 && 
              y >= layer.y - handleSize/2 && y <= layer.y + handleSize/2) {
            setIsResizing(true);
            setResizeDirection('nw');
            setDragOffset({ x: x - layer.x, y: y - layer.y });
            return true;
          }
          // Top-right
          if (x >= layer.x + width - handleSize/2 && x <= layer.x + width + handleSize/2 && 
              y >= layer.y - handleSize/2 && y <= layer.y + handleSize/2) {
            setIsResizing(true);
            setResizeDirection('ne');
            setDragOffset({ x: x - (layer.x + width), y: y - layer.y });
            return true;
          }
          // Bottom-left
          if (x >= layer.x - handleSize/2 && x <= layer.x + handleSize/2 && 
              y >= layer.y + height - handleSize/2 && y <= layer.y + height + handleSize/2) {
            setIsResizing(true);
            setResizeDirection('sw');
            setDragOffset({ x: x - layer.x, y: y - (layer.y + height) });
            return true;
          }
          // Bottom-right
          if (x >= layer.x + width - handleSize/2 && x <= layer.x + width + handleSize/2 && 
              y >= layer.y + height - handleSize/2 && y <= layer.y + height + handleSize/2) {
            setIsResizing(true);
            setResizeDirection('se');
            setDragOffset({ x: x - (layer.x + width), y: y - (layer.y + height) });
            return true;
          }
        }
        
        // Check if touch is on layer body
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
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDragging && !isResizing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (isDragging && selectedLayer) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
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
      
      switch (resizeDirection) {
        case 'se': // bottom-right
          newWidth = Math.max(30, x - layer.x);
          newHeight = Math.max(30, y - layer.y);
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(30, layer.x + currentWidth - x);
          newHeight = Math.max(30, y - layer.y);
          newX = x;
          break;
        case 'ne': // top-right
          newWidth = Math.max(30, x - layer.x);
          newHeight = Math.max(30, layer.y + currentHeight - y);
          newY = y;
          break;
        case 'nw': // top-left
          newWidth = Math.max(30, layer.x + currentWidth - x);
          newHeight = Math.max(30, layer.y + currentHeight - y);
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
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  // Simplified functions for mobile
  const handleAddText = () => {
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
  };
  
  const handleAddImage = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Mobile file size check
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ Image size should be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('❌ Please select a valid image file');
      return;
    }
    
    // Show loading state
    setCanvasReady(false);
    
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
          width: Math.min(img.width, 200),
          height: Math.min(img.height, 200),
          originalWidth: img.width,
          originalHeight: img.height,
          visible: true,
          createdAt: new Date().toISOString()
        };
        
        dispatch(addDesignLayer(newLayer));
        setSelectedLayer(newLayer.id);
        setActiveTab('canvas');
        drawCanvas().finally(() => setCanvasReady(true));
      };
      img.onerror = () => {
        alert('❌ Failed to load the selected image');
        setCanvasReady(true);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      alert('❌ Failed to read the selected file');
      setCanvasReady(true);
    };
    reader.readAsDataURL(file);
    
    event.target.value = '';
  };

  // Add shape
  const handleAddShape = (shape) => {
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
  };
  
  const handleSaveDesign = async () => {
    if (designData.layers.length === 0) {
      alert('Please add at least one design element before saving.');
      return;
    }
    
    if (!canvasReady) {
      alert('Canvas is still loading. Please wait...');
      return;
    }

    try {
      const preview = canvasRef.current?.toDataURL('image/png');
      const designDataToSave = {
        customizationId: customization.id,
        designData: {
          layers: designData.layers.map(layer => ({
            ...layer,
            src: layer.type === 'image' && layer.src.startsWith('http') ? 
                 `[EXTERNAL:${layer.src}]` : layer.src
          })),
          canvasSize: designData.canvasSize,
          version: '1.0',
          createdAt: new Date().toISOString()
        },
        previewImage: preview,
        thumbnailImage: preview
      };
      
      await createDesign(designDataToSave).unwrap();
      dispatch(setPreviewImage(preview));
      alert('🎉 Design saved successfully!');
      onClose();
    } catch (error) {
      console.error('❌ Mobile: Failed to save design:', error);
      alert('Failed to save design. Please try again.');
    }
  };
  
  const handleDeleteLayer = () => {
    if (selectedLayer) {
      dispatch(removeDesignLayer(selectedLayer));
      setSelectedLayer(null);
      drawCanvas().catch(console.error);
    }
  };
  
  const handleResetDesign = () => {
    if (window.confirm('Are you sure you want to reset your design? This cannot be undone.')) {
      dispatch(resetDesign());
      setSelectedLayer(null);
      drawCanvas().catch(console.error);
    }
  };

  const handleDuplicateLayer = () => {
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
  };

  const handleReorderLayer = (direction) => {
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
  };

  const handleToggleVisibility = () => {
    if (!selectedLayer) return;

    const layer = designData.layers.find(l => l.id === selectedLayer);
    if (layer) {
      dispatch(updateDesignLayer({
        layerId: selectedLayer,
        updates: { visible: !layer.visible }
      }));
      drawCanvas().catch(console.error);
    }
  };

  const updateSelectedLayer = (updates) => {
    if (!selectedLayer) return;
    
    dispatch(updateDesignLayer({
      layerId: selectedLayer,
      updates
    }));
    drawCanvas().catch(console.error);
  };

  // Get selected layer data
  const selectedLayerData = designData.layers.find(layer => layer.id === selectedLayer);

  // Mobile modal close handler
  const handleClose = () => {
    if (designData.layers.length > 0) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 bg-white p-4 flex items-center justify-between z-20 border-b border-gray-200 shadow-sm">
        <button
          onClick={handleClose}
          className="text-2xl text-gray-600 w-10 h-10 flex items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1 px-2">
          <h2 className="text-lg font-bold text-center truncate">
            Customize {product?.name}
          </h2>
          <div className="text-xs text-gray-500 text-center mt-1">
            {designData.layers.length} layer{designData.layers.length !== 1 ? 's' : ''}
            {totalImages > 0 && imagesLoaded < totalImages && ` • Loading images...`}
          </div>
        </div>
        <button
          onClick={handleSaveDesign}
          disabled={isCreatingDesign || designData.layers.length === 0 || !canvasReady}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-w-16"
        >
          {isCreatingDesign ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      {/* Main Canvas Area - Takes most of screen */}
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
          
          {/* Loading overlay */}
          {!canvasReady && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading design editor...</p>
                {totalImages > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Images: {imagesLoaded}/{totalImages}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Empty state */}
          {designData.layers.length === 0 && canvasReady && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-500 bg-white p-6 rounded-lg border border-gray-200 max-w-xs mx-4 shadow-sm">
                <div className="text-4xl mb-3">🎨</div>
                <p className="font-semibold mb-2">Start Designing!</p>
                <p className="text-sm text-gray-600 mb-3">Tap the + button below to add:</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• 📝 Text with custom fonts</p>
                  <p>• 🖼️ Images from your gallery</p>
                  <p>• ⬜ Shapes and graphics</p>
                </div>
                <p className="text-xs text-blue-600 mt-4">
                  💡 <strong>Tip:</strong> Upload images for best results
                </p>
              </div>
            </div>
          )}
          
          {/* Selected layer instructions */}
          {selectedLayerData && canvasReady && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-full pointer-events-none">
              {selectedLayerData.type === 'image' || selectedLayerData.type === 'shape' ? (
                <span>Drag corners to resize • Tap to move</span>
              ) : (
                <span>Tap and drag to move</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button
        onClick={() => setActiveTab('tools')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-30 active:scale-95 transition-transform"
      >
        +
      </button>
      
      {/* Bottom Tab Bar - UPDATED WITH EXPORT */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="flex justify-around p-2">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex flex-col items-center p-2 flex-1 ${activeTab === 'canvas' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">🎨</span>
            <span className="text-xs mt-1">Canvas</span>
          </button>
          
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex flex-col items-center p-2 flex-1 ${activeTab === 'layers' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">📋</span>
            <span className="text-xs mt-1">Layers</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex flex-col items-center p-2 flex-1 ${activeTab === 'tools' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">🛠️</span>
            <span className="text-xs mt-1">Tools</span>
          </button>
          
          <button
            onClick={() => setActiveTab('export')}
            className={`flex flex-col items-center p-2 flex-1 ${activeTab === 'export' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">📤</span>
            <span className="text-xs mt-1">Export</span>
          </button>
          
          <button
            onClick={handleResetDesign}
            className="flex flex-col items-center p-2 flex-1 text-gray-600"
          >
            <span className="text-xl">🔄</span>
            <span className="text-xs mt-1">Reset</span>
          </button>
        </div>
      </div>
      
      {/* Bottom Sheet for Tools/Layers/Export */}
      {activeTab !== 'canvas' && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setActiveTab('canvas')}
          />
          
          {/* Bottom Sheet */}
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-40 max-h-[85vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="px-4 pt-2 pb-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  {activeTab === 'tools' ? 'Design Tools' : 
                   activeTab === 'layers' ? 'Layers' : 
                   activeTab === 'export' ? 'Export Design' : ''}
                </h3>
                <button
                  onClick={() => setActiveTab('canvas')}
                  className="text-gray-500 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'tools' ? (
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
                      className="w-full bg-blue-600 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium active:scale-95 transition-transform"
                    >
                      Add Text to Design
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-gray-500 text-sm">or</span>
                    </div>
                  </div>
                  
                  {/* Image Tool */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🖼️</span>
                      <span className="font-semibold text-lg">Add Image</span>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>💡 Tip:</strong> Upload images from your gallery for full functionality and better quality.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleAddImage}
                      className="w-full bg-green-600 text-white py-4 rounded-lg text-base font-medium active:scale-95 transition-transform flex items-center justify-center space-x-2"
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
                    
                    <div className="bg-gray-50 p-4 rounded border">
                      <h5 className="font-medium text-sm mb-2">Image Guidelines:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Max file size: 10MB</li>
                        <li>• Supported: JPG, PNG, GIF</li>
                        <li>• Use corners to resize after adding</li>
                        <li>• Tap and drag to move</li>
                      </ul>
                    </div>
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
                        className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-base flex flex-col items-center active:scale-95 transition-transform"
                      >
                        <span className="text-2xl mb-2">▭</span>
                        <span>Rectangle</span>
                      </button>
                      <button
                        onClick={() => handleAddShape('circle')}
                        className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-base flex flex-col items-center active:scale-95 transition-transform"
                      >
                        <span className="text-2xl mb-2">⚪</span>
                        <span>Circle</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Selected Layer Properties */}
                  {selectedLayerData && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-lg mb-3">Selected Layer</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-base">Visible</span>
                          <button
                            onClick={handleToggleVisibility}
                            className={`w-12 h-6 rounded-full transition-all duration-200 ${
                              selectedLayerData.visible ? 'bg-blue-600' : 'bg-gray-300'
                            } relative`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                                selectedLayerData.visible ? 'transform translate-x-7' : 'transform translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        
                        {selectedLayerData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-sm mb-2">Font</label>
                              <select
                                value={selectedLayerData.fontFamily}
                                onChange={(e) => updateSelectedLayer({ fontFamily: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                              >
                                {availableFonts.map(font => (
                                  <option key={font} value={font}>{font}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm mb-2">Size</label>
                              <input
                                type="number"
                                value={selectedLayerData.fontSize}
                                onChange={(e) => updateSelectedLayer({ fontSize: parseInt(e.target.value) })}
                                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                                min="8"
                                max="144"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm mb-2">Color</label>
                              <div className="grid grid-cols-4 gap-2">
                                {availableColors.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => updateSelectedLayer({ color })}
                                    className={`w-10 h-10 rounded-full border-2 ${selectedLayerData.color === color ? 'border-blue-500' : 'border-gray-300'}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <button
                            onClick={handleDuplicateLayer}
                            className="bg-gray-200 hover:bg-gray-300 py-3 rounded-lg text-base font-medium active:scale-95 transition-transform"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={handleDeleteLayer}
                            className="bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-lg text-base font-medium active:scale-95 transition-transform"
                          >
                            Delete
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleReorderLayer('up')}
                            className="bg-gray-200 hover:bg-gray-300 py-3 rounded-lg text-base font-medium active:scale-95 transition-transform"
                          >
                            Move Up
                          </button>
                          <button
                            onClick={() => handleReorderLayer('down')}
                            className="bg-gray-200 hover:bg-gray-300 py-3 rounded-lg text-base font-medium active:scale-95 transition-transform"
                          >
                            Move Down
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'layers' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">Design Layers</h4>
                    <span className="text-sm text-gray-500">{designData.layers.length} total</span>
                  </div>
                  
                  {designData.layers.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-5xl mb-4 block">📋</span>
                      <p className="text-gray-500 text-lg">No layers yet</p>
                      <p className="text-gray-400 text-sm mt-2">Add elements from the Tools tab</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...designData.layers].reverse().map(layer => (
                        <div
                          key={layer.id}
                          onClick={() => setSelectedLayer(layer.id)}
                          className={`p-4 border-2 rounded-lg ${selectedLayer === layer.id ? 'bg-blue-50 border-blue-500' : 'border-gray-200 bg-white'} ${!layer.visible ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl">
                                {layer.type === 'text' ? '📝' : 
                                 layer.type === 'image' ? '🖼️' : '⬜'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-base truncate">
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
                                title={layer.visible ? 'Hide' : 'Show'}
                              >
                                {layer.visible ? '👁️' : '👁️‍🗨️'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLayer();
                                }}
                                className="text-red-500 p-2"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Layer Controls */}
                  {selectedLayerData && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Layer Controls</span>
                        <button
                          onClick={() => setSelectedLayer(null)}
                          className="text-gray-500"
                        >
                          Clear
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleDuplicateLayer}
                          className="bg-white border border-gray-300 py-3 rounded-lg text-base font-medium active:scale-95 transition-transform"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleReorderLayer('up')}
                          className="bg-white border border-gray-300 py-3 rounded-lg text-base font-medium active:scale-95 transition-transform"
                        >
                          Move Up
                        </button>
                        <button
                          onClick={() => handleReorderLayer('down')}
                          className="bg-white border border-gray-300 py-3 rounded-lg text-base font-medium active:scale-95 transition-transform"
                        >
                          Move Down
                        </button>
                        <button
                          onClick={handleToggleVisibility}
                          className="bg-white border border-gray-300 py-3 rounded-lg text-base font-medium active:scale-95 transition-transform"
                        >
                          {selectedLayerData.visible ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'export' ? (
                <div className="space-y-6">
                  {/* Export Header */}
                  <div className="text-center mb-6">
                    <span className="text-4xl mb-3 block">📤</span>
                    <h3 className="font-bold text-xl">Export Your Design</h3>
                    <p className="text-gray-600 mt-2">Download your design as an image file</p>
                  </div>
                  
                  {/* Export Settings */}
                  <div className="space-y-5">
                    {/* Format Selection */}
                    <div>
                      <label className="block text-sm font-semibold mb-3">Image Format</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setExportFormat('png')}
                          className={`p-4 border-2 rounded-lg text-center ${exportFormat === 'png' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        >
                          <div className="text-xl mb-2">🖼️</div>
                          <div className="font-medium">PNG</div>
                          <div className="text-xs text-gray-500 mt-1">High Quality</div>
                        </button>
                        <button
                          onClick={() => setExportFormat('jpeg')}
                          className={`p-4 border-2 rounded-lg text-center ${exportFormat === 'jpeg' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        >
                          <div className="text-xl mb-2">📸</div>
                          <div className="font-medium">JPEG</div>
                          <div className="text-xs text-gray-500 mt-1">Smaller Size</div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Size Selection */}
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
                        <option value="low">Low Resolution (0.75x)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        {exportSizes[exportSize].label} - {Math.round(exportSizes[exportSize].scale * 100)}% scale
                      </p>
                    </div>
                    
                    {/* Quality for JPEG */}
                    {exportFormat === 'jpeg' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold">Quality: {Math.round(exportQuality * 100)}%</label>
                          <span className="text-sm text-gray-600">
                            {exportQuality >= 0.9 ? 'Best' : 
                             exportQuality >= 0.7 ? 'Good' : 
                             exportQuality >= 0.5 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={exportQuality}
                          onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Smaller</span>
                          <span>Larger</span>
                        </div>
                      </div>
                    )}
                    
                    {/* File Size Estimate */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Estimated Size</p>
                          <p className="text-sm text-gray-600">
                            {exportFormat === 'png' ? '2-5 MB' : 
                             exportQuality >= 0.9 ? '1-3 MB' : 
                             exportQuality >= 0.7 ? '0.5-2 MB' : 
                             '0.2-1 MB'}
                          </p>
                        </div>
                        <span className="text-2xl">💾</span>
                      </div>
                    </div>
                    
                    {/* Export Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={exportDesign}
                        disabled={!canvasReady || designData.layers.length === 0 || isExporting}
                        className="w-full bg-green-600 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium active:scale-95 transition-transform flex items-center justify-center space-x-2"
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
                        className="w-full bg-blue-600 text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium active:scale-95 transition-transform flex items-center justify-center space-x-2"
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
                      
                      <button
                        onClick={handleSaveDesign}
                        disabled={!canvasReady || designData.layers.length === 0 || isCreatingDesign}
                        className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium active:scale-95 transition-transform"
                      >
                        {isCreatingDesign ? 'Saving...' : 'Save Only'}
                      </button>
                    </div>
                    
                    {/* Export Tips */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">💡 Export Tips:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• PNG for best quality (transparency support)</li>
                        <li>• JPEG for smaller file sizes</li>
                        <li>• High resolution for printing</li>
                        <li>• Original size for web use</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                Max {customization?.maxTextLength || 100} characters • Max {customization?.maxImages || 5} images
                {!canvasReady && ' • Canvas loading...'}
                {totalImages > 0 && imagesLoaded < totalImages && ` • Images: ${imagesLoaded}/${totalImages}`}
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