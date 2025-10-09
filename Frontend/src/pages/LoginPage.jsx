import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import apiClient from '../api/axios';
import apiClient, { getCsrfCookie } from '../api/axios';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await getCsrfCookie();

    const res = await apiClient.post('/api/login', {
      email,
      password,
    });

    console.log('Login sukses:', res.data);

    navigate('/admin/users'); 
  } catch (err) {
    console.error('Error saat login:', err);
    if (err.response && err.response.status === 422) {
      setError('Email atau password salah.');
    } else {
      setError('Terjadi kesalahan koneksi ke server.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        {error && <p className="text-red-500 text-sm mb-4 bg-red-100 p-3 rounded">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}