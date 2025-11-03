import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import AddUserModal from '../components/AddUserModal'; // <-- 1. IMPORT MODAL

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Buat state untuk mengontrol modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/api/users');
        setUsers(response.data.data); 
      } catch (err) {
        setError('Gagal memuat data pengguna.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []); 

  const handleEdit = (id) => {
    alert(`Edit user dengan ID: ${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Yakin ingin menghapus user ID: ${id}?`)) {
      try {
        // await apiClient.delete(`/api/users/${id}`); 
        setUsers(users.filter(user => user.id !== id));
        alert('User berhasil dihapus (simulasi)');
      } catch (err) {
        alert('Gagal menghapus user.');
        console.error(err);
      }
    }
  };

  // 3. Fungsi ini akan dipanggil oleh modal setelah user berhasil dibuat
  const handleUserAdded = (newUser) => {
    // Tambahkan user baru ke daftar 'users' di state
    setUsers([...users, newUser]); 
  };

  if (loading) {
    return <div className="p-8">Memuat data pengguna...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    // Gunakan <React.Fragment> atau <> untuk membungkus
    <> 
      <div className="p-8 font-sans">
        
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
            <p className="mt-1 text-gray-600">Atur peran dan akses untuk semua pengguna dalam sistem.</p>
          </div>
          {/* 4. Ubah tombol ini agar membuka modal */}
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsModalOpen(true)} // <-- Tambahkan onClick
          >
            + Tambah Pengguna Baru
          </button>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm text-gray-700 uppercase">
              <tr>
                <th className="p-4">Nama</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.roles[0]?.name === 'admin' ? 'bg-red-100 text-red-800' :
                      user.roles[0]?.name === 'auditor' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.roles[0]?.name || 'Tanpa Role'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleEdit(user.id)}
                      className="font-medium text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 5. Render komponen modal di sini */}
      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </>
  );
}