import React, { useState } from 'react'; // Impor useState
import { Link } from 'react-router-dom';
// Impor ikon yang dibutuhkan dari react-icons
import { 
  // --- IKON OUTLINE KONSISTEN ---
  BsGrid1X2,
  BsPeople,
  BsClipboardCheck,
  BsBuilding,
  BsShare,
  BsSearch,
  BsArrowRepeat,
  BsBarChart,
  BsGear,
  BsDatabaseGear,
  // ------------------------------
  
  // --- IKON BARU UNTUK DROPDOWN ---
  BsPersonVcard,    // Ikon untuk Profil SPI
  BsChevronDown,    // Ikon panah dropdown
  // ------------------------------

  // Ikon Toggle
  BsChevronLeft,
  BsChevronRight
} from 'react-icons/bs';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  // State untuk melacak dropdown yang terbuka
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fungsi untuk toggle dropdown
  const handleDropdownToggle = (menuName) => {
    // Jika menu yang diklik sudah terbuka, tutup. Jika tidak, buka.
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  return (
    <>
      <style>
        {`
          /* ... CSS Anda tidak berubah ... */
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
            padding: 0 8px; /* Jarak tepi kiri/kanan 8px */
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
          
          /* --- CSS BARU UNTUK DROPDOWN --- */
 .sidebar-nav li.sidebar-dropdown-container {
            padding-left: 0;
            padding-right: 0;
            /* Tambahkan margin-bottom agar tidak menempel */
            margin-bottom: 4px;
          }

          .sidebar-dropdown-toggle {
            color: #ecf0f1;
            display: flex;
            align-items: center;
            /* Hapus radius di sini, kita atur di .open */
            border-radius: 0; 
            transition: all 0.25s ease;
            white-space: nowrap;
            
            /* --- INI PERBAIKANNYA --- */
            width: 100%; /* 1. Buat lebar penuh */
            margin: 0;   /* 2. Hapus margin */
            /* 3. Sesuaikan padding kiri (8px margin + 14px padding) */
            padding: 12px 14px 12px 22px; 
            /* ------------------------- */

            background: none;
            border: none;
            cursor: pointer;
            font-family: inherit;
            text-align: left;
            font-size: 0.95em;
            font-weight: 500;
          }

          /* Atur radius HANYA saat tidak terbuka */
          .sidebar-dropdown-toggle:not(.open) {
             /* Beri radius 8px di dalam gutter 8px */
             border-radius: 8px;
             width: calc(100% - 16px);
             margin: 0 8px;
             /* Kembalikan padding normal */
             padding: 12px 14px;
          }

          .sidebar-dropdown-toggle:hover:not(.open) {
            background-color: rgba(52, 73, 94, 0.6);
            transform: translateX(4px);
          }

          .sidebar-dropdown-toggle.open {
            background-color: rgba(52, 152, 219, 0.2);
            color: #ffffff;
            font-weight: 600;
            /* Atur radius atas agar menyatu */
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            /* Pastikan margin & padding full-width saat open */
            margin: 0;
            width: 100%;
            padding: 12px 14px 12px 22px;
          }

          .dropdown-chevron {
            margin-left: auto;
            font-size: 0.9em;
            transition: transform 0.3s ease;
          }

          .sidebar-dropdown-toggle.open .dropdown-chevron {
            transform: rotate(180deg);
          }

          .sidebar-submenu {
            list-style: none;
            padding: 0;
            background-color: rgba(0, 0, 0, 0.15);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
            margin: 0;
            width: 100%; 
            /* Atur radius bawah agar menyatu */
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
          }

          .sidebar-submenu.open {
            max-height: 600px;
            padding-top: 4px;
            padding-bottom: 8px; /* Beri padding bawah sedikit lebih banyak */
          }
          
          .sidebar-submenu li {
            padding: 0; 
            margin: 0;
          }

          .sidebar-submenu a {
            color: #bdc3c7;
            text-decoration: none;
            display: block; 
            white-space: normal;
            height: auto;
            transition: all 0.25s ease;
            font-size: 0.9em;
            /* 68px = 22px (padding kiri) + 32px (icon) + 14px (margin) */
            padding: 10px 14px 10px 68px; 
            margin: 0 8px 2px 8px; 
            border-radius: 6px;
          }
          
          .sidebar-submenu li:last-child a {
            margin-bottom: 0;
          }

          .sidebar-submenu a:hover {
            color: #ffffff;
            background-color: rgba(52, 73, 94, 0.8);
            transform: none; 
          }
          
          .sidebar-submenu a::before {
            display: none; 
          }

          /* Aturan untuk sidebar collapsed */
          .sidebar-container.sidebar-collapsed .sidebar-submenu {
            display: none;
          }
          
          .sidebar-container.sidebar-collapsed .dropdown-chevron {
            display: none;
          }
          
          .sidebar-container.sidebar-collapsed .sidebar-dropdown-toggle {
            justify-content: center;
            /* Kembalikan ke padding & margin normal saat collapsed */
            padding: 12px 14px;
            margin: 0 8px;
            width: calc(100% - 16px);
          }

          .sidebar-container.sidebar-collapsed .sidebar-dropdown-toggle:hover {
            transform: translateX(0) scale(1.05);
          }
          /* --- AKHIR CSS DROPDOWN --- */


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
            {isSidebarOpen ? <BsChevronLeft /> : <BsChevronRight />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/">
                <span className="sidebar-icon"><BsGrid1X2 /></span>
                <span className="sidebar-text">Dashboard</span>
              </Link>
            </li>

            {/* --- DROPDOWN 1: PROFIL --- */}
            <li className="sidebar-dropdown-container">
              <button 
                className={`sidebar-dropdown-toggle ${openDropdown === 'profil' ? 'open' : ''}`}
                onClick={() => handleDropdownToggle('profil')}
                aria-expanded={openDropdown === 'profil'}
                aria-controls="submenu-profil"
              >
                <span className="sidebar-icon"><BsPersonVcard /></span>
                <span className="sidebar-text">Profil SPI</span>
                <span className="dropdown-chevron"><BsChevronDown /></span>
              </button>
              
              <ul 
                id="submenu-profil"
                className={`sidebar-submenu ${openDropdown === 'profil' ? 'open' : ''}`}
              >
                <li><Link to="/profil/visi-misi">Visi & Misi, Core Values, Code of Ethics</Link></li>
                <li><Link to="/profil/tujuan-sasaran">Tujuan, Sasaran, Strategi pengawasan</Link></li>
                <li><Link to="/profil/piagam-audit">Piagam Audit Internal</Link></li>
                <li><Link to="/profil/struktur-organisasi">Struktur Organisasi dan Tugas Fungsi</Link></li>
                <li><Link to="/profil/profil-pengawas">Profil Pengawas</Link></li>
                <li><Link to="/profil/achievement">Achievement</Link></li>
                <li><Link to="/profil/audit-universe">Audit Universe</Link></li>
                <li><Link to="/profil/rencana-panjang">Rencana SPI Jangka Panjang</Link></li>
                <li><Link to="/profil/rencana-tahunan">Rencana Kerja Audit Tahunan</Link></li>
                <li><Link to="/profil/rencana-anggaran">Rencana Kerja Anggaran</Link></li>
              </ul>
            </li>


            <li>
              <Link to="/admin/users">
                <span className="sidebar-icon"><BsPeople /></span>
                <span className="sidebar-text">Manajemen User</span>
              </Link>
            </li>
            {/* <li>
              <Link to="/audits">
                <span className="sidebar-icon"><BsClipboardCheck /></span>
                <span className="sidebar-text">Daftar Audit</span>
              </Link>
            </li> */}
            
            {/* --- DROPDOWN 2: INTERNAL AUDIT (DIPERBAIKI) --- */}
            <li className="sidebar-dropdown-container">
              <button 
                className={`sidebar-dropdown-toggle ${openDropdown === 'internal' ? 'open' : ''}`}
                onClick={() => handleDropdownToggle('internal')}
                aria-expanded={openDropdown === 'internal'}
                aria-controls="submenu-internal"
              >
                <span className="sidebar-icon"><BsBuilding /></span>
                <span className="sidebar-text">Internal Audit</span>
                <span className="dropdown-chevron"><BsChevronDown /></span>
              </button>
              
              <ul 
                id="submenu-internal"
                className={`sidebar-submenu ${openDropdown === 'internal' ? 'open' : ''}`}
              >
                <li><Link to="/internal/surat-tugas">Surat Tugas</Link></li>
                <li><Link to="/internal/assurance">Assurance</Link></li>
                <li><Link to="/internal/advisory-service">Advisory Service</Link></li>
                <li><Link to="/internal/audit-evaluasi">Audit Evaluasi</Link></li>
                <li><Link to="/internal/consulting">Consulting</Link></li>
              </ul>
            </li>

            <li>
              <Link to="/audit/external">
                <span className="sidebar-icon"><BsShare /></span>
                <span className="sidebar-text">Eksternal Audit</span>
              </Link>
            </li>
            <li>
              <Link to="/findings">
                <span className="sidebar-icon"><BsSearch /></span>
                <span className="sidebar-text">Temuan</span>
              </Link>
            </li>
            <li>
              <Link to="/findings/follow-up">
                <span className="sidebar-icon"><BsArrowRepeat /></span>
                <span className="sidebar-text">Tindak Lanjut Temuan</span>
              </Link>
            </li>
            <li>
              <Link to="/reports">
                <span className="sidebar-icon"><BsBarChart /></span>
                <span className="sidebar-text">Laporan</span>
              </Link>
            </li>
            
            {/* --- DROPDOWN 3: MASTER (DIPERBAIKI) --- */}
            <li className="sidebar-dropdown-container">
              <button 
                className={`sidebar-dropdown-toggle ${openDropdown === 'master' ? 'open' : ''}`}
                onClick={() => handleDropdownToggle('master')}
                aria-expanded={openDropdown === 'master'}
                aria-controls="submenu-master"
              >
                <span className="sidebar-icon"><BsDatabaseGear /></span>
                <span className="sidebar-text">Master</span>
                <span className="dropdown-chevron"><BsChevronDown /></span>
              </button>
              
              <ul 
                id="submenu-master"
                className={`sidebar-submenu ${openDropdown === 'master' ? 'open' : ''}`}
              >
                <li><Link to="/master/template-kka">Template KKA</Link></li>
                <li><Link to="/master/checklist-pemeriksaan">Checklist Pemeriksaan</Link></li>
              </ul>
            </li>
            
            {/* --- DROPDOWN 4: SETTING (DIPERBAIKI) --- */}
            <li className="sidebar-dropdown-container">
              <button 
                className={`sidebar-dropdown-toggle ${openDropdown === 'setting' ? 'open' : ''}`}
                onClick={() => handleDropdownToggle('setting')}
                aria-expanded={openDropdown === 'setting'}
                aria-controls="submenu-setting"
              >
                <span className="sidebar-icon"><BsGear /></span>
                <span className="sidebar-text">Setting</span>
                <span className="dropdown-chevron"><BsChevronDown /></span>
              </button>
              
              <ul 
                id="submenu-setting"
                className={`sidebar-submenu ${openDropdown === 'setting' ? 'open' : ''}`}
              >
                <li><Link to="/setting/status-pengajuan">Status Pengajuan Pemeriksaan</Link></li>
                <li><Link to="/setting/setting-pengajuan">Setting Pengajuan Pemeriksaan</Link></li>
                <li><Link to="/setting/read-only">Read Only</Link></li>
                <li><Link to="/setting/status-temuan">Status Temuan</Link></li>
                <li><Link to="/setting/periode">Periode</Link></li>
              </ul>
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