// components/admin/products/BulkActions.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiX } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { clearSelection } from '../../../redux/slices/productSlice';

const BulkActions = ({ selectedCount, onBulkDelete }) => {
  const dispatch = useDispatch();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {selectedCount} selected
          </div>
          <p className="text-blue-700 text-sm">
            Perform actions on selected products
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onBulkDelete}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete Selected</span>
          </button>
          
          <button
            onClick={() => dispatch(clearSelection())}
            className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <FiX className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BulkActions;