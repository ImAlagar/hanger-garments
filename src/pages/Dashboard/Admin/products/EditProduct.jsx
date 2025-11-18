import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import reusable components
import { useTheme } from '../../../../context/ThemeContext';
import { 
  useGetProductByIdQuery, 
  useUpdateProductMutation,
  useAddProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateVariantStockMutation
} from '../../../../redux/services/productService';
import { useGetSubcategoriesByCategoryQuery } from '../../../../redux/services/subcategoryService';
import { useGetAllCategoriesQuery } from '../../../../redux/services/categoryService';
import InputField from '../../../../components/Common/InputField';
import SelectField from '../../../../components/Common/SelectField';
import TextArea from '../../../../components/Common/TextArea';
import Button from '../../../../components/Common/Button';
import { ArrowLeft, View, Save, Plus, Trash2 } from 'lucide-react';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [variantLoading, setVariantLoading] = useState({});
  const [showCustomColor, setShowCustomColor] = useState(false);
  const { theme } = useTheme();

  // Redux queries and mutations
  const { data: productData, isLoading: productLoading, refetch: refetchProduct } = useGetProductByIdQuery(productId);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  
  // Variant mutations
  const [addProductVariant] = useAddProductVariantMutation();
  const [updateProductVariant] = useUpdateProductVariantMutation();
  const [deleteProductVariant] = useDeleteProductVariantMutation();
  const [updateVariantStock] = useUpdateVariantStockMutation();

  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = 
    useGetSubcategoriesByCategoryQuery(selectedCategoryId, { skip: !selectedCategoryId });

  const categories = categoriesData?.data || [];
  const subcategories = subcategoriesData?.data || [];
  const product = productData?.data;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const slideInVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Product basic information
  const [productForm, setProductForm] = useState({
    name: '',
    productCode: '',
    description: '',
    normalPrice: '',
    offerPrice: '',
    wholesalePrice: '',
    categoryId: '',
    subcategoryId: '',
    status: 'ACTIVE',
  });

  // Product details (features, specifications)
  const [productDetails, setProductDetails] = useState([
    { title: '', description: '' },
  ]);

  // Enhanced variant structure with variant IDs
  const [variants, setVariants] = useState({});

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const commonColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Gray', 'Navy', 'Maroon', 'Olive'];

  // Theme-based styling
  const themeClasses = {
    light: {
      bg: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        gradient: 'from-blue-600 to-blue-800',
        card: 'bg-white',
        input: 'bg-white'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600',
        inverse: 'text-white'
      },
      border: 'border-gray-200',
      shadow: 'shadow-lg',
    },
    dark: {
      bg: {
        primary: 'bg-gray-900',
        secondary: 'bg-gray-800',
        gradient: 'from-gray-800 to-gray-900',
        card: 'bg-gray-800',
        input: 'bg-gray-700'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-200',
        muted: 'text-gray-400',
        inverse: 'text-gray-900'
      },
      border: 'border-gray-700',
      shadow: 'shadow-lg shadow-gray-900',
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  useEffect(() => {
    return () => {
      // Clean up all blob URLs when component unmounts
      Object.values(variants).forEach(variantData => {
        variantData.imagePreviews.forEach(url => {
          if (url?.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      });
    };
  }, []);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setProductForm({
        name: product.name || '',
        productCode: product.productCode || '',
        description: product.description || '',
        normalPrice: product.normalPrice || '',
        offerPrice: product.offerPrice || '',
        wholesalePrice: product.wholesalePrice || '',
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        status: product.status || 'ACTIVE',
      });

      setSelectedCategoryId(product.categoryId || '');

      // Set product details
      if (product.productDetails && product.productDetails.length > 0) {
        setProductDetails(product.productDetails.map(detail => ({
          title: detail.title,
          description: detail.description
        })));
      }

      // FIXED: Set variants - No duplicate images
      if (product.variants && product.variants.length > 0) {
        const variantsObj = {};
        
        product.variants.forEach(variant => {
          if (!variantsObj[variant.color]) {
            variantsObj[variant.color] = {
              variantId: variant.id,
              sizes: [],
              images: [], // New images to upload
              imagePreviews: [], // All preview URLs (existing + new)
              existingImages: [] // Only existing image URLs from backend
            };
          }
          
          // Add sizes
          variantsObj[variant.color].sizes.push({
            size: variant.size,
            stock: variant.stock,
            sku: variant.sku,
            variantId: variant.id
          });

          // FIXED: Add existing images without duplicates
          if (variant.variantImages && variant.variantImages.length > 0) {
            variant.variantImages.forEach(image => {
              // Only add if not already present
              if (!variantsObj[variant.color].existingImages.includes(image.imageUrl)) {
                variantsObj[variant.color].existingImages.push(image.imageUrl);
                variantsObj[variant.color].imagePreviews.push(image.imageUrl);
              }
            });
          }
        });
        setVariants(variantsObj);
      }
    }
  }, [product]);

  // Handle basic product input changes
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'categoryId') {
      setSelectedCategoryId(value);
      setProductForm(prev => ({ ...prev, subcategoryId: '' }));
    }

    // Update SKUs when product code changes
    if (name === 'productCode' && value) {
      updateAllSKUs(value);
    }
  };

  // Update all SKUs when product code changes
  const updateAllSKUs = (productCode) => {
    setVariants(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(color => {
        updated[color] = {
          ...updated[color],
          sizes: updated[color].sizes.map(size => ({
            ...size,
            sku: `${productCode}-${color}-${size.size}`
          }))
        };
      });
      return updated;
    });
  };

  // Handle product details changes
  const handleDetailChange = (index, field, value) => {
    const newDetails = [...productDetails];
    newDetails[index][field] = value;
    setProductDetails(newDetails);
  };

  const addProductDetail = () => {
    setProductDetails([...productDetails, { title: '', description: '' }]);
  };

  const removeProductDetail = (index) => {
    if (productDetails.length > 1) {
      const newDetails = productDetails.filter((_, i) => i !== index);
      setProductDetails(newDetails);
    }
  };

  // Color Variant Management
  const addColorVariant = (colorName = '') => {
    const color = colorName.trim() || `Color${Object.keys(variants).length + 1}`;

    if (variants[color]) {
      toast.error(`Color "${color}" already exists!`);
      return;
    }

    const newVariant = {
      variantId: null, // No ID yet - will be created when saved
      sizes: commonSizes.map(size => ({
        size,
        stock: 0,
        sku: productForm.productCode ? `${productForm.productCode}-${color}-${size}` : `${color}-${size}`,
        variantId: null
      })),
      images: [],
      imagePreviews: [],
      existingImages: []
    };

    setVariants(prev => ({
      ...prev,
      [color]: newVariant
    }));
  };

  // Update size stock for a color
  const updateSizeStock = (color, sizeIndex, stock) => {
    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: prev[color].sizes.map((size, index) =>
          index === sizeIndex ? { ...size, stock: parseInt(stock) || 0 } : size
        )
      }
    }));
  };

  // Handle color image upload
  const handleColorImages = (color, files) => {
    const fileList = Array.from(files);
    
    // Calculate total images properly (only count unique images)
    const currentNewImagesCount = variants[color].images.length;
    const currentExistingImagesCount = variants[color].existingImages.length;
    const totalCurrentImages = currentNewImagesCount + currentExistingImagesCount;
    
    if (totalCurrentImages + fileList.length > 10) {
      toast.error('Maximum 10 images per color allowed');
      return;
    }

    // Filter out duplicate files by name and size
    const uniqueNewFiles = fileList.filter(newFile => {
      return !variants[color].images.some(existingFile => 
        existingFile.name === newFile.name && 
        existingFile.size === newFile.size
      );
    });

    if (uniqueNewFiles.length === 0) {
      toast.info('Some images are already added');
      return;
    }

    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        images: [...prev[color].images, ...uniqueNewFiles],
        imagePreviews: [
          ...prev[color].imagePreviews,
          ...uniqueNewFiles.map(file => URL.createObjectURL(file))
        ]
      }
    }));
  };

  // Remove color image
  const removeColorImage = (color, imageIndex) => {
    setVariants(prev => {
      const updatedColor = { ...prev[color] };
      
      // Check if it's an existing image or new image
      const totalExistingImages = updatedColor.existingImages.length;
      
      if (imageIndex < totalExistingImages) {
        // Removing existing image - just remove from previews
        updatedColor.existingImages = updatedColor.existingImages.filter((_, i) => i !== imageIndex);
      } else {
        // Removing new image - remove from both images and previews
        const newImageIndex = imageIndex - totalExistingImages;
        updatedColor.images = updatedColor.images.filter((_, i) => i !== newImageIndex);
        
        // Revoke object URL
        if (updatedColor.imagePreviews[imageIndex]?.startsWith('blob:')) {
          URL.revokeObjectURL(updatedColor.imagePreviews[imageIndex]);
        }
      }
      
      // Remove from previews
      updatedColor.imagePreviews = updatedColor.imagePreviews.filter((_, i) => i !== imageIndex);
      
      return {
        ...prev,
        [color]: updatedColor
      };
    });
  };

  // Remove color variant
  const removeColorVariant = async (color) => {
    const variant = variants[color];
    
    // If it's an existing variant, delete from backend
    if (variant.variantId) {
      setVariantLoading(prev => ({ ...prev, [color]: true }));
      try {
        await deleteProductVariant({
          productId,
          variantId: variant.variantId
        }).unwrap();
        
        toast.success(`Variant ${color} deleted successfully!`);
      } catch (error) {
        toast.error(`Failed to delete variant ${color}`);
        console.error('Delete variant error:', error);
        setVariantLoading(prev => ({ ...prev, [color]: false }));
        return;
      }
    }

    // Clean up all image URLs to prevent memory leaks
    variants[color].imagePreviews.forEach(url => {
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    setVariants(prev => {
      const updated = { ...prev };
      delete updated[color];
      return updated;
    });

    setVariantLoading(prev => ({ ...prev, [color]: false }));
  };

  // Add custom size to a color
  const addCustomSize = (color, sizeName = '') => {
    const size = sizeName.trim().toUpperCase();
    if (!size) return;

    // Check if size already exists
    if (variants[color].sizes.some(s => s.size === size)) {
      toast.error(`Size "${size}" already exists for ${color}`);
      return;
    }

    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: [
          ...prev[color].sizes,
          {
            size,
            stock: 0,
            sku: productForm.productCode ? `${productForm.productCode}-${color}-${size}` : `${color}-${size}`,
            variantId: prev[color].variantId
          }
        ].sort((a, b) => commonSizes.indexOf(a.size) - commonSizes.indexOf(b.size))
      }
    }));
  };

  // Remove size from color
  const removeSize = (color, sizeIndex) => {
    if (variants[color].sizes.length <= 1) {
      toast.error('At least one size is required per color');
      return;
    }

    setVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: prev[color].sizes.filter((_, index) => index !== sizeIndex)
      }
    }));
  };

  // Save individual variant
  const saveVariant = async (color) => {
    setVariantLoading(prev => ({ ...prev, [color]: true }));

    try {
      const variantData = variants[color];
      const formData = new FormData();

      // Add variant data
      formData.append('color', color);
      formData.append('sizes', JSON.stringify(variantData.sizes));

      // Add new images
      variantData.images.forEach(image => {
        formData.append('images', image);
      });

      if (variantData.variantId) {
        // Update existing variant
        await updateProductVariant({
          productId,
          variantId: variantData.variantId,
          variantData: formData
        }).unwrap();
        toast.success(`Variant ${color} updated successfully!`);
      } else {
        // Create new variant
        const response = await addProductVariant({
          productId,
          variantData: formData
        }).unwrap();
        
        // Update local state with the new variant ID
        setVariants(prev => ({
          ...prev,
          [color]: {
            ...prev[color],
            variantId: response.data.id
          }
        }));
        toast.success(`Variant ${color} added successfully!`);
      }

      // Refetch product to get updated data
      await refetchProduct();
      
    } catch (error) {
      console.error(`Save variant ${color} error:`, error);
      toast.error(`Failed to save variant ${color}: ${error?.data?.message || 'Unknown error'}`);
    } finally {
      setVariantLoading(prev => ({ ...prev, [color]: false }));
    }
  };

  // Update stock for a specific size
  const updateSizeStockInBackend = async (color, sizeIndex) => {
    const variant = variants[color];
    const size = variant.sizes[sizeIndex];
    
    if (!variant.variantId) {
      toast.error('Please save the variant first before updating stock');
      return;
    }

    setVariantLoading(prev => ({ ...prev, [`${color}-${size.size}`]: true }));

    try {
      await updateVariantStock({
        productId,
        variantId: variant.variantId,
        stockData: {
          size: size.size,
          stock: size.stock
        }
      }).unwrap();

      toast.success(`Stock updated for ${color} - ${size.size}`);
    } catch (error) {
      console.error('Update stock error:', error);
      toast.error(`Failed to update stock: ${error?.data?.message || 'Unknown error'}`);
    } finally {
      setVariantLoading(prev => ({ ...prev, [`${color}-${size.size}`]: false }));
    }
  };

  // Save basic product information
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Add basic product data
      Object.entries(productForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // Add product details
      formData.append('productDetails', JSON.stringify(productDetails));

      const response = await updateProduct({
        productId,
        productData: formData
      }).unwrap();

      if (response.success) {
        toast.success('Product information updated successfully!');
        await refetchProduct();
      }
    } catch (error) {
      console.error('Update product error:', error);
      toast.error(error?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Form validation (basic only)
  const validateForm = () => {
    if (!productForm.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!productForm.productCode.trim()) {
      toast.error('Product code is required');
      return false;
    }
    if (!productForm.normalPrice || parseFloat(productForm.normalPrice) <= 0) {
      toast.error('Valid normal price is required');
      return false;
    }
    if (!productForm.categoryId) {
      toast.error('Category is required');
      return false;
    }

    // Validate product details
    for (let detail of productDetails) {
      if (!detail.title.trim() || !detail.description.trim()) {
        toast.error('All product details must have both title and description');
        return false;
      }
    }

    return true;
  };

  // Calculate statistics
  const getProductStats = () => {
    const colors = Object.keys(variants);
    const totalVariants = Object.values(variants).reduce(
      (sum, data) => sum + data.sizes.filter(size => size.stock > 0).length, 0
    );
    const totalImages = Object.values(variants).reduce(
      (sum, data) => sum + data.imagePreviews.length, 0
    );
    const colorsWithImages = colors.filter(color => 
      variants[color].imagePreviews.length > 0
    );

    return {
      colors: colors.length,
      colorsWithImages: colorsWithImages.length,
      totalVariants,
      totalImages
    };
  };

  const stats = getProductStats();
  const isLoading = loading || isUpdating || productLoading;

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h2>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex"
    >
      {/* Main Content Area */}
      <div className="flex-1">
        <div className={`${currentTheme.text.primary}`}>
          <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
              <motion.div
                variants={slideInVariants}
                className={`rounded-lg ${currentTheme.shadow} overflow-hidden ${currentTheme.bg.secondary}`}
              >
                {/* Header */}
                <div className={`border-b ${currentTheme.border} ${currentTheme.bg.primary}`}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                      
                      {/* Left Section: Back Button + Product Info */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={() => navigate(-1)}
                          className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h1 className="text-xl sm:text-2xl font-bold font-italiana">{product.name}</h1>
                          <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                            Product Code: {product.productCode}
                          </p>
                        </div>
                      </div>

                      {/* Right Section: View Button */}
                      <div className="flex sm:flex-row flex-col sm:space-x-3 space-y-2 sm:space-y-0">
                        <Link
                          to={`/dashboard/products/view/${product.id}`}
                          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <View size={16} className="mr-2" />
                          View
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                  {/* Basic Information Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                      Basic Information
                    </motion.h2>

                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Product Name - Full width */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <InputField
                          label="Product Name"
                          name="name"
                          value={productForm.name}
                          onChange={handleProductChange}
                          required
                          placeholder="Enter product name"
                        />
                      </div>

                      {/* Product Code */}
                      <InputField
                        label="Product Code"
                        name="productCode"
                        value={productForm.productCode}
                        onChange={handleProductChange}
                        required
                        placeholder="e.g., TS001"
                      />

                      {/* Category */}
                      <SelectField
                        label="Category"
                        name="categoryId"
                        value={productForm.categoryId}
                        onChange={handleProductChange}
                        required
                        options={categories}
                        loading={categoriesLoading}
                      />

                      {/* Subcategory */}
                      <SelectField
                        label="Subcategory"
                        name="subcategoryId"
                        value={productForm.subcategoryId}
                        onChange={handleProductChange}
                        options={subcategories}
                        loading={subcategoriesLoading}
                      />

                      {/* Normal Price */}
                      <InputField
                        label="Normal Price"
                        name="normalPrice"
                        value={productForm.normalPrice}
                        onChange={handleProductChange}
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />

                      {/* Offer Price */}
                      <InputField
                        label="Offer Price"
                        name="offerPrice"
                        value={productForm.offerPrice}
                        onChange={handleProductChange}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />

                      {/* Wholesale Price */}
                      <InputField
                        label="Wholesale Price"
                        name="wholesalePrice"
                        value={productForm.wholesalePrice}
                        onChange={handleProductChange}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />

                      {/* Status */}
                      <SelectField
                        label="Status"
                        name="status"
                        value={productForm.status}
                        onChange={handleProductChange}
                        options={[
                          { value: 'ACTIVE', label: 'Active' },
                          { value: 'INACTIVE', label: 'Inactive' },
                          { value: 'OUT_OF_STOCK', label: 'Out of Stock' }
                        ]}
                      />
                    </motion.div>

                    {/* Description */}
                    <motion.div variants={itemVariants} className="mt-6">
                      <TextArea
                        label="Description"
                        name="description"
                        value={productForm.description}
                        onChange={handleProductChange}
                        placeholder="Describe your product features, benefits, and specifications..."
                        rows={4}
                      />
                    </motion.div>
                    <motion.div
                      variants={itemVariants}
                      className="flex justify-center md:justify-end mt-6"
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        variant="primary"
                        className="min-w-[60px] sm:min-w-[80px] md:min-w-[200px] flex items-center justify-center gap-2"
                        loading={isLoading}
                      >
                        <Save size={18} />

                        {/* Text hidden on small screens */}
                        <span className="hidden md:inline">
                          Update Product Info
                        </span>
                      </Button>
                    </motion.div>



                  </motion.section>

                  {/* Product Details Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6"
                  >
                    <h2 className="text-xl font-semibold font-instrument flex items-center">
                      <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        2
                      </span>
                      Product Details
                    </h2>

                    <Button
                      type="button"
                      onClick={addProductDetail}
                      variant="success"
                      className="flex items-center justify-center gap-2 min-w-[50px] md:min-w-[140px]"
                    >
                      <Plus size={18} />

                      {/* Text hidden on mobile */}
                      <span className="hidden md:inline">Add Detail</span>
                    </Button>
                  </motion.div>


                    <AnimatePresence>
                      <motion.div variants={containerVariants} className="space-y-4">
                        {productDetails.map((detail, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg ${currentTheme.bg.secondary} ${currentTheme.border}`}
                          >
                            <div>
                              <InputField
                                label="Title"
                                value={detail.title}
                                onChange={(e) => handleDetailChange(index, 'title', e.target.value)}
                                placeholder="e.g., Material"
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <InputField
                                label="Description"
                                value={detail.description}
                                onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                                placeholder="e.g., 100% Premium Cotton"
                                required
                              />
                            </div>
                            <div className="flex items-end">
                              {productDetails.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeProductDetail(index)}
                                  variant="danger"
                                  className="w-full"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </motion.section>

                  {/* Color Variants Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-4 sm:p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    {/* Header and Buttons */}
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-start mb-6"
                    >
                      {/* Left: Title + Stats */}
                      <div className="w-full lg:w-1/2">
                        <h2 className="text-lg sm:text-xl font-semibold font-instrument flex items-center mb-2">
                          <span className="bg-purple-100 text-purple-800 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-3 text-sm sm:text-base">
                            3
                          </span>
                          Color Variants
                        </h2>

                        {/* Stats Pills */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {stats.colors} Colors
                          </span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            {stats.colorsWithImages} With Images
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                            {stats.totalVariants} Variants
                          </span>
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                            {stats.totalImages} Images
                          </span>
                        </div>
                      </div>

                      {/* Right: Color Buttons */}
                      <div className="w-full lg:w-1/2 flex flex-col gap-3">
                        {/* Common Colors */}
                        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                          {commonColors.map((color) => (
                            <Button
                              key={color}
                              type="button"
                              onClick={() => addColorVariant(color)}
                              variant="primary"
                              className="text-xs sm:text-sm px-3 py-2"
                            >
                              <Plus size={14} className="mr-1" />
                              {color}
                            </Button>
                          ))}
                        </div>

                        {/* Custom Color Button */}
                        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                          <Button
                            type="button"
                            onClick={() => setShowCustomColor(true)}
                            variant="secondary"
                            className="text-xs sm:text-sm px-3 py-2"
                          >
                            <Plus size={14} className="mr-1" />
                            Custom Color
                          </Button>
                        </div>

                        {/* Custom Color Input */}
                        <AnimatePresence>
                          {showCustomColor && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2"
                            >
                              <input
                                type="text"
                                id="customColorInput"
                                placeholder="Enter color name"
                                className={`flex-1 px-3 py-2 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById("customColorInput");
                                    const colorName = input.value.trim();
                                    if (!colorName) {
                                      toast.error("Please enter a color name");
                                      return;
                                    }
                                    addColorVariant(colorName);
                                    input.value = "";
                                    setShowCustomColor(false);
                                  }}
                                  variant="primary"
                                  className="text-xs sm:text-sm px-3 py-2"
                                >
                                  Add Color
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => setShowCustomColor(false)}
                                  variant="danger"
                                  className="text-xs sm:text-sm px-3 py-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Color Variants List */}
                      <AnimatePresence>
                        <motion.div variants={containerVariants} className="space-y-6">
                          {Object.entries(variants).map(([color, data]) => (
                            <motion.div
                              key={color}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className={`border-2 rounded-xl p-4 sm:p-6 ${currentTheme.bg.card} ${currentTheme.border}`}
                            >
                              {/* Header */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold font-instrument capitalize">
                                    {color}
                                    {data.variantId && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        Saved
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-xs sm:text-sm font-instrument mt-1">
                                    {data.sizes.filter((size) => size.stock > 0).length} sizes with stock • {data.imagePreviews.length} images
                                  </p>
                                </div>

                                {/* ---- RESPONSIVE BUTTONS (ICON ONLY ON MOBILE) ---- */}
                                <div className="flex gap-2">
                                  {/* SAVE / UPDATE BUTTON */}
                                  <Button 
                                    type="button" 
                                    onClick={() => saveVariant(color)}
                                    variant="primary"
                                    loading={variantLoading[color]}
                                    disabled={variantLoading[color]}
                                    className="flex items-center justify-center gap-1 text-xs sm:text-sm"
                                  >
                                    <Save size={14} />

                                    {/* Hidden on mobile */}
                                    <span className="hidden sm:inline">
                                      {data.variantId ? 'Update' : 'Save'} Variant
                                    </span>
                                  </Button>

                                  {/* REMOVE BUTTON */}
                                  <Button 
                                    type="button" 
                                    onClick={() => removeColorVariant(color)}
                                    variant="danger"
                                    loading={variantLoading[color]}
                                    disabled={variantLoading[color]}
                                    className="flex items-center justify-center gap-1 text-xs sm:text-sm"
                                  >
                                    <Trash2 size={14} />

                                    {/* Hidden on mobile */}
                                    <span className="hidden sm:inline">Remove</span>
                                  </Button>
                                </div>
                              </div>

                              {/* Sizes */}
                              <div className="mb-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                                  <h4 className="text-sm sm:text-md font-medium font-instrument">Sizes & Stock</h4>
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                      type="text"
                                      placeholder="Custom size (e.g., 28, 30)"
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          addCustomSize(color, e.target.value);
                                          e.target.value = "";
                                        }
                                      }}
                                      className={`px-3 py-1 border ${currentTheme.border} rounded text-sm ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        const input = document.querySelector(`input[placeholder="Custom size (e.g., 28, 30)"]`);
                                        addCustomSize(color, input?.value);
                                        if (input) input.value = "";
                                      }}
                                      variant="primary"
                                      className="text-xs sm:text-sm px-3 py-1"
                                    >
                                      Add Size
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                  {data.sizes.map((size, index) => (
                                    <motion.div
                                      key={size.size}
                                      whileHover={{ scale: 1.05 }}
                                      className={`border rounded-lg p-3 ${currentTheme.bg.secondary} ${currentTheme.border}`}
                                    >
                                      <div className="text-center mb-2">
                                        <span className="font-medium text-sm sm:text-base">{size.size}</span>
                                      </div>
                                      <input
                                        type="number"
                                        value={size.stock}
                                        onChange={(e) => updateSizeStock(color, index, e.target.value)}
                                        onBlur={() => updateSizeStockInBackend(color, index)}
                                        min="0"
                                        className={`w-full px-2 py-1 border ${currentTheme.border} rounded text-center text-xs sm:text-sm mb-2 ${currentTheme.bg.input} ${currentTheme.text.primary}`}
                                        placeholder="Stock"
                                      />
                                      <div className="text-[10px] sm:text-xs text-center truncate" title={size.sku}>
                                        SKU: {size.sku}
                                      </div>

                                      {data.sizes.length > 1 && (
                                        <Button
                                          type="button"
                                          onClick={() => removeSize(color, index)}
                                          variant="danger"
                                          className="w-full mt-2 text-[10px] sm:text-xs px-2 py-1"
                                        >
                                          Remove
                                        </Button>
                                      )}
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Images */}
                              <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                  <h4 className="text-sm sm:text-md font-medium font-instrument">
                                    Color Images ({data.imagePreviews.length}/10)
                                  </h4>
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    First image will be set as primary
                                  </span>
                                </div>

                                <div className="mb-4">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleColorImages(color, e.target.files)}
                                    className={`w-full px-3 py-2 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.bg.input}`}
                                  />
                                  <p className="text-xs sm:text-sm font-instrument mt-1">
                                    Upload high-quality images for {color}. These images will be used for all sizes of this color.
                                  </p>
                                </div>

                                {/* Previews */}
                                {data.imagePreviews.length > 0 && (
                                  <div>
                                    <label className="block text-xs sm:text-sm font-medium mb-2">Image Previews</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                      {data.imagePreviews.map((preview, index) => (
                                        <motion.div
                                          key={index}
                                          whileHover={{ scale: 1.05 }}
                                          className="relative group"
                                        >
                                          <img
                                            src={preview}
                                            alt={`${color} ${index + 1}`}
                                            className="w-full h-20 sm:h-24 object-cover rounded-lg border-2 border-gray-300 group-hover:border-blue-500 transition-colors"
                                          />
                                          <Button
                                            type="button"
                                            onClick={() => removeColorImage(color, index)}
                                            variant="danger"
                                            className="absolute -top-2 -right-2 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] sm:text-xs p-0"
                                          >
                                            ×
                                          </Button>
                                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-[10px] sm:text-xs p-1 text-center rounded-b-lg">
                                            {index === 0 ? "Primary" : `Image ${index + 1}`}
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>

                  </motion.section>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default EditProduct;