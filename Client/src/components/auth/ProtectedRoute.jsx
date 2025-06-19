import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, requiredRole, userRole, children }) => {
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but wrong role, redirect to appropriate dashboard
  if (userRole !== requiredRole) {
    return <Navigate to={`/dashboard/${userRole}`} replace />;
  }

  // If authenticated and correct role, render the children
  return children;
};

export default ProtectedRoute;