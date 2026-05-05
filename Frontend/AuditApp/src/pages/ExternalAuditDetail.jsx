import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../Shared/api/apiClient";
import {
  BsX,
  BsArrowLeft,
  BsTrash,
  BsPencilSquare,
  BsPlusLg,
  BsCloudUpload,
  BsFileEarmarkText,
  BsCheckCircleFill,
  BsCardChecklist
} from "react-icons/bs";
import { notifySuccess, notifyError, notifyConfirm } from "../../../Shared/utils/notifier.jsx";

const ExternalAuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openInfo, setOpenInfo] = useState(false);
  const [temuan, setTemuan] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [statusTemuanList, setStatusTemuanList] = useState([]);
  const [availableTransitions, setAvailableTransitions] = useState([]);

  // Fetch status temuan untuk warna badge
  useEffect(() => {
    apiClient.get('/api/status-temuan').then(res => {
      setStatusTemuanList(res.data || []);
    }).catch(() => {});
  }, []);

  // Helper: ambil style badge dari daftar status
  const getStatusTemuan = (val) => {
    const v = (val || "").toLowerCase();
    const found = statusTemuanList.find((s) => {
      const n = s.nama.toLowerCase();
      return n === v || n.includes(v) || v.includes(n);
    });

    if (found) {
      return { bg: found.warna, text: found.warna_teks, label: found.nama };
    }

    // Fallback default jika tidak ada di database status-temuan
    if (v === "monev") return { bg: "#fef3c7", text: "#d97706", label: "Monev" };
    if (v === "draft" || v === "draft temuan") return { bg: "#f1f5f9", text: "#64748b", label: "Draft Temuan" };
    if (v === "close") return { bg: "#dcfce7", text: "#15803d", label: "Close" };
    if (v === "menunggu konfirmasi") return { bg: "#ffedd5", text: "#9a3412", label: "Menunggu Konfirmasi" };
    if (v === "pengisian rtl") return { bg: "#dbeafe", text: "#1e40af", label: "Pengisian RTL" };
    if (v === "final") return { bg: "#e0f2fe", text: "#0369a1", label: "Final" };
    if (v === "closed" || v === "selesai") return { bg: "#d1fae5", text: "#059669", label: "Closed" };

    return { bg: "#f1f5f9", text: "#64748b", label: val || "Draft" };
  };

  const getCategoryStyle = (cat) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("major")) return { bg: "#A32D2D", text: "#ffffff" };
    if (c.includes("minor")) return { bg: "#854F0B", text: "#ffffff" };
    if (c.includes("observasi")) return { bg: "#185FA5", text: "#ffffff" };
    if (c.includes("ofi")) return { bg: "#0F6E56", text: "#ffffff" };
    return { bg: "#f1f5f9", text: "#475569" };
  };

  const [previewFile, setPreviewFile] = useState(null);

  const RenderPreviewModal = () => {
    if (!previewFile) return null;

    const fileUrl = `${import.meta.env.VITE_BACKEND_URL}/storage/${previewFile.lampiran}`;
    const fileExt = (previewFile.lampiran || "").split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
    const isPdf = fileExt === 'pdf';
    // Browser biasanya akan download otomatis file Office jika dimasukkan ke iframe
    const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt);

    return (
      <div className="fixed inset-0 z-[10000] flex flex-col bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="flex flex-col h-full max-w-6xl mx-auto w-full bg-white shadow-2xl relative overflow-hidden">
          {/* Header Preview */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <BsFileEarmarkText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight line-clamp-1 max-w-[300px]">
                  {previewFile.nama_lampiran || "Preview Dokumen"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Dokumen Pendukung Temuan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noreferrer" 
                download={isOffice}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-2"
              >
                {isOffice ? <BsCloudUpload /> : null} {isOffice ? 'Download File' : 'Buka Tab Baru'}
              </a>
              <button 
                onClick={() => setPreviewFile(null)} 
                className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <BsX size={24} />
              </button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 bg-slate-100 relative flex items-center justify-center overflow-auto p-4">
            {isImage ? (
              <img src={fileUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-lg bg-white" />
            ) : isPdf ? (
              <iframe 
                src={fileUrl} 
                className="absolute inset-0 w-full h-full border-0" 
                title="Preview PDF"
              />
            ) : (
              <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BsFileEarmarkText size={40} />
                </div>
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Preview Tidak Tersedia</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                  Format file <span className="font-bold text-slate-700">.{fileExt}</span> tidak dapat dipratinjau langsung di browser. Silakan unduh dokumen untuk melihat isinya.
                </p>
                <a 
                  href={fileUrl} 
                  download 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 uppercase text-xs tracking-widest"
                >
                  <BsCloudUpload size={18} /> Unduh Dokumen Sekarang
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [lheFile, setLheFile] = useState(null);
  const [existingLhe, setExistingLhe] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [existingLampiran, setExistingLampiran] = useState(null);

  const handleEdit = (item) => {
    setForm({
      masalah: item.masalah || "",
      kriteria: item.kriteria || "",
      sebab: item.sebab || "",
      akibat: item.akibat || "",
      kondisi: item.kondisi || "",
      rekomendasi: item.rekomendasi || "",
      rencana: item.rencana || "",
      keterangan: item.keterangan || "",
      target_penyelesaian: item.target_penyelesaian || "",
      nilai_kerugian: item.nilai_kerugian || "",
      kategori: item.kategori || ""
    });

    setSelectedId(item.id);
    setIsEdit(true);
    setOpenModal(true);
    setExistingLampiran(item.lampiran || null);
    setLheFile(null);
  };

  const fetchTemuan = async () => {
    try {
      const res = await apiClient.get(`/api/external-audit/${id}/temuan`);
      setTemuan(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get(`/api/external-audit/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        notifyError("Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchTransitions = async () => {
      try {
        const res = await apiClient.get(`/api/external-audit/${id}/transitions`);
        setAvailableTransitions(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetail();
    fetchTemuan();
    fetchTransitions();
  }, [id]);

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Mencegah submit default HTML form
    try {
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        formData.append(key, form[key] || "");
      });

      formData.append("external_audit_id", id);

      if (lheFile) {
        formData.append("lampiran", lheFile);
      }

      const isComplete =
        form.masalah &&
        form.kriteria &&
        form.sebab &&
        form.akibat &&
        form.kondisi &&
        form.rekomendasi &&
        form.rencana &&
        form.target_penyelesaian;

      formData.append("status", isComplete ? "final" : "draft");

      if (isEdit) {
        await apiClient.post(`/api/external-audit-temuan/${selectedId}?_method=PUT`, formData);
      } else {
        await apiClient.post("/api/external-audit-temuan", formData);
      }

      fetchTemuan();
      setOpenModal(false);
      setIsEdit(false);
      setSelectedId(null);
      setForm({
        masalah: "", kriteria: "", sebab: "", akibat: "", kondisi: "",
        rekomendasi: "", rencana: "", keterangan: "", target_penyelesaian: "", nilai_kerugian: "",
        kategori: ""
      });
      setLheFile(null);
      notifySuccess("Data temuan berhasil disimpan!");

    } catch (err) {
      console.error(err);
      notifyError("Gagal simpan");
    }
  };

  const handleTransition = (transition) => {
    notifyConfirm(`Apakah Anda yakin ingin memproses ${transition.label}?`, async () => {
      try {
        setLoading(true);
        const res = await apiClient.post(`/api/external-audit/${id}/transition`, {
          action: transition.action,
          next_status_id: transition.next_status_id
        });
        if (res.data.success) {
          notifySuccess(res.data.message);
          // Refresh data
          const resDetail = await apiClient.get(`/api/external-audit/${id}`);
          setData(resDetail.data.data);
          fetchTemuan();
          // Refresh transitions
          const resTrans = await apiClient.get(`/api/external-audit/${id}/transitions`);
          setAvailableTransitions(resTrans.data.data || []);
        }
      } catch (err) {
        notifyError(err.response?.data?.message || "Gagal melakukan transisi");
      } finally {
        setLoading(false);
      }
    }, null, { 
      title: "Konfirmasi Alur Pengajuan",
      confirmColor: "bg-blue-600",
      confirmHoverColor: "hover:bg-blue-700",
      iconColor: "bg-blue-600",
      iconShadow: "shadow-blue-200"
    });
  };

  const [form, setForm] = useState({
    masalah: "",
    kriteria: "",
    sebab: "",
    akibat: "",
    kondisi: "",
    rekomendasi: "",
    rencana: "",
    keterangan: "",
    target_penyelesaian: "",
    nilai_kerugian: "",
    kategori: ""
  });

  const formatRupiah = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  const handleDelete = (idTemuan) => {
    notifyConfirm("Yakin hapus data temuan ini? Tindakan ini tidak dapat dibatalkan.", async () => {
      try {
        await apiClient.delete(`/api/external-audit-temuan/${idTemuan}`);
        notifySuccess("Temuan berhasil dihapus");
        fetchTemuan();
      } catch (err) {
        notifyError("Gagal hapus temuan");
      }
    }, null, { title: "Konfirmasi Hapus" });
  };

  const resetForm = () => {
    setForm({
      masalah: "",
      kriteria: "",
      sebab: "",
      akibat: "",
      kondisi: "",
      rekomendasi: "",
      rencana: "",
      keterangan: "",
      target_penyelesaian: "",
      nilai_kerugian: "",
      kategori: ""
    });

    setIsEdit(false);
    setSelectedId(null);
    setLheFile(null);
    setExistingLampiran(null);
  };

  useEffect(() => {
    if (!openModal) {
      resetForm();
    }
  }, [openModal]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading...</div>;
  }

  if (!data) {
    return <div className="p-6 text-center text-red-500">Data tidak ditemukan</div>;
  }

  return (
    <div className="p-2 space-y-6">
      
      {/* ===================== KEMBALI & HEADER LAMA (TIDAK DIUBAH) ===================== */}
      <div>
        <button
          onClick={() => navigate("/external-audit")}
          className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-900 text-white text-sm font-bold rounded-lg shadow-md shadow-red-100 transition-all active:scale-95"
        >
          <BsArrowLeft size={18} />
          Kembali ke daftar audit eksternal
        </button>

        <div className="bg-slate-800 text-white p-6 rounded-xl mt-4">
          <h1
            onClick={() => setOpenInfo(!openInfo)}
            className="text-xl font-bold cursor-pointer flex justify-between items-center"
          >
            Detail Pemeriksaan
            <div className="flex justify-end">
              <span 
                className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest text-white shadow-sm"
                style={{ backgroundColor: data.status_color || "#2563eb" }}
              >
                {data.status_label}
              </span>
            </div>
          </h1>
          
          <p
            onClick={() => setOpenInfo(!openInfo)}
            className="text-xs text-slate-300 cursor-pointer mt-1"
          >
            Klik untuk melihat detail pemeriksaan
          </p>

          <div
            className={`transition-all duration-500 overflow-hidden ${
              openInfo ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p><b>Nama Objek Audit :</b> {data.objek_pemeriksaan}</p>
                <p><b>Lembaga Pemeriksa :</b> {data.lembaga_pemeriksa || "-"}</p>
                <p><b>Kegiatan :</b> {data.nama_kegiatan}</p>
                <p><b>Jenis Audit :</b> Audit Eksternal</p>
                <p><b>Lokasi :</b> {data.lokasi || "-"}</p>
                <p>
                  <b>Periode Audit :</b>{" "}
                  {formatTanggal(data.periode_awal)} s/d{" "}
                  {formatTanggal(data.periode_akhir)}
                </p>
              </div>

              <div className="space-y-2">
                <p><b>Tujuan :</b> {data.tujuan || "-"}</p>
                <p><b>Keterangan :</b> {data.keterangan || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== TABEL TEMUAN (STYLING BARU) ===================== */}
      <div className="overflow-hidden transition-all">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/80 border-b border-slate-200 gap-4">
          <div>
            <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BsCardChecklist className="text-slate-700" /> Daftar Temuan
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hasil Evaluasi Eksternal</p>
          </div>
          
          <div className="flex gap-3">
            {availableTransitions.map((t, idx) => (
              <button 
                key={idx}
                onClick={() => handleTransition(t)}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 ${t.color} hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95`}
              >
                <BsCheckCircleFill size={14} /> {t.label}
              </button>
            ))}

            {data && data.status_label !== "Selesai" && (
              <button
                onClick={() => {
                  resetForm();
                  setOpenModal(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95"
              >
                <BsPlusLg size={14} /> Tambah Temuan
              </button>
            )}
          </div>
        </div>

        <div className="py-6 space-y-6">
          {temuan.length > 0 ? (
            temuan.map((t, i) => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md group">
                {/* --- HEADER ROW --- */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border-b border-slate-100 bg-slate-50/30 gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-slate-400 font-mono text-sm font-bold shrink-0 mt-[2px] min-w-[1.25rem] text-center">
                      {i + 1}
                    </span>
                    <h4 className="text-slate-800 font-bold text-base leading-snug break-words tracking-tight">
                      {t.masalah}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 ml-10 md:ml-0 self-end md:self-center">
                    {/* Category Badge */}
                    {t.kategori && (() => {
                      const catStyle = getCategoryStyle(t.kategori);
                      return (
                        <span 
                          className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm"
                          style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                        >
                          {t.kategori}
                        </span>
                      );
                    })()}
                    
                    {/* Finding Status Badge */}
                    {/* {(() => {
                      const st = getStatusTemuan(t.status);
                      return (
                        <span 
                          className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200"
                          style={st.label === "Final" ? { backgroundColor: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" } : {}}
                        >
                          {st.label}
                        </span>
                      );
                    })()} */}

                    {/* Actions */}
                    {data && data.status_label !== "Selesai" && (t.status || "").toLowerCase() !== "close" && (
                      <div className="flex gap-1.5 ml-2 border-l border-slate-200 pl-3">
                        <button 
                          onClick={() => handleEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90"
                          title="Edit Temuan"
                        >
                          <BsPencilSquare size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                          title="Hapus Temuan"
                        >
                          <BsTrash size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- CONTENT AREA (GRID) --- */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-10">
                    {/* Row 1 */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div> Kriteria
                      </label>
                      <p className="text-xs font-semibold leading-relaxed text-slate-600 break-words pl-3 border-l border-slate-100">
                        {t.kriteria || "-"}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div> Kondisi
                      </label>
                      <p className="text-xs font-semibold leading-relaxed text-slate-500 italic break-words pl-3 border-l border-slate-100">
                        {t.kondisi || "-"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div> Sebab
                      </label>
                      <p className="text-xs font-semibold leading-relaxed text-slate-600 break-words pl-3 border-l border-slate-100">
                        {t.sebab || "-"}
                      </p>
                    </div>

                    {/* Row 2 */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[9px] font-black text-red-500/70 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-200"></div> Akibat / Dampak
                      </label>
                      <p className="text-xs font-bold leading-relaxed text-red-600/90 break-words pl-3 border-l border-red-50/50">
                        {t.akibat || "-"}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[9px] font-black text-blue-500/70 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-200"></div> Rekomendasi
                      </label>
                      <p className="text-xs font-bold leading-relaxed text-blue-600/90 break-words pl-3 border-l border-blue-50/50">
                        {t.rekomendasi || "-"}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div> Rencana Tindakan
                      </label>
                      <p className="text-xs font-bold leading-relaxed text-slate-700 break-words pl-3 border-l border-slate-100">
                        {t.rencana || "-"}
                      </p>
                    </div>
                  </div>

                  {t.keterangan && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Keterangan:</label>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{t.keterangan}</p>
                    </div>
                  )}
                </div>

                {/* --- FOOTER ROW --- */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[10px] font-bold">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 uppercase tracking-widest text-[8px]">Target Selesai:</span>
                      <span className="text-slate-600">{t.target_penyelesaian ? formatTanggal(t.target_penyelesaian) : "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 uppercase tracking-widest text-[8px]">Nilai Kerugian:</span>
                      <span className="text-slate-600">Rp {formatRupiah(t.nilai_kerugian)}</span>
                    </div>
                    {t.lampiran && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 uppercase tracking-widest text-[8px]">Lampiran:</span>
                        <button 
                          onClick={() => setPreviewFile(t)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-[9px] font-bold border border-indigo-100"
                        >
                          <BsFileEarmarkText size={12} /> 
                          <span className="line-clamp-1 max-w-[120px]">
                            {t.nama_lampiran || "Buka Dokumen"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {(() => {
                    const stProg = getStatusTemuan(t.status);
                    return (
                      <div className="flex items-center gap-3 px-4 py-2 ml-auto md:ml-0">
                        <span className="text-slate-400 uppercase tracking-widest text-[8px]">Status Temuan:</span>
                        <span 
                          className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
                          style={{ 
                            backgroundColor: stProg.bg, 
                            color: stProg.text || "#fff" 
                          }}
                        >
                          {stProg.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-100 rounded-2xl shadow-inner border-dashed">
              <div className="flex flex-col items-center gap-3">
                <BsFileEarmarkText size={40} className="text-slate-200" />
                <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Belum ada data temuan</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== POP UP TAMBAH TEMUAN (STYLING BARU) ===================== */}
      {openModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => { setOpenModal(false); resetForm(); }}
          ></div>

          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
              <div>
                <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight flex items-center gap-2">
                  <BsFileEarmarkText className="text-blue-600"/> {isEdit ? "Edit Temuan Audit" : "Input Temuan Audit"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lengkapi data masalah dan rekomendasi</p>
              </div>
              <button onClick={() => { setOpenModal(false); resetForm(); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <BsX size={28} />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSave} className="p-6 pt-1 overflow-y-auto bg-white flex-1 space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Masalah yang dijumpai</label>
                <textarea 
                  name="masalah" value={form.masalah || ""} placeholder="Uraian masalah utama..." onChange={handleChange} 
                  className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kondisi</label>
                  <textarea 
                    name="kondisi" value={form.kondisi || ""} placeholder="Fakta di lapangan..." onChange={handleChange} 
                    className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 resize-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kriteria</label>
                  <textarea 
                    name="kriteria" value={form.kriteria || ""} placeholder="Aturan/Standard yang dilanggar..." onChange={handleChange} 
                    className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sebab</label>
                  <input 
                    name="sebab" value={form.sebab || ""} placeholder="Penyebab terjadinya masalah..." onChange={handleChange} 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">Akibat / Dampak</label>
                  <input 
                    name="akibat" value={form.akibat || ""} placeholder="Dampak/Kerugian yang timbul..." onChange={handleChange} 
                    className="w-full p-3.5 bg-red-50 border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400 font-bold text-sm text-red-800 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nilai Kerugian</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">Rp</span>
                    <input 
                      type="text" name="nilai_kerugian" 
                      value={formatRupiah(form.nilai_kerugian)}
                      onChange={(e) => setForm({ ...form, nilai_kerugian: e.target.value.replace(/\D/g, "") })}
                      className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 text-sm transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target Penyelesaian</label>
                  <input
                    type="date" name="target_penyelesaian" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-text"
                    value={form.target_penyelesaian || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ml-1">Rekomendasi Eksternal</label>
                  <textarea 
                    name="rekomendasi" placeholder="Saran perbaikan..." value={form.rekomendasi || ""} onChange={handleChange} 
                    className="w-full h-24 p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-800 text-sm resize-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rencana Tindakan Perbaikan</label>
                  <textarea 
                    name="rencana" value={form.rencana || ""} placeholder="Langkah konkret auditee..." onChange={handleChange} 
                    className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kategori Temuan</label>
                  <select
                    name="kategori"
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm transition-all"
                    value={form.kategori || ""}
                    onChange={handleChange}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    <option value="Major">Major (Ketidaksesuaian Mayor)</option>
                    <option value="Minor">Minor (Ketidaksesuaian Minor)</option>
                    <option value="Observasi">Observasi (Catatan / Potensi Risiko)</option>
                    <option value="OFI">OFI (Opportunity for Improvement)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Keterangan Opsional</label>
                  <textarea 
                    name="keterangan" value={form.keterangan || ""} placeholder="..." onChange={handleChange} 
                    className="w-full h-20 p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 resize-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lampiran Bukti (Opsional)</label>
                  
                  <label htmlFor="lampiranUpload" className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-100 transition-colors h-[80px]">
                    {/* Jika File Lama Tersedia & Belum pilih file baru */}
                    {existingLampiran && !lheFile && (
                      <div className="flex items-center justify-center gap-3">
                        <a href={`/storage/${existingLampiran}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-[11px] hover:underline flex items-center gap-1.5">
                          <BsFileEarmarkText size={14}/> Lihat File Lama
                        </a>
                        <button type="button" onClick={(e) => { e.preventDefault(); setExistingLampiran(null); }} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded border border-red-200 p-1 flex items-center justify-center transition-colors">
                          <BsX size={12}/>
                        </button>
                      </div>
                    )}

                    {/* Jika File Baru Dipilih */}
                    {lheFile && (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-blue-600 font-bold text-[11px] truncate max-w-[150px]">
                          {lheFile.name}
                        </span>
                        <button type="button" onClick={(e) => { e.preventDefault(); setLheFile(null); }} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded border border-red-200 p-1 flex items-center justify-center transition-colors">
                          <BsX size={12}/>
                        </button>
                      </div>
                    )}

                    {/* Jika Kosong */}
                    {!existingLampiran && !lheFile && (
                       <span className="text-slate-400 font-medium text-[11px] flex items-center gap-2"><BsCloudUpload size={14}/> Klik untuk upload (opsional)</span>
                    )}
                  </label>
                  <input id="lampiranUpload" type="file" className="hidden" onChange={(e) => setLheFile(e.target.files[0])} />
                  <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest text-center mt-1">Ext: JPG, PNG, PDF, DOCX (Maks 5MB)</p>
                </div>
              </div>

              {/* FOOTER MODAL */}
              <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100 shrink-0">
                <button 
                  type="button"
                  onClick={() => { setOpenModal(false); resetForm(); }}
                  className="flex-1 py-4 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-2 w-[60%] py-4 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                  <BsCheckCircleFill size={18} /> {isEdit ? "Simpan Perubahan" : "Simpan Temuan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      
      {RenderPreviewModal()}
    </div>
  );
};

export default ExternalAuditDetail;
