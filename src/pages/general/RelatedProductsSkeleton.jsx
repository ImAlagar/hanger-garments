import React from 'react';

const RelatedProductsSkeleton = () => {
  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">

        {/* Title Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Horizontal Skeleton Cards */}
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[65vw] sm:w-56 md:w-64 lg:w-72"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default RelatedProductsSkeleton;
