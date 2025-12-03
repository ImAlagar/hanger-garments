import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Mail,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useLoginMutation } from "../../redux/services/authService";
import { setCredentials, authFailure } from "../../redux/slices/authSlice";
import { useAppSelector } from "../../redux/hooks";
import TiruppurImage from "../../assets/categories/tshirt.webp";
import { FaSpinner } from "react-icons/fa";
import logowhite from "../../assets/images/TiruppurGarmentsLogo1(1).png";
import logo from "../../assets/images/TiruppurGarmentsLogoblack1.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Use RTK Query mutation
  const [login, { isLoading, error }] = useLoginMutation();

  // Get current auth state
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'ADMIN'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  // Determine which logo to use based on theme
  const currentLogo = theme === "dark" ? logowhite : logo;

  // Redirect if user is already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // Handle login errors
  useEffect(() => {
    if (error) {
      
      let errorMessage = 'Admin login failed. Please try again.';
      
      // Handle different error formats
      if (error.data) {
        errorMessage = error.data.message || error.data.error || errorMessage;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.status) {
        switch (error.status) {
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 403:
            errorMessage = 'Access denied. Admin privileges required.';
            break;
          case 404:
            errorMessage = 'Admin account not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Login failed (Error ${error.status})`;
        }
      }
      
      setLoginError(errorMessage);
      dispatch(authFailure(errorMessage));
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear auth error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      
      const result = await login(formData).unwrap();
      
      // Check if the logged-in user is actually an admin
      const userRole = result.data?.user?.role || result.user?.role;
      
      if (userRole !== 'ADMIN') {
        const errorMsg = 'Access denied. Admin privileges required.';
        setLoginError(errorMsg);
        dispatch(authFailure(errorMsg));
        return;
      }
      
      // Set credentials in Redux store
      dispatch(setCredentials(result));
      
      // Redirect to admin dashboard
      const from = location.state?.from?.pathname || '/dashboard/admin';
      navigate(from, { replace: true });
      
    } catch (err) {
      console.error('Admin login failed:', err);
      // Error is handled in the useEffect above
    }
  };

  const handleReturnToCustomerPortal = () => {
    navigate('/');
  };

  const handleGoToUserLogin = () => {
    navigate('/login');
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

  // If user is already authenticated as admin, show loading while redirecting
  if (isAuthenticated && user?.role === 'ADMIN') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-instrument">Redirecting to dashboard...</p>
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
              alt="Tiruppur  Garments Logo" 
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
              Secure Admin Access
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
              <Shield className="w-7 h-7" />
              Administrator Portal
            </motion.h2>
            <p className="text-gray-300 leading-relaxed text-lg font-instrument">
              This portal is exclusively for authorized administrators. Customer accounts cannot access this area.
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
            className={`text-lg tracking-widest font-italiana font-semibold mb-10 text-center ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            ADMIN LOGIN
          </motion.h2>

          {/* Error Message */}
          <AnimatePresence>
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm overflow-hidden text-center font-instrument"
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
            <div className={`flex items-center border-b pb-2 ${inputBorder}`}>
              <Mail className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full bg-transparent border-none outline-none font-instrument ${
                  theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-500 text-sm mt-1 font-instrument"
              >
                {errors.email}
              </motion.p>
            )}

            {/* Password Input */}
            <div className={`flex items-center border-b pb-2 ${inputBorder} relative`}>
              <Lock className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Admin Password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full bg-transparent border-none outline-none pr-8 font-instrument ${
                  theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 text-gray-500 hover:text-purple-500 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-500 text-sm mt-1 font-instrument"
              >
                {errors.password}
              </motion.p>
            )}


          {/* Forgot Password Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-end"
          >
            <button
              onClick={() => navigate('/admin/forgot-password')}
              className={`text-sm font-instrument hover:underline transition ${
                theme === "dark" ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
              }`}
            >
              Forgot Admin Password?
            </button>
          </motion.div>


            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className={`w-full mt-6 py-2 rounded-md font-instrument tracking-widest font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                theme === "dark"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin w-4 h-4" /> Securing Access...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  LOGIN
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mt-6"
          >
            {/* Return to Customer Portal */}
            <motion.button
              onClick={handleReturnToCustomerPortal}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-2 rounded-md font-instrument tracking-widest text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-300"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Customer Portal
            </motion.button>

            {/* Customer Login */}
            <motion.button
              onClick={handleGoToUserLogin}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-2 rounded-md font-instrument tracking-widest text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                theme === "dark"
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              <User className="w-4 h-4" />
              Customer Login
            </motion.button>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <p className={`text-sm text-center font-instrument ${
              theme === "dark" ? "text-yellow-300" : "text-yellow-700"
            }`}>
              🔒 Restricted Access: Admin Personnel Only
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminLogin;