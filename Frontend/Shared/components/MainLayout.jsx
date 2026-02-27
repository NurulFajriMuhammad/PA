import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom'; 
import Sidebar from './Sidebar.jsx';
import TopHeader from './TopHeader.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function MainLayout() {
  const sidebarWidth = 280;
  const collapsedWidth = 75;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth(); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) {
    return <Navigate to="/login" replace />; 
  }

  return (
    <>
      <style>
        {`
          :root {
            --bg-body: #f1f5f9; /* Biru abu-abu sangat muda khas aplikasi enterprise */
            --transition-speed: 0.3s;
          }

          .layout-container {
            display: flex;
            min-height: 100vh;
            background-color: var(--bg-body);
            overflow-x: hidden;
          }

          .content-wrapper {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            flex-grow: 1;
            
            /* Gunakan calc untuk presisi layout */
            margin-left: ${isSidebarOpen ? `${sidebarWidth}px` : `${collapsedWidth}px`};
            width: calc(100% - ${isSidebarOpen ? `${sidebarWidth}px` : `${collapsedWidth}px`});
            
            transition: all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }

          .main-content {
            padding: 30px; 
            width: 100%;
            flex-grow: 1;
            box-sizing: border-box;
            /* Efek fading lembut saat konten muncul */
            animation: fadeIn 0.5s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Handle tampilan mobile */
          @media (max-width: 768px) {
            .content-wrapper {
              margin-left: 0 !important;
              width: 100% !important;
            }
            
            .main-content {
              padding: 20px 15px;
            }
          }

          /* Glassmorphism tipis untuk area konten agar terlihat modern */
          .content-card-mock {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
          }
        `}
      </style>

      <div className="layout-container">
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        <div className="content-wrapper">
          {/* Header tetap di atas konten */}
          <TopHeader 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} // Berikan fungsi toggle jika ada tombol menu di header
          /> 
          
          <main className="main-content">
            {/* Wrapper tambahan untuk memastikan tabel audit tidak hancur saat di-scroll */}
            <div className="page-inner-container">
              <Outlet /> 
            </div>
          </main>

          {/* Footer Opsional di dalam konten */}
          <footer style={{ 
            padding: '20px 30px', 
            fontSize: '0.85rem', 
            color: '#64748b', 
            borderTop: '1px solid #e2e8f0',
            textAlign: 'right'
          }}>
            Internal Audit Management System &copy; 2026
          </footer>
        </div>
      </div>
    </>
  );
}