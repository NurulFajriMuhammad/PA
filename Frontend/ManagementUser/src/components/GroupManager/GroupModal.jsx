import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const GroupModal = ({ isOpen, onClose, onSave, existingGroup }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const isEditMode = !!existingGroup;

    useEffect(() => {
        if (existingGroup) {
            setName(existingGroup.name);
            setDescription(existingGroup.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [existingGroup, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) {
            console.warn("Nama grup wajib diisi.");
            return;
        }

        onSave({
            id: isEditMode ? existingGroup.id : null,
            name,
            description,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Grup' : 'Tambah Grup Baru'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Nama Grup (cth: Kepala SPI)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                    <textarea
                        placeholder="Deskripsi Grup (Opsional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
                    />
                </div>
                
                <div className="p-4 flex justify-end space-x-3 bg-gray-50 border-t rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300">
                        Batal
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Simpan Grup
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupModal;