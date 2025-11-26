import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useGetAllCategoriesQuery } from '../../../redux/services/categoryService';
import { useGetAllSubcategoriesQuery } from '../../../redux/services/subcategoryService';
import { useTheme } from '../../../context/ThemeContext'; // Adjust import path as needed

const createSlug = (name = "") =>
  name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const DesktopNav = () => {
  const { category } = useParams();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRefs = useRef({});
  const { theme } = useTheme();
  
  // Fetch categories and subcategories
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useGetAllCategoriesQuery();
  
  const { 
    data: subcategoriesData, 
    isLoading: subcategoriesLoading,
    error: subcategoriesError
  } = useGetAllSubcategoriesQuery();

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = categoriesData?.data || categoriesData || [];
  const subcategories = subcategoriesData?.data || subcategoriesData || [];

  // Filter out inactive categories
  const activeCategories = categories.filter(cat => cat.isActive === true);

  // Desired order
  const desiredOrder = ['Men', 'Women', 'Kids', 'Unisex', 'Customised Design', 'Exclusive Pre Order'];
  
  const sortedCategories = [...activeCategories].sort((a, b) => {
    const indexA = desiredOrder.indexOf(a.name);
    const indexB = desiredOrder.indexOf(b.name);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  const subcategoriesByCategory = subcategories.reduce((acc, subcat) => {
    const categoryName = subcat.category?.name || subcat.category;
    if (categoryName) {
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(subcat);
    }
    return acc;
  }, {});

  const handleMouseEnter = (categoryName) => {
    if (mounted) setActiveDropdown(categoryName);
  };

  const handleMouseLeave = (categoryName, e) => {
    const dropdownElement = dropdownRefs.current[categoryName];
    if (dropdownElement && dropdownElement.contains(e.relatedTarget)) return;
    if (mounted) setActiveDropdown(null);
  };

  const handleDropdownMouseLeave = (e) => {
    if (e.relatedTarget && e.relatedTarget.closest('.category-link')) return;
    if (mounted) setActiveDropdown(null);
  };

  const createCategorySlug = (categoryName) => createSlug(categoryName);

  const isCategoryActive = (categoryName) => {
    if (!category) return false;
    return createCategorySlug(categoryName) === category.toLowerCase();
  };

  const getNavStyles = () => {
    if (theme === 'dark') {
      return {
        nav: ' text-white',
        dropdown: 'bg-gray-800 border-gray-700 text-white',
        category: {
          active: 'text-blue-400 border-blue-400',
          inactive: 'text-gray-300 hover:text-blue-400',
        },
        dropdownItem: 'text-gray-300 hover:bg-gray-700 hover:text-white',
        dropdownSection: 'border-gray-700',
        featured: {
          new: 'text-green-400 hover:bg-green-900',
          bestseller: 'text-orange-400 hover:bg-orange-900',
          featured: 'text-yellow-400 hover:bg-yellow-900',
          instock: 'text-blue-400 hover:bg-blue-900'
        }
      };
    }
    return {
      nav: ' text-gray-900',
      dropdown: 'bg-white border-gray-200 text-gray-900',
      category: {
        active: 'text-blue-600 border-blue-600',
        inactive: 'text-gray-700 hover:text-blue-600',
      },
      dropdownItem: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      dropdownSection: 'border-gray-100',
      featured: {
        new: 'text-green-700 hover:bg-green-50',
        bestseller: 'text-orange-700 hover:bg-orange-50',
        featured: 'text-yellow-700 hover:bg-yellow-50',
        instock: 'text-blue-700 hover:bg-blue-50'
      }
    };
  };

  const styles = getNavStyles();

  if (categoriesLoading || subcategoriesLoading) {
    return (
      <nav className={`hidden lg:flex items-center space-x-8 ${styles.nav}`}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-4 rounded w-20 animate-pulse ${ theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200' }`}
          />
        ))}
      </nav>
    );
  }

  if (categoriesError || subcategoriesError) {
    return (
      <nav className={`hidden lg:flex items-center space-x-8 ${styles.nav}`}>
        <Link to="/shop/men" className={`px-3 py-2 text-sm font-medium transition-colors font-bai-jamjuree tracking-wide ${styles.category.inactive}`}>Men</Link>
        <Link to="/shop/women" className={`px-3 py-2 text-sm font-medium transition-colors font-bai-jamjuree tracking-wide ${styles.category.inactive}`}>Women</Link>
      </nav>
    );
  }

  return (
    <nav className={`hidden xl:flex items-center space-x-8 ${styles.nav}`}>
      {sortedCategories.map((cat) => {
        const categoryName = cat.name;
        const categorySlug = createCategorySlug(categoryName);
        const categorySubcategories = subcategoriesByCategory[categoryName] || [];
        const isActive = isCategoryActive(categoryName);
        const isDropdownOpen = activeDropdown === categoryName;

        return (
          <div
            key={cat.id || cat._id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(categoryName)}
            onMouseLeave={(e) => handleMouseLeave(categoryName, e)}
          >
            <Link
              to={`/shop/${categorySlug}`}
              className={`category-link px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1 font-bai-jamjuree tracking-wider ${
                isActive
                  ? styles.category.active + ' border-b-2'
                  : styles.category.inactive
              }`}
            >
              {categoryName}
              {categorySubcategories.length > 0 && (
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </Link>

            {categorySubcategories.length > 0 && isDropdownOpen && (
              <div 
                ref={el => dropdownRefs.current[categoryName] = el}
                className={`absolute top-full left-0 mt-2 w-64 border rounded-lg shadow-lg z-50 ${styles.dropdown}`}
                onMouseLeave={handleDropdownMouseLeave}
                style={{ marginTop: '2px', pointerEvents: 'auto' }}
              >
                <div className="p-3">
                  <Link
                    to={`/shop/${categorySlug}`}
                    className={`block px-3 py-2 text-sm hover:bg-opacity-20 rounded-md font-semibold mb-2 border-b ${styles.dropdownSection} transition-colors font-bai-jamjuree tracking-wide ${
                      theme === 'dark' ? 'hover:bg-blue-900 text-white' : 'hover:bg-blue-50 text-gray-900'
                    }`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    View All {categoryName}
                  </Link>
                  
                  <div className="space-y-1 mb-3">
                    <h4 className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider font-bai-jamjuree ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500' }`}>
                      Subcategories
                    </h4>
                    {categorySubcategories.map((subcat) => (
                      <Link
                        key={subcat.id || subcat._id}
                        to={`/shop/${categorySlug}?subcategories=${encodeURIComponent(createSlug(subcat.name))}`}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors duration-200 font-instrument tracking-wide ${styles.dropdownItem}`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {subcat.name}
                      </Link>
                    ))}
                  </div>

                  <div className={`pt-2 border-t ${styles.dropdownSection}`}>
                    <h4 className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider font-bai-jamjuree mb-2 ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500' }`}>
                      Featured
                    </h4>
                    <Link to={`/shop/${categorySlug}?newArrival=true`} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-200 mb-1 font-instrument tracking-wide ${styles.featured.new}`} onClick={() => setActiveDropdown(null)}>
                      <span className={`w-2 h-2 rounded-full ${ theme === 'dark' ? 'bg-green-400' : 'bg-green-500' }`}></span>
                      New Arrivals
                    </Link>
                    <Link to={`/shop/${categorySlug}?bestSeller=true`} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-200 font-instrument tracking-wide ${styles.featured.bestseller}`} onClick={() => setActiveDropdown(null)}>
                      <span className={`w-2 h-2 rounded-full ${ theme === 'dark' ? 'bg-orange-400' : 'bg-orange-500' }`}></span>
                      Best Sellers
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Collections dropdown */}
      <div className="relative group">
        <button className={`px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1 font-bai-jamjuree tracking-wider ${styles.category.inactive}`}>
          Collections
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className={`absolute top-full left-0 mt-2 w-56 border rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${styles.dropdown}`} style={{ marginTop: '2px' }}>
          <div className="p-3 space-y-2">
            <h4 className={`px-2 text-xs font-semibold uppercase tracking-wider font-bai-jamjuree ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500' }`}>Shop By</h4>
            <Link to="/shop?featured=true" className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-200 font-instrument tracking-wide ${styles.featured.featured}`}>Featured Products</Link>
            <Link to="/shop?newArrival=true" className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-200 font-instrument tracking-wide ${styles.featured.new}`}>New Arrivals</Link>
            <Link to="/shop?bestSeller=true" className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-200 font-instrument tracking-wide ${styles.featured.bestseller}`}>Best Sellers</Link>
            <Link to="/shop?inStock=true" className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-200 font-instrument tracking-wide ${styles.featured.instock}`}>In Stock</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNav;