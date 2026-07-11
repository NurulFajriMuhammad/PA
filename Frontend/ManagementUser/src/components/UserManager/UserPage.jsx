import React, { useState } from "react";
import { Plus, Trash2, Edit, Search, Shield, Briefcase, Mail, User } from "lucide-react";
import UserModal from "./UserModal";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier";
import apiClient from "../../../../Shared/api/apiClient";

const UserPage = ({ users = [], roles = [], onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

      // Validasi role_id harus ada
      if (!formData.roleIds || formData.roleIds.length === 0) {
        notifyError("❌ Pilih minimal satu role");
        setIsLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        role_id: formData.roleIds || [],
        jabatan_id: formData.jabatan_id,
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



  // Helper styling for roles
  const getRoleBadgeStyle = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin")) {
      return "bg-indigo-50 text-indigo-700 border border-indigo-100";
    } else if (name.includes("auditor")) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    } else if (name.includes("auditee")) {
      return "bg-amber-50 text-amber-700 border border-amber-100";
    } else {
      return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const filteredUsers = [...users]
    .sort((a, b) => a.id - b.id)
    .filter((u) => {
      const nameMatch = u.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const jabatanMatch = u.jabatan?.nama?.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = u.roles?.some((r) => r.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      return nameMatch || emailMatch || jabatanMatch || roleMatch;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-7 h-7 text-blue-600" />
            Manajemen Pengguna
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Kelola pengguna, penetapan peran (role), serta informasi jabatan struktural sistem.
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md shadow-blue-200 w-fit"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah User
        </button>
      </div>

      {/* Control Actions (Search) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, jabatan, atau role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm placeholder-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 self-end sm:self-auto">
          Total User: <span className="text-blue-600 text-sm font-bold">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jabatan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Nama */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm shadow-inner">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{user.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    {/* Jabatan */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.jabatan ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold border border-sky-100">
                          <Briefcase className="w-3.5 h-3.5" />
                          {user.jabatan.nama}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Staff / Non-Struktural</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap max-w-xs">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <span
                              key={role.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${getRoleBadgeStyle(role.name)}`}
                            >
                              <Shield className="w-3 h-3" />
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-300 italic text-xs">Tidak ada role</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            notifyConfirm(`Yakin ingin menghapus User: ${user.name}?`, async () => {
                              setIsLoading(true);
                              try {
                                await apiClient.delete(`/api/users/${user.id}`);
                                notifySuccess("✅ User berhasil dihapus");
                                if (onRefresh) await onRefresh();
                              } catch (err) {
                                console.error("❌ Delete Error:", err);
                                const errorMsg = err.response?.data?.message || err.message || "Gagal menghapus user";
                                notifyError(`❌ ${errorMsg}`);
                              } finally {
                                setIsLoading(false);
                              }
                            });
                          }}
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
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Tidak ada user ditemukan</p>
                        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda atau tambahkan user baru.</p>
                      </div>
                      <button
                        onClick={handleAddUser}
                        className="px-4 py-2 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg transition-all"
                      >
                        Buat user pertama
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
        isLoading={isLoading}
      />


    </div>
  );
};

export default UserPage;