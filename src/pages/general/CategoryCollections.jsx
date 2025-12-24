import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { motionVariants } from '../../constants/headerConstants';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const CategoryCollections = ({ 
  categories, 
  handleSubcategoryClick 
}) => {
  const formatCategoryName = (name) => {
    if (name.toLowerCase() === 'men') return "Men's";
    if (name.toLowerCase() === 'women') return "Women's";
    if (name.toLowerCase() === 'kids') return "Kids'";
    return name;
  };

  const scrollRef = useRef({});

  const scroll = (categoryId, direction) => {
    const container = scrollRef.current[categoryId];
    if (container) {
      const scrollAmount = container.offsetWidth; // scroll by one container width
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {categories.map((category) => (
        <motion.section
          key={category.id}
          className="mb-16 font-italiana tracking-widest"
          variants={motionVariants.container}
          initial="hidden"
          animate="visible"
        >
          {/* Category Header */}
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {formatCategoryName(category.name)} Collection
            </h2>
          </div>

          {/* Subcategories Horizontal Scroller */}
          {category.subcategories && category.subcategories.length > 0 ? (
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={() => scroll(category.id, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>

              <div
                className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
                ref={(el) => (scrollRef.current[category.id] = el)}
              >
                {category.subcategories.map((subcategory) => (
                  <motion.div
                    key={subcategory.id}
                    className="flex-shrink-0 w-1/2 sm:w-1/4 lg:w-1/4 xl:w-1/5  rounded-md"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => handleSubcategoryClick(subcategory.name, category.name)}
                      className="group w-full text-left"
                    >
                      <div className=" overflow-hidden mb-2  relative h-96 md:h-96">
                        {subcategory.image ? (
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/224x192/000000/FFFFFF?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}

                        {subcategory._count?.products > 0 && (
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                            {subcategory._count.products} products
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-center text-gray-900 truncate group-hover:text-black">
                        {subcategory.name}
                      </h3>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scroll(category.id, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
              >
                <ArrowRight className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No subcategories available for {formatCategoryName(category.name)}
            </div>
          )}
        </motion.section>
      ))}
    </>
  );
};

export default CategoryCollections;
