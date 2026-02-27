import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

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
  const [errors, setErrors] = useState({});

  const isEdit = !!existingUser;

  useEffect(() => {
    if (existingUser) {
      setName(existingUser.name || "");
      setEmail(existingUser.email || "");
      setSelectedRoles(existingUser.roles?.map((r) => r.id) || []);
      setPassword("");
      setPasswordConfirm("");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      setSelectedRoles([]);
    }
    setErrors({});
  }, [existingUser, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!name?.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!email?.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Password wajib untuk user baru
    if (!isEdit) {
      if (!password?.trim()) {
        newErrors.password = "Password wajib diisi";
      } else if (password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
      }
    } else {
      // Untuk edit, password opsional tapi jika diisi harus minimal 6 karakter
      if (password && password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
      }
    }

    // Validasi konfirmasi password jika ada password
    if (password || passwordConfirm) {
      if (password !== passwordConfirm) {
        newErrors.passwordConfirm = "Password tidak cocok";
      }
    }

    if (selectedRoles.length === 0) {
      newErrors.roles = "Pilih minimal satu role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleToggle = (id) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
    // Clear error saat user ubah role
    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: "" }));
    }
  };

  const submitForm = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("❌ Validasi gagal:", errors);
      return;
    }

    console.log("✅ Form valid, submit data");
    onSave({
      id: existingUser?.id || null,
      name,
      email,
      password: password || null,
      roleIds: selectedRoles,
    });
  };

  if (!isOpen) return null;

  // Cek apakah form valid untuk enable/disable tombol
  const isFormValid =
    name?.trim() &&
    email?.trim() &&
    selectedRoles.length > 0 &&
    (isEdit || password?.trim()) && // Password wajib untuk user baru
    (!password || passwordConfirm === password); // Jika ada password, harus cocok

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
      <form
        onSubmit={submitForm}
        className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
          <h2 className="font-bold text-lg text-white">
            {isEdit ? "✏️ Edit Pengguna" : "➕ Tambah Pengguna"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-1 rounded transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nama lengkap"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              type="email"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="user@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: "" }));
              }}
              type="password"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={
                isEdit ? "Password (opsional)" : "Minimal 6 karakter"
              }
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.password}
              </p>
            )}
          </div>

          {/* Konfirmasi Password */}
          {(password || isEdit) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password{" "}
                {!isEdit && password && <span className="text-red-500">*</span>}
              </label>
              <input
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  if (errors.passwordConfirm)
                    setErrors((prev) => ({ ...prev, passwordConfirm: "" }));
                }}
                type="password"
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.passwordConfirm ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ulangi password"
                disabled={isLoading}
              />
              {errors.passwordConfirm && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.passwordConfirm}
                </p>
              )}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded p-3 space-y-2 ${
                errors.roles ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              {Array.isArray(roles) && roles.length > 0 ? (
                roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      disabled={isLoading}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">{role.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada role tersedia</p>
              )}
            </div>
            {errors.roles && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.roles}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
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
            className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors ${
              isFormValid && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                : "bg-gray-400 text-white cursor-not-allowed opacity-50"
            }`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEdit ? "Update" : "Simpan"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormModal;
