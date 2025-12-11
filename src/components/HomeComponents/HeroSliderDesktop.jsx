import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const HeroSliderDesktop = ({ banners, current, setCurrent }) => {
  const [isHovered, setIsHovered] = useState(false);
  const slideRef = useRef([]);
  const subtitleRef = useRef([]);
  const titleRef = useRef([]);
  const descRef = useRef([]);
  const buttonRef = useRef([]);
  const prevCurrentRef = useRef(current);

  // GSAP animations for content
  useEffect(() => {
    // Clear any existing animations on the new slide
    if (slideRef.current[current]) {
      gsap.killTweensOf(slideRef.current[current]);
      gsap.killTweensOf(subtitleRef.current[current]);
      gsap.killTweensOf(titleRef.current[current]);
      gsap.killTweensOf(descRef.current[current]);
      gsap.killTweensOf(buttonRef.current[current]);
    }

    // Clear animations on the previous slide
    if (slideRef.current[prevCurrentRef.current]) {
      gsap.killTweensOf(slideRef.current[prevCurrentRef.current]);
      gsap.set(slideRef.current[prevCurrentRef.current], { opacity: 0, zIndex: 0 });
    }

    const tl = gsap.timeline();

    if (
      slideRef.current[current] &&
      subtitleRef.current[current] &&
      titleRef.current[current] &&
      descRef.current[current] &&
      buttonRef.current[current]
    ) {
      // Set initial state for the new slide
      gsap.set(slideRef.current[current], { opacity: 0, scale: 1.05, zIndex: 10 });
      gsap.set(subtitleRef.current[current], { opacity: 0, y: -20 });
      gsap.set(titleRef.current[current], { opacity: 0, y: 30 });
      gsap.set(descRef.current[current], { opacity: 0, y: 30 });
      gsap.set(buttonRef.current[current], { opacity: 0, y: 30, scale: 0.95 });

      // Animate the slide background
      tl.to(
        slideRef.current[current],
        { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
      )
      // Animate subtitle
      .to(
        subtitleRef.current[current],
        { opacity: 1, y: 0, duration: 0.8 },
        "-=1"
      )
      // Animate title
      .to(
        titleRef.current[current],
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
        "-=0.6"
      )
      // Animate description
      .to(
        descRef.current[current],
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
        "-=0.8"
      )
      // Animate button
      .to(
        buttonRef.current[current],
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
        "-=0.7"
      );
    }

    // Update previous current reference
    prevCurrentRef.current = current;
  }, [current]);

  // Auto slide - FIXED VERSION
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrent((prev) => {
          const next = (prev + 1) % banners.length;
          return next;
        });
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [banners, isHovered, setCurrent]);

  // Navigation functions
  const goToSlide = (index) => {
    if (index >= 0 && index < banners.length) {
      setCurrent(index);
    }
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-8 right-8 z-20 bg-black/30 text-white px-4 py-2 rounded-full font-bai-jamjuree">
        <span className="text-xl">{current + 1}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{banners.length}</span>
      </div>

      {banners.map((banner, i) => (
        <div
          key={banner.id}
          ref={(el) => (slideRef.current[i] = el)}
          className={`absolute inset-0 ${
            i === current ? "z-10" : "z-0"
          }`}
          style={{
            backgroundImage: `url(${banner.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative container mx-auto px-36 h-[80vh] flex items-center">
            <div
              className={`w-full ${
                banner.layout === "center" 
                  ? "text-center mx-auto max-w-4xl" 
                  : banner.layout === "right" 
                  ? "ml-auto text-right" 
                  : "text-left"
              }`}
            >
              <div 
                className={`${
                  banner.layout === "center" 
                    ? "max-w-4xl mx-auto" 
                    : banner.layout === "right" 
                    ? "ml-auto" 
                    : ""
                }`}
                style={banner.layout !== "center" ? { maxWidth: "max-content" } : {}}
              >
                {banner.subtitle && (
                  <span
                    ref={(el) => (subtitleRef.current[i] = el)}
                    className={`inline-block px-6 py-3 mb-8 rounded-full bg-white/10 border border-white/20 text-white text-sm uppercase tracking-widest font-bai-jamjuree ${
                      banner.layout === "center" ? "mx-auto" : ""
                    }`}
                  >
                    {banner.subtitle}
                  </span>
                )}

                {banner.title && (
                  <h1
                    ref={(el) => (titleRef.current[i] = el)}
                    className={`text-5xl md:text-6xl xl:text-7xl font-bold text-white mb-8 leading-tight font-italiana ${
                      banner.layout === "center" ? "max-w-4xl mx-auto" : ""
                    }`}
                  >
                    {banner.title}
                  </h1>
                )}

                {banner.description && (
                  <p
                    ref={(el) => (descRef.current[i] = el)}
                    className={`text-xl text-gray-200 mb-10 leading-relaxed font-instrument ${
                      banner.layout === "center" 
                        ? "max-w-3xl mx-auto" 
                        : banner.layout === "right" 
                        ? "ml-auto" 
                        : ""
                    }`}
                    style={banner.layout !== "center" ? { maxWidth: "42rem" } : {}}
                  >
                    {banner.description}
                  </p>
                )}

                {banner.buttonText && (
                  <div 
                    className={`${
                      banner.layout === "center" 
                        ? "flex justify-center" 
                        : banner.layout === "right" 
                        ? "flex justify-end" 
                        : ""
                    }`}
                  >
                    <a
                      ref={(el) => (buttonRef.current[i] = el)}
                      href={banner.buttonLink}
                      className="inline-flex items-center gap-3 px-12 py-5 bg-white text-black font-semibold rounded-lg hover:scale-105 transition font-bai-jamjuree text-lg"
                    >
                      {banner.buttonText}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default HeroSliderDesktop;