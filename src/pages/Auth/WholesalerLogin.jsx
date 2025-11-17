import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserCircle,
  FaPhone,
  FaLock,
  FaSpinner,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useDispatch } from "react-redux";
import { 
  useSendOTPMutation,
  useVerifyOTPMutation 
} from "../../redux/services/authService";
import { setCredentials } from "../../redux/slices/authSlice";
import hangerImage from "../../assets/categories/tshirt.webp";

const WholesalerLogin = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    phone: '',
  });
  
  const [sendOTP, { isLoading: otpLoading }] = useSendOTPMutation();
  const [verifyOTP, { isLoading: verifyLoading }] = useVerifyOTPMutation();
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOTPField, setShowOTPField] = useState(false);
  const [otp, setOtp] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    if (showOTPField) {
      // Verify OTP and login
      const result = await verifyOTP({
        phone: formData.phone,
        otp: otp
      }).unwrap();
      
      dispatch(setCredentials(result));
      
      // Check if user needs additional verification (adjust this condition based on your actual business logic)
      // Since there's no status field, you might need to check something else
      // For now, let's assume all verified users go to dashboard
      navigate('/');
      
    } else {
      // Send OTP first - send phone to login endpoint
      const response = await sendOTP({ phone: formData.phone }).unwrap();
      setSuccess(response.message || "OTP sent to your phone number!");
      setShowOTPField(true);
    }
  } catch (err) {
    console.error('Login failed:', err);
    setError(err?.data?.message || "Login failed. Please try again.");
  }
};
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
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

  const isLoading = otpLoading || verifyLoading;

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
              Wholesale Partner Access
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
              Wholesaler Portal
            </motion.h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              Access your wholesale account with secure OTP verification. Get exclusive pricing and manage your bulk orders.
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
            WHOLESALER LOGIN
          </motion.h2>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm overflow-hidden text-center"
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
                className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm overflow-hidden text-center"
              >
                {success}
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
            {/* Phone Number */}
            <div className={`flex items-center font-instrument border-b pb-2 ${inputBorder}`}>
              <FaPhone className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`w-full bg-transparent border-none outline-none ${
                  theme === "dark" 
                    ? "text-white placeholder-gray-500" 
                    : "text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* OTP Field (shown after sending OTP) */}
            <AnimatePresence>
              {showOTPField && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center border-b pb-2 ${inputBorder}`}
                >
                  <FaLock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className={`w-full bg-transparent border-none outline-none ${
                      theme === "dark" 
                        ? "text-white placeholder-gray-500" 
                        : "text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
                  <FaSpinner className="animate-spin" /> 
                  {showOTPField ? "Verifying..." : "Sending OTP..."}
                </>
              ) : (
                showOTPField ? "VERIFY & LOGIN" : "SEND OTP"
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
                to="/wholesaler/register"
                className={`cursor-pointer font-semibold ${
                  theme === "dark"
                    ? "text-purple-400 hover:text-purple-300"
                    : "text-purple-600 hover:text-purple-800"
                }`}
              >
                Register as Wholesaler
              </Link>
            </motion.p>

            <motion.div
              className="space-y-2"
            >
              <Link 
                to="/login" 
                className={`block text-sm ${
                  theme === "dark" 
                    ? "text-gray-400 hover:text-gray-300" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Customer Login
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WholesalerLogin;