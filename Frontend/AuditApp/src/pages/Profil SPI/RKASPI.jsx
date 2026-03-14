import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Target,
  BarChart,
  TrendingUp,
} from "lucide-react";
import apiClient from "../../../../Shared/api/axios";

const RKASpiPage = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Variabel newPlan disamakan strukturnya dengan RenstraSPI
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
    try {
      await apiClient.delete(`/api/rka/${id}`);
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
              Rencana Kerja <span className="text-blue-600">& Anggaran</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Entry data KPI SPI secara dinamis ke database.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} /> Buat RKA Baru
          </button>
        </div>

        {/* --- TABEL RENCANA DINAMIS --- */}
        <div className="mb-12">
          <table className="w-full border-2 border-black text-sm bg-white">
            <thead>
              <tr>
                <th className="border-2 border-black px-4 py-2 text-left">Nama KPI</th>
                <th className="border-2 border-black px-4 py-2 text-center">Min</th>
                <th className="border-2 border-black px-4 py-2 text-center">Max</th>
                <th className="border-2 border-black px-4 py-2 text-center">Nilai</th>
                <th className="border-2 border-black px-4 py-2 text-center">Satuan</th>
                <th className="border-2 border-black px-4 py-2 text-center">Tahun</th>
                <th className="border-2 border-black px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {kpis.map((plan) => (
                <tr key={plan.id}>
                  <td className="border-2 border-black px-4 py-2 font-semibold">
                    {plan.kpi_name}
                  </td>
                  <td className="border-2 border-black px-4 py-2 text-center">
                    {plan.polaritas_min || "-"}
                  </td>
                  <td className="border-2 border-black px-4 py-2 text-center">
                    {plan.polaritas_max || "-"}
                  </td>
                  <td className="border-2 border-black px-4 py-2 text-center font-bold">
                    {plan.nilai_realisasi}
                  </td>
                  <td className="border-2 border-black px-4 py-2 text-center uppercase">
                    {plan.satuan}
                  </td>
                  <td className="border-2 border-black px-4 py-2 text-center">
                    {plan.tahun}
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

          {kpis.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-400 italic border-2 border-t-0 border-black bg-white">
              Belum ada data RKA yang dibuat.
            </div>
          )}
        </div>

        {/* --- MODAL FORM --- */}
        {showForm && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-gray-800">
                Tambah Data RKA
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                {/* Nama KPI */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Nama Indikator (KPI)</label>
                  <input
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                    value={newPlan.kpi}
                    onChange={(e) => setNewPlan({ ...newPlan, kpi: e.target.value })}
                    placeholder="Input nama KPI..."
                  />
                </div>

                {/* Min & Max */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Polaritas Min</label>
                    <input
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                      value={newPlan.min}
                      onChange={(e) => setNewPlan({ ...newPlan, min: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Polaritas Max</label>
                    <input
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                      value={newPlan.max}
                      onChange={(e) => setNewPlan({ ...newPlan, max: e.target.value })}
                    />
                  </div>
                </div>

                {/* Nilai & Satuan */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Nilai Realisasi</label>
                    <input
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                      value={newPlan.nilai}
                      onChange={(e) => setNewPlan({ ...newPlan, nilai: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Satuan</label>
                    <input
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                      value={newPlan.satuan}
                      onChange={(e) => setNewPlan({ ...newPlan, satuan: e.target.value })}
                    />
                  </div>
                </div>

                {/* Tahun */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-800 ml-1">Tahun Anggaran</label>
                  <input
                    type="number"
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-gray-700 font-semibold"
                    value={newPlan.tahun}
                    onChange={(e) => setNewPlan({ ...newPlan, tahun: e.target.value })}
                  />
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

export default RKASpiPage;