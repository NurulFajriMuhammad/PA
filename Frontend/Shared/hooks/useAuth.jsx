import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const setUser = (newUser) => {
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('lastActiveTime', Date.now().toString());
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('lastActiveTime');
      sessionStorage.removeItem('isLoggedIn');
    }
    setUserState(newUser);
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/logout');
    } catch (e) {
      console.error('Logout gagal', e);
    } finally {
      setUser(null);
    }
  };

  // Logika Idle Session Timeout / Auto-Logout
  useEffect(() => {
    if (!user) return; // Hanya berjalan jika user aktif / login

    // Default: 3 jam (10,800,000 milidetik). Bisa disesuaikan 3-5 jam.
    // Kami menggunakan interval 1 menit untuk pengecekan.
    const TIMEOUT_MS = 3 * 60 * 60 * 1000; 
    const CHECK_INTERVAL_MS = 60 * 1000;

    const updateActivity = () => {
      localStorage.setItem('lastActiveTime', Date.now().toString());
    };

    // Set waktu keaktifan awal saat login / refresh halaman
    if (!localStorage.getItem('lastActiveTime')) {
      updateActivity();
    }

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    // Throttle pembaruan waktu aktif agar tidak membebani browser (maks sekali per 5 detik)
    let throttleTimeout = null;
    const handleUserActivity = () => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        updateActivity();
        throttleTimeout = null;
      }, 5000);
    };

    // Daftarkan event listener ke window
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Pengecekan berkala sisa waktu idle
    const checkIdleInterval = setInterval(() => {
      const lastActive = localStorage.getItem('lastActiveTime');
      if (lastActive) {
        const timeElapsed = Date.now() - parseInt(lastActive, 10);
        if (timeElapsed > TIMEOUT_MS) {
          console.warn('🕒 Sesi diam (idle) melebihi batas waktu 3 jam. Melakukan auto-logout...');
          logout();
        }
      }
    }, CHECK_INTERVAL_MS);

    // Pembersihan listener dan interval saat unmount / logout
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(checkIdleInterval);
    };
  }, [user]);

  const value = {
    user,
    setUser,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}