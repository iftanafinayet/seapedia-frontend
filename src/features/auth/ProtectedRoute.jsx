import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, activeRole, roles } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && activeRole !== role) {
    const hasRole = roles.includes(role);
    if (!hasRole) {
      return <Navigate to={activeRole ? `/${activeRole.toLowerCase()}/dashboard` : '/'} replace />;
    }
    return <Navigate to={`/${activeRole.toLowerCase()}/dashboard`} replace />;
  }

  return children;
}
