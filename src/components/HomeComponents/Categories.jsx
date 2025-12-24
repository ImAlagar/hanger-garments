import React, { useState, useEffect, useMemo } from "react";
import hoodie from "../../assets/subcategories/hoodie.jpg";
import WomenOversized from "../../assets/subcategories/WomenOversized.jpg";
import polo from "../../assets/subcategories/Polo.jpg";
import HalfSleeves from "../../assets/subcategories/HalfSleeves.jpg";
import Oversized from "../../assets/subcategories/Oversized.jpg";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { useGetAllSubcategoriesQuery } from "../../redux/services/subcategoryService";

export default function Categories() {
    const { theme } = useTheme();
    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch subcategories from API
    const { data: subcategoriesData, error, isLoading: apiLoading } = useGetAllSubcategoriesQuery();

    // Default categories as fallback
    const defaultCategories = useMemo(() => [
        { 
            id: 1, 
            title: "Flat 40% Off Everything", 
            catName: "T-Shirt", 
            subcategory: "T-Shirts",
            category: "men",
            img: hoodie, 
            tag: "Shop & Save" 
        },
        { 
            id: 2, 
            title: "Street Inspiration", 
            catName: "Oversized", 
            subcategory: "Mens Oversized",
            category: "men",
            img: Oversized, 
            tag: "New Arrivals" 
        },
        { 
            id: 3, 
            title: "Smart Style", 
            catName: "Polos", 
            subcategory: "Polo",
            category: "men",
            img: polo, 
            tag: "Weekly Edit", 
            tall: true 
        },
        { 
            id: 4, 
            title: "Top Brands", 
            catName: "Women Oversized", 
            subcategory: "Womens Oversized",
            category: "women",
            img: WomenOversized, 
            tag: "Our Offers" 
        },
        { 
            id: 5, 
            title: "Retro Denim Vibes", 
            catName: "Half Sleeves", 
            subcategory: "Half Sleeves",
            category: "men",
            img: HalfSleeves, 
            tag: "Trending" 
        },
    ], []);

    // Map API subcategories to our category format
    useEffect(() => {
        if (subcategoriesData?.data?.subcategories) {
            const apiSubcategories = subcategoriesData.data.subcategories;
            
            // Take first 5 subcategories from API or use default if not enough
            const mappedCategories = apiSubcategories.slice(0, 5).map((subcat, index) => {
                // Use default category as template and override with API data
                const defaultCat = defaultCategories[index] || defaultCategories[0];
                
                return {
                    id: subcat._id || subcat.id || defaultCat.id,
                    title: defaultCat.title,
                    catName: subcat.name,
                    subcategory: subcat.name,
                    category: defaultCat.category,
                    img: defaultCat.img,
                    tag: defaultCat.tag,
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
    }, [subcategoriesData, apiLoading, defaultCategories]);

    // Fixed function to generate shop URL
    const getShopUrl = (category, subcategory) => {
        const cleanSubcategory = subcategory.toLowerCase().replace(/\s+/g, '-');
        return `/shop/${category}?subcategories=${cleanSubcategory}`;
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
            <div className="text-center mb-12">
                <h2 className={`text-4xl md:text-5xl font-bold font-italiana uppercase tracking-wide ${theme === "dark" ? "text-white" : "text-black"}`}>
                    Shop by Category
                </h2>
                <p className={`font-instrument mt-3 text-sm md:text-base ${theme === "dark" ? "text-white" : "text-black"}`}>
                    Discover styles that fit your vibe — explore our latest collections
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT SIDE */}
                <div className="flex flex-col gap-6">
                    {/* Hoodie Card */}
                    {dynamicCategories[0] && (
                        <div className="relative group overflow-hidden rounded-2xl h-[400px]">
                            <img
                                src={dynamicCategories[0].img}
                                alt={dynamicCategories[0].title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20"></div>

                            <div className="absolute top-10 left-10">
                                <h4 className="text-sm uppercase text-gray-200 tracking-[3px]">
                                    {dynamicCategories[0].tag}
                                </h4>
                                <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight">
                                    HOODIE
                                </h3>
                                <h2 className="text-white text-3xl font-bold mt-3 italic">
                                    {dynamicCategories[0].title}
                                </h2>
                                <Link to={'/shop/men?subcategories=hoodie'}>
                                    <button className="mt-6 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300">
                                        Explore
                                    </button>
                                </Link>
                            </div>

                            <div className="absolute bottom-0 left-0 h-[3px] bg-yellow-400"></div>
                        </div>
                    )}
                    
                    {/* Oversized Card */}
                    {dynamicCategories[1] && (
                        <div className="relative group overflow-hidden rounded-2xl h-[400px]">
                            <img
                                src={dynamicCategories[1].img}
                                alt={dynamicCategories[1].title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20"></div>

                            <div className="absolute top-10 left-10">
                                <h4 className="text-sm uppercase text-gray-200 tracking-[3px]">
                                    {dynamicCategories[1].tag}
                                </h4>
                                <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight">
                                    OVERSIZED 240 GSM
                                </h3>
                                <h2 className="text-white text-3xl font-bold mt-3 italic">
                                    {dynamicCategories[1].title}
                                </h2>
                                <Link to={'/shop/men?subcategories=oversized-240-gsm'}>
                                    <button className="mt-6 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300">
                                        Explore
                                    </button>
                                </Link>
                            </div>

                            <div className="absolute bottom-0 left-0 h-[3px] bg-yellow-400"></div>
                        </div>
                    )}
                </div>

                {/* MIDDLE - Tall Card */}
                {dynamicCategories[2] && (
                    <div className="relative overflow-hidden rounded-2xl h-[820px]">
                        <img
                            src={dynamicCategories[2].img}
                            alt={dynamicCategories[2].title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center text-center">
                            <h4 className="text-sm text-gray-200 uppercase tracking-[3px]">
                                {dynamicCategories[2].tag}
                            </h4>
                            <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight">
                                POLO
                            </h3>
                            <h2 className="text-white text-3xl font-bold uppercase font-bai-jamjuree italic mt-2">
                                {dynamicCategories[2].title}
                            </h2>
                            <Link 
                                to={'/shop/men?subcategories=polo'}
                                className="mt-4 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300"
                            >
                                Explore Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* RIGHT SIDE */}
                <div className="flex flex-col gap-6">
                    {/* Women Oversized Card */}
                    {dynamicCategories[3] && (
                        <div className="relative group overflow-hidden rounded-2xl h-[400px]">
                            <img
                                src={dynamicCategories[3].img}
                                alt={dynamicCategories[3].title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20"></div>

                            <div className="absolute top-10 left-10">
                                <h4 className="text-sm uppercase text-gray-200 tracking-[3px]">
                                    {dynamicCategories[3].tag}
                                </h4>
                                <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight">
                                    WOMENS OVERSIZED T-SHIRTS
                                </h3>
                                <h2 className="text-white text-3xl font-bold mt-3 italic">
                                    {dynamicCategories[3].title}
                                </h2>
                                <Link to={'/shop/women?subcategories=oversized-t-shirt'}>
                                    <button className="mt-6 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300">
                                        Explore
                                    </button>
                                </Link>
                            </div>

                            <div className="absolute bottom-0 left-0 h-[3px] bg-yellow-400"></div>
                        </div>
                    )}
                    
                    {/* Half Sleeves Card */}
                    {dynamicCategories[4] && (
                        <div className="relative group overflow-hidden rounded-2xl h-[400px]">
                            <img
                                src={dynamicCategories[4].img}
                                alt={dynamicCategories[4].title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20"></div>

                            <div className="absolute top-10 left-10">
                                <h4 className="text-sm uppercase text-gray-200 tracking-[3px]">
                                    {dynamicCategories[4].tag}
                                </h4>
                                <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight">
                                    HALF SLEEVES 180 GSM
                                </h3>
                                <h2 className="text-white text-3xl font-bold mt-3 italic">
                                    {dynamicCategories[4].title}
                                </h2>
                                <Link to={'/shop/men?subcategories=half-sleeves-180-gsm'}>
                                    <button className="mt-6 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300">
                                        Explore
                                    </button>
                                </Link>
                            </div>

                            <div className="absolute bottom-0 left-0 h-[3px] bg-yellow-400"></div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}