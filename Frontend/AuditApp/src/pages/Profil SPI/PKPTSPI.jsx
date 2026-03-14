import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save } from 'lucide-react';
import apiClient from "../../../../Shared/api/axios";

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
    } catch (err) {
      alert("Gagal simpan rencana tahunan");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/pkptspi/${id}`);
      fetchData();
    } catch (err) { 
      alert("Gagal menghapus"); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
              Rencana Kerja <span className="text-green-600">Audit Tahunan</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Penetapan jadwal pemeriksaan tahunan berdasarkan prioritas risiko dan ketersediaan sumber daya.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} /> Buat PKPT Baru
          </button>
        </div>

        {/* --- TABEL KOTAK HITAM SEDERHANA --- */}
        <div className="mb-12">
          <table className="w-full border-2 border-black text-sm bg-white">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="border-2 border-black px-4 py-2 text-left uppercase font-black">Nama Audit</th>
                <th className="border-2 border-black px-4 py-2 text-left uppercase font-black">Unit</th>
                <th className="border-2 border-black px-4 py-2 text-center uppercase font-black">Risiko</th>
                <th className="border-2 border-black px-4 py-2 text-center uppercase font-black">Frekuensi</th>
                <th className="border-2 border-black px-4 py-2 text-center uppercase font-black">Mulai</th>
                <th className="border-2 border-black px-4 py-2 text-center uppercase font-black">Selesai</th>
                <th className="border-2 border-black px-4 py-2 text-center uppercase font-black">Tahun</th>
                <th className="border-2 border-black px-4 py-2 text-center uppercase font-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="border-2 border-black px-4 py-2 font-bold uppercase">{plan.audit_universe?.name || 'N/A'}</td>
                  <td className="border-2 border-black px-4 py-2">{plan.audit_universe?.sub_unit || '-'}</td>
                  <td className="border-2 border-black px-4 py-2 text-center font-bold">{plan.audit_universe?.assessment_type || "-"}</td>
                  <td className="border-2 border-black px-4 py-2 text-center italic font-bold text-blue-600">{plan.frequency}</td>
                  <td className="border-2 border-black px-4 py-2 text-center">Mg-{plan.start_week}</td>
                  <td className="border-2 border-black px-4 py-2 text-center">Mg-{plan.end_week}</td>
                  <td className="border-2 border-black px-4 py-2 text-center font-bold">{plan.year}</td>
                  <td className="border-2 border-black px-4 py-2 text-center">
                    <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:scale-110 transition-transform">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {plans.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-400 italic border-2 border-t-0 border-black bg-white">
              Belum ada data PKPT yang dibuat.
            </div>
          )}
        </div>

        {/* --- MODAL FORM --- */}
        {showForm && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border-2 border-black">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-gray-800">
                Tambah PKPT
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Pilih Objek Audit</label>
                  <select 
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm"
                    value={newPlan.audit_universe_id}
                    onChange={(e) => handleUniverseChange(e.target.value)}
                  >
                    <option value="">Pilih Audit Universe...</option>
                    {universes.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.corporate_risk_category})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Risiko</label>
                    <input readOnly className="w-full p-4 bg-gray-100 border border-gray-100 rounded-2xl outline-none text-gray-500 font-semibold" value={newPlan.risk_category} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Frekuensi</label>
                    <input readOnly className="w-full p-4 bg-gray-100 border border-gray-100 rounded-2xl outline-none text-blue-600 font-bold" value={newPlan.frequency} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Minggu Mulai (1-52)</label>
                    <input type="number" min="1" max="52" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-semibold" value={newPlan.start_week} onChange={(e) => setNewPlan({...newPlan, start_week: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Minggu Selesai (1-52)</label>
                    <input type="number" min="1" max="52" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-semibold" value={newPlan.end_week} onChange={(e) => setNewPlan({...newPlan, end_week: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Tahun Pelaksanaan</label>
                  <input type="number" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" value={newPlan.year} onChange={(e) => setNewPlan({...newPlan, year: e.target.value})} />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100">
                    Batal
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100">
                    Simpan Rencana
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