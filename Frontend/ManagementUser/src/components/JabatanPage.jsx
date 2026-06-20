import React, { useState, useEffect, useMemo } from "react";
import {
  BriefcaseIcon, PlusIcon, TrashIcon, PencilSquareIcon,
  XMarkIcon, MagnifyingGlassIcon, ChevronRightIcon,
  DocumentIcon
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
    } catch (err) { 
      notifyError("❌ Gagal memuat data jabatan"); 
    } finally { 
      setIsLoading(false); 
    }
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
        notifySuccess("✅ Jabatan berhasil diperbarui");
      } else {
        await apiClient.post("/api/jabatans", payload);
        notifySuccess("✅ Jabatan berhasil ditambahkan");
      }
      setIsModalOpen(false);
      fetchJabatans();
    } catch (err) { 
      const errorMsg = err.response?.data?.message || err.message || "Gagal menyimpan jabatan";
      notifyError(`❌ ${errorMsg}`); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/api/jabatans/${itemToDelete.id}`);
      notifySuccess("✅ Jabatan berhasil dihapus");
      fetchJabatans();
    } catch (err) { 
      const errorMsg = err.response?.data?.message || err.message || "Gagal menghapus jabatan";
      notifyError(`❌ ${errorMsg}`); 
    } finally { 
      setItemToDelete(null); 
    }
  };

  const filtered = useMemo(() => {
    return jabatans.filter((j) => j.nama?.toLowerCase().includes(search.toLowerCase()));
  }, [jabatans, search]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BriefcaseIcon className="w-7 h-7 text-blue-600" />
            Manajemen Jabatan
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Petakan struktur jabatan organisasi ke unit atau divisi kerja yang berwenang.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md shadow-blue-200 w-fit"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Tambah Jabatan
        </button>
      </div>

      {/* Control Actions (Search) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari jabatan..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
            className="w-full pl-11 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm placeholder-slate-400" 
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 self-end sm:self-auto">
          Total Jabatan: <span className="text-blue-600 text-sm font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-20">No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Jabatan Struktural</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((j, idx) => (
                  <React.Fragment key={j.id}>
                    {/* Main Row */}
                    <tr className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 text-center text-sm text-slate-400 font-mono">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 text-sm">{j.nama}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(j)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95"
                          >
                            <PencilSquareIcon className="w-4 h-4 text-blue-600" /> Edit
                          </button>
                          <button 
                            onClick={() => setItemToDelete(j)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-all active:scale-95"
                          >
                            <TrashIcon className="w-4 h-4" /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Sub Rows (Units) */}
                    {j.units && j.units.length > 0 ? (
                      j.units.map((unit) => (
                        <tr key={`${j.id}-${unit.id}`} className="bg-slate-50/20">
                          <td></td>
                          <td colSpan={2} className="px-6 py-2.5">
                            <div className="flex items-center gap-2 pl-6 py-0.5 border-l-2 border-slate-100 ml-1">
                              <DocumentIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-semibold text-slate-500">
                                Terikat pada Unit:{" "}
                                <span className="text-blue-600 font-bold px-2 py-0.5 bg-blue-50/50 rounded border border-blue-100/50 ml-1">
                                  {unit.nama} ({unit.kode})
                                </span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="bg-slate-50/10">
                        <td></td>
                        <td colSpan={2} className="px-6 py-2">
                          <div className="flex items-center gap-2 pl-6 py-0.5 border-l-2 border-slate-100 ml-1">
                            <span className="text-xs text-slate-400 italic">Belum dipetakan ke unit manapun</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <BriefcaseIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Tidak ada jabatan ditemukan</p>
                        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda atau tambahkan jabatan baru.</p>
                      </div>
                      <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg transition-all"
                      >
                        Buat jabatan pertama
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/75 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-semibold">
              Halaman <span className="text-slate-800">{currentPage}</span> dari <span className="text-slate-800">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL MULTI-SELECT UNIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-base tracking-tight">{editingJabatan ? "Edit Jabatan Struktural" : "Tambah Jabatan Struktural"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Jabatan</label>
                <input 
                  autoFocus 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm placeholder-slate-400" 
                  value={formData.nama} 
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })} 
                  placeholder="Contoh: Kepala Departemen IT"
                  required 
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih Unit Terkait</label>
                
                <div 
                  className="min-h-[46px] w-full border border-slate-200 rounded-xl p-1.5 flex flex-wrap gap-2 items-center bg-white cursor-text focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
                  onClick={() => setIsDropdownOpen(true)}
                >
                  {/* TAGS */}
                  {formData.unitIds.map(id => {
                    const unit = units.find(u => u.id === id);
                    return (
                      <div key={id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100">
                        <span>{unit?.nama}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, unitIds: prev.unitIds.filter(val => val !== id)})); }}>
                          <XMarkIcon className="w-3.5 h-3.5 hover:text-red-500 text-blue-400 hover:bg-blue-100/50 rounded p-0.5" />
                        </button>
                      </div>
                    );
                  })}

                  <input
                    type="text"
                    className="flex-1 outline-none text-sm min-w-[100px] bg-transparent py-1 px-1.5 text-slate-700"
                    placeholder={formData.unitIds.length === 0 ? "Pilih satu atau beberapa unit..." : ""}
                    value={unitSearch}
                    onChange={(e) => { setUnitSearch(e.target.value); setIsDropdownOpen(true); }}
                  />
                  
                  {/* Action controls */}
                  <div className="flex items-center gap-2 px-2 border-l border-slate-200">
                    {formData.unitIds.length > 0 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, unitIds: []}); }} className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRightIcon className={`w-4 h-4 text-slate-400 transition-transform cursor-pointer ${isDropdownOpen ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Dropdown List */}
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-50">
                      {availableOptions.length > 0 ? (
                        availableOptions.map(unit => (
                          <div 
                            key={unit.id}
                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 hover:text-blue-600 font-medium text-slate-700 transition-colors"
                            onClick={() => {
                              setFormData(prev => ({...prev, unitIds: [...prev.unitIds, unit.id]}));
                              setUnitSearch("");
                              setIsDropdownOpen(false);
                            }}
                          >
                            {unit.nama} <span className="text-slate-400 text-xs font-mono font-bold ml-1">({unit.kode})</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs">Unit tidak ditemukan atau sudah terpilih</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-slate-600 text-sm font-semibold hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md shadow-blue-200">
                  {isLoading ? "Memproses..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <DeleteConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} itemName={`Jabatan: ${itemToDelete?.nama}`} />
    </div>
  );
};

export default JabatanPage;