import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const ApiRouteForm = ({ isOpen, onClose, onSave, existingRoute, permissions = [], isLoading = false }) => {
  const [formData, setFormData] = useState({
    method: 'GET',
    path: '',
    controller: '',
    action: '',
    permission: '',
    is_active: true,
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (existingRoute) {
        setFormData(existingRoute);
      } else {
        setFormData({
          method: 'GET',
          path: '',
          controller: '',
          action: '',
          permission: '',
          is_active: true,
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, existingRoute]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.method.trim()) newErrors.method = 'Method diperlukan';
    if (!formData.path.trim()) newErrors.path = 'Path diperlukan';
    if (!formData.controller.trim()) newErrors.controller = 'Controller diperlukan';
    if (!formData.action.trim()) newErrors.action = 'Action diperlukan';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSave({
        id: existingRoute?.id,
        ...formData,
      });
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-800">
            <h3 className="text-lg font-bold text-white">
              {existingRoute ? '✏️ Edit Route API' : '➕ Tambah Route API Baru'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-500 p-1 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Buat route API baru yang akan diintegrasikan ke dalam sistem routing Laravel Anda secara otomatis.
              </p>
            </div>

            {/* Grid 2 Kolom */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Method */}
              <div>
                <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
                  Method HTTP <span className="text-red-500">*</span>
                </label>
                <select
                  id="method"
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.method ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
                {errors.method && <p className="text-red-600 text-xs mt-1">{errors.method}</p>}
              </div>

              {/* Path */}
              <div>
                <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-2">
                  Path <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm mr-2">/api/</span>
                  <input
                    id="path"
                    type="text"
                    name="path"
                    value={formData.path}
                    onChange={handleInputChange}
                    placeholder="users, posts/{id}, articles/search"
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.path ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.path && <p className="text-red-600 text-xs mt-1">{errors.path}</p>}
              </div>

              {/* Controller */}
              <div>
                <label htmlFor="controller" className="block text-sm font-medium text-gray-700 mb-2">
                  Controller <span className="text-red-500">*</span>
                </label>
                <input
                  id="controller"
                  type="text"
                  name="controller"
                  value={formData.controller}
                  onChange={handleInputChange}
                  placeholder="UserController, PostController"
                  className={`w-full px-4 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.controller ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.controller && <p className="text-red-600 text-xs mt-1">{errors.controller}</p>}
              </div>

              {/* Action
              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
                  Action <span className="text-red-500">*</span>
                </label>
                <input
                  id="action"
                  type="text"
                  name="action"
                  value={formData.action}
                  onChange={handleInputChange}
                  placeholder="index, store, show, update, destroy"
                  className={`w-full px-4 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.action ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.action && <p className="text-red-600 text-xs mt-1">{errors.action}</p>}
              </div> */}
            </div>


            {/* Status */}
            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                ✓ Aktifkan route ini
              </label>
            </div>

            {/* Info Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Preview Route:</p>
              <p className="font-mono text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                <span className={`font-bold px-2 py-1 rounded text-white ${
                  formData.method === 'GET' ? 'bg-blue-600' :
                  formData.method === 'POST' ? 'bg-green-600' :
                  formData.method === 'PUT' ? 'bg-yellow-600' :
                  formData.method === 'DELETE' ? 'bg-red-600' : 'bg-purple-600'
                }`}>{formData.method}</span>
                {' '}/api/{formData.path || 'path'}
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:bg-blue-400"
              disabled={isLoading}
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
                  {existingRoute ? 'Update Route' : 'Buat Route'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApiRouteForm;