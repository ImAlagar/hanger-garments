// components/Common/CustomizationView.js - UPDATED
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MobileCustomizationView from './MobileCustomizationView';
import DesktopCustomizationView from './DesktopCustomizationView';

const CustomizationView = ({ 
  product, 
  variant, // Make sure this is passed
  customization,
  onClose
}) => {
  const dispatch = useDispatch();
  const designData = useSelector(state => state.customization.designData);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isCreatingDesign, setIsCreatingDesign] = useState(false);
  
  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simulate createDesign function
  const createDesign = async (designData) => {
    setIsCreatingDesign(true);
    try {
      // Your API call here
      console.log('Design saved:', designData);
      return { data: { success: true } };
    } catch (error) {
      throw error;
    } finally {
      setIsCreatingDesign(false);
    }
  };

  return isMobile ? (
    <MobileCustomizationView
      isOpen={true}
      onClose={onClose}
      product={product}
      variant={variant} // Pass variant here too
      customization={customization}
      designData={designData}
      isCreatingDesign={isCreatingDesign}
      createDesign={createDesign}
      dispatch={dispatch}
    />
  ) : (
    <DesktopCustomizationView
      isOpen={true}
      onClose={onClose}
      product={product}
      variant={variant} // Pass variant here too
      customization={customization}
      designData={designData}
      isCreatingDesign={isCreatingDesign}
      createDesign={createDesign}
      dispatch={dispatch}
    />
  );
};

export default CustomizationView;