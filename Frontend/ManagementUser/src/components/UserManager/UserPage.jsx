import React, { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import UserModal from "./UserModal";
import DeleteConfirmationModal from "../common/DeleteModal";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier";
import apiClient from "../../../../Shared/api/apiClient";

const UserPage = ({ users = [], roles = [], setNotification, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // ✅ ADD THIS STATE

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (formData) => {
    setIsLoading(true);
    try {
      console.log("📡 Saving user:", formData);

      const payload = {
        name: formData.name,
        email: formData.email,
        // 'role_id': formData.roleIds || [],
        role_id: formData.roleIds || [],
        // role_ids: formData.roleIds || [],
        // role_id: formData.roleIds ? formData.roleIds[0] : null,
      };
      

      // Hanya include password jika ada
      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.passwordConfirmation || formData.password;
      }

      if (formData.id) {
        await apiClient.put(`/api/users/${formData.id}`, payload);
        notifySuccess("✅ User berhasil diperbarui");
      } else {
        await apiClient.post("/api/users", payload);
        notifySuccess("✅ User berhasil ditambahkan");
      }

      setIsModalOpen(false);
      setEditingUser(null);
      if (onRefresh) {
         await onRefresh(); 
      }
      
      
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal menyimpan user";
      notifyError(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);

    try {
      await apiClient.delete(`/api/users/${itemToDelete.id}`);
      notifySuccess("✅ User berhasil dihapus");
      setItemToDelete(null);
      
      await onRefresh();
      
    } catch (err) {
      console.error("❌ Delete Error:", err);
      notifyError("❌ Gagal menghapus user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">👥 Manajemen Pengguna</h2>
          <p className="text-gray-600 text-sm mt-1">
            Kelola pengguna, role, dan izin akses sistem
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-md w-fit"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles?.map((role) => (
                        <span
                          key={role.id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => setItemToDelete(user)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  ℹ️ Tidak ada user ditemukan. <br />
                  <button
                    onClick={handleAddUser}
                    className="text-blue-600 hover:underline mt-2"
                  >
                    Buat user pertama Anda
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        existingUser={editingUser}
        roles={roles}
        isLoading={isLoading} // ✅ PASS isLoading
      />

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteUser}
        itemName={`User: ${itemToDelete?.name}`}
      />
    </div>
  );
};

export default UserPage;