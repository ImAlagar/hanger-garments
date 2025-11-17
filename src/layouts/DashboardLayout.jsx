import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { authCheckComplete } from '../redux/slices/authSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../components/admin/auth/AdminSidebar';
import AdminHeader from '../components/admin/auth/AdminHeader';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  
  // Get all auth state from Redux
  const { loading, initialCheckDone, token, user } = useAppSelector((state) => state.auth);

  // Handle initial auth check with toast notifications
  useEffect(() => {
    // If we have a token but initial check hasn't been done yet
    if (token && !initialCheckDone) {
      // Mark the check as complete after a short delay
      const timer = setTimeout(() => {
        dispatch(authCheckComplete());
        toast.success(`Welcome back, ${user?.name || 'Admin'}!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (!token && !initialCheckDone) {
      // No token, mark check as complete immediately
      dispatch(authCheckComplete());
    }
  }, [token, initialCheckDone, dispatch, user]);

  // Show loading while checking auth
  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {loading ? 'Authenticating...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-gray-50 dark:bg-gray-900 smokey:bg-gray-800 transition-colors duration-300'>
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen}/>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'ml-82' : 'ml-0'
      }`}>
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
        />
        
        {/* Admin Outlet */}
        <main className="flex-1 overflow-auto p-6">
          
          <Outlet />
        </main>

        {/* React Toastify Container for Dashboard */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{
            zIndex: 9999,
            marginTop: '70px' // Adjust based on your header height
          }}
        />
      </div>
    </div>
  );
};

export default DashboardLayout;