import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  BsGridFill, 
  BsBellFill, 
  BsQuestionCircleFill,
  BsPersonFill,
  BsBoxArrowRight 
} from 'react-icons/bs';

export default function TopHeader({ isSidebarOpen }) {
  const { user, logout } = useAuth();
  console.log("USER DATA:", user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!user) return null;
  const userData = user?.user; // ambil data sebenarnya dari objek user

  // Helper untuk format role jadi kapital tiap kata
  const capitalizeEachWord = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  const userRole =
    user.roles && user.roles.length > 0
      ? capitalizeEachWord(user.roles[0].name)
      : "User";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <>
      <style>{`
        .top-header-container {
          background-color: #ffffff;
          border-bottom: 1px solid #e0e0e0;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          height: 70px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 900;
          transition: all 0.3s ease-in-out; 
        }

        .header-title {
          font-size: 1.5em;
          font-weight: 700;
          color: #333;
          transition: opacity 0.3s ease-out, width 0.3s ease-out, transform 0.3s ease-out, margin-right 0.3s ease-out;
          opacity: 1;
          width: auto;
          transform: translateX(0);
          margin-right: 16px;
          white-space: nowrap;
          overflow: hidden;
        }

        .header-title.hidden {
          opacity: 0;
          width: 0;
          transform: translateX(-20px);
          margin-right: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0; 
          margin-left: auto;
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
          font-weight: 700;
          color: #111;
          font-size: 0.95em;
          margin-bottom: 2px;
        }

        .user-info .user-role {
          font-size: 0.8em;
          color: #777;
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

        .dropdown-item.logout-item:hover .item-icon {
          color: #D93025;
        }
      `}</style>

      <header className="top-header-container">
        <div className={`header-title ${isSidebarOpen ? "hidden" : ""}`}>
          AuditApp
        </div>

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
  <div className="user-name">{userData?.name || "User"}</div>
  <div className="user-role">
    {userData?.roles && userData.roles.length > 0
      ? capitalizeEachWord(userData.roles[0].name)
      : "User"}
  </div>
</div>
<div className="user-avatar" title="Buka menu user">
  {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
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
