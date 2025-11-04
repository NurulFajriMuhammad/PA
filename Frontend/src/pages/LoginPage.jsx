import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient, { getCsrfCookie } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  //  const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError('');
  //   setLoading(true);

  //   try {
  //     await getCsrfCookie();
  //     console.log('CSRF cookie didapatkan');

  //     await apiClient.post('/api/login', {
  //       email,
  //       password,
  //     });

  //     const response = await apiClient.get('/api/user');
  //     setUser(response.data);
  //     navigate('/');

  //   } catch (err) {
  //     console.error('Error saat login:', err);
  //     if (err.response && (err.response.status === 422 || err.response.status === 401)) {
  //       setError('Email atau password salah. Silakan coba lagi.');
  //     } else {
  //       setError('Terjadi kesalahan koneksi ke server. Periksa koneksi Anda.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // 1️⃣ Ambil cookie CSRF dulu
    await getCsrfCookie();
    console.log('CSRF cookie didapatkan');

    // 2️⃣ Ambil token XSRF dari cookie (opsional, tapi aman)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    // 3️⃣ Kirim login dengan credentials dan token
    const loginResponse = await apiClient.post(
      '/api/login',
      { email, password },
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token || ''),
        },
      }
    );

    console.log('Login sukses:', loginResponse.data);

    // 4️⃣ Ambil data user
    const userResponse = await apiClient.get('/api/user');
    setUser(userResponse.data);

    navigate('/');
  } catch (err) {
    console.error('Error saat login:', err);
    if (err.response && (err.response.status === 422 || err.response.status === 401)) {
      setError('Email atau password salah. Silakan coba lagi.');
    } else if (err.response && err.response.status === 419) {
      setError('Session expired atau CSRF token tidak valid. Refresh halaman lalu coba lagi.');
    } else {
      setError('Terjadi kesalahan koneksi ke server. Periksa koneksi Anda.');
    }
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 px-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Audit Management</h1>
              <p className="text-slate-600 text-lg">System</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800">
              Kelola Audit dengan Lebih Efisien
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Platform terpadu untuk mengelola seluruh proses audit internal dan eksternal 
              dengan keamanan tingkat enterprise.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">Compliance Management</p>
                <p className="text-sm text-slate-600">Pantau kepatuhan regulasi secara real-time</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">Risk Assessment</p>
                <p className="text-sm text-slate-600">Identifikasi dan kelola risiko dengan sistematis</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">Reporting & Analytics</p>
                <p className="text-sm text-slate-600">Laporan komprehensif dan insights mendalam</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg shadow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Audit System</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang Kembali</h2>
              <p className="text-slate-600">Masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Login Gagal</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                  placeholder="nama@perusahaan.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none pr-12"
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"

                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="text-slate-600">Ingat saya</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </button>
            </form>

          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-600">
            <p>© 2025 Audit Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}