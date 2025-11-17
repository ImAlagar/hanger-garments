import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({
  // Content
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  
  // Styling
  color = 'blue',
  size = 'default', // 'default' | 'compact'
  
  // Data indicators
  change,
  percentage,
  trend,
  alert,
  
  // Animation
  delay = 0,
  index = 0,
  
  // Interactive
  onClick,
  interactive = true,
  
  // Custom elements
  customContent,
  progressBar,
  children,
  
  // Theme
  theme: propTheme // Optional prop to override context theme
}) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  const getColorClasses = (color) => {
    const lightColors = {
      blue: {
        bg: 'bg-blue-50',
        hoverBg: 'hover:bg-blue-100',
        text: 'text-blue-600',
        icon: 'text-blue-500',
        border: 'border-blue-200',
        progress: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        hoverBg: 'hover:bg-green-100',
        text: 'text-green-600',
        icon: 'text-green-500',
        border: 'border-green-200',
        progress: 'bg-green-500'
      },
      purple: {
        bg: 'bg-purple-50',
        hoverBg: 'hover:bg-purple-100',
        text: 'text-purple-600',
        icon: 'text-purple-500',
        border: 'border-purple-200',
        progress: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-orange-50',
        hoverBg: 'hover:bg-orange-100',
        text: 'text-orange-600',
        icon: 'text-orange-500',
        border: 'border-orange-200',
        progress: 'bg-orange-500'
      },
      red: {
        bg: 'bg-red-50',
        hoverBg: 'hover:bg-red-100',
        text: 'text-red-600',
        icon: 'text-red-500',
        border: 'border-red-200',
        progress: 'bg-red-500'
      },
      yellow: {
        bg: 'bg-yellow-50',
        hoverBg: 'hover:bg-yellow-100',
        text: 'text-yellow-600',
        icon: 'text-yellow-500',
        border: 'border-yellow-200',
        progress: 'bg-yellow-500'
      }
    };

    const darkColors = {
      blue: {
        bg: 'bg-blue-900/20',
        hoverBg: 'hover:bg-blue-900/30',
        text: 'text-blue-400',
        icon: 'text-blue-400',
        border: 'border-blue-800',
        progress: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-900/20',
        hoverBg: 'hover:bg-green-900/30',
        text: 'text-green-400',
        icon: 'text-green-400',
        border: 'border-green-800',
        progress: 'bg-green-500'
      },
      purple: {
        bg: 'bg-purple-900/20',
        hoverBg: 'hover:bg-purple-900/30',
        text: 'text-purple-400',
        icon: 'text-purple-400',
        border: 'border-purple-800',
        progress: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-orange-900/20',
        hoverBg: 'hover:bg-orange-900/30',
        text: 'text-orange-400',
        icon: 'text-orange-400',
        border: 'border-orange-800',
        progress: 'bg-orange-500'
      },
      red: {
        bg: 'bg-red-900/20',
        hoverBg: 'hover:bg-red-900/30',
        text: 'text-red-400',
        icon: 'text-red-400',
        border: 'border-red-800',
        progress: 'bg-red-500'
      },
      yellow: {
        bg: 'bg-yellow-900/20',
        hoverBg: 'hover:bg-yellow-900/30',
        text: 'text-yellow-400',
        icon: 'text-yellow-400',
        border: 'border-yellow-800',
        progress: 'bg-yellow-500'
      }
    };

    const colors = theme === 'dark' ? darkColors : lightColors;
    return colors[color] || colors.blue;
  };

  // Theme-based text and background styles
  const themeStyles = {
    text: {
      primary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
      title: theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    },
    background: {
      icon: theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50',
      progress: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
    }
  };

  const colors = getColorClasses(color);
  const isPositive = trend === 'up' || (change !== undefined && change >= 0);
  const isCompact = size === 'compact';

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5,
        delay
      }
    },
    hover: interactive ? {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.2
      }
    } : {},
    tap: interactive ? {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    } : {}
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: delay + 0.3
      }
    },
    hover: {
      rotate: 360,
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
        duration: 0.3
      }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: delay + 0.2
      }
    }
  };

  const TrendIndicator = () => {
    if (!trend || trend === 'neutral') return null;
    
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.5, type: "spring" }}
        className={`ml-2 inline-flex items-center ${isPositive ? colors.text : 'text-red-500'}`}
      >
        <TrendingUp className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} />
      </motion.div>
    );
  };

  const AlertIndicator = () => {
    if (!alert) return null;

    return (
      <motion.span 
        className="absolute -top-1 -right-1 flex h-3 w-3"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
          theme === 'dark' ? 'bg-yellow-500' : 'bg-yellow-400'
        } opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${
          theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-500'
        }`}></span>
      </motion.span>
    );
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`
        ${colors.bg} ${colors.border} rounded-xl border-2 backdrop-blur-sm
        ${interactive ? `${colors.hoverBg} cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300` : ''}
        ${isCompact ? 'p-3' : 'p-4 sm:p-6'}
        ${theme === 'dark' ? 'shadow-lg' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <motion.div variants={valueVariants} className="flex-1 min-w-0">
          <p className={`font-medium mb-2 ${isCompact ? 'text-xs' : 'text-sm'} ${themeStyles.text.title}`}>
            {title}
          </p>
          
          <div className="flex items-baseline">
            <motion.p 
              className={`font-bold truncate ${
                isCompact ? 'text-xl' : 'text-2xl sm:text-3xl'
              } ${themeStyles.text.primary}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                delay: delay + 0.4
              }}
            >
              {value}
            </motion.p>
            <TrendIndicator />
          </div>
          
          {subtitle && (
            <motion.p 
              className={`mb-1 ${
                isCompact ? 'text-xs' : 'text-sm'
              } ${themeStyles.text.secondary}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.6 }}
            >
              {subtitle}
            </motion.p>
          )}

          {description && (
            <motion.p 
              className={`${
                isCompact ? 'text-xs' : 'text-sm'
              } ${themeStyles.text.muted}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.6 }}
            >
              {description}
            </motion.p>
          )}

          {/* Change indicator */}
          {change !== undefined && (
            <motion.div 
              className={`flex items-center font-medium mt-2 ${
                isCompact ? 'text-xs' : 'text-sm'
              } ${isPositive ? 'text-green-600' : 'text-red-600'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.7 }}
            >
              <TrendingUp className={`${isCompact ? 'w-2 h-2' : 'w-3 h-3'} mr-1 ${isPositive ? '' : 'rotate-180'}`} />
              {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'}
            </motion.div>
          )}

          {/* Percentage indicator */}
          {percentage !== undefined && (
            <motion.p 
              className={`font-medium ${colors.text} ${
                isCompact ? 'text-xs' : 'text-sm'
              } mt-1`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.6 }}
            >
              {percentage}% of total
            </motion.p>
          )}
        </motion.div>
        
        {Icon && (
          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className={`${themeStyles.background.icon} backdrop-blur-sm border ${colors.border} relative flex-shrink-0 ${
              isCompact ? 'p-2 rounded-lg' : 'p-2 sm:p-3 rounded-xl sm:rounded-2xl'
            }`}
          >
            <Icon className={`${colors.icon} ${isCompact ? 'w-4 h-4' : 'w-5 h-5 sm:w-7 sm:h-7'}`} />
            <AlertIndicator />
          </motion.div>
        )}
      </div>

      {/* Custom content */}
      {customContent}

      {/* Progress bar */}
      {progressBar && (
        <motion.div 
          className={`mt-4 rounded-full h-1.5 overflow-hidden ${themeStyles.background.progress}`}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: delay + 0.8, duration: 1 }}
        >
          <motion.div
            className={`h-full rounded-full ${colors.progress}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressBar.percentage || 50, 100)}%` }}
            transition={{ delay: delay + 1, duration: 1.5, ease: "easeOut" }}
          />
        </motion.div>
      )}

      {/* Alert message */}
      {alert && (
        <motion.div 
          className="mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 1 }}
        >
          <div className="flex items-center space-x-1">
            <AlertTriangle className={`${isCompact ? 'w-2 h-2' : 'w-3 h-3'} ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
            }`} />
            <span className={`font-medium ${
              isCompact ? 'text-xs' : 'text-sm'
            } ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {alert}
            </span>
          </div>
        </motion.div>
      )}

      {/* Children content */}
      {children}
    </motion.div>
  );
};

export default StatCard;