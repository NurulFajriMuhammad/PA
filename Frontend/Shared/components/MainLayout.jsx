import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom'; 
// import Sidebar from '@shared/components/Sidebar.jsx';
// import TopHeader from '@shared/components/TopHeader.jsx';
// import { useAuth } from '@shared/hooks/useAuth.jsx';
import Sidebar from './Sidebar.jsx';
import TopHeader from './TopHeader.jsx';
import { useAuth } from '../hooks/useAuth.jsx';


export default function MainLayout() {
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
          .layout-container {
            display: flex;
            background-color: #f4f7f6;
          }
          .content-wrapper {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            
            margin-left: ${isSidebarOpen ? '260px' : '70px'};
            width: calc(100% - ${isSidebarOpen ? '260px' : '70px'});
            
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                        width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .main-content {
            padding: 24px; 
            width: 100%;
            flex-grow: 1;
          }

          @media (max-width: 768px) {
            .content-wrapper {
              margin-left: 0 !important;
              width: 100% !important;
              transition: none; 
            }
          }
        `}
      </style>

      <div className="layout-container">
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        <div className="content-wrapper">
          <TopHeader isSidebarOpen={isSidebarOpen} /> 
          
          <main className="main-content">
            <Outlet /> 
          </main>
        </div>
      </div>
    </>
  );
}