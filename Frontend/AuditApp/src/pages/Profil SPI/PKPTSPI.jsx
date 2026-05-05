import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  Save,
  Target,
  Calendar,
  Layers,
  Clock,
  CheckCircle2
} from 'lucide-react';
import apiClient from "../../../../Shared/api/axios";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";

const PKPTSpiPage = () => {
  const [plans, setPlans] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    audit_universe_id: '',
    risk_category: '',
    frequency: '',
    start_week: '',
    end_week: '',
    year: new Date().getFullYear()
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resPkpt, resUniverse, resJangkaPanjang] = await Promise.all([
        apiClient.get("/api/pkptspi"),
        apiClient.get("/api/audit-universe"),
        apiClient.get("/api/spijangkapanjang") 
      ]);

      const enrichedUniverses = resUniverse.data.map(u => {
        const matchingPlan = resJangkaPanjang.data.find(p => p.audit_universe_id === u.id);
        return {
          ...u,
          renstra_frequency: matchingPlan ? matchingPlan.frequency : "Belum diatur"
        };
      });

      setPlans(resPkpt.data);
      setUniverses(enrichedUniverses); 
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleUniverseChange = (id) => {
    const selected = universes.find(u => u.id === parseInt(id));
    
    if (selected) {
      setNewPlan({
        ...newPlan,
        audit_universe_id: id,
        risk_category: selected.assessment_type || 'N/A', 
        frequency: selected.renstra_frequency 
      });
    } else {
      setNewPlan({ ...newPlan, audit_universe_id: id, risk_category: '', frequency: '' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/pkptspi", newPlan);
      setShowForm(false);
      setNewPlan({
        audit_universe_id: "",
        risk_category: "",
        frequency: "",
        start_week: "",
        end_week: "",
        year: new Date().getFullYear()
      });
      fetchData();
      notifySuccess("PKPT berhasil disimpan!");
    } catch (err) {
      notifyError("Gagal simpan rencana tahunan");
    }
  };

  const handleDelete = (id) => {
    notifyConfirm("Yakin ingin menghapus PKPT ini?", async () => {
      try {
        await apiClient.delete(`/api/pkptspi/${id}`);
        fetchData();
        notifySuccess("PKPT berhasil dihapus!");
      } catch (err) { 
        notifyError("Gagal menghapus"); 
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6 relative font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-emerald-100">
              <Target size={12} /> Annual Audit Plan
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Rencana Kerja <span className="text-emerald-600">Audit Tahunan</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Penetapan jadwal pemeriksaan tahunan berdasarkan prioritas risiko dan sumber daya (PKPT).
            </p>
          </div>
          
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={18} /> Buat PKPT Baru
          </button>
        </div>

        {/* --- TABEL RENCANA --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 transition-all">
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-medium tracking-widest animate-pulse text-xs uppercase">
              Memuat Data PKPT...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Nama Audit</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4 text-center">Risiko / Asesmen</th>
                    <th className="px-6 py-4 text-center">Frekuensi</th>
                    <th className="px-6 py-4 text-center">Mulai</th>
                    <th className="px-6 py-4 text-center">Selesai</th>
                    <th className="px-6 py-4 text-center">Tahun</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 text-sm leading-snug">
                          {plan.audit_universe?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          {plan.audit_universe?.sub_unit || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-slate-600">
                          {plan.audit_universe?.assessment_type || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-slate-500 text-xs italic">
                          {plan.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          <Clock size={12} /> W-{plan.start_week}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                          <Clock size={12} /> W-{plan.end_week}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 w-fit mx-auto">
                          <Calendar size={14} /> {plan.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(plan.id)} 
                          className="inline-flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus PKPT"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-16 text-center text-slate-400 font-medium text-sm">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Layers size={32} className="opacity-20" />
                          Belum ada data PKPT yang dikonfigurasi untuk tahun ini.
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
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">
                    Tambah PKPT
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Jadwal Pemeriksaan Tahunan
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
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Pilih Objek Audit (Universe)
                  </label>
                  <select 
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-sm text-slate-700 transition-all"
                    value={newPlan.audit_universe_id}
                    onChange={(e) => handleUniverseChange(e.target.value)}
                  >
                    <option value="">-- Pilih Audit Universe --</option>
                    {universes.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — (Risk: {u.corporate_risk_category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Risiko / Tipe Asesmen
                    </label>
                    <input 
                      readOnly 
                      className="w-full p-3.5 bg-slate-100/70 border border-slate-200 rounded-xl outline-none text-slate-500 font-semibold text-sm cursor-not-allowed" 
                      value={newPlan.risk_category} 
                      placeholder="Terisi otomatis..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Frekuensi (Renstra)
                    </label>
                    <input 
                      readOnly 
                      className="w-full p-3.5 bg-slate-100/70 border border-slate-200 rounded-xl outline-none text-indigo-600 font-bold text-sm cursor-not-allowed" 
                      value={newPlan.frequency} 
                      placeholder="Terisi otomatis..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Minggu Mulai (1-52)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        min="1" max="52" 
                        required 
                        className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-700 font-semibold text-sm transition-all" 
                        value={newPlan.start_week} 
                        onChange={(e) => setNewPlan({...newPlan, start_week: e.target.value})} 
                        placeholder="Mulai..."
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Minggu Selesai (1-52)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        min="1" max="52" 
                        required 
                        className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-700 font-semibold text-sm transition-all" 
                        value={newPlan.end_week} 
                        onChange={(e) => setNewPlan({...newPlan, end_week: e.target.value})} 
                        placeholder="Selesai..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Tahun Pelaksanaan
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      required 
                      className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 font-bold text-sm transition-all" 
                      value={newPlan.year} 
                      onChange={(e) => setNewPlan({...newPlan, year: e.target.value})} 
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
                    <CheckCircle2 size={18} /> Simpan PKPT
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

export default PKPTSpiPage;
