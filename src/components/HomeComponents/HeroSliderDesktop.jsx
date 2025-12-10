// components/HomeComponents/HeroSliderDesktop.jsx
import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const HeroSliderDesktop = ({ banners, current, setCurrent }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);

  // Refs for GSAP targets
  const bgContainerRef = useRef(null);
  const containerRef = useRef(null);
  const textContainerRef = useRef(null);
  const overlayRef = useRef(null);
  const gradientOverlayRef = useRef(null);
  const floatElementsRef = useRef([]);

  // Auto slide functionality - SLOWER
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const startAutoSlide = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (!isHovered && isPlaying && !isAnimating) {
          handleNextSlide();
        }
      }, 8000); // 8 seconds for slow, cinematic feel
    };

    startAutoSlide();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners, isHovered, isPlaying, isAnimating, setCurrent]);

  // Main GSAP Animation - SLOW & ELEGANT
  useGSAP(() => {
    if (!banners || banners.length === 0) return;

    // Prevent multiple animations
    if (isAnimating) return;
    setIsAnimating(true);

    // Clear any ongoing tweens
    gsap.killTweensOf([
      bgContainerRef.current,
      textContainerRef.current,
      overlayRef.current,
      gradientOverlayRef.current,
      ...floatElementsRef.current
    ]);

    // Create master timeline with slow, smooth easing
    const masterTl = gsap.timeline({
      defaults: { ease: "slow(0.7, 0.7, false)" },
      onComplete: () => setIsAnimating(false)
    });

    // 1. FIRST: Smooth fade-in overlay to transition between slides
    masterTl
      .to(overlayRef.current, {
        opacity: 0.9,
        duration: 0.8,
        ease: "power2.inOut"
      }, 0);

    // 2. Background: Gentle zoom with parallax effect
    masterTl
      .fromTo(bgContainerRef.current,
        {
          scale: 1.08,
          y: 30,
          filter: "brightness(0.7) blur(3px)",
          opacity: 0
        },
        {
          scale: 1,
          y: 0,
          filter: "brightness(1) blur(0px)",
          opacity: 1,
          duration: 2.2,
          ease: "power2.inOut"
        }, 0.3);

    // 3. Remove overlay to reveal content
    masterTl
      .to(overlayRef.current, {
        opacity: 0,
        duration: 1.2,
        ease: "power2.inOut"
      }, 1);

    // 4. Gradient overlay fade-in
    masterTl
      .fromTo(gradientOverlayRef.current,
        { opacity: 0 },
        {
          opacity: 0.6,
          duration: 1.5,
          ease: "power2.inOut"
        }, 0.5);

    // 5. Text content: Slow, elegant entrance
    masterTl
      .fromTo(textContainerRef.current,
        {
          y: 40,
          opacity: 0,
          scale: 0.98
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.8,
          ease: "power2.out"
        }, 1.2);

    // 6. Stagger children with individual delays for cinematic feel
    const textChildren = textContainerRef.current?.children || [];
    masterTl.fromTo(textChildren,
      {
        y: 20,
        opacity: 0,
        filter: "blur(5px)"
      },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.2,
        stagger: {
          each: 0.15,
          from: "start",
          ease: "power2.out"
        }
      }, 1.5);

    // 7. Floating elements animation (subtle, continuous)
    floatElementsRef.current.forEach((el, index) => {
      if (el) {
        gsap.to(el, {
          y: `-=${10 + index * 2}`,
          x: `${(Math.sin(index) * 5)}`,
          duration: 4 + index,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
      }
    });

  }, { scope: containerRef, dependencies: [current] });

  // Smooth slide transitions
  const handleNextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const exitTl = gsap.timeline({
      onComplete: () => {
        setCurrent((prev) => (prev + 1) % banners.length);
      }
    });

    // Elegant exit animation
    exitTl
      .to(textContainerRef.current, {
        y: -30,
        opacity: 0,
        duration: 1.2,
        ease: "power2.in"
      })
      .to(overlayRef.current, {
        opacity: 0.7,
        duration: 0.8,
        ease: "power2.inOut"
      }, 0);
  };

  const handlePrevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const exitTl = gsap.timeline({
      onComplete: () => {
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
      }
    });

    exitTl
      .to(textContainerRef.current, {
        y: 30,
        opacity: 0,
        duration: 1.2,
        ease: "power2.in"
      })
      .to(overlayRef.current, {
        opacity: 0.7,
        duration: 0.8,
        ease: "power2.inOut"
      }, 0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDotClick = (index) => {
    if (index === current || isAnimating) return;

    setIsAnimating(true);
    
    // Smooth transition to selected slide
    const exitTl = gsap.timeline({
      onComplete: () => setCurrent(index)
    });

    exitTl
      .to([textContainerRef.current, bgContainerRef.current], {
        opacity: 0.3,
        scale: 0.95,
        duration: 0.8,
        ease: "power2.inOut"
      })
      .to(overlayRef.current, {
        opacity: 0.8,
        duration: 0.6,
        ease: "power2.inOut"
      }, 0);
  };

  // Create floating elements for subtle movement
  useEffect(() => {
    if (containerRef.current && banners?.length > 0) {
      // Clear previous floating elements
      floatElementsRef.current.forEach(el => el?.remove());
      floatElementsRef.current = [];

      // Add subtle floating shapes
      const shapes = ['circle', 'square', 'triangle'];
      for (let i = 0; i < 6; i++) {
        const shape = document.createElement('div');
        shape.className = 'absolute pointer-events-none';
        
        // Different shapes
        if (shapes[i % 3] === 'circle') {
          shape.className += ' w-2 h-2 rounded-full';
          shape.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (shapes[i % 3] === 'square') {
          shape.className += ' w-3 h-3';
          shape.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          shape.style.transform = 'rotate(45deg)';
        } else {
          shape.style.width = '0';
          shape.style.height = '0';
          shape.style.borderLeft = '8px solid transparent';
          shape.style.borderRight = '8px solid transparent';
          shape.style.borderBottom = '12px solid rgba(255, 255, 255, 0.08)';
        }

        shape.style.left = `${10 + (i * 15)}%`;
        shape.style.top = `${20 + (i * 10)}%`;
        shape.style.zIndex = '1';
        
        containerRef.current.appendChild(shape);
        floatElementsRef.current.push(shape);
      }
    }

    return () => {
      floatElementsRef.current.forEach(el => el?.remove());
      floatElementsRef.current = [];
    };
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const banner = banners[current];
  const alignment = banner.alignment || "CENTER";

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      {/* Background Image with slow zoom effect */}
      <div
        ref={bgContainerRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${banner.bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          willChange: "transform, opacity, filter"
        }}
      />

      {/* Gradient Overlay for depth */}
      <div
        ref={gradientOverlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)",
          mixBlendMode: "multiply",
          opacity: 0.6,
          willChange: "opacity"
        }}
      />

      {/* Transition Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: 0,
          willChange: "opacity",
          zIndex: 2
        }}
      />

      {/* Main Content Container */}
      <div className="relative container mx-auto px-4 sm:px-8 lg:px-16 min-h-screen flex items-center z-10">
        {/* Text Content - Slow elegant reveal */}
        <div
          ref={textContainerRef}
          className={`max-w-4xl mx-auto ${
            alignment === "LEFT"
              ? "text-left mr-auto"
              : alignment === "RIGHT"
              ? "text-right ml-auto"
              : "text-center mx-auto"
          }`}
          style={{ willChange: "transform, opacity, filter" }}
        >
          {/* Badge with subtle animation */}
          {banner.badge && (
            <div className={`inline-block mb-10 ${alignment === "CENTER" ? "mx-auto" : ""}`}>
              <span className="px-8 py-3 bg-white/10 backdrop-blur-md text-white text-sm font-medium uppercase tracking-widest rounded-full border border-white/20">
                {banner.badge}
              </span>
            </div>
          )}

          {/* Title with soft shadow */}
          {banner.title && (
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light text-white mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {banner.title}
              </span>
            </h1>
          )}

          {/* Subtitle with elegant font */}
          {banner.subtitle && (
            <h2 className="text-2xl lg:text-3xl text-gray-300 mb-8 font-light tracking-wide italic">
              {banner.subtitle}
            </h2>
          )}

          {/* Description */}
          {banner.description && (
            <p
              className={`text-xl lg:text-2xl text-gray-300 mb-10 leading-relaxed font-light ${
                alignment === "CENTER" ? "mx-auto max-w-3xl" : "max-w-2xl"
              }`}
            >
              {banner.description}
            </p>
          )}

          {/* Price/Offer - Minimal design */}
          {(banner.price || banner.offerText) && (
            <div className={`mb-10 ${alignment === "CENTER" ? "flex justify-center" : ""}`}>
              <div className="inline-flex items-center gap-6">
                <span className="text-4xl font-light text-white px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  {banner.price ? `$${banner.price}` : banner.offerText}
                </span>
                {banner.originalPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    ${banner.originalPrice}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CTA Button - Elegant design */}
          {banner.buttonText && (
            <div className={`mb-8 ${alignment === "CENTER" ? "flex justify-center" : ""}`}>
              <a
                href={banner.buttonLink || "#"}
                className="group inline-flex items-center gap-4 px-8 py-2 bg-white/10 backdrop-blur-md text-white text-lg font-normal rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105"
              >
                {banner.buttonText}
                <svg
                  className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          )}

          {/* Features - Minimal badges */}
          {banner.features && (
            <div className={`mt-12 ${alignment === "CENTER" ? "flex justify-center" : ""}`}>
              <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
                {banner.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="px-5 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-300"
                  >
                    <span className="text-sm text-gray-500 font-light">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Small Text */}
          {banner.smallText && (
            <p className={`mt-8 text-sm text-white font-light ${alignment === "CENTER" ? "text-center" : ""}`}>
              {banner.smallText}
            </p>
          )}
        </div>

        {/* Navigation Dots - Minimalist design */}
        {banners.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_, i) => (
              <button 
                key={i} 
                onClick={() => handleDotClick(i)}
                className="relative group"
                disabled={isAnimating}
              >
                <div className="relative">
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-700 ${
                      i === current 
                        ? "bg-white scale-125" 
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                  {/* Active dot animation ring */}
                  {i === current && (
                    <div className="absolute inset-0 w-4 h-4 -top-1 -left-1 border border-white/30 rounded-full animate-ping"></div>
                  )}
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                  {banners[i]?.badge || `Slide ${i + 1}`}
                </div>
              </button>
            ))}
          </div>
        )}



        {/* Slide Counter - Minimal */}
        {banners.length > 1 && (
          <div className="absolute top-12 left-12 px-4 py-3 bg-black/20 backdrop-blur-sm rounded-lg text-white/80 text-sm font-light tracking-wider border border-white/10 z-20">
            <span className="text-white">{current + 1}</span>
            <span className="mx-2">/</span>
            <span className="text-white/60">{banners.length}</span>
          </div>
        )}
      </div>

      {/* Progress Bar for Auto Slide */}
      {banners.length > 1 && isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
          <div 
            className="h-full bg-white/50 transition-all duration-100 ease-linear"
            style={{ 
              width: isHovered || isAnimating ? '0%' : '100%',
              animation: isHovered || isAnimating ? 'none' : 'progressBar 8s linear forwards'
            }}
          />
        </div>
      )}

    </section>
  );
};

export default HeroSliderDesktop;