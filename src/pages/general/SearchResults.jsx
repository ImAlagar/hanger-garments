// pages/SearchResults.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSearchProductsQuery } from '../redux/services/productService';
import ProductGrid from '../components/Product/ProductGrid';

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query');

  const { data: searchData, isLoading, error } = useSearchProductsQuery(
    { query },
    { skip: !query }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Searching for "{query}"...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading search results</div>
      </div>
    );
  }

  const products = searchData?.data?.products || [];
  const pagination = searchData?.data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results for "{query}"
          </h1>
          {pagination && (
            <p className="text-gray-600">
              Found {pagination.total} product{pagination.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              No products found for "{query}"
            </div>
            <p className="text-gray-500">
              Try different keywords or browse our categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;