// components/HomeComponents/HeroSlider.jsx
import React, { useState, useEffect } from "react"
import HeroSliderDesktop from "./HeroSliderDesktop"
import HeroSliderMobile from "./HeroSliderMobile"

const HeroSlider = ({ banners, isLoading }) => {
  const [current, setCurrent] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Auto-slide effect
  useEffect(() => {
    if (banners.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 6000)
    
    return () => clearInterval(interval)
  }, [banners.length])

  if (isLoading || banners.length === 0) {
    return (
      <div className="relative min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading banner...</p>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <HeroSliderMobile 
        banners={banners} 
        current={current}
        setCurrent={setCurrent}
      />
    )
  }

  return (
    <HeroSliderDesktop 
      banners={banners} 
      current={current}
      setCurrent={setCurrent}
    />
  )
}

export default HeroSlider