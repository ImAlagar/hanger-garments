import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserCircle,
  FaEnvelope,
  FaLock,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useDispatch } from "react-redux";
import { useLoginMutation, useForgotPasswordMutation } from "../../redux/services/authService";
import { setCredentials } from "../../redux/slices/authSlice";
import hangerImage from "../../assets/categories/tshirt.webp";

const UserLogin = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use RTK Query mutations
  const [login, { isLoading, error }] = useLoginMutation();
  const [forgotPassword, { isLoading: isForgotPasswordLoading, error: forgotPasswordError }] = useForgotPasswordMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'USER'
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (error) {
      // Handle RTK Query error
      if ('data' in error) {
        setLoginError(error.data.message || 'Login failed');
      } else {
        setLoginError('Login failed. Please try again.');
      }
    }
  }, [error]);

  useEffect(() => {
    if (forgotPasswordError) {
      if ('data' in forgotPasswordError) {
        setForgotPasswordMessage(forgotPasswordError.data.message || 'Failed to send reset email');
      } else {
        setForgotPasswordMessage('Failed to send reset email. Please try again.');
      }
    }
  }, [forgotPasswordError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const result = await login(formData).unwrap();
      dispatch(setCredentials(result));
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      // Error is handled in the useEffect above
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address');
      return;
    }

    try {
      await forgotPassword(forgotPasswordEmail).unwrap();
      setForgotPasswordMessage('Password reset instructions have been sent to your email!');
      setForgotPasswordEmail('');
      
      // Auto-close forgot password modal after success
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMessage('');
      }, 3000);
    } catch (err) {
      console.error('Forgot password failed:', err);
      // Error is handled in the useEffect above
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
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
              Welcome Back
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
              <FaUserCircle className="w-7 h-7" />
              Customer Portal
            </motion.h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              Sign in to your account to explore our latest collections and exclusive offers.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div 
          variants={itemVariants}
          className={`relative w-full max-w-md rounded-2xl shadow-lg p-10 border ${card}`}
        >
          {/* Header Icon */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <FaUserCircle className={`text-6xl ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-lg tracking-widest font-italiana font-semibold mb-10 text-center ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            CUSTOMER LOGIN
          </motion.h2>

          {/* Error Message */}
          <AnimatePresence>
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm overflow-hidden text-center"
              >
                {loginError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Email Input */}
            <div className={`flex items-center font-instrument border-b pb-2 ${inputBorder}`}>
              <FaEnvelope className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <input
                type="email"
                name="email"
                placeholder="Email ID"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full bg-transparent border-none outline-none ${
                  theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Password Input */}
            <div className={`flex items-center border-b pb-2 ${inputBorder} relative`}>
              <FaLock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
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
                className="absolute right-2 text-gray-500 hover:text-purple-500 transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className={`text-sm ${
              theme === "dark" 
                ? "text-purple-400 hover:text-purple-300" 
                : "text-purple-600 hover:text-purple-800"
            } transition-colors duration-200`}
          >
            Forgot Password?
          </Link>
        </div>

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
                  <FaSpinner className="animate-spin" /> Logging in...
                </>
              ) : (
                "LOGIN"
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
              Don't have an account?{" "}
              <Link
                to="/register"
                className={`cursor-pointer font-semibold ${
                  theme === "dark"
                    ? "text-purple-400 hover:text-purple-300"
                    : "text-purple-600 hover:text-purple-800"
                }`}
              >
                Sign up
              </Link>
            </motion.p>

            <motion.div
              className="space-y-3"
            >
              <Link 
                to="/wholesaler/login" 
                className={`block text-sm ${
                  theme === "dark" 
                    ? "text-gray-400 hover:text-gray-300" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Wholesaler Login
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserLogin;