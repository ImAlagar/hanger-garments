// components/CustomizationModal.js - UPDATED WITH EXPORT FUNCTIONALITY
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setDesignData, 
  addDesignLayer, 
  updateDesignLayer, 
  removeDesignLayer, 
  reorderDesignLayers,
  setPreviewImage,
  resetDesign
} from '../../redux/slices/customizationSlice';
import { useCreateDesignMutation } from '../../redux/services/designService';

const CustomizationModal = ({ 
  isOpen, 
  onClose, 
  product, 
  variant, 
  customization 
}) => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Redux state
  const designData = useSelector(state => state.customization.designData);
  const [createDesign, { isLoading: isCreatingDesign }] = useCreateDesignMutation();
  
  // Local state
  const [activeTool, setActiveTool] = useState('text');
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasReady, setCanvasReady] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [exportFormat, setExportFormat] = useState('png'); // png, jpeg, svg
  const [exportQuality, setExportQuality] = useState(1.0); // 0.1 to 1.0
  const [exportSize, setExportSize] = useState('original'); // original, high, medium, low

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

  // Convert S3 URL to proxy URL
  const getProxiedImageUrl = (url) => {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // Use proxy for S3 URLs to avoid CORS issues
    if (url.includes('s3.amazonaws.com') || url.includes('velan-ecom-images.s3.ap-south-1.amazonaws.com')) {
      return `http://localhost:5000/api/images/proxy?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  };

  // Load image with CORS handling and proxy support
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Use proxied URL for external images
      const proxiedSrc = getProxiedImageUrl(src);
      
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        setImagesLoaded(prev => prev + 1);
        resolve(img);
      };
      
      img.onerror = (err) => {
        console.error('❌ Failed to load image:', src, err);
        
        // Try without proxy as fallback
        if (proxiedSrc !== src) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setImagesLoaded(prev => prev + 1);
            resolve(fallbackImg);
          };
          fallbackImg.onerror = () => {
            setImagesLoaded(prev => prev + 1);
            // Create a placeholder image
            createPlaceholderImage().then(resolve).catch(() => {
              // Final fallback - basic placeholder
              const basicImg = new Image();
              basicImg.onload = () => {
                setImagesLoaded(prev => prev + 1);
                resolve(basicImg);
              };
              basicImg.src = createBasicPlaceholder();
            });
          };
          fallbackImg.src = src;
        } else {
          setImagesLoaded(prev => prev + 1);
          createPlaceholderImage().then(resolve).catch(() => {
            const basicImg = new Image();
            basicImg.onload = () => {
              setImagesLoaded(prev => prev + 1);
              resolve(basicImg);
            };
            basicImg.src = createBasicPlaceholder();
          });
        }
      };
      
      img.src = proxiedSrc;
    });
  };

  // Create SVG placeholder
  const createPlaceholderImage = () => {
    return new Promise((resolve) => {
      const svg = `
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8f9fa"/>
          <rect x="50" y="50" width="300" height="300" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
          <text x="200" y="180" font-family="Arial" font-size="16" text-anchor="middle" fill="#6c757d">Product Image</text>
          <text x="200" y="210" font-family="Arial" font-size="12" text-anchor="middle" fill="#adb5bd">CORS Restricted</text>
          <text x="200" y="230" font-family="Arial" font-size="10" text-anchor="middle" fill="#adb5bd">Upload custom images for full functionality</text>
        </svg>
      `;
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
    });
  };

  // Create basic placeholder
  const createBasicPlaceholder = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 400, 400);
    
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(50, 50, 300, 300);
    
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 300, 300);
    
    ctx.fillStyle = '#6c757d';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Image Placeholder', 200, 200);
    
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
        console.error('Canvas initialization error:', error);
        setCanvasReady(true);
      });
    }
  }, [isOpen, designData]);

  // Draw everything on canvas
  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      // Draw product base image
      const baseImageUrl = variant?.variantImages?.[0]?.imageUrl || product?.images?.[0]?.imageUrl;
      if (baseImageUrl) {
        const baseImage = await loadImage(baseImageUrl);
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw a placeholder if no base image
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Product Image', canvas.width / 2, canvas.height / 2);
      }
      
      // Draw design layers
      for (const layer of designData.layers) {
        if (layer.visible !== false) {
          await drawLayer(ctx, layer);
        }
      }
    } catch (error) {
      console.error('Error drawing canvas:', error);
      // Draw error state
      ctx.fillStyle = '#ffebee';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#d32f2f';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Error loading design', canvas.width / 2, canvas.height / 2);
    }
  };

  // Draw text layer
  const drawTextLayer = (ctx, layer) => {
    ctx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize}px ${layer.fontFamily}`;
    ctx.fillStyle = layer.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Measure text for selection
    const metrics = ctx.measureText(layer.text);
    const width = metrics.width;
    const height = layer.fontSize;
    
    ctx.fillText(layer.text, layer.x, layer.y);
    
    return { width, height };
  };

  const drawImageLayer = async (ctx, layer) => {
    try {
      const img = await loadImage(layer.src);
      ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
    } catch (error) {
      // Draw placeholder for failed image
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
      ctx.fillStyle = '#999';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Image', layer.x + layer.width / 2, layer.y + layer.height / 2);
    }
  };

  // Update drawLayer function
  const drawLayer = async (ctx, layer) => {
    ctx.save();
    
    try {
      let dimensions;
      switch (layer.type) {
        case 'text':
          dimensions = drawTextLayer(ctx, layer);
          break;
        case 'image':
          await drawImageLayer(ctx, layer);
          break;
        case 'shape':
          drawShapeLayer(ctx, layer);
          break;
      }
      
      // Draw selection border if layer is selected
      if (selectedLayer === layer.id) {
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // Use actual dimensions or fallback to layer properties
        const width = dimensions?.width || layer.width || 100;
        const height = dimensions?.height || layer.height || 50;
        
        ctx.strokeRect(layer.x - 5, layer.y - 5, width + 10, height + 10);
        ctx.setLineDash([]);
      }
    } catch (error) {
      console.error('Error drawing layer:', layer, error);
    }
    
    ctx.restore();
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

  // Generate preview image
  const generatePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return null;
    }
    
    try {
      // Test if canvas can be exported
      canvas.toDataURL('image/png');
      
      // If no error, generate the preview
      const preview = canvas.toDataURL('image/png');
      return preview;
    } catch (error) {
      console.warn('⚠️ Canvas export blocked, creating safe preview:', error);
      
      // Create a clean canvas without external images
      return createSafePreview();
    }
  };

  // Create safe preview without CORS issues
  const createSafePreview = () => {
    const canvas = canvasRef.current;
    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = canvas.width;
    cleanCanvas.height = canvas.height;
    const cleanCtx = cleanCanvas.getContext('2d');
    
    // Draw white background
    cleanCtx.fillStyle = '#ffffff';
    cleanCtx.fillRect(0, 0, cleanCanvas.width, cleanCanvas.height);
    
    // Draw product outline
    cleanCtx.strokeStyle = '#e0e0e0';
    cleanCtx.lineWidth = 2;
    cleanCtx.strokeRect(10, 10, cleanCanvas.width - 20, cleanCanvas.height - 20);
    
    // Only draw text and shape layers (skip external image layers)
    designData.layers.forEach(layer => {
      if (layer.visible !== false) {
        if (layer.type === 'text') {
          cleanCtx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize}px ${layer.fontFamily}`;
          cleanCtx.fillStyle = layer.color;
          cleanCtx.textAlign = 'left';
          cleanCtx.textBaseline = 'top';
          cleanCtx.fillText(layer.text, layer.x, layer.y);
        } else if (layer.type === 'shape') {
          cleanCtx.fillStyle = layer.fillColor || '#000000';
          if (layer.shape === 'rectangle') {
            cleanCtx.fillRect(layer.x, layer.y, layer.width, layer.height);
          } else if (layer.shape === 'circle') {
            cleanCtx.beginPath();
            cleanCtx.arc(layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, 0, 2 * Math.PI);
            cleanCtx.fill();
          }
        } else if (layer.type === 'image' && layer.src.startsWith('data:')) {
          // Only include data URL images (uploaded by user)
          const img = new Image();
          img.onload = () => {
            cleanCtx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
          };
          img.src = layer.src;
        }
      }
    });
    
    // Add watermark indicating limitations
    cleanCtx.fillStyle = 'rgba(0,0,0,0.3)';
    cleanCtx.font = '10px Arial';
    cleanCtx.textAlign = 'center';
    cleanCtx.fillText('Preview - external images not included due to CORS', cleanCanvas.width / 2, cleanCanvas.height - 10);
    
    return cleanCanvas.toDataURL('image/png');
  };

  // EXPORT DESIGN FUNCTIONALITY

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

    try {
      // Create a high-quality canvas for export
      const exportCanvas = document.createElement('canvas');
      const scale = exportSizes[exportSize].scale;
      
      exportCanvas.width = designData.canvasSize.width * scale;
      exportCanvas.height = designData.canvasSize.height * scale;
      
      const exportCtx = exportCanvas.getContext('2d');
      
      // Set higher quality for export
      exportCtx.imageSmoothingEnabled = true;
      exportCtx.imageSmoothingQuality = 'high';
      
      // Draw white background for export
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
          // Continue without base image
        }
      }
      
      // Draw all visible layers
      for (const layer of designData.layers) {
        if (layer.visible !== false) {
          await drawLayerForExport(exportCtx, layer, scale);
        }
      }
      
      // Generate export data URL
      let dataUrl;
      const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = exportFormat === 'jpeg' ? exportQuality : undefined;
      
      dataUrl = exportCanvas.toDataURL(mimeType, quality);
      
      // Download the file
      downloadImage(dataUrl, mimeType);
      
      return dataUrl;
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again or use a different format.');
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
            // Skip failed images in export
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
    
    // Show success message
    alert(`✅ Design exported successfully as ${fileName}`);
  };

  // Export as SVG (alternative format)
  const exportAsSVG = () => {
    if (designData.layers.length === 0) {
      alert('Please add at least one design element before exporting.');
      return;
    }

    try {
      // Create SVG content
      let svgContent = `
        <svg width="${designData.canvasSize.width}" height="${designData.canvasSize.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#ffffff"/>
      `;
      
      // Add design layers as SVG elements
      designData.layers.forEach(layer => {
        if (layer.visible !== false) {
          switch (layer.type) {
            case 'text':
              svgContent += `
                <text x="${layer.x}" y="${layer.y + layer.fontSize}" 
                      font-family="${layer.fontFamily}" font-size="${layer.fontSize}" 
                      fill="${layer.color}">
                  ${layer.text}
                </text>
              `;
              break;
              
            case 'shape':
              if (layer.shape === 'rectangle') {
                svgContent += `
                  <rect x="${layer.x}" y="${layer.y}" 
                        width="${layer.width}" height="${layer.height}" 
                        fill="${layer.fillColor}"/>
                `;
              } else if (layer.shape === 'circle') {
                svgContent += `
                  <circle cx="${layer.x + layer.width / 2}" cy="${layer.y + layer.height / 2}" 
                          r="${layer.width / 2}" fill="${layer.fillColor}"/>
                `;
              }
              break;
              
            // Note: Images in SVG are complex due to data URL conversion
            // For simplicity, we're skipping images in SVG export
          }
        }
      });
      
      svgContent += '</svg>';
      
      // Create and download SVG file
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `design-${product?.name || 'custom'}-${Date.now()}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('✅ SVG design exported successfully!');
      
    } catch (error) {
      console.error('SVG export failed:', error);
      alert('SVG export failed. Please try image export instead.');
    }
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
      const previewImage = generatePreview();
      
      if (!previewImage) {
        throw new Error('Failed to generate preview image');
      }

      // Clean design data for storage
      const cleanDesignData = {
        layers: designData.layers.map(layer => ({
          ...layer,
          // Remove any temporary properties and handle external images
          src: layer.type === 'image' && layer.src.startsWith('http') ? 
               `[EXTERNAL:${new URL(layer.src).pathname.split('/').pop()}]` : layer.src
        })),
        canvasSize: designData.canvasSize,
        backgroundColor: designData.backgroundColor,
        version: '1.0',
        createdAt: new Date().toISOString()
      };

      const designDataToSave = {
        customizationId: customization.id,
        designData: cleanDesignData,
        previewImage: previewImage,
        thumbnailImage: previewImage
      };

      const result = await createDesign(designDataToSave).unwrap();
      
      // Set preview image in Redux state
      dispatch(setPreviewImage(previewImage));
      
      // Show success message
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
      // First save the design
      await handleSaveDesign();
      
      // Then export it
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

  // Rest of your existing functions (addText, addImage, etc.) remain the same...
  // [Keep all your existing functions like handleAddText, handleAddImage, etc.]

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
  };

  // Add image layer
  const handleAddImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('❌ Please select a valid image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newLayer = {
          id: `image_${Date.now()}`,
          type: 'image',
          src: e.target.result, // This is a data URL, so no CORS issues
          x: 50,
          y: 50,
          width: Math.min(img.width, 200),
          height: Math.min(img.height, 200),
          visible: true,
          createdAt: new Date().toISOString()
        };

        dispatch(addDesignLayer(newLayer));
        setSelectedLayer(newLayer.id);
        
        // Redraw canvas with new image
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

    // Reset file input
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
  };

  // Handle canvas click for layer selection
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked layer (check from top to bottom)
    const clickedLayer = [...designData.layers]
      .reverse()
      .find(layer => {
        if (!layer.visible) return false;
        
        return x >= layer.x && 
               x <= layer.x + layer.width && 
               y >= layer.y && 
               y <= layer.y + layer.height;
      });

    setSelectedLayer(clickedLayer ? clickedLayer.id : null);
  };

  // Handle layer drag
  const handleMouseDown = (event) => {
    if (!selectedLayer) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const layer = designData.layers.find(l => l.id === selectedLayer);
    if (layer && x >= layer.x && x <= layer.x + layer.width && y >= layer.y && y <= layer.y + layer.height) {
      setIsDragging(true);
      setDragOffset({
        x: x - layer.x,
        y: y - layer.y
      });
    }
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !selectedLayer) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - dragOffset.x;
    const y = event.clientY - rect.top - dragOffset.y;

    const layer = designData.layers.find(l => l.id === selectedLayer);
    if (layer) {
      dispatch(updateDesignLayer({
        layerId: selectedLayer,
        updates: { x, y }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Update selected layer properties
  const updateSelectedLayer = (updates) => {
    if (!selectedLayer) return;
    
    dispatch(updateDesignLayer({
      layerId: selectedLayer,
      updates
    }));
  };

  // Delete selected layer
  const handleDeleteLayer = () => {
    if (!selectedLayer) return;
    
    dispatch(removeDesignLayer(selectedLayer));
    setSelectedLayer(null);
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
      // Redraw empty canvas
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
      // Don't close on error
    }
  };

  // Get selected layer
  const selectedLayerData = designData.layers.find(layer => layer.id === selectedLayer);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Customize {product?.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Tools */}
          <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Design Tools</h3>
            
            {/* Loading indicator */}
            {!canvasReady && (
              <div className="mb-4 p-2 bg-blue-100 text-blue-800 text-sm rounded flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                Loading design editor...
              </div>
            )}

            {totalImages > 0 && imagesLoaded < totalImages && (
              <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
                📸 Loading images... ({imagesLoaded}/{totalImages})
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-yellow-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(imagesLoaded / totalImages) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Export Settings */}
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
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
                    disabled={!canvasReady || designData.layers.length === 0}
                    className="text-xs bg-green-600 text-white py-2 px-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Export
                  </button>
                  <button
                    onClick={handleSaveAndExport}
                    disabled={!canvasReady || designData.layers.length === 0}
                    className="text-xs bg-blue-600 text-white py-2 px-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save & Export
                  </button>
                </div>
              </div>
            </div>

            {/* CORS Warning */}
            <div className="mb-4 p-2 bg-orange-100 text-orange-800 text-xs rounded">
              <strong>💡 Tip:</strong> Upload images from your computer for full functionality. External images may have restrictions.
            </div>

            {/* Tool Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Tools</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTool('text')}
                  className={`p-2 border rounded ${
                    activeTool === 'text' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  📝 Text
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  🖼️ Image
                </button>
                <button
                  onClick={() => setActiveTool('shapes')}
                  className={`p-2 border rounded ${
                    activeTool === 'shapes' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  ⬜ Shapes
                </button>
                <button
                  onClick={() => setActiveTool('arrange')}
                  className={`p-2 border rounded ${
                    activeTool === 'arrange' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
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

            {/* Text Tool */}
            {activeTool === 'text' && (
              <div className="space-y-4">
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
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm">{fontSize}px</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
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
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Text
                </button>
              </div>
            )}

            {/* Shapes Tool */}
            {activeTool === 'shapes' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium mb-2">Shapes</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddShape('rectangle')}
                    className="p-3 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    ▭ Rectangle
                  </button>
                  <button
                    onClick={() => handleAddShape('circle')}
                    className="p-3 border border-gray-300 rounded hover:bg-gray-100"
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
                        className={`w-8 h-8 rounded border-2 ${
                          textColor === color ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Layer Properties */}
            {selectedLayerData && (
              <div className="mt-6 p-4 bg-white border rounded">
                <h4 className="font-semibold mb-3">Layer Properties</h4>
                
                <div className="space-y-3">
                  {/* Common properties */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Visible</span>
                    <button
                      onClick={handleToggleVisibility}
                      className={`w-10 h-6 rounded-full ${
                        selectedLayerData.visible ? 'bg-blue-600' : 'bg-gray-300'
                      } relative`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          selectedLayerData.visible ? 'transform translate-x-5' : 'transform translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Text-specific properties */}
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
                              className={`w-6 h-6 rounded border-1 ${
                                selectedLayerData.color === color ? 'border-blue-500' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Image-specific properties */}
                  {selectedLayerData.type === 'image' && (
                    <div className="text-xs text-gray-600">
                      {selectedLayerData.src.startsWith('data:') ? 
                        '📱 Uploaded image' : '🌐 External image'}
                    </div>
                  )}

                  {/* Layer Actions */}
                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleDuplicateLayer}
                        className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={handleDeleteLayer}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleReorderLayer('up')}
                        className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded"
                      >
                        Move Up
                      </button>
                      <button
                        onClick={() => handleReorderLayer('down')}
                        className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded"
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
          <div className="flex-1 flex flex-col">
            {/* Canvas Controls */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleResetDesign}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    🔄 Reset
                  </button>
                  <button
                    onClick={handleSaveDesign}
                    disabled={isCreatingDesign || designData.layers.length === 0 || !canvasReady}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isCreatingDesign ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                
                <div className="text-sm text-gray-600">
                  {designData.layers.length} layer{designData.layers.length !== 1 ? 's' : ''}
                  {!canvasReady && ' • Loading...'}
                  {totalImages > 0 && ` • Images: ${imagesLoaded}/${totalImages}`}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-auto">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={designData.canvasSize.width}
                  height={designData.canvasSize.height}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="bg-white border-2 border-gray-300 shadow-lg cursor-crosshair"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '60vh'
                  }}
                />
                
                {/* Canvas Instructions */}
                {designData.layers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-gray-500 bg-white bg-opacity-90 p-6 rounded-lg border">
                      <p className="text-lg font-semibold mb-2">Start Designing!</p>
                      <p className="text-sm mb-2">Use the tools on the left to add:</p>
                      <ul className="text-xs text-left space-y-1 mb-3">
                        <li>• 📝 Text with custom fonts and colors</li>
                        <li>• 🖼️ Images from your computer</li>
                        <li>• ⬜ Shapes and graphics</li>
                      </ul>
                      <p className="text-xs text-orange-600">
                        💡 <strong>Tip:</strong> Upload images from your computer for best results
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Layers */}
          <div className="w-64 bg-gray-50 border-l p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Layers</h3>
            
            {designData.layers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No layers yet</p>
            ) : (
              <div className="space-y-2">
                {[...designData.layers].reverse().map(layer => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
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
                        className="text-gray-400 hover:text-gray-600"
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

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Max {customization?.maxTextLength || 100} characters • Max {customization?.maxImages || 5} images
            {!canvasReady && ' • Canvas loading...'}
            {totalImages > 0 && imagesLoaded < totalImages && ` • Loading images... (${imagesLoaded}/${totalImages})`}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndClose}
              disabled={isCreatingDesign || designData.layers.length === 0 || !canvasReady}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isCreatingDesign ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

export default CustomizationModal;