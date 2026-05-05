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
  BsFolder2Open
} from "react-icons/bs";
import apiClient from "../../../../Shared/api/apiClient";
import { useNavigate } from "react-router-dom";
import { notifySuccess, notifyError, notifyConfirm } from "@shared/utils/notifier.jsx";

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

const Assurance = () => {
  const navigate = useNavigate();

  const [dataAssurance, setDataAssurance] = useState([]);
  const [suratTugasList, setSuratTugasList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    noST: "",
    objek_pemeriksaan: "",
    nama_kegiatan: "",
    tujuan: "",
    sasaran: "",
    objek_audit: "",
    ruang_lingkup: "",
    metodologi: "",
    tgl_mulai: "",
    tgl_selesai: "",
    lokasi: "",
    ketua: "",
    pengendali_teknis: "",
    koordinator: "",
    auditor: [""],
    keterangan: "",
    status: "Planning",
  });

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
        // objek_audit tetap kosong untuk diinput manual sesuai permintaan
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
      tujuan: formData.tujuan,
      sasaran: formData.sasaran,
      objek_audit: formData.objek_audit,
      ruang_lingkup: formData.ruang_lingkup,
      metodologi: formData.metodologi,
      periode_awal: formData.tgl_mulai,
      periode_akhir: formData.tgl_selesai,
      lokasi: formData.lokasi,
      koordinator_id: koordinator?.id,
      pt_id: pt?.id,
      ketua_id: ketua?.id,
      auditor_id: auditorIds[0],
      keterangan: formData.keterangan,
    };

    try {
      setLoading(true);
      await apiClient.post("/api/assurance", payload);
      setShowModal(false);
      fetchData();
      resetForm();
      notifySuccess("Data assurance berhasil disimpan!");
    } catch (err) {
      console.log(err.response?.data);
      notifyError("Gagal simpan data assurance.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      noST: "", objek_pemeriksaan: "", nama_kegiatan: "", tujuan: "", sasaran: "",
      objek_audit: "", ruang_lingkup: "", metodologi: "", tgl_mulai: "", tgl_selesai: "",
      lokasi: "", ketua: "", pengendali_teknis: "", koordinator: "", auditor: [""],
      keterangan: "", status: "Planning",
    });
  }

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

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
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
              <thead className="bg-[#1e293b] text-white">
                <tr>
                  <th rowSpan="2" className="p-5 text-sm font-bold border-r border-slate-700 w-[35%] uppercase tracking-wider">
                    Unit & Kegiatan Audit
                  </th>
                  <th colSpan="3" className="p-3 text-center text-xs font-bold border-b border-r border-slate-700 bg-[#0f172a] uppercase tracking-widest">
                    Status Temuan
                  </th>
                  <th rowSpan="2" className="p-5 text-center text-sm font-bold border-r border-slate-700 uppercase tracking-wider w-[20%]">
                    Status Progress
                  </th>
                  <th rowSpan="2" className="p-5 text-center text-sm font-bold uppercase tracking-wider w-[15%]">
                    Aksi
                  </th>
                </tr>
                <tr className="bg-[#334155]">
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
                          <span className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
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
                                const st = t.analisis?.status || 'draft';
                                if (st === 'close') totalClose++;
                                else if (st === 'monev') totalMonev++;
                                else totalDraft++;
                              });
                            }
                          });
                        }

                        return (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                          <td className="p-4 pl-8">
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
                          <td className="text-center p-4 text-sm font-black text-rose-600 border-x border-slate-50 bg-slate-50/30">{totalDraft > 0 ? totalDraft : 0}</td>
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
                              <button className="p-2.5 bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm" title="Edit Data">
                                <BsPencilSquare size={16} />
                              </button>
                              <button className="p-2.5 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" title="Hapus Data">
                                <BsTrash size={16} />
                              </button>
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
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200 flex flex-col relative">
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <BsFileText className="text-blue-500" size={24} /> Registrasi Audit
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Parameter pelaksanaan pengawasan
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <BsX size={28} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-2 space-y-6">
                
                {/* --- SUMBER SURAT TUGAS --- */}
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <BsClipboardCheck size={14} /> Dasar Pelaksanaan (Surat Tugas)
                  </label>
                  <select
                    required
                    className="w-full p-4 bg-white border border-blue-200 rounded-xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                    value={formData.noST}
                    onChange={(e) => handleSTChange(e.target.value)}
                  >
                    <option value="">-- Pilih Nomor Surat Tugas (Auto-Fill Data) --</option>
                    {suratTugasList.map((st) => (
                      <option key={st.id} value={st.nomor_surat}>
                        {st.nomor_surat} - {st.deskripsi?.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* --- OBJEK & KEGIATAN --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori / Divisi Terperiksa</label>
                    <select
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-pointer"
                      value={formData.objek_pemeriksaan}
                      onChange={(e) => setFormData({ ...formData, objek_pemeriksaan: e.target.value })}
                    >
                      <option value="">-- Pilih --</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.nama}>{u.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Kegiatan Audit</label>
                    <input
                      required
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800 transition-all"
                      value={formData.nama_kegiatan}
                      onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                      placeholder="Contoh: Audit Keuangan Q1..."
                    />
                  </div>
                </div>

                {/* --- TUJUAN & SASARAN --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tujuan</label>
                    <textarea
                      required
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm h-28 resize-none transition-all leading-relaxed"
                      value={formData.tujuan}
                      onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                      placeholder="Tujuan spesifik pemeriksaan..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sasaran (Target)</label>
                    <textarea
                      required
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm h-28 resize-none transition-all leading-relaxed"
                      value={formData.sasaran}
                      onChange={(e) => setFormData({ ...formData, sasaran: e.target.value })}
                      placeholder="Target yang ingin dicapai..."
                    />
                  </div>
                </div>

                {/* --- LINGKUP & METODOLOGI --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Objek Audit</label>
                    <input
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                      value={formData.objek_audit}
                      onChange={(e) => setFormData({ ...formData, objek_audit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ruang Lingkup</label>
                    <input
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                      value={formData.ruang_lingkup}
                      onChange={(e) => setFormData({ ...formData, ruang_lingkup: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Metodologi</label>
                    <input
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                      value={formData.metodologi}
                      onChange={(e) => setFormData({ ...formData, metodologi: e.target.value })}
                    />
                  </div>
                </div>

                {/* --- WAKTU & LOKASI --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><BsClockHistory size={12}/> Periode Pelaksanaan</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        required
                        className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-text"
                        value={formData.tgl_mulai}
                        onChange={(e) => setFormData({ ...formData, tgl_mulai: e.target.value })}
                      />
                      <span className="text-slate-400 font-bold text-xs uppercase">s/d</span>
                      <input
                        type="date"
                        required
                        className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-text"
                        value={formData.tgl_selesai}
                        onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lokasi Pelaksanaan</label>
                    <input
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                      value={formData.lokasi}
                      onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                      placeholder="Contoh: Kantor Pusat Lt. 3"
                    />
                  </div>
                </div>

                {/* --- STRUKTUR TIM --- */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <BsCheck2Circle className="text-emerald-500" size={18}/> Struktur Personil
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <PersonilDropdown
                      label="Koordinator"
                      value={formData.koordinator}
                      list={usersList}
                      onChange={(val) => setFormData({ ...formData, koordinator: val })}
                    />
                    <PersonilDropdown
                      label="Pengendali Teknis"
                      value={formData.pengendali_teknis}
                      list={usersList}
                      onChange={(val) => setFormData({ ...formData, pengendali_teknis: val })}
                    />
                    <PersonilDropdown
                      label="Ketua Tim"
                      value={formData.ketua}
                      list={usersList}
                      onChange={(val) => setFormData({ ...formData, ketua: val })}
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
                      Anggota Tim / Auditor
                    </label>
                    
                    <div className="space-y-3">
                      {formData.auditor.map((aud, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-black text-slate-400 shrink-0 shadow-sm">
                            {index + 1}
                          </div>
                          <select
                            className="flex-1 p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all shadow-sm"
                            value={aud}
                            onChange={(e) => handleAuditorChange(index, e.target.value)}
                          >
                            <option value="">-- Pilih Auditor --</option>
                            {usersList.map((user) => (
                              <option key={user.id} value={user.name}>
                                {user.name} ({user.roles?.[0]?.name || "N/A"})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeAuditor(index)}
                            className="w-10 h-10 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center transition-colors shrink-0 border border-red-100 shadow-sm"
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
                      className="mt-4 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <BsPlusLg size={12}/> Tambah Auditor Baru
                    </button>
                  </div>
                </div>

                {/* --- KETERANGAN --- */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Keterangan Tambahan</label>
                  <input
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Opsional..."
                  />
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 text-slate-500 bg-red-100 hover:bg-red-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-2 w-[60%] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <BsCheckCircleFill size={18} /> Simpan Data Assurance
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
