import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// Hapus import MainLayout lokal

// Impor komponen Shared
import ProtectedRoute from "../../Shared/components/ProtectedRoute.jsx"; 

// Impor halaman ManagementUser
import DashboardApp from "./pages/Dashboard.jsx"; // Nama file dashboard Anda
import LoginPage from "./pages/LoginPage.jsx";       

function App() {
  return (
    <Routes>
      
      {/* Rute Login */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rute Utama (Dilindungi) */}
      <Route element={<ProtectedRoute allowedRole="administrator audit" />}> 
        
        {/* 🚨 Rute Dashboard LANGSUNG */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardApp />} />
        
        {/* Rute Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Route>
      
    </Routes>
  );
}

export default App;