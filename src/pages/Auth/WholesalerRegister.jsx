import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaInstagram,
  FaCamera,
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useRegisterMutation } from "../../redux/services/authService";
import TiruppurImage from "../../assets/categories/tshirt.webp";
import logowhite from "../../assets/images/TiruppurGarmentsLogo1(1).png";
import logo from "../../assets/images/TiruppurGarmentsLogoblack1.png";

const WholesalerRegister = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    // Common fields for all types
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    state: "",
    businessType: "",
    role: "WHOLESALER",
    
    // Type-specific fields
    companyName: "", // Clothing Store, Startup
    gstNumber: "", // GST Business
    websiteUrl: "", // Website
    instagramUrl: "", // Instagram
  });

  const [shopPhotos, setShopPhotos] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Determine which logo to use based on theme
  const currentLogo = theme === "dark" ? logowhite : logo;

  const businessTypes = [
    { value: "CLOTHING_STORE", label: "Clothing Store" },
    { value: "GST_BUSINESS", label: "GST Business" },
    { value: "WEBSITE", label: "Website" },
    { value: "INSTAGRAM_PAGE", label: "Instagram Page" },
    { value: "STARTUP", label: "Startup" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (error) setError("");
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + shopPhotos.length > 5) {
      setError("Maximum 5 photos allowed");
      return;
    }
    
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setShopPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setShopPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  // Helper functions to determine which fields to show
  const showCompanyName = () => {
    return formData.businessType && ["CLOTHING_STORE", "STARTUP"].includes(formData.businessType);
  };

  const showGSTField = () => {
    return formData.businessType === "GST_BUSINESS";
  };

  const showWebsiteField = () => {
    return formData.businessType === "WEBSITE";
  };

  const showInstagramField = () => {
    return formData.businessType === "INSTAGRAM_PAGE";
  };

  const showShopPhotos = () => {
    return formData.businessType === "CLOTHING_STORE";
  };

  const validateForm = () => {
    // Common validations
    if (!formData.name.trim()) {
      setError("Name is required!");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required!");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return false;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required!");
      return false;
    }

    if (!formData.city.trim()) {
      setError("City is required!");
      return false;
    }

    if (!formData.state.trim()) {
      setError("State is required!");
      return false;
    }

    if (!formData.businessType) {
      setError("Please select business type!");
      return false;
    }

    // Type-specific validations
    if (showCompanyName() && !formData.companyName.trim()) {
      setError("Company/Shop name is required!");
      return false;
    }

    if (showGSTField() && (!formData.gstNumber.trim() || formData.gstNumber.length !== 15)) {
      setError("GST Number must be 15 characters long!");
      return false;
    }

    if (showWebsiteField() && !formData.websiteUrl.trim()) {
      setError("Website URL is required!");
      return false;
    }

    if (showInstagramField() && !formData.instagramUrl.trim()) {
      setError("Instagram URL is required!");
      return false;
    }

    if (showShopPhotos() && shopPhotos.length === 0) {
      setError("Please upload at least one shop photo!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append all fields directly (not nested in wholesalerProfile)
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('phone', formData.phone);
      submitData.append('role', formData.role);
      submitData.append('businessType', formData.businessType);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      
      // Append type-specific fields directly
      if (showCompanyName()) {
        submitData.append('companyName', formData.companyName);
      }
      
      if (showGSTField()) {
        submitData.append('gstNumber', formData.gstNumber);
      }
      
      if (showWebsiteField()) {
        submitData.append('websiteUrl', formData.websiteUrl);
      }
      
      if (showInstagramField()) {
        submitData.append('instagramUrl', formData.instagramUrl);
      }
      
      // Append shop photos only for clothing stores
      if (showShopPhotos()) {
        shopPhotos.forEach((photo, index) => {
          submitData.append('shopPhotos', photo.file);
        });
      }

      const result = await register(submitData).unwrap();
      
      if (result?.success) {
        setSuccess("Registration successful! Awaiting admin approval.");
        setTimeout(() => navigate("/wholesaler/login"), 3000);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  // Theme-based styles
  const bg = theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900";
  const card = theme === "dark" 
    ? "bg-gray-900 text-white border-gray-700" 
    : "bg-gray-100 text-gray-900 border-gray-200";
  const inputBorder = theme === "dark" ? "border-gray-600" : "border-gray-400";

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

  const slideInVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex min-h-screen transition-all duration-500 ${bg}`}
    >
      {/* Left side - Brand Section with Background Image */}
      <motion.div 
        variants={slideInVariants}
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url(${TiruppurImage})`
        }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"
        />
        
        <motion.div 
          variants={itemVariants}
          className="text-center max-w-md z-10 relative"
        >
          {/* Logo */}
          <motion.div 
            className="mb-6 flex justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <img 
              src={currentLogo} 
              alt="Tiruppur Garments Logo" 
              className="h-20 w-auto object-contain"
            />
          </motion.div>
          
          <motion.div 
            className="mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h1 className="text-5xl font-italiana font-bold text-white mb-4 leading-tight">
              Tiruppur<br />Garments
            </h1>
            <motion.p 
              className="text-xl text-gray-300 font-bai-jamjuree mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              Wholesale Partner Program
            </motion.p>
          </motion.div>
          <motion.div 
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6 shadow-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <motion.h2 
              className="text-2xl font-semibold mb-4 text-white flex items-center justify-center gap-3 font-bai-jamjuree"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaBuilding className="w-7 h-7" />
              Become a Wholesaler
            </motion.h2>
            <p className="text-gray-300 leading-relaxed text-lg font-instrument">
              Join our network of trusted wholesale partners. Get access to exclusive pricing, bulk orders, and premium collections.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div 
          variants={itemVariants}
          className={`relative w-full max-w-2xl rounded-2xl shadow-lg p-8 border ${card}`}
        >
          {/* Header Icon */}
          <motion.div 
            className="mb-6 flex justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <img 
              src={currentLogo} 
              alt="Tiruppur Garments Logo" 
              className="h-20 w-auto object-contain"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-lg tracking-widest font-italiana font-semibold mb-8 text-center ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            WHOLESALER REGISTRATION
          </motion.h2>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm overflow-hidden text-center font-instrument"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6 text-sm overflow-hidden text-center font-instrument"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-6"
            encType="multipart/form-data"
          >
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <FaUser className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Phone Number */}
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <FaPhone className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
              <FaEnvelope className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full bg-transparent border-none outline-none font-instrument ${
                  theme === "dark" 
                    ? "text-white placeholder-gray-500" 
                    : "text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`flex items-center border-b pb-2 ${inputBorder} relative`}>
                <FaLock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none pr-8 font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-gray-500 hover:text-purple-500 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className={`flex items-center border-b pb-2 ${inputBorder} relative`}>
                <FaLock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none pr-8 font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 text-gray-500 hover:text-purple-500 transition"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <FaMapMarkerAlt className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* State */}
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <FaMapMarkerAlt className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Business Type */}
            <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
              <FaBuilding className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                className={`w-full bg-transparent border-none outline-none font-instrument ${
                  theme === "dark" 
                    ? "text-white bg-gray-800" 
                    : "text-gray-900 bg-white"
                } py-2 px-1 rounded`}
              >
                <option value="" className={theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>
                  Select Business Type
                </option>
                {businessTypes.map(type => (
                  <option 
                    key={type.value} 
                    value={type.value}
                    className={theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type-specific Fields */}

            {/* Company/Shop Name (Clothing Store, Startup) */}
            {showCompanyName() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`flex items-center border-b pb-2 ${inputBorder}`}
              >
                <FaBuilding className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="text"
                  name="companyName"
                  placeholder={formData.businessType === "CLOTHING_STORE" ? "Shop Name" : "Company Name"}
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </motion.div>
            )}

            {/* GST Field (GST Business) */}
            {showGSTField() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`flex items-center border-b pb-2 ${inputBorder}`}
              >
                <FaBuilding className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="GST Number (15 characters)"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  maxLength={15}
                  required
                  className={`w-full bg-transparent border-none outline-none font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                    }`}
                />
              </motion.div>
            )}

            {/* Website Field (Website) */}
            {showWebsiteField() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`flex items-center border-b pb-2 ${inputBorder}`}
              >
                <FaGlobe className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="url"
                  name="websiteUrl"
                  placeholder="Website URL"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </motion.div>
            )}

            {/* Instagram Field (Instagram Page) */}
            {showInstagramField() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`flex items-center border-b pb-2 ${inputBorder}`}
              >
                <FaInstagram className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="url"
                  name="instagramUrl"
                  placeholder="Instagram URL"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-none outline-none font-instrument ${
                    theme === "dark" 
                      ? "text-white placeholder-gray-500" 
                      : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </motion.div>
            )}

            {/* Shop Photos (Clothing Store) */}
            {showShopPhotos() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <label className={`flex items-center font-instrument text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  <FaCamera className="mr-2" />
                  Shop Photos (Max 5)
                </label>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-sm font-instrument"
                />
                
                {shopPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {shopPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo.preview}
                          alt={`Shop ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className={`w-full mt-6 py-3 rounded-md font-instrument tracking-widest font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                theme === "dark"
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" /> Registering...
                </>
              ) : (
                "REGISTER AS WHOLESALER"
              )}
            </motion.button>
          </motion.form>

          {/* Links Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 space-y-4 text-center"
          >
            <motion.p
              className="tracking-wider text-sm font-instrument"
            >
              Already have an account?{" "}
              <Link
                to="/wholesaler/login"
                className={`cursor-pointer font-semibold font-instrument ${
                  theme === "dark"
                    ? "text-purple-400 hover:text-purple-300"
                    : "text-purple-600 hover:text-purple-800"
                }`}
              >
                Login here
              </Link>
            </motion.p>

            <motion.div
              className="space-y-2"
            >
              <Link 
                to="/register" 
                className={`block text-sm font-instrument ${
                  theme === "dark" 
                    ? "text-gray-400 hover:text-gray-300" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Register as Customer
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WholesalerRegister;