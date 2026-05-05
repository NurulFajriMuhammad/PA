import React, { useState, useEffect } from 'react';
import apiClient from "../../../../Shared/api/apiClient";

import { 
  BsBarChartSteps, 
  BsSearch, 
  BsCalendarCheck, 
  BsAward, 
  BsFileEarmarkMedical, 
  BsX,
  BsPencilSquare,
  BsTrash,
  BsCheckCircle
} from 'react-icons/bs';
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";

const AuditEvaluasi = () => {
  const [dataEvaluasi, setDataEvaluasi] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    program: "",
    unit_id: "",
    periode: "",
    tanggal_evaluasi: "",
    target: "",
    realisasi: "",
    kesimpulan: "",
    rekomendasi: "",
    auditor: "",
  });

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await apiClient.get("/api/audit-evaluasi");
      setDataEvaluasi(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await apiClient.get("/api/units");
      setUnits(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUnits();
  }, []);

  // ================= HANDLE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setForm({
      program: item.program || "",
      unit_id: item.unit_id || "",
      periode: item.periode || "",
      tanggal_evaluasi: item.tanggal_evaluasi || "",
      target: item.target || "",
      realisasi: item.realisasi || "",
      kesimpulan: item.kesimpulan || "",
      rekomendasi: item.rekomendasi || "",
      auditor: item.auditor || "",
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        unit_id: form.unit_id || null,
        target: form.target ? Number(form.target) : null,
        realisasi: form.realisasi ? Number(form.realisasi) : null,
      };

      await apiClient.post("/api/audit-evaluasi", payload);

      fetchData();
      setOpenModal(false);
      resetForm();
      notifySuccess("Evaluasi berhasil disimpan!");
    } catch (err) {
      console.error(err);
      notifyError("Gagal menyimpan evaluasi.");
    }
  };

  const resetForm = () => {
    setForm({
      program: "", unit_id: "", periode: "", tanggal_evaluasi: "", 
      target: "", realisasi: "", kesimpulan: "", rekomendasi: "", auditor: "",
    });
  };

  const getStatus = (target, realisasi) => {
    const t = Number(target);
    const r = Number(realisasi);

    if (r >= t) return "Very Good";
    if (r >= 75) return "Good";
    return "Need Improvement";
  };

  const handleDelete = (id) => {
    notifyConfirm("Apakah Anda yakin ingin menghapus data evaluasi ini?", async () => {
      try {
        await apiClient.delete(`/api/audit-evaluasi/${id}`);
        fetchData();
        notifySuccess("Data evaluasi berhasil dihapus!");
      } catch (err) {
        notifyError("Gagal menghapus data.");
      }
    });
  };

  // ================= FORMAT =================
  const formatPercent = (val) => {
    return val ? Number(val).toFixed(1) : 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredData = dataEvaluasi.filter(item => 
    item.program?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.unit?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-emerald-100">
              <BsAward size={12} /> Performance Evaluation
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
              Audit <span className="text-emerald-600">Evaluasi</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Evaluasi pencapaian target dan efektivitas program secara berkala.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
            className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
          >
            <BsFileEarmarkMedical size={18} /> Tambah Evaluasi
          </button>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="relative w-full md:w-96">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama program atau unit..."
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 text-center w-16">No</th>
                  <th className="px-6 py-4">Program & Periode</th>
                  <th className="px-6 py-4 text-center">Unit Kerja</th>
                  <th className="px-6 py-4 text-center">Skor Realisasi</th>
                  <th className="px-6 py-4 text-center">Status Pencapaian</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((item, i) => (
                  <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">
                      {i + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 text-sm leading-snug mb-1">
                        {item.program}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <BsCalendarCheck size={10} className="text-emerald-500" /> {item.periode}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 font-bold text-xs rounded-lg">
                        {item.unit?.nama || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-baseline gap-0.5 text-sm font-black text-emerald-600">
                        {formatPercent(item.realisasi)} <span className="text-[10px]">%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Target: {item.target}%
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <RatingTag status={getStatus(item.target, item.realisasi)} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center justify-center p-2 bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Edit"
                        >
                          <BsPencilSquare size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center justify-center p-2 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Hapus"
                        >
                          <BsTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400 font-medium text-sm">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <BsBarChartSteps size={32} className="opacity-20" />
                        Belum ada data evaluasi yang dicatat.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL FORM ================= */}
        {openModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <BsBarChartSteps className="text-emerald-500" size={24} /> Tambah Evaluasi
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Catat performa dan hasil audit
                  </p>
                </div>
                <button 
                  onClick={() => setOpenModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <BsX size={28} />
                </button>
              </div>

              <div className="space-y-5">
                
                {/* ROW 1: PROGRAM & UNIT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Program / Objek</label>
                    <input
                      name="program"
                      required
                      value={form.program}
                      onChange={handleChange}
                      placeholder="Contoh: Efisiensi Biaya Produksi..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Kerja (Auditee)</label>
                    <select
                      name="unit_id"
                      required
                      value={form.unit_id}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-sm transition-all cursor-pointer"
                    >
                      <option value="">-- Pilih Unit Kerja --</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nama} ({u.kode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ROW 2: PERIODE & TANGGAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Periode Evaluasi</label>
                    <input
                      name="periode"
                      required
                      value={form.periode}
                      onChange={handleChange}
                      placeholder="Contoh: Q1 2026 / Semester 1..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Evaluasi</label>
                    <input
                      type="date"
                      name="tanggal_evaluasi"
                      required
                      value={form.tanggal_evaluasi}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-sm transition-all"
                    />
                  </div>
                </div>

                {/* ROW 3: TARGET & REALISASI */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Penilaian (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="target"
                        required
                        value={form.target}
                        onChange={handleChange}
                        placeholder="100"
                        className="w-full p-3.5 pr-10 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Realisasi / Aktual (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="realisasi"
                        required
                        value={form.realisasi}
                        onChange={handleChange}
                        placeholder="85"
                        className="w-full p-3.5 pr-10 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-600 text-sm transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* ROW 4: KESIMPULAN & REKOMENDASI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kesimpulan Evaluasi</label>
                    <textarea
                      name="kesimpulan"
                      required
                      value={form.kesimpulan}
                      onChange={handleChange}
                      placeholder="Jelaskan kesimpulan atas realisasi yang dicapai..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm h-28 resize-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rekomendasi Tindak Lanjut</label>
                    <textarea
                      name="rekomendasi"
                      required
                      value={form.rekomendasi}
                      onChange={handleChange}
                      placeholder="Tuliskan saran perbaikan untuk auditee..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm h-28 resize-none transition-all"
                    />
                  </div>
                </div>

                {/* ROW 5: AUDITOR */}
                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Auditor / Penilai</label>
                  <input
                    name="auditor"
                    required
                    value={form.auditor}
                    onChange={handleChange}
                    placeholder="Nama Auditor Pengampu"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm transition-all"
                  />
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex gap-3 pt-6 mt-4">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="flex-1 py-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-2 w-[60%] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <BsCheckCircle size={18} /> Simpan Evaluasi
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ================= BADGE COMPONENT =================
const RatingTag = ({ status }) => {
  const config = {
    "Very Good": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Good": "bg-blue-50 text-blue-700 border-blue-200",
    "Need Improvement": "bg-amber-50 text-amber-700 border-amber-200"
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${config[status]}`}>
      {status}
    </span>
  );
};

export default AuditEvaluasi;
