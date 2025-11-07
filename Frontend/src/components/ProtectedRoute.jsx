import React from 'react';
import { useAuth } from "../hooks/useAuth";
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth(); 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Memverifikasi sesi...</div>
      </div>
    );
  }

  return <Outlet />; // <Outlet> merender komponen anak (Dashboard/Home)
};

export default ProtectedRoute;