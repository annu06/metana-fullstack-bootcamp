// PrivateRoute component for admin users
import React from 'react';
import { useAuth } from '../context/AuthProvider';

export default function PrivateRoute({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <div>Not authorized (admin only).</div>;
  }
  return children;
}
