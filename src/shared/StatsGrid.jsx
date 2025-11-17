import React from 'react';
import { motion } from 'framer-motion';

const StatsGrid = ({ 
  children, 
  columns = { 
    base: 1, 
    sm: 2, 
    lg: 4 
  },
  spacing = 'default', // 'default' | 'compact' | 'wide'
  className = ''
}) => {
  const getGridClasses = () => {
    const colClasses = `grid-cols-${columns.base} sm:grid-cols-${columns.sm} lg:grid-cols-${columns.lg}`;
    
    const spacingClasses = {
      default: 'gap-4 sm:gap-6',
      compact: 'gap-3 sm:gap-4',
      wide: 'gap-6 sm:gap-8'
    };

    return `${colClasses} ${spacingClasses[spacing]}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${getGridClasses()} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default StatsGrid;