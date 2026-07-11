import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Copy, Search } from "lucide-react"; // Tambahkan Search icon
import PermissionForm from "./PermissionForm";
import DeleteConfirmationModal from "../common/DeleteModal";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier";
import apiClient from "../../../../Shared/api/apiClient";

const extractData = (response) => {
  return (
    response.data?.data || (Array.isArray(response.data) ? response.data : [])
  );
};

export default function ApiPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State untuk Filter
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/permissions");
      const dataArray = extractData(response);
      setPermissions(dataArray);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      const errorMsg = err.response?.data?.message || "Gagal memuat permissions";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // ----------------------------------------
  // LOGIKA FILTERING
  // ----------------------------------------
  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPermission = () => {
    setEditingPermission(null);
    setIsModalOpen(true);
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  const handleSavePermission = async (formData) => {
    setIsLoading(true);
    try {
      const payload = { name: formData.name };
      if (formData.id) {
        await apiClient.put(`/api/permissions/${formData.id}`, payload);
        notifySuccess("✅ Permission berhasil diperbarui");
      } else {
        await apiClient.post("/api/permissions", payload);
        notifySuccess("✅ Permission berhasil ditambahkan");
      }
      setIsModalOpen(false);
      setEditingPermission(null);
      await fetchPermissions();
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMsg = err.response?.data?.message || "Gagal menyimpan permission";
      notifyError(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermission = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/api/permissions/${itemToDelete.id}`);
      notifySuccess("✅ Permission berhasil dihapus");
      setItemToDelete(null);
      await fetchPermissions();
    } catch (err) {
      console.error("❌ Delete Error:", err);
      notifyError("❌ Gagal menghapus permission");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔑 Manajemen Permission</h2>
          <p className="text-gray-600 text-sm mt-1">Buat dan kelola permission/izin untuk kontrol akses</p>
        </div>
        <button
          onClick={handleAddPermission}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center hover:bg-green-700 transition-colors shadow-md w-fit"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Permission
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama permission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div className="text-sm text-gray-500">
          Menampilkan <strong>{filteredPermissions.length}</strong> dari <strong>{permissions.length}</strong> permission
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      {/* Permissions Table */}
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Permission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guard</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-blue-500">
                   {/* ... SVG Loading ... */}
                  Memuat permissions...
                </td>
              </tr>
            ) : filteredPermissions.length > 0 ? (
              filteredPermissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded font-mono text-xs">
                      {permission.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {permission.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {permission.guard_name || "web"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEditPermission(permission)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => setItemToDelete(permission)}
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
                  ℹ️ {searchTerm ? `Tidak ada permission dengan nama "${searchTerm}"` : "Tidak ada permission ditemukan"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PermissionForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPermission(null);
        }}
        onSave={handleSavePermission}
        existingPermission={editingPermission}
        isLoading={isLoading}
      />

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeletePermission}
        itemName={`Permission: ${itemToDelete?.name}`}
      />
    </div>
  );
}