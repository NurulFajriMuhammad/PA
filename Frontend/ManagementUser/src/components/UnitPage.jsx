import React, { useState, useEffect } from "react";
import { 
  BuildingOffice2Icon as BuildingOffice, 
  PlusIcon as Plus, 
  TrashIcon as Trash2, 
  PencilSquareIcon as Edit, 
  XMarkIcon as X, 
  DevicePhoneMobileIcon as Save,
  MagnifyingGlassIcon as Search
} from "@heroicons/react/24/outline";
import DeleteConfirmationModal from "../components/common/DeleteModal";
import { notifySuccess, notifyError } from "../../../Shared/utils/notifier";
import apiClient from "../../../Shared/api/apiClient";
import useRealTime from "../hooks/useRealTime";

const UnitPage = () => {
    const [units, setUnits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({ nama: "", kode: "" });

    useEffect(() => {
        fetchUnits();
    }, []);

    // Sinkronisasi Real-Time untuk Unit
    useRealTime("units", () => {
        console.log("⚡ RealTime event: updating Units data silently...");
        fetchUnits(true);
    });

    const fetchUnits = async (silent = false) => {
      if (!silent) setIsLoading(true);
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
            const errorMsg = err.response?.data?.message || err.message || "Gagal menyimpan unit";
            notifyError(`❌ ${errorMsg}`);
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
            const errorMsg = err.response?.data?.message || err.message || "Gagal menghapus unit";
            notifyError(`❌ ${errorMsg}`);
        }
    };

    const filteredUnits = units.filter((u) => {
        const nameMatch = u.nama?.toLowerCase().includes(searchTerm.toLowerCase());
        const codeMatch = u.kode?.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || codeMatch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <BuildingOffice className="w-7 h-7 text-blue-600" />
                        Manajemen Unit / Divisi
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Kelola struktur departemen, unit, dan divisi operasional perusahaan.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md shadow-blue-200 w-fit"
                >
                    <Plus className="w-5 h-5 mr-2" /> Tambah Unit
                </button>
            </div>

            {/* Control Actions (Search) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari kode atau nama unit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm placeholder-slate-400"
                    />
                </div>
                <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 self-end sm:self-auto">
                    Total Unit: <span className="text-blue-600 text-sm font-bold">{filteredUnits.length}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Kode</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Unit/Divisi</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUnits.length > 0 ? (
                                filteredUnits.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-mono text-xs font-bold rounded-lg border border-blue-100">
                                                {unit.kode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                            {unit.nama}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(unit)} 
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95"
                                                >
                                                    <Edit className="w-3.5 h-3.5 text-blue-600" /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => setItemToDelete(unit)} 
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-all active:scale-95"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Search className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">Tidak ada unit ditemukan</p>
                                                <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda atau tambahkan unit baru.</p>
                                            </div>
                                            <button
                                                onClick={() => handleOpenModal()}
                                                className="px-4 py-2 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg transition-all"
                                            >
                                                Buat unit pertama
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Gabungan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
                            <h3 className="font-bold text-base tracking-tight">{editingUnit ? "Edit Unit/Divisi" : "Tambah Unit/Divisi"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Kode Unit</label>
                                <input 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm placeholder-slate-400" 
                                    value={formData.kode}
                                    onChange={(e) => setFormData({...formData, kode: e.target.value})}
                                    placeholder="Contoh: HRD, IT, SPI"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Unit / Divisi</label>
                                <input 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm placeholder-slate-400" 
                                    value={formData.nama}
                                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                                    placeholder="Contoh: Human Resources Department"
                                    required 
                                />
                            </div>
                            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-slate-600 text-sm font-semibold hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md shadow-blue-200">
                                    <Save className="w-4 h-4" /> {editingUnit ? "Perbarui" : "Simpan"}
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