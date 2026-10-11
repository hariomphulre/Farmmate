import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#052e16] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Already authenticated: redirect to intended destination or role dashboard
  if (isAuthenticated) {
    const attemptedPath = location.state?.from?.pathname;
    const userRole = (user?.user_type || user?.role || '').toLowerCase();
    const defaultDashboard = userRole === 'trader' ? '/trader/dashboard' : '/dashboard';

    const destination = (attemptedPath && attemptedPath !== '/') ? attemptedPath : defaultDashboard;
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default PublicRoute;
