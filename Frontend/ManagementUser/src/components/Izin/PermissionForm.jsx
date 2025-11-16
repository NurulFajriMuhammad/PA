import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const PermissionForm = ({ isOpen, onClose, onSave, existingPermission, isLoading = false }) => {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});

  const isEdit = !!existingPermission;

  useEffect(() => {
    if (existingPermission) {
      setName(existingPermission.name || "");
    } else {
      setName("");
    }
    setErrors({});
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

    if (!validateForm()) {
      return;
    }

    onSave({
      id: existingPermission?.id || null,
      name
    });
  };

  if (!isOpen) return null;

  const isFormValid = name?.trim();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose}></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              {isEdit ? "✏️ Edit Permission" : "➕ Tambah Permission Baru"}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-500 p-1 rounded-lg"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                💡 Contoh permission: <strong>create users</strong>, <strong>edit posts</strong>, <strong>delete comments</strong>
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Permission <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                }}
                placeholder="Contoh: create users, edit posts"
                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
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

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
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
                  ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                  : "bg-gray-400 text-white cursor-not-allowed opacity-50"
              }`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {isEdit ? "Update Permission" : "Buat Permission"}
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