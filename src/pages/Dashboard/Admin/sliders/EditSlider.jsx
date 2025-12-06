import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import { useGetSliderByIdQuery, useUpdateSliderMutation } from '../../../../redux/services/sliderService';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X, Image, Layout, Calendar, View, Eye, EyeOff } from 'lucide-react';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';
import TextArea from '../../../../components/Common/TextArea';
import SelectField from '../../../../components/Common/SelectField';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditSlider = () => {
  const { sliderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const { data: sliderData, isLoading: sliderLoading } = useGetSliderByIdQuery(sliderId);
  const [updateSlider] = useUpdateSliderMutation();

  const slider = sliderData?.data;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    smallText: '',
    offerText: '',
    buttonText: '',
    buttonLink: '',
    layout: 'left',
    order: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const [bgImage, setBgImage] = useState(null);
  const [bgImagePreview, setBgImagePreview] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  
  // State to track if images are enabled/disabled
  const [useBgImage, setUseBgImage] = useState(true);
  const [useMainImage, setUseMainImage] = useState(true);

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

  // Initialize form with slider data
  useEffect(() => {
    if (slider) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: slider.title || '',
        subtitle: slider.subtitle || '',
        description: slider.description || '',
        smallText: slider.smallText || '',
        offerText: slider.offerText || '',
        buttonText: slider.buttonText || '',
        buttonLink: slider.buttonLink || '',
        layout: slider.layout || 'left',
        order: slider.order || 0,
        isActive: slider.isActive ?? true,
        startDate: formatDateForInput(slider.startDate),
        endDate: formatDateForInput(slider.endDate)
      });

      // Set image previews from existing data
      if (slider.bgImage) {
        setBgImagePreview(slider.bgImage);
        setUseBgImage(true);
      } else {
        setUseBgImage(false);
      }

      if (slider.image) {
        setMainImagePreview(slider.image);
        setUseMainImage(true);
      } else {
        setUseMainImage(false);
      }
    }
  }, [slider]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e, type) => {
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

      if (type === 'bg') {
        setBgImage(file);
        setBgImagePreview(URL.createObjectURL(file));
        setUseBgImage(true);
      } else {
        setMainImage(file);
        setMainImagePreview(URL.createObjectURL(file));
        setUseMainImage(true);
      }
    }
  };

  // Remove image
  const removeImage = (type) => {
    if (type === 'bg') {
      setBgImage(null);
      if (bgImagePreview && bgImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(bgImagePreview);
      }
      setBgImagePreview(null);
      setUseBgImage(false);
    } else {
      setMainImage(null);
      if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(mainImagePreview);
      }
      setMainImagePreview(null);
      setUseMainImage(false);
    }
  };

  // Toggle image usage
  const toggleImageUsage = (type) => {
    if (type === 'bg') {
      if (useBgImage && (bgImage || slider?.bgImage)) {
        if (window.confirm('Remove background image?')) {
          removeImage('bg');
        }
      } else {
        setUseBgImage(true);
      }
    } else {
      if (useMainImage && (mainImage || slider?.image)) {
        if (window.confirm('Remove main image?')) {
          removeImage('main');
        }
      } else {
        setUseMainImage(true);
      }
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Slider title is required');
      return false;
    }
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
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
      const updateData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          updateData.append(key, formData[key]);
        }
      });
      
      // Handle background image
      if (bgImage) {
        // New file uploaded
        updateData.append('bgImage', bgImage);
      } else if (!useBgImage) {
        // User wants to remove existing image
        updateData.append('bgImage', ''); // Empty string to indicate remove
        updateData.append('bgImagePublicId', ''); // Also clear public ID
      }
      
      // Handle main image
      if (mainImage) {
        // New file uploaded
        updateData.append('image', mainImage);
      } else if (!useMainImage) {
        // User wants to remove existing image
        updateData.append('image', ''); // Empty string to indicate remove
        updateData.append('imagePublicId', ''); // Also clear public ID
      }
      
      // Add flags for image usage
      updateData.append('useBgImage', useBgImage.toString());
      updateData.append('useMainImage', useMainImage.toString());

      await updateSlider({
        sliderId,
        sliderData: updateData
      }).unwrap();
      
      toast.success('Slider updated successfully!');
      navigate('/dashboard/sliders');
    } catch (error) {
      console.error('Update slider error:', error);
      toast.error(error?.data?.message || 'Failed to update slider');
    } finally {
      setLoading(false);
    }
  };

  if (sliderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!slider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Slider Not Found</h2>
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
                    {/* Responsive flex container */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    
                    {/* Left: Back button + Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                        <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-fit`}
                        >
                        <ArrowLeft size={20} />
                        </button>

                        <div>
                        <h1 className="text-xl sm:text-2xl font-bold font-italiana">
                            {slider.title}
                        </h1>
                        <p className={`${currentTheme.text.muted} font-instrument text-sm sm:text-base`}>
                            Edit slider details (Images are optional)
                        </p>
                        </div>
                    </div>

                    {/* Right: Action button */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                        <Link
                        to={`/dashboard/sliders/view/${slider.id}`}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
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
                      Slider Information
                    </motion.h2>

                    <div className="space-y-6">
                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Title *"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Summer Collection 2024"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Subtitle"
                          name="subtitle"
                          value={formData.subtitle}
                          onChange={handleInputChange}
                          placeholder="e.g., Discover the latest trends"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <TextArea
                          label="Description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Detailed description of the slider..."
                          rows={3}
                        />
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants}>
                          <InputField
                            label="Small Text"
                            name="smallText"
                            value={formData.smallText}
                            onChange={handleInputChange}
                            placeholder="e.g., Limited Time Offer"
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <InputField
                            label="Offer Text"
                            name="offerText"
                            value={formData.offerText}
                            onChange={handleInputChange}
                            placeholder="e.g., 50% OFF"
                          />
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants}>
                          <SelectField
                            label="Layout *"
                            name="layout"
                            value={formData.layout}
                            onChange={handleInputChange}
                            options={[
                              { value: 'left', label: 'Left Aligned' },
                              { value: 'right', label: 'Right Aligned' },
                              { value: 'center', label: 'Center Aligned' }
                            ]}
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <InputField
                            label="Order"
                            name="order"
                            type="number"
                            value={formData.order}
                            onChange={handleInputChange}
                            min="0"
                            placeholder="0"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Call to Action */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                      Call to Action
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Button Text"
                          name="buttonText"
                          value={formData.buttonText}
                          onChange={handleInputChange}
                          placeholder="e.g., Shop Now"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Button Link"
                          name="buttonLink"
                          value={formData.buttonLink}
                          onChange={handleInputChange}
                          placeholder="e.g., /collections/summer"
                        />
                      </motion.div>
                    </div>
                  </motion.section>

                  {/* Images - Optional */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                      Slider Images (Optional)
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Background Image - Optional */}
                      <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary}`}>
                            Background Image
                          </label>
                          <button
                            type="button"
                            onClick={() => toggleImageUsage('bg')}
                            className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                              useBgImage 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {useBgImage ? <Eye size={14} /> : <EyeOff size={14} />}
                            {useBgImage ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                        
                        <p className={`text-sm ${currentTheme.text.muted} mb-4`}>
                          {useBgImage ? (bgImage ? 'New image selected' : 'Current background image') : 'Image disabled'}
                        </p>
                        
                        {useBgImage ? (
                          !bgImagePreview ? (
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center ${currentTheme.border} hover:border-blue-500 transition-colors`}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'bg')}
                                className="hidden"
                                id="bg-image"
                              />
                              <label
                                htmlFor="bg-image"
                                className="cursor-pointer flex flex-col items-center"
                              >
                                <Image className="w-12 h-12 text-gray-400 mb-4" />
                                <p className={`font-medium ${currentTheme.text.primary} mb-2`}>
                                  {slider.bgImage ? 'Replace Background' : 'Upload Background'}
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
                                  src={bgImagePreview}
                                  alt="Background preview"
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage('bg')}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )
                        ) : (
                          <div className={`border rounded-lg p-6 text-center ${currentTheme.border} ${currentTheme.bg.secondary}`}>
                            <p className={`font-medium ${currentTheme.text.secondary} mb-2`}>
                              Background image disabled
                            </p>
                            <p className={`text-sm ${currentTheme.text.muted}`}>
                              Slider will use default background
                            </p>
                          </div>
                        )}
                      </motion.div>

                      {/* Main Image - Optional */}
                      <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary}`}>
                            Main Image
                          </label>
                          <button
                            type="button"
                            onClick={() => toggleImageUsage('main')}
                            className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                              useMainImage 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {useMainImage ? <Eye size={14} /> : <EyeOff size={14} />}
                            {useMainImage ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                        
                        <p className={`text-sm ${currentTheme.text.muted} mb-4`}>
                          {useMainImage ? (mainImage ? 'New image selected' : 'Current main image') : 'Image disabled'}
                        </p>
                        
                        {useMainImage ? (
                          !mainImagePreview ? (
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center ${currentTheme.border} hover:border-blue-500 transition-colors`}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'main')}
                                className="hidden"
                                id="main-image"
                              />
                              <label
                                htmlFor="main-image"
                                className="cursor-pointer flex flex-col items-center"
                              >
                                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                <p className={`font-medium ${currentTheme.text.primary} mb-2`}>
                                  {slider.image ? 'Replace Main Image' : 'Upload Main Image'}
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
                                  src={mainImagePreview}
                                  alt="Main image preview"
                                  className="w-full h-48 object-contain rounded-lg"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage('main')}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )
                        ) : (
                          <div className={`border rounded-lg p-6 text-center ${currentTheme.border} ${currentTheme.bg.secondary}`}>
                            <p className={`font-medium ${currentTheme.text.secondary} mb-2`}>
                              Main image disabled
                            </p>
                            <p className={`text-sm ${currentTheme.text.muted}`}>
                              Slider will show text only
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </div>
                    
                    <motion.div variants={itemVariants} className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className={`text-sm ${currentTheme.text.secondary}`}>
                        <span className="font-medium">Note:</span> Toggle images on/off. Disabling will remove the image from the slider.
                      </p>
                    </motion.div>
                  </motion.section>

                {/* Schedule & Status */}
                <motion.section
                variants={containerVariants}
                className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                >
                <motion.h2
                    variants={itemVariants}
                    className="text-xl font-semibold font-instrument mb-6 flex items-center gap-2"
                >
                    <span className="bg-orange-100 text-orange-800 rounded-full w-8 h-8 flex items-center justify-center text-sm sm:text-base">
                    4
                    </span>
                    Schedule & Status
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                    {/* Start Date */}
                    <motion.div variants={itemVariants} className="w-full min-w-0">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Start Date (Optional)</label>
                    <div className="relative">
                        <DatePicker
                        selected={formData.startDate ? new Date(formData.startDate) : null}
                        onChange={(date) =>
                            setFormData(prev => ({
                            ...prev,
                            startDate: date ? date.toISOString() : ''
                            }))
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        dateFormat="Pp"
                        placeholderText="Select start date (optional)"
                        className={`w-full border rounded-lg px-3 py-2 ${currentTheme.border} ${currentTheme.bg.primary} ${currentTheme.text.primary}`}
                        isClearable
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    </motion.div>

                    {/* End Date */}
                    <motion.div variants={itemVariants} className="w-full min-w-0">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">End Date (Optional)</label>
                    <div className="relative">
                        <DatePicker
                        selected={formData.endDate ? new Date(formData.endDate) : null}
                        onChange={(date) =>
                            setFormData(prev => ({
                            ...prev,
                            endDate: date ? date.toISOString() : ''
                            }))
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        dateFormat="Pp"
                        placeholderText="Select end date (optional)"
                        className={`w-full border rounded-lg px-3 py-2 ${currentTheme.border} ${currentTheme.bg.primary} ${currentTheme.text.primary}`}
                        isClearable
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    </motion.div>
                </div>

                {/* Active Checkbox */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-start sm:items-center mt-4 sm:mt-6"
                >
                    <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                        setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 mt-2 sm:mt-0 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Active (Slider will be visible on home page)
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
                        <h3 className="text-lg font-semibold font-instrument">Update Slider</h3>
                        <p className={currentTheme.text.muted}>
                          {useBgImage || useMainImage ? 'Save changes to this slider' : 'Save changes to text-only slider'}
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
                          Update Slider
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

export default EditSlider;