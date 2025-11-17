import { useState, useCallback } from 'react';

export const useHeaderState = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const closeAll = useCallback(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => setDropdownOpen(prev => !prev), []);
  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);
  const toggleSearch = useCallback(() => setSearchOpen(prev => !prev), []);
  const toggleShop = useCallback(() => setShopOpen(prev => !prev), []);

  return {
    dropdownOpen,
    menuOpen,
    searchOpen,
    shopOpen,
    setDropdownOpen,
    setMenuOpen,
    setSearchOpen,
    setShopOpen,
    closeAll,
    toggleDropdown,
    toggleMenu,
    toggleSearch,
    toggleShop,
  };
};