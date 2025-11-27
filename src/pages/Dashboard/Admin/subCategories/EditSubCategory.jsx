import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetSubcategoryByIdQuery, useUpdateSubcategoryMutation } from '../../../../redux/services/subcategoryService';
import { useGetAllCategoriesQuery } from '../../../../redux/services/categoryService';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X, View } from 'lucide-react';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';
import TextArea from '../../../../components/Common/TextArea';

const EditSubCategory = () => {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const { data: subcategoryData, isLoading: subcategoryLoading, error: subcategoryError } = useGetSubcategoryByIdQuery(subcategoryId);
  const { data: categoriesResponse } = useGetAllCategoriesQuery();



  const [updateSubcategory] = useUpdateSubcategoryMutation();

  const subcategory = subcategoryData?.data;
const categories = categoriesResponse?.data?.categories || 
                  categoriesResponse?.categories || 
                  categoriesResponse?.data || 
                  categoriesResponse || 
                  [];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    isActive: true
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Theme-based styling
  const themeClasses = {
    light: {
      bg: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        card: 'bg-white',
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600',
      },
      border: 'border-gray-200',
      shadow: 'shadow-lg',
      input: 'bg-white border-gray-300 text-gray-900'
    },
    dark: {
      bg: {
        primary: 'bg-gray-900',
        secondary: 'bg-gray-800',
        card: 'bg-gray-800',
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-200',
        muted: 'text-gray-400',
      },
      border: 'border-gray-700',
      shadow: 'shadow-lg shadow-gray-900',
      input: 'bg-gray-700 border-gray-600 text-white'
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

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

  // Initialize form with subcategory data
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || '',
        description: subcategory.description || '',
        categoryId: subcategory.categoryId || '',
        isActive: subcategory.isActive ?? true
      });

      if (subcategory.image) {
        setImagePreview(subcategory.image);
      }
    }
  }, [subcategory]);

  // Clean up image preview URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImage(file);
      
      // Create preview URL and clean up previous one
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove image
  const removeImage = () => {
    setImage(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Subcategory name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Subcategory description is required');
      return false;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('isActive', formData.isActive.toString());
      
      // Append image if a new one was selected
      if (image) {
        formDataToSend.append('image', image);
      }

      // Call the update mutation
      const result = await updateSubcategory({
        subcategoryId,
        updateData: formDataToSend // Send as FormData for file upload
      }).unwrap();

      toast.success('Subcategory updated successfully!');
      
      // Navigate back to subcategories list
      navigate('/dashboard/subcategories');
    } catch (error) {
      console.error('Update subcategory error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update subcategory';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (subcategoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (subcategoryError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Subcategory</h2>
          <p className="text-gray-600 mb-4">Please try again later</p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Subcategory Not Found</h2>
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
      <div className="flex-1">
        <div className={currentTheme.text.primary}>
          <div className="min-h-screen">
            <div className="max-w-4xl mx-auto">
              <motion.div
                variants={containerVariants}
                className={`rounded-lg ${currentTheme.shadow} overflow-hidden ${currentTheme.bg.secondary}`}
              >
                {/* Header */}
                <div className={`border-b ${currentTheme.border} ${currentTheme.bg.primary}`}>
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      {/* Left: Back Button + Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={() => navigate(-1)}
                          className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h1 className="text-xl sm:text-2xl font-bold font-italiana">{subcategory.name}</h1>
                          <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                            Edit subcategory details
                          </p>
                        </div>
                      </div>

                      {/* Right: View Button */}
                      <div className="flex sm:flex-row flex-col sm:space-x-3 space-y-2 sm:space-y-0">
                        <Link
                          to={`/dashboard/subcategories/view/${subcategory.id}`}
                          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <View size={16} className="mr-2" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Information */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                      Subcategory Information
                    </motion.h2>

                    <div className="space-y-6">
                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Subcategory Name *"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., T-Shirts, Dresses, etc."
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <TextArea
                          label="Description *"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          placeholder="Describe this subcategory..."
                          rows={4}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Category *
                        </label>
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.input}`}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </motion.div>

                      <motion.div variants={itemVariants} className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className={`ml-2 text-sm font-medium ${currentTheme.text.secondary}`}>
                          Active Subcategory
                        </label>
                      </motion.div>
                    </div>
                  </motion.section>

                  {/* Image Upload */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                      Subcategory Image
                    </motion.h2>

                    <motion.div variants={itemVariants} className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Subcategory Image
                        </label>
                        <p className={`text-sm ${currentTheme.text.muted} mb-4`}>
                          {image ? 'New image selected' : 'Current subcategory image'}
                        </p>
                        
                        {!imagePreview ? (
                          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${currentTheme.border} hover:border-blue-500 transition-colors`}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="subcategory-image"
                            />
                            <label
                              htmlFor="subcategory-image"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="w-12 h-12 text-gray-400 mb-4" />
                              <p className={`font-medium ${currentTheme.text.primary} mb-2`}>
                                Click to upload new image
                              </p>
                              <p className={`text-sm ${currentTheme.text.muted}`}>
                                PNG, JPG, JPEG up to 5MB
                              </p>
                            </label>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className={`border rounded-lg p-4 ${currentTheme.border}`}>
                              <img
                                src={imagePreview}
                                alt="Subcategory preview"
                                className="w-48 h-48 object-cover rounded-lg mx-auto"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.section>

                  {/* Submit Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-5 justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold font-instrument">Update Subcategory</h3>
                        <p className={currentTheme.text.muted}>
                          Save changes to this subcategory
                        </p>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-4">
                        <Button
                          type="button"
                          onClick={() => navigate(-1)}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          variant="primary"
                          className="min-w-[200px]"
                          loading={loading}
                        >
                          Update Subcategory
                        </Button>
                      </div>
                    </motion.div>
                  </motion.section>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default EditSubCategory;