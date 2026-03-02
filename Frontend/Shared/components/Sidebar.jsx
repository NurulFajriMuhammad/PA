import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BsGrid1X2, BsBuilding, BsShare, BsSearch, BsArrowRepeat, 
  BsGear, BsDatabaseGear, BsPersonVcard, 
  BsChevronDown, BsShieldCheck, BsFolder2Open 
} from 'react-icons/bs';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const sidebarRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isChildActive = (parentPath) => location.pathname.startsWith(parentPath);

  const [openDropdown, setOpenDropdown] = useState(() => {
    const path = location.pathname;
    if (path.startsWith('/profil')) return 'profil';
    if (path.startsWith('/internal')) return 'internal';
    if (path.startsWith('/master-data')) return 'master';
    if (path.startsWith('/pengaturan')) return 'pengaturan';
    return null;
  });

  const [floatingPos, setFloatingPos] = useState(0); 

  useEffect(() => {
    setOpenDropdown(null);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const handleDropdownToggle = (e, menuName) => {
    e.preventDefault();
    if (!isSidebarOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setFloatingPos(rect.top);
    }
    setOpenDropdown(prev => prev === menuName ? null : menuName);
  };

  const closeFloatingOnNav = () => {
    if (!isSidebarOpen) setOpenDropdown(null);
  };

  const getTooltip = (text) => !isSidebarOpen ? text : "";

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
            --transition-speed: 0.3s; /* Sedikit diperlambat agar lebih elegan */
          }

          .sidebar-container {
            width: var(--sb-width);
            height: 100vh;
            position: fixed;
            background: var(--audit-navy);
            color: var(--audit-text);
            transition: width var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            border-right: 1px solid rgba(255,255,255,0.05);
          }
          
          .sidebar-collapsed { width: var(--sb-collapsed); }

          .sidebar-header {
            padding: 0 20px;
            display: flex;
            align-items: center;
            min-height: 75px;
            background: rgba(0,0,0,0.1);
            justify-content: ${isSidebarOpen ? 'flex-start' : 'center'};
            cursor: pointer;
          }

          /* Animasi khusus logo di header */
          .header-logo {
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .sidebar-collapsed .header-logo {
            transform: scale(1.1);
          }

          .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            scrollbar-width: none;
            padding: 10px 0;
          }
          .sidebar-nav::-webkit-scrollbar { display: none; }

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
            transition: all 0.2s ease;
          }

          .sidebar-collapsed .nav-link, 
          .sidebar-collapsed .dropdown-btn {
            padding: 15px 0;
            justify-content: center;
          }

          .nav-link:hover, .dropdown-btn:hover {
            background: var(--audit-navy-light);
          }

          /* Efek Icon saat Hover */
          .nav-link:hover .sidebar-icon, 
          .dropdown-btn:hover .sidebar-icon {
            transform: scale(1.1);
            color: var(--audit-blue-primary);
          }

          .nav-link.active, .dropdown-btn.active-parent {
            background: rgba(59, 130, 246, 0.12) !important;
            color: var(--audit-blue-primary) !important;
            box-shadow: inset 4px 0 0 var(--audit-blue-primary);
          }

          /* ANIMASI ICON UTAMA */
          .sidebar-icon { 
            font-size: 1.2rem; 
            min-width: ${isSidebarOpen ? '35px' : '0'};
            display: flex;
            justify-content: center;
            flex-shrink: 0;
            transition: all var(--transition-speed) ease; /* Membuat perpindahan posisi ikon halus */
          }

          .sidebar-text {
            white-space: nowrap;
            display: ${isSidebarOpen ? 'block' : 'none'};
            margin-left: 10px;
            opacity: ${isSidebarOpen ? '1' : '0'};
            transition: opacity 0.2s ease;
          }

          .chevron { 
            margin-left: auto; 
            display: ${isSidebarOpen ? 'block' : 'none'}; 
            transition: transform 0.2s ease;
          }

          /* --- SUBMENU LOGIC --- */
          .submenu-list {
            list-style: none;
            padding: 0;
            margin: 0;
            background: rgba(0,0,0,0.1);
            overflow: hidden;
          }

          .sidebar-container:not(.sidebar-collapsed) .submenu-list {
            max-height: 0;
            transition: max-height 0.3s ease-out;
          }
          .sidebar-container:not(.sidebar-collapsed) .submenu-list.is-open {
            max-height: 1000px;
            transition: max-height 0.5s ease-in;
          }

          .sidebar-collapsed .submenu-list {
            display: none;
            visibility: hidden;
          }

          .sidebar-collapsed .submenu-list.is-open {
            display: block;
            visibility: visible;
            position: fixed;
            left: var(--sb-collapsed);
            margin-left: 5px;
            width: 240px;
            background: var(--audit-navy);
            box-shadow: 12px 0 30px rgba(0,0,0,0.5);
            border-radius: 0 8px 8px 8px;
            z-index: 9999;
            border: 1px solid rgba(255,255,255,0.1);
            transition: none !important; 
          }

          .submenu-item {
            display: block;
            padding: 10px 20px 10px 65px;
            color: var(--audit-text-muted);
            text-decoration: none;
            font-size: 0.85rem;
            transition: all 0.2s ease;
          }

          .sidebar-collapsed .submenu-item { padding: 12px 20px; }
          .submenu-item:hover { color: white; background: var(--audit-navy-light); padding-left: ${isSidebarOpen ? '70px' : '25px'}; }

          .nav-section-label {
            padding: 18px 25px 8px;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: var(--audit-blue-primary);
            font-weight: 700;
            display: ${isSidebarOpen ? 'block' : 'none'};
            opacity: 0.6;
          }
        `}
      </style>

      <div ref={sidebarRef} className={`sidebar-container ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        
        <div className="sidebar-header" onClick={toggleSidebar}>
          <div className="header-logo">
            <BsShieldCheck style={{color: 'var(--audit-blue-primary)', fontSize: '1.6rem', flexShrink: 0}} />
          </div>
          <span className="sidebar-text" style={{fontWeight: 700, fontSize: '1.2rem'}}>AUDIT APP</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} title={getTooltip("Dashboard")} onClick={closeFloatingOnNav}>
            <span className="sidebar-icon"><BsGrid1X2 /></span>
            <span className="sidebar-text">Dashboard</span>
          </Link>

          <div className="nav-section-label">Organisasi</div>
          <div className="nav-item-wrapper">
            <button className={`dropdown-btn ${isChildActive('/profil') ? 'active-parent' : ''}`} onClick={(e) => handleDropdownToggle(e, 'profil')} title={getTooltip("Profil SPI")}>
              <span className="sidebar-icon"><BsPersonVcard /></span>
              <span className="sidebar-text">Profil SPI</span>
              <BsChevronDown className="chevron" style={{transform: openDropdown === 'profil' ? 'rotate(180deg)' : ''}}/>
            </button>
            <div className={`submenu-list ${openDropdown === 'profil' ? 'is-open' : ''}`} style={!isSidebarOpen ? { top: `${floatingPos}px` } : {}}>
              <Link to="/profil/visi-misi" className={`submenu-item ${isActive('/profil/visi-misi') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Visi & Misi</Link>
              <Link to="/profil/tujuan-sasaran" className={`submenu-item ${isActive('/profil/tujuan-sasaran') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Tujuan & Sasaran</Link>
              <Link to="/profil/piagam-audit" className={`submenu-item ${isActive('/profil/piagam-audit') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Piagam Audit</Link>
              <Link to="/profil/dasar-hukum" className={`submenu-item ${isActive('/profil/dasar-hukum') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Dasar Hukum</Link>
              <Link to="/profil/struktur-organisasi" className={`submenu-item ${isActive('/profil/struktur-organisasi') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Struktur & Tupoksi</Link>
              <Link to="/profil/profil-pengawas" className={`submenu-item ${isActive('/profil/profil-pengawas') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Profil Pengawas</Link>
              <Link to="/profil/standar-audit" className={`submenu-item ${isActive('/profil/standar-audit') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Standar Audit</Link>
              <Link to="/profil/achievement" className={`submenu-item ${isActive('/profil/achievement') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Achievement</Link>
              <Link to="/profil/audit-universe" className={`submenu-item ${isActive('/profil/audit-universe') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Audit Universe</Link>
              <Link to="/profil/rencana-panjang" className={`submenu-item ${isActive('/profil/rencana-panjang') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Rencana Jangka Panjang</Link>
              <Link to="/profil/rencana-tahunan" className={`submenu-item ${isActive('/profil/rencana-tahunan') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Rencana Tahunan</Link>
              <Link to="/profil/rencana-anggaran" className={`submenu-item ${isActive('/profil/rencana-anggaran') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Rencana Anggaran</Link>
            </div>
          </div>

          <div className="nav-section-label">Audit Execution</div>
          <div className="nav-item-wrapper">
            <button className={`dropdown-btn ${isChildActive('/internal') ? 'active-parent' : ''}`} onClick={(e) => handleDropdownToggle(e, 'internal')} title={getTooltip("Internal Audit")}>
              <span className="sidebar-icon"><BsBuilding /></span>
              <span className="sidebar-text">Internal Audit</span>
              <BsChevronDown className="chevron" style={{transform: openDropdown === 'internal' ? 'rotate(180deg)' : ''}}/>
            </button>
            <div className={`submenu-list ${openDropdown === 'internal' ? 'is-open' : ''}`} style={!isSidebarOpen ? { top: `${floatingPos}px` } : {}}>
              <Link to="/internal/surat-tugas" className={`submenu-item ${isActive('/internal/surat-tugas') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Surat Tugas</Link>
              <Link to="/internal/assurance" className={`submenu-item ${isActive('/internal/assurance') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Assurance</Link>
              <Link to="/internal/advisory-service" className={`submenu-item ${isActive('/internal/advisory-service') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Advisory Service</Link>
              <Link to="/internal/audit-evaluasi" className={`submenu-item ${isActive('/internal/audit-evaluasi') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Audit Evaluasi</Link>
              <Link to="/internal/consulting" className={`submenu-item ${isActive('/internal/consulting') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Consulting</Link>
            </div>
          </div>

          <Link to="/external-audit" className={`nav-link ${isActive('/external-audit') ? 'active' : ''}`} title={getTooltip("Eksternal Audit")} onClick={closeFloatingOnNav}>
            <span className="sidebar-icon"><BsShare /></span>
            <span className="sidebar-text">Eksternal Audit</span>
          </Link>

          <Link to="/audit-findings" className={`nav-link ${isActive('/audit-findings') ? 'active' : ''}`} title={getTooltip("Temuan Audit")} onClick={closeFloatingOnNav}>
            <span className="sidebar-icon"><BsSearch /></span>
            <span className="sidebar-text">Temuan Audit</span>
          </Link>

          <Link to="/follow-up" className={`nav-link ${isActive('/follow-up') ? 'active' : ''}`} title={getTooltip("Tindak Lanjut")} onClick={closeFloatingOnNav}>
            <span className="sidebar-icon"><BsArrowRepeat /></span>
            <span className="sidebar-text">Tindak Lanjut</span>
          </Link>

          <div className="nav-section-label">Konfigurasi</div>
          <div className="nav-item-wrapper">
            <button className={`dropdown-btn ${isChildActive('/master-data') ? 'active-parent' : ''}`} onClick={(e) => handleDropdownToggle(e, 'master')} title={getTooltip("Master Data")}>
              <span className="sidebar-icon"><BsDatabaseGear /></span>
              <span className="sidebar-text">Master Data</span>
              <BsChevronDown className="chevron" style={{transform: openDropdown === 'master' ? 'rotate(180deg)' : ''}}/>
            </button>
            <div className={`submenu-list ${openDropdown === 'master' ? 'is-open' : ''}`} style={!isSidebarOpen ? { top: `${floatingPos}px` } : {}}>
              <Link to="/master-data/template-kka" className={`submenu-item ${isActive('/master-data/template-kka') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Template KKA</Link>
              <Link to="/master-data/checklist-pemeriksaan" className={`submenu-item ${isActive('/master-data/checklist-pemeriksaan') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Checklist</Link>
            </div>
          </div>

          <Link to="/document-repository" className={`nav-link ${isActive('/document-repository') ? 'active' : ''}`} title={getTooltip("Repository Dokumen")} onClick={closeFloatingOnNav}>
            <span className="sidebar-icon"><BsFolder2Open /></span>
            <span className="sidebar-text">Repository Dokumen</span>
          </Link>

          <div className="nav-item-wrapper">
            <button className={`dropdown-btn ${isChildActive('/pengaturan') ? 'active-parent' : ''}`} onClick={(e) => handleDropdownToggle(e, 'pengaturan')} title={getTooltip("Pengaturan")}>
              <span className="sidebar-icon"><BsGear /></span>
              <span className="sidebar-text">Pengaturan</span>
              <BsChevronDown className="chevron" style={{transform: openDropdown === 'pengaturan' ? 'rotate(180deg)' : ''}}/>
            </button>
            <div className={`submenu-list ${openDropdown === 'pengaturan' ? 'is-open' : ''}`} style={!isSidebarOpen ? { top: `${floatingPos}px` } : {}}>
              <Link to="/pengaturan/status-pengajuan" className={`submenu-item ${isActive('/pengaturan/status-pengajuan') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Status Pengajuan</Link>
              <Link to="/pengaturan/setting-pengajuan" className={`submenu-item ${isActive('/pengaturan/setting-pengajuan') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Setting Pengajuan</Link>
              <Link to="/pengaturan/read-only" className={`submenu-item ${isActive('/pengaturan/read-only') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Hak Akses</Link>
              <Link to="/pengaturan/status-temuan" className={`submenu-item ${isActive('/pengaturan/status-temuan') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Status Temuan</Link>
              <Link to="/pengaturan/periode" className={`submenu-item ${isActive('/pengaturan/periode') ? 'active-sub' : ''}`} onClick={closeFloatingOnNav}>Periode Audit</Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}