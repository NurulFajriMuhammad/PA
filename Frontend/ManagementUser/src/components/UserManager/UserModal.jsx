import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import apiClient from "../../../../Shared/api/apiClient"; // Pastikan path ini benar
import { notifyError } from "../../../../Shared/utils/notifier";

const UserFormModal = ({
  isOpen,
  onClose,
  onSave,
  roles,
  existingUser,
  isLoading = false,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [jabatans, setJabatans] = useState([]); // State untuk daftar jabatan
  const [selectedJabatan, setSelectedJabatan] = useState(""); // State untuk jabatan terpilih
  const [errors, setErrors] = useState({});

  const isEdit = !!existingUser;

  // 1. Fetch Jabatans & Load Data User
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await apiClient.get("/api/jabatans");
        setJabatans(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch (err) {
        console.error("Gagal load jabatans", err);
        notifyError("Gagal memuat daftar jabatan");
      }
    };

    if (isOpen) {
      fetchInitialData();
      if (existingUser) {
        setName(existingUser.name || "");
        setEmail(existingUser.email || "");
        setSelectedJabatan(existingUser.jabatan_id || ""); // Load jabatan user
        setSelectedRoles(existingUser.roles?.map((r) => r.id) || []);
        setPassword("");
        setPasswordConfirm("");
      } else {
        setName("");
        setEmail("");
        setSelectedJabatan("");
        setPassword("");
        setPasswordConfirm("");
        setSelectedRoles([]);
      }
      setErrors({});
    }
  }, [existingUser, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!name?.trim()) newErrors.name = "Nama wajib diisi";
    if (!email?.trim()) newErrors.email = "Email wajib diisi";
    if (!selectedJabatan) newErrors.jabatan = "Jabatan wajib dipilih"; // Validasi jabatan
    if (selectedRoles.length === 0) newErrors.roles = "Pilih minimal satu role";
    
    if (!isEdit && !password) newErrors.password = "Password wajib diisi";
    if (password && password !== passwordConfirm) newErrors.passwordConfirm = "Password tidak cocok";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // 2. KIRIM DATA KE PARENT (UserPage)
    onSave({
      id: existingUser?.id || null,
      name,
      email,
      password: password || null,
      roleIds: selectedRoles,
      jabatan_id: selectedJabatan, // INI YANG BIKIN TERSIMPAN KE DATABASE
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <form onSubmit={submitForm} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b bg-blue-600 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">{isEdit ? "✏️ Edit Pengguna" : "➕ Tambah Pengguna"}</h2>
          <button type="button" onClick={onClose} className="hover:bg-blue-500 p-1 rounded"><X className="w-6 h-6" /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500" placeholder="Nama lengkap" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500" placeholder="email@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* 3. DROPDOWN JABATAN */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Jabatan</label>
            <select 
              value={selectedJabatan} 
              onChange={(e) => setSelectedJabatan(e.target.value)}
              className="w-full p-2.5 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 bg-white"
            >
              <option value="">-- Pilih Jabatan --</option>
              {jabatans.map((j) => (
                <option key={j.id} value={j.id}>{j.nama}</option>
              ))}
            </select>
            {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500" placeholder="******" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Konfirmasi Password</label>
              <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="w-full p-2.5 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500" placeholder="******" />
            </div>
          </div>

          {/* Roles Checkbox */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Role / Hak Akses</label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border-2 border-gray-100">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg transition-all">
                  <input 
                    type="checkbox" 
                    checked={selectedRoles.includes(role.id)} 
                    onChange={() => setSelectedRoles(prev => prev.includes(role.id) ? prev.filter(r => r !== role.id) : [...prev, role.id])} 
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-600">{role.name}</span>
                </label>
              ))}
            </div>
            {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 border-2 border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-100">Batal</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700">
            {isLoading ? "Menyimpan..." : "Simpan User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormModal;