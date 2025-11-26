import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchProductsQuery } from '../redux/services/productService';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use the search products query
  const { 
    data: searchResults, 
    isLoading: isSearchLoading, 
    error: searchError,
    isFetching 
  } = useSearchProductsQuery(
    { query: debouncedQuery },
    {
      skip: !debouncedQuery,
      refetchOnMountOrArgChange: true
    }
  );

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchOpen && !event.target.closest('.search-container')) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery.trim());
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Recent searches functionality
  const getRecentSearches = () => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  };

  const addToRecentSearches = (query) => {
    if (!query.trim()) return;
    
    const recentSearches = getRecentSearches();
    const updatedSearches = [
      query.trim(),
      ...recentSearches.filter(item => item.toLowerCase() !== query.trim().toLowerCase())
    ].slice(0, 5);
    
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
  };

  const handleProductClick = (product) => {
    // Use the actual product ID, not a generated slug
    const productId = product.id;
    
    // Navigate to collections route with the product ID
    navigate(`/collections/${productId}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery.trim());
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return {
    searchQuery,
    searchOpen,
    setSearchQuery,
    setSearchOpen,
    handleSearch,
    searchResults: searchResults?.data || { products: [], pagination: { total: 0 } },
    isSearchLoading: isSearchLoading || isFetching,
    searchError,
    recentSearches: getRecentSearches(),
    clearRecentSearches,
    handleProductClick,
    handleViewAllResults
  };
};