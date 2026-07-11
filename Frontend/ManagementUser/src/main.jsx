import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from '@shared/hooks/useAuth.jsx' 
import { getCsrfCookie } from '@shared/api/axios.js'
import { BrowserRouter } from 'react-router-dom' 
import { Toaster } from 'react-hot-toast'

// ✅ Render app LANGSUNG tanpa menunggu CSRF
ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter> 
      <AuthProvider> 
        <App />
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          containerStyle={{
            zIndex: 899,
          }}
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
);

// CSRF di-fetch di background
getCsrfCookie().catch(() => {
  console.warn('[CSRF] Gagal mengambil CSRF cookie.');
});