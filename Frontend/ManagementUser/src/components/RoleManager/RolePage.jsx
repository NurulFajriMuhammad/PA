import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react"; // Copy dihapus jika tidak dipakai
import RoleModal from "./RoleModal";
import DeleteConfirmationModal from "../common/DeleteModal";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier";
import apiClient from "../../../../Shared/api/apiClient";

const RolePage = ({
  roles = [],
  permissions = [],
  onRefresh,
}) => {
  const [localRoles, setLocalRoles] = useState(roles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (Array.isArray(roles)) {
      setLocalRoles(roles);
    }
  }, [roles]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/api/roles");
      const rolesData = res.data?.data || res.data || [];
      setLocalRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
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
      console.log("📡 Saving role:", formData);
      console.log("📡 Permission IDs:", formData.permissionIds);

      const payload = {
        name: formData.name,
        permission_ids: formData.permissionIds || [],
      };

      if (formData.id) {
        await apiClient.put(`/api/roles/${formData.id}`, payload);
        notifySuccess("✅ Role berhasil diperbarui");
      } else {
        await apiClient.post("/api/roles", payload);
        notifySuccess("✅ Role berhasil ditambahkan");
      }

      setIsModalOpen(false);
      setEditingRole(null);
      await fetchRoles();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal menyimpan role";
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
      await fetchRoles();
    } catch (err) {
      notifyError("❌ Gagal menghapus role");
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleAddRole}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-md w-fit"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Role
          </button>
          <span className="text-sm text-gray-700 mr-3">
            Total Role: <strong>{localRoles.length}</strong>
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && localRoles.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
          <div className="animate-spin h-8 w-8 text-blue-600 mx-auto border-4 border-t-transparent rounded-full mb-2"></div>
          <p>Memuat roles...</p>
        </div>
      )}

      {/* Roles Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow border overflow-x-auto">
          <table className="w-full min-w-max divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Permission
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Total Permission
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {localRoles.length > 0 ? (
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
                    {/* ✅ Isi Total Permission ditengah */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium min-w-[32px]">
                        {role.permissions?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
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
                    <button onClick={handleAddRole} className="text-blue-600 hover:underline mt-2">
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