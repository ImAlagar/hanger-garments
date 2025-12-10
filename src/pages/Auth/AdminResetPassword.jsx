import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { 
  useAdminResetPasswordMutation, 
  useValidateAdminResetTokenQuery 
} from "../../redux/services/authService";
import { 
  FaLock, 
  FaSpinner, 
  FaArrowLeft, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUser,
  FaShieldAlt
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import hangerImage from "../../assets/categories/tshirt.webp";

const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  
  const [adminResetPassword, { isLoading, isSuccess }] = useAdminResetPasswordMutation();
  
  const token = searchParams.get('token');
  const adminId = searchParams.get('adminId');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecking, setTokenChecking] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  // Validate reset token
  const { data: tokenValidation, error: tokenError } = useValidateAdminResetTokenQuery(
    { token, adminId },
    { skip: !token || !adminId }
  );

  useEffect(() => {
    if (tokenValidation) {
      setTokenValid(true);
      setTokenChecking(false);
      setAdminInfo(tokenValidation.admin);
    } else if (tokenError) {
      setTokenValid(false);
      setTokenChecking(false);
      setApiError("Invalid or expired reset link. Please request a new one.");
    }
  }, [tokenValidation, tokenError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!token || !adminId) {
      setApiError("Invalid reset link. Please request a new password reset.");
      return;
    }

    try {
      await adminResetPassword({
        token,
        adminId,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      }).unwrap();
    } catch (err) {
      console.error('Reset password error:', err);
      setApiError(
        err.data?.message || 
        "Failed to reset password. The link may have expired."
      );
    }
  };

  const handleBackToLogin = () => {
    navigate("/admin/login");
  };

  const handleRequestNewLink = () => {
    navigate("/admin/forgot-password");
  };

  // Theme-based styles
  const bg = theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900";
  const card = theme === "dark" 
    ? "bg-gray-900 text-white border-gray-700" 
    : "bg-gray-100 text-gray-900 border-gray-200";
  const inputBorder = theme === "dark" ? "border-gray-600" : "border-gray-400";
  const warningBg = theme === "dark" ? "bg-yellow-500/20 border-yellow-500 text-yellow-300" : "bg-yellow-100 border-yellow-400 text-yellow-800";
  const successBg = theme === "dark" ? "bg-green-500/20 border-green-500 text-green-300" : "bg-green-100 border-green-400 text-green-800";

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

  if (tokenChecking) {
    return (
      <div className={`flex min-h-screen transition-all duration-500 ${bg}`}>
        <div className="w-full flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-2xl mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Validating reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          backgroundImage: `url(${hangerImage})`
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
          <motion.div 
            className="mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h1 className="text-5xl font-Italiana font-bold text-white mb-4 leading-tight">
              Hanger<br />Garments
            </h1>
            <motion.p 
              className="text-xl text-gray-300 font-SpaceGrotesk mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              Admin Password Reset
            </motion.p>
          </motion.div>
          <motion.div 
            className=" backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6 shadow-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <motion.h2 
              className="text-2xl font-semibold mb-4 text-white flex items-center justify-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaShieldAlt className="w-7 h-7" />
              Secure Admin Reset
            </motion.h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              Create a new strong password to secure your admin account.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div 
          variants={itemVariants}
          className={`relative w-full max-w-md rounded-2xl shadow-lg p-10 border ${card}`}
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <button
              onClick={handleBackToLogin}
              className={`inline-flex items-center gap-2 text-sm ${
                theme === "dark" 
                  ? "text-red-400 hover:text-red-300" 
                  : "text-red-600 hover:text-red-800"
              } transition-colors`}
            >
              <FaArrowLeft /> Back to Admin Login
            </button>
          </motion.div>

          {/* Invalid Token State */}
          {!tokenValid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className={`text-xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Invalid Reset Link
              </h2>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {apiError || "This password reset link is invalid or has expired."}
              </p>
              <button
                onClick={handleRequestNewLink}
                className={`w-full py-3 rounded-md font-medium ${
                  theme === "dark" 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Request New Reset Link
              </button>
            </motion.div>
          )}

          {/* Success State */}
          {isSuccess && tokenValid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className={`text-xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Password Reset Successful!
              </h2>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Your admin password has been successfully reset.
              </p>
              <button
                onClick={handleBackToLogin}
                className={`w-full py-3 rounded-md font-medium ${
                  theme === "dark" 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                PROCEED TO ADMIN LOGIN
              </button>
            </motion.div>
          )}

          {/* Reset Form */}
          {tokenValid && !isSuccess && (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h2 className={`text-2xl font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  Set New Admin Password
                </h2>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Enter your new password below
                </p>
              </motion.div>

              {/* Admin Info */}
              {adminInfo && (
                <div className={`${successBg} p-3 rounded-lg text-center mb-6`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaUser className="text-sm" />
                    <span className="font-semibold">Admin Account</span>
                  </div>
                  <p className="text-sm opacity-80">{adminInfo.email}</p>
                </div>
              )}

              {/* Error Message */}
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className=" border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center"
                >
                  <FaExclamationTriangle className="inline mr-2" />
                  {apiError}
                </motion.div>
              )}

              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* New Password Input */}
                <div>
                  <label className={`text-sm font-medium mb-2 block ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    New Password
                  </label>
                  <div className={`flex items-center border rounded-lg px-3 py-2 ${inputBorder}`}>
                    <FaLock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={`w-full bg-transparent border-none outline-none pr-8 ${
                        theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-red-500 transition"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className={`text-sm font-medium mb-2 block ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Confirm New Password
                  </label>
                  <div className={`flex items-center border rounded-lg px-3 py-2 ${inputBorder}`}>
                    <FaLock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full bg-transparent border-none outline-none pr-8 ${
                        theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-500 hover:text-red-500 transition"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className={`text-xs p-3 rounded-lg ${
                  theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-200 text-gray-600"
                }`}>
                  <p className="font-semibold mb-1">Password must contain:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                  </ul>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    theme === "dark"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Resetting...
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="w-4 h-4" />
                      Reset Password
                    </>
                  )}
                </motion.button>
              </motion.form>
            </>
          )}

          {/* Security Notice */}
          {tokenValid && !isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4  border border-yellow-500/30 rounded-lg"
            >
              <p className={`text-sm text-center ${
                theme === "dark" ? "text-yellow-300" : "text-yellow-700"
              }`}>
                🔒 Secure admin password reset
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminResetPassword;