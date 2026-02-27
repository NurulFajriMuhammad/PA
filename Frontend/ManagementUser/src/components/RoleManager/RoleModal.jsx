import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Search } from "lucide-react";

const RoleModal = ({
  isOpen,
  onClose,
  onSave,
  existingRole,
  permissions = [],
  isLoading = false,
}) => {
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchPermission, setSearchPermission] = useState("");
  const [errors, setErrors] = useState({});

  const isEdit = !!existingRole;

  useEffect(() => {
    if (isOpen) {
      if (existingRole) {
        const initialPermissions = Array.isArray(existingRole.permissions)
          ? existingRole.permissions.map((p) => p.id)
          : [];
        setName(existingRole.name || "");
        setSelectedPermissions(initialPermissions);
      } else {
        setName("");
        setSelectedPermissions([]);
      }
      setSearchPermission("");
      setErrors({});
    }
  }, [existingRole, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!name?.trim()) newErrors.name = "Nama role wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePermissionToggle = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const filteredPermissions = Array.isArray(permissions)
    ? permissions.filter((p) =>
        p.name.toLowerCase().includes(searchPermission.toLowerCase())
      )
    : [];

  const handleSelectAll = () => {
    const filteredPermIds = filteredPermissions.map((p) => p.id);
    const allFilteredSelected = filteredPermIds.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allFilteredSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !filteredPermIds.includes(id))
      );
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...filteredPermIds])]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave({
      id: existingRole?.id || null,
      name,
      permissionIds: selectedPermissions,
    });
  };

  if (!isOpen) return null;

  const isFormValid = name?.trim();

  // Grouping logic
  const groupedPermissions = {};
  filteredPermissions.forEach((perm) => {
    const match = perm.name.match(/^(\w+)/);
    const action = match ? match[0] : "Other";
    if (!groupedPermissions[action]) groupedPermissions[action] = [];
    groupedPermissions[action].push(perm);
  });

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose}></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* UKURAN DIUBAH DARI max-w-3xl KE max-w-xl AGAR LEBIH RAMPING */}
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between shrink-0 text-white">
            <div>
              <h3 className="text-lg font-bold">{isEdit ? "✏️ Edit Role" : "➕ Tambah Role Baru"}</h3>
              <p className="text-purple-100 text-xs mt-1">
                {isEdit ? `Mengubah: ${existingRole?.name}` : "Buat role baru"}
              </p>
            </div>
            <button onClick={onClose} className="hover:bg-purple-500 p-1 rounded-lg transition-colors" disabled={isLoading}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
            {/* Nama Role */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nama Role *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin, Auditor, dll"
                className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all ${
                  errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Permission Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Permissions</label>
                <button type="button" onClick={handleSelectAll} className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200 hover:bg-purple-100">
                  Pilih Semua
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchPermission}
                  onChange={(e) => setSearchPermission(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500"
                />
              </div>

              {/* Grid Permission disesuaikan agar tetap rapi di modal kecil */}
              <div className="border rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50">
                {Object.entries(groupedPermissions).map(([action, perms]) => (
                  <div key={action} className="mb-4 last:mb-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 border-b pb-1">{action}</p>
                    <div className="grid grid-cols-1 gap-1">
                      {perms.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => handlePermissionToggle(perm.id)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-xs text-gray-600">{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
<button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all font-semibold text-sm disabled:opacity-50"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${
                isFormValid && !isLoading ? "bg-purple-600 text-white shadow-lg hover:bg-purple-700" : "bg-gray-300 text-white cursor-not-allowed"
              }`}
            >
              {isLoading ? "Menyimpan..." : <><Save className="w-4 h-4" /> {isEdit ? "Update" : "Simpan"}</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleModal;