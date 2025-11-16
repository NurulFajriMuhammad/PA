import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Search } from 'lucide-react';

const RoleModal = ({ isOpen, onClose, onSave, existingRole, permissions = [], isLoading = false }) => {
    const [name, setName] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [searchPermission, setSearchPermission] = useState("");
    const [errors, setErrors] = useState({});

    const isEdit = !!existingRole;

    useEffect(() => {
        if (isOpen) {
            if (existingRole) {
                console.log("📝 Editing role:", existingRole);
                
                // Pastikan existingRole.permissions adalah array objek, lalu ambil ID-nya
                const initialPermissions = Array.isArray(existingRole.permissions) 
                    ? existingRole.permissions.map(p => p.id) 
                    : [];

                console.log("✅ Initial selected permissions IDs:", initialPermissions);
                
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

        if (!name?.trim()) {
            newErrors.name = "Nama role wajib diisi";
        }

        if (selectedPermissions.length === 0) {
            newErrors.permissions = "Pilih minimal satu permission";
        }
        
        // Pengecekan baru: Gunakan ini untuk validasi saat submit, bukan rendering
        if (permissions.length === 0 && !isEdit) {
             newErrors.permissions = "Tidak ada permission yang tersedia. Harap cek data master permission.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePermissionToggle = (id) => {
        setSelectedPermissions(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
        if (errors.permissions) {
            setErrors(prev => ({ ...prev, permissions: "" }));
        }
    };

    // Filter permissions berdasarkan search
    const filteredPermissions = Array.isArray(permissions)
        ? permissions.filter(p => p.name.toLowerCase().includes(searchPermission.toLowerCase()))
        : [];

    const handleSelectAll = () => {
        const filteredPermIds = filteredPermissions.map(p => p.id);
        
        // Cek apakah semua item yang difilter sudah dipilih
        const allFilteredSelected = filteredPermIds.every(id => selectedPermissions.includes(id));
        
        if (allFilteredSelected) {
            // Deselect semua item yang difilter
            setSelectedPermissions(prev => prev.filter(id => !filteredPermIds.includes(id)));
        } else {
            // Gabungkan yang sudah ada dengan semua item yang difilter
            setSelectedPermissions(prev => {
                const combined = [...new Set([...prev, ...filteredPermIds])];
                return combined;
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            console.log("❌ Validation failed:", errors);
            return;
        }

        console.log("✅ Submitting role:", {
            id: existingRole?.id,
            name,
            permissionIds: selectedPermissions
        });

        onSave({
            id: existingRole?.id || null,
            name,
            permissionIds: selectedPermissions
        });
    };

    if (!isOpen) return null;

    const isFormValid = name?.trim() && selectedPermissions.length > 0;

    // Group permissions by action type
    const groupedPermissions = {};
    filteredPermissions.forEach(perm => {
        // Menggunakan kata pertama sebelum spasi atau '.'
        const match = perm.name.match(/^(\w+)/); 
        const action = match ? match[0] : 'Other';

        if (!groupedPermissions[action]) {
            groupedPermissions[action] = [];
        }
        groupedPermissions[action].push(perm);
    });

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose}></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {isEdit ? "✏️ Edit Role" : "➕ Tambah Role Baru"}
                            </h3>
                            <p className="text-purple-100 text-xs mt-1">
                                {isEdit ? `Mengubah role: ${existingRole?.name}` : "Buat role baru dengan permissions"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-purple-500 p-1 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">
                        
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Role <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                                }}
                                placeholder="Contoh: Admin, Auditor, Reviewer"
                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                                    errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                                }`}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Permissions Header */}
                        <div className="mt-6 mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Permission <span className="text-red-500">*</span>
                                    <span className="text-gray-500 font-normal ml-2">
                                        ({selectedPermissions.length} dipilih dari {permissions.length} total)
                                    </span>
                                </label>
                                {filteredPermissions.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleSelectAll}
                                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors font-medium"
                                    >
                                        {filteredPermissions.every(perm => selectedPermissions.includes(perm.id)) ? "Batal Pilih Filtered" : "Pilih Semua Filtered"}
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari permission..."
                                    value={searchPermission}
                                    onChange={(e) => setSearchPermission(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Permissions Grid */}
                        <div className={`border rounded-lg p-4 max-h-80 overflow-y-auto ${
                            errors.permissions ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"
                        }`}>
                            {permissions.length === 0 ? (
                                // ✅ HANYA tampilkan error jika permissions benar-benar kosong
                                <p className="text-red-600 font-medium text-sm text-center py-8">
                                    ❌ Gagal memuat data Permission. Harap cek koneksi atau izin API.
                                </p>
                            ) : filteredPermissions.length > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(groupedPermissions).map(([action, perms]) => (
                                        <div key={action}>
                                            <p className="text-xs font-bold text-gray-600 uppercase mb-2 px-2">
                                                {action}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                                                {perms.map(perm => (
                                                    <label 
                                                        key={perm.id} 
                                                        className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(perm.id)}
                                                            onChange={() => handlePermissionToggle(perm.id)}
                                                            disabled={isLoading}
                                                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                                        />
                                                        <span className="text-sm text-gray-700">{perm.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    Tidak ada permission yang cocok dengan pencarian
                                </p>
                            )}
                        </div>

                        {errors.permissions && (
                            <p className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.permissions}
                            </p>
                        )}

                        {/* Info */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="text-sm text-purple-700">
                                ✓ Total dipilih: <strong>{selectedPermissions.length}</strong> permission
                            </p>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                                isFormValid && !isLoading
                                    ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer shadow-md"
                                    : "bg-gray-400 text-white cursor-not-allowed opacity-50"
                            }`}
                            disabled={!isFormValid || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> {isEdit ? "Update Role" : "Buat Role"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RoleModal;