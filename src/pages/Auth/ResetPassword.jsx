// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaSpinner, FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle, FaUser } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useResetPasswordMutation } from "../../redux/services/authService";
import hangerImage from "../../assets/categories/tshirt.webp";

const ResetPassword = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resetPassword, { isLoading, error, isSuccess }] = useResetPasswordMutation();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  // Validate reset token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !userId) {
        setIsValidating(false);
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5000/api'}/auth/validate-reset-token?token=${token}&userId=${userId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.user);
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setErrorMessage('Invalid or expired reset link. Please request a new one.');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
        setErrorMessage('Failed to validate reset link. Please try again.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (!token || !userId) {
      setErrorMessage('Invalid reset parameters');
      return;
    }

    const payload = {
      token,
      userId,
      password: formData.password
    };

    try {
      await resetPassword(payload).unwrap();
    } catch (err) {
      console.error('Reset password failed:', err);
      if ('data' in err) {
        setErrorMessage(err.data.message || 'Failed to reset password');
      } else {
        setErrorMessage('Failed to reset password. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
              Set New Password
            </motion.p>
          </motion.div>
          <motion.div 
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6 shadow-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <motion.h2 
              className="text-2xl font-semibold mb-4 text-white flex items-center justify-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaLock className="w-7 h-7" />
              Secure Reset
            </motion.h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              Create a new strong password to secure your account.
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
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 text-sm ${
                theme === "dark" 
                  ? "text-purple-400 hover:text-purple-300" 
                  : "text-purple-600 hover:text-purple-800"
              } transition-colors`}
            >
              <FaArrowLeft /> Back to Login
            </Link>
          </motion.div>

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
              Reset Password
            </h2>
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Enter your new password below.
            </p>
          </motion.div>

          {/* Loading State */}
          {isValidating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <FaSpinner className="animate-spin mx-auto text-2xl mb-4" />
              <p>Verifying reset link...</p>
            </motion.div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${successBg} px-4 py-4 rounded-lg mb-6 text-center`}
            >
              <FaCheckCircle className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Password Reset Successful!</p>
              <p className="text-sm mt-1">
                Your password has been updated successfully.
              </p>
              <button
                onClick={() => navigate('/login')}
                className={`mt-4 w-full py-2 rounded-md font-medium ${
                  theme === "dark"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                Go to Login
              </button>
            </motion.div>
          )}

          {/* Error Message */}
          {errorMessage && !isValidating && !isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center"
            >
              <FaExclamationTriangle className="inline mr-2" />
              {errorMessage}
            </motion.div>
          )}

          {/* Invalid Token Message */}
          {!isValidating && !isTokenValid && !isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-center"
            >
              <FaExclamationTriangle className="inline mr-2" />
              <p className="font-semibold">Invalid Reset Link</p>
              <p className="text-sm mt-1">
                This reset link is invalid or has expired.
              </p>
              <Link
                to="/forgot-password"
                className={`inline-block mt-3 px-4 py-2 rounded text-sm font-semibold ${
                  theme === "dark"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                Request New Reset Link
              </Link>
            </motion.div>
          )}

          {/* Reset Password Form */}
          {!isValidating && isTokenValid && !isSuccess && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* User Info */}
              {userInfo && (
                <div className={`${successBg} p-3 rounded-lg text-center`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaUser className="text-sm" />
                    <span className="font-semibold">{userInfo.name}</span>
                  </div>
                  <p className="text-sm opacity-80">{userInfo.email}</p>
                </div>
              )}

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
                    placeholder="Enter new password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className={`w-full bg-transparent border-none outline-none pr-8 ${
                      theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-purple-500 transition"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
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
                    minLength="6"
                    className={`w-full bg-transparent border-none outline-none pr-8 ${
                      theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-purple-500 transition"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  theme === "dark"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Additional Links */}
          {!isSuccess && !isValidating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center space-y-3"
            >
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Need a new reset link?{" "}
                <Link
                  to="/forgot-password"
                  className={`font-semibold ${
                    theme === "dark"
                      ? "text-purple-400 hover:text-purple-300"
                      : "text-purple-600 hover:text-purple-800"
                  }`}
                >
                  Request new reset link
                </Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;