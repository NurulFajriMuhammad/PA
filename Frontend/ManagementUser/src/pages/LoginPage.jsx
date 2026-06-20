import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, CheckCircle2 } from "lucide-react";
// import apiClient from "../../../Shared/api/axios";
import apiClient from "../../../Shared/api/apiClient";
import { useAuth } from "../../../Shared/hooks/useAuth";
import { notifySuccess, notifyError } from '../../../Shared/utils/notifier';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     // POST ke endpoint login
  //     const response = await apiClient.post("/api/login", {
  //       email,
  //       password,
  //     });

  //     console.log("✅ Login Response:", response.data);

  //     // Ekstrak token dan user dari response
  //     // Sesuaikan dengan struktur response backend Anda
  //     const { token, data: userData } = response.data;

  //     if (!token) {
  //       throw new Error("Token tidak ditemukan di response");
  //     }

  //     // 1. Simpan token ke localStorage dengan key konsisten
  //     localStorage.setItem("authToken", token);
  //     localStorage.setItem("token", token);

  //     // 2. Simpan user data
  //     localStorage.setItem("user", JSON.stringify(userData));
  //     sessionStorage.setItem("isLoggedIn", "true");

  //     // 3. Set user di context/state
  //     if (setUser) {
  //       setUser({
  //         user: userData,
  //         token: token,
  //       });
  //     }

  //     console.log("✅ Token saved to localStorage:", token.substring(0, 10) + "...");

  //     notifySuccess("Login berhasil! Mengalihkan ke dashboard...");

  //     // 4. Redirect ke dashboard
  //     setTimeout(() => {
  //       navigate("/", { replace: true });
  //     }, 500);

  //   } catch (err) {
  //     console.error("❌ Error saat login:", err);

  //     // Clear storage jika ada error
  //     localStorage.removeItem("authToken");
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("user");

  //     const errorMessage =
  //       err.response?.data?.message ||
  //       err.message ||
  //       "Kredensial salah atau server error.";

  //     notifyError(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // POST ke endpoint login
    const response = await apiClient.post("/api/login", {
      email,
      password,
    });

    console.log("✅ Login Response:", response.data);

    // Ekstrak token dan user dari response
    // Response structure: { success, message, data: { user, token } }
    const { data } = response.data; // Nested destructuring
    
    if (!data || !data.token) {
      throw new Error("Token tidak ditemukan di response");
    }

    const { token, user: userData } = data;

    // 1. Simpan token ke localStorage dengan key konsisten
    // localStorage.setItem("authToken", token);
    localStorage.setItem("token", token);

    // 2. Simpan user data
    localStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("isLoggedIn", "true");

    // 3. Set user di context/state
    if (setUser) {
      setUser({
        user: userData,
        token: token,
      });
    }

    console.log("✅ Token saved to localStorage:", token.substring(0, 10) + "...");
    console.log("✅ User saved:", userData.name);

    notifySuccess("Login berhasil! Mengalihkan ke dashboard...");

    // 4. Redirect ke dashboard
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);

  } catch (err) {
    console.error("❌ Error saat login:", err);

    // Clear storage jika ada error
    // localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Kredensial salah atau server error.";

    notifyError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-slate-600 mt-4">Memverifikasi session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* === Bagian Kiri (Deskripsi) === */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 px-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                User Management
              </h1>
              <p className="text-slate-600 text-lg">System</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800">
              Kelola Pengguna dan Peran dengan Aman
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Platform terpusat untuk mengelola akses pengguna, peran, dan izin API 
              di seluruh lingkungan aplikasi Anda dengan kontrol penuh.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">
                  Role-Based Access Control (RBAC)
                </p>
                <p className="text-sm text-slate-600">
                  Definisikan izin berdasarkan peran pengguna
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">API Gateway Security</p>
                <p className="text-sm text-slate-600">
                  Lindungi endpoint API dengan manajemen izin terpusat
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">
                  Auditability & Compliance
                </p>
                <p className="text-sm text-slate-600">
                  Pelacakan pengguna untuk kepatuhan dan audit internal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* === Bagian Kanan (Form Login) === */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg shadow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">
                User Management System
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Masuk ke Panel Admin
              </h2>
              <p className="text-slate-600">
                Masukkan kredensial Anda untuk mengelola sistem
              </p>
            </div>

            {/* Form Login */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Admin
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                  placeholder="admin@perusahaan.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
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
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ingat Saya */}
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

              {/* Tombol Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
            <p>© 2025 User Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}