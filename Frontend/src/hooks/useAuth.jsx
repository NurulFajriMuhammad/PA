import React, { createContext, useContext, useState } from 'react';
import apiClient from '../api/axios';

// 1. Buat Context
const AuthContext = createContext();

// 2. Buat Provider (pembungkus)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // 'loading' dan 'useEffect' dihapus
  // Hook ini sekarang 100% pasif dan hanya akan
  // diisi oleh halaman Login.

  // Fungsi untuk logout
  const logout = async () => {
    try {
      await apiClient.post('/api/logout');
    } catch (e) {
      console.error('Logout gagal', e);
    } finally {
      setUser(null); // Hapus user dari state
    }
  };

  // Nilai yang diberikan ke komponen anak
  const value = {
    user,
    setUser,
    logout // Kita tidak lagi mengirim 'loading'
  };

  return (
    <AuthContext.Provider value={value}>
      {children} {/* Tidak perlu menunggu loading lagi */}
    </AuthContext.Provider>
  );
}

// 3. Buat hook kustom untuk memakai context ini
export function useAuth() {
  return useContext(AuthContext);
}