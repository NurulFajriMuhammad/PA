import React, { useState, useEffect, useCallback } from "react";
import {
  BsShieldCheck,
  BsSearch,
  BsFilter,
  BsPlusLg,
  BsX, 
  BsPencilSquare, 
  BsTrash, 
  BsEye, 
  BsFileText, 
  BsCheckCircleFill,
  BsClipboardCheck,
  BsClockHistory,
  BsCheck2Circle,
  BsFolder2Open,
  BsWallet2
} from "react-icons/bs";
import apiClient from "../../../../Shared/api/apiClient";
import useRealTime from "../../hooks/useRealTime";
import { useNavigate } from "react-router-dom";
import { notifySuccess, notifyError, notifyConfirm } from "@shared/utils/notifier.jsx";
import { useAuth } from "@shared/hooks/useAuth.jsx";

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

const isExpired = (periodeStr) => {
  if (!periodeStr) return false;
  const parts = periodeStr.split(" s/d ");
  if (parts.length !== 2) return false;
  const endDateStr = parts[1];
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);
  const today = new Date();
  return today > endDate;
};

const Assurance = () => {
  const navigate = useNavigate();
  const { user: authData } = useAuth();
  const userRole = authData?.user?.roles?.[0]?.name || "";
  const isKepalaSPI = userRole.toLowerCase() === "kepala spi";

  const [dataAssurance, setDataAssurance] = useState([]);
  const [suratTugasList, setSuratTugasList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    noST: "",
    objek_pemeriksaan: "",
    nama_kegiatan: "",
    jenis_audit: "Reguler",
    objek_audit: "",
    metodologi: "",
    tujuan: "",
    ruang_lingkup: "",
    sasaran: "",
    area_risiko: "",
    tgl_mulai: "",
    tgl_selesai: "",
    lokasi: "",
    estimasi_anggaran: "",
    sumber_anggaran: "",
    ketua: "",
    pengendali_teknis: "",
    koordinator: "",
    auditor: [""],
    keterangan: "",
    status: "Planning",
  });

  const formatRupiah = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const clean = val.toString().replace(/\D/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(clean).replace("Rp", "Rp ").trim();
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const extract = (res) =>
        res.data?.data || (Array.isArray(res.data) ? res.data : []);

      const [resAssurance, resST, resUsers, resUnits] = await Promise.all([
        apiClient.get("/api/assurance").catch(() => ({ data: [] })),
        apiClient.get("/api/surat-tugas").catch(() => ({ data: [] })),
        apiClient.get("/api/users").catch(() => ({ data: [] })),
        apiClient.get("/api/units").catch(() => ({ data: [] })),
      ]);

      setDataAssurance(extract(resAssurance));
      setSuratTugasList(extract(resST));
      setUsersList(extract(resUsers));
      setUnits(extract(resUnits));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sinkronisasi Real-Time
  useRealTime(['assurance', 'surat_tugas', 'users', 'units'], () => {
    fetchData();
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSTChange = (val) => {
    const st = suratTugasList.find((item) => item.nomor_surat === val);
    if (st) {
      // Split periode_pemeriksaan (format: "YYYY-MM-DD s/d YYYY-MM-DD")
      const dates = st.periode_pemeriksaan?.split(" s/d ") || ["", ""];
      
      setFormData((prev) => ({
        ...prev,
        noST: val,
        tgl_mulai: dates[0] || "",
        tgl_selesai: dates[1] || "",
        ketua: st.ketua || "",
        pengendali_teknis: st.pengendali_teknis || "",
        koordinator: st.koordinator || "",
        auditor: st.auditor ? st.auditor.split(", ") : [""],
      }));
    } else {
      setFormData((prev) => ({ ...prev, noST: val }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const st = suratTugasList.find((item) => item.nomor_surat === formData.noST);
    const koordinator = usersList.find((u) => u.name === formData.koordinator);
    const pt = usersList.find((u) => u.name === formData.pengendali_teknis);
    const ketua = usersList.find((u) => u.name === formData.ketua);
    const auditorIds = formData.auditor
      .map((name) => usersList.find((u) => u.name === name)?.id)
      .filter(Boolean);

    const payload = {
      surat_tugas_id: st?.id,
      objek_pemeriksaan: formData.objek_pemeriksaan,
      nama_kegiatan: formData.nama_kegiatan,
      jenis_audit: formData.jenis_audit,
      objek_audit: formData.objek_audit,
      metodologi: formData.metodologi,
      tujuan: formData.tujuan,
      ruang_lingkup: formData.ruang_lingkup,
      sasaran: formData.sasaran,
      area_risiko: formData.area_risiko,
      periode_awal: formData.tgl_mulai,
      periode_akhir: formData.tgl_selesai,
      lokasi: formData.lokasi,
      estimasi_anggaran: formData.estimasi_anggaran ? parseInt(formData.estimasi_anggaran.toString().replace(/\D/g, ""), 10) : null,
      sumber_anggaran: formData.sumber_anggaran || null,
      koordinator_id: koordinator?.id,
      pt_id: pt?.id,
      ketua_id: ketua?.id,
      auditor_id: auditorIds[0] || null,
      auditor_ids: auditorIds,
      keterangan: formData.keterangan,
    };

    try {
      setLoading(true);
      if (isEdit && selectedId) {
        await apiClient.put(`/api/assurance/${selectedId}`, payload);
        notifySuccess("Data assurance berhasil diupdate!");
      } else {
        await apiClient.post("/api/assurance", payload);
        notifySuccess("Data assurance berhasil disimpan!");
      }
      setShowModal(false);
      fetchData();
      resetForm();
    } catch (err) {
      console.log(err.response?.data);
      notifyError("Gagal simpan data assurance.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      noST: "",
      objek_pemeriksaan: "",
      nama_kegiatan: "",
      jenis_audit: "Reguler",
      objek_audit: "",
      metodologi: "",
      tujuan: "",
      ruang_lingkup: "",
      sasaran: "",
      area_risiko: "",
      tgl_mulai: "",
      tgl_selesai: "",
      lokasi: "",
      estimasi_anggaran: "",
      sumber_anggaran: "",
      ketua: "",
      pengendali_teknis: "",
      koordinator: "",
      auditor: [""],
      keterangan: "",
      status: "Planning",
    });
    setIsEdit(false);
    setSelectedId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      noST: item.surat_tugas?.nomor_surat || "",
      objek_pemeriksaan: item.objek_pemeriksaan || "",
      nama_kegiatan: item.nama_kegiatan || "",
      jenis_audit: item.jenis_audit || "Reguler",
      objek_audit: item.objek_audit || "",
      metodologi: item.metodologi || "",
      tujuan: item.tujuan || "",
      ruang_lingkup: item.ruang_lingkup || "",
      sasaran: item.sasaran || "",
      area_risiko: item.area_risiko || "",
      tgl_mulai: item.periode_awal ? item.periode_awal.split('T')[0] : "",
      tgl_selesai: item.periode_akhir ? item.periode_akhir.split('T')[0] : "",
      lokasi: item.lokasi || "",
      estimasi_anggaran: item.estimasi_anggaran || "",
      sumber_anggaran: item.sumber_anggaran || "",
      ketua: item.ketua?.name || "",
      pengendali_teknis: item.pt?.name || "",
      koordinator: item.koordinator?.name || "",
      auditor: item.auditors && item.auditors.length > 0
        ? item.auditors.map((aud) => aud.name)
        : (item.auditor ? [item.auditor.name] : [""]),
      keterangan: item.keterangan || "",
      status: item.status || "Planning",
    });
    setSelectedId(item.id);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = (id, status) => {
    if (status?.toLowerCase() === "selesai" && !isKepalaSPI) {
      notifyError("Hanya Kepala SPI yang dapat menghapus audit yang sudah selesai.");
      return;
    }

    notifyConfirm("Yakin ingin menghapus data audit assurance ini?", async () => {
      try {
        setLoading(true);
        await apiClient.delete(`/api/assurance/${id}`);
        fetchData();
        notifySuccess("Data berhasil dihapus!");
      } catch (err) {
        console.error(err);
        notifyError("Gagal menghapus data");
      } finally {
        setLoading(false);
      }
    });
  };

  const addAuditor = () => {
    setFormData((prev) => ({ ...prev, auditor: [...prev.auditor, ""] }));
  };

  const removeAuditor = (index) => {
    const updated = [...formData.auditor];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, auditor: updated }));
  };

  const handleAuditorChange = (index, value) => {
    const updated = [...formData.auditor];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, auditor: updated }));
  };

  // Logika Filter & Search
  const filteredData = dataAssurance.filter(item => 
    item.nama_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.objek_pemeriksaan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedData = filteredData.reduce((acc, item) => {
    const unit = item.objek_pemeriksaan || "Unit Lainnya / Eksternal";
    if (!acc[unit]) acc[unit] = [];
    acc[unit].push(item);
    return acc;
  }, {});

  // Filter list user berdasarkan role secara case-insensitive
  const koordinatorOptions = usersList.filter(
    (u) =>
      u.roles?.[0]?.name?.toLowerCase() === "koordinator" ||
      u.name === formData.koordinator
  );
  const pengendaliTeknisOptions = usersList.filter(
    (u) =>
      u.roles?.[0]?.name?.toLowerCase() === "pengendali teknis" ||
      u.name === formData.pengendali_teknis
  );
  const ketuaTimOptions = usersList.filter(
    (u) =>
      ["ketua", "ketua tim"].includes(u.roles?.[0]?.name?.toLowerCase()) ||
      u.name === formData.ketua
  );
  const getAuditorOptionsForIndex = (currentVal) => {
    return usersList.filter(
      (u) =>
        u.roles?.[0]?.name?.toLowerCase() === "auditor" ||
        u.name === currentVal
    );
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 py-4 font-sans">
      <div className="w-full">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-blue-100">
              <BsShieldCheck size={12} /> Primary Audit Process
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
              Audit <span className="text-blue-600">Assurance</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Manajemen pelaksanaan audit, kertas kerja, dan monitoring tindak lanjut.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <BsPlusLg size={18} /> Buat Registrasi Audit
          </button>
        </div>

        {/* --- TABLE / GROUPED VIEW --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th rowSpan="2" className="p-5 text-sm font-bold border-r border-slate-700 w-[40%] uppercase tracking-wider">
                    Unit & Kegiatan Audit
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
                    <td colSpan="6" className="py-20 text-center text-slate-400 font-medium tracking-widest animate-pulse text-xs uppercase">
                      Memuat Data Assurance...
                    </td>
                  </tr>
                ) : Object.keys(groupedData).length > 0 ? (
                  Object.keys(groupedData).map((unit) => (
                    <React.Fragment key={unit}>
                      {/* UNIT HEADER ROW */}
                      <tr className="bg-slate-50/80 border-b-2 border-slate-200">
                        <td colSpan="6" className="p-3 px-5 border-l-4 border-blue-600">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                             <BsFolder2Open className="text-blue-500" size={16} /> {unit}
                          </span>
                        </td>
                      </tr>

                      {/* DATA ROWS */}
                      {groupedData[unit].map((item) => {
                        let totalDraft = 0;
                        let totalMonev = 0;
                        let totalClose = 0;

                        if (item.kka) {
                          item.kka.forEach(k => {
                            if (k.temuan) {
                              k.temuan.forEach(t => {
                                const st = (t.analisis?.status || 'draft').toLowerCase();
                                if (st.includes('close')) totalClose++;
                                else if (st.includes('monev')) totalMonev++;
                                else totalDraft++;
                              });
                            }
                          });
                        }

                        return (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                          <td className="p-4 pl-8 border-r border-slate-50">
                            <button 
                              onClick={() => navigate(`/internal/assurance/${item.id}`)}
                              className="text-left font-bold text-slate-800 text-sm hover:text-blue-700 transition-colors line-clamp-2 leading-snug group-hover:underline decoration-blue-300 underline-offset-4"
                              title="Buka Ruang Kerja Audit"
                            >
                              {item.nama_kegiatan}
                            </button>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                              ST: {item.surat_tugas?.nomor_surat || "Belum Terikat"}
                            </p>
                          </td>

                          {/* REALT-TIME DOKUMEN COUNT */}
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

                          {/* AKSI */}
                          <td className="text-center p-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => navigate(`/internal/assurance/${item.id}`)}
                                className="p-2.5 bg-slate-100 text-slate-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm" title="Buka Workspace"
                              >
                                <BsEye size={16} />
                              </button>
                              
                              {item.status_label?.toLowerCase() !== "selesai" && (
                                <>
                                  <button onClick={() => handleEdit(item)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm" title="Edit Data">
                                    <BsPencilSquare size={16} />
                                  </button>
                                  <button onClick={() => handleDelete(item.id, item.status_label)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" title="Hapus Data">
                                    <BsTrash size={16} />
                                  </button>
                                </>
                              )}

                              {item.status_label?.toLowerCase() === "selesai" && isKepalaSPI && (
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
                    <td colSpan="6" className="py-16 text-center text-slate-400 font-medium text-sm">
                       Belum ada data audit assurance.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL FORM ================= */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white text-slate-800 rounded-[2rem] p-6 sm:p-8 w-full max-w-5xl shadow-2xl overflow-y-auto max-h-[90vh] border border-blue-100 flex flex-col relative animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-800 flex items-center gap-2.5">
                    <BsShieldCheck className="text-blue-600 animate-pulse" size={24} /> Registrasi Audit — Parameter Pelaksanaan Pengawasan
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Berdasarkan IIA Global Standards 2024 · SPAI-AAIPI · IPPF 2017
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <BsX size={28} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-2 space-y-6">
                
                {/* --- SUMBER SURAT TUGAS --- */}
                <div>
                  <div className="bg-blue-50/80 border border-blue-100/50 text-blue-800 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2 shadow-sm">
                    <BsClipboardCheck size={14} className="text-blue-600" /> DASAR PELAKSANAAN (SURAT TUGAS)
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                      <span>Nomor Penugasan Audit <span className="text-rose-500 ml-0.5">*</span></span>
                      <span className="text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold ml-auto uppercase tracking-wide">GIAS 2024: Standar 13.1</span>
                    </label>
                    <select
                      required
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
                      value={formData.noST}
                      onChange={(e) => handleSTChange(e.target.value)}
                    >
                      <option value="">-- Pilih nomor surat tugas (auto-fill data) --</option>
                      {suratTugasList.map((st) => {
                        const expired = isExpired(st.periode_pemeriksaan);
                        return (
                          <option 
                            key={st.id} 
                            value={st.nomor_surat}
                            disabled={expired && formData.noST !== st.nomor_surat}
                          >
                            {st.nomor_surat} - {st.deskripsi?.substring(0, 60)}... {expired ? " 🔒" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <span className="text-[10px] text-slate-400 font-medium leading-relaxed block mt-1">
                      Wajib ada dasar penugasan formal sebelum audit dimulai (IIA Standard 2200 — Engagement Planning)
                    </span>
                  </div>
                </div>

                {/* --- IDENTITAS PENUGASAN --- */}
                <div>
                  <div className="bg-blue-50/80 border border-blue-100/50 text-blue-800 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2 shadow-sm">
                    <BsFileText size={14} className="text-blue-600" /> IDENTITAS PENUGASAN
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Kategori / divisi terperiksa <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all cursor-pointer shadow-sm"
                          value={formData.objek_pemeriksaan}
                          onChange={(e) => setFormData({ ...formData, objek_pemeriksaan: e.target.value })}
                        >
                          <option value="">-- Pilih --</option>
                          {units.map((u) => (
                            <option key={u.id} value={u.nama}>{u.nama}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Nama kegiatan audit <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold text-sm text-slate-800 placeholder-slate-400 transition-all shadow-sm"
                          value={formData.nama_kegiatan}
                          onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                          placeholder="Contoh: Audit Kesiapan Infrastruktur Q2 2026..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Jenis audit <span className="text-rose-500">*</span>
                          </label>
                        </div>
                        <select
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all cursor-pointer shadow-sm"
                          value={formData.jenis_audit}
                          onChange={(e) => setFormData({ ...formData, jenis_audit: e.target.value })}
                        >
                          <option value="Reguler">Audit Umum</option>
                          <option value="Khusus">Audit Khusus</option>
                          <option value="Investigasi">Audit Investigasi</option>
                          {/* <option value="Follow-up">Follow-up</option> */}
                        </select>
                        <span className="text-[10px] text-slate-400 font-medium block leading-snug mt-1">
                          Audit Umum / Audit Khusus / Audit Investigasi
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Objek audit <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 placeholder-slate-400 transition-all shadow-sm"
                          value={formData.objek_audit}
                          onChange={(e) => setFormData({ ...formData, objek_audit: e.target.value })}
                          placeholder="Data Center & Server Utama..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Metodologi <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 placeholder-slate-400 transition-all shadow-sm"
                          value={formData.metodologi}
                          onChange={(e) => setFormData({ ...formData, metodologi: e.target.value })}
                          placeholder="Observasi, Review Log, Pen-Test..."
                        />
                        <span className="text-[10px] text-slate-400 font-medium block leading-snug mt-1">
                          Sampling, wawancara, analisis dokumen, dll
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tujuan <span className="text-rose-500">*</span></label>
                          <span className="text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold ml-auto uppercase tracking-wide">IIA Std. 2210</span>
                        </div>
                        <textarea
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium text-sm text-slate-800 placeholder-slate-400 h-28 resize-none transition-all leading-relaxed shadow-sm"
                          value={formData.tujuan}
                          onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                          placeholder="Tujuan spesifik pemeriksaan — apa yang ingin dicapai..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ruang lingkup <span className="text-rose-500">*</span></label>
                          <span className="text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold ml-auto uppercase tracking-wide">IIA Std. 2220</span>
                        </div>
                        <textarea
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium text-sm text-slate-800 placeholder-slate-400 h-28 resize-none transition-all leading-relaxed shadow-sm"
                          value={formData.ruang_lingkup}
                          onChange={(e) => setFormData({ ...formData, ruang_lingkup: e.target.value })}
                          placeholder="Batasan dan cakupan audit — proses, sistem, periode..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sasaran / target <span className="text-rose-500">*</span></label>
                        <textarea
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium text-sm text-slate-800 placeholder-slate-400 h-28 resize-none transition-all leading-relaxed shadow-sm"
                          value={formData.sasaran}
                          onChange={(e) => setFormData({ ...formData, sasaran: e.target.value })}
                          placeholder="Target yang ingin dicapai dari audit ini..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Area risiko yang diaudit</label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">GIAS 2024: Standar 13.2</span>
                          </div>
                        </div>
                        <textarea
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium text-sm text-slate-800 placeholder-slate-400 h-28 resize-none transition-all leading-relaxed shadow-sm"
                          value={formData.area_risiko}
                          onChange={(e) => setFormData({ ...formData, area_risiko: e.target.value })}
                          placeholder="Risiko utama yang menjadi fokus — operasional, keuangan, kepatuhan, IT..."
                        />
                        <span className="text-[10px] text-slate-400 font-medium block leading-snug mt-1">
                          Risk-based audit approach — IIA Standard 2201
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- WAKTU & TEMPAT --- */}
                <div>
                  <div className="bg-blue-50/80 border border-blue-100/50 text-blue-800 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2 shadow-sm">
                    <BsClockHistory size={14} className="text-blue-600" /> WAKTU & TEMPAT - GIAS 2024: Standar 13.5
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 gap-1.5">
                        Periode pelaksanaan <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          required
                          className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all cursor-text shadow-sm"
                          value={formData.tgl_mulai}
                          onChange={(e) => setFormData({ ...formData, tgl_mulai: e.target.value })}
                        />
                        <span className="text-slate-400 font-bold text-xs uppercase px-1">s/d</span>
                        <input
                          type="date"
                          required
                          className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all cursor-text shadow-sm"
                          value={formData.tgl_selesai}
                          onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lokasi pelaksanaan</label>
                      <input
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 placeholder-slate-400 transition-all shadow-sm"
                        value={formData.lokasi}
                        onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                        placeholder="Kantor Pusat Lt. 3..."
                      />
                    </div>
                  </div>
                </div>

                {/* --- ANGGARAN --- */}
                <div>
                  <div className="bg-blue-50/80 border border-blue-100/50 text-blue-800 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2 shadow-sm">
                    <BsWallet2 size={14} className="text-blue-600" /> ANGGARAN - GIAS 2024: Standar 13.5
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Estimasi anggaran (IDR)</label>
                        <div className="flex items-center gap-1.5">
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold text-sm text-slate-800 transition-all shadow-sm"
                          value={formData.estimasi_anggaran ? formatRupiah(formData.estimasi_anggaran) : ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            setFormData({ ...formData, estimasi_anggaran: raw });
                          }}
                          placeholder="Rp 0"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block leading-snug mt-1">
                        Resource allocation — IIA Standard 2230
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sumber anggaran</label>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">opsional</span>
                      </div>
                      <select
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all cursor-pointer shadow-sm"
                        value={formData.sumber_anggaran}
                        onChange={(e) => setFormData({ ...formData, sumber_anggaran: e.target.value })}
                      >
                        <option value="">-- Pilih --</option>
                        <option value="APBN">APBN</option>
                        <option value="APBD">APBD</option>
                        <option value="Internal">Anggaran Internal</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <span className="text-[10px] text-slate-400 font-medium block leading-snug mt-1">
                        APBN / APBD / anggaran internal / dll
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- STRUKTUR TIM --- */}
                <div>
                  <div className="bg-blue-50/80 border border-blue-100/50 text-blue-800 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2 shadow-sm">
                    <BsCheck2Circle className="text-emerald-600" size={16} /> STRUKTUR PERSONIL — GIAS 2024: Standar 13.5
                  </div>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Koordinator <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all cursor-pointer shadow-sm"
                          value={formData.koordinator}
                          onChange={(e) => setFormData({ ...formData, koordinator: e.target.value })}
                        >
                          <option value="">-- Pilih --</option>
                          {koordinatorOptions.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name} ({u.roles?.[0]?.name || "N/A"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Pengendali Teknis Audit (PTA) <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all cursor-pointer shadow-sm"
                          value={formData.pengendali_teknis}
                          onChange={(e) => setFormData({ ...formData, pengendali_teknis: e.target.value })}
                        >
                          <option value="">-- Pilih --</option>
                          {pengendaliTeknisOptions.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name} ({u.roles?.[0]?.name || "N/A"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Ketua Auditor <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all cursor-pointer shadow-sm"
                          value={formData.ketua}
                          onChange={(e) => setFormData({ ...formData, ketua: e.target.value })}
                        >
                          <option value="">-- Pilih --</option>
                          {ketuaTimOptions.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name} ({u.roles?.[0]?.name || "N/A"})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
                        Auditor
                      </label>
                      
                      <div className="space-y-3.5">
                        {formData.auditor.map((aud, index) => (
                          <div key={index} className="flex items-center gap-3.5 animate-in slide-in-from-bottom-2 duration-150">
                            <div className="w-10 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 shrink-0 shadow-sm">
                              {index + 1}
                            </div>
                            <select
                              className="flex-1 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 transition-all shadow-sm cursor-pointer"
                              value={aud}
                              onChange={(e) => handleAuditorChange(index, e.target.value)}
                            >
                              <option value="">-- Pilih auditor (hanya tim terdaftar) --</option>
                              {getAuditorOptionsForIndex(aud).map((user) => (
                                <option key={user.id} value={user.name}>
                                  {user.name} ({user.roles?.[0]?.name || "N/A"})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeAuditor(index)}
                              className="w-11 h-11 bg-rose-550 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all shrink-0 border border-rose-100 shadow-sm active:scale-95"
                              title="Hapus Auditor"
                            >
                              <BsTrash size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addAuditor}
                        className="mt-4 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <BsPlusLg size={12}/> Tambah Auditor Baru
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- INFORMASI TAMBAHAN --- */}
                <div>
                  <div className="bg-blue-50/80 border border-blue-100/50 text-blue-800 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2 shadow-sm">
                    <BsFileText size={14} className="text-blue-600" /> INFORMASI TAMBAHAN
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Keterangan tambahan</label>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">opsional</span>
                        </div>
                      </div>
                      <textarea
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-semibold text-sm text-slate-800 placeholder-slate-400 h-24 resize-none transition-all shadow-sm"
                        value={formData.keterangan}
                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                        placeholder="Catatan atau informasi lain yang perlu diketahui tim..."
                      />
                    </div>

                    {/* --- REFERENSI STANDAR --- */}
                    <div className="bg-blue-50/40 border border-blue-100 p-5 rounded-2xl text-xs text-slate-500 space-y-3 mt-4 leading-relaxed">
                      <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-blue-100 pb-1.5 flex items-center gap-1.5">
                         Referensi standar yang dipakai
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                          <span>
                            <strong className="text-slate-700 font-bold">IIA Global Standards 2024</strong> — Std. 2200 (Engagement Planning), 2201 (Risk Consideration), 2210 (Objectives), 2220 (Scope), 2230 (Resource Allocation)
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                          <span>
                            <strong className="text-slate-700 font-bold">IPPF 2017</strong> — International Professional Practices Framework, IIA: Standar Kinerja 2000-2600
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                          <span>
                            <strong className="text-slate-700 font-bold">SPAI-AAIPI</strong> — Standar Audit Intern Pemerintah Indonesia: Standar Perencanaan Audit, Penugasan, dan Dokumentasi
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                          <span>
                            <strong className="text-slate-700 font-bold">PER-24/BC/2019</strong> — Tatalaksana Audit Kepabeanan dan Audit Cukai (Standar Acuan Penerbitan Surat Tugas, NPA, dan Hierarki Personil Tim)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider active:scale-[0.98]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-2 w-[60%] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <BsCheckCircleFill size={18} /> {isEdit ? "Update Data Assurance" : "Simpan Data Assurance"}
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

// ================= HELPER COMPONENT =================
const PersonilDropdown = ({ label, value, list, onChange }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <select
      required
      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-- Pilih --</option>
      {list.map((u) => (
        <option key={u.id} value={u.name}>
          {u.name} ({u.roles?.[0]?.name || "N/A"})
        </option>
      ))}
    </select>
  </div>
);

export default Assurance;
