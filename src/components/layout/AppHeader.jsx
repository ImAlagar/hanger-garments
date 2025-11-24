import React from 'react'
import { useLocation } from 'react-router-dom'
import AdminHeader from '../admin/auth/AdminHeader'
import MainHeader from './Header/MainHeader'
import { useAppSelector } from '../../redux/hooks'

const AppHeader = ({ onMenuClick, sidebarOpen }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = user?.role === 'admin';

  // Don't show header on login pages
  if (location.pathname.includes('/login') || location.pathname.includes('/register') || location.pathname.includes('/forgot-password') || location.pathname.includes('/reset-password')) {
    return null;
  }

  // Show AdminHeader only for authenticated admin users on admin routes
  if (isAdminRoute && isAuthenticated && isAdmin) {
    return <AdminHeader onMenuClick={onMenuClick} sidebarOpen={sidebarOpen} />;
  }
  
  // Show MainHeader for all other cases
  return <MainHeader />;
}

export default AppHeader;