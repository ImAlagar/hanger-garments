import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const InputField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  required = false, 
  placeholder, 
  className = '',
  error = '',
  ...props 
}) => {
  const { theme } = useTheme();
  
  const themeClasses = {
    light: {
      bg: { input: 'bg-white' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-700', error: 'text-red-600' },
      border: 'border-gray-200',
    },
    dark: {
      bg: { input: 'bg-gray-700' },
      text: { primary: 'text-white', secondary: 'text-gray-200', error: 'text-red-400' },
      border: 'border-gray-600',
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  return (
    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
      {label && (
        <label className={`block text-sm font-medium font-instrument ${currentTheme.text.secondary} mb-2`}>
          {label} {required && '*'}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${currentTheme.bg.input} ${currentTheme.text.primary} ${className}`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className={`mt-1 text-sm ${currentTheme.text.error}`}>{error}</p>
      )}
    </motion.div>
  );
};

export default InputField;