import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function TopHeader() {
  const { user, logout } = useAuth(); // <-- 2. AMBIL USER & FUNGSI LOGOUT

  if (!user) {
    return null;
  }
  
  // 3. Ambil role name (dari kode UserManagement Anda, rolenya ada di array)
  const userRole = user.roles && user.roles.length > 0 
    ? user.roles[0].name 
    : 'User'; // Fallback jika tidak punya role

  return (
    <>
      <style>
        {`
          /* ... (Semua CSS Anda sebelumnya tetap di sini) ... */
          .top-header-container {
            background-color: #ffffff;
            border-bottom: 1px solid #e0e0e0;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between; /* Mendorong user info ke kanan */
            height: 70px; /* Memberi tinggi yang tetap */
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          .header-title {
            font-size: 1.5em; /* 24px */
            font-weight: 600;
            color: #333;
            /* Judul "Aplikasi Consulting" dari contoh Anda */
            /* Jika Anda ingin judul halaman (spt Dashboard) di sini, 
               kita perlu ubah logic-nya nanti */
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 20px; /* Jarak antar icon dan user */
          }
          
          .header-icons {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 1.4em; /* Ukuran icon */
            color: #555;
          }

          .header-icons span {
            cursor: pointer;
            transition: color 0.2s;
          }
          .header-icons span:hover {
            color: #007bff;
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .user-info {
            text-align: right;
          }

          .user-info .user-name {
            font-weight: 600;
            color: #333;
          }

          .user-info .user-role {
            font-size: 0.85em;
            color: #777;
          }
          
          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2em;
            font-weight: bold;
            color: #555;
            /* Placeholder untuk icon user */
          }
          .top-header-container {
            background-color: #ffffff; border-bottom: 1px solid #e0e0e0;
            padding: 16px 24px; display: flex; align-items: center;
            justify-content: space-between; height: 70px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .header-title { font-size: 1.5em; font-weight: 600; color: #333; }
          .header-actions { display: flex; align-items: center; gap: 20px; }
          .header-icons { display: flex; align-items: center; gap: 16px; font-size: 1.4em; color: #555; }
          .header-icons span { cursor: pointer; transition: color 0.2s; }
          .header-icons span:hover { color: #007bff; }
          .user-profile { display: flex; align-items: center; gap: 12px; }
          .user-info { text-align: right; }
          .user-info .user-name { font-weight: 600; color: #333; }
          .user-info .user-role { font-size: 0.85em; color: #777; }
          .user-avatar {
            width: 40px; height: 40px; border-radius: 50%;
            background-color: #007bff; /* Ganti warna avatar */
            color: white; /* Ganti warna teks inisial */
            display: flex; align-items: center; justify-content: center;
            font-size: 1.2em; font-weight: bold;
            cursor: pointer; /* Tambah cursor untuk logout */
          }
        `}
      </style>

      <header className="top-header-container">
        <div className="header-title">
          AuditApp
        </div>
        
        <div className="header-actions">
          <div className="header-icons">
            <span>Grid</span>
            <span>🔔</span>
            <span>❓</span>
          </div>
          
          <div className="user-profile">
            <div className="user-info">
              {/* 4. TAMPILKAN DATA DINAMIS */}
              <div className="user-name">{user.name}</div>
              <div className="user-role">{userRole}</div>
            </div>
            {/* 5. Avatar (klik untuk logout) */}
            <div className="user-avatar" onClick={logout} title="Logout">
              {user.name.substring(0, 1).toUpperCase()}
            </div>
          </div>

        </div>
      </header>
    </>
  );
}