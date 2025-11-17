// shared/DeleteConfirmationModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiTrash2, FiLoader } from 'react-icons/fi';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  type = "danger" // 'danger', 'warning'
}) => {
  // Animation variants
  const backdropVariants = {
    hidden: {
      opacity: 0,
      backdropFilter: "blur(0px)"
    },
    visible: {
      opacity: 1,
      backdropFilter: "blur(4px)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      backdropFilter: "blur(0px)",
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const iconVariants = {
    hidden: {
      scale: 0,
      rotate: -180
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 200,
        delay: 0.1
      }
    },
    hover: {
      scale: 1.1,
      rotate: type === 'danger' ? [-5, 5, -5, 5, 0] : 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.2
      }
    }
  };

  const buttonVariants = {
    initial: {
      scale: 1
    },
    hover: {
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
    },
    loading: {
      scale: [1, 0.95, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FiAlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'danger':
      default:
        return <FiTrash2 className="w-6 h-6 text-red-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'danger':
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
  };

  const getGlowEffect = () => {
    switch (type) {
      case 'warning':
        return 'shadow-lg shadow-yellow-500/20';
      case 'danger':
      default:
        return 'shadow-lg shadow-red-500/20';
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto ${getGlowEffect()}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between p-6 border-b border-gray-200"
              variants={contentVariants}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                >
                  {getIcon()}
                </motion.div>
                <motion.h3 
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </motion.h3>
              </div>
              <motion.button
                onClick={onClose}
                disabled={isLoading}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-lg hover:bg-gray-100"
              >
                <FiX className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Message */}
            <motion.div 
              className="p-6"
              variants={contentVariants}
            >
              <motion.p 
                className="text-gray-600 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {message}
              </motion.p>
            </motion.div>

            {/* Actions */}
            <motion.div 
              className="flex justify-end space-x-3 p-6 border-t border-gray-200"
              variants={contentVariants}
            >
              <motion.button
                onClick={onClose}
                disabled={isLoading}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {cancelText}
              </motion.button>
              
              <motion.button
                onClick={handleConfirm}
                disabled={isLoading}
                variants={isLoading ? shakeVariants : buttonVariants}
                animate={isLoading ? "loading" : "initial"}
                whileHover={isLoading ? {} : "hover"}
                whileTap={isLoading ? {} : "tap"}
                className={`px-5 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium ${getButtonColor()}`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiLoader className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <FiTrash2 className="w-4 h-4" />
                )}
                <span>
                  {isLoading ? 'Deleting...' : confirmText}
                </span>
              </motion.button>
            </motion.div>

            {/* Loading overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-3 bg-white px-4 py-3 rounded-lg shadow-lg border"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FiLoader className="w-5 h-5 text-red-600" />
                    </motion.div>
                    <span className="text-gray-700 font-medium">Processing...</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced version with destructive action protection
export const SecureDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "This action cannot be undone. Please type 'DELETE' to confirm.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  type = "danger",
  requiresVerification = false,
  verificationText = "DELETE"
}) => {
  const [verificationInput, setVerificationInput] = React.useState('');
  const [showVerificationError, setShowVerificationError] = React.useState(false);

  const handleConfirm = () => {
    if (requiresVerification) {
      if (verificationInput === verificationText) {
        onConfirm();
        setVerificationInput('');
        setShowVerificationError(false);
      } else {
        setShowVerificationError(true);
      }
    } else {
      onConfirm();
    }
  };

  const handleClose = () => {
    setVerificationInput('');
    setShowVerificationError(false);
    onClose();
  };

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      isLoading={isLoading}
      type={type}
    >
      {requiresVerification && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-2"
        >
          <motion.input
            type="text"
            value={verificationInput}
            onChange={(e) => {
              setVerificationInput(e.target.value);
              setShowVerificationError(false);
            }}
            placeholder={`Type "${verificationText}" to confirm`}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              showVerificationError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            whileFocus={{ scale: 1.02 }}
          />
          {showVerificationError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              Please type "{verificationText}" exactly to confirm deletion.
            </motion.p>
          )}
        </motion.div>
      )}
    </DeleteConfirmationModal>
  );
};

export default DeleteConfirmationModal;