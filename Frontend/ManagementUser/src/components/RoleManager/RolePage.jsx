import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Search, ShieldAlert, Key } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

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
      if (onRefresh) {
        await onRefresh();
      }
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
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Gagal menghapus role";
      notifyError(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoles = localRoles.filter((role) => {
    const nameMatch = role.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const permMatch = role.permissions?.some((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return nameMatch || permMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-indigo-600" />
            Manajemen Role & Hak Akses
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Konfigurasi peran pengguna dan petakan ke izin akses (permissions) yang didefinisikan sistem.
          </p>
        </div>
        <button
          onClick={handleAddRole}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md shadow-indigo-200 w-fit"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Role
        </button>
      </div>

      {/* Control Actions (Search) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm placeholder-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 self-end sm:self-auto">
          Total Role: <span className="text-indigo-600 text-sm font-bold">{filteredRoles.length}</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && filteredRoles.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="animate-spin h-8 w-8 text-indigo-600 mx-auto border-4 border-slate-200 border-t-indigo-600 rounded-full mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Memuat data role...</p>
        </div>
      )}

      {/* Roles Table */}
      {!isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Nama Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-800">{role.name}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95"
                          >
                            <Edit className="w-3.5 h-3.5 text-indigo-600" />
                            Edit
                          </button>
                          <button
                            onClick={() => setItemToDelete(role)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Search className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Tidak ada role ditemukan</p>
                          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda atau tambahkan role baru.</p>
                        </div>
                        <button
                          onClick={handleAddRole}
                          className="px-4 py-2 text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 rounded-lg transition-all"
                        >
                          Buat role pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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