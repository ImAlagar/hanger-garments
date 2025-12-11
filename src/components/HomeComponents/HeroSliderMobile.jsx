// components/HomeComponents/HeroSliderMobile.jsx
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const HeroSliderMobile = ({ banners, current, setCurrent }) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [direction, setDirection] = useState(0)

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

    if (distance > minSwipeDistance) {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % banners.length)
    }

    if (distance < -minSwipeDistance) {
      setDirection(-1)
      setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
    }
  }

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [banners.length])

  if (!banners || banners.length === 0) return null

  const banner = banners[current]

  /* ========== Animations ========== */

  // Slide animation for content
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: (direction) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4 },
    }),
  }

  // Staggered fade up for text elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  // Special animation for title using Italiana font
  const titleVariants = {
    hidden: { 
      y: 40, 
      opacity: 0,
      letterSpacing: "0.1em"
    },
    visible: {
      y: 0,
      opacity: 1,
      letterSpacing: "0.05em",
      transition: {
        duration: 0.8,
        ease: [0.19, 1.0, 0.22, 1.0],
      },
    },
  }

  // Button animation with hover effects
  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.4,
      },
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#F7F3FF",
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  }

  // Background fade animation
  const backgroundVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: {
        duration: 0.8,
      },
    },
  }

  return (
    <section
      className="relative min-h-screen overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          variants={backgroundVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${banner.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </AnimatePresence>

      {/* Gradient Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
      />

      {/* Content Container */}
      <div className="relative min-h-screen flex flex-col justify-center px-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={banner.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-sm mx-auto text-center"
          >
            {/* Content with staggered animation */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Subtitle with Instrument Sans font */}
              {banner.subtitle && (
                <motion.span
                  variants={itemVariants}
                  className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs uppercase tracking-widest text-white font-instrument"
                >
                  {banner.subtitle}
                </motion.span>
              )}

              {/* Title with Italiana font - Luxurious feel */}
              {banner.title && (
                <motion.h1
                  variants={titleVariants}
                  className="text-4xl md:text-5xl font-normal text-white mb-4 leading-tight font-italiana"
                >
                  {banner.title}
                </motion.h1>
              )}

              {/* Description with Bai Jamjuree - Elegant body text */}
              {banner.description && (
                <motion.p
                  variants={itemVariants}
                  className="text-base text-gray-200 mb-8 leading-relaxed font-light font-bai-jamjuree"
                >
                  {banner.description}
                </motion.p>
              )}

              {/* CTA Button with animated arrow */}
              {banner.buttonText && (
                <motion.div variants={itemVariants}>
                  <motion.a
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    href={banner.buttonLink}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-shadow font-instrument"
                  >
                    <span>{banner.buttonText}</span>
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        repeatDelay: 1,
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </motion.svg>
                  </motion.a>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Dots Indicator with animation */}
        {banners.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-3 mt-12"
          >
            {banners.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1)
                  setCurrent(i)
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`relative w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current 
                    ? "bg-white shadow-lg" 
                    : "bg-white/30 hover:bg-white/60"
                }`}
              >
                {i === current && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Swipe hint (only shows initially) */}
        {banners.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-sm font-instrument flex items-center gap-2"
          >
            <motion.span
              animate={{ x: [-5, 5, -5] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
            >
              ←
            </motion.span>
            <span>Swipe</span>
            <motion.span
              animate={{ x: [5, -5, 5] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
            >
              →
            </motion.span>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default HeroSliderMobile