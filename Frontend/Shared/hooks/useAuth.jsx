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
    } else {
      localStorage.removeItem('user');
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