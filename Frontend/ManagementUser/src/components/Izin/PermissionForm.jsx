import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

const PermissionForm = ({
  isOpen,
  onClose,
  onSave,
  existingPermission,
  isLoading = false,
}) => {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});

  const isEdit = !!existingPermission;

  useEffect(() => {
    if (isOpen) {
      if (existingPermission) {
        setName(existingPermission.name || "");
      } else {
        setName("");
      }
      setErrors({});
    }
  }, [existingPermission, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!name?.trim()) {
      newErrors.name = "Nama permission wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave({
      id: existingPermission?.id || null,
      name,
    });
  };

  if (!isOpen) return null;

  const isFormValid = name?.trim();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Perbaikan: Menggunakan rounded-xl dan overflow-hidden agar sudut tidak tajam */}
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
          {/* Header dengan Gradien */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              {isEdit ? "✏️ Edit Permission" : "➕ Tambah Permission Baru"}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-500 p-1.5 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Box Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
              <span className="text-lg">💡</span>
              <p className="text-sm text-green-700 leading-relaxed">
                Contoh: <strong>create users</strong>,{" "}
                <strong>edit posts</strong>, atau{" "}
                <strong>delete comments</strong>.
              </p>
            </div>

            {/* Input Nama Permission */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700"
              >
                Nama Permission <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Masukkan nama permission..."
                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
          </form>

          {/* Footer Modal */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
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
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md ${
                isFormValid && !isLoading
                  ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                  : "bg-gray-300 text-white cursor-not-allowed"
              }`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? "Update" : "Simpan"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PermissionForm;
