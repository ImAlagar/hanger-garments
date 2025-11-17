import { useState, useEffect } from 'react';

export const useScrollEffects = () => {
  const [scrolled, setScrolled] = useState(false);
  const [topbarVisible, setTopbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setTopbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setTopbarVisible(true);
      }
      
      setScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return { scrolled, topbarVisible };
};