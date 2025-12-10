import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useAdminForgotPasswordMutation } from "../../redux/services/authService";
import { FaEnvelope, FaSpinner, FaArrowLeft, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import hangerImage from "../../assets/categories/tshirt.webp";

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [adminForgotPassword, { isLoading, isSuccess }] = useAdminForgotPasswordMutation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // FIX: Send email as string instead of object
      await adminForgotPassword(email).unwrap();
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(
        err.data?.message || 
        "Failed to send reset instructions. Please try again."
      );
    }
  };

  const handleBackToLogin = () => {
    navigate("/admin/login");
  };

  const handleReturnToCustomerPortal = () => {
    navigate("/");
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
              Admin Password Recovery
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
              <FaShieldAlt className="w-7 h-7" />
              Admin Portal
            </motion.h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              Enter your admin email to receive secure password reset instructions.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right side - Forgot Password Form */}
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
              Admin Password Recovery
            </h2>
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Enter your admin email to receive password reset instructions.
            </p>
          </motion.div>

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-4 rounded-lg mb-6 text-center"
            >
              <FaCheckCircle className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Reset Email Sent!</p>
              <p className="text-sm mt-1">
                Check your email for password reset instructions.
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && !isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Forgot Password Form */}
          {!isSuccess && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
                <FaEnvelope className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                <input
                  type="email"
                  placeholder="Enter admin email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  className={`w-full bg-transparent border-none outline-none ${
                    theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                  }`}
                />
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
                    <FaSpinner className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="w-4 h-4" />
                    Send Reset Instructions
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Additional Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center space-y-4"
          >
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Remember your password?{" "}
              <button
                onClick={handleBackToLogin}
                className={`font-semibold ${
                  theme === "dark"
                    ? "text-red-400 hover:text-red-300"
                    : "text-red-600 hover:text-red-800"
                }`}
              >
                Back to Admin Login
              </button>
            </p>

            <div className="pt-4 border-t border-gray-600">
              <button 
                onClick={handleReturnToCustomerPortal}
                className={`text-sm ${
                  theme === "dark" 
                    ? "text-gray-400 hover:text-gray-300" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Return to Customer Portal
              </button>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <p className={`text-sm text-center ${
              theme === "dark" ? "text-yellow-300" : "text-yellow-700"
            }`}>
              🔒 This reset link will expire in 1 hour for security
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminForgotPassword;