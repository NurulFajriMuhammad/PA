import React, { useState, useEffect } from 'react';
import apiClient from "../../../../Shared/api/apiClient";

import { 
  BsBarChartSteps, BsSearch, BsArrowUpRight, 
  BsCalendarCheck, BsAward, BsClipboardData,
  BsFileEarmarkMedical, BsFunnel, BsX
} from 'react-icons/bs';

const AuditEvaluasi = () => {
  const [dataEvaluasi, setDataEvaluasi] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [units, setUnits] = useState([]);

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
    const res = await apiClient.get("/api/audit-evaluasi");
    setDataEvaluasi(res.data.data || []);
  };


  const fetchUnits = async () => {
    const res = await apiClient.get("/api/units");
    setUnits(res.data.data || []);
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
    program: item.program,
    unit_id: item.unit_id || "",
    periode: item.periode,
    tanggal_evaluasi: item.tanggal_evaluasi,
    target: item.target,
    realisasi: item.realisasi,
    kesimpulan: item.kesimpulan,
    rekomendasi: item.rekomendasi,
    auditor: item.auditor,
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
  } catch (err) {
    console.error(err);
  }
};

const getStatus = (target, realisasi) => {
  const t = Number(target);
  const r = Number(realisasi);

  if (r >= t) return "Very Good";
  if (r >= 75) return "Good";
  return "Need Improvement";
};

const handleDelete = async (id) => {
  if (!window.confirm("Yakin hapus?")) return;

  await apiClient.delete(`/api/audit-evaluasi/${id}`);
  fetchData();
};

  // ================= FORMAT =================
  const formatPercent = (val) => {
    return val ? Number(val).toFixed(1) : 0;
  };

  return (
    <div className="p-6 bg-[#fcfcfd] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsBarChartSteps className="text-emerald-600" /> Audit Evaluasi
          </h1>
          <p className="text-slate-500 mt-1">
            Evaluasi pencapaian target dan efektivitas program
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg"
        >
          <BsFileEarmarkMedical /> Tambah Evaluasi
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Program</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Skor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
{dataEvaluasi.map((item, i) => (
  <tr key={item.id} className="border-b">
    <td className="p-3 text-center">{i + 1}</td>

    <td className="p-3">
      <div className="font-semibold">{item.program}</div>
      <div className="text-xs text-gray-400">
        {item.periode}
      </div>
    </td>

    <td className="p-3 text-center">
      {item.unit?.nama || "-"}
    </td>

    <td className="p-3 text-center">
      {formatPercent(item.realisasi)}%
    </td>

    <td className="p-3 text-center">
      <RatingTag status={getStatus(item.target, item.realisasi)} />
    </td>

    {/* ✅ AKSI DI SINI */}
        <td className="p-4 text-center">
          <div className="flex items-center gap-2 text-sm justify-center">
            <button 
            onClick={() => handleEdit(item)}
            className="text-blue-600 hover:text-blue-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button 
            onClick={() => handleDelete(item.id)}
            className="text-red-500 hover:text-red-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>

  </tr>
))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div className="bg-white w-[700px] p-6 rounded-xl relative">

            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">Tambah Evaluasi</h2>
              <button onClick={() => setOpenModal(false)}>
                <BsX size={24} />
              </button>
            </div>

<div className="grid grid-cols-2 gap-4">

  {/* PROGRAM */}
  <div className="col-span-2 flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1">Program</label>
    <input
      name="program"
      value={form.program}
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

  {/* PERIODE */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1">Periode</label>
    <input
      name="periode"
      value={form.periode}
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

  {/* TANGGAL */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1">Tanggal Evaluasi</label>
    <input
      type="date"
      name="tanggal_evaluasi"
      value={form.tanggal_evaluasi}
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>


  {/* TARGET */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1">Target (%)</label>
    <input
      name="target"
      value={form.target}
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

  {/* REALISASI */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1">Realisasi (%)</label>
    <input
      name="realisasi"
      value={form.realisasi}
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

  {/* KESIMPULAN */}
  <div className="col-span-2 flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1">Kesimpulan Evaluasi</label>
    <textarea
      name="kesimpulan"
      value={form.kesimpulan}
      onChange={handleChange}
      className="border p-2 rounded h-20"
    />
  </div>

  {/* REKOMENDASI */}
  <div className="col-span-2 flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1">Rekomendasi</label>
    <textarea
      name="rekomendasi"
      value={form.rekomendasi}
      onChange={handleChange}
      className="border p-2 rounded h-20"
    />
  </div>

  <div className="flex flex-col">
  <label className="text-xs font-bold text-slate-500 mb-1">
    Unit
  </label>

  <select
    name="unit_id"
    value={form.unit_id}
    onChange={handleChange}
    className="border p-2 rounded"
  >
    <option value="">Pilih Unit</option>

    {units.map((u) => (
      <option key={u.id} value={u.id}>
        {u.nama} ({u.kode})
      </option>
    ))}
  </select>
</div>

  {/* AUDITOR */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1">Auditor</label>
    <input
      name="auditor"
      value={form.auditor}
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

</div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Batal
              </button>

              <button
                onClick={handleSave}
                className="flex-1 bg-emerald-600 text-white py-2 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ================= BADGE =================
const RatingTag = ({ status }) => {
  const config = {
    "Very Good": "bg-emerald-100 text-emerald-700",
    "Good": "bg-blue-100 text-blue-700",
    "Need Improvement": "bg-amber-100 text-amber-700"
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${config[status]}`}>
      {status}
    </span>
  );
};

export default AuditEvaluasi;