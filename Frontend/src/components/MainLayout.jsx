import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom'; // <-- 1. IMPORT NAVIGATE
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useAuth } from '../hooks/useAuth';


export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth(); // <-- 3. AMBIL USER DARI CONTEXT

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 4. JIKA TIDAK ADA USER (BELUM LOGIN), ARAHKAN KE /LOGIN
  if (!user) {
    // replace: mengganti histori agar tidak bisa "back" ke dashboard
    return <Navigate to="/login" replace />; 
  }

  // 5. Jika ada user, tampilkan layout
  return (
    <>
      <style>
        {`
          .layout-container {
            display: flex;
            background-color: #f4f7f6;
          }
          .content-wrapper {
            display: flex;
            flex-direction: column;
            width: 100%;
            min-height: 100vh;
            margin-left: ${isSidebarOpen ? '250px' : '80px'};
            transition: margin-left 0.3s ease-out;
          }
          .main-content {
            padding: 20px;
            width: 100%;
            flex-grow: 1;
          }
        `}
      </style>

      <div className="layout-container">
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        <div className="content-wrapper">
          {/* 6. TopHeader akan mengambil data user sendiri */}
          <TopHeader /> 
          
          <main className="main-content">
            <Outlet /> 
          </main>
        </div>
      </div>
    </>
  );
}