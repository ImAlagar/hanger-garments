import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motionVariants } from '../../constants/headerConstants';

const CategoryCollections = ({ categories, handleSubcategoryClick }) => {
  const scrollRef = useRef({});

  const formatCategoryName = (name) => {
    if (name.toLowerCase() === 'men') return "Men's";
    if (name.toLowerCase() === 'women') return "Women's";
    if (name.toLowerCase() === 'kids') return "Kids'";
    return name;
  };

  const scroll = (categoryId, direction) => {
    const container = scrollRef.current[categoryId];
    if (container) {
      container.scrollBy({
        left:
          direction === 'left'
            ? -container.offsetWidth
            : container.offsetWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {categories.map((category) => (
        <motion.section
          key={category.id}
          className="mb-20 font-italiana tracking-widest"
          variants={motionVariants.container}
          initial="hidden"
          animate="visible"
        >
          {/* Category Title */}
          <div className="flex justify-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {formatCategoryName(category.name)} Collection
            </h2>
          </div>

          {category.subcategories?.length > 0 ? (
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={() => scroll(category.id, 'left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>

              {/* Scroll Container */}
              <div
                ref={(el) => (scrollRef.current[category.id] = el)}
                className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-12"
              >
                {category.subcategories.map((subcategory) => (
                  <motion.div
                    key={subcategory.id}
                    className="
                      flex-shrink-0
                      w-[70%]
                      sm:w-[45%]
                      md:w-[30%]
                      lg:w-[22%]
                      xl:w-[20%]
                    "
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() =>
                        handleSubcategoryClick(
                          subcategory.name,
                          category.name
                        )
                      }
                      className="w-full h-full group"
                    >
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                        {/* Image */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                          {subcategory.image ? (
                            <img
                              src={subcategory.image}
                              alt={subcategory.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src =
                                  'https://via.placeholder.com/300x400/000000/FFFFFF?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400 text-sm">
                                No Image
                              </span>
                            </div>
                          )}

                          {/* Product Count */}
                          {subcategory._count?.products > 0 && (
                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                              {subcategory._count.products}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div className="px-3 py-3">
                          <h3 className="text-center text-nowrap text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-black">
                            {subcategory.name}
                          </h3>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scroll(category.id, 'right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
              >
                <ArrowRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No subcategories available for{' '}
              {formatCategoryName(category.name)}
            </div>
          )}
        </motion.section>
      ))}
    </>
  );
};

export default CategoryCollections;
