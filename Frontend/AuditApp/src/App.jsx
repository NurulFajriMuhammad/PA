import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserManagementPage from './pages/UserManagementPage.jsx'; 
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MainLayout from "../../Shared/components/MainLayout.jsx";
import ProtectedRouter from "../../Shared/components/ProtectedRoute.jsx";
import ProfilSpiPage from './pages/Profil SPI/ProfilSPIPage.jsx'; 

function App() {
  
  return (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRouter />}> 
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="admin/users" element={<UserManagementPage />} />
            <Route path="profil/:slug" element={<ProfilSpiPage />} />
            {/* Tambahkan rute lain di sini */}
          </Route>
        </Route>

    </Routes>
  );
}

export default App;