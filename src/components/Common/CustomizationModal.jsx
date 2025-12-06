// components/CustomizationModal.js - SEPARATE MOBILE/DESKTOP DESIGNS
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

// Import mobile-specific components
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
  const designData = useSelector(state => state.customization.designData);
  const [createDesign, { isLoading: isCreatingDesign }] = useCreateDesignMutation();
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  // Render different views based on screen size
  return isMobile ? (
    <MobileCustomizationView
      isOpen={isOpen}
      onClose={onClose}
      product={product}
      variant={variant}
      customization={customization}
      designData={designData}
      isCreatingDesign={isCreatingDesign}
      createDesign={createDesign}
      dispatch={dispatch}
    />
  ) : (
    <DesktopCustomizationView
      isOpen={isOpen}
      onClose={onClose}
      product={product}
      variant={variant}
      customization={customization}
      designData={designData}
      isCreatingDesign={isCreatingDesign}
      createDesign={createDesign}
      dispatch={dispatch}
    />
  );
};

export default CustomizationModal;