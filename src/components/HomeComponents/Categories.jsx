import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import tshirt from "../../assets/categories/tshirt.webp";
import oversized from "../../assets/categories/oversized.webp";
import polo from "../../assets/categories/polo.webp";
import hoodie from "../../assets/categories/hoodie.webp";
import acidwash from "../../assets/categories/acidwash.webp";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { useGetAllSubcategoriesQuery } from "../../redux/services/subcategoryService";

export default function Categories() {
    const { theme } = useTheme();
    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch subcategories from API
    const { data: subcategoriesData, error, isLoading: apiLoading } = useGetAllSubcategoriesQuery();

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

    // Default categories as fallback
    const defaultCategories = [
        { 
            id: 1, 
            title: "Flat 40% Off Everything", 
            catName: "T-Shirt", 
            subcategory: "T-Shirts",
            category: "men",
            img: tshirt, 
            tag: "Shop & Save" 
        },
        { 
            id: 2, 
            title: "Street Inspiration", 
            catName: "Oversized", 
            subcategory: "Mens Oversized",
            category: "men",
            img: oversized, 
            tag: "New Arrivals" 
        },
        { 
            id: 3, 
            title: "Smart Style", 
            catName: "Polos", 
            subcategory: "Polo T-Shirts",
            category: "men",
            img: polo, 
            tag: "Weekly Edit", 
            tall: true 
        },
        { 
            id: 4, 
            title: "Top Brands", 
            catName: "Hoodies", 
            subcategory: "Hoodies",
            category: "men",
            img: hoodie, 
            tag: "Our Offers" 
        },
        { 
            id: 5, 
            title: "Retro Denim Vibes", 
            catName: "Acid Wash", 
            subcategory: "Acid Wash",
            category: "men",
            img: acidwash, 
            tag: "Trending" 
        },
    ];

    // Map API subcategories to our category format
    useEffect(() => {
        if (subcategoriesData?.data?.subcategories) {
            const apiSubcategories = subcategoriesData.data.subcategories;
            
            // Take first 5 subcategories from API or use default if not enough
            const mappedCategories = apiSubcategories.slice(0, 5).map((subcat, index) => {
                // Use default category as template and override with API data
                const defaultCat = defaultCategories[index] || defaultCategories[0];
                
                // Determine category based on subcategory name
                const category = getCategoryFromSubcategory(subcat.name);
                
                return {
                    id: subcat._id || subcat.id || defaultCat.id,
                    title: getCategoryTitle(subcat.name),
                    catName: subcat.name,
                    subcategory: subcat.name,
                    category: category,
                    img: getCategoryImage(subcat.name, index),
                    tag: getCategoryTag(subcat.name),
                    tall: index === 2
                };
            });

            // If API returns fewer than 5, fill with defaults
            if (mappedCategories.length < 5) {
                const remaining = defaultCategories.slice(mappedCategories.length);
                setDynamicCategories([...mappedCategories, ...remaining]);
            } else {
                setDynamicCategories(mappedCategories);
            }
            
            setIsLoading(false);
        } else if (!apiLoading) {
            // If API fails or no data, use default categories
            setDynamicCategories(defaultCategories);
            setIsLoading(false);
        }
    }, [subcategoriesData, apiLoading]);

    // Helper function to determine category from subcategory name
    const getCategoryFromSubcategory = (subcategoryName) => {
        const categoryMap = {
            // Men's categories
            'T-Shirts': 'men',
            'Mens T-Shirts': 'men',
            'Oversized T-Shirts': 'men',
            'Mens Oversized': 'men',
            'Polo T-Shirts': 'men',
            'Hoodies': 'men',
            'Acid Wash': 'men',
            'Casual Shirts': 'men',
            'Formal Shirts': 'men',
            
            // Women's categories
            'Womens T-Shirts': 'women',
            'Womens Oversized': 'women',
            'Womens Polo': 'women',
            'Womens Hoodies': 'women',
            'Womens Casual Shirts': 'women',
            'Womens Formal Shirts': 'women',
            'Dresses': 'women',
            
            // Kids categories
            'Kids T-Shirts': 'kids',
            'Boys T-Shirts': 'kids',
            'Girls T-Shirts': 'kids'
        };
        
        return categoryMap[subcategoryName] || 'men';
    };

    // Helper function to get appropriate title based on subcategory name
    const getCategoryTitle = (subcategoryName) => {
        const titleMap = {
            'T-Shirts': 'Flat 40% Off Everything',
            'Mens T-Shirts': 'Classic Collection',
            'Oversized T-Shirts': 'Street Inspiration',
            'Mens Oversized': 'Street Inspiration',
            'Polo T-Shirts': 'Smart Style',
            'Hoodies': 'Top Brands',
            'Acid Wash': 'Retro Denim Vibes',
            'Womens T-Shirts': 'Feminine Styles',
            'Womens Oversized': 'Comfy & Chic',
            'Womens Polo': 'Elegant Sportswear',
            'Womens Hoodies': 'Cozy Collection',
            'Womens Casual Shirts': 'Casual Elegance',
            'Womens Formal Shirts': 'Office Ready',
            'Kids T-Shirts': 'Fun Collection'
        };
        
        return titleMap[subcategoryName] || 'Explore Collection';
    };

    // Helper function to get appropriate tag based on subcategory name
    const getCategoryTag = (subcategoryName) => {
        const tagMap = {
            'T-Shirts': 'Shop & Save',
            'Mens T-Shirts': 'Popular',
            'Oversized T-Shirts': 'New Arrivals',
            'Mens Oversized': 'New Arrivals',
            'Polo T-Shirts': 'Weekly Edit',
            'Hoodies': 'Our Offers',
            'Acid Wash': 'Trending',
            'Womens T-Shirts': 'Featured',
            'Womens Oversized': 'Hot Trend',
            'Womens Polo': 'Style Pick',
            'Womens Hoodies': 'Winter Special',
            'Womens Casual Shirts': 'Casual Wear',
            'Womens Formal Shirts': 'Professional',
            'Kids T-Shirts': 'Family Favorite'
        };
        
        return tagMap[subcategoryName] || 'Featured';
    };

    // Helper function to get appropriate image based on subcategory name
    const getCategoryImage = (subcategoryName, index) => {
        const imageMap = {
            'T-Shirts': tshirt,
            'Mens T-Shirts': tshirt,
            'Oversized T-Shirts': oversized,
            'Mens Oversized': oversized,
            'Polo T-Shirts': polo,
            'Hoodies': hoodie,
            'Acid Wash': acidwash,
            'Womens T-Shirts': tshirt,
            'Womens Oversized': oversized,
            'Womens Polo': polo,
            'Womens Hoodies': hoodie,
            'Womens Casual Shirts': tshirt,
            'Womens Formal Shirts': tshirt,
            'Kids T-Shirts': tshirt
        };
        
        return imageMap[subcategoryName] || defaultCategories[index]?.img || tshirt;
    };

    // Fixed function to generate shop URL without double encoding
    const getShopUrl = (category, subcategory) => {
        // Convert spaces to hyphens and make lowercase for clean URLs
        const cleanSubcategory = subcategory.toLowerCase().replace(/\s+/g, '-');
        return `/shop?subcategories=${cleanSubcategory}`;
    };

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
                {/* LEFT SIDE */}
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
                                src={cat.img}
                                alt={cat.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                                <Link 
                                    to={getShopUrl(cat.category, cat.subcategory)} 
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

                {/* MIDDLE */}
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
                            src={dynamicCategories[2].img}
                            alt={dynamicCategories[2].title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/60 transition-all duration-500"></div>
                        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center text-center">
                            <h4 className="text-sm text-gray-200 uppercase tracking-[3px]">
                                {dynamicCategories[2].tag}
                            </h4>
                            <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight group-hover:text-yellow-300 transition">
                                {dynamicCategories[2].catName}
                            </h3>
                            <h2 className="text-white text-3xl font-bold uppercase font-bai-jamjuree italic mt-2 group-hover:text-yellow-300 transition">
                                {dynamicCategories[2].title}
                            </h2>
                            <Link 
                                to={getShopUrl(dynamicCategories[2].category, dynamicCategories[2].subcategory)}
                                className="mt-4 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-500"
                            >
                                Explore Now
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* RIGHT SIDE */}
                <div className="flex flex-col gap-6">
                    {dynamicCategories.slice(3).map((cat, i) => (
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
                                src={cat.img}
                                alt={cat.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                                <Link to={getShopUrl(cat.category, cat.subcategory)}>
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
        </section>
    );
}