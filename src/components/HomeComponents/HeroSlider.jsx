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
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
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
    return null
  }

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block">
        <HeroSliderDesktop 
          banners={banners} 
          current={current}
          setCurrent={setCurrent}
        />
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        <HeroSliderMobile 
          banners={banners} 
          current={current}
          setCurrent={setCurrent}
        />
      </div>
    </>
  )
}

export default HeroSlider