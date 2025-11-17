import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Mail, Phone, User, Lock, Store, MapPin, Upload, X } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useCreateUserMutation } from '../../../../redux/services/userService';
import InputField from '../../../../components/Common/InputField';
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

  const themeClasses = {
    light: { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
    dark: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  const businessTypes = [
    'CLOTHING_STORE',
    'GST_BUSINESS', 
    'WEBSITE',
    'INSTAGRAM_PAGE',
    'STARTUP'
  ];

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
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    // Wholesaler validation
    if (!wholesalerData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!wholesalerData.businessType) newErrors.businessType = 'Business type is required';
    if (!wholesalerData.city.trim()) newErrors.city = 'City is required';
    if (!wholesalerData.state.trim()) newErrors.state = 'State is required';

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
      const userData = new FormData();
      
      // Basic user data
      userData.append('name', formData.name.trim());
      userData.append('email', formData.email.trim());
      userData.append('password', formData.password);
      userData.append('role', 'WHOLESALER');
      if (formData.phone.trim()) userData.append('phone', formData.phone.trim());

      // Wholesaler data
      userData.append('companyName', wholesalerData.companyName.trim());
      userData.append('businessType', wholesalerData.businessType);
      userData.append('city', wholesalerData.city.trim());
      userData.append('state', wholesalerData.state.trim());
      if (wholesalerData.gstNumber.trim()) userData.append('gstNumber', wholesalerData.gstNumber.trim());
      if (wholesalerData.websiteUrl.trim()) userData.append('websiteUrl', wholesalerData.websiteUrl.trim());
      if (wholesalerData.instagramUrl.trim()) userData.append('instagramUrl', wholesalerData.instagramUrl.trim());

      // Shop photos
      shopPhotos.forEach(photo => {
        userData.append('shopPhotos', photo);
      });

      await createUser(userData).unwrap();
      
      toast.success('Wholesaler created successfully!');
      navigate('/dashboard/users');
    } catch (error) {
      console.error('Create wholesaler error:', error);
      toast.error(error.data?.message || 'Failed to create wholesaler');
    }
  };

  const formatBusinessType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/users/add')}
            className={`p-2 rounded-lg ${currentTheme.border} hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-italiana">Create Wholesaler</h1>
            <p className={`opacity-70 font-instrument`}>Add a new wholesaler business account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-6 ${currentTheme.bg} ${currentTheme.border}`}
            >
              <h2 className="text-xl font-semibold font-instrument mb-6 flex items-center">
                <Store className="mr-3 text-blue-600" size={24} />
                Basic Information
              </h2>

              <div className="space-y-6">
                <InputField
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter wholesaler's full name"
                  icon={<User size={18} />}
                  error={errors.name}
                />

                <InputField
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  icon={<Mail size={18} />}
                  error={errors.email}
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  icon={<Phone size={18} />}
                  error={errors.phone}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Password *"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    icon={<Lock size={18} />}
                    error={errors.password}
                  />

                  <InputField
                    label="Confirm Password *"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    icon={<Lock size={18} />}
                    error={errors.confirmPassword}
                  />
                </div>
              </div>
            </motion.div>

            {/* Business Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`border rounded-xl p-6 ${currentTheme.bg} ${currentTheme.border}`}
            >
              <h2 className="text-xl font-semibold font-instrument mb-6 flex items-center">
                <Store className="mr-3 text-blue-600" size={24} />
                Business Information
              </h2>

              <div className="space-y-6">
                <InputField
                  label="Company Name *"
                  name="companyName"
                  value={wholesalerData.companyName}
                  onChange={handleWholesalerChange}
                  placeholder="Enter company name"
                  icon={<Store size={18} />}
                  error={errors.companyName}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Business Type *</label>
                  <select
                    name="businessType"
                    value={wholesalerData.businessType}
                    onChange={handleWholesalerChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.businessType ? 'border-red-500' : currentTheme.border
                    } ${currentTheme.bg} ${currentTheme.text}`}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{formatBusinessType(type)}</option>
                    ))}
                  </select>
                  {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="City *"
                    name="city"
                    value={wholesalerData.city}
                    onChange={handleWholesalerChange}
                    placeholder="Enter city"
                    icon={<MapPin size={18} />}
                    error={errors.city}
                  />

                  <InputField
                    label="State *"
                    name="state"
                    value={wholesalerData.state}
                    onChange={handleWholesalerChange}
                    placeholder="Enter state"
                    icon={<MapPin size={18} />}
                    error={errors.state}
                  />
                </div>

                <InputField
                  label="GST Number"
                  name="gstNumber"
                  value={wholesalerData.gstNumber}
                  onChange={handleWholesalerChange}
                  placeholder="Enter GST number (optional)"
                  error={errors.gstNumber}
                />

                <InputField
                  label="Website URL"
                  name="websiteUrl"
                  value={wholesalerData.websiteUrl}
                  onChange={handleWholesalerChange}
                  placeholder="https://example.com (optional)"
                  error={errors.websiteUrl}
                />

                <InputField
                  label="Instagram URL"
                  name="instagramUrl"
                  value={wholesalerData.instagramUrl}
                  onChange={handleWholesalerChange}
                  placeholder="https://instagram.com/username (optional)"
                  error={errors.instagramUrl}
                />

                {/* Shop Photos */}
                <div>
                  <label className="block text-sm font-medium mb-4">Shop Photos (Optional)</label>
                  
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
                      errors.shopPhotos ? 'border-red-500 bg-red-50' : `${currentTheme.border} hover:border-blue-500`
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleShopPhotosUpload}
                        className="hidden"
                        id="shop-photos"
                        multiple
                      />
                      <label htmlFor="shop-photos" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-medium mb-1">Upload Shop Photos</p>
                        <p className="text-sm opacity-70">PNG, JPG, JPEG up to 5MB each</p>
                        <p className="text-xs mt-1 opacity-70">{5 - shopPhotos.length} photos remaining</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Submit Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`border rounded-xl p-6 ${currentTheme.bg} ${currentTheme.border}`}
            >
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => navigate('/dashboard/users/create')}
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWholesaler;