import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios'; // <-- Impor apiClient

export default function UserManagementPage() {
  // State untuk menyimpan data dari API
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect untuk fetch data saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/api/users');
        setUsers(response.data.data); // Simpan data user ke state
      } catch (err) {
        setError('Gagal memuat data pengguna.');
        console.error(err);
      } finally {
        setLoading(false); // Hentikan loading, baik sukses maupun gagal
      }
    };

    fetchUsers();
  }, []); // Array kosong berarti efek ini hanya berjalan sekali

  // Tampilkan pesan loading
  if (loading) {
    return <div className="p-8">Memuat data pengguna...</div>;
  }
  
  // Tampilkan pesan error
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
      <p className="mt-1 text-gray-600">Atur peran dan akses untuk semua pengguna dalam sistem.</p>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        {/* ... (bagian search dan tombol tambah masih sama) ... */}

        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm text-gray-700 uppercase">
            {/* ... (Header tabel masih sama) ... */}
          </thead>
          <tbody>
            {/* Ganti MOCK_USERS dengan state 'users' */}
            {users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  {/* Ambil role dari data user */}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.roles[0]?.name === 'admin' ? 'bg-red-100 text-red-800' :
                    user.roles[0]?.name === 'auditor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.roles[0]?.name || 'Tanpa Role'}
                  </span>
                </td>
                <td className="p-4">
                  <button className="font-medium text-blue-600 hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}