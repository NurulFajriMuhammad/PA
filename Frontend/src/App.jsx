import React from "react";
import { Routes, Route } from "react-router-dom";
import UserManagementPage from "./pages/UserManagementPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute"; 

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} /> 
          <Route path="admin/users" element={<UserManagementPage />} /> 
        </Route>
      </Route>

    </Routes>
  );
}

export default App;