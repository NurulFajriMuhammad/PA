import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Copy } from "lucide-react";
import RoleModal from "./RoleModal";
import DeleteConfirmationModal from "../common/DeleteModal";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier";
import apiClient from "../../../../Shared/api/apiClient";

const RolePage = ({ roles = [], permissions = [], setNotification, onRefresh }) => {
  const [localRoles, setLocalRoles] = useState(roles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch roles saat component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // ✅ Update local state saat props roles berubah
  useEffect(() => {
    if (Array.isArray(roles) && roles.length > 0) {
      setLocalRoles(roles);
      console.log("✅ Roles updated from props:", roles);
    }
  }, [roles]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/roles");
      console.log("📡 Raw response:", res.data);

      // Handle berbagai format response
      const rolesData = res.data?.data || res.data || [];
      setLocalRoles(Array.isArray(rolesData) ? rolesData : []);
      console.log("✅ Roles fetched:", rolesData);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      notifyError("❌ Gagal memuat roles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleSaveRole = async (formData) => {
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        permission_ids: formData.permissionIds || [],
      };

      console.log("📤 Sending payload:", payload);

      if (formData.id) {
        await apiClient.put(`/api/roles/${formData.id}`, payload);
        notifySuccess("✅ Role berhasil diperbarui");
      } else {
        await apiClient.post("/api/roles", payload);
        notifySuccess("✅ Role berhasil ditambahkan");
      }

      setIsModalOpen(false);
      setEditingRole(null);
      await fetchRoles(); // ✅ Fetch ulang setelah save
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal menyimpan role";
      notifyError(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);

    try {
      await apiClient.delete(`/api/roles/${itemToDelete.id}`);
      notifySuccess("✅ Role berhasil dihapus");
      setItemToDelete(null);
      await fetchRoles(); // ✅ Fetch ulang setelah delete
    } catch (err) {
      console.error("❌ Delete Error:", err);
      notifyError("❌ Gagal menghapus role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRole = (role) => {
    const roleText = `${role.name} (${role.permissions?.length || 0} permissions)`;
    navigator.clipboard.writeText(roleText);
    notifySuccess(`✅ Role disalin: ${roleText}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔐 Manajemen Role</h2>
          <p className="text-gray-600 text-sm mt-1">
            Buat dan kelola role dengan permission yang sesuai
          </p>
        </div>
        <button
          onClick={handleAddRole}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-md w-fit"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Role
        </button>
      </div>

      {/* Loading State */}
      {isLoading && localRoles.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2">Memuat roles...</p>
        </div>
      )}

      {/* Roles Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow border overflow-x-auto">
          <table className="w-full min-w-max divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Permission</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {Array.isArray(localRoles) && localRoles.length > 0 ? (
                localRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {role.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-1 flex-wrap max-w-xs">
                        {role.permissions?.slice(0, 3).map((perm) => (
                          <span
                            key={perm.id}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
                          >
                            {perm.name}
                          </span>
                        ))}
                        {role.permissions?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                            +{role.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                        {role.permissions?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <button
                        onClick={() => handleCopyRole(role)}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                        title="Salin role"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRole(role)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => setItemToDelete(role)}
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
                    ℹ️ Tidak ada role ditemukan. <br />
                    <button
                      onClick={handleAddRole}
                      className="text-blue-600 hover:underline mt-2"
                    >
                      Buat role pertama Anda
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSaveRole}
        existingRole={editingRole}
        permissions={permissions}
        isLoading={isLoading}
      />

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteRole}
        itemName={`Role: ${itemToDelete?.name}`}
      />
    </div>
  );
};

export default RolePage;