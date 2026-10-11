import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#052e16] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm font-medium text-slate-600">Verifying session...</p>
      </div>
    );
  }

  // Not authenticated: redirect to auth page, preserving attempted destination
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role-based authorization if allowedRoles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const rawRole = user?.user_type || user?.role || '';
    const userRole = rawRole.toLowerCase();
    const hasRole = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!hasRole) {
      // Role mismatch: redirect to respective user dashboard
      const fallbackRedirect = userRole === 'trader' ? '/trader/dashboard' : '/dashboard';
      return <Navigate to={fallbackRedirect} replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
