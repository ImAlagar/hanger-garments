import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserCircle,
  FaPhone,
  FaSpinner,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useDispatch } from "react-redux";
import { useVerifyOTPMutation, useSendOTPMutation } from "../../redux/services/authService";
import { setCredentials } from "../../redux/slices/authSlice";
import hangerImage from "../../assets/categories/tshirt.webp";

const OTPVerification = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [verifyOTP, { isLoading: verifyLoading }] = useVerifyOTPMutation();
  const [sendOTP, { isLoading: sendLoading }] = useSendOTPMutation();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phone, setPhone] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get phone from location state or redirect
    if (location.state?.phone) {
      setPhone(location.state.phone);
    } else {
      navigate('/wholesaler/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }

    try {
      const result = await verifyOTP({
        phone: phone,
        otp: otpValue
      }).unwrap();
      
      dispatch(setCredentials(result));
      setSuccess("OTP verified successfully! Redirecting...");
      
      setTimeout(() => {
        if (result.user.status === 'PENDING') {
          navigate('/wholesaler/complete-profile');
        } else {
          navigate('/dashboard/wholesaler');
        }
      }, 2000);
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError(err?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError("");
    try {
      const response = await sendOTP({ phone: phone }).unwrap();
      setSuccess(response.message || "OTP resent successfully!");
      setCountdown(60); // 60 seconds countdown
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  // Theme-based styles
  const bg = theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900";
  const card = theme === "dark" 
    ? "bg-gray-900 text-white border-gray-700" 
    : "bg-gray-100 text-gray-900 border-gray-200";

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

  const isLoading = verifyLoading || sendLoading;

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
              Secure Verification
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
              OTP Verification
            </motion.h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              For your security, we've sent a 6-digit verification code to your registered phone number.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right side - OTP Verification Form */}
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              theme === "dark" ? "bg-purple-600" : "bg-purple-500"
            }`}>
              <FaShieldAlt className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-lg tracking-widest font-italiana font-semibold mb-4 text-center ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            VERIFY OTP
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8 font-instrument text-sm"
          >
            Enter the 6-digit OTP sent to <br />
            <span className="font-semibold">{phone}</span>
          </motion.p>

          {/* OTP Verification Form */}
          <motion.form
            onSubmit={handleVerify}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* OTP Inputs */}
            <div className="flex justify-between space-x-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  className={`w-12 h-12 text-center text-lg font-bold rounded-lg border-2 ${
                    theme === "dark" 
                      ? "bg-gray-800 border-gray-600 text-white focus:border-purple-500" 
                      : "bg-white border-gray-400 text-gray-900 focus:border-purple-500"
                  } focus:outline-none transition-colors`}
                />
              ))}
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm overflow-hidden text-center"
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
                  className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm overflow-hidden text-center flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verify Button */}
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
                  <FaSpinner className="animate-spin" /> Verifying...
                </>
              ) : (
                "VERIFY OTP"
              )}
            </motion.button>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isLoading}
                className={`font-instrument text-sm ${
                  theme === "dark"
                    ? "text-purple-400 hover:text-purple-300"
                    : "text-purple-600 hover:text-purple-800"
                } ${countdown > 0 || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
              </button>
            </div>
          </motion.form>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-6"
          >
            <button 
              onClick={() => navigate('/wholesaler/login')}
              className={`text-sm ${
                theme === "dark" 
                  ? "text-gray-400 hover:text-gray-300" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Back to Login
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OTPVerification;