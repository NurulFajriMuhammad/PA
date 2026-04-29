import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  X,
  CheckCircle2,
  Target
} from "lucide-react";
import apiClient from "../../../../Shared/api/apiClient";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier"; // Opsional: Jika kamu pakai ini

const RenstraSPI = () => {
  const [auditUniverse, setAuditUniverse] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newPlan, setNewPlan] = useState({
    audit_universe_id: "",
    frequency: "",
    prep_year: new Date().getFullYear(),
    audit_year: new Date().getFullYear() + 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resUniverse, resPlans] = await Promise.all([
        apiClient.get("/api/audit-universe"),
        apiClient.get("/api/spijangkapanjang"),
      ]);
      setAuditUniverse(resUniverse.data);
      setPlans(resPlans.data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
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
      await apiClient.post("/api/spijangkapanjang", newPlan);
      setShowForm(false);
      setNewPlan({ ...newPlan, audit_universe_id: "", frequency: "" });
      fetchData();
      // notifySuccess("Rencana berhasil disimpan");
    } catch (err) {
      alert("Gagal simpan rencana");
      // notifyError("Gagal simpan rencana");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus rencana ini?")) {
      try {
        await apiClient.delete(`/api/spijangkapanjang/${id}`);
        fetchData();
        // notifySuccess("Rencana berhasil dihapus");
      } catch (err) {
        alert("Gagal menghapus data");
      }
    }
  };

  // Helper untuk styling badge risiko agar sama dengan Audit Universe
  const getRiskStyle = (risk) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Low":
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6 relative font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              <Target size={12} /> Strategic Audit Plan
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Rencana Jangka <span className="text-indigo-600">Panjang</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Sinkronisasi objek audit dari Audit Universe ke jadwal pemeriksaan multi-tahun.
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={18} /> Buat Rencana Baru
          </button>
        </div>

        {/* --- TABEL RENCANA --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-medium tracking-widest animate-pulse text-xs uppercase">
              Memuat Data Perencanaan...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Nama Audit (Universe)</th>
                    <th className="px-6 py-4 text-center">Tingkat Risiko</th>
                    <th className="px-6 py-4 text-center">Frekuensi</th>
                    <th className="px-6 py-4 text-center">Tahun Persiapan</th>
                    <th className="px-6 py-4 text-center">Tahun Audit</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">
                            {plan.audit_universe?.sub_unit || "Tanpa Unit"}
                          </span>
                          <span className="font-bold text-slate-700 text-sm leading-snug">
                            {plan.audit_universe?.name || "-"}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${getRiskStyle(plan.audit_universe?.risk)}`}>
                          {plan.audit_universe?.risk || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-slate-600 text-xs bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                          {plan.frequency}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          {plan.prep_year}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 w-fit mx-auto">
                          <Calendar size={14} />
                          {plan.audit_year}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="inline-flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus Rencana"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-400 font-medium text-sm">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Layers size={32} className="opacity-20" />
                          Belum ada rencana jangka panjang yang dikonfigurasi.
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
                    Tambah Rencana Strategis
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Sinkronisasi dengan Universe
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
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, audit_universe_id: e.target.value })
                    }
                  >
                    <option value="">-- Pilih Nama Audit / Unit --</option>
                    {auditUniverse.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name} — ({uni.sub_unit} | Risk: {uni.risk})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Frekuensi Pelaksanaan Audit
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tahunan, 2 Tahunan, Semesteran"
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 font-semibold text-sm transition-all"
                    value={newPlan.frequency}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, frequency: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Tahun Persiapan
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 font-semibold text-sm transition-all"
                      value={newPlan.prep_year}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, prep_year: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Tahun Pelaksanaan Audit
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 font-semibold text-sm transition-all"
                      value={newPlan.audit_year}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, audit_year: e.target.value })
                      }
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
                    <CheckCircle2 size={18} /> Simpan Rencana
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

export default RenstraSPI;