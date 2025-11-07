import React from 'react';
import { Link } from 'react-router-dom';
// Impor ikon yang dibutuhkan dari react-icons
import { 
  BsGrid1X2Fill, 
  BsPeopleFill, 
  BsClipboardCheck, 
  BsSearch, 
  BsBarChartFill, 
  BsGearFill,
  BsChevronLeft,
  BsChevronRight
} from 'react-icons/bs';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  return (
    <>
      <style>
        {`
          /* ... CSS Anda tidak berubah, tetap di sini ... */
          .sidebar-container {
            width: 260px;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            background-color: #2c3e50;
            color: white;
            box-shadow: 2px 0 8px rgba(0,0,0,0.15);
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            z-index: 1000;
            display: flex;
            flex-direction: column;
          }
          
          .sidebar-container.sidebar-collapsed {
            width: 70px;
          }

          .sidebar-header {
            position: relative;
            padding: 24px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            min-height: 70px;
            transition: all 0.3s;
          }

          .sidebar-container.sidebar-collapsed .sidebar-header {
            padding: 20px 10px;
            justify-content: center;
          }
          
          .sidebar-logo {
            font-size: 1.5em;
            font-weight: 700;
            white-space: nowrap;
            opacity: 1;
            transform: translateX(0);
            transition: opacity 0.25s ease-out, transform 0.25s ease-out;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, #ffffff 0%, #ecf0f1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .sidebar-container.sidebar-collapsed .sidebar-logo {
            opacity: 0;
            transform: translateX(-20px);
            width: 0;
            overflow: hidden;
          }

          .sidebar-toggle {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            width: 32px;
            height: 32px;
            background-color: rgba(52, 73, 94, 0.8);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            cursor: pointer;
            font-size: 1.3em;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }

          .sidebar-toggle:hover {
            background-color: rgba(74, 99, 125, 0.9);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-50%) scale(1.05);
          }

          .sidebar-toggle:active {
            transform: translateY(-50%) scale(0.95);
          }

          .sidebar-container.sidebar-collapsed .sidebar-toggle {
            right: auto;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          .sidebar-container.sidebar-collapsed .sidebar-toggle:hover {
            transform: translate(-50%, -50%) scale(1.05);
          }

          .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px 0;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
          }

          .sidebar-nav::-webkit-scrollbar {
            width: 6px;
          }

          .sidebar-nav::-webkit-scrollbar-track {
            background: transparent;
          }

          .sidebar-nav::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }

          .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .sidebar-nav li {
            margin-bottom: 4px;
            padding: 0 12px;
          }

          .sidebar-nav a {
            color: #ecf0f1;
            text-decoration: none;
            display: flex;
            align-items: center;
            padding: 12px 14px;
            border-radius: 8px;
            transition: all 0.25s ease;
            white-space: nowrap;
            position: relative;
            overflow: hidden;
          }

          .sidebar-nav a::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background-color: #3498db;
            transform: scaleY(0);
            transition: transform 0.25s ease;
          }

          .sidebar-nav a:hover {
            background-color: rgba(52, 73, 94, 0.6);
            transform: translateX(4px);
          }

          .sidebar-nav a.active {
            background-color: rgba(52, 152, 219, 0.2);
            color: #ffffff;
            font-weight: 600;
          }

          .sidebar-nav a.active::before {
            transform: scaleY(1);
          }

          .sidebar-nav a:hover::before {
            transform: scaleY(0.6);
          }

          .sidebar-container.sidebar-collapsed .sidebar-nav a {
            justify-content: center;
            padding: 12px 0;
          }

          .sidebar-container.sidebar-collapsed .sidebar-nav a:hover {
            transform: translateX(0) scale(1.05);
          }

          .sidebar-icon {
            font-size: 1.3em;
            margin-right: 14px;
            width: 32px;
            text-align: center;
            flex-shrink: 0;
            transition: transform 0.25s ease;
            /* Tambahan: Pastikan ikon di tengah sempurna */
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .sidebar-nav a:hover .sidebar-icon {
            transform: scale(1.1);
          }

          .sidebar-container.sidebar-collapsed .sidebar-icon {
            margin-right: 0;
          }

          .sidebar-text {
            transition: opacity 0.2s ease, transform 0.2s ease;
            opacity: 1;
            transform: translateX(0);
            font-size: 0.95em;
            font-weight: 500;
          }

          .sidebar-container.sidebar-collapsed .sidebar-text {
            opacity: 0;
            transform: translateX(-10px);
            width: 0;
            overflow: hidden;
            pointer-events: none;
          }

          .sidebar-footer {
            padding: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            font-size: 0.8em;
            color: rgba(255, 255, 255, 0.5);
            transition: opacity 0.3s;
          }

          .sidebar-container.sidebar-collapsed .sidebar-footer {
            opacity: 0;
          }

          @media (max-width: 768px) {
            .sidebar-container {
              width: 260px;
              transform: translateX(-100%);
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .sidebar-container.sidebar-collapsed {
              transform: translateX(-100%);
              width: 260px;
            }

            .sidebar-container:not(.sidebar-collapsed) {
              transform: translateX(0);
            }
          }
        `}
      </style>
      
      <div className={`sidebar-container ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <div className="sidebar-logo">AuditApp</div>}
          
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {/* GANTI: Teks '‹' dan '›' diubah jadi komponen ikon */}
            {isSidebarOpen ? <BsChevronLeft /> : <BsChevronRight />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/">
                {/* GANTI: Emoji 📊 jadi ikon */}
                <span className="sidebar-icon"><BsGrid1X2Fill /></span>
                <span className="sidebar-text">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users">
                {/* GANTI: Emoji 👥 jadi ikon */}
                <span className="sidebar-icon"><BsPeopleFill /></span>
                <span className="sidebar-text">Manajemen User</span>
              </Link>
            </li>
            <li>
              <Link to="/audits">
                {/* GANTI: Emoji 📋 jadi ikon */}
                <span className="sidebar-icon"><BsClipboardCheck /></span>
                <span className="sidebar-text">Daftar Audit</span>
              </Link>
            </li>
            <li>
              <Link to="/findings">
                {/* GANTI: Emoji 🔍 jadi ikon */}
                <span className="sidebar-icon"><BsSearch /></span>
                <span className="sidebar-text">Temuan</span>
              </Link>
            </li>
            <li>
              <Link to="/reports">
                {/* GANTI: Emoji 📈 jadi ikon */}
                <span className="sidebar-icon"><BsBarChartFill /></span>
                <span className="sidebar-text">Laporan</span>
              </Link>
            </li>
            <li>
              <Link to="/settings">
                {/* GANTI: Emoji ⚙️ jadi ikon */}
                <span className="sidebar-icon"><BsGearFill /></span>
                <span className="sidebar-text">Pengaturan</span>
              </Link>
            </li>
          </ul>
        </nav>

        {isSidebarOpen && (
          <div className="sidebar-footer">
            © 2024 AuditApp v1.0
          </div>
        )}
      </div>
    </>
  );
}