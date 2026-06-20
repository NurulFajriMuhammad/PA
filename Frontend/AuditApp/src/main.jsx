import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from "../../Shared/hooks/useAuth.jsx";
import { BrowserRouter } from 'react-router-dom' 
import { getCsrfCookie } from "../../Shared/api/axios.js";
import { Toaster } from 'react-hot-toast';

// ✅ Render app LANGSUNG tanpa menunggu CSRF — halaman tampil instan
// CSRF tetap di-fetch di background agar request API berikutnya tetap valid
ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>   
      <AuthProvider>   
        <App />
        
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          gutter={8}
          containerStyle={{
            top: 80,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />

      </AuthProvider>
    </BrowserRouter>
);

// Fetch CSRF di background setelah app sudah di-render
getCsrfCookie().catch(() => {
  console.warn('[CSRF] Gagal mengambil CSRF cookie. Request API mungkin memerlukan retry.');
});
