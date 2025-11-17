// src/components/Common/ScrollToTopButton.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
      // Calculate scroll progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(Math.min(scrolled, 100));
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hideOnRoutes = ['/admin'];
  const shouldHide = hideOnRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  if (shouldHide || !isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed right-6 bottom-6 z-50 group"
      aria-label="Scroll to top"
    >
      {/* Progress ring background */}
      <div className="relative w-12 h-12">
        {/* Background circle */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full border border-white/20" />
        
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-white/20"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeDasharray="302"
            strokeDashoffset={302 - (scrollProgress * 302) / 100}
            className="text-white/60 transition-all duration-150 ease-out"
          />
        </svg>

        {/* Main button */}
        <div className="relative w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 border border-white/10">
          <svg 
            className="w-5 h-5 text-white transform transition-transform duration-300 group-hover:-translate-y-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M5 15l7-7 7 7" 
            />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default ScrollToTopButton;