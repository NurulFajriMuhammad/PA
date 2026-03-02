import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  BsGridFill,
  BsBellFill,
  BsQuestionCircleFill,
  BsPersonFill,
  BsBoxArrowRight,
} from "react-icons/bs";

// 1. Tambahkan props isSidebarOpen di sini
export default function TopHeader({ isSidebarOpen }) {
  const { user: userDataContainer, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!userDataContainer || !userDataContainer.user) {
    return null;
  }

  const user = userDataContainer.user;
  const userName = user.name || "Pengguna";
  const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : "User";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <style>
        {`
          .top-header-container {
            background-color: #ffffff;
            border-bottom: 1px solid #e0e0e0;
            padding: 16px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 70px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            position: sticky;
            top: 0;
            z-index: 900;
          }

          /* --- ANIMASI JUDUL --- */
          .header-title {
            font-size: 1.5em;
            font-weight: 700;
            color: #333;
            letter-spacing: 0.3px;
            
            /* Logika Animasi */
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: ${isSidebarOpen ? "0" : "1"};
            transform: ${isSidebarOpen ? "translateX(-20px)" : "translateX(0)"};
            pointer-events: ${isSidebarOpen ? "none" : "auto"};
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 24px;
          }
          
          .header-icons {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 1.3em;
            color: #555;
          }

          .header-icons span {
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 8px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .header-icons span:hover {
            background-color: #f5f5f5;
            color: #007bff;
            transform: translateY(-2px);
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 6px 8px 6px 16px;
            border-radius: 50px;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .user-profile:hover {
            background-color: #e9ecef;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .user-info {
            text-align: right;
            pointer-events: none;
          }

          .user-info .user-name {
            font-weight: 600;
            color: #333;
            font-size: 0.95em;
            margin-bottom: 2px;
          }

          .user-info .user-role {
            font-size: 0.8em;
            color: #777;
            text-transform: capitalize;
          }
          
          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #007bff;
            border: 2px solid #ffffff;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1em;
            font-weight: 700;
            transition: all 0.3s ease;
            box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
            pointer-events: none;
          }

          .user-menu-container {
            position: relative;
          }

          .user-dropdown {
            position: absolute;
            top: calc(100% + 8px); 
            right: 0;
            width: 140px;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            z-index: 1100;
            padding: 6px 0;
            overflow: hidden;
            animation: fadeIn 0.2s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 4px 8px;
            font-size: 0.9em;
            color: #333;
            text-decoration: none; 
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
          
          .dropdown-item:hover {
            background-color: #f5f5f5;
          }

          .dropdown-divider {
            height: 1px;
            background-color: #f0f0f0;
            margin: 4px 0;
          }

          .dropdown-item.logout-item:hover {
             background-color: #FFF0F0;
             color: #D93025;
          }
        `}
      </style>

      <header className="top-header-container">
        {/* Teks AuditApp sekarang akan hilang/muncul berdasarkan isSidebarOpen */}
        <div className="header-title">AuditApp</div>

        <div className="header-actions">
          <div className="header-icons">
            <span title="Grid"><BsGridFill /></span>
            <span title="Notifications"><BsBellFill /></span>
            <span title="Help"><BsQuestionCircleFill /></span>
          </div>

          <div className="user-menu-container" ref={dropdownRef}>
            <div
              className="user-profile"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-role">{userRole}</div>
              </div>
              <div className="user-avatar" title="Buka menu user">
                {user?.name ? user.name.substring(0, 1).toUpperCase() : "U"}
              </div>
            </div>

            {isDropdownOpen && (
              <div className="user-dropdown">
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="item-icon"><BsPersonFill /></span>
                  <span className="item-text">Profile</span>
                </Link>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout-item" onClick={logout}>
                  <span className="item-icon"><BsBoxArrowRight /></span>
                  <span className="item-text">Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}