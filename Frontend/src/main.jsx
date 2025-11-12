import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './hooks/useAuth' 
import { BrowserRouter } from 'react-router-dom' 
import { getCsrfCookie } from './api/axios'

getCsrfCookie().then(() => {

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>  
      <AuthProvider>   
        <App />
      </AuthProvider>
    </BrowserRouter>
);
});