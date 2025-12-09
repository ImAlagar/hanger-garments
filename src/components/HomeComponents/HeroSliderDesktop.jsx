// components/HomeComponents/HeroSliderDesktop.jsx
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const HeroSliderDesktop = ({ banners, current, setCurrent }) => {
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef(null)

  // Auto slide functionality
  useEffect(() => {
    if (!banners || banners.length <= 1) return
    
    const startAutoSlide = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      
      intervalRef.current = setInterval(() => {
        if (!isHovered) {
          setCurrent((prev) => (prev + 1) % banners.length)
        }
      }, 5000) // Change slide every 5 seconds
    }
    
    startAutoSlide()
    
    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [banners, isHovered, setCurrent]) // Re-run when isHovered changes

  if (!banners || banners.length === 0) return null

  const banner = banners[current]
  const isLeft = banner.layout === "left"

  /* ================== ANIMATIONS ================== */

  const textVariants = {
    hidden: { opacity: 0, x: isLeft ? -50 : 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: isLeft ? 50 : -50,
      transition: { duration: 0.5 },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -30 },
  }

  const bgVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.5, ease: "easeInOut" },
    },
    exit: { opacity: 0, transition: { duration: 0.6 } },
  }

  /* ================== JSX ================== */

  return (
    <section
      className="relative min-h-[90vh] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ===== Background ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          variants={bgVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${banner.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ===== Content ===== */}
      <div className="relative container mx-auto px-8 h-[90vh] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            className={`flex items-center w-full gap-16 ${
              isLeft ? "" : "flex-row-reverse"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* ================= TEXT ================= */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`flex-1 max-w-xl ${
                isLeft ? "text-left" : "text-right"
              }`}
            >
              {banner.subtitle && (
                <span className="inline-block px-4 py-2 mb-6 rounded-full bg-white/10 border border-white/20 text-white text-sm uppercase tracking-widest">
                  {banner.subtitle}
                </span>
              )}

              {banner.title && (
                <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                  {banner.title}
                </h1>
              )}

              {banner.description && (
                <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                  {banner.description}
                </p>
              )}

              {banner.offerText && (
                <div className="mb-8">
                  <span className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg">
                    {banner.offerText}
                  </span>
                </div>
              )}

              {banner.buttonText && (
                <a
                  href={banner.buttonLink}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-semibold rounded-lg hover:scale-105 transition"
                >
                  {banner.buttonText}
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              )}

              {banner.smallText && (
                <p className="mt-6 text-sm text-gray-300">{banner.smallText}</p>
              )}
            </motion.div>

            {/* ================= IMAGE ================= */}
            {banner.image && (
              <motion.div
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 flex justify-center"
              >
                <motion.div
                  whileHover={{
                    rotateY: -8,
                    rotateX: 4,
                    scale: 1.02,
                  }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="relative rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.35)]"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="md:w-[350px] md:h-[450px] xl:w-[350px] xl:h-[450px] lg:w-[350px] lg:h-[450px] object-cover"
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ================= DOTS ================= */}
        {banners.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition ${
                  i === current ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* ================= ARROWS ================= */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
              }
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15 19l-7-7 7-7" strokeWidth={2} />
              </svg>
            </button>

            <button
              onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" strokeWidth={2} />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  )
}

export default HeroSliderDesktop