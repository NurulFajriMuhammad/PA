import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 w-12 h-12 mr-4" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Hapus {itemName}</h3>
            <p className="text-gray-600 mt-1">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;