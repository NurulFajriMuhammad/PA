import React, { useState, useEffect } from "react";
import { 
  BuildingOffice2Icon, 
  PlusIcon as Plus, 
  TrashIcon as Trash2, 
  PencilSquareIcon as Edit, 
  XMarkIcon as X, 
  DevicePhoneMobileIcon as Save 
} from "@heroicons/react/24/outline";
import DeleteConfirmationModal from "../components/common/DeleteModal";
import { notifySuccess, notifyError } from "../../../Shared/utils/notifier";
import apiClient from "../../../Shared/api/apiClient";
// import apiClient from "../../../Shared/api/axios";

const UnitPage = () => {
    const [units, setUnits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Form State
    const [formData, setFormData] = useState({ nama: "", kode: "" });

    useEffect(() => {
        fetchUnits();
    }, []);

const fetchUnits = async () => {
  setIsLoading(true);
  try {
    const res = await apiClient.get("/api/units");
    const dataResult = res.data?.data || [];
    const sorted = [...dataResult].sort((a, b) => a.id - b.id);
    setUnits(sorted);
  } catch (err) {
    console.error("Error fetch:", err);
    notifyError("❌ Gagal memuat data unit");
  } finally {
    setIsLoading(false);
  }
};

    const handleOpenModal = (unit = null) => {
        if (unit) {
            setEditingUnit(unit);
            setFormData({ nama: unit.nama, kode: unit.kode });
        } else {
            setEditingUnit(null);
            setFormData({ nama: "", kode: "" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingUnit) {
                await apiClient.put(`/api/units/${editingUnit.id}`, formData);
                notifySuccess("✅ Unit berhasil diperbarui");
            } else {
                await apiClient.post("/api/units", formData);
                notifySuccess("✅ Unit berhasil ditambahkan");
            }
            setIsModalOpen(false);
            fetchUnits();
        } catch (err) {
            notifyError(err.response?.data?.message || "Gagal menyimpan unit");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await apiClient.delete(`/api/units/${itemToDelete.id}`);
            notifySuccess("✅ Unit berhasil dihapus");
            setItemToDelete(null);
            fetchUnits();
        } catch (err) {
            notifyError("❌ Gagal menghapus unit");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">🏢 Manajemen Unit/Divisi</h2>
                    <p className="text-gray-600 text-sm">Kelola struktur departemen perusahaan</p>
                </div>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 shadow-md">
                    <Plus className="w-5 h-5 mr-2" /> Tambah Unit
                </button>
            </div>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kode</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nama Unit</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {units.map((unit) => (
                            <tr key={unit.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-sm text-blue-600">{unit.kode}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{unit.nama}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => handleOpenModal(unit)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => setItemToDelete(unit)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Gabungan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold">{editingUnit ? "Edit Unit" : "Tambah Unit"}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Kode Unit</label>
                                <input 
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.kode}
                                    onChange={(e) => setFormData({...formData, kode: e.target.value})}
                                    placeholder="Contoh: HRD, IT, dll"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Nama Unit</label>
                                <input 
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.nama}
                                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                                    placeholder="Nama lengkap divisi"
                                    required 
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                                    <Save className="w-4 h-4" /> {editingUnit ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={!!itemToDelete} 
                onClose={() => setItemToDelete(null)} 
                onConfirm={handleDelete} 
                itemName={`Unit: ${itemToDelete?.nama}`} 
            />
        </div>
    );
};

export default UnitPage;