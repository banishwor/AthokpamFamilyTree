import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
