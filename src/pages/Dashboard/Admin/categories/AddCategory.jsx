// components/admin/categories/AddCategory.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useCreateCategoryMutation } from '../../../../redux/services/categoryService';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';
import TextArea from '../../../../components/Common/TextArea';

const AddCategory = () => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [createCategory] = useCreateCategoryMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove image
  const removeImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Category description is required');
      return false;
    }
    if (!image) {
      toast.error('Category image is required');
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
      const categoryData = {
        ...formData,
        image: image
      };

      await createCategory(categoryData).unwrap();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
      });
      removeImage();
      
      // Navigate back to categories list
      navigate('/dashboard/categories');
    } catch (error) {
      console.error('Create category error:', error);
      // Error toast is handled by the mutation
    } finally {
      setLoading(false);
    }
  };

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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Header Text */}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold font-italiana">
                        Create New Category
                        </h1>
                        <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                        Add a new product category
                        </p>
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
                      Category Information
                    </motion.h2>

                    <div className="space-y-6">
                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Category Name *"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Women's Fashion"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <TextArea
                          label="Description *"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          placeholder="Describe this category..."
                          rows={4}
                        />
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
                      Category Image
                    </motion.h2>

                    <motion.div variants={itemVariants} className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Category Image *
                        </label>
                        <p className={`text-sm ${currentTheme.text.muted} mb-4`}>
                          Upload a high-quality image that represents this category. Recommended size: 500x500px.
                        </p>
                        
                        {!imagePreview ? (
                          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${currentTheme.border} hover:border-blue-500 transition-colors`}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="category-image"
                            />
                            <label
                              htmlFor="category-image"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="w-12 h-12 text-gray-400 mb-4" />
                              <p className={`font-medium ${currentTheme.text.primary} mb-2`}>
                                Click to upload image
                              </p>
                              <p className={`text-sm ${currentTheme.text.muted}`}>
                                PNG, JPG, JPEG up to 5MB
                              </p>
                            </label>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="border rounded-lg p-4 ${currentTheme.border}">
                              <img
                                src={imagePreview}
                                alt="Category preview"
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
                        <h3 className="text-lg font-semibold font-instrument">Ready to Create Category</h3>
                        <p className={currentTheme.text.muted}>
                          This will add a new category to your store
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
                          Create Category
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

export default AddCategory;