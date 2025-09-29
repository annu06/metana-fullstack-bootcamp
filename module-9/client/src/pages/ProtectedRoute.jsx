import React from 'react';
import { useAuth } from '../context/AuthProvider';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
