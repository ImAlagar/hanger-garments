// components/admin/coupons/AddCoupon.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useCreateCouponMutation } from '../../../../redux/services/couponService';
import { toast } from 'react-toastify';
import { ArrowLeft, Calendar, Percent, DollarSign, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';
import SelectField from '../../../../components/Common/SelectField';

const AddCoupon = () => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [createCoupon] = useCreateCouponMutation();

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Generate coupon code
  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return false;
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error('Discount value must be greater than 0');
      return false;
    }
    if (formData.discountType === 'PERCENTAGE' && parseFloat(formData.discountValue) > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return false;
    }
    if (!formData.validFrom || !formData.validUntil) {
      toast.error('Valid from and until dates are required');
      return false;
    }
    if (new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      toast.error('Valid until date must be after valid from date');
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
      const couponData = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        isActive: formData.isActive
      };

      await createCoupon(couponData).unwrap();
      
      toast.success('Coupon created successfully!');
      navigate('/dashboard/coupons');
    } catch (error) {
      console.error('Create coupon error:', error);
      toast.error(error.data?.message || 'Failed to create coupon');
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
                  <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <h1 className="text-2xl font-bold font-italiana">Create New Coupon</h1>
                        <p className={`${currentTheme.text.muted} font-instrument`}>
                          Add a new discount coupon
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
                      Coupon Information
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants} className="md:col-span-2">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <InputField
                              label="Coupon Code *"
                              name="code"
                              value={formData.code}
                              onChange={handleInputChange}
                              required
                              placeholder="e.g., SUMMER25"
                              icon={<Hash size={16} />}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              onClick={generateCouponCode}
                              variant="secondary"
                              className="whitespace-nowrap"
                            >
                              Generate
                            </Button>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="md:col-span-2">
                        <InputField
                          label="Description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe this coupon..."
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <SelectField
                          label="Discount Type *"
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleInputChange}
                          options={[
                            { value: 'PERCENTAGE', label: 'Percentage' },
                            { value: 'FIXED_AMOUNT', label: 'Fixed Amount' }
                          ]}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label={`Discount Value * ${formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}`}
                          name="discountValue"
                          type="number"
                          value={formData.discountValue}
                          onChange={handleInputChange}
                          required
                          min="0"
                          max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                          step="0.01"
                          placeholder={formData.discountType === 'PERCENTAGE' ? '25' : '10'}
                          icon={formData.discountType === 'PERCENTAGE' ? <Percent size={16} /> : <DollarSign size={16} />}
                        />
                      </motion.div>
                    </div>
                  </motion.section>

                  {/* Conditions & Limits */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                      Conditions & Limits
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Minimum Order Amount"
                          name="minOrderAmount"
                          type="number"
                          value={formData.minOrderAmount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          icon={<DollarSign size={16} />}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Usage Limit"
                          name="usageLimit"
                          type="number"
                          value={formData.usageLimit}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="Unlimited"
                        />
                      </motion.div>

                      {formData.discountType === 'PERCENTAGE' && (
                        <motion.div variants={itemVariants} className="md:col-span-2">
                          <InputField
                            label="Maximum Discount Amount"
                            name="maxDiscount"
                            type="number"
                            value={formData.maxDiscount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="No limit"
                            icon={<DollarSign size={16} />}
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.section>

                  {/* Validity Period */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                      Validity Period
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Valid From *"
                          name="validFrom"
                          type="datetime-local"
                          value={formData.validFrom}
                          onChange={handleInputChange}
                          required
                          icon={<Calendar size={16} />}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Valid Until *"
                          name="validUntil"
                          type="datetime-local"
                          value={formData.validUntil}
                          onChange={handleInputChange}
                          required
                          icon={<Calendar size={16} />}
                        />
                      </motion.div>
                    </div>
                  </motion.section>

                  {/* Status */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-orange-100 text-orange-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
                      Status
                    </motion.h2>

                    <motion.div variants={itemVariants} className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Active (Coupon is available for use)
                      </label>
                    </motion.div>
                  </motion.section>

                  {/* Submit Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-5 justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold font-instrument">Ready to Create Coupon</h3>
                        <p className={currentTheme.text.muted}>
                          This will add a new coupon to your store
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
                          Create Coupon
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

export default AddCoupon;