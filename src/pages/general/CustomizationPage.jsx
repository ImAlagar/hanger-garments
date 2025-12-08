// pages/general/CustomizationPage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProductBySlugQuery } from '../../redux/services/productService';
import { useGetCustomizationByProductIdQuery } from '../../redux/services/customizationService';
import CustomizationView from '../../components/Common/CustomizationView';
import { setDesignMode, setCustomizationOptions, resetDesign } from '../../redux/slices/customizationSlice';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const CustomizationPage = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  const isDark = theme === "dark";
  const themeColors = {
    bgPrimary: isDark ? 'bg-gray-900' : 'bg-white',
    textPrimary: isDark ? 'text-white' : 'text-gray-900'
  };

  // Extract product ID from slug
  const getProductIdFromSlug = (slug) => {
    if (!slug) return null;
    const parts = slug.split('-');
    return parts[parts.length - 1];
  };

  const productId = getProductIdFromSlug(productSlug);

  // Fetch product data
  const { data: productResponse, isLoading, error } = useGetProductBySlugQuery(productId, {
    skip: !productId
  });

  // Fetch customization data
  const { data: customizationData, isLoading: isLoadingCustomization } = 
    useGetCustomizationByProductIdQuery(productId, {
      skip: !productId || !productResponse?.data?.isCustomizable
    });

  const product = productResponse?.data || productResponse;
  const isCustomizable = product?.isCustomizable && customizationData?.data?.isActive;

  // Set customization options
  useEffect(() => {
    if (customizationData?.data) {
      dispatch(setCustomizationOptions(customizationData.data));
      dispatch(setDesignMode(true));
    }
  }, [customizationData, dispatch]);

  // Redirect if not customizable
  useEffect(() => {
    if (!isLoading && !isLoadingCustomization) {
      if (!isCustomizable) {
        toast.error('This product does not support customization');
        navigate(-1); // Go back
      }
    }
  }, [isLoading, isLoadingCustomization, isCustomizable, navigate]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(setDesignMode(false));
      dispatch(resetDesign());
    };
  }, [dispatch]);

  // Loading state
  if (isLoading || isLoadingCustomization) {
    return (
      <div className={`min-h-screen ${themeColors.bgPrimary} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading customization editor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className={`min-h-screen ${themeColors.bgPrimary} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.bgPrimary} ${themeColors.textPrimary}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-lg font-semibold">
              Customize: <span className="text-blue-600">{product.name}</span>
            </h1>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            🎨 Design Your Product
          </div>
        </div>
      </div>

      {/* Customization View */}
      <div className="container mx-auto px-4 py-6">
        <CustomizationView
          product={product}
          customization={customizationData?.data}
          onClose={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default CustomizationPage;