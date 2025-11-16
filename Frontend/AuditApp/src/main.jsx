import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from "../../Shared/hooks/useAuth.jsx";
import { BrowserRouter } from 'react-router-dom' 
import { getCsrfCookie } from "../../Shared/api/axios.js";
import { Toaster } from 'react-hot-toast';

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