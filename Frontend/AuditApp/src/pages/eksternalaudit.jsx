import React, { useState, useEffect, useCallback } from "react";
import {
  BsGlobe,
  BsSearch,
  BsPlusLg,
  BsX,
  BsPencilSquare,
  BsTrash,
  BsEye,
  BsFileText,
  BsCheckCircleFill,
  BsFolder2Open,
  BsClockHistory
} from "react-icons/bs";
import apiClient from "../../../Shared/api/apiClient";
import useRealTime from "../hooks/useRealTime";
import { useNavigate } from "react-router-dom";
import { notifySuccess, notifyError, notifyConfirm } from "../../../Shared/utils/notifier.jsx";
import { useAuth } from "../../../Shared/hooks/useAuth.jsx";


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
  const { user: authData } = useAuth();
  const userRole = authData?.user?.roles?.[0]?.name || "";
  const isKepalaSPI = userRole.toLowerCase() === "kepala spi";
  const isAuditorOrAdmin = userRole.toLowerCase() === "auditor" || userRole.toLowerCase() === "administrator audit";
  const canAddData = isKepalaSPI || isAuditorOrAdmin;
  
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [units, setUnits] = useState([]);

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
    lembaga_pemeriksa: "",
    status: "Perencanaan",

    keterangan: "",
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resAudit, resUnits] = await Promise.all([
        apiClient.get("/api/external-audit"),
        apiClient.get("/api/units").catch(() => ({ data: [] }))
      ]);
      setData(resAudit.data.data || []);
      setUnits(resUnits.data?.data || (Array.isArray(resUnits.data) ? resUnits.data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sinkronisasi Real-Time
  useRealTime(['external_audits', 'external_audit_temuan'], () => {
    fetchData();
  });

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
        lembaga_pemeriksa: form.lembaga_pemeriksa,
        keterangan: form.keterangan,
        status: form.status,
      };

      if (isEdit && selectedId) {
        await apiClient.put(`/api/external-audit/${selectedId}`, payload);
      } else {
        await apiClient.post("/api/external-audit", payload);
      }
      setShowModal(false);
      setForm(initialForm); 
      fetchData();
      notifySuccess("Data Eksternal Audit berhasil disimpan!");
    } catch (err) {
      notifyError("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleEdit = (item) => {
    setForm({
      objek_pemeriksaan: item.objek_pemeriksaan || "",
      nama_kegiatan: item.nama_kegiatan || "",
      tujuan: item.tujuan || "",
      objek_audit: item.objek_audit || "",
      ruang_lingkup: item.ruang_lingkup || "",
      metodologi: item.metodologi || "",
      tgl_mulai: item.periode_awal ? item.periode_awal.split('T')[0] : "",
      tgl_selesai: item.periode_akhir ? item.periode_akhir.split('T')[0] : "",
      lokasi: item.lokasi || "",
      lembaga_pemeriksa: item.lembaga_pemeriksa || "",
      status: item.status || "Perencanaan",

      keterangan: item.keterangan || "",
    });
    setSelectedId(item.id);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = (id, status) => {
    // Jika status Selesai atau Closed, hanya Kepala SPI yang boleh hapus
    const statusLower = status?.toLowerCase();
    if ((statusLower === "selesai" || statusLower === "closed") && !isKepalaSPI) {
      notifyError("Hanya Kepala SPI yang dapat menghapus audit yang sudah selesai.");
      return;
    }

    notifyConfirm("Yakin ingin menghapus data eksternal audit ini?", async () => {

      try {
        setLoading(true);
        await apiClient.delete(`/api/external-audit/${id}`);
        fetchData();
        notifySuccess("Data berhasil dihapus!");
      } catch (err) {
        console.error(err);
        notifyError("Gagal menghapus data");
        setLoading(false);
      }
    });
  };

  const filteredData = data.filter(item => 
    item.nama_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.objek_pemeriksaan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedData = filteredData.reduce((acc, item) => {
    const key = item.objek_pemeriksaan || "Unit Lainnya / Eksternal";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-4 sm:px-8 py-4 font-sans">
      <div className="w-full">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-blue-100">
              <BsGlobe size={12} /> External Party Audit
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
              Eksternal <span className="text-blue-600">Audit</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Monitoring dan evaluasi temuan audit dari pihak eksternal.
            </p>
          </div>

          {canAddData && (
            <button
              onClick={() => {
                setForm(initialForm);
                setIsEdit(false);
                setSelectedId(null);
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <BsPlusLg size={18} /> Tambah Data Audit
            </button>
          )}
        </div>

        {/* --- SEARCH BAR --- */}
        {/* <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="relative w-full md:w-96">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama kegiatan atau unit..."
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div> */}

        {/* --- TABLE / GROUPED VIEW --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th rowSpan="2" className="p-5 text-sm font-bold border-r border-slate-700 w-[35%] uppercase tracking-wider">
                    Unit & Kegiatan Audit
                  </th>
                  <th rowSpan="2" className="p-5 text-center text-sm font-bold border-r border-slate-700 uppercase tracking-wider w-[20%]">
                    Lembaga Pemeriksa
                  </th>
                  <th colSpan="3" className="p-3 text-center text-xs font-bold border-b border-r border-slate-700 bg-black uppercase tracking-widest">
                    Status Temuan
                  </th>
                  <th rowSpan="2" className="p-5 text-center text-sm font-bold border-r border-slate-700 uppercase tracking-wider w-[20%]">
                    Status Progress
                  </th>
                  <th rowSpan="2" className="p-5 text-center text-sm font-bold uppercase tracking-wider w-[15%]">
                    Aksi
                  </th>
                </tr>
                <tr className="bg-[#1f2937]">
                  <th className="p-2 text-center font-semibold border-r border-slate-600 text-[10px] uppercase tracking-widest text-slate-300">Draft</th>
                  <th className="p-2 text-center font-semibold border-r border-slate-600 text-[10px] uppercase tracking-widest text-slate-300">Monev</th>
                  <th className="p-2 text-center font-semibold border-slate-600 text-[10px] uppercase tracking-widest text-emerald-400">Close</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-slate-400 font-medium tracking-widest animate-pulse text-xs uppercase">
                      Memuat Data Eksternal Audit...
                    </td>
                  </tr>
                ) : Object.keys(groupedData).length > 0 ? (
                  Object.keys(groupedData).map((lembaga) => (
                    <React.Fragment key={lembaga}>
                      {/* UNIT HEADER ROW */}
                      <tr className="bg-slate-50/80 border-b-2 border-slate-200">
                        <td colSpan="7" className="p-3 px-5 border-l-4 border-blue-600">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                             <BsFolder2Open className="text-blue-500" size={16} /> {lembaga}
                          </span>
                        </td>
                      </tr>

                      

                      {/* DATA ROWS */}
                      {groupedData[lembaga].map((item) => {
                        let totalDraft = 0;
                        let totalMonev = 0;
                        let totalClose = 0;

                        if (item.temuan) {
                          item.temuan.forEach(t => {
                            const s = (t.status || "").toLowerCase();
                            if (s.includes('close')) totalClose++;
                            else if (s.includes('monev')) totalMonev++;
                            else totalDraft++;
                          });
                        }

                        return (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                          <td className="p-4 pl-8 border-r border-slate-50">
                            <button 
                              onClick={() => navigate(`/external/audit/${item.id}`)}
                              className="text-left font-bold text-slate-800 text-sm hover:text-blue-600 transition-colors line-clamp-2 leading-snug group-hover:underline decoration-blue-300 underline-offset-4"
                              title="Buka Detail Audit"
                            >
                              {item.nama_kegiatan}
                            </button>
                            {item.lokasi && (
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                {item.lokasi}
                              </p>
                            )}
                          </td>

                          {/* LEMBAGA PEMERIKSA */}
                          <td className="p-4 border-r border-slate-50 text-center">
                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider px-3 py-1.5 block truncate" title={item.lembaga_pemeriksa}>
                              {item.lembaga_pemeriksa || "-"}
                            </span>
                          </td>

                          {/* REAL-TIME Temuan COUNT */}
                          <td className="text-center p-4 text-sm font-black text-rose-600 border-x border-slate-50 bg-slate-50/50">{totalDraft > 0 ? totalDraft : 0}</td>
                          <td className="text-center p-4 text-sm font-bold text-amber-500 border-r border-slate-50">{totalMonev > 0 ? totalMonev : 0}</td>
                          <td className="text-center p-4 text-sm font-bold text-emerald-500 border-r border-slate-50">{totalClose > 0 ? totalClose : 0}</td>

                          {/* STATUS BADGE */}
                          <td className="text-center p-4 border-r border-slate-50">
                            <span 
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm text-white"
                              style={{ 
                                backgroundColor: item.status_color || "#94a3b8", 
                              }}
                            >
                              {(item.status_label === "Selesai" || item.status_label === "Closed") && <BsCheckCircleFill className="mr-1.5" size={12} />}
                              {item.status_label}
                            </span>
                          </td>

                          {/* AKSI BUTTONS */}
                          <td className="text-center p-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => navigate(`/external/audit/${item.id}`)}
                                className="p-2.5 bg-slate-100 text-slate-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm" title="Lihat"
                              >
                                <BsEye size={16} />
                              </button>
                              
                              {item.status_label?.toLowerCase() !== "selesai" && item.status_label?.toLowerCase() !== "closed" && (
                                <>
                                  <button 
                                    onClick={() => handleEdit(item)}
                                    className="p-2.5 bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm" title="Edit"
                                  >
                                    <BsPencilSquare size={16} />
                                  </button>
                                  <button onClick={() => handleDelete(item.id, item.status_label)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" title="Hapus">
                                    <BsTrash size={16} />
                                  </button>
                                </>
                              )}
                              
                              {(item.status_label?.toLowerCase() === "selesai" || item.status_label?.toLowerCase() === "closed") && isKepalaSPI && (
                                <button onClick={() => handleDelete(item.id, item.status_label)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" title="Hapus (Role Khusus)">
                                  <BsTrash size={16} />
                                </button>
                              )}

                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400 font-medium text-sm">
                       Belum ada data eksternal audit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL FORM ================= */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200 flex flex-col relative">
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                    <BsFileText className="text-blue-500" size={24} /> Input Eksternal Audit
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Detail informasi audit dari pihak luar
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <BsX size={28} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-2 space-y-6">
                
                {/* --- OBJEK & KEGIATAN --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ml-1">Objek Pemeriksaan (Pihak Eksternal / Unit)</label>
                    <input
                      required
                      name="objek_pemeriksaan"
                      list="unit-list"
                      className="w-full p-3.5 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all shadow-sm"
                      value={form.objek_pemeriksaan}
                      onChange={handleChange}
                      placeholder="Pilih atau ketik unit/entitas yang diperiksa..."
                    />
                    <datalist id="unit-list">
                      {units.map((u) => (
                        <option key={u.id} value={u.nama}>
                          {u.nama}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ml-1">Nama Kegiatan Audit</label>
                    <input
                      required
                      name="nama_kegiatan"
                      className="w-full p-3.5 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-900 transition-all shadow-sm"
                      value={form.nama_kegiatan}
                      onChange={handleChange}
                      placeholder="Contoh: Audit Eksternal ISO 9001 oleh SGS..."
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ml-1">Lembaga Pemeriksa / KAP</label>
                    <input
                      required
                      name="lembaga_pemeriksa"
                      className="w-full p-3.5 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-900 transition-all shadow-sm"
                      value={form.lembaga_pemeriksa}
                      onChange={handleChange}
                      placeholder="Contoh: SGS Indonesia, TUV SUD, KAP Siddharta..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tujuan</label>
                    <textarea
                      name="tujuan"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm h-28 resize-none transition-all leading-relaxed"
                      value={form.tujuan}
                      onChange={handleChange}
                      placeholder="Tujuan spesifik pemeriksaan..."
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Objek Audit Spesifik</label>
                      <input
                        name="objek_audit"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                        value={form.objek_audit}
                        onChange={handleChange}
                        placeholder="Divisi/Departemen spesifik..."
                      />
                    </div>
                    <div className="space-y-1.5 mt-auto">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Metodologi Audit</label>
                      <input
                        name="metodologi"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                        value={form.metodologi}
                        onChange={handleChange}
                        placeholder="Contoh: Sampling, Wawancara..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ruang Lingkup</label>
                    <input
                      name="ruang_lingkup"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                      value={form.ruang_lingkup}
                      onChange={handleChange}
                      placeholder="Batasan audit..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lokasi Pelaksanaan</label>
                    <input
                      name="lokasi"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                      value={form.lokasi}
                      onChange={handleChange}
                      placeholder="Kantor Pusat..."
                    />
                  </div>
                </div>

                {/* --- WAKTU --- */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                    <BsClockHistory size={12}/> Periode Pemeriksaan
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      required
                      name="tgl_mulai"
                      className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-text"
                      value={form.tgl_mulai}
                      onChange={handleChange}
                    />
                    <span className="text-slate-400 font-bold text-xs uppercase">s/d</span>
                    <input
                      type="date"
                      required
                      min={form.tgl_mulai}
                      name="tgl_selesai"
                      className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-text"
                      value={form.tgl_selesai}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* --- KETERANGAN --- */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Keterangan Tambahan</label>
                  <input
                    name="keterangan"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                    value={form.keterangan}
                    onChange={handleChange}
                    placeholder="Opsional..."
                  />
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-2 w-[60%] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <BsCheckCircleFill size={18} /> Simpan Data
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

export default ExternalAudit;
