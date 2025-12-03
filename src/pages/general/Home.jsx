import React, { useState, useEffect } from "react"
import { Helmet } from "react-helmet"
import { motion, AnimatePresence } from "framer-motion"
import Categories from "../../components/HomeComponents/Categories"
import BestSeller from "../../components/HomeComponents/BestSeller"
import NewArraivals from "../../components/HomeComponents/NewArraivals"
import { useGetActiveSlidersQuery } from "../../redux/services/sliderService"
import FeaturedProducts from "../../components/HomeComponents/FeaturedProducts"
import Collections from "./Collections"

// Fallback banners in case API fails
const fallbackBanners = [
  {
    id: 1,
    bg: "/api/placeholder/1200/800",
    image: "/api/placeholder/600/400",
    subtitle: "Tiruppur Garments",
    title: "Fashion Style",
    description: "Inspired by classic silhouettes and refined detailing, each piece exudes sophistication and grace.",
    smallText: "Discover premium quality and timeless elegance with our latest collection.",
    offerText: "✨ Flat 30% Off on New Arrivals!",
    buttonText: "Buy Now",
    buttonLink: "",
    layout: "left",
  }
]

export default function Home() {
  const { data: apiResponse, isLoading, error } = useGetActiveSlidersQuery()
  const [current, setCurrent] = useState(0)
  const [banners, setBanners] = useState([])

  // Set banners from API or fallback
  useEffect(() => {
    if (apiResponse?.success && apiResponse.data?.length > 0) {
      const apiBanners = apiResponse.data.map(slider => ({
        id: slider.id,
        bg: slider.bgImage,
        image: slider.image,
        subtitle: slider.subtitle,
        title: slider.title,
        description: slider.description,
        smallText: slider.smallText,
        offerText: slider.offerText,
        buttonText: slider.buttonText,
        buttonLink: slider.buttonLink,
        layout: slider.layout || "left",
      }))
      setBanners(apiBanners)
    } else {
      setBanners(fallbackBanners)
    }
  }, [apiResponse])

  // Get current banner for meta tags
  const currentBanner = banners[current] || banners[0] || fallbackBanners[0]

  // Auto-slide effect
  useEffect(() => {
    if (banners.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 6000)
    
    return () => clearInterval(interval)
  }, [banners.length])

  // Loading state
  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Fashion Store</title>
          <meta name="description" content="Discover amazing fashion collections and latest trends" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading amazing fashion...</p>
          </motion.div>
        </div>
      </>
    )
  }

  // Error state
  if (error && banners.length === 0) {
    return (
      <>
        <Helmet>
          <title>Fashion Store | Online Shopping</title>
          <meta name="description" content="Discover fashion collections, best sellers and new arrivals" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-red-600"
          >
            <p>Failed to load banners. Showing limited content.</p>
          </motion.div>
        </div>
      </>
    )
  }

  if (banners.length === 0) {
    return null
  }

  const banner = banners[current]
  const isLeft = banner.layout === "left"

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const bgVariants = {
    enter: { opacity: 0, scale: 1.1 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }

  return (
    <>
      <Helmet>
        <title>{currentBanner.title ? `${currentBanner.title} | Fashion Store` : "Fashion Store | Premium Clothing"}</title>
        <meta 
          name="description" 
          content={currentBanner.description || "Discover premium quality fashion, latest trends, and exclusive collections. Shop now for the best prices!"} 
        />
        <meta name="keywords" content="fashion, clothing, style, trendy, premium, shopping, online store" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:title" content={currentBanner.title || "Fashion Store | Premium Clothing"} />
        <meta property="og:description" content={currentBanner.description || "Discover premium quality fashion and latest trends"} />
        <meta property="og:image" content={currentBanner.image || currentBanner.bg} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={currentBanner.title || "Fashion Store | Premium Clothing"} />
        <meta property="twitter:description" content={currentBanner.description || "Discover premium quality fashion and latest trends"} />
        <meta property="twitter:image" content={currentBanner.image || currentBanner.bg} />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Banner Section */}
        <section className="relative h-[85vh] min-h-[600px] lg:h-[90vh] px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden font-instrument">
          {/* Animated Background */}
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              variants={bgVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${banner.bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </AnimatePresence>

          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="absolute inset-0 bg-black/60"
          />

          {/* Content Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="relative z-10 w-full max-w-7xl mx-auto py-8 lg:py-12"
            >
              <div className={`flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 ${
                isLeft ? "" : "lg:flex-row-reverse"
              }`}>
                {/* Text Content */}
                <motion.div
                  variants={containerVariants}
                  className={`flex-1 text-white ${
                    isLeft
                      ? "text-center lg:text-left lg:pl-4"
                      : "text-center lg:text-right lg:pr-4"
                  }`}
                >
                  {/* Subtitle */}
                  {banner.subtitle && (
                    <motion.h2
                      variants={itemVariants}
                      style={{ letterSpacing: "6px" }}
                      className="text-sm md:text-base uppercase font-italiana font-semibold tracking-widest text-gray-300 mb-4"
                    >
                      {banner.subtitle}
                    </motion.h2>
                  )}

                  {/* Title */}
                  {banner.title && (
                    <motion.h1
                      variants={itemVariants}
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-wide font-bold font-italiana leading-tight mb-6"
                    >
                      {banner.title}
                    </motion.h1>
                  )}

                  {/* Description */}
                  {banner.description && (
                    <motion.p
                      variants={itemVariants}
                      className={`text-gray-200 text-base sm:text-lg leading-relaxed tracking-wide font-instrument max-w-xl mb-6 ${
                        isLeft ? "mx-auto lg:mx-0" : "mx-auto lg:mx-auto"
                      }`}
                    >
                      {banner.description}
                    </motion.p>
                  )}

                  {/* Offer */}
                  {banner.offerText && (
                    <motion.p
                      variants={itemVariants}
                      className="text-yellow-400 leading-relaxed tracking-wide font-semibold text-lg sm:text-xl mb-6"
                    >
                      {banner.offerText}
                    </motion.p>
                  )}

                  {/* Button + Small Text */}
                  <motion.div
                    variants={itemVariants}
                    className={`flex flex-col items-center gap-4 ${
                      isLeft ? "lg:items-start" : "lg:items-end"
                    }`}
                  >
                    {banner.buttonText && (
                      <motion.a
                        whileHover={{ 
                          scale: 1.05,
                          backgroundColor: "#f3f4f6",
                          color: "#000"
                        }}
                        whileTap={{ scale: 0.95 }}
                        href={banner.buttonLink}
                        className="border border-white px-8 py-4 text-center font-medium tracking-wider whitespace-nowrap uppercase transition-all duration-300 hover:shadow-lg text-base"
                      >
                        {banner.buttonText}
                      </motion.a>
                    )}
                    {banner.smallText && (
                      <motion.p 
                        variants={itemVariants}
                        className="text-sm text-gray-300 font-instrument tracking-wide max-w-md mt-2"
                      >
                        {banner.smallText}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>

                {/* Image */}
                {banner.image && (
                  <motion.div
                    variants={imageVariants}
                    className="flex-1 flex justify-center w-full max-w-md lg:max-w-2xl"
                  >
                    <motion.img
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      src={banner.image}
                      alt={banner.title || "banner"}
                      className="rounded-xl lg:rounded-2xl shadow-2xl object-cover w-96 h-96 sm:h-20 md:h-96"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-6 lg:bottom-8 w-full flex justify-center gap-3 z-20"
            >
              {banners.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrent(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === current 
                      ? "bg-white scale-125" 
                      : "bg-gray-500 hover:bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </motion.div>
          )}
        </section>

        {/* Categories Section */}
        <section className="px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Categories />
          </motion.div>
        </section>

                {/* Featured Products Section */}
        <section className="px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Collections />
          </motion.div>
        </section>

        {/* Featured Products Section */}
        <section className="px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <FeaturedProducts />
          </motion.div>
        </section>

        {/* Best Seller Section */}
        <section className="px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <BestSeller />
          </motion.div>
        </section>

        {/* New Arrivals Section */}
        <section className=" px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <NewArraivals />
          </motion.div>
        </section>
      </div>
    </>
  )
}