// components/admin/sliders/AddSlider.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useCreateSliderMutation } from '../../../../redux/services/sliderService';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X, Image, Layout, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';
import TextArea from '../../../../components/Common/TextArea';
import SelectField from '../../../../components/Common/SelectField';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';

const AddSlider = () => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

   const { user, token } = useSelector((state) => state.auth);
  const [createSlider] = useCreateSliderMutation();

    useEffect(() => {
    if (!token) {
      toast.error('Please login to create sliders');
      navigate('/admin/login');
      return;
    }
    
    if (user?.role !== 'ADMIN') {
      toast.error('Unauthorized access');
      navigate('/admin');
      return;
    }
  }, [token, user, navigate]);
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
      } else {
        setMainImage(file);
        setMainImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Remove image
  const removeImage = (type) => {
    if (type === 'bg') {
      setBgImage(null);
      if (bgImagePreview) {
        URL.revokeObjectURL(bgImagePreview);
      }
      setBgImagePreview(null);
    } else {
      setMainImage(null);
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
      setMainImagePreview(null);
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Slider title is required');
      return false;
    }
    if (!bgImage) {
      toast.error('Background image is required');
      return false;
    }
    if (!mainImage) {
      toast.error('Main image is required');
      return false;
    }
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return false;
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const sliderData = new FormData();
      
      // Append all fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          let value = formData[key];
          if (typeof value === 'boolean') value = value.toString();
          if (typeof value === 'number') value = value.toString();
          sliderData.append(key, value);
        }
      });
      
      // Append files
      if (bgImage) {
        sliderData.append('bgImage', bgImage);
      }
      if (mainImage) {
        sliderData.append('image', mainImage);
      }

      
      const result = await createSlider(sliderData).unwrap();
      
      
      // Reset form
      setFormData({
        title: '', subtitle: '', description: '', smallText: '', offerText: '',
        buttonText: '', buttonLink: '', layout: 'left', order: 0, isActive: true,
        startDate: '', endDate: ''
      });
      
      removeImage('bg');
      removeImage('main');
      
      navigate('/dashboard/sliders');
      
    } catch (error) {
      console.error('❌ Frontend catch error:', error);
      
      // Additional error handling in component
      if (error?.status === 401) {
        toast.error('Session expired. Please login again.');
        // Optionally dispatch logout action here
      }
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    
                    {/* Left: Back button + Title */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                        >
                        <ArrowLeft size={20} />
                        </button>
                        <div>
                        <h1 className="text-xl sm:text-2xl md:text-2xl font-bold font-italiana">
                            Create New Slider
                        </h1>
                        <p className={`text-sm sm:text-base ${currentTheme.text.muted} font-instrument`}>
                            Add a new home page slider
                        </p>
                        </div>
                    </div>

                    {/* Right (optional: actions) */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 mt-2 sm:mt-0">
                        {/* Add buttons here if needed */}
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

                  {/* Images */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-semibold font-instrument mb-6 flex items-center"
                    >
                      <span className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                      Slider Images
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Background Image */}
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Background Image *
                        </label>
                        <p className={`text-sm ${currentTheme.text.muted} mb-4`}>
                          Recommended: 1920x1080px, high quality
                        </p>
                        
                        {!bgImagePreview ? (
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
                                Upload Background
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
                        )}
                      </motion.div>

                      {/* Main Image */}
                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          Main Image *
                        </label>
                        <p className={`text-sm ${currentTheme.text.muted} mb-4`}>
                          Recommended: 600x600px, transparent background
                        </p>
                        
                        {!mainImagePreview ? (
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
                                Upload Main Image
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
                        )}
                      </motion.div>
                    </div>
                  </motion.section>

                {/* Schedule & Status */}
                <motion.section
                variants={containerVariants}
                className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                >
                <motion.h2 
                    variants={itemVariants}
                    className="text-xl font-semibold font-instrument mb-6 flex items-center"
                >
                    <span className="bg-orange-100 text-orange-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
                    Schedule & Status
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
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
                        placeholderText="Select start date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    </motion.div>

                    {/* End Date */}
                    <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
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
                        placeholderText="Select end date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    </motion.div>
                </div>

                {/* Active Checkbox */}
                <motion.div variants={itemVariants} className="flex items-center mt-6">
                    <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                        setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
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
                        <h3 className="text-lg font-semibold font-instrument">Ready to Create Slider</h3>
                        <p className={currentTheme.text.muted}>
                          This will add a new slider to your home page
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
                          Create Slider
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

export default AddSlider;