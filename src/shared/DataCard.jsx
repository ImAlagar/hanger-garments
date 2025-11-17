// shared/DataCard.jsx (Fixed Action Button Issue)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const DataCard = ({ 
  data, 
  keyField = 'id',
  renderItem,
  emptyMessage = "No data found",
  emptyAction,
  className = "",
  layout = true,
  staggerChildren = true,
  onItemClick,
  theme: propTheme, // Optional prop to override context theme
  disableClickForActions = true // NEW: Add this prop to fix action button issue
}) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  // Theme-based styles
  const themeStyles = {
    emptyState: {
      container: theme === 'dark' 
        ? 'text-gray-300' 
        : 'text-gray-600',
      icon: theme === 'dark'
        ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-500'
        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400',
      text: {
        primary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
        secondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-400',
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: staggerChildren ? 0.1 : 0
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const emptyStateVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };

  const iconVariants = {
    hidden: {
      opacity: 0,
      rotate: -180,
      scale: 0
    },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    }
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  const actionVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.4
      }
    }
  };

  // NEW: Handle card click with action button check
  const handleCardClick = (item, event) => {
    // Check if the click came from an action button
    const isActionButtonClick = event.target.closest('[data-action-button="true"]');
    
    if (onItemClick && !isActionButtonClick) {
      onItemClick(item);
    }
  };

  if (!data || data.length === 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty-state"
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="text-center py-16 px-4"
        >
          <motion.div
            variants={iconVariants}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${themeStyles.emptyState.icon}`}
          >
            <svg 
              className="w-10 h-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
              />
            </svg>
          </motion.div>
          
          <motion.div
            variants={textVariants}
            className={`text-xl font-medium mb-3 ${themeStyles.emptyState.text.primary}`}
          >
            {emptyMessage}
          </motion.div>
          
          <motion.p
            variants={textVariants}
            className={`text-base mb-6 max-w-md mx-auto leading-relaxed ${themeStyles.emptyState.text.secondary}`}
          >
            Try adjusting your search criteria or creating new content
          </motion.p>
          
          {emptyAction && (
            <motion.div
              variants={actionVariants}
            >
              {emptyAction}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 gap-4 ${className}`}
      layout={layout ? "position" : false}
    >
      <AnimatePresence mode="popLayout">
        {data.map((item, index) => (
          <motion.div
            key={item[keyField]}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            layout={layout ? "position" : false}
            custom={index}
            className={`transform-gpu ${onItemClick ? 'cursor-pointer' : ''}`}
            onClick={(e) => handleCardClick(item, e)}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default DataCard;