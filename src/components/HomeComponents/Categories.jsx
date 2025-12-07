import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { useGetAllCategoriesQuery } from "../../redux/services/categoryService";

export default function Categories() {
    const { theme } = useTheme();
    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch categories from API
    const { data: categoriesData, error, isLoading: apiLoading } = useGetAllCategoriesQuery();

    // Animation variants for each card
    const cardAnim = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
        }),
    };

    // Generate shop URL based on category
const getShopUrl = (categoryName) => {
    // Convert category name to lowercase and replace spaces with hyphens
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
    return `/shop/${categorySlug}`; // Remove ?category= and make it a route parameter
};

    // Process API data to create categories array
    useEffect(() => {
        if (categoriesData?.data?.categories) {
            const apiCategories = categoriesData.data.categories;
            
            // Filter only active categories
            const activeCategories = apiCategories.filter(cat => cat.isActive);
            
            // Map API categories to our required format
            const mappedCategories = activeCategories.slice(0, 5).map((category, index) => {
                // Generate title based on product count
                const productCount = category._count?.products || 0;
                const title = productCount > 0 ? 
                    `${productCount}+ ${category.name} Available` : 
                    `Explore ${category.name}`;
                
                // Generate tag based on category name and product count
                const tag = productCount > 0 ? 
                    `${productCount} Items` : 
                    'Coming Soon';
                
                return {
                    id: category.id,
                    title: title,
                    catName: category.name,
                    description: category.description,
                    image: category.image,
                    tag: tag,
                    productCount: productCount,
                    subcategoryCount: category._count?.subcategories || 0,
                    // Make the middle card (index 2) tall
                    tall: index === 2
                };
            });

            setDynamicCategories(mappedCategories);
            setIsLoading(false);
        } else if (!apiLoading && error) {
            // Handle API error
            console.error("Failed to fetch categories:", error);
            setIsLoading(false);
        }
    }, [categoriesData, apiLoading, error]);

    if (isLoading) {
        return (
            <section className={`px-6 md:px-12 lg:px-20 py-16 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
                <div className="text-center mb-12">
                    <h2 className={`text-4xl md:text-5xl font-bold font-italiana uppercase tracking-wide ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Shop by Category
                    </h2>
                    <p className={`font-instrument mt-3 text-sm md:text-base ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Loading categories...
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Loading skeleton */}
                    {[...Array(5)].map((_, index) => (
                        <div 
                            key={index} 
                            className={`rounded-2xl animate-pulse ${
                                index === 2 ? 'h-[820px]' : 'h-[400px]'
                            } ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (dynamicCategories.length === 0) {
        return (
            <section className={`px-6 md:px-12 lg:px-20 py-16 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
                <div className="text-center mb-12">
                    <h2 className={`text-4xl md:text-5xl font-bold font-italiana uppercase tracking-wide ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Shop by Category
                    </h2>
                    <p className={`font-instrument mt-3 text-sm md:text-base ${theme === "dark" ? "text-white" : "text-black"}`}>
                        No categories available at the moment
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className={`px-6 md:px-12 lg:px-20 py-16 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
            {/* Section Heading */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
            >
                <h2 className={`text-4xl md:text-5xl font-bold font-italiana uppercase tracking-wide ${theme === "dark" ? "text-white" : "text-black"}`}>
                    Shop by Category
                </h2>
                <p className={`font-instrument mt-3 text-sm md:text-base ${theme === "dark" ? "text-white" : "text-black"}`}>
                    Discover styles that fit your vibe — explore our latest collections
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT SIDE - First 2 categories */}
                <div className="flex flex-col gap-6">
                    {dynamicCategories.slice(0, 2).map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            custom={i}
                            variants={cardAnim}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="relative group overflow-hidden rounded-2xl h-[400px]"
                        >
                            <img
                                src={cat.image}
                                alt={cat.catName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x400?text=Category+Image';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-500"></div>

                            {/* Overlay Text */}
                            <div className="absolute inset-0 flex flex-col justify-center px-8">
                                <h4 className="text-sm uppercase text-gray-200 tracking-[4px]">
                                    {cat.tag}
                                </h4>
                                <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight group-hover:text-yellow-300 transition">
                                    {cat.catName}
                                </h3>
                                <h2 className="text-white italic text-3xl font-bold mt-2 leading-tight group-hover:text-yellow-300 transition">
                                    {cat.title}
                                </h2>
                                {cat.description && (
                                    <p className="text-gray-300 mt-2 text-sm line-clamp-2">
                                        {cat.description}
                                    </p>
                                )}
                                <Link 
                                    to={getShopUrl(cat.catName)} 
                                    className="mt-4 w-fit px-6 py-2 border border-white text-white uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-all duration-500"
                                >
                                    Explore
                                </Link>
                            </div>

                            {/* Category Name Label (Bottom Overlay) */}
                            <motion.div
                                initial={{ width: 0 }}
                                whileHover={{ width: "100%" }}
                                transition={{ duration: 0.5 }}
                                className="absolute bottom-0 left-0 h-[3px] bg-yellow-400"
                            ></motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* MIDDLE - Third category (tall) */}
                {dynamicCategories[2] && (
                    <motion.div
                        custom={2}
                        variants={cardAnim}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="relative group overflow-hidden rounded-2xl h-[820px]"
                    >
                        <img
                            src={dynamicCategories[2].image}
                            alt={dynamicCategories[2].catName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x820?text=Category+Image';
                            }}
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/60 transition-all duration-500"></div>
                        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center text-center px-4">
                            <h4 className="text-sm text-gray-200 uppercase tracking-[3px]">
                                {dynamicCategories[2].tag}
                            </h4>
                            <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight group-hover:text-yellow-300 transition">
                                {dynamicCategories[2].catName}
                            </h3>
                            <h2 className="text-white text-3xl font-bold uppercase font-bai-jamjuree italic mt-2 group-hover:text-yellow-300 transition">
                                {dynamicCategories[2].title}
                            </h2>
                            {dynamicCategories[2].description && (
                                <p className="text-gray-300 mt-4 text-base max-w-md">
                                    {dynamicCategories[2].description}
                                </p>
                            )}
                            {dynamicCategories[2].subcategoryCount > 0 && (
                                <p className="text-gray-300 mt-2 text-sm">
                                    {dynamicCategories[2].subcategoryCount} subcategories available
                                </p>
                            )}
                            <Link 
                                to={getShopUrl(dynamicCategories[2].catName)}
                                className="mt-4 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-500"
                            >
                                Explore Now
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* RIGHT SIDE - Last 2 categories */}
                <div className="flex flex-col gap-6">
                    {dynamicCategories.slice(3, 5).map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            custom={i + 3}
                            variants={cardAnim}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="relative group overflow-hidden rounded-2xl h-[400px]"
                        >
                            <img
                                src={cat.image}
                                alt={cat.catName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x400?text=Category+Image';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all duration-500"></div>

                            {/* Overlay Text */}
                            <div className="absolute top-10 left-10">
                                <h4 className="text-sm uppercase text-gray-200 tracking-[3px]">
                                    {cat.tag}
                                </h4>
                                <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight group-hover:text-yellow-300 transition">
                                    {cat.catName}
                                </h3>
                                <h2 className="text-white text-3xl font-bold mt-3 italic group-hover:text-yellow-300 transition">
                                    {cat.title}
                                </h2>
                                {cat.description && (
                                    <p className="text-gray-300 mt-2 text-sm max-w-xs line-clamp-2">
                                        {cat.description}
                                    </p>
                                )}
                                <Link to={getShopUrl(cat.catName)}>
                                    <button className="mt-6 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-500">
                                        Explore
                                    </button>
                                </Link>
                            </div>

                            {/* Category Label Animation */}
                            <motion.div
                                initial={{ width: 0 }}
                                whileHover={{ width: "100%" }}
                                transition={{ duration: 0.5 }}
                                className="absolute bottom-0 left-0 h-[3px] bg-yellow-400"
                            ></motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Show "View All Categories" button if we have more than 5 categories */}
            {categoriesData?.data?.categories?.filter(cat => cat.isActive).length > 5 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-3 border-2 border-black text-black font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-300 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                    >
                        <span>View All Categories</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </motion.div>
            )}
        </section>
    );
}