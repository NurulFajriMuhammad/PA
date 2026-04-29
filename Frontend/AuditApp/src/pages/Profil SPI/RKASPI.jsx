import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Target,
  BarChart,
  Wallet,
  Calendar,
  X,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import apiClient from "../../../../Shared/api/axios";

const RKASpiPage = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newPlan, setNewPlan] = useState({
    kpi: "",
    min: "",
    max: "",
    nilai: "",
    satuan: "",
    tahun: new Date().getFullYear(),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const resPlans = await apiClient.get("/api/rka");
      setKpis(resPlans.data);
    } catch (err) {
      console.error("Gagal ambil data RKA:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/rka", newPlan);
      setShowForm(false);
      setNewPlan({ 
        kpi: "", 
        min: "", 
        max: "", 
        nilai: "", 
        satuan: "", 
        tahun: new Date().getFullYear() 
      }); 
      fetchData();
    } catch (err) {
      alert("Gagal simpan data");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data KPI ini?")) {
      try {
        await apiClient.delete(`/api/rka/${id}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus data");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-blue-100">
              <Wallet size={12} /> Budget & Work Plan
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
              Rencana Kerja <span className="text-blue-600">& Anggaran</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Entry dan pemantauan Key Performance Indicator (KPI) SPI secara terpusat.
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={20} /> Buat RKA Baru
          </button>
        </div>

        {/* --- TABEL RENCANA DINAMIS --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 transition-all">
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-medium tracking-widest animate-pulse text-xs uppercase">
              Memuat Data RKA...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Nama KPI</th>
                    <th className="px-6 py-4 text-center">Polaritas Min</th>
                    <th className="px-6 py-4 text-center">Polaritas Max</th>
                    <th className="px-6 py-4 text-center">Target Realisasi</th>
                    <th className="px-6 py-4 text-center">Satuan</th>
                    <th className="px-6 py-4 text-center">Tahun</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {kpis.map((plan) => (
                    <tr key={plan.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <BarChart size={16} />
                          </div>
                          <span className="font-bold text-slate-700 text-sm leading-snug">
                            {plan.kpi_name}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100">
                          {plan.polaritas_min || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100">
                          {plan.polaritas_max || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 text-sm font-black text-blue-600">
                          {plan.nilai_realisasi}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100">
                          {plan.satuan}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          {plan.tahun}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="inline-flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus Data KPI"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {kpis.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-16 text-center text-slate-400 font-medium text-sm">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <TrendingUp size={32} className="opacity-20" />
                          Belum ada data RKA / KPI yang dibuat.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- MODAL FORM --- */}
        {showForm && (
          <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <Target className="text-blue-500" size={24} /> Tambah Data RKA
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Key Performance Indicator SPI
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                {/* Nama KPI */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Nama Indikator (KPI)
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-slate-700 transition-all"
                    value={newPlan.kpi}
                    onChange={(e) => setNewPlan({ ...newPlan, kpi: e.target.value })}
                    placeholder="Contoh: Persentase temuan yang ditindaklanjuti..."
                  />
                </div>

                {/* Min & Max */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Polaritas Min
                    </label>
                    <input
                      type="text"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-slate-700 transition-all"
                      value={newPlan.min}
                      onChange={(e) => setNewPlan({ ...newPlan, min: e.target.value })}
                      placeholder="Nilai minimum..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Polaritas Max
                    </label>
                    <input
                      type="text"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-slate-700 transition-all"
                      value={newPlan.max}
                      onChange={(e) => setNewPlan({ ...newPlan, max: e.target.value })}
                      placeholder="Nilai maksimum..."
                    />
                  </div>
                </div>

                {/* Nilai & Satuan */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Target Realisasi
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-black text-blue-600 text-sm transition-all"
                      value={newPlan.nilai}
                      onChange={(e) => setNewPlan({ ...newPlan, nilai: e.target.value })}
                      placeholder="Contoh: 100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Satuan
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm text-slate-700 transition-all"
                      value={newPlan.satuan}
                      onChange={(e) => setNewPlan({ ...newPlan, satuan: e.target.value })}
                      placeholder="Contoh: %, Laporan, Rupiah"
                    />
                  </div>
                </div>

                {/* Tahun */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Tahun Anggaran
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      required
                      className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-sm text-slate-700 transition-all"
                      value={newPlan.tahun}
                      onChange={(e) => setNewPlan({ ...newPlan, tahun: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-2 w-[60%] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Simpan Data RKA
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

export default RKASpiPage;