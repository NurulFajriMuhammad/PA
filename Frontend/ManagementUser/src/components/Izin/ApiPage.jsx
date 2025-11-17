import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Copy } from "lucide-react";
import PermissionForm from "./PermissionForm";
import DeleteConfirmationModal from "../common/DeleteModal";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier";
import apiClient from "../../../../Shared/api/apiClient";

// Fungsi helper untuk mengekstrak array data dari respons API
const extractData = (response) => {
  return (
    response.data?.data || (Array.isArray(response.data) ? response.data : [])
  );
};

export default function ApiPage({ setNotification }) {
  // Menerima setNotification jika perlu
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State untuk Modals & CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Untuk proses simpan/hapus

  // ----------------------------------------
  // FETCH DATA
  // ----------------------------------------
  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/permissions");
      const dataArray = extractData(response);
      setPermissions(dataArray);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      // Gunakan notifyError jika setNotification tidak diteruskan dari parent
      const errorMsg =
        err.response?.data?.message || "Gagal memuat permissions";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // ----------------------------------------
  // CRUD Handlers (Menambahkan dari Kode 2)
  // ----------------------------------------

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
      await fetchPermissions(); // Refresh data
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMsg =
        err.response?.data?.message || "Gagal menyimpan permission";
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
      await fetchPermissions(); // Refresh data
    } catch (err) {
      console.error("❌ Delete Error:", err);
      notifyError("❌ Gagal menghapus permission");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPermission = (permission) => {
    navigator.clipboard.writeText(permission.name);
    notifySuccess(`✅ Permission disalin: ${permission.name}`);
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <div>
      {/* Header - Sesuai style Kode 2 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            🔑 Manajemen Permission
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Buat dan kelola permission/izin untuk kontrol akses
          </p>
        </div>
        <button
          onClick={handleAddPermission}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center hover:bg-green-700 transition-colors shadow-md w-fit"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Permission
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      {/* Permissions Table - Sesuai style Kode 2 */}
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nama Permission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Guard
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-blue-500">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 inline-block"
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
                  Memuat permissions...
                </td>
              </tr>
            ) : permissions.length > 0 ? (
              permissions.map((permission) => (
                <tr
                  key={permission.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded font-mono text-xs">
                      #{permission.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {permission.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {permission.guard_name || "api"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    {/* Tombol Aksi */}
                    {/* <button
                                            onClick={() => handleCopyPermission(permission)}
                                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors"
                                            title="Salin permission"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button> */}
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
                  ℹ️ Tidak ada permission ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
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
