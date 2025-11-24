import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  User, 
  Lock, 
  Store, 
  MapPin, 
  Upload, 
  X,
  Eye,
  EyeOff,
  Building,
  Globe,
  Instagram,
  Camera
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useCreateUserMutation } from '../../../../redux/services/userService';
import Button from '../../../../components/Common/Button';

const AddWholesaler = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'WHOLESALER'
  });

  const [wholesalerData, setWholesalerData] = useState({
    companyName: '',
    businessType: '',
    gstNumber: '',
    websiteUrl: '',
    instagramUrl: '',
    city: '',
    state: '',
  });

  const [shopPhotos, setShopPhotos] = useState([]);
  const [shopPhotoPreviews, setShopPhotoPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const businessTypes = [
    'CLOTHING_STORE',
    'GST_BUSINESS', 
    'WEBSITE',
    'INSTAGRAM_PAGE',
    'STARTUP'
  ];

  // Helper functions to determine which fields to show
  const showGSTField = () => {
    return wholesalerData.businessType === "GST_BUSINESS";
  };

  const showWebsiteField = () => {
    return wholesalerData.businessType === "WEBSITE";
  };

  const showInstagramField = () => {
    return wholesalerData.businessType === "INSTAGRAM_PAGE";
  };

  const showShopPhotos = () => {
    return wholesalerData.businessType === "CLOTHING_STORE";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleWholesalerChange = (e) => {
    const { name, value } = e.target;
    setWholesalerData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleShopPhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (shopPhotos.length + validFiles.length > 5) {
      toast.error('Maximum 5 shop photos allowed');
      return;
    }

    setShopPhotos(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setShopPhotoPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeShopPhoto = (index) => {
    setShopPhotos(prev => prev.filter((_, i) => i !== index));
    setShopPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic user validation
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    // Wholesaler validation - ALL of these are required for ALL wholesalers
    if (!wholesalerData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!wholesalerData.businessType) newErrors.businessType = 'Business type is required';
    if (!wholesalerData.city.trim()) newErrors.city = 'City is required';
    if (!wholesalerData.state.trim()) newErrors.state = 'State is required';

    // Type-specific validations
    if (showGSTField() && (!wholesalerData.gstNumber.trim() || wholesalerData.gstNumber.length !== 15)) {
      newErrors.gstNumber = 'GST Number must be 15 characters long';
    }

    if (showWebsiteField() && !wholesalerData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    }

    if (showInstagramField() && !wholesalerData.instagramUrl.trim()) {
      newErrors.instagramUrl = 'Instagram URL is required';
    }

    if (showShopPhotos() && shopPhotos.length === 0) {
      newErrors.shopPhotos = 'Please upload at least one shop photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      // Create JSON data instead of FormData
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'WHOLESALER',
        phone: formData.phone.trim() || undefined,
        // Include wholesaler profile data - ALL of these are required
        wholesalerProfile: {
          companyName: wholesalerData.companyName.trim(), // REQUIRED for all
          businessType: wholesalerData.businessType, // REQUIRED for all
          city: wholesalerData.city.trim(), // REQUIRED for all
          state: wholesalerData.state.trim(), // REQUIRED for all
          // Conditionally include optional fields
          ...(wholesalerData.gstNumber.trim() && { gstNumber: wholesalerData.gstNumber.trim() }),
          ...(wholesalerData.websiteUrl.trim() && { websiteUrl: wholesalerData.websiteUrl.trim() }),
          ...(wholesalerData.instagramUrl.trim() && { instagramUrl: wholesalerData.instagramUrl.trim() }),
        }
      };

      // If you need to handle file uploads separately, you might need a different approach
      // For now, let's assume the API accepts JSON without files
      
      await createUser(userData).unwrap();
      
      toast.success('Wholesaler created successfully!');
      navigate('/dashboard/users');
    } catch (error) {
      console.error('Create wholesaler error:', error);
      
      // Handle API validation errors
      if (error.data?.errors) {
        const apiErrors = {};
        error.data.errors.forEach(err => {
          if (!apiErrors[err.field]) {
            apiErrors[err.field] = err.message;
          }
        });
        setErrors(apiErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.data?.message || 'Failed to create wholesaler');
      }
    }
  };

  const formatBusinessType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Theme-based styles
  const bg = theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900";
  const card = theme === "dark" 
    ? "bg-gray-900 text-white border-gray-700" 
    : "bg-gray-100 text-gray-900 border-gray-200";
  const inputBorder = theme === "dark" ? "border-gray-600" : "border-gray-400";

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`min-h-screen p-6 transition-all duration-500 ${bg}`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/dashboard/users')}
            className={`p-2 rounded-lg border ${
              theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-100"
            } transition-colors`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <motion.h1 
              className="text-2xl font-bold font-italiana"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Create Wholesaler
            </motion.h1>
            <motion.p 
              className={`opacity-70 font-instrument`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Add a new wholesaler business account
            </motion.p>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Basic Information */}
          <motion.div
            variants={itemVariants}
            className={`border rounded-xl p-6 ${card}`}
          >
            <motion.h2 
              className="text-xl font-semibold font-instrument mb-6 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <User className="mr-3 text-blue-600" size={24} />
              Basic Information
            </motion.h2>

            <div className="space-y-6">
              {/* Name */}
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <User className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter wholesaler's full name"
                  className={`w-full bg-transparent border-none outline-none ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

              {/* Email */}
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <Mail className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className={`w-full bg-transparent border-none outline-none ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

              {/* Phone */}
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <Phone className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className={`w-full bg-transparent border-none outline-none ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className={`flex items-center border-b pb-2 ${inputBorder} relative`}>
                    <Lock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className={`w-full bg-transparent border-none outline-none pr-8 ${
                        theme === "dark" 
                          ? "text-white placeholder-gray-500" 
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 text-gray-500 hover:text-blue-500 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <div className={`flex items-center border-b pb-2 ${inputBorder} relative`}>
                    <Lock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className={`w-full bg-transparent border-none outline-none pr-8 ${
                        theme === "dark" 
                          ? "text-white placeholder-gray-500" 
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 text-gray-500 hover:text-blue-500 transition"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Business Information */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.1 }}
            className={`border rounded-xl p-6 ${card}`}
          >
            <motion.h2 
              className="text-xl font-semibold font-instrument mb-6 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Store className="mr-3 text-blue-600" size={24} />
              Business Information
            </motion.h2>

            <div className="space-y-6">
              {/* Company Name - REQUIRED FOR ALL */}
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <Building className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                <input
                  type="text"
                  name="companyName"
                  value={wholesalerData.companyName}
                  onChange={handleWholesalerChange}
                  placeholder="Company Name *"
                  className={`w-full bg-transparent border-none outline-none ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}

              {/* Business Type */}
              <div>
                <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                  <Store className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                  <select
                    name="businessType"
                    value={wholesalerData.businessType}
                    onChange={handleWholesalerChange}
                    className={`w-full bg-transparent border-none outline-none ${
                      theme === "dark" 
                        ? "text-white bg-gray-800" 
                        : "text-gray-900 bg-white"
                    } py-2 px-1 rounded`}
                  >
                    <option value="" className={theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>
                      Select business type
                    </option>
                    {businessTypes.map(type => (
                      <option 
                        key={type} 
                        value={type}
                        className={theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}
                      >
                        {formatBusinessType(type)}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                    <MapPin className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                    <input
                      type="text"
                      name="city"
                      value={wholesalerData.city}
                      onChange={handleWholesalerChange}
                      placeholder="Enter city *"
                      className={`w-full bg-transparent border-none outline-none ${
                        theme === "dark" 
                          ? "text-white placeholder-gray-500" 
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                    <MapPin className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                    <input
                      type="text"
                      name="state"
                      value={wholesalerData.state}
                      onChange={handleWholesalerChange}
                      placeholder="Enter state *"
                      className={`w-full bg-transparent border-none outline-none ${
                        theme === "dark" 
                          ? "text-white placeholder-gray-500" 
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>

              {/* Conditional Fields */}

              {/* GST Field (GST Business) */}
              <AnimatePresence>
                {showGSTField() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center border-b pb-2 ${inputBorder}`}
                  >
                    <Building className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                    <input
                      type="text"
                      name="gstNumber"
                      value={wholesalerData.gstNumber}
                      onChange={handleWholesalerChange}
                      placeholder="GST Number * (15 characters)"
                      maxLength={15}
                      className={`w-full bg-transparent border-none outline-none ${
                        theme === "dark" 
                          ? "text-white placeholder-gray-500" 
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.gstNumber && <p className="text-red-500 text-sm mt-1">{errors.gstNumber}</p>}

              {/* Website Field (Website) */}
              <AnimatePresence>
                {showWebsiteField() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center border-b pb-2 ${inputBorder}`}
                  >
                    <Globe className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                    <input
                      type="url"
                      name="websiteUrl"
                      value={wholesalerData.websiteUrl}
                      onChange={handleWholesalerChange}
                      placeholder="Website URL *"
                      className={`w-full bg-transparent border-none outline-none ${
                        theme === "dark" 
                          ? "text-white placeholder-gray-500" 
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.websiteUrl && <p className="text-red-500 text-sm mt-1">{errors.websiteUrl}</p>}

              {/* Instagram Field (Instagram Page) */}
              <AnimatePresence>
                {showInstagramField() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center border-b pb-2 ${inputBorder}`}
                  >
                    <Instagram className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} size={18} />
                    <input
                      type="url"
                      name="instagramUrl"
                      value={wholesalerData.instagramUrl}
                      onChange={handleWholesalerChange}
                      placeholder="Instagram URL *"
                      className={`w-full bg-transparent border-none outline-none ${
                        theme === "dark" 
                          ? "text-white placeholder-gray-500" 
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.instagramUrl && <p className="text-red-500 text-sm mt-1">{errors.instagramUrl}</p>}

              {/* Shop Photos (Clothing Store) */}
              <AnimatePresence>
                {showShopPhotos() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <label className={`flex items-center font-instrument text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      <Camera className="mr-2" size={18} />
                      Shop Photos * (Max 5)
                    </label>
                    
                    {shopPhotoPreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {shopPhotoPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img src={preview} alt={`Shop ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeShopPhoto(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {shopPhotos.length < 5 && (
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        theme === "dark" 
                          ? "border-gray-600 hover:border-blue-500 bg-gray-800" 
                          : "border-gray-300 hover:border-blue-500 bg-gray-50"
                      } transition-colors`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleShopPhotosUpload}
                          className="hidden"
                          id="shop-photos"
                          multiple
                        />
                        <label htmlFor="shop-photos" className="cursor-pointer flex flex-col items-center">
                          <Upload className={`w-8 h-8 mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                          <p className="font-medium mb-1">Upload Shop Photos</p>
                          <p className="text-sm opacity-70">PNG, JPG, JPEG up to 5MB each</p>
                          <p className="text-xs mt-1 opacity-70">{5 - shopPhotos.length} photos remaining</p>
                        </label>
                      </div>
                    )}
                    {errors.shopPhotos && <p className="text-red-500 text-sm mt-1">{errors.shopPhotos}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Submit Section */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.2 }}
            className={`border rounded-xl p-6 ${card}`}
          >
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate('/dashboard/users')}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                variant="primary"
                className="min-w-[200px]"
              >
                Create Wholesaler
              </Button>
            </div>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default AddWholesaler;