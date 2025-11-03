import React, { useState } from 'react'; // <-- 1. Import useState
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  // 2. Buat state untuk melacak status sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 3. Buat fungsi untuk mengubah state
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <style>
        {`
          .layout-container {
            display: flex;
          }

          .main-content {
            /* 4. Hapus margin-left dari sini */
            padding: 20px;
            width: 100%;
            min-height: 100vh;
            background-color: #f4f7f6;
            /* 5. Tambahkan transisi yang mulus */
            transition: margin-left 0.3s ease-out;
          }
        `}
      </style>

      <div className="layout-container">
        {/* 6. Kirim state dan fungsi sebagai props ke Sidebar */}
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main 
          className="main-content"
          // 7. Atur margin-left secara dinamis di sini
          style={{ marginLeft: isSidebarOpen ? '250px' : '80px' }}
        >
          <Outlet /> 
        </main>
      </div>
    </>
  );
}