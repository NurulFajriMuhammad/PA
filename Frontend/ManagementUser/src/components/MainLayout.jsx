import React from 'react';
import { Users, Shield, KeySquare } from 'lucide-react';
import Header from './Header';
import UserManagementPage from './UserManager/UserPage';
import RoleManagementPage from './RoleManager/RolePage';
import ApiManagerPage from './ApiManager/ApiPage';

// Komponen NavButton bisa diletakkan di sini karena spesifik untuk layout ini
const NavButton = ({ page, label, icon: Icon, currentPage, setCurrentPage }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center px-4 py-2 font-medium rounded-lg ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      <span>{label}</span>
    </button>
  );
};

const MainLayout = ({
  currentPage,
  setCurrentPage,
  users,
  roles,
  permissions,
  userId
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      
      <Header userId={userId} />

      <div className="p-4 md:p-8">

      {/* Navigasi Tab */}
      <nav className="flex space-x-2 mb-6 p-2 bg-white rounded-lg shadow-sm border border-gray-200 self-start">
        <NavButton page="users" label="Manajemen Pengguna" icon={Users} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavButton page="roles" label="Manajemen Role" icon={Shield} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavButton page="permissions" label="Manajemen API & Izin" icon={KeySquare} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </nav>

      </div>

      {/* Konten Halaman */}
      <main>
        {currentPage === 'users' && (
          <UserManagementPage 
            users={users} 
            roles={roles} 
            setNotification={handleSetNotification} 
          />
        )}
        {currentPage === 'roles' && (
          <RoleManagementPage 
            roles={roles} 
            permissions={permissions} 
            setNotification={handleSetNotification} 
          />
        )}
        {currentPage === 'permissions' && (
          <ApiManagerPage 
            permissions={permissions} 
            setNotification={handleSetNotification} 
          />
        )}
      </main>
    </div>
  );
};

export default MainLayout;