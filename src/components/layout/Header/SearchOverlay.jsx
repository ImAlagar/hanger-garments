import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiXCircle } from 'react-icons/fi';
import { motionVariants } from '../../../constants/headerConstants';

const SearchOverlay = ({ 
  searchOpen, 
  searchQuery, 
  setSearchQuery, 
  setSearchOpen, 
  handleSearch 
}) => {
  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32 px-4"
        >
          <motion.div
            variants={motionVariants.search}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="search-container bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center px-6 py-5 border-b border-gray-100">
                <FiSearch className="text-gray-400 size-6 mr-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search t-shirts, collections, styles..."
                  className="flex-1 text-xl bg-transparent border-none outline-none placeholder-gray-400"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <FiXCircle className="size-6" />
                  </button>
                )}
              </div>
              
              <div className="p-5 bg-gray-50 flex justify-between items-center">
                <div className="text-base text-gray-500">
                  Press Enter to search
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="px-5 py-3 text-gray-600 hover:text-gray-800 transition-colors text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;