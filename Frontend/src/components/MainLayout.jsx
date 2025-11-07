import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom'; // <-- 1. IMPORT NAVIGATE
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useAuth } from '../hooks/useAuth';


export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth(); // <- Anda sudah memanggil ini, bagus!

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // --- 1. Tambahkan pengecekan Autentikasi ---
  // Jika tidak ada user, lempar ke halaman login
  if (!user) {
    // Pastikan Anda punya route '/login'
    return <Navigate to="/login" replace />; 
  }

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
            
            /* --- 2. PASTIKAN NILAI INI SAMA DENGAN LEBAR SIDEBAR --- */
            margin-left: ${isSidebarOpen ? '260px' : '70px'};
            
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .main-content {
            padding: 24px; /* Saya sarankan padding sedikit lebih besar */
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
          <TopHeader /> 
          
          <main className="main-content">
            <Outlet /> 
          </main>
        </div>
      </div>
    </>
  );
}