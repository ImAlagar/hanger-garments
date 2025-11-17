// components/admin/users/EditUser.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import { 
  useGetUserByIdQuery, 
  useUpdateProfileMutation,
  useUpdateWholesalerProfileMutation 
} from '../../../../redux/services/userService';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X, View, Mail, Phone, MapPin, Store, User, Shield } from 'lucide-react';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(userId);
  const [updateProfile] = useUpdateProfileMutation();
  const [updateWholesalerProfile] = useUpdateWholesalerProfileMutation();

  const user = userData?.data;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
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
  const [existingShopPhotos, setExistingShopPhotos] = useState([]);

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

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
      });

      if (user.wholesalerProfile) {
        setWholesalerData({
          companyName: user.wholesalerProfile.companyName || '',
          businessType: user.wholesalerProfile.businessType || '',
          gstNumber: user.wholesalerProfile.gstNumber || '',
          websiteUrl: user.wholesalerProfile.websiteUrl || '',
          instagramUrl: user.wholesalerProfile.instagramUrl || '',
          city: user.wholesalerProfile.city || '',
          state: user.wholesalerProfile.state || '',
        });
        setExistingShopPhotos(user.wholesalerProfile.shopPhotos || []);
      }
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle wholesaler input changes
  const handleWholesalerChange = (e) => {
    const { name, value } = e.target;
    setWholesalerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle shop photos upload
  const handleShopPhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select valid image files');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return false;
      }
      return true;
    });

    // Check total photos limit (max 5)
    if (shopPhotos.length + validFiles.length + existingShopPhotos.length > 5) {
      toast.error('Maximum 5 shop photos allowed');
      return;
    }

    setShopPhotos(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setShopPhotoPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove shop photo
  const removeShopPhoto = (index) => {
    setShopPhotos(prev => prev.filter((_, i) => i !== index));
    setShopPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing shop photo
  const removeExistingShopPhoto = (photoUrl) => {
    setExistingShopPhotos(prev => prev.filter(photo => photo !== photoUrl));
  };

  // Business type options
  const businessTypes = [
    'CLOTHING_STORE',
    'BOUTIQUE',
    'FASHION_RETAILER',
    'WHOLESALE_DISTRIBUTOR',
    'ONLINE_STORE',
    'DEPARTMENT_STORE',
    'OTHER'
  ];

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('User name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (user.role === 'WHOLESALER') {
      if (!wholesalerData.companyName.trim()) {
        toast.error('Company name is required for wholesalers');
        return false;
      }
      if (!wholesalerData.businessType) {
        toast.error('Business type is required for wholesalers');
        return false;
      }
      if (!wholesalerData.city.trim()) {
        toast.error('City is required for wholesalers');
        return false;
      }
      if (!wholesalerData.state.trim()) {
        toast.error('State is required for wholesalers');
        return false;
      }
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
      // Update basic profile
      const profileData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      await updateProfile({
        userId,
        profileData
      }).unwrap();

      // Update wholesaler profile if user is a wholesaler
      if (user.role === 'WHOLESALER') {
        const wholesalerProfileData = {
          ...wholesalerData
        };

        // Only include shop photos if new ones are added
        if (shopPhotos.length > 0) {
          wholesalerProfileData.shopPhotos = shopPhotos;
        }

        await updateWholesalerProfile({
          userId,
          profileData: wholesalerProfileData
        }).unwrap();
      }

      toast.success('User profile updated successfully!');
      navigate('/dashboard/users');
    } catch (error) {
      console.error('Update user error:', error);
      toast.error(error?.data?.message || 'Failed to update user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">User Not Found</h2>
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
                  <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => navigate(-1)}
                          className={`p-2 rounded-lg ${currentTheme.bg.secondary} ${currentTheme.text.primary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h1 className="text-2xl font-bold font-italiana">{user.name}</h1>
                          <p className={`${currentTheme.text.muted} font-instrument`}>
                            Edit user profile
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link
                          to={`/dashboard/users/view/${user.id}`}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      Basic Information
                    </motion.h2>

                    <div className="space-y-6">
                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Full Name *"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter user's full name"
                          icon={<User size={18} />}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Email Address *"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter email address"
                          icon={<Mail size={18} />}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <InputField
                          label="Phone Number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                          icon={<Phone size={18} />}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                          User Role
                        </label>
                        <div className={`px-3 py-2 border rounded-lg ${currentTheme.border} ${currentTheme.bg.card}`}>
                          <div className="flex items-center space-x-2">
                            {user.role === 'ADMIN' && <Shield className="w-4 h-4 text-red-500" />}
                            {user.role === 'WHOLESALER' && <Store className="w-4 h-4 text-purple-500" />}
                            {user.role === 'CUSTOMER' && <User className="w-4 h-4 text-blue-500" />}
                            <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
                          </div>
                          <p className={`text-sm mt-1 ${currentTheme.text.muted}`}>
                            Role changes must be done from the users management page
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.section>

                  {/* Wholesaler Information */}
                  {user.role === 'WHOLESALER' && (
                    <motion.section
                      variants={containerVariants}
                      className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                    >
                      <motion.h2 
                        variants={itemVariants}
                        className="text-xl font-semibold font-instrument mb-6 flex items-center"
                      >
                        <span className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                        Wholesaler Information
                      </motion.h2>

                      <div className="space-y-6">
                        <motion.div variants={itemVariants}>
                          <InputField
                            label="Company Name *"
                            name="companyName"
                            value={wholesalerData.companyName}
                            onChange={handleWholesalerChange}
                            required
                            placeholder="Enter company name"
                            icon={<Store size={18} />}
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
                            Business Type *
                          </label>
                          <select
                            name="businessType"
                            value={wholesalerData.businessType}
                            onChange={handleWholesalerChange}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.border} ${currentTheme.bg.card} ${currentTheme.text.primary}`}
                          >
                            <option value="">Select business type</option>
                            {businessTypes.map((type) => (
                              <option key={type} value={type}>
                                {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                              </option>
                            ))}
                          </select>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div variants={itemVariants}>
                            <InputField
                              label="City *"
                              name="city"
                              value={wholesalerData.city}
                              onChange={handleWholesalerChange}
                              required
                              placeholder="Enter city"
                              icon={<MapPin size={18} />}
                            />
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <InputField
                              label="State *"
                              name="state"
                              value={wholesalerData.state}
                              onChange={handleWholesalerChange}
                              required
                              placeholder="Enter state"
                              icon={<MapPin size={18} />}
                            />
                          </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div variants={itemVariants}>
                            <InputField
                              label="GST Number"
                              name="gstNumber"
                              value={wholesalerData.gstNumber}
                              onChange={handleWholesalerChange}
                              placeholder="Enter GST number"
                            />
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <InputField
                              label="Website URL"
                              name="websiteUrl"
                              value={wholesalerData.websiteUrl}
                              onChange={handleWholesalerChange}
                              placeholder="https://example.com"
                            />
                          </motion.div>
                        </div>

                        <motion.div variants={itemVariants}>
                          <InputField
                            label="Instagram URL"
                            name="instagramUrl"
                            value={wholesalerData.instagramUrl}
                            onChange={handleWholesalerChange}
                            placeholder="https://instagram.com/username"
                          />
                        </motion.div>

                        {/* Shop Photos */}
                        <motion.div variants={itemVariants}>
                          <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-4`}>
                            Shop Photos
                          </label>
                          <p className={`text-sm ${currentTheme.text.muted} mb-4`}>
                            Upload photos of your shop or business premises. Maximum 5 photos allowed.
                          </p>
                          
                          {/* Existing Photos */}
                          {existingShopPhotos.length > 0 && (
                            <div className="mb-6">
                              <h4 className={`text-sm font-medium mb-3 ${currentTheme.text.secondary}`}>Current Photos</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {existingShopPhotos.map((photo, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={photo}
                                      alt={`Shop photo ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeExistingShopPhoto(photo)}
                                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New Photos */}
                          {(shopPhotoPreviews.length > 0 || existingShopPhotos.length < 5) && (
                            <div>
                              <h4 className={`text-sm font-medium mb-3 ${currentTheme.text.secondary}`}>
                                {shopPhotoPreviews.length > 0 ? 'New Photos' : 'Add Photos'}
                              </h4>
                              
                              {shopPhotoPreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                  {shopPhotoPreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={preview}
                                        alt={`New shop photo ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeShopPhoto(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {shopPhotos.length + existingShopPhotos.length < 5 && (
                                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                  currentTheme.border
                                } hover:border-blue-500`}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleShopPhotosUpload}
                                    className="hidden"
                                    id="shop-photos"
                                    multiple
                                  />
                                  <label
                                    htmlFor="shop-photos"
                                    className="cursor-pointer flex flex-col items-center"
                                  >
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className={`font-medium ${currentTheme.text.primary} mb-1`}>
                                      Click to upload shop photos
                                    </p>
                                    <p className={`text-sm ${currentTheme.text.muted}`}>
                                      PNG, JPG, JPEG up to 5MB each
                                    </p>
                                    <p className={`text-xs mt-1 ${currentTheme.text.muted}`}>
                                      {5 - (shopPhotos.length + existingShopPhotos.length)} photos remaining
                                    </p>
                                  </label>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </motion.section>
                  )}

                  {/* Submit Section */}
                  <motion.section
                    variants={containerVariants}
                    className={`border rounded-xl p-6 ${currentTheme.bg.card} ${currentTheme.border} ${currentTheme.shadow}`}
                  >
                    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-5 justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold font-instrument">Update User Profile</h3>
                        <p className={currentTheme.text.muted}>
                          Save changes to this user's profile
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
                          Update Profile
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

export default EditUser;