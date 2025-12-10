import { useCallback, useEffect, useRef, useState } from "react";
import { addDesignLayer ,  updateDesignLayer, 
  removeDesignLayer, 
  reorderDesignLayers, 
  resetDesign,
  setPreviewImage } from "../../redux/slices/customizationSlice";


  
// components/Common/DesktopCustomizationView.jsx
const DesktopCustomizationView = ({
  isOpen,
  onClose,
  product,
  variant,
  customization,
  designData,
  isCreatingDesign,
  createDesign,
  dispatch,

  // Rename these props to avoid conflict
  variantImages: propVariantImages,
  selectedColor: propSelectedColor,
  handleColorChange,
  activeImageIndex: propActiveImageIndex,
  handleImageSelect,
  availableColors: propAvailableColors, // Renamed
  selectedImage: propSelectedImage,     // Renamed
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const retryCountRef = useRef(0);
  const imageCacheRef = useRef(new Map());
  
  // Local state
  const [activeTool, setActiveTool] = useState('text');
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasReady, setCanvasReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(1.0);
  const [exportSize, setExportSize] = useState('original');
  const [activeMobileTab, setActiveMobileTab] = useState('tools');
  const [mobileView, setMobileView] = useState('canvas');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resizeHandleSize, setResizeHandleSize] = useState(12);
  // Use the renamed props
  const availableColors = customization?.allowedColors || ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const availableFonts = customization?.allowedFonts || ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];


  // Get resize handles for a layer
const getResizeHandles = useCallback((layer) => {
  if (!layer || !layer.width || !layer.height) return [];
  
  const width = layer.width;
  const height = layer.height;
  const handleSize = resizeHandleSize;
  
  return [
    { 
      x: layer.x - handleSize/2, 
      y: layer.y - handleSize/2, 
      direction: 'nw',
      cursor: 'nwse-resize'
    },
    { 
      x: layer.x + width - handleSize/2, 
      y: layer.y - handleSize/2, 
      direction: 'ne',
      cursor: 'nesw-resize'
    },
    { 
      x: layer.x - handleSize/2, 
      y: layer.y + height - handleSize/2, 
      direction: 'sw',
      cursor: 'nesw-resize'
    },
    { 
      x: layer.x + width - handleSize/2, 
      y: layer.y + height - handleSize/2, 
      direction: 'se',
      cursor: 'nwse-resize'
    },
    // Middle handles for better control
    { 
      x: layer.x + width/2 - handleSize/2, 
      y: layer.y - handleSize/2, 
      direction: 'n',
      cursor: 'ns-resize'
    },
    { 
      x: layer.x + width/2 - handleSize/2, 
      y: layer.y + height - handleSize/2, 
      direction: 's',
      cursor: 'ns-resize'
    },
    { 
      x: layer.x - handleSize/2, 
      y: layer.y + height/2 - handleSize/2, 
      direction: 'w',
      cursor: 'ew-resize'
    },
    { 
      x: layer.x + width - handleSize/2, 
      y: layer.y + height/2 - handleSize/2, 
      direction: 'e',
      cursor: 'ew-resize'
    },
  ];
}, [resizeHandleSize]);


// Check if point is inside a resize handle
const isPointInResizeHandle = useCallback((pointX, pointY, handleX, handleY) => {
  return pointX >= handleX && 
         pointX <= handleX + resizeHandleSize && 
         pointY >= handleY && 
         pointY <= handleY + resizeHandleSize;
}, [resizeHandleSize]);


  // Export size options
  const exportSizes = {
    original: { label: 'Original', scale: 1.0 },
    high: { label: 'High (2x)', scale: 2.0 },
    medium: { label: 'Medium (1.5x)', scale: 1.5 },
    low: { label: 'Low (0.75x)', scale: 0.75 }
  };

  // ==================== IMAGE LOADING UTILITIES ====================

  // Create optimized placeholder
  const createPlaceholderImage = useCallback(() => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, '#f8f9fa');
      gradient.addColorStop(1, '#e9ecef');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      // Border
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, 300, 300);
      
      // Text
      ctx.fillStyle = '#adb5bd';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🖼️', 200, 150);
      ctx.font = '16px Arial';
      ctx.fillText('Image Loading', 200, 200);
      ctx.font = '14px Arial';
      ctx.fillText('Click + to upload', 200, 240);
      
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = canvas.toDataURL('image/png');
    });
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
    
    // For S3 URLs, use proxy
    if (url.includes('amazonaws.com') || url.includes('s3.')) {
      const proxyUrl = `https://tiruppurgarments.com/api/images/proxy?url=${encodeURIComponent(url)}&width=1200&quality=85`;
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
        img.src = '';
        createPlaceholderImage().then(placeholderImg => {
          imageCacheRef.current.set(`loaded_${cacheKey}`, placeholderImg);
          resolve(placeholderImg);
        });
      }, 15000);
      
      img.crossOrigin = 'Anonymous';
      img.loading = 'eager';
      
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
              createPlaceholderImage().then(placeholderImg => {
                imageCacheRef.current.set(`loaded_${cacheKey}`, placeholderImg);
                resolve(placeholderImg);
              });
            };
            fallbackImg.src = src;
          }, 500);
        } else {
          createPlaceholderImage().then(placeholderImg => {
            imageCacheRef.current.set(`loaded_${cacheKey}`, placeholderImg);
            resolve(placeholderImg);
          });
        }
      };
      
      img.src = imageUrl || src;
    });
  }, [createPlaceholderImage, getOptimizedImageUrl]);

  // Add global event listeners for mouse up
useEffect(() => {
  const handleGlobalMouseUp = () => {
    handleMouseUp();
  };

  const handleGlobalMouseMove = (event) => {
    handleMouseMove(event);
  };

  if (isOpen) {
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
  }

  return () => {
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    document.removeEventListener('mousemove', handleGlobalMouseMove);
  };
}, [isOpen, isDragging, isResizing, selectedLayer, dragOffset, resizeDirection]);

  // Count images to load
  useEffect(() => {
    if (isOpen && designData) {
      let count = 0;
      
      const baseImageUrl = variant?.variantImages?.[0]?.imageUrl || product?.images?.[0]?.imageUrl;
      if (baseImageUrl) count++;
      
      designData.layers.forEach(layer => {
        if (layer.type === 'image' && layer.visible !== false && layer.src) {
          count++;
        }
      });
      
      setTotalImages(count);
      setLoadingProgress(0);
      setHasLoadingError(false);
      retryCountRef.current = 0;
    }
  }, [isOpen, designData, variant, product]);

  // Calculate loading percentage
  const imagesLoadedPercentage = totalImages > 0 
    ? Math.min(100, Math.round((loadingProgress / totalImages) * 100))
    : 0;

  // Initialize canvas when modal opens
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
          
          if (retryCountRef.current < 2) {
            setTimeout(async () => {
              try {
                await drawCanvas();
                setCanvasReady(true);
              } catch (retryError) {
                console.error('Retry failed:', retryError);
                setCanvasReady(true);
              }
            }, 2000);
          } else {
            setCanvasReady(true);
          }
        }
      };
      
      initCanvas();
    }
  }, [isOpen, designData]);

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      // ✅ Use selected image from props
      const baseImageUrl = propSelectedImage?.imageUrl || 
                          designData.selectedImage?.imageUrl || 
                          propVariantImages[propActiveImageIndex]?.imageUrl;
      
      if (baseImageUrl) {
        const baseImage = await loadImage(baseImageUrl);
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      } else {
        drawFallbackBackground(ctx, canvas);
      }
      
      // Draw design layers
      for (const layer of designData.layers) {
        if (layer.visible !== false) {
          await drawLayerOnCanvas(ctx, layer);
        }
      }
      
      // Draw selection if any
      if (selectedLayer) {
        const layer = designData.layers.find(l => l.id === selectedLayer);
        if (layer) {
          drawLayerSelection(ctx, layer);
        }
      }
      
    } catch (error) {
      console.error('Error drawing canvas:', error);
      drawFallbackBackground(ctx, canvas);
    }
  }, [propSelectedImage, designData, propVariantImages, propActiveImageIndex, selectedLayer, loadImage]);



  
  // Draw fallback background
  const drawFallbackBackground = useCallback((ctx, canvas) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#6c757d';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛍️', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '18px Arial';
    ctx.fillText(product?.name || 'Product', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#adb5bd';
    ctx.fillText('Add your design elements', canvas.width / 2, canvas.height / 2 + 40);
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
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🖼️', layer.x + layer.width / 2, layer.y + layer.height / 2 - 10);
    ctx.font = '12px Arial';
    ctx.fillText('Image', layer.x + layer.width / 2, layer.y + layer.height / 2 + 10);
  }, []);

  // Draw layer selection
// Draw improved layer selection with resize handles
const drawLayerSelection = useCallback((ctx, layer) => {
  if (!layer) return;
  
  const width = layer.width || 100;
  const height = layer.height || 50;
  
  // Draw selection border
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(layer.x - 5, layer.y - 5, width + 10, height + 10);
  ctx.setLineDash([]);
  
  if (layer.type === 'image' || layer.type === 'shape') {
    const handles = getResizeHandles(layer);
    
    // Draw resize handles
    handles.forEach(handle => {
      // Fill handle with blue color
      ctx.fillStyle = '#007bff';
      ctx.fillRect(handle.x, handle.y, resizeHandleSize, resizeHandleSize);
      
      // Draw handle border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(handle.x, handle.y, resizeHandleSize, resizeHandleSize);
      
      // Add handle indicator based on direction
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let indicator = '';
      switch(handle.direction) {
        case 'nw': indicator = '↖'; break;
        case 'ne': indicator = '↗'; break;
        case 'sw': indicator = '↙'; break;
        case 'se': indicator = '↘'; break;
        case 'n': indicator = '↑'; break;
        case 's': indicator = '↓'; break;
        case 'w': indicator = '←'; break;
        case 'e': indicator = '→'; break;
      }
      
      ctx.fillText(
        indicator, 
        handle.x + resizeHandleSize/2, 
        handle.y + resizeHandleSize/2
      );
    });
  }
}, [getResizeHandles, resizeHandleSize]);

  // Handle retry loading
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

  // Export design as image file
// Export design as image file
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
    
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    // FIX: Use the same base image URL as in drawCanvas
    const baseImageUrl = propSelectedImage?.imageUrl || 
                        designData.selectedImage?.imageUrl || 
                        propVariantImages[propActiveImageIndex]?.imageUrl ||
                        variant?.variantImages?.[0]?.imageUrl || 
                        product?.images?.[0]?.imageUrl;
    
    if (baseImageUrl) {
      try {
        const baseImage = await loadImage(baseImageUrl);
        exportCtx.drawImage(baseImage, 0, 0, exportCanvas.width, exportCanvas.height);
      } catch (error) {
        console.warn('Could not load base image for export:', error);
        // Draw fallback background if image fails to load
        exportCtx.fillStyle = '#f8f9fa';
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        exportCtx.fillStyle = '#6c757d';
        exportCtx.font = `bold ${20 * scale}px Arial`;
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        exportCtx.fillText(product?.name || 'Product', exportCanvas.width / 2, exportCanvas.height / 2);
      }
    } else {
      // Draw fallback background if no image
      exportCtx.fillStyle = '#f8f9fa';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      exportCtx.fillStyle = '#6c757d';
      exportCtx.font = `bold ${20 * scale}px Arial`;
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'middle';
      exportCtx.fillText(product?.name || 'Product', exportCanvas.width / 2, exportCanvas.height / 2);
    }
    
    // Draw design layers
    for (const layer of designData.layers) {
      if (layer.visible !== false) {
        await drawLayerForExport(exportCtx, layer, scale);
      }
    }
    
    let dataUrl;
    const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = exportFormat === 'jpeg' ? exportQuality : undefined;
    
    dataUrl = exportCanvas.toDataURL(mimeType, quality);
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
    
    alert(`✅ Design exported successfully as ${fileName}`);
  };

  // Save design to server
const handleSaveDesign = async () => {
  if (!canvasReady) {
    alert('Canvas is still loading. Please wait a moment and try again.');
    return;
  }

  if (designData.layers.length === 0) {
    alert('Please add at least one design element before saving.');
    return;
  }

  try {
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 400;
    previewCanvas.height = 400;
    const previewCtx = previewCanvas.getContext('2d');
    
    // FIX: Use the same base image URL as in drawCanvas
    const baseImageUrl = propSelectedImage?.imageUrl || 
                        designData.selectedImage?.imageUrl || 
                        propVariantImages[propActiveImageIndex]?.imageUrl ||
                        variant?.variantImages?.[0]?.imageUrl || 
                        product?.images?.[0]?.imageUrl;
    
    if (baseImageUrl) {
      try {
        const baseImage = await loadImage(baseImageUrl);
        previewCtx.drawImage(baseImage, 0, 0, 400, 400);
      } catch (error) {
        previewCtx.fillStyle = '#ffffff';
        previewCtx.fillRect(0, 0, 400, 400);
      }
    } else {
      previewCtx.fillStyle = '#ffffff';
      previewCtx.fillRect(0, 0, 400, 400);
    }
    
    // Draw design layers on preview (scaled down)
    for (const layer of designData.layers) {
      if (layer.visible !== false) {
        const previewLayer = {
          ...layer,
          x: layer.x * 0.5,
          y: layer.y * 0.5,
          width: layer.width * 0.5,
          height: layer.height * 0.5,
          fontSize: layer.fontSize * 0.5
        };
        
        await drawLayerOnCanvas(previewCtx, previewLayer);
      }
    }
    
    const preview = previewCanvas.toDataURL('image/png');
    
    // Save the currently selected image in design data
    const cleanDesignData = {
      layers: designData.layers.map(layer => ({
        ...layer,
        src: layer.type === 'image' && layer.src.startsWith('http') ? 
             `[EXTERNAL:${new URL(layer.src).pathname.split('/').pop()}]` : layer.src
      })),
      canvasSize: designData.canvasSize,
      backgroundColor: designData.backgroundColor,
      selectedImage: {
        imageUrl: baseImageUrl,
        index: propActiveImageIndex,
        color: propSelectedColor
      },
      version: '1.0',
      createdAt: new Date().toISOString()
    };

    const designDataToSave = {
      customizationId: customization.id,
      designData: cleanDesignData,
      previewImage: preview,
      thumbnailImage: preview
    };

    const result = await createDesign(designDataToSave).unwrap();
    dispatch(setPreviewImage(preview));
    alert('🎉 Design saved successfully! You can now add it to your cart.');
    
    return result;
    
  } catch (error) {
    console.error('❌ Failed to save design:', error);
    
    let errorMessage = 'Failed to save design. Please try again.';
    
    if (error.status === 500) {
      errorMessage = 'Server error occurred. Please check the console for details.';
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.message?.includes('Tainted canvases') || error.message?.includes('security')) {
      errorMessage = 'Some images could not be included due to security restrictions. The design has been saved with available elements.';
    }
    
    alert(`❌ ${errorMessage}`);
    throw error;
  }
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

  // Handle export only
  const handleExportOnly = async () => {
    try {
      await exportDesign();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Add text layer
  const handleAddText = () => {
    if (!textInput.trim()) return;

    const newLayer = {
      id: `text_${Date.now()}`,
      type: 'text',
      text: textInput,
      x: 100,
      y: 100,
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
    drawCanvas().catch(console.error);
  };

    // Add image layer
  const handleAddImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('❌ Please select a valid image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Calculate appropriate size based on canvas and image dimensions
        const maxWidth = canvas.width * 0.5; // 50% of canvas width
        const maxHeight = canvas.height * 0.5; // 50% of canvas height
        
        let width = img.width;
        let height = img.height;
        
        // Scale down if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Ensure minimum size
        width = Math.max(100, width);
        height = Math.max(100, height);
        
        // Center the image on canvas
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;

        const newLayer = {
          id: `image_${Date.now()}`,
          type: 'image',
          src: e.target.result,
          x: x,
          y: y,
          width: width,
          height: height,
          originalWidth: img.width,
          originalHeight: img.height,
          visible: true,
          createdAt: new Date().toISOString()
        };

        dispatch(addDesignLayer(newLayer));
        setSelectedLayer(newLayer.id);
        drawCanvas().catch(console.error);
      };
      img.onerror = () => {
        alert('❌ Failed to load the selected image. Please try another image.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      alert('❌ Failed to read the selected file. Please try another image.');
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  // Add shape layer
  const handleAddShape = (shape) => {
    const newLayer = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      shape: shape,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      fillColor: textColor,
      visible: true,
      createdAt: new Date().toISOString()
    };

    dispatch(addDesignLayer(newLayer));
    setSelectedLayer(newLayer.id);
    drawCanvas().catch(console.error);
  };

  // Handle canvas click for layer selection and resize
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    // Get scale factor for canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Correct mouse coordinates
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    let clickedOnResizeHandle = false;
    let clickedLayerId = null;
    let clickedResizeDirection = null;

    // Check if clicked on resize handle of selected layer
    if (selectedLayer) {
      const selectedLayerData = designData.layers.find(l => l.id === selectedLayer);
      if (selectedLayerData && (selectedLayerData.type === 'image' || selectedLayerData.type === 'shape')) {
        const handles = getResizeHandles(selectedLayerData);
        
        for (const handle of handles) {
          if (isPointInResizeHandle(x, y, handle.x, handle.y)) {
            clickedOnResizeHandle = true;
            clickedLayerId = selectedLayer;
            clickedResizeDirection = handle.direction;
            break;
          }
        }
      }
    }

    if (clickedOnResizeHandle) {
      setIsResizing(true);
      setResizeDirection(clickedResizeDirection);
      setDragOffset({
        x: x - selectedLayerData.x,
        y: y - selectedLayerData.y
      });
      return;
    }

    // Check if clicked on any layer
    const clickedLayer = [...designData.layers]
      .reverse()
      .find(layer => {
        if (!layer.visible) return false;
        
        const layerWidth = layer.width || 100;
        const layerHeight = layer.height || 50;
        
        return x >= layer.x && 
              x <= layer.x + layerWidth && 
              y >= layer.y && 
              y <= layer.y + layerHeight;
      });

    if (clickedLayer) {
      setSelectedLayer(clickedLayer.id);
    } else {
      setSelectedLayer(null);
    }
  };

  // Handle layer drag and resize
  const handleMouseDown = (event) => {
    if (!selectedLayer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    // Get scale factor for canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Correct mouse coordinates
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const layer = designData.layers.find(l => l.id === selectedLayer);
    if (!layer) return;

    const width = layer.width || 100;
    const height = layer.height || 50;

    // Check if clicked on resize handle
    if (layer.type === 'image' || layer.type === 'shape') {
      const handles = getResizeHandles(layer);
      
      for (const handle of handles) {
        if (isPointInResizeHandle(x, y, handle.x, handle.y)) {
          setIsResizing(true);
          setResizeDirection(handle.direction);
          setDragOffset({
            x: x - layer.x,
            y: y - layer.y
          });
          
          // Set cursor based on handle direction
          canvas.style.cursor = handle.cursor;
          return;
        }
      }
    }

    // Check if clicked inside the layer for dragging
    if (x >= layer.x && x <= layer.x + width && y >= layer.y && y <= layer.y + height) {
      setIsDragging(true);
      setDragOffset({
        x: x - layer.x,
        y: y - layer.y
      });
      canvas.style.cursor = 'move';
      return true; // Prevent text selection
    }
    
    return false;
  };
  
  // Handle mouse move for drag and resize
  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    // Get scale factor for canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Correct mouse coordinates
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Update cursor when hovering over resize handles
    if (!isDragging && !isResizing && selectedLayer) {
      const layer = designData.layers.find(l => l.id === selectedLayer);
      if (layer && (layer.type === 'image' || layer.type === 'shape')) {
        const handles = getResizeHandles(layer);
        let cursorSet = false;
        
        for (const handle of handles) {
          if (isPointInResizeHandle(x, y, handle.x, handle.y)) {
            canvas.style.cursor = handle.cursor;
            cursorSet = true;
            break;
          }
        }
        
        if (!cursorSet) {
          const width = layer.width || 100;
          const height = layer.height || 50;
          
          if (x >= layer.x && x <= layer.x + width && y >= layer.y && y <= layer.y + height) {
            canvas.style.cursor = 'move';
          } else {
            canvas.style.cursor = 'default';
          }
        }
      }
    }

    if (isDragging && selectedLayer) {
      const layer = designData.layers.find(l => l.id === selectedLayer);
      if (!layer) return;
      
      // Calculate new position
      const newX = Math.max(0, Math.min(canvas.width - (layer.width || 100), x - dragOffset.x));
      const newY = Math.max(0, Math.min(canvas.height - (layer.height || 50), y - dragOffset.y));

      // Update layer position
      dispatch(updateDesignLayer({
        layerId: selectedLayer,
        updates: { x: newX, y: newY }
      }));
      
      // Redraw immediately for smooth dragging
      drawCanvas().catch(console.error);
    } else if (isResizing && selectedLayer) {
      const layer = designData.layers.find(l => l.id === selectedLayer);
      if (!layer) return;

      const currentWidth = layer.width || 100;
      const currentHeight = layer.height || 50;
      let newWidth = currentWidth;
      let newHeight = currentHeight;
      let newX = layer.x;
      let newY = layer.y;

      // Calculate new dimensions based on resize direction
      switch (resizeDirection) {
        case 'nw':
          newWidth = Math.max(20, layer.x + currentWidth - x);
          newHeight = Math.max(20, layer.y + currentHeight - y);
          newX = x;
          newY = y;
          break;
        case 'ne':
          newWidth = Math.max(20, x - layer.x);
          newHeight = Math.max(20, layer.y + currentHeight - y);
          newY = y;
          break;
        case 'sw':
          newWidth = Math.max(20, layer.x + currentWidth - x);
          newHeight = Math.max(20, y - layer.y);
          newX = x;
          break;
        case 'se':
          newWidth = Math.max(20, x - layer.x);
          newHeight = Math.max(20, y - layer.y);
          break;
        case 'n':
          newHeight = Math.max(20, layer.y + currentHeight - y);
          newY = y;
          break;
        case 's':
          newHeight = Math.max(20, y - layer.y);
          break;
        case 'w':
          newWidth = Math.max(20, layer.x + currentWidth - x);
          newX = x;
          break;
        case 'e':
          newWidth = Math.max(20, x - layer.x);
          break;
      }

      // Maintain aspect ratio if Shift is pressed
      if (event.shiftKey && layer.type === 'image' && layer.originalWidth && layer.originalHeight) {
        const aspectRatio = layer.originalWidth / layer.originalHeight;
        
        switch(resizeDirection) {
          case 'nw':
          case 'se':
            newHeight = newWidth / aspectRatio;
            if (resizeDirection === 'nw') {
              newY = layer.y + currentHeight - newHeight;
            }
            break;
          case 'ne':
          case 'sw':
            newWidth = newHeight * aspectRatio;
            if (resizeDirection === 'ne') {
              newX = layer.x + currentWidth - newWidth;
            }
            break;
          case 'n':
          case 's':
            newWidth = newHeight * aspectRatio;
            newX = layer.x - (newWidth - currentWidth) / 2;
            break;
          case 'w':
          case 'e':
            newHeight = newWidth / aspectRatio;
            newY = layer.y - (newHeight - currentHeight) / 2;
            break;
        }
        
        // Keep within bounds
        newX = Math.max(0, Math.min(canvas.width - newWidth, newX));
        newY = Math.max(0, Math.min(canvas.height - newHeight, newY));
      }

      // Apply constraints
      newWidth = Math.max(20, Math.min(canvas.width - newX, newWidth));
      newHeight = Math.max(20, Math.min(canvas.height - newY, newHeight));

      dispatch(updateDesignLayer({
        layerId: selectedLayer,
        updates: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        }
      }));
      
      // Redraw immediately for smooth resizing
      drawCanvas().catch(console.error);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
    
    // Final redraw
    drawCanvas().catch(console.error);
  };

  // Update selected layer properties
  const updateSelectedLayer = (updates) => {
    if (!selectedLayer) return;
    
    dispatch(updateDesignLayer({
      layerId: selectedLayer,
      updates
    }));
    drawCanvas().catch(console.error);
  };

  // Delete selected layer
  const handleDeleteLayer = () => {
    if (!selectedLayer) return;
    
    dispatch(removeDesignLayer(selectedLayer));
    setSelectedLayer(null);
    drawCanvas().catch(console.error);
  };

  // Duplicate selected layer
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

  // Move layer up/down in stack
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

  // Toggle layer visibility
  const handleToggleVisibility = () => {
    if (!selectedLayer) return;

    const layer = designData.layers.find(l => l.id === selectedLayer);
    if (layer) {
      updateSelectedLayer({ visible: !layer.visible });
    }
  };

  // Reset design
  const handleResetDesign = () => {
    if (window.confirm('Are you sure you want to reset your design? This cannot be undone.')) {
      dispatch(resetDesign());
      setSelectedLayer(null);
      imageCacheRef.current.clear();
      drawCanvas().catch(console.error);
    }
  };

  // Handle save and close
  const handleSaveAndClose = async () => {
    try {
      await handleSaveDesign();
      onClose();
    } catch (error) {
      console.error('Save and close failed:', error);
    }
  };



  // Get selected layer
  const selectedLayerData = designData.layers.find(layer => layer.id === selectedLayer);

  if (!isOpen) return null;
  

  const ImageSelector = () => {
    if (!propVariantImages || propVariantImages.length === 0) return null;
    
    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold mb-3 text-sm flex items-center">
          <span className="mr-2">🖼️</span>
          Product Image
        </h4>
        
        {/* Color Selector */}
        {propAvailableColors && propAvailableColors.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2 text-gray-700">Color:</label>
            <div className="flex flex-wrap gap-2">
              {propAvailableColors.map(color => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    propSelectedColor === color.name 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    backgroundImage: color.image ? `url(${color.image})` : 'none',
                    backgroundColor: !color.image ? '#e5e7eb' : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selected: <span className="font-medium">{propSelectedColor}</span>
            </p>
          </div>
        )}
        
        {/* Image Thumbnails */}
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-700">Choose Image:</label>
          <div className="grid grid-cols-4 gap-2">
            {propVariantImages.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => handleImageSelect(image, index)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  propActiveImageIndex === index 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Option ${index + 1}`}
                  className="w-full h-16 object-cover"
                  loading="lazy"
                />
                {propActiveImageIndex === index && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 select-none">
      <div className="bg-white rounded-lg w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[85vh] sm:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-wrap gap-2">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold leading-snug max-w-[70%] sm:max-w-[80%]">
            Customize {product?.name}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl lg:text-3xl p-1"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* Left Sidebar - Tools */}
          <div className="w-full lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r p-3 sm:p-4 overflow-y-auto order-2 lg:order-1">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Design Tools</h3>
            
            <ImageSelector />
            {/* Loading indicator */}
            {!canvasReady && (
              <div className="mb-3 sm:mb-4 p-2 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-800 mr-2"></div>
                Loading design editor...
                {hasLoadingError && (
                  <button
                    onClick={handleRetryLoad}
                    className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                  >
                    🔄 Retry
                  </button>
                )}
              </div>
            )}

            {/* Progress bar */}
            {totalImages > 0 && (
              <div className="mb-3 sm:mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded">
                <div className="flex items-center justify-between">
                  <span>Loading images...</span>
                  <span>{imagesLoadedPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-yellow-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${imagesLoadedPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">
                  {loadingProgress}/{totalImages} images loaded
                </div>
              </div>
            )}

            {/* Mobile Tool Tabs */}
            <div className="lg:hidden mb-4 border-b">
              <div className="flex space-x-1 overflow-x-auto pb-1">
                {['tools', 'text', 'images', 'shapes', 'export', 'layers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveMobileTab(tab)}
                    className={`px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap flex-shrink-0 ${
                      activeMobileTab === tab
                        ? 'bg-white border-t border-l border-r border-gray-300 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 bg-gray-100'
                    }`}
                  >
                    {tab === 'tools' && '🛠️ Tools'}
                    {tab === 'text' && '📝 Text'}
                    {tab === 'images' && '🖼️ Images'}
                    {tab === 'shapes' && '⬜ Shapes'}
                    {tab === 'export' && '📤 Export'}
                    {tab === 'layers' && '📋 Layers'}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tools Content */}
            <div className="space-y-4">
              {/* Tools Tab Content - Mobile */}
              {(activeMobileTab === 'tools' || !activeMobileTab) && (
                <div className="lg:hidden">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setActiveMobileTab('text')}
                      className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100 text-sm flex flex-col items-center transition-all duration-200 active:scale-95"
                    >
                      <span className="text-2xl mb-2">📝</span>
                      <span>Add Text</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100 text-sm flex flex-col items-center transition-all duration-200 active:scale-95"
                    >
                      <span className="text-2xl mb-2">🖼️</span>
                      <span>Add Image</span>
                    </button>
                    <button
                      onClick={() => setActiveMobileTab('shapes')}
                      className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100 text-sm flex flex-col items-center transition-all duration-200 active:scale-95"
                    >
                      <span className="text-2xl mb-2">⬜</span>
                      <span>Shapes</span>
                    </button>
                    <button
                      onClick={() => setActiveMobileTab('export')}
                      className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100 text-sm flex flex-col items-center transition-all duration-200 active:scale-95"
                    >
                      <span className="text-2xl mb-2">📤</span>
                      <span>Export</span>
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Quick Tips</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Click and drag to move elements</li>
                      <li>• Use corners to resize images</li>
                      <li>• Hold Shift to maintain proportions</li>
                      <li>• Upload images for best quality</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Text Tab - Mobile */}
              {activeMobileTab === 'text' && (
                <div className="lg:hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Text Tool</h4>
                    <button
                      onClick={() => setActiveMobileTab('tools')}
                      className="text-xs text-blue-600 hover:text-blue-800 bg-blue-100 px-2 py-1 rounded"
                    >
                      ← Back
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Text</label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter your text here..."
                      className="w-full p-3 border border-gray-300 rounded text-sm"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Font</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        {availableFonts.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Size: {fontSize}px</label>
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
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setTextColor(color)}
                          className={`w-8 h-8 rounded border-2 ${
                            textColor === color ? 'border-blue-500' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddText}
                    disabled={!textInput.trim()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 active:scale-95"
                  >
                    Add Text to Canvas
                  </button>
                </div>
              )}

              {/* Images Tab - Mobile */}
              {activeMobileTab === 'images' && (
                <div className="lg:hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Image Tool</h4>
                    <button
                      onClick={() => setActiveMobileTab('tools')}
                      className="text-xs text-blue-600 hover:text-blue-800 bg-blue-100 px-2 py-1 rounded"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>💡 Tip:</strong> Upload images from your device for full functionality and better quality.
                    </p>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 text-sm font-medium transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <span>📁</span>
                    <span>Choose Image from Device</span>
                  </button>

                  <div className="bg-gray-50 p-3 rounded border">
                    <h5 className="font-medium text-xs mb-2">Image Guidelines:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Max file size: 5MB</li>
                      <li>• Supported: JPG, PNG, GIF</li>
                      <li>• Use corners to resize after adding</li>
                      <li>• Hold Shift to maintain proportions</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Export Tab - Mobile */}
              {activeMobileTab === 'export' && (
                <div className="lg:hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Export Settings</h4>
                    <button
                      onClick={() => setActiveMobileTab('tools')}
                      className="text-xs text-blue-600 hover:text-blue-800 bg-blue-100 px-2 py-1 rounded"
                    >
                      ← Back
                    </button>
                  </div>
                  
                  <div className="space-y-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium mb-1">Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="png">PNG (High Quality)</option>
                        <option value="jpeg">JPEG (Smaller Size)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-1">Size</label>
                      <select
                        value={exportSize}
                        onChange={(e) => setExportSize(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="original">Original Size</option>
                        <option value="high">High Resolution (2x)</option>
                        <option value="medium">Medium Resolution (1.5x)</option>
                        <option value="low">Low Resolution (0.75x)</option>
                      </select>
                    </div>
                    
                    {exportFormat === 'jpeg' && (
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Quality: {Math.round(exportQuality * 100)}%
                        </label>
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
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={handleExportOnly}
                        disabled={!canvasReady || designData.layers.length === 0 || isExporting}
                        className="bg-green-600 text-white py-2 px-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs transition-all duration-200 active:scale-95"
                      >
                        {isExporting ? 'Exporting...' : 'Export Only'}
                      </button>
                      <button
                        onClick={handleSaveAndExport}
                        disabled={!canvasReady || designData.layers.length === 0 || isExporting}
                        className="bg-blue-600 text-white py-2 px-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs transition-all duration-200 active:scale-95"
                      >
                        Save & Export
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Tool Selection */}
              <div className="hidden lg:block mb-4">
                <label className="block text-sm font-medium mb-2">Tools</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTool('text')}
                    className={`p-2 border rounded text-sm transition-all duration-200 ${
                      activeTool === 'text' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    📝 Text
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-all duration-200"
                  >
                    🖼️ Image
                  </button>
                  <button
                    onClick={() => setActiveTool('shapes')}
                    className={`p-2 border rounded text-sm transition-all duration-200 ${
                      activeTool === 'shapes' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    ⬜ Shapes
                  </button>
                  <button
                    onClick={() => setActiveTool('arrange')}
                    className={`p-2 border rounded text-sm transition-all duration-200 ${
                      activeTool === 'arrange' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    🔄 Arrange
                  </button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAddImage}
                accept="image/*"
                className="hidden"
              />

              {/* Text Tool - Desktop */}
              {activeTool === 'text' && (
                <div className="hidden lg:block space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text</label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter your text here..."
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      {availableFonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Size: {fontSize}px</label>
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
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {showColorPicker ? 'Hide Colors' : 'Show Colors'}
                      </button>
                    </div>
                    
                    {showColorPicker && (
                      <div className="grid grid-cols-4 gap-2 mb-3 p-2 bg-gray-50 rounded">
                        {availableColors.map(color => (
                          <button
                            key={color}
                            onClick={() => setTextColor(color)}
                            className={`w-8 h-8 rounded border-2 transition-all duration-200 ${
                              textColor === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddText}
                    disabled={!textInput.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm transition-all duration-200"
                  >
                    Add Text to Canvas
                  </button>
                </div>
              )}

              {/* Shapes Tool - Desktop */}
              {activeTool === 'shapes' && (
                <div className="hidden lg:block space-y-4">
                  <label className="block text-sm font-medium mb-2">Shapes</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddShape('rectangle')}
                      className="p-3 border border-gray-300 rounded hover:bg-gray-100 text-sm transition-all duration-200"
                    >
                      ▭ Rectangle
                    </button>
                    <button
                      onClick={() => handleAddShape('circle')}
                      className="p-3 border border-gray-300 rounded hover:bg-gray-100 text-sm transition-all duration-200"
                    >
                      ⚪ Circle
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Shape Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setTextColor(color)}
                          className={`w-8 h-8 rounded border-2 transition-all duration-200 ${
                            textColor === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Export Settings */}
              <div className="hidden lg:block mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-semibold text-sm mb-2">Export Settings</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs mb-1">Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="png">PNG (High Quality)</option>
                      <option value="jpeg">JPEG (Smaller Size)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs mb-1">Size</label>
                    <select
                      value={exportSize}
                      onChange={(e) => setExportSize(e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="original">Original Size</option>
                      <option value="high">High Resolution (2x)</option>
                      <option value="medium">Medium Resolution (1.5x)</option>
                      <option value="low">Low Resolution (0.75x)</option>
                    </select>
                  </div>
                  
                  {exportFormat === 'jpeg' && (
                    <div>
                      <label className="block text-xs mb-1">Quality: {Math.round(exportQuality * 100)}%</label>
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
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={handleExportOnly}
                      disabled={!canvasReady || designData.layers.length === 0 || isExporting}
                      className="text-xs bg-green-600 text-white py-2 px-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                    <button
                      onClick={handleSaveAndExport}
                      disabled={!canvasReady || designData.layers.length === 0 || isExporting}
                      className="text-xs bg-blue-600 text-white py-2 px-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Save & Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Loading Tip */}
              <div className="p-2 bg-orange-100 text-orange-800 text-xs rounded">
                <strong>💡 Tip:</strong> Upload images from your computer for full functionality.
              </div>
            </div>

            {/* Layer Properties */}
            {selectedLayerData && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white border rounded">
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Layer Properties</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">Visible</span>
                    <button
                      onClick={handleToggleVisibility}
                      className={`w-10 h-6 rounded-full transition-all duration-200 ${
                        selectedLayerData.visible ? 'bg-blue-600' : 'bg-gray-300'
                      } relative`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          selectedLayerData.visible ? 'transform translate-x-5' : 'transform translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {selectedLayerData.type === 'text' && (
                    <>
                      <div>
                        <label className="block text-xs mb-1">Font</label>
                        <select
                          value={selectedLayerData.fontFamily}
                          onChange={(e) => updateSelectedLayer({ fontFamily: e.target.value })}
                          className="w-full p-1 border border-gray-300 rounded text-xs"
                        >
                          {availableFonts.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1">Size</label>
                        <input
                          type="number"
                          value={selectedLayerData.fontSize}
                          onChange={(e) => updateSelectedLayer({ fontSize: parseInt(e.target.value) })}
                          className="w-full p-1 border border-gray-300 rounded text-xs"
                          min="8"
                          max="144"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1">Color</label>
                        <div className="grid grid-cols-4 gap-1">
                          {availableColors.map(color => (
                            <button
                              key={color}
                              onClick={() => updateSelectedLayer({ color })}
                              className={`w-6 h-6 rounded border-1 transition-all duration-200 ${
                                selectedLayerData.color === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedLayerData.type === 'image' && (
                    <div className="text-xs text-gray-600">
                      {selectedLayerData.src.startsWith('data:') ? 
                        '📱 Uploaded image' : '🌐 External image'}
                      <div className="mt-1 text-green-600">
                        • Drag corners to resize
                        <br/>
                        • Hold Shift for proportions
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleDuplicateLayer}
                        className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded transition-all duration-200"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={handleDeleteLayer}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 py-1 px-2 rounded transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleReorderLayer('up')}
                        className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded transition-all duration-200"
                      >
                        Move Up
                      </button>
                      <button
                        onClick={() => handleReorderLayer('down')}
                        className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded transition-all duration-200"
                      >
                        Move Down
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col order-1 lg:order-2">
            {/* Canvas Controls */}
            <div className="p-3 sm:p-4 border-b bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <button
                    onClick={handleResetDesign}
                    className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded hover:bg-gray-100 text-xs sm:text-sm transition-all duration-200"
                  >
                    🔄 Reset
                  </button>
                  <button
                    onClick={handleSaveDesign}
                    disabled={isCreatingDesign || designData.layers.length === 0 || !canvasReady}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 text-xs sm:text-sm transition-all duration-200"
                  >
                    {isCreatingDesign ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>Save Design</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="text-xs sm:text-sm text-gray-600">
                  {designData.layers.length} layer{designData.layers.length !== 1 ? 's' : ''}
                  {!canvasReady && ' • Loading...'}
                  {totalImages > 0 && ` • Images: ${imagesLoadedPercentage}% loaded`}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-auto relative">
              {!canvasReady && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium mb-2">Loading Design Editor</p>
                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${imagesLoadedPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {imagesLoadedPercentage}% • {loadingProgress}/{totalImages} images
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
              
              <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={designData.canvasSize.width}
                      height={designData.canvasSize.height}
                      onClick={handleCanvasClick}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent text selection
                        handleMouseDown(e);
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="bg-white border-2 border-gray-300 shadow-lg cursor-default max-w-full max-h-[50vh] sm:max-h-[60vh] select-none"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '50vh',
                        width: 'auto',
                        height: 'auto',
                        touchAction: 'none', // Prevent scrolling on touch devices
                        userSelect: 'none' // Prevent text selection
                      }}
                    />
                
                {/* Canvas Instructions */}
                {designData.layers.length === 0 && canvasReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-gray-500 bg-white bg-opacity-90 p-6 rounded-lg border max-w-md">
                      <p className="text-4xl mb-3">🎨</p>
                      <p className="text-lg font-semibold mb-2">Start Designing!</p>
                      <p className="text-sm mb-3">Use the tools to add text, images, and shapes</p>
                      <p className="text-xs text-orange-600">
                        💡 <strong>Tip:</strong> Upload images from your computer for best results
                      </p>
                    </div>
                  </div>
                )}

                {/* Resize Instructions */}
                {selectedLayerData && (selectedLayerData.type === 'image' || selectedLayerData.type === 'shape') && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded pointer-events-none">
                    Drag corners to resize • Hold Shift for proportions
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Layers - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block w-64 bg-gray-50 border-l p-4 overflow-y-auto order-3">
            <h3 className="font-semibold mb-4">Layers</h3>
            
            {designData.layers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No layers yet</p>
            ) : (
              <div className="space-y-2">
                {[...designData.layers].reverse().map(layer => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`p-3 border rounded cursor-pointer transition-all duration-200 ${
                      selectedLayer === layer.id
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    } ${!layer.visible ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {layer.type === 'text' && '📝'}
                          {layer.type === 'image' && (layer.src.startsWith('data:') ? '📱' : '🌐')}
                          {layer.type === 'shape' && '⬜'}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {layer.type === 'text' ? 
                            (layer.text.length > 15 ? `${layer.text.substring(0, 15)}...` : layer.text) : 
                            layer.type}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility();
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-all duration-200"
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.visible ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    
                    {layer.type === 'text' && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {layer.fontFamily} • {layer.fontSize}px • {layer.color}
                      </div>
                    )}
                    {layer.type === 'image' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {layer.src.startsWith('data:') ? 'Uploaded' : 'External'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layers Panel */}
        {(activeMobileTab === 'layers' || designData.layers.length > 0) && (
          <div className="lg:hidden border-t bg-gray-50 p-3 order-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setActiveMobileTab(activeMobileTab === 'layers' ? 'tools' : 'layers')}
            >
              <h3 className="font-semibold text-sm">Layers ({designData.layers.length})</h3>
              <span className={`transition-transform duration-200 ${activeMobileTab === 'layers' ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
            
            {activeMobileTab === 'layers' && (
              <div className="mt-3 max-h-32 overflow-y-auto space-y-2">
                {designData.layers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No layers yet</p>
                ) : (
                  [...designData.layers].reverse().map(layer => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayer(layer.id)}
                      className={`p-2 border rounded cursor-pointer transition-all duration-200 ${
                        selectedLayer === layer.id
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      } ${!layer.visible ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="text-xs flex-shrink-0">
                            {layer.type === 'text' && '📝'}
                            {layer.type === 'image' && (layer.src.startsWith('data:') ? '📱' : '🌐')}
                            {layer.type === 'shape' && '⬜'}
                          </span>
                          <span className="text-xs font-medium truncate">
                            {layer.type === 'text' ? 
                              (layer.text.length > 20 ? `${layer.text.substring(0, 20)}...` : layer.text) : 
                              layer.type}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVisibility();
                          }}
                          className="text-gray-400 hover:text-gray-600 text-xs flex-shrink-0 ml-2 transition-all duration-200"
                        >
                          {layer.visible ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-xs sm:text-sm text-gray-600">
            Max {customization?.maxTextLength || 100} characters • Max {customization?.maxImages || 5} images
            {!canvasReady && ' • Canvas loading...'}
            {totalImages > 0 && ` • Images: ${imagesLoadedPercentage}% loaded`}
          </div>
          <div className="flex space-x-2 sm:space-x-3 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 sm:px-6 sm:py-2 border border-gray-300 rounded hover:bg-gray-100 text-xs sm:text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndClose}
              disabled={isCreatingDesign || designData.layers.length === 0 || !canvasReady}
              className="px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 text-xs sm:text-sm transition-all duration-200"
            >
              {isCreatingDesign ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save & Close</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopCustomizationView;