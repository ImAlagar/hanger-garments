// components/HomeComponents/HeroSliderDesktop.jsx
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const HeroSliderDesktop = ({ banners, current, setCurrent }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Pause auto-slide on hover
  useEffect(() => {
    if (isHovered) {
      return () => {}
    }
  }, [isHovered])

  if (!banners || banners.length === 0) return null

  const banner = banners[current]
  const isLeft = banner.layout === "left"

  // Animation variants
  const textVariants = {
    hidden: { opacity: 0, x: isLeft ? -50 : 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: isLeft ? 50 : -50,
      transition: { duration: 0.5 }
    }
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateY: isLeft ? 15 : -15 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      transition: { duration: 1, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 1.1,
      transition: { duration: 0.5 }
    }
  }

  const bgVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.5, ease: "easeInOut" }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.7 }
    }
  }

  const dotVariants = {
    active: { scale: 1.2 },
    inactive: { scale: 1 }
  }

  return (
    <section 
      className="relative min-h-[90vh] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image with Parallax Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          variants={bgVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${banner.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
          }}
        />
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />

      {/* Content Container */}
      <div className="container mx-auto px-4 lg:px-8 xl:px-16 h-full">
        <div className="relative h-[90vh] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              className={`flex items-center justify-between w-full gap-12 ${
                isLeft ? "" : "flex-row-reverse"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Text Content */}
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`flex-1 max-w-2xl z-10 ${
                  isLeft ? "text-left" : "text-right"
                }`}
              >
                {/* Badge */}
                {banner.subtitle && (
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                  >
                    <span className="text-sm font-semibold tracking-widest text-white/90 uppercase">
                      {banner.subtitle}
                    </span>
                  </motion.span>
                )}

                {/* Title */}
                {banner.title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
                  >
                    {banner.title.split(' ').map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="inline-block mr-2"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.h1>
                )}

                {/* Description */}
                {banner.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg lg:text-xl text-gray-200 mb-8 leading-relaxed font-light"
                  >
                    {banner.description}
                  </motion.p>
                )}

                {/* Offer Text */}
                {banner.offerText && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                  >
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg">
                      <span className="text-lg font-bold text-white">
                        {banner.offerText}
                      </span>
                    </span>
                  </motion.div>
                )}

                {/* CTA Button */}
                {banner.buttonText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
                  >
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={banner.buttonLink}
                      className="group relative inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-semibold rounded-lg overflow-hidden"
                    >
                      <span className="relative z-10">{banner.buttonText}</span>
                      <motion.svg
                        className="w-5 h-5 relative z-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ x: 0 }}
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </motion.svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </motion.a>
                  </motion.div>
                )}

                {/* Small Text */}
                {banner.smallText && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-sm text-gray-300 font-light max-w-md"
                  >
                    {banner.smallText}
                  </motion.p>
                )}
              </motion.div>

              {/* Image */}
              {banner.image && (
                <motion.div
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex-1 relative"
                >
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl" />
                    
                    {/* Main Image */}
                    <motion.img
                      src={banner.image}
                      alt={banner.title || "banner"}
                      className="relative rounded-2xl shadow-2xl w-full max-w-2xl mx-auto"
                      style={{
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                      }}
                    />

                    {/* Floating Elements */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">30%</div>
                        <div className="text-xs text-gray-600">OFF</div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {banners.map((_, index) => (
                <motion.button
                  key={index}
                  variants={dotVariants}
                  animate={index === current ? "active" : "inactive"}
                  whileHover={{ scale: 1.3 }}
                  onClick={() => setCurrent(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    index === current 
                      ? "bg-white" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center z-20"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center z-20"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </>
          )}

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-white rounded-full mt-2" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSliderDesktop