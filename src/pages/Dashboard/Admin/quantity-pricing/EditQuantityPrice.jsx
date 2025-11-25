// src/components/admin/quantity-pricing/EditQuantityPrice.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import { 
  useGetQuantityPriceByIdQuery, 
  useUpdateSubcategoryQuantityPriceMutation 
} from '../../../../redux/services/subcategoryService';
import { toast } from 'react-toastify';
import { ArrowLeft, View } from 'lucide-react';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';

const EditQuantityPrice = () => {
  const { subcategoryId, priceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  // ✅ CORRECT: Use the specific quantity price query
  const { 
    data: quantityPriceResponse, 
    isLoading: priceLoading, 
    error: priceError 
  } = useGetQuantityPriceByIdQuery(priceId);
  
  // ✅ CORRECT: Use the update mutation
  const [updateQuantityPrice] = useUpdateSubcategoryQuantityPriceMutation();

  const quantityPrice = quantityPriceResponse?.data;

  // Form state
  const [formData, setFormData] = useState({
    quantity: '',
    priceType: 'PERCENTAGE',
    value: '',
    isActive: true
  });

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

  // Initialize form with price data
  useEffect(() => {
    if (quantityPrice) {
      setFormData({
        quantity: quantityPrice.quantity?.toString() || '',
        priceType: quantityPrice.priceType || 'PERCENTAGE',
        value: quantityPrice.value?.toString() || '',
        isActive: quantityPrice.isActive ?? true
      });
    }
  }, [quantityPrice]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.quantity || parseInt(formData.quantity) < 2) {
      toast.error('Quantity must be at least 2');
      return false;
    }
    if (!formData.value) {
      toast.error('Value is required');
      return false;
    }
    if (formData.priceType === 'PERCENTAGE' && parseFloat(formData.value) > 100) {
      toast.error('Discount percentage cannot exceed 100%');
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
      // ✅ CORRECT: Call the update mutation
      await updateQuantityPrice({
        quantityPriceId: priceId,
        updateData: {
          quantity: parseInt(formData.quantity),
          priceType: formData.priceType,
          value: parseFloat(formData.value),
          isActive: formData.isActive
        }
      }).unwrap();

      toast.success('Quantity price updated successfully!');
      
      // Navigate back to quantity pricing list
      navigate('/dashboard/quantity-pricing');
    } catch (error) {
      console.error('Update quantity price error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update quantity price';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (priceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (priceError || !quantityPrice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Quantity Price Not Found</h2>
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
                          <h1 className="text-xl sm:text-2xl font-bold font-italiana">
                            Buy {quantityPrice.quantity} - {quantityPrice.subcategory?.name}
                          </h1>
                          <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                            Edit quantity price details
                          </p>
                        </div>
                      </div>

                      {/* Right: View Button */}
                      <div className="flex sm:flex-row flex-col sm:space-x-3 space-y-2 sm:space-y-0">
                        <Link
                          to={`/dashboard/quantity-pricing/view/${subcategoryId}/${priceId}`}
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
                      Quantity Price Information
                    </motion.h2>

                    <div className="space-y-6">
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
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.input}`}
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
                        />
                        <p className={`text-xs ${currentTheme.text.muted} mt-1`}>
                          {formData.priceType === 'PERCENTAGE' 
                            ? 'Discount percentage applied when buying this quantity' 
                            : 'Fixed total price for this quantity'
                          }
                        </p>
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
                          Active Price Rule
                        </label>
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
                        <h3 className="text-lg font-semibold font-instrument">Update Quantity Price</h3>
                        <p className={currentTheme.text.muted}>
                          Save changes to this quantity price rule
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
                          Update Price Rule
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

export default EditQuantityPrice;