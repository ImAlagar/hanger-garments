import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { topbarMessages, motionVariants } from '../../../constants/headerConstants';

const PromotionalTopbar = ({ theme, topbarVisible }) => {
  return (
    <AnimatePresence>
      {topbarVisible && (
        <motion.div
          variants={motionVariants.topbar}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={`relative overflow-hidden z-40 ${
            theme === "dark" 
              ? "bg-gradient-to-r from-purple-900 to-blue-900 text-white" 
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          }`}
        >
          <div className="py-2">
            <motion.div
              className="whitespace-nowrap"
              animate={{ x: [0, -1000] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {topbarMessages.map((message, index) => (
                <span key={index} className="mx-8 text-sm font-medium">
                  {message}
                </span>
              ))}
              {topbarMessages.map((message, index) => (
                <span key={`dup-${index}`} className="mx-8 text-sm font-medium">
                  {message}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionalTopbar;