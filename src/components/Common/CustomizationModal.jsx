// components/CustomizationModal.js
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setDesignData, 
  addDesignLayer, 
  updateDesignLayer, 
  removeDesignLayer, 
  reorderDesignLayers,
  setPreviewImage,
  resetDesign,
  setSelectedImage, // ✅ Import
  setSelectedColor  // ✅ Import
} from '../../redux/slices/customizationSlice';
import { useCreateDesignMutation } from '../../redux/services/designService';
import MobileCustomizationView from './MobileCustomizationView';
import DesktopCustomizationView from './DesktopCustomizationView';


const CustomizationModal = ({ 
  isOpen, 
  onClose, 
  product, 
  variant, 
  customization 
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const designData = useSelector((state) => state.customization.designData);
  const selectedImage = designData.selectedImage; // Get from designData
  const selectedColor = designData.selectedColor; // Get from designData
  
  const [createDesign, { isLoading: isCreatingDesign }] = useCreateDesignMutation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Local state for image handling
  const [variantImages, setVariantImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [localSelectedColor, setLocalSelectedColor] = useState('');
  
  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Initialize variant images
  useEffect(() => {
    if (isOpen && product?.variants) {
      const currentColor = selectedColor || variant?.color || product.variants[0]?.color;
      setLocalSelectedColor(currentColor);
      
      // Get images for the current color
      const imagesForColor = product.variants
        .filter(v => v.color === currentColor)
        .flatMap(v => v.variantImages || []);
      
      const uniqueImages = Array.from(
        new Map(imagesForColor.map(img => [img.imageUrl, img])).values()
      );
      
      setVariantImages(uniqueImages);
      
      // Set active image index based on selected image
      if (selectedImage && selectedImage.imageUrl) {
        const selectedIndex = uniqueImages.findIndex(img => 
          img.imageUrl === selectedImage.imageUrl
        );
        if (selectedIndex !== -1) {
          setActiveImageIndex(selectedIndex);
        }
      }
    }
  }, [isOpen, product, variant, selectedImage, selectedColor]);
  
  // Handle image selection
  const handleImageSelect = (image, index) => {
    setActiveImageIndex(index);
    dispatch(setSelectedImage({
      imageUrl: image.imageUrl,
      id: image.id,
      color: localSelectedColor,
      variantId: image.variantId
    }));
  };
  
  // Handle color change
  const handleColorChange = (color) => {
    setLocalSelectedColor(color);
    dispatch(setSelectedColor(color));
    
    // Get images for new color
    const imagesForColor = product.variants
      .filter(v => v.color === color)
      .flatMap(v => v.variantImages || []);
    
    const uniqueImages = Array.from(
      new Map(imagesForColor.map(img => [img.imageUrl, img])).values()
    );
    
    setVariantImages(uniqueImages);
    setActiveImageIndex(0);
    
    // Set first image of new color
    if (uniqueImages.length > 0) {
      dispatch(setSelectedImage({
        imageUrl: uniqueImages[0].imageUrl,
        id: uniqueImages[0].id,
        color: color,
        variantId: uniqueImages[0].variantId
      }));
    }
  };
  
  // Get available colors
  const getAvailableColors = () => {
    if (!product?.variants) return [];
    
    const colorMap = new Map();
    product.variants.forEach(v => {
      if (!colorMap.has(v.color)) {
        const primaryImage = v.variantImages?.find(img => img.isPrimary) || v.variantImages?.[0];
        colorMap.set(v.color, {
          name: v.color,
          image: primaryImage?.imageUrl,
          variantId: v.id
        });
      }
    });
    
    return Array.from(colorMap.values());
  };
  
  const availableColors = getAvailableColors();

  if (!isOpen) return null;

  // Prepare props
  const commonProps = {
    isOpen,
    onClose,
    product,
    variant,
    customization,
    designData,
    isCreatingDesign,
    createDesign,
    dispatch,
    // Image handling props
    variantImages,
    selectedColor: localSelectedColor, // Use local state
    handleColorChange,
    activeImageIndex,
    handleImageSelect,
    availableColors, // Pass as prop
    selectedImage: variantImages[activeImageIndex] || null
  };

  return isMobile ? (
    <MobileCustomizationView {...commonProps} />
  ) : (
    <DesktopCustomizationView {...commonProps} />
  );
};


export default CustomizationModal;