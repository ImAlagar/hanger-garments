import React from "react";
import { motion } from "framer-motion";
import tshirt from "../../assets/categories/tshirt.webp";
import oversized from "../../assets/categories/oversized.webp";
import polo from "../../assets/categories/polo.webp";
import hoodie from "../../assets/categories/hoodie.webp";
import acidwash from "../../assets/categories/acidwash.webp";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";

export default function Categories() {
    const {theme , toggleTheme} = useTheme();

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

    const categories = [
        { id: 1, title: "Flat 40% Off Everything", catName: "T-Shirt", img: tshirt, tag: "Shop & Save" },
        { id: 2, title: "Street Inspiration", catName: "Oversized", img: oversized, tag: "New Arrivals" },
        { id: 3, title: "Smart Style", catName: "Polos", img: polo, tag: "Weekly Edit", tall: true },
        { id: 4, title: "Top Brands", catName: "Hoodies", img: hoodie, tag: "Our Offers" },
        { id: 5, title: "Retro Denim Vibes", catName: "Acid Wash", img: acidwash, tag: "Trending" },
    ];

    return (
        <section className={` px-6 md:px-12 lg:px-20 py-16 ${theme === "dark" ? "bg-black" :"bg-white"}`}>
            {/* Section Heading */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
            >
                <h2 className={`text-4xl md:text-5xl font-bold font-italiana uppercase tracking-wide text-gray-800 ${theme === "dark" ? "text-white" :"text-black"} `}>
                    Shop by Category
                </h2>
                <p className={`text-gray-900 font-instrument mt-3 text-sm md:text-base ${theme === "dark" ? "text-white" :"text-black"}`}>
                    Discover styles that fit your vibe — explore our latest collections
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT SIDE */}
                <div className="flex flex-col gap-6">
                    {categories.slice(0, 2).map((cat, i) => (
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
                                <Link to={'/shop'} className="mt-4 w-fit px-6 py-2 border border-white text-white uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-all duration-500">
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
                <motion.div
                    custom={2}
                    variants={cardAnim}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="relative group overflow-hidden rounded-2xl h-[820px]"
                >
                    <img
                        src={categories[2].img}
                        alt={categories[2].title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/60 transition-all duration-500"></div>
                    <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center text-center">
                        <h4 className="text-sm text-gray-200 uppercase tracking-[3px]">
                            {categories[2].tag}
                        </h4>
                        <h3 className="text-white italic text-3xl font-bold mt-2 leading-tight group-hover:text-yellow-300 transition">
                            {categories[2].catName}
                        </h3>
                        <h2 className="text-white text-3xl font-bold uppercase font-bai-jamjuree italic mt-2 group-hover:text-yellow-300 transition">
                            {categories[2].title}
                        </h2>
                        <Link to={'/shop'}className="mt-4 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-500">
                            Explore Now
                        </Link>
                    </div>
                </motion.div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col gap-6">
                    {categories.slice(3).map((cat, i) => (
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
                                <button className="mt-6 px-6 py-2 border border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-500">
                                    Explore
                                </button>
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
