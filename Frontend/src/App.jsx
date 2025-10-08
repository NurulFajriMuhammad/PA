import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserManagementPage from './pages/UserManagementPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Routes>
    <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      {/* Tambahkan rute lain di sini nanti, misal halaman login */}
      <Route path="/" element={
        <div className="p-8">
          <h1 className="text-2xl">Selamat Datang</h1>
          <a href="/admin/users" className="text-blue-500 hover:underline">
            Pergi ke Manajemen Pengguna
          </a>
        </div>
      } />
    </Routes>
  );
}

export default App;