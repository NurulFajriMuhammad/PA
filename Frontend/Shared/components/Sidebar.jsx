import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BsGrid1X2, BsBuilding, BsShare, BsSearch, BsArrowRepeat, 
  BsBarChart, BsGear, BsDatabaseGear, BsPersonVcard, 
  BsChevronDown, BsChevronLeft, BsChevronRight, BsShieldCheck 
} from 'react-icons/bs';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  const handleDropdownToggle = (menuName) => {
    if (isSidebarOpen) {
      setOpenDropdown(openDropdown === menuName ? null : menuName);
    }
  };
  

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>
        {`
          :root {
            --audit-navy: #0f172a;
            --audit-navy-light: #1e293b;
            --audit-blue-primary: #3b82f6;
            --audit-text: #f8fafc;
            --audit-text-muted: #94a3b8;
            --sb-width: 280px;
            --sb-collapsed: 75px;
          }

          .sidebar-container {
            width: var(--sb-width);
            height: 100vh;
            position: fixed;
            background: var(--audit-navy);
            color: var(--audit-text);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
            display: flex;
            flex-direction: column;
          }
          
          .sidebar-collapsed { width: var(--sb-collapsed); }

          /* HIDE SCROLLBAR */
          .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-bottom: 50px;
          }
          .sidebar-nav::-webkit-scrollbar { display: none; }

          .sidebar-header {
            padding: 20px;
            display: flex;
            align-items: center;
            min-height: 75px;
            background: rgba(0,0,0,0.2);
            justify-content: ${isSidebarOpen ? 'flex-start' : 'center'};
          }

          .toggle-btn {
            position: absolute;
            right: -12px;
            top: 30px;
            width: 24px;
            height: 24px;
            background: var(--audit-blue-primary);
            border: none;
            border-radius: 4px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1100;
          }

          .nav-item-wrapper { position: relative; width: 100%; }

          .nav-link, .dropdown-btn {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            color: var(--audit-text);
            text-decoration: none;
            width: 100%;
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            transition: 0.2s;
          }

          /* Penyesuaian Icon saat Collapsed agar benar-benar di tengah */
          .sidebar-collapsed .nav-link, 
          .sidebar-collapsed .dropdown-btn {
            padding: 12px 0;
            justify-content: center;
          }

          .nav-link:hover, .dropdown-btn:hover {
            background: var(--audit-navy-light);
          }

          .nav-link.active {
            background: rgba(59, 130, 246, 0.1);
            color: var(--audit-blue-primary);
            box-shadow: inset 4px 0 0 var(--audit-blue-primary);
          }

          .sidebar-icon { 
            font-size: 1.25rem; 
            min-width: ${isSidebarOpen ? '35px' : '0'};
            display: flex;
            justify-content: center;
          }

          .sidebar-text {
            white-space: nowrap;
            opacity: ${isSidebarOpen ? '1' : '0'};
            display: ${isSidebarOpen ? 'block' : 'none'};
            margin-left: 10px;
          }

          .chevron { 
            margin-left: auto; 
            display: ${isSidebarOpen ? 'block' : 'none'}; 
            transition: transform 0.3s;
          }

          /* --- SUBMENU STYLE (OPEN SIDEBAR) --- */
          .submenu-list {
            list-style: none;
            padding: 0;
            margin: 0;
            background: rgba(0,0,0,0.15);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
          }

          .sidebar-container:not(.sidebar-collapsed) .submenu-list.is-open {
            max-height: 1000px;
            padding: 5px 0;
          }

          .submenu-item {
            display: block;
            padding: 10px 20px 10px 65px;
            color: var(--audit-text-muted);
            text-decoration: none;
            font-size: 0.85rem;
            transition: 0.2s;
          }

          .submenu-item:hover { color: white; background: rgba(255,255,255,0.05); }

/* --- FLOATING STYLE (COLLAPSED SIDEBAR WITH ANIMATION) --- */
@media (min-width: 769px) {

  .sidebar-collapsed .submenu-list {
    position: absolute;
    left: 85px;
    top: 0;
    width: 260px;
    background: var(--audit-navy);
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 10px 0;

    opacity: 0;
    transform: translateX(10px) scale(0.95);
    pointer-events: none;
    transition: 
      opacity 0.25s ease,
      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar-collapsed .nav-item-wrapper:hover .submenu-list {
    opacity: 1;
    transform: translateX(0) scale(1);
    pointer-events: auto;
  }

  .sidebar-collapsed .submenu-item {
    padding: 12px 20px;
  }

  .sidebar-collapsed .submenu-item:hover {
    background: var(--audit-navy-light);
    color: white;
  }
}

          .nav-section-label {
            padding: 20px 25px 10px;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--audit-blue-primary);
            font-weight: 800;
            display: ${isSidebarOpen ? 'block' : 'none'};
          }
        `}
      </style>

      <div className={`sidebar-container ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? <BsChevronLeft size={14}/> : <BsChevronRight size={14}/>}
        </button>

        <div className="sidebar-header">
          <BsShieldCheck className="logo-icon" />
          <span className="sidebar-text" style={{fontWeight: 800, fontSize: '1.1rem'}}>AUDIT SYSTEM</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <span className="sidebar-icon"><BsGrid1X2 /></span>
            <span className="sidebar-text">Dashboard</span>
          </Link>

          {/* --- ORGANISASI --- */}
          <div className="nav-section-label">Organisasi</div>
          
          <div className="nav-item-wrapper">
            <button className="dropdown-btn" onClick={() => handleDropdownToggle('profil')}>
              <span className="sidebar-icon"><BsPersonVcard /></span>
              <span className="sidebar-text">Profil SPI</span>
              <BsChevronDown className="chevron" style={{transform: openDropdown === 'profil' ? 'rotate(180deg)' : ''}}/>
            </button>
            <div className={`submenu-list ${openDropdown === 'profil' ? 'is-open' : ''}`}>
              <Link to="/profil/visi-misi" className="submenu-item">Visi & Misi</Link>
              <Link to="/profil/tujuan-sasaran" className="submenu-item">Tujuan & Sasaran</Link>
              <Link to="/profil/piagam-audit" className="submenu-item">Piagam Audit</Link>
              <Link to="/profil/dasar-hukum" className="submenu-item">Dasar Hukum</Link>
              <Link to="/profil/struktur-organisasi" className="submenu-item">Struktur & Tupoksi</Link>
              <Link to="/profil/profil-pengawas" className="submenu-item">Profil Pengawas</Link>
              <Link to="/profil/standar-audit" className="submenu-item">Standar Audit</Link>
              <Link to="/profil/achievement" className="submenu-item">Achievement</Link>
              <Link to="/profil/audit-universe" className="submenu-item">Audit Universe</Link>
              <Link to="/profil/rencana-panjang" className="submenu-item">Rencana Jangka Panjang</Link>
              <Link to="/profil/rencana-tahunan" className="submenu-item">Rencana Tahunan</Link>
              <Link to="/profil/rencana-anggaran" className="submenu-item">Rencana Anggaran</Link>
            </div>
          </div>

          {/* --- PELAKSANAAN --- */}
          <div className="nav-section-label">Audit Execution</div>
          
          <div className="nav-item-wrapper">
            <button className="dropdown-btn" onClick={() => handleDropdownToggle('internal')}>
              <span className="sidebar-icon"><BsBuilding /></span>
              <span className="sidebar-text">Internal Audit</span>
              <BsChevronDown className="chevron" style={{transform: openDropdown === 'internal' ? 'rotate(180deg)' : ''}}/>
            </button>
            <div className={`submenu-list ${openDropdown === 'internal' ? 'is-open' : ''}`}>
              <Link to="/internal/surat-tugas" className="submenu-item">Surat Tugas</Link>
              <Link to="/internal/assurance" className="submenu-item">Assurance</Link>
              <Link to="/internal/advisory-service" className="submenu-item">Advisory Service</Link>
              <Link to="/internal/audit-evaluasi" className="submenu-item">Audit Evaluasi</Link>
              <Link to="/internal/consulting" className="submenu-item">Consulting</Link>
            </div>
          </div>

          <Link to="/audit/external" className="nav-link">
            <span className="sidebar-icon"><BsShare /></span>
            <span className="sidebar-text">Eksternal Audit</span>
          </Link>

          <Link to="/findings" className="nav-link">
            <span className="sidebar-icon"><BsSearch /></span>
            <span className="sidebar-text">Temuan Audit</span>
          </Link>

          <Link to="/findings/follow-up" className="nav-link">
            <span className="sidebar-icon"><BsArrowRepeat /></span>
            <span className="sidebar-text">Tindak Lanjut</span>
          </Link>

          <Link to="/reports" className="nav-link">
            <span className="sidebar-icon"><BsBarChart /></span>
            <span className="sidebar-text">Laporan Berkas</span>
          </Link>

          {/* --- SYSTEM --- */}
          <div className="nav-section-label">Konfigurasi</div>
          
          <div className="nav-item-wrapper">
            <button className="dropdown-btn" onClick={() => handleDropdownToggle('master')}>
              <span className="sidebar-icon"><BsDatabaseGear /></span>
              <span className="sidebar-text">Master Data</span>
              <BsChevronDown className="chevron" style={{transform: openDropdown === 'master' ? 'rotate(180deg)' : ''}}/>
            </button>
            <div className={`submenu-list ${openDropdown === 'master' ? 'is-open' : ''}`}>
              <Link to="/master/template-kka" className="submenu-item">Template KKA</Link>
              <Link to="/master/checklist-pemeriksaan" className="submenu-item">Checklist</Link>
            </div>
          </div>

          <div className="nav-item-wrapper">
            <button className="dropdown-btn" onClick={() => handleDropdownToggle('setting')}>
              <span className="sidebar-icon"><BsGear /></span>
              <span className="sidebar-text">Pengaturan</span>
              <BsChevronDown className="chevron" style={{transform: openDropdown === 'setting' ? 'rotate(180deg)' : ''}}/>
            </button>
            <div className={`submenu-list ${openDropdown === 'setting' ? 'is-open' : ''}`}>
              <Link to="/setting/status-pengajuan" className="submenu-item">Status Pengajuan</Link>
              <Link to="/setting/setting-pengajuan" className="submenu-item">Setting Pengajuan</Link>
              <Link to="/setting/read-only" className="submenu-item">Hak Akses</Link>
              <Link to="/setting/status-temuan" className="submenu-item">Status Temuan</Link>
              <Link to="/setting/periode" className="submenu-item">Periode Audit</Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}