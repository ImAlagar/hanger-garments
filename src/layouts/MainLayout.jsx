// src/layouts/MainLayout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader';
import Footer from '../components/layout/Footer/Footer';
import ScrollToTopButton from '../components/Common/ScrollToTopButton';
import ScrollToTop from '../components/Common/ScrollToTop';

const MainLayout = () => {
  const location = useLocation();
  
  const hideFooterRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/admin'];
  const shouldHideFooter = hideFooterRoutes.some(route => location.pathname.includes(route));

  // Hide topbar on admin and auth pages
  const hideTopbarRoutes = ['/admin', '/login', '/register', '/forgot-password', '/reset-password'];
  const shouldHideTopbar = hideTopbarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-gray-900 smokey:bg-gray-800 transition-colors duration-300'> 
    
       <AppHeader />
       <ScrollToTop />
       <main className='flex-1'>
        <Outlet />
       </main>
        <ScrollToTopButton />
       {!shouldHideFooter && <Footer />}
    </div>
  )
}

export default MainLayout