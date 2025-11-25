// src/components/admin/quantity-pricing/AddQuantityPrice.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useAddSubcategoryQuantityPriceMutation } from '../../../../redux/services/subcategoryService';
import { useGetAllSubcategoriesQuery } from '../../../../redux/services/subcategoryService';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';

const AddQuantityPrice = () => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  // ✅ CORRECT: Use the admin quantity pricing mutation
  const [addQuantityPrice] = useAddSubcategoryQuantityPriceMutation();
  
  // ✅ CORRECT: Get all subcategories for the dropdown
  const { data: subcategoriesResponse } = useGetAllSubcategoriesQuery();
  const subcategories = subcategoriesResponse?.data || [];

  // Form state
  const [formData, setFormData] = useState({
    subcategoryId: '',
    quantity: '',
    priceType: 'PERCENTAGE',
    value: ''
  });

  const [errors, setErrors] = useState({});

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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.subcategoryId) {
      newErrors.subcategoryId = 'Please select a subcategory';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 2) {
      newErrors.quantity = 'Quantity must be at least 2';
    }

    if (!formData.value) {
      newErrors.value = 'Value is required';
    } else if (formData.priceType === 'PERCENTAGE' && parseFloat(formData.value) > 100) {
      newErrors.value = 'Discount percentage cannot exceed 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // ✅ CORRECT: Call the mutation with proper parameters
      await addQuantityPrice({
        subcategoryId: formData.subcategoryId,
        quantityPriceData: {
          quantity: parseInt(formData.quantity),
          priceType: formData.priceType,
          value: parseFloat(formData.value)
        }
      }).unwrap();
      
      toast.success('Quantity price added successfully!');
      
      // Navigate back to quantity pricing list
      navigate('/dashboard/quantity-pricing');
    } catch (error) {
      console.error('Add quantity price error:', error);
      toast.error(error?.data?.message || 'Failed to add quantity price. Please try again.');
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
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      {/* Back Button + Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={() => navigate(-1)}
                          className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h1 className="text-xl sm:text-2xl font-bold font-italiana">
                            Add Quantity Price
                          </h1>
                          <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                            Create a new quantity-based pricing rule
                          </p>
                        </div>
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
                      Quantity Price Information
                    </motion.h2>

                    <div className="space-y-6">
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Subcategory *
                        </label>
                        <select
                          name="subcategoryId"
                          value={formData.subcategoryId}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.subcategoryId ? 'border-red-500' : currentTheme.border
                          } ${currentTheme.bg.card} ${currentTheme.text.primary}`}
                        >
                          <option value="">Select a subcategory</option>
                          {subcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name} ({subcategory.category?.name})
                            </option>
                          ))}
                        </select>
                        {errors.subcategoryId && (
                          <p className="text-red-500 text-sm mt-1">{errors.subcategoryId}</p>
                        )}
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Quantity *"
                          name="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., 2, 3, 5"
                          min="2"
                          error={errors.quantity}
                        />
                        <p className={`text-xs ${currentTheme.text.muted} mt-1`}>
                          Minimum quantity required for this pricing rule (minimum 2)
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Price Type *
                        </label>
                        <select
                          name="priceType"
                          value={formData.priceType}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.border} ${currentTheme.bg.card} ${currentTheme.text.primary}`}
                        >
                          <option value="PERCENTAGE">Percentage Discount</option>
                          <option value="FIXED_AMOUNT">Fixed Total Price</option>
                        </select>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label={formData.priceType === 'PERCENTAGE' ? 'Discount Percentage *' : 'Total Price *'}
                          name="value"
                          type="number"
                          value={formData.value}
                          onChange={handleInputChange}
                          required
                          placeholder={formData.priceType === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 199'}
                          step="0.01"
                          min="0"
                          max={formData.priceType === 'PERCENTAGE' ? '100' : ''}
                          error={errors.value}
                        />
                        <p className={`text-xs ${currentTheme.text.muted} mt-1`}>
                          {formData.priceType === 'PERCENTAGE' 
                            ? 'Discount percentage applied when buying this quantity' 
                            : 'Fixed total price for this quantity'
                          }
                        </p>
                      </motion.div>
                    </div>
                  </motion.section>

                  {/* Submit Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-5 justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold font-instrument">Create Quantity Price Rule</h3>
                        <p className={currentTheme.text.muted}>
                          This will add a new quantity-based pricing rule
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
                          Create Price Rule
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

export default AddQuantityPrice;