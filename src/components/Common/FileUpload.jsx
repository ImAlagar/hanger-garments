import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const FileUpload = ({ 
  label, 
  onChange, 
  multiple = false, 
  accept = '*', 
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
          {label}
        </label>
      )}
      <input
        type="file"
        onChange={onChange}
        multiple={multiple}
        accept={accept}
        className={`w-full px-3 py-2 border ${currentTheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.bg.input} ${className}`}
        {...props}
      />
      {error && (
        <p className={`mt-1 text-sm ${currentTheme.text.error}`}>{error}</p>
      )}
    </motion.div>
  );
};

export default FileUpload;