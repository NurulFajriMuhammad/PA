import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  return (
    <>
      <style>
        {`
          .sidebar-container {
            width: 250px;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            background-color: #2c3e50;
            color: white;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
            transition: width 0.3s ease-out;
            overflow: hidden;
            padding-top: 0; /* Hapus padding-top agar logo bisa di paling atas */
          }
          
          .sidebar-container.sidebar-collapsed {
            width: 80px;
          }

          /* --- START: Logo dan Toggle --- */
          .sidebar-header { /* Ini adalah div baru untuk membungkus logo dan toggle */
            position: relative; /* Penting untuk posisi absolut tombol */
            padding: 20px;
            display: flex; /* Gunakan flexbox untuk rata tengah */
            align-items: center; /* Vertikal tengah */
            justify-content: center; /* Horizontal tengah saat terbuka */
            margin-bottom: 20px;
            transition: all 0.3s;
          }

          .sidebar-container.sidebar-collapsed .sidebar-header {
            justify-content: center; /* Tetap di tengah saat tertutup */
          }
          
          .sidebar-logo {
            font-size: 1.5em;
            font-weight: bold;
            white-space: nowrap; /* Pastikan teks tidak turun baris */
            opacity: 1;
            transform: translateX(0);
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
          }

          /* Sembunyikan dan geser logo saat tertutup */
          .sidebar-container.sidebar-collapsed .sidebar-logo {
            opacity: 0;
            transform: translateX(-20px);
            width: 0; /* Untuk memastikan tidak mengambil ruang */
            margin-left: -20px; /* Sedikit geser agar tidak terlihat */
          }

          /* Tombol toggle diposisikan di sudut kanan atas header */
          .sidebar-toggle {
            position: absolute;
            right: 15px; /* Sesuaikan jarak dari kanan */
            top: 50%; /* Tengah vertikal */
            transform: translateY(-50%); /* Penyesuaian agar pas di tengah */
            width: 30px; /* Ukuran tombol lebih kecil */
            height: 30px;
            background-color: #34495e;
            color: white;
            border: none;
            border-radius: 5px; /* Kotak sedikit melengkung */
            cursor: pointer;
            font-size: 1.2em; /* Ukuran icon */
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s;
          }

          .sidebar-toggle:hover {
            background-color: #4a637d;
          }

          /* Posisikan tombol sedikit berbeda saat sidebar tertutup */
          .sidebar-container.sidebar-collapsed .sidebar-toggle {
            right: auto; /* Hapus positioning right */
            left: 50%; /* Pindahkan ke tengah */
            transform: translate(-50%, -50%); /* Sesuaikan transform */
          }
          /* --- END: Logo dan Toggle --- */


          .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .sidebar-nav li {
            margin-bottom: 10px;
          }

          .sidebar-nav a {
            color: #ecf0f1;
            text-decoration: none;
            display: flex;
            align-items: center;
            padding: 10px 15px;
            border-radius: 5px;
            transition: background-color 0.3s;
            white-space: nowrap;
          }

          .sidebar-nav a:hover,
          .sidebar-nav a.active {
            background-color: #34495e;
          }

          .sidebar-icon {
            font-size: 1.2em;
            margin-right: 15px;
            width: 30px;
            text-align: center;
          }

          .sidebar-text {
            transition: opacity 0.2s 0.1s, transform 0.2s 0.1s;
            opacity: 1;
            transform: translateX(0);
          }

          .sidebar-container.sidebar-collapsed .sidebar-text {
            opacity: 0;
            transform: translateX(-10px);
            width: 0;
            pointer-events: none; /* Cegah hover pada teks yang tersembunyi */
          }
        `}
      </style>
      
      <div className={`sidebar-container ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header"> {/* Div baru untuk header sidebar */}
          {/* Teks logo hanya muncul saat sidebar terbuka */}
          {isSidebarOpen && <div className="sidebar-logo">AuditApp</div>}
          
          {/* Tombol toggle sekarang ada di dalam header */}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? '‹' : '›'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/">
                <span className="sidebar-icon">📊</span>
                <span className="sidebar-text">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users">
                <span className="sidebar-icon">👥</span>
                <span className="sidebar-text">Manajemen User</span>
              </Link>
            </li>
            {/* Tambahkan link lain di sini */}
          </ul>
        </nav>
      </div>
    </>
  );
}