// components/HomeComponents/HeroSliderMobile.jsx
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const HeroSliderMobile = ({ banners, current, setCurrent }) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [direction, setDirection] = useState(0)
  const progressBarRef = useRef(null)
  
  // Minimum swipe distance
  const minSwipeDistance = 50

  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % banners.length)
    }
    if (isRightSwipe) {
      setDirection(-1)
      setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
    }
  }

  const handleNext = () => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % banners.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }

  // Auto-slide effect for mobile
  useEffect(() => {
    if (banners.length <= 1) return
    
    const interval = setInterval(() => {
      handleNext()
    }, 6000)
    
    return () => clearInterval(interval)
  }, [banners.length])

  if (!banners || banners.length === 0) return null

  const banner = banners[current]

  // Animation variants
  const slideVariants = {
    enter: () => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: () => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    })
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 0.2 }
    }
  }

  const dotVariants = {
    active: { scale: 1.3, backgroundColor: "#ffffff" },
    inactive: { scale: 1, backgroundColor: "rgba(255, 255, 255, 0.4)" }
  }

  return (
    <section 
      className="relative min-h-[100vh] w-full overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with Parallax */}
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${banner.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "scroll",
          }}
        />
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

      {/* Content Container */}
      <div className="relative h-[100vh] flex flex-col px-5 safe-area-padding">
        {/* Progress Bar */}
        {banners.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800/50 z-30 overflow-hidden">
            <motion.div
              key={banner.id}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 6, ease: "linear" }}
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
              onAnimationComplete={handleNext}
            />
          </div>
        )}

        {/* Top Navigation */}
        <div className="pt-12 pb-4 z-20">
          {/* Badge */}
          {banner.subtitle && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-md rounded-full border border-white/25 shadow-lg">
                <span className="text-xs font-bold tracking-widest text-white uppercase">
                  {banner.subtitle}
                </span>
              </span>
            </motion.div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center z-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={banner.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full max-w-sm mx-auto text-center"
            >
              {/* Image */}
              {banner.image && (
                <motion.div
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-8 relative"
                >
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl rounded-full" />
                    
                    {/* Image Container with Border */}
                    <div className="relative bg-gradient-to-br from-white/10 to-transparent p-1 rounded-2xl backdrop-blur-sm">
                      <motion.img
                        src={banner.image}
                        alt={banner.title || "banner"}
                        className="w-full h-auto rounded-2xl shadow-2xl"
                        loading="eager"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>

                    {/* Floating Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-xl"
                    >
                      <div className="text-xs font-bold">HOT</div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Title */}
              {banner.title && (
                <motion.h1
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-3xl font-bold text-white mb-4 leading-tight px-2"
                >
                  {banner.title}
                </motion.h1>
              )}

              {/* Offer Text */}
              {banner.offerText && (
                <motion.div
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-xl">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {banner.offerText}
                    </span>
                  </span>
                </motion.div>
              )}

              {/* Description */}
              {banner.description && (
                <motion.p
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-200 mb-8 leading-relaxed px-3 line-clamp-3"
                >
                  {banner.description}
                </motion.p>
              )}

              {/* CTA Button */}
              {banner.buttonText && (
                <motion.div
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={banner.buttonLink}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-bold rounded-xl shadow-2xl active:shadow-lg transition-shadow"
                  >
                    <span>{banner.buttonText}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.a>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Area */}
        <div className="pb-8 pt-4 z-20">
          {/* Navigation Dots */}
          {banners.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-3 mb-6"
            >
              {banners.map((_, index) => (
                <motion.button
                  key={index}
                  variants={dotVariants}
                  animate={index === current ? "active" : "inactive"}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setDirection(index > current ? 1 : -1)
                    setCurrent(index)
                  }}
                  className="w-3 h-3 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </motion.div>
          )}

          {/* Swipe Instruction & Small Text */}
          <div className="text-center space-y-2">
            {/* Small Text */}
            {banner.smallText && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-gray-300/80 px-4 leading-relaxed"
              >
                {banner.smallText}
              </motion.p>
            )}

            {/* Swipe Instruction */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 text-xs text-white/60"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
              <span>Swipe to explore</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Touch Navigation Arrows (for visual feedback) */}
      {banners.length > 1 && (
        <>
          {/* Left Touch Area */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/4 z-10 cursor-pointer"
            onClick={handlePrev}
            aria-label="Previous slide"
          />
          
          {/* Right Touch Area */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/4 z-10 cursor-pointer"
            onClick={handleNext}
            aria-label="Next slide"
          />
        </>
      )}
    </section>
  )
}

export default HeroSliderMobile