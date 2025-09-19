import React from 'react';
import { useAuth } from '../context/AuthProvider';

// ProtectedRoute component for authenticated users
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <div>You must be logged in to view this page.</div>;
  }
  return children;
}
