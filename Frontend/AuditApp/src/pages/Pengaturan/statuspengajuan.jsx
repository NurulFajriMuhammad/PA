import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Settings2, 
  X, 
  CheckCircle2, 
  Palette,
  Layers
} from 'lucide-react';
import apiClient from "../../../../Shared/api/apiClient";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";

const StatusPengajuan = () => {
  const [statuses, setStatuses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    warna: "#6366f1",
    urutan: ""
  });

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/api/status-pemeriksaan");
      setStatuses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isValidColor = (color) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
  };

  const openCreate = () => {
    setEditId(null);
    setForm({
      nama: "",
      deskripsi: "",
      warna: "#6366f1",
      urutan: statuses.length + 1
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama) return notifyError("Nama wajib diisi");
    if (!isValidColor(form.warna)) return notifyError("Format warna tidak valid!");

    try {
      if (editId) {
        await apiClient.put(`/api/status-pemeriksaan/${editId}`, form);
      } else {
        await apiClient.post("/api/status-pemeriksaan", form);
      }
      setIsModalOpen(false);
      fetchData();
      notifySuccess("Data berhasil disimpan");
    } catch (err) {
      notifyError("Gagal menyimpan data");
    }
  };

  const handleDelete = (id) => {
    notifyConfirm("Hapus status pemeriksaan ini?", async () => {
      try {
        await apiClient.delete(`/api/status-pemeriksaan/${id}`);
        fetchData();
        notifySuccess("Data berhasil dihapus");
      } catch (err) {
        notifyError("Gagal menghapus data");
      }
    });
  };

  return (
    <div className="py-8 px-6 relative font-sans">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              <Settings2 size={12} /> Workflow Configuration
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Status <span className="text-indigo-600">Pemeriksaan</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Atur urutan alur kerja dan penanda warna untuk setiap tahapan audit.
            </p>
          </div>
          
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={18} /> Tambah Status Baru
          </button>
        </div>

        {/* --- TABEL --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 text-center w-20">No</th>
                  <th className="px-6 py-4">Nama Status</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-center">Label Warna</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {statuses.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-slate-500 text-xs tracking-widest">
                        {item.urutan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-700 text-sm tracking-tight">
                        {item.nama}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed max-w-sm">
                        {item.deskripsi || "Tidak ada deskripsi"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: item.warna }}
                        />
                        <span className="text-[10px] font-black font-mono text-slate-600 uppercase">
                          {item.warna}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Edit Status"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus Status"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {statuses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Layers size={32} className="opacity-20" />
                        <span className="text-sm font-medium">Belum ada data status.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL FORM --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">
                    {editId ? "Ubah Status Audit" : "Tambah Status Audit"}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Konfigurasi Alur Kerja
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Nama Status
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Draft / In Progress..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-sm text-slate-700 transition-all"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    />
                  </div>
                  {/* <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Urutan
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-sm text-slate-700 transition-all text-center"
                      value={form.urutan}
                      onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                    />
                  </div> */}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 font-semibold text-sm transition-all resize-none"
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Palette size={12} /> Penanda Warna
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      className="w-16 h-[50px] bg-slate-50 border border-slate-200 rounded-xl cursor-pointer p-1"
                      value={form.warna}
                      onChange={(e) => setForm({ ...form, warna: e.target.value })}
                    />
                    <input
                      type="text"
                      className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-sm"
                      value={form.warna}
                      onChange={(e) => setForm({ ...form, warna: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-2 w-[60%] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Simpan Status
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </div>
  );
};

export default StatusPengajuan;