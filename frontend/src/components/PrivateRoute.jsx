import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ roles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Logged in but no required role, redirect to unauthorized page or home
    // For now, let's redirect to home or login (if you prefer a clear error message)
    // You might want a dedicated /unauthorized page later
    return <Navigate to="/" replace />;
  }

  // Authorized, render the child routes
  return <Outlet />;
};

export default PrivateRoute; 