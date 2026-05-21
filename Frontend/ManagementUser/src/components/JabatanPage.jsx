import React, { useState, useEffect, useMemo } from "react";
import {
  BriefcaseIcon, PlusIcon, TrashIcon, PencilSquareIcon,
  XMarkIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon,
  FolderIcon, DocumentIcon
} from "@heroicons/react/24/outline";
import DeleteConfirmationModal from "../components/common/DeleteModal";
import { notifySuccess, notifyError } from "../../../Shared/utils/notifier";
import apiClient from "../../../Shared/api/apiClient";
import useRealTime from "../hooks/useRealTime";

const ITEMS_PER_PAGE = 10;

const JabatanPage = () => {
  const [jabatans, setJabatans] = useState([]);
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");
  const [formData, setFormData] = useState({ nama: "", unitIds: [] });

  useEffect(() => {
    fetchJabatans();
    fetchUnits();
  }, []);

  // Sinkronisasi Real-Time untuk Jabatan & Unit
  useRealTime(["jabatans", "units"], () => {
    console.log("⚡ RealTime event: updating Jabatans & Units silently...");
    fetchJabatans(true);
    fetchUnits();
  });

  const fetchUnits = async () => {
    try {
      const res = await apiClient.get("/api/units");
      setUnits(res.data?.data || res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchJabatans = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await apiClient.get("/api/jabatans");
      setJabatans(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { notifyError("Gagal memuat data jabatan"); }
    finally { setIsLoading(false); }
  };

  // Filter untuk daftar unit di dropdown (Menghilangkan yang sudah terpilih)
  const availableOptions = useMemo(() => {
    return units.filter(u => 
      !formData.unitIds.includes(u.id) && 
      (u.nama.toLowerCase().includes(unitSearch.toLowerCase()) || u.kode.toLowerCase().includes(unitSearch.toLowerCase()))
    );
  }, [units, formData.unitIds, unitSearch]);

  const handleOpenModal = (jabatan = null) => {
    setEditingJabatan(jabatan);
    setFormData({
      nama: jabatan ? jabatan.nama : "",
      unitIds: jabatan?.units ? jabatan.units.map(u => u.id) : []
    });
    setIsDropdownOpen(false);
    setUnitSearch("");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { nama: formData.nama, unit_ids: formData.unitIds };
      if (editingJabatan) {
        await apiClient.put(`/api/jabatans/${editingJabatan.id}`, payload);
        notifySuccess("Jabatan diperbarui");
      } else {
        await apiClient.post("/api/jabatans", payload);
        notifySuccess("Jabatan ditambahkan");
      }
      setIsModalOpen(false);
      fetchJabatans();
    } catch (err) { notifyError("Gagal menyimpan data"); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/api/jabatans/${itemToDelete.id}`);
      notifySuccess("Jabatan dihapus");
      fetchJabatans();
    } catch { notifyError("Gagal menghapus"); }
    finally { setItemToDelete(null); }
  };

  const filtered = useMemo(() => {
    return jabatans.filter((j) => j.nama?.toLowerCase().includes(search.toLowerCase()));
  }, [jabatans, search]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4">
      {/* Header & Search Bar (Tetap sama) */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Jabatan</h2>
        </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium transition-all shadow-md">
          <PlusIcon className="w-5 h-5" /> Tambah Jabatan
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Cari jabatan..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center w-20">No</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Struktur Jabatan & Unit</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((j, idx) => (
              <React.Fragment key={j.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center text-sm text-gray-400 font-mono">{(currentPage-1)*ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-medium text-gray-800 tracking-tight">{j.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(j)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => setItemToDelete(j)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
                {j.units?.map((unit) => (
                  <tr key={`${j.id}-${unit.id}`} className="bg-gray-50/40">
                    <td></td>
                    <td colSpan={2} className="px-6 py-2">
                      <div className="flex items-center gap-3 pl-6 py-1">
                        <DocumentIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 italic">Unit: <span className="text-blue-600 font-semibold">{unit.nama}</span></span>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL MULTI-SELECT UNIT (LOGIKA DIPERBAIKI) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl  animate-in zoom-in duration-200">
            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center rounded-t-2xl">
              <h3 className="font-bold">{editingJabatan ? "Edit Jabatan" : "Tambah Jabatan"}</h3>
              <button onClick={() => setIsModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Jabatan</label>
                <input autoFocus className="w-full border-2 border-gray-100 px-4 py-2 rounded-xl focus:border-blue-500 outline-none" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required />
              </div>

              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Unit Terkait</label>
                
                <div 
                  className="min-h-[45px] w-full border-2 border-gray-200 rounded-xl p-1.5 flex flex-wrap gap-2 items-center bg-white cursor-text focus-within:border-blue-500 transition-all"
                  onClick={() => setIsDropdownOpen(true)}
                >
                  {/* TAGS */}
                  {formData.unitIds.map(id => {
                    const unit = units.find(u => u.id === id);
                    return (
                      <div key={id} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-bold border border-gray-200">
                        <span>{unit?.nama}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, unitIds: prev.unitIds.filter(val => val !== id)})); }}>
                          <XMarkIcon className="w-3.5 h-3.5 hover:text-red-500" />
                        </button>
                      </div>
                    );
                  })}

                  <input
                    type="text"
                    className="flex-1 outline-none text-sm min-w-[50px] bg-transparent"
                    placeholder={formData.unitIds.length === 0 ? "Pilih unit..." : ""}
                    value={unitSearch}
                    onChange={(e) => { setUnitSearch(e.target.value); setIsDropdownOpen(true); }}
                  />
                  
                  {/* Tombol X di pojok kanan untuk hapus semua */}
                  <div className="flex items-center gap-2 px-2 border-l">
                    {formData.unitIds.length > 0 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, unitIds: []}); }} className="p-0.5 hover:bg-gray-100 rounded">
                        <XMarkIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    <ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Dropdown List */}
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                      {availableOptions.length > 0 ? (
                        availableOptions.map(unit => (
                          <div 
                            key={unit.id}
                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              setFormData(prev => ({...prev, unitIds: [...prev.unitIds, unit.id]}));
                              setUnitSearch("");
                              setIsDropdownOpen(false); // LANGSUNG TUTUP SETELAH PILIH
                            }}
                          >
                            {unit.nama} ({unit.kode})
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400 text-xs">Unit tidak ditemukan atau sudah terpilih</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border-2 border-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">
                  {isLoading ? "Memproses..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <DeleteConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} itemName={itemToDelete?.nama} />
    </div>
  );
};

export default JabatanPage;