import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users as UsersIcon, Shield } from 'lucide-react';
import GroupModal from './GroupModal';
import DeleteConfirmationModal from '../common/DeleteModal';

const GroupPage = ({ groups, setGroups, setNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleOpenModal = (group = null) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };

    const handleSaveGroup = (groupData) => {
        // 🚨 SIMULASI API: Di aplikasi nyata, panggil apiClient.post/put di sini
        console.log("Simulasi SAVE Group dipanggil:", groupData);
        setNotification({ type: 'success', message: `Grup ${groupData.name} berhasil disimpan (Dummy).` });
        // Logic untuk memperbarui state groups secara lokal (opsional di fase dummy)
    };

    const handleDeleteGroup = () => {
        // 🚨 SIMULASI API: Di aplikasi nyata, panggil apiClient.delete di sini
        console.log("Simulasi DELETE Group dikonfirmasi:", itemToDelete.id);
        setNotification({ type: 'success', message: `Grup ${itemToDelete.name} telah dihapus (Dummy).` });
        setItemToDelete(null);
    };

    return (
        <div>
            <button
                onClick={() => handleOpenModal()}
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center shadow-md"
            >
                <Plus className="w-5 h-5 mr-2" /> Tambah Grup Baru
            </button>

            {/* Tabel Data Grup */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* Header Tabel */}
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Grup</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {groups && groups.length > 0 ? (
                            groups.map(group => (
                                <tr key={group.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 flex items-center">
                                        <Shield className="w-4 h-4 mr-2 text-blue-500" />
                                        {group.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{group.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenModal(group)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button onClick={() => setItemToDelete(group)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                    <UsersIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="font-semibold">Belum ada data grup.</p>
                                    <p className="text-sm">Silakan tambahkan grup baru.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            <GroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveGroup}
                existingGroup={editingGroup}
            />

            {/* Modal Konfirmasi Hapus */}
            <DeleteConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDeleteGroup}
                itemName={`Grup ${itemToDelete?.name || ''}`}
            />
        </div>
    );
};

export default GroupPage;