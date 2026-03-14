import React, { useState, useEffect } from "react";
import {
  Rocket,
  Target,
  Cpu,
  BarChart,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import apiClient from "../../../../Shared/api/axios";

const RenstraSPI = () => {
  const [auditUniverse, setAuditUniverse] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newPlan, setNewPlan] = useState({
    audit_universe_id: "",
    frequency: "", // Sekarang kosong untuk diisi manual
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
      setNewPlan({ ...newPlan, audit_universe_id: "", frequency: "" }); // Reset form
      fetchData();
    } catch (err) {
      alert("Gagal simpan rencana");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/spijangkapanjang/${id}`);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase">
              Rencana Jangka <span className="text-blue-600">Panjang</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Sinkronisasi objek audit dari Audit Universe ke jadwal
              pemeriksaan.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} /> Buat Rencana Baru
          </button>
        </div>

        {/* --- TABEL RENCANA DINAMIS --- */}
        <div className="mb-12">
          <table className="w-full border-2 border-black text-sm">
            <thead>
              <tr>
                <th className="border-2 border-black px-4 py-2 text-left">
                  Nama Audit (Universe)
                </th>
                <th className="border-2 border-black px-4 py-2 text-center">
                  Risiko
                </th>
                <th className="border-2 border-black px-4 py-2 text-center">
                  Frekuensi
                </th>
                <th className="border-2 border-black px-4 py-2 text-center">
                  Tahun Persiapan
                </th>
                <th className="border-2 border-black px-4 py-2 text-center">
                  Tahun Audit
                </th>
                <th className="border-2 border-black px-4 py-2 text-center">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="border-2 border-black px-4 py-2">
                    <div className="font-semibold">
                      {plan.audit_universe?.name}
                    </div>
                  </td>

                  <td className="border-2 border-black px-4 py-2 text-center">
                    {plan.audit_universe?.assessment_type}
                  </td>

                  <td className="border-2 border-black px-4 py-2 text-center">
                    {plan.frequency}
                  </td>

                  <td className="border-2 border-black px-4 py-2 text-center">
                    {plan.prep_year}
                  </td>

                  <td className="border-2 border-black px-4 py-2 text-center">
                    {plan.audit_year}
                  </td>

                  <td className="border-2 border-black px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {plans.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-400 italic">
              Belum ada rencana audit yang dibuat.
            </div>
          )}
        </div>

        {/* --- MODAL FORM --- */}
        {showForm && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-gray-800">
                Tambah Rencana Strategis
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-800 ml-1">
                    Pilih Objek Audit (Universe)
                  </label>
                  <select
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm"
                    value={newPlan.audit_universe_id}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        audit_universe_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Pilih Nama Audit</option>
                    {auditUniverse.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name} ({uni.corporate_risk_category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* INPUT FREKUENSI MANUAL */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-800 ml-1">
                    Frekuensi Audit
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 3 Tahunan / Tahunan"
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                    value={newPlan.frequency}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, frequency: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">
                      Tahun Persiapan
                    </label>
                    <input
                      type="number"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                      value={newPlan.prep_year}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, prep_year: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">
                      Tahun Pemeriksaan
                    </label>
                    <input
                      type="number"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                      value={newPlan.audit_year}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, audit_year: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100"
                  >
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

export default RenstraSPI;
