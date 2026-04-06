import React, { useState, useEffect, useCallback } from "react";
import {
  BsGlobe,
  BsPlusLg,
  BsX,
  BsPencilSquare,
  BsTrash,
  BsEye,
  BsFileText,
  BsCheckCircleFill,
} from "react-icons/bs";
import apiClient from "../../../Shared/api/apiClient";
import { useNavigate } from "react-router-dom";

const unitToCategoryMap = {
  "Business Development": "Operasional & Produksi",
  "Customer Service": "Operasional & Produksi",
  "Kantor Pusat": "Operasional & Produksi",
  "Finance & Accounting": "Keuangan & Logistik",
  "Human Resources Development": "SDM & Hukum",
  Legal: "SDM & Hukum",
  "APU-PPT": "SDM & Hukum",
  "Compliance & Internal Auditor": "SDM & Hukum",
  "Information Technology": "IT & Infrastruktur",
  "Data Analyst": "IT & Infrastruktur",
};

const ExternalAudit = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    objek_pemeriksaan: "",
    nama_kegiatan: "",
    tujuan: "",
    objek_audit: "",
    ruang_lingkup: "",
    metodologi: "",
    tgl_mulai: "",
    tgl_selesai: "",
    lokasi: "",
    status: "Planning",
    keterangan: "",
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/external-audit");
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        objek_pemeriksaan: form.objek_pemeriksaan,
        nama_kegiatan: form.nama_kegiatan,
        tujuan: form.tujuan,
        objek_audit: form.objek_audit,
        ruang_lingkup: form.ruang_lingkup,
        metodologi: form.metodologi,
        periode_awal: form.tgl_mulai,
        periode_akhir: form.tgl_selesai,
        lokasi: form.lokasi,
        keterangan: form.keterangan,
        status: form.status,
      };

      await apiClient.post("/api/external-audit", payload);
      setShowModal(false);
      setForm(initialForm); // Reset form setelah simpan
      fetchData();
      alert("Data Eksternal Audit berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const groupedData = (data || []).reduce((acc, item) => {
    const key = item.objek_pemeriksaan || "Tanpa Unit";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <BsGlobe className="text-blue-600" /> Monitoring & Evaluasi Eksternal Audit
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <BsPlusLg /> Tambah Data
        </button>
      </div>

      {/* TABLE */}
      <div className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#1a4b84] text-white">
              <tr>
                <th rowSpan="2" className="p-4 text-left font-semibold border-r border-white/10 w-[35%]">
                  Unit / Bidang / Kegiatan
                </th>
                <th colSpan="3" className="p-2 text-center font-semibold border-b border-r border-white/10 bg-[#153d6b]">
                  Jumlah
                </th>
                <th rowSpan="2" className="p-4 text-center font-semibold border-r border-white/10">
                  Status
                </th>
                <th rowSpan="2" className="p-4 text-center font-semibold">
                  Aksi
                </th>
              </tr>
              <tr className="bg-[#245a96]">
                <th className="p-2 text-center font-medium border-r border-white/10 text-[12px]">Draft Temuan</th>
                <th className="p-2 text-center font-medium border-r border-white/10 text-[12px]">Monev</th>
                <th className="p-2 text-center font-medium border-r border-white/10 text-[12px]">Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(groupedData).map((lembaga) => (
                <React.Fragment key={lembaga}>
                  <tr className="bg-slate-50">
                    <td colSpan="6" className="p-3 px-4 text-slate-900 font-bold border-l-4 border-blue-600 uppercase tracking-tight text-[11px]">
                      {lembaga}
                    </td>
                  </tr>
                  {groupedData[lembaga].map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 pl-6 font-medium text-blue-700 hover:underline cursor-pointer" onClick={() => navigate(`/external/audit/${item.id}`)}>
                        {item.nama_kegiatan}
                      </td>
                      <td className="text-center p-3 text-slate-600 font-medium border-r border-slate-50">3</td>
                      <td className="text-center p-3 text-slate-400 border-r border-slate-50">0</td>
                      <td className="text-center p-3 text-slate-400 border-r border-slate-50">0</td>
                      <td className="text-center p-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold shadow-sm border ${item.status === "Selesai" ? "bg-emerald-600 text-white border-emerald-700" : "bg-[#007bff] text-white border-blue-700"}`}>
                          {item.status || "Planning"}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <div className="flex justify-center gap-1">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><BsEye size={18} /></button>
                          <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><BsPencilSquare size={16} /></button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><BsTrash size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <BsFileText className="text-blue-600" /> Input Eksternal Audit
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500">
                <BsX size={28} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-[10px] font-black text-blue-600 uppercase mb-1 ml-1">Objek Pemeriksaan</label>
                <select
                  name="objek_pemeriksaan"
                  value={form.objek_pemeriksaan}
                  onChange={handleChange}
                  className="w-full h-10 px-3 border border-blue-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Sub Unit --</option>
                  {Object.keys(unitToCategoryMap).map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Nama Kegiatan</label>
                <input name="nama_kegiatan" value={form.nama_kegiatan} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Input manual..." />
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Objek Audit</label>
                <input name="objek_audit" value={form.objek_audit} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Tujuan</label>
                <textarea name="tujuan" value={form.tujuan} onChange={handleChange} className="w-full h-16 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none" placeholder="Jelaskan tujuan..." />
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Ruang Lingkup</label>
                <input name="ruang_lingkup" value={form.ruang_lingkup} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Metodologi Audit</label>
                <input name="metodologi" value={form.metodologi} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Periode Pemeriksaan</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" name="tgl_mulai" value={form.tgl_mulai} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                  <input type="date" name="tgl_selesai" value={form.tgl_selesai} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Lokasi</label>
                <input name="lokasi" value={form.lokasi} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Keterangan</label>
                <input name="keterangan" value={form.keterangan} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="md:col-span-2 flex gap-3 mt-4 border-t pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700">Simpan Eksternal Audit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalAudit;