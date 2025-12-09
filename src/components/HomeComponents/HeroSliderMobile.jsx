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

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <section
      className="relative min-h-screen overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${banner.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
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
            {/* IMAGE */}
            {banner.image && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 flex justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-[260px] object-contain"
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Subtitle */}
            {banner.subtitle && (
              <motion.span
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="inline-block mb-4 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-xs uppercase tracking-widest text-white"
              >
                {banner.subtitle}
              </motion.span>
            )}

            {/* Title */}
            {banner.title && (
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-3xl font-bold text-white mb-4 leading-tight"
              >
                {banner.title}
              </motion.h1>
            )}

            {/* Description */}
            {banner.description && (
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="text-sm text-gray-200 mb-6 leading-relaxed line-clamp-3"
              >
                {banner.description}
              </motion.p>
            )}

            {/* CTA */}
            {banner.buttonText && (
              <motion.a
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                href={banner.buttonLink}
                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-bold rounded-xl shadow-xl"
              >
                {banner.buttonText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </motion.a>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1)
                  setCurrent(i)
                }}
                className={`w-3 h-3 rounded-full ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSliderMobile
