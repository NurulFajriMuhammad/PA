import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from '@shared/hooks/useAuth.jsx' 
import { getCsrfCookie } from '@shared/api/axios.js'
import { BrowserRouter } from 'react-router-dom' 
import { Toaster } from 'react-hot-toast'

// Ambil cookie CSRF dulu (penting untuk login bersama)
getCsrfCookie().then(() => {

  ReactDOM.createRoot(document.getElementById('root')).render(
      <BrowserRouter> 
        <AuthProvider> 
          <App />
          <Toaster 
            position="top-right" 
            reverseOrder={false}
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

});