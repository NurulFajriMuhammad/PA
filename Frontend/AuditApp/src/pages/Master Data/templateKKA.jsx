import React, { useState, useEffect, useCallback } from 'react';
import { 
  BsPlusLg, BsSearch, BsTrash, BsPencilSquare, 
  BsCollection, BsFileEarmarkText, BsX, BsPrinter 
} from 'react-icons/bs';
import apiClient from "../../../../Shared/api/apiClient";
import { generateKKAHTML } from './generateKKAHTML';
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";
import useRealTime from "../../hooks/useRealTime";


const TemplateKKA = () => {
  // --- STATE ---
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sinkronisasi Real-Time
  useRealTime('kka', () => {
    fetchData();
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    nama: "",
    keterangan: ""
  });

  // --- API ACTIONS ---
  // 1. Fetch Data dari Database
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/kka-templates");
      // Menangani struktur response Laravel (data: [...])
      setTemplates(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Handle Save (Tambah & Update)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        // UPDATE: /api/kka-templates/{id}
        await apiClient.put(`/api/kka-templates/${formData.id}`, formData);
      } else {
        // STORE: /api/kka-templates
        await apiClient.post("/api/kka-templates", formData);
      }
      setShowModal(false);
      fetchData(); // Refresh list
      notifySuccess("Data berhasil disimpan");
    } catch (err) {
      console.error("Save Error:", err.response?.data);
      notifyError(err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = (id) => {
    notifyConfirm(`Hapus template ${id}?`, async () => {
      try {
        await apiClient.delete(`/api/kka-templates/${id}`);
        setTemplates(templates.filter(t => t.id !== id));
        notifySuccess("Template KKA berhasil dihapus");
      } catch (err) {
        notifyError("Gagal menghapus template");
      }
    });
  };

  // --- UI LOGIC ---

  const handleOpenModal = (data = null) => {
    if (data) {
      setIsEdit(true);
      setFormData(data);
    } else {
      setIsEdit(false);
      setFormData({ id: "", nama: "", keterangan: "" });
    }
    setShowModal(true);
  };

function handlePrintDocument(item) {
  const url = `/PrintTemplateKKA.html?id=${item.id}&nama=${item.nama}&ket=${item.keterangan}`;
  window.open(url, "_blank");
}

  const filteredData = Array.isArray(templates) ? templates.filter(t => 
    t.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="px-4 sm:px-8 py-4 font-sans">
      <div className="w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsCollection className="text-blue-600" /> Master Template KKA
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Standarisasi kertas kerja untuk efisiensi audit internal.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 text-sm border-none cursor-pointer"
        >
          <BsPlusLg /> Tambah Template
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
        <BsSearch className="text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Cari berdasarkan No. KKA atau Nama..." 
          className="w-full bg-transparent border-none outline-none text-sm text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Dynamic Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider w-32">No. KKA</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama Template KKA</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Keterangan</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center w-44">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
               <tr><td colSpan="4" className="p-10 text-center text-slate-400 italic">Memuat data...</td></tr>
            ) : filteredData.length > 0 ? filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="p-4 font-bold text-blue-600 tracking-tight">{item.id}</td>
                <td className="p-4 font-semibold text-slate-700">{item.nama}</td>
                <td className="p-4 text-slate-500 leading-relaxed italic text-xs">{item.keterangan}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-1">
                    <button 
                      onClick={() => handlePrintDocument(item)}
                      title="Cetak Dokumen"
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                    >
                      <BsPrinter size={18} />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(item)}
                      title="Edit Data"
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                    >
                      <BsPencilSquare size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      title="Hapus Data"
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                    >
                      <BsTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-400 italic text-sm">Data tidak ditemukan...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Section */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <BsFileEarmarkText className="text-blue-600" />
                {isEdit ? 'Update' : 'Tambah'} Template
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 border-none bg-transparent cursor-pointer">
                <BsX size={28}/>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Nomor KKA</label>
                <input 
                  required
                  disabled={isEdit}
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all disabled:bg-slate-100"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  placeholder="Contoh: KKA.01"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Nama Template KKA</label>
                <input 
                  required
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Masukkan nama template..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Keterangan Singkat</label>
                <textarea 
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all h-28 resize-none"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  placeholder="Jelaskan isi/tujuan KKA ini..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer border-none hover:bg-slate-200">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 cursor-pointer border-none hover:bg-blue-700 disabled:bg-slate-400">
                  {loading ? 'Memproses...' : (isEdit ? 'Update Data' : 'Simpan Data')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TemplateKKA;
