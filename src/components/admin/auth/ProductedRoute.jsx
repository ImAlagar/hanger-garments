import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, initialCheckDone } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading while checking initial auth
  if (!initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login based on the route
    if (location.pathname.includes('/dashboard/wholesaler')) {
      return <Navigate to="/wholesaler/login" state={{ from: location }} replace />;
    } else if (location.pathname.includes('/dashboard')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    
    // Redirect based on user role to their respective dashboard
    switch (user?.role) {
      case 'ADMIN':
        return <Navigate to="/dashboard" replace />;
      case 'WHOLESALER':
        return <Navigate to="/dashboard/wholesaler" replace />;
      case 'USER':
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;