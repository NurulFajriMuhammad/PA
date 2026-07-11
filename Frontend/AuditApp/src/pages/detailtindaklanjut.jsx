import React, { useState, useEffect } from "react";
import { 
  BsArrowLeft, 
  BsPlusLg, 
  BsFileEarmarkArrowDown,
  BsFileEarmarkText,
  BsX, 
  BsCalendar, 
  BsChatLeftText, 
  BsLink45Deg, 
  BsEyeFill,
  BsFileEarmarkPdf, 
  BsPerson, 
  BsGraphUp, 
  BsPencilSquare,
  BsCardChecklist, 
  BsTrash, 
  BsCheckCircleFill,
  BsBoxArrowInRight,
  BsClock,
  BsArrowRepeat,
  BsLightbulb,
  BsSearch,
  BsWrench,
  BsPaperclip,
  BsCashStack,
  BsFlag,
  BsPeople,
  BsExclamationTriangle,
  BsStar,
  BsLock
} from 'react-icons/bs';
import { notifySuccess, notifyError, notifyConfirm } from "../../../Shared/utils/notifier.jsx";
import apiClient from "../../../Shared/api/apiClient";

const EMPTY_CREATE_FORM = { 
    id: "",
    keterangan: "",
    tahun: new Date().getFullYear(),
    bulan: "",
    bukti: null,
    persentase: 0,
    estimasi_selesai: "",
    pic_pelaksana: "",
    kendala: "",
    catatan_tambahan: ""
};

const EMPTY_REVIEW_FORM = { hasil_evaluasi: "", kesimpulan: "" };

const EMPTY_RTL_FORM = {
  langkah_perbaikan: "",
  target_penyelesaian: "",
  prioritas: "",
  pic_rtls: [{ nama: "", jabatan: "", kontak: "" }],
  estimasi_anggaran: "",
  sdm_dibutuhkan: "",
  sarana_alat: "",
  potensi_kendala: "",
  catatan_auditor: ""
};

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, { value: 3, label: "Maret" },
  { value: 4, label: "April" }, { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
  { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, { value: 9, label: "September" },
  { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Desember" },
];

const EVALUATION_OPTIONS = [
  { value: "Belum Sesuai", label: "Belum Sesuai", title: "Tidak ada perubahan / tindakan tidak memadai" },
  { value: "Dalam Proses", label: "Dalam Proses", title: "Tindakan sudah dimulai tapi belum selesai" },
  { value: "Sesuai", label: "Sesuai", title: "Tindakan sudah selesai dan memadai" },
];


const Field = ({ label, value }) => (
  <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{label}</span>
    <div className="text-sm font-medium text-slate-700">{value ?? "-"}</div>
  </div>
);

const DetailTindakLanjut = ({ 
  selectedItem, 
  setMode, 
  isAuditor, 
  refreshDetail, 
  fetchFollowUp, 
  getStatusConfig, 
  formatDate, 
  getMonthLabel 
}) => {
  const isOverdue = (targetDate, status) => {
    if (!targetDate) return false;
    const lowerStatus = (status || "").toLowerCase();
    if (lowerStatus === "close" || lowerStatus === "closed" || lowerStatus === "selesai") return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    return target < today;
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW_FORM);
  const [previewFile, setPreviewFile] = useState(null);
  
  // RTL States
  const [showRtlModal, setShowRtlModal] = useState(false);
  const [rtlForm, setRtlForm] = useState(EMPTY_RTL_FORM);
  const [isSubmittingRtl, setIsSubmittingRtl] = useState(false);
  const [users, setUsers] = useState([]);
  const [jabatans, setJabatans] = useState([]);

  // Fetch Users and Jabatans for PIC selection
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resUsers, resJabatans] = await Promise.all([
          apiClient.get('/api/users'),
          apiClient.get('/api/jabatans')
        ]);
        setUsers(resUsers.data.data || []);
        setJabatans(resJabatans.data || []);
      } catch (err) {
        console.error("Error fetching users/jabatans:", err);
      }
    };
    fetchData();
  }, []);

  const handleDeleteTL = (id) => {
    notifyConfirm(
      "Apakah Anda yakin ingin menghapus data progres ini? Data yang dihapus tidak dapat dikembalikan.",
      async () => {
        try {
          await apiClient.delete(`/api/tindak-lanjut/${id}`);
          notifySuccess("Data progres berhasil dihapus");
          refreshDetail();
        } catch (error) {
          console.error("Error deleting TL:", error);
          notifyError("Gagal menghapus data progres");
        }
      },
      null,
      {
        title: "Hapus Progres",
        confirmText: "Hapus Sekarang",
        cancelText: "Batal",
        icon: BsTrash
      }
    );
  };

  const handleCloseTemuan = (temuanId) => {
    notifyConfirm(
      "Apakah Anda yakin ingin menutup temuan ini? Setelah ditutup, seluruh progres akan dikunci permanen dan tidak dapat diubah lagi.",
      async () => {
        try {
          const res = await apiClient.post(`/api/tindak-lanjut/temuan/${temuanId}/close?jenis=eksternal`);
          notifySuccess(res.data.message || "Temuan berhasil ditutup");
          if (res.data.audit_selesai) {
            notifySuccess("Semua temuan sudah Close. Status audit berubah ke Selesai!");
          }
          await refreshDetail();
          await fetchFollowUp();
        } catch (error) {
          notifyError(error.response?.data?.message || "Gagal menutup temuan");
        }
      },
      null,
      {
        title: "Tutup Temuan",
        confirmText: "Ya, Tutup Temuan",
        cancelText: "Batal",
        icon: BsCheckCircleFill
      }
    );
  };

  const handleSaveRtl = async () => {
    // Validasi input wajib
    if (!rtlForm.langkah_perbaikan || !rtlForm.target_penyelesaian || !rtlForm.prioritas || !rtlForm.pic_rtls[0].nama) {
      notifyError("Harap isi Langkah Perbaikan, Target, Prioritas, dan minimal 1 PIC");
      return;
    }

    setIsSubmittingRtl(true);
    try {
      await apiClient.post(`/api/tindak-lanjut/temuan/${selectedItem.temuan_id}/rtl?jenis=${selectedItem.jenis_audit}`, rtlForm);
      
      // Update status temuan menjadi Pengisian Tindak Lanjut Temuan
      if (selectedItem.jenis_audit === 'eksternal') {
        await apiClient.put(`/api/external-audit-temuan/${selectedItem.temuan_id}`, { 
          status: "Pengisian Tindak Lanjut Temuan" 
        });
      } else {
        // Internal status updated via AnalisisTemuan endpoint or handled by backend directly
      }

      notifySuccess("Rencana Tindak Lanjut (RTL) berhasil disimpan");
      setShowRtlModal(false);
      await refreshDetail();

    } catch (err) {
      notifyError(err.response?.data?.message || "Gagal menyimpan RTL");
    } finally {
      setIsSubmittingRtl(false);
    }
  };

  const handleAddPic = () => setRtlForm({ ...rtlForm, pic_rtls: [...rtlForm.pic_rtls, { nama: "", jabatan: "", kontak: "" }] });
  const handleRemovePic = (index) => setRtlForm({ ...rtlForm, pic_rtls: rtlForm.pic_rtls.filter((_, i) => i !== index) });
  const handlePicChange = (index, field, value) => {
    setRtlForm((prev) => {
      const newPics = prev.pic_rtls.map((pic, i) => {
        if (i !== index) return pic;
        const updatedPic = { ...pic, [field]: value };

        // Auto-fill jabatan if name is selected from users
        if (field === 'nama') {
          const selectedUser = users.find((u) => u.name === value);
          if (selectedUser && selectedUser.jabatan) {
            updatedPic.jabatan = selectedUser.jabatan.nama;
          }
        }
        return updatedPic;
      });
      return { ...prev, pic_rtls: newPics };
    });
  };

  const formatRupiah = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleBudgetChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, "");
    if (/^\d*$/.test(rawValue)) {
      setRtlForm({ ...rtlForm, estimasi_anggaran: rawValue });
    }
  };

  const openRtlModal = () => {
    if (selectedItem?.rtl_submitted_at) {
      setRtlForm({
        langkah_perbaikan: selectedItem.rencana_koreksi || selectedItem.rencana || "",
        target_penyelesaian: selectedItem.target_penyelesaian ? selectedItem.target_penyelesaian.substring(0, 10) : "",
        prioritas: selectedItem.prioritas || "",
        pic_rtls: Array.isArray(selectedItem.pic_rtls) && selectedItem.pic_rtls.length > 0 
                  ? selectedItem.pic_rtls 
                  : [{ nama: "", jabatan: "", kontak: "" }],
        estimasi_anggaran: selectedItem.estimasi_anggaran || "",
        sdm_dibutuhkan: selectedItem.sdm_dibutuhkan || "",
        sarana_alat: selectedItem.sarana_alat || "",
        potensi_kendala: selectedItem.potensi_kendala || "",
        catatan_auditor: selectedItem.catatan_auditor || ""
      });
    } else {
      setRtlForm(EMPTY_RTL_FORM);
    }
    setShowRtlModal(true);
  };

  const handleSaveTL = async () => {
    // Validasi input wajib
    if (!createForm.keterangan || !createForm.bulan || !createForm.tahun) {
      notifyError("Harap isi semua kolom yang wajib (Tindakan Dilakukan, Bulan, dan Tahun)");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("tahun", createForm.tahun);
      formData.append("bulan", createForm.bulan);
      formData.append("keterangan", createForm.keterangan);
      formData.append("persentase", createForm.persentase);
      formData.append("estimasi_selesai", createForm.estimasi_selesai);
      formData.append("pic_pelaksana", createForm.pic_pelaksana);
      formData.append("kendala", createForm.kendala);
      formData.append("catatan_tambahan", createForm.catatan_tambahan);
      if (createForm.bukti instanceof File) formData.append("bukti", createForm.bukti);

      if (createForm.id) {
        // UPDATE MODE
        formData.append("_method", "PUT");
        await apiClient.post(`/api/tindak-lanjut/${createForm.id}`, formData);
        notifySuccess("Tindak lanjut berhasil diperbarui");
      } else {
        // CREATE MODE
        await apiClient.post(`/api/tindak-lanjut/${selectedItem.temuan_id}/detail?jenis=${selectedItem.jenis_audit}`, formData);
        
        // Update status temuan menjadi Monev (Menunggu Verifikasi)
        if (selectedItem.jenis_audit === 'eksternal') {
          await apiClient.put(`/api/external-audit-temuan/${selectedItem.temuan_id}`, { 
            status: "Monev" 
          });
        }
        
        notifySuccess("Tindak lanjut berhasil ditambahkan");
      }

      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE_FORM);
      await refreshDetail();
    } catch (err) { notifyError("Gagal menyimpan data"); }
  };

  const openEditModal = (tl) => {
    setCreateForm({
      id: tl.id,
      tahun: tl.tahun,
      bulan: tl.bulan,
      keterangan: tl.keterangan || "",
      persentase: tl.persentase || 0,
      estimasi_selesai: tl.estimasi_selesai || "",
      pic_pelaksana: tl.pic_pelaksana || "",
      kendala: tl.kendala || "",
      catatan_tambahan: tl.catatan_tambahan || "",
      bukti: tl.bukti
    });
    setShowCreateModal(true);
  };

  const openReviewModal = (item) => {
    setReviewItem(item);
    setReviewForm({ hasil_evaluasi: item.hasil_evaluasi || "", kesimpulan: item.kesimpulan || "" });
  };

  const handleSubmitReview = async () => {
    try {
      // Send evaluation result in lowercase to match backend validation
      const payload = {
        ...reviewForm,
        hasil_evaluasi: (reviewForm.hasil_evaluasi || "").toLowerCase()
      };
      
      await apiClient.put(`/api/tindak-lanjut/${reviewItem.id}/review`, payload);
      
      if (selectedItem.jenis_audit === 'eksternal') {
        const hasil = reviewForm.hasil_evaluasi.toLowerCase();
        let statusAudit = "";

        if (hasil === "sesuai") {
          statusAudit = "Monev";
        }

        // Backend TindakLanjutController@review sudah menghandle update status temuan
        if (statusAudit && selectedItem.external_audit_id) {
          try {
            await apiClient.put(`/api/external-audit/${selectedItem.external_audit_id}`, { 
              status: statusAudit 
            });
          } catch (e) {
            console.error("Gagal update status audit", e);
          }
        }
      }

      notifySuccess("Review berhasil disimpan");
      setReviewItem(null);
      await refreshDetail();
      await fetchFollowUp();
    } catch (err) { 
      console.error(err);
      notifyError(err.response?.data?.message || "Gagal menyimpan review");
    }
  };


  const renderPreviewModal = () => {
    if (!previewFile) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPreviewFile(null)}></div>
        <div className="relative bg-white w-full max-w-6xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl ring-4 ring-blue-50">
                <BsFileEarmarkText size={24} />
              </div>
              <div>
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight line-clamp-1 max-w-[250px] md:max-w-md">{previewFile.judul_dokumen || 'Preview Dokumen'}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Tipe: Dokumen Pendukung | Fitur Preview</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href={`${import.meta.env.VITE_BACKEND_URL}/storage/${previewFile.file_path}`} 
                target="_blank" 
                rel="noreferrer" 
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-slate-900 active:scale-95 transition-all shadow-md shadow-slate-200 flex items-center gap-2"
              >
                Buka Di Tab Baru
              </a>
              <button onClick={() => setPreviewFile(null)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors border border-red-100 shadow-sm active:scale-95">
                  <BsX size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-slate-200/60 p-4 sm:p-6 overflow-hidden">
            <div className="bg-white w-full h-full rounded-2xl shadow-sm border border-slate-300 overflow-hidden relative">
              <iframe 
                src={`${import.meta.env.VITE_BACKEND_URL}/storage/${previewFile.file_path}`} 
                className="absolute inset-0 w-full h-full border-0" 
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isLocked = (selectedItem.status || "").toLowerCase() === "close" || (selectedItem.audit_status || "").toLowerCase() === "selesai";


  const getCategoryStyle = (cat) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("major")) return { bg: "#A32D2D", text: "#ffffff" };
    if (c.includes("minor")) return { bg: "#854F0B", text: "#ffffff" };
    if (c.includes("observasi")) return { bg: "#185FA5", text: "#ffffff" };
    if (c.includes("ofi")) return { bg: "#0F6E56", text: "#ffffff" };
    return { bg: "rgba(255,255,255,0.1)", text: "#ffffff" };
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 pt-2">
      <button onClick={() => setMode("list")} className="mb-4 flex items-center gap-2 px-5 py-2 bg-red-700 hover:bg-red-900 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95">
        <BsArrowLeft /> Kembali ke Monitoring
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        {/* Header Section */}
        <div className="p-6 bg-[#1f4b82] border-b border-blue-800">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 text-white">
            <div className="flex-1">
              <h1 className="text-xl font-bold leading-tight mb-2 tracking-tight">
                Detail Temuan Audit
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-blue-100/80 uppercase tracking-widest">
                <span>Audit {selectedItem.jenis_audit || 'Eksternal'}</span>
                <span className="w-1 h-1 rounded-full bg-blue-300/50"></span>
                <span>{selectedItem.unit || '-'}</span>
                <span className="w-1 h-1 rounded-full bg-blue-300/50"></span>
                <span>Dibuat {selectedItem.created_by_name || 'Auditor'}</span>
                <span className="w-1 h-1 rounded-full bg-blue-300/50"></span>
                <span>{formatDate(selectedItem.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* Category Badge */}
              {(() => {
                const cs = getCategoryStyle(selectedItem.kategori);
                return (
                  <span 
                    className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20 shadow-sm"
                    style={{ backgroundColor: cs.bg, color: cs.text }}
                  >
                    {selectedItem.kategori || 'Minor'}
                  </span>
                );
              })()}
              {/* Status Badge */}
              {(() => {
                const sc = getStatusConfig(selectedItem.status);
                return (
                  <span 
                    className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: sc.bg, color: sc.text }}
                  >
                    {sc.label}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {/* Row 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsClock size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Masalah</span>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedItem.masalah}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsEyeFill size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Kondisi</span>
            </div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">{selectedItem.kondisi}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsFileEarmarkText size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Kriteria</span>
            </div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">{selectedItem.kriteria}</p>
          </div>

          {/* Row 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsLink45Deg size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Sebab</span>
            </div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">{selectedItem.sebab}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsGraphUp size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Akibat / Dampak</span>
            </div>
            <p className="text-sm font-bold text-red-600 leading-relaxed italic">{selectedItem.akibat}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsLightbulb size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Rekomendasi</span>
            </div>
            <p className="text-sm font-bold text-blue-600 leading-relaxed">{selectedItem.rekomendasi}</p>
          </div>

          {/* Row 3 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsSearch size={11} />
              <span className="text-[9px] font-black uppercase tracking-widest">Analisa Penyebab</span>
            </div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">{selectedItem.analisa || 'Tidak ada'}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsWrench size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Rencana Tindakan Koreksi</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">{selectedItem.rencana_koreksi}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <BsPerson size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Rencana Tindakan Kolektif</span>
            </div>
            <p className="text-sm font-semibold text-slate-500 italic">{selectedItem.rencana_kolektif || 'Tidak ada'}</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <BsCalendar size={13} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target:</span>
            <span className="text-[11px] font-black text-slate-700">{formatDate(selectedItem.target_penyelesaian || selectedItem.target_selesai)}</span>
            {isOverdue(selectedItem.target_penyelesaian || selectedItem.target_selesai, selectedItem.status) && (
              <span className="inline-flex items-center gap-1 bg-red-100 border border-red-200 text-red-700 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider animate-pulse ml-2">
                ⚠️ Terlewat (IIA 2500)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <BsCashStack size={13} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nilai kerugian:</span>
            <span className="text-[11px] font-black text-slate-700">Rp {Number(selectedItem.nilai_kerugian || 0).toLocaleString('id-ID')}</span>
          </div>

          <div className="flex items-center gap-2">
            <BsPaperclip size={13} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lampiran:</span>
            {selectedItem.lampiran ? (
              <button
                onClick={() => setPreviewFile({
                  file_path: selectedItem.lampiran,
                  judul_dokumen: selectedItem.nama_lampiran || selectedItem.lampiran.split("/").pop()
                })}
                className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-black transition-all border border-blue-100"
              >
                <BsFileEarmarkText size={11} />
                <span className="truncate max-w-[120px]">{selectedItem.nama_lampiran || selectedItem.lampiran.split("/").pop()}</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-400 italic">-</span>
            )}
          </div>
        </div>
      </div>

      {/* --- RTL SECTION --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden mb-6 relative">
        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-50 bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 text-white rounded-xl">
              <BsFileEarmarkText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Rencana Tindak Lanjut (RTL)
              </h2>
              {!selectedItem.rtl_submitted_at ? (
                <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest mt-0.5 italic">Belum diisi — auditee perlu mengisi RTL sebelum bisa lapor progres</p>
              ) : (
                <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest mt-0.5">
                  Disubmit oleh {selectedItem.rtl_submitted_by_name || 'Auditee'} {selectedItem.rtl_submitted_by_role ? `(${selectedItem.rtl_submitted_by_role})` : ''} · {formatDate(selectedItem.rtl_submitted_at)}
                </p>
              )}
            </div>
          </div>
          {/* Tombol edit tetap di pojok kanan atas jika sudah disubmit */}
          {!isAuditor && selectedItem.rtl_submitted_at && ["draft", "draft temuan", "dalam perbaikan", "pengisian rtl", "pengisian tindak lanjut", "pengisian tindak lanjut temuan"].includes((selectedItem.status || "").toLowerCase()) && (
            <button 
              onClick={openRtlModal}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
            >
              <BsPencilSquare size={14} /> Edit RTL
            </button>
          )}
        </div>
        
        <div className="p-8">
          {!selectedItem.rtl_submitted_at ? (
            <div className="flex flex-col items-center justify-center py-4">
              {/* Center Content */}
              <div className="flex flex-col items-center text-center max-w-4xl w-full">

                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                  <BsFileEarmarkText size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Belum ada rencana tindak lanjut</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 italic">Isi RTL terlebih dahulu sebagai dasar pelaksanaan perbaikan temuan ini</p>
                
                {/* Panduan Auditor Box */}
                <div className="w-full bg-[#1e293b] border border-slate-700 rounded-2xl p-6 text-left mb-4 shadow-xl">
                  <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <BsChatLeftText size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Panduan auditor:</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                    {selectedItem.rekomendasi || "Tidak ada panduan spesifik dari auditor."}
                  </p>
                </div>

                {/* Action Button at Bottom Center */}
                {!isAuditor && ["draft", "draft temuan", "dalam perbaikan", "pengisian rtl", "pengisian tindak lanjut", "pengisian tindak lanjut temuan"].includes((selectedItem.status || "").toLowerCase()) && (
                  <button 
                    onClick={openRtlModal}
                    className="flex items-center gap-2 px-8 py-4 bg-[#2e343b] hover:bg-[#3d444d] border border-slate-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-2xl"
                  >
                    <BsPencilSquare size={16} /> Isi RTL Sekarang
                  </button>
                )}
              </div>
            </div>
          ) : (

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <BsChatLeftText size={12} />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Langkah Perbaikan</h4>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.rencana || selectedItem.rencana_koreksi || "-"}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <BsCalendar size={12} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Target Penyelesaian</h4>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{formatDate(selectedItem.target_penyelesaian)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <BsFlag size={12} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Prioritas</h4>
                  </div>
                  <span className={`px-3 py-1 border rounded-full text-[11px] font-bold ${
                    (selectedItem.prioritas||'').toLowerCase() === 'segera' ? 'bg-red-50 text-red-700 border-red-200' :
                    (selectedItem.prioritas||'').toLowerCase() === 'mendesak' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {selectedItem.prioritas || "-"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <BsCashStack size={12} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Estimasi Anggaran</h4>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedItem.estimasi_anggaran ? `Rp ${Number(selectedItem.estimasi_anggaran).toLocaleString('id-ID')}` : "-"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <BsPerson size={12} />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">PIC Pelaksana</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(Array.isArray(selectedItem.pic_rtls) ? selectedItem.pic_rtls : []).map((pic, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                      <BsPerson className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">{pic.nama} — {pic.jabatan || 'Pelaksana'}</span>
                    </div>
                  ))}
                  {(!selectedItem.pic_rtls || selectedItem.pic_rtls.length === 0) && (
                    <span className="text-sm font-bold text-slate-400 italic">Belum ada PIC</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <BsPeople size={12} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">SDM Yang Dibutuhkan</h4>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{selectedItem.sdm_dibutuhkan || "-"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <BsWrench size={12} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Sarana / Alat</h4>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{selectedItem.sarana_alat || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <BsExclamationTriangle size={12} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Potensi Kendala</h4>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{selectedItem.potensi_kendala || "-"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <BsChatLeftText size={12} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Catatan Untuk Auditor</h4>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{selectedItem.catatan_auditor || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* --- END RTL SECTION --- */}

      <div className="overflow-hidden transition-all">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/80 border-b border-slate-200 gap-4">
        <div>
            <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BsCardChecklist className="text-slate-700" /> Riwayat Progres Tindak Lanjut
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedItem.tindak_lanjut.length} Entri Progres</p>
          </div>
          
          <div className="flex gap-3">

            {/* Tambah Progres: Auditee saja, saat status Dalam Perbaikan */}
            {!isAuditor && ["draft", "draft temuan", "dalam perbaikan", "pengisian rtl", "pengisian tindak lanjut", "pengisian tindak lanjut temuan", "monev", "close"].includes((selectedItem.status || "").toLowerCase()) && (
              <div className="relative group">
                <button
                  onClick={() => !isLocked && setShowCreateModal(true)}
                  disabled={!selectedItem.rtl_submitted_at}
                  className={`flex items-center justify-center gap-2 px-5 h-[42px] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 ${
                    !selectedItem.rtl_submitted_at || isLocked
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                  }`}
                >
                  {isLocked ? <BsLock size={14} /> : <BsPlusLg size={14} />}
                  {isLocked ? "Progres Dikunci" : createForm.id ? "Edit Progres" : "Tambah Progres"}
                </button>
                {!selectedItem.rtl_submitted_at && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Isi RTL terlebih dahulu
                  </div>
                )}
              </div>
            )}

            {/* Info Status: Close (Tampil untuk semua role) */}
            {(selectedItem.status || "").toLowerCase() === "close" && (
              <div className="flex items-center gap-2.5 px-5 h-[42px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-xl shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-1 bg-emerald-100 rounded-lg">
                  <BsCheckCircleFill size={14} className="text-emerald-600" />
                </div>
                <span>Temuan ini sudah ditutup permanen</span>
              </div>
            )}

          </div>
        </div>

        <div className="py-6 space-y-4">
          {selectedItem.tindak_lanjut.length > 0 ? selectedItem.tindak_lanjut.map((tl, index) => (
            <div key={tl.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md group">
              {/* Card Header */}
              <div className="p-4 flex flex-wrap justify-between items-start gap-4 border-b border-slate-200/60 bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{getMonthLabel(tl.bulan)} {tl.tahun}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <BsCalendar className="text-slate-400" size={10} />
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Diisi: oleh {tl.created_by_name || 'Auditee'} - {formatDate(tl.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    tl.hasil_evaluasi?.toLowerCase() === 'sesuai' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : tl.hasil_evaluasi?.toLowerCase() === 'belum sesuai'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {tl.hasil_evaluasi || "Belum Direview"}
                  </span>
                  
                    <div className="flex gap-2">
                    {/* Tombol Review: Auditor saja, jika temuan masih dalam proses perbaikan/monev */}
                    {isAuditor && !tl.hasil_evaluasi && !isLocked && (
                      <button 
                        onClick={() => openReviewModal(tl)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md font-black text-[9px] uppercase tracking-widest transition-all"
                      >
                        <BsEyeFill size={12} /> Review
                      </button>
                    )}
                    {/* Edit: hanya auditee dan jika belum diverifikasi */}
                    {!isAuditor && !tl.hasil_evaluasi && !isLocked && (
                      <button 
                        onClick={() => openEditModal(tl)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-md text-slate-400 transition-all shadow-sm"
                      >
                        <BsPencilSquare size={12} />
                      </button>
                    )}
                    {/* Hapus: hanya auditee dan jika belum diverifikasi */}
                    {!isAuditor && !tl.hasil_evaluasi && !isLocked && (
                      <button 
                        onClick={() => handleDeleteTL(tl.id)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-500 rounded-md text-slate-400 transition-all shadow-sm"
                      >
                        <BsTrash size={12} />
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Kolom 1: Uraian */}
                  <div>
                    <label className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      <BsFileEarmarkText size={10} /> Uraian Tindakan
                    </label>
                    <p className="text-[11px] font-bold leading-relaxed text-slate-600">
                      {tl.keterangan || "Tidak ada keterangan."}
                    </p>
                  </div>

                  {/* Kolom 2: Persentase */}
                  <div>
                    <label className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      <BsGraphUp size={10} /> Persentase Realisasi
                    </label>
                    <div className="flex items-end gap-2 mb-1.5">
                      <span className="text-base font-black text-slate-800">{tl.persentase || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{ width: `${tl.persentase || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Kolom 3: Estimasi Selesai */}
                  <div>
                    <label className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      <BsClock size={10} /> Estimasi Selesai
                    </label>
                    <p className="text-[11px] font-black text-slate-600">
                      {tl.estimasi_selesai || "-"}
                    </p>
                  </div>
                </div>

                {/* Row 2: Bukti & Catatan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-200/60">
                  <div>
                    <label className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      <BsLink45Deg size={10} /> Bukti Dukung
                    </label>
                    {tl.bukti ? (
                      <button
                        onClick={() => setPreviewFile({
                          file_path: tl.bukti,
                          judul_dokumen: tl.bukti.split("/").pop()
                        })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all group shadow-sm"
                      >
                        <div className="p-1 bg-blue-50 text-blue-600 rounded">
                          <BsFileEarmarkPdf size={12} />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 truncate max-w-[120px]">{tl.bukti_name || tl.bukti.split("/").pop()}</span>
                      </button>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Tidak ada lampiran</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      <BsChatLeftText size={10} /> Kendala / Catatan
                    </label>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                      {tl.kendala || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      <BsPerson size={10} /> PIC Pelaksana
                    </label>
                    <p className="text-[11px] font-black text-slate-600">
                      {tl.pic_pelaksana || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Auditor Review */}
              <div className="bg-slate-50/50 px-4 py-3 flex flex-wrap justify-between items-center gap-4 text-[10px] font-bold border-t border-slate-200">
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 uppercase tracking-widest text-[8px]">Kesimpulan Auditor:</span>
                    <span className="text-slate-500 italic font-normal">{tl.kesimpulan || "-"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-slate-400 uppercase tracking-widest">Direview oleh:</span>
                  {tl.reviewed_at ? (
                    <span className="text-slate-600 font-bold">{tl.reviewer_name} · {formatDate(tl.reviewed_at)}</span>
                  ) : (
                    <span className="text-red-600 uppercase tracking-widest font-black">Belum direview</span>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl shadow-inner border-dashed">
              <div className="flex flex-col items-center gap-3">
                <BsFileEarmarkText size={40} className="text-slate-200" />
                <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Belum ada riwayat progres.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH PROGRES */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/60 p-4 pt-24 pb-10 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-blue-100 flex flex-col h-full max-h-[90vh]">
            
            <div className="bg-[#1f4b82] px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <BsPlusLg size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{createForm.id ? "Edit Progres" : "Tambah Progres Baru"}</h3>
                  <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-0.5">Lengkapi detail realisasi perbaikan temuan</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <BsX size={28} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-slate-50/50">
              
              {/* Section 1: Periode & Pelaksana */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                  <BsCalendar className="text-blue-500" /> 1. Periode & Pelaksana <span className="text-red-500">*</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bulan Progres</label>
                    <select 
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer" 
                      value={createForm.bulan} 
                      onChange={(e) => setCreateForm({ ...createForm, bulan: e.target.value })}
                    >
                      <option value="">Pilih Bulan...</option>
                      {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tahun</label>
                    <input 
                      type="number" 
                      placeholder="Tahun"
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                      value={createForm.tahun} 
                      onChange={(e) => setCreateForm({ ...createForm, tahun: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimasi Selesai Keseluruhan</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Des 2025" 
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                      value={createForm.estimasi_selesai} 
                      onChange={(e) => setCreateForm({ ...createForm, estimasi_selesai: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PIC Pelaksana Laporan Ini</label>
                  <input 
                    type="text" 
                    placeholder="Nama & Jabatan PIC..." 
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                    value={createForm.pic_pelaksana} 
                    onChange={(e) => setCreateForm({ ...createForm, pic_pelaksana: e.target.value })} 
                  />
                </div>
              </div>

              {/* Section 2: Uraian Tindakan */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                  <BsFileEarmarkText className="text-blue-500" /> 2. Uraian Tindakan Dilakukan <span className="text-red-500">*</span>
                </h4>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Langkah konkret yang sudah selesai dijalankan</label>
                  <textarea 
                    placeholder="Uraikan tindakan yang sudah dilakukan pada periode ini..." 
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all min-h-[120px]" 
                    value={createForm.keterangan} 
                    onChange={(e) => setCreateForm({ ...createForm, keterangan: e.target.value })} 
                  />
                </div>
              </div>

              {/* Section 3: Progres & Kendala */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                    <BsGraphUp className="text-blue-500" /> 3. Persentase Realisasi <span className="text-red-500">*</span>
                  </h4>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Progres</span>
                      <span className="text-2xl font-black text-blue-600">{createForm.persentase}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={createForm.persentase} 
                      onChange={(e) => setCreateForm({ ...createForm, persentase: e.target.value })} 
                    />
                    <p className="text-[10px] text-slate-400 font-bold italic">Geser untuk menentukan tingkat penyelesaian</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                    <BsChatLeftText className="text-amber-500" /> 4. Kendala (Opsional)
                  </h4>
                  <textarea 
                    placeholder="Hambatan yang ditemui..." 
                    className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none transition-all h-[115px] resize-none" 
                    value={createForm.kendala} 
                    onChange={(e) => setCreateForm({ ...createForm, kendala: e.target.value })} 
                  />
                </div>
              </div>

              {/* Section 4: Bukti Dukung */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                  <BsLink45Deg className="text-blue-500" size={18} /> 5. Bukti Dukung
                </h4>

                <div className="relative group">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-white group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                      <BsFileEarmarkArrowDown size={32} />
                    </div>
                    <input 
                      type="file" 
                      onChange={(e) => setCreateForm({ ...createForm, bukti: e.target.files?.[0] || null })} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-700">Klik atau seret file bukti ke sini</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">PDF, JPG, PNG (Maks. 10MB)</p>
                    </div>
                  </div>
                </div>

                {createForm.bukti && (
                  <div className="flex items-center justify-between p-4 bg-slate-800 text-white rounded-2xl shadow-xl animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <BsFileEarmarkPdf size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black truncate max-w-[250px] md:max-w-md">{createForm.bukti.name || "File Terpilih"}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Siap diunggah</p>
                      </div>
                    </div>
                    <button onClick={() => setCreateForm({ ...createForm, bukti: null })} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
                      <BsX size={24} />
                    </button>
                  </div>
                )}
              </div>

              {/* Section 5: Catatan Tambahan */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                  <BsChatLeftText className="text-blue-500" /> 6. Catatan Tambahan <span className="text-[10px] text-slate-400 font-bold lowercase tracking-normal ml-2">(Opsional)</span>
                </h4>
                <textarea 
                  placeholder="Informasi tambahan untuk auditor..." 
                  className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none transition-all min-h-[80px]" 
                  value={createForm.catatan_tambahan} 
                  onChange={(e) => setCreateForm({ ...createForm, catatan_tambahan: e.target.value })} 
                />
              </div>
            </div>

            <div className="px-6 py-5 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="px-6 py-3 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveTL} 
                className="px-10 py-3 bg-[#1f4b82] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-900 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <BsCheckCircleFill size={16} /> Simpan Progres
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL REVIEW / EVALUASI (AUDITOR) */}
      {reviewItem && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center bg-slate-900/60 p-4 pt-24 pb-10 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-blue-100 flex flex-col h-full max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#1f4b82] px-6 py-5 text-white flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Review Progres Tindak Lanjut</h3>
                <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">
                  Periode: {getMonthLabel(reviewItem.bulan)} {reviewItem.tahun} · Disubmit oleh {reviewItem.created_by_name || 'Auditee'} — {formatDate(reviewItem.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setReviewItem(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <BsX size={28} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Hasil Penilaian Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <BsCheckCircleFill className="text-slate-400" size={14} />
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Hasil penilaian auditor</span>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                    <BsStar className="text-amber-500" /> Penilaian Tindak Lanjut <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Option Cards */}
                  <div className="grid grid-cols-1 gap-3">
                    {EVALUATION_OPTIONS.map((opt) => (
                      <label 
                        key={opt.value} 
                        className={`relative flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                          reviewForm.hasil_evaluasi === opt.value 
                            ? 'border-blue-500 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10' 
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="evaluation_result" 
                          className="hidden" 
                          value={opt.value}
                          checked={reviewForm.hasil_evaluasi === opt.value}
                          onChange={(e) => setReviewForm({ ...reviewForm, hasil_evaluasi: e.target.value })}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          reviewForm.hasil_evaluasi === opt.value ? 'border-blue-500' : 'border-slate-300'
                        }`}>
                          {reviewForm.hasil_evaluasi === opt.value && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              opt.value === 'Belum Sesuai' ? 'bg-red-100 text-red-600' :
                              opt.value === 'Dalam Proses' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {opt.label}
                            </div>
                            <span className="text-sm font-black text-slate-800">
                              {opt.title}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-500 leading-snug">
                            {opt.value === 'Belum Sesuai' ? (
                              <>Auditee belum melakukan tindakan nyata, atau tindakan yang dilakukan tidak relevan dengan temuan <br/> <span className="text-red-500/80">→ Status kembali ke Pengisian TL · auditee wajib revisi dan submit ulang</span></>
                            ) : opt.value === 'Dalam Proses' ? (
                              <>Ada progres nyata, arah sudah benar, tapi pelaksanaan masih berjalan. Perlu dipantau di periode berikutnya <br/> <span className="text-amber-600/80">→ Status tetap Monev · auditee tambah progres lagi bulan depan</span></>
                            ) : (
                              <>Auditee sudah menyelesaikan semua langkah perbaikan, bukti lengkap, dan auditor verifikasi kebenarannya <br/> <span className="text-emerald-600/80">→ Status temuan otomatis Close · temuan dikunci</span></>
                            )}
                          </p>
                        </div>
                        {reviewForm.hasil_evaluasi === opt.value && opt.value === 'Sesuai' && (
                          <BsCheckCircleFill className="text-emerald-500 absolute top-4 right-4" size={18} />
                        )}
                      </label>
                    ))}
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <BsChatLeftText size={12} /> Catatan Auditor <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    placeholder="Uraikan alasan penilaian dan hal yang perlu diperbaiki jika ada..." 
                    className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all h-[120px]" 
                    value={reviewForm.kesimpulan} 
                    onChange={(e) => setReviewForm({ ...reviewForm, kesimpulan: e.target.value })} 
                  />
                  <p className="text-[9px] text-slate-400 font-bold italic">Wajib diisi — menjadi dasar auditee memahami hasil review</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <BsCalendar size={12} /> Tanggal Review
                    </label>
                    <input 
                      type="text" 
                      readOnly
                      value={new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-600 outline-none cursor-not-allowed" 
                    />
                    <p className="text-[9px] text-slate-400 font-bold italic">Otomatis terisi hari ini</p>
                  </div>

                  {reviewForm.hasil_evaluasi === 'Sesuai' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-in slide-in-from-right-4">
                      <p className="text-[10px] font-bold text-emerald-800 leading-relaxed">
                        Jika penilaian <span className="underline">Sesuai</span> — status temuan otomatis berubah menjadi <span className="font-black text-emerald-600 uppercase">Close</span> dan temuan dikunci. Pastikan bukti dukung sudah cukup sebelum memilih Sesuai.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setReviewItem(null)} 
                className="px-6 py-3 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white rounded-xl transition-all border border-slate-200 active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmitReview} 
                className="px-10 py-3 bg-[#1f4b82] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-900 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <BsCheckCircleFill size={16} /> Simpan Hasil Review
              </button>
            </div>
          </div>
        </div>
      )}


      {showRtlModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/60 p-4 pt-24 pb-10 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-blue-100 flex flex-col h-full max-h-[90vh]">
            
            <div className="bg-[#1f4b82] px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <BsCardChecklist size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Rencana Tindak Lanjut (RTL)</h3>
                  <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-0.5">Diisi sekali oleh auditee setelah konfirmasi temuan</p>
                </div>
              </div>
              <button onClick={() => setShowRtlModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <BsX size={28} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-slate-50/50">
              
              {/* Petunjuk Auditor */}
              <div className="bg-slate-800 text-white rounded-2xl p-5 shadow-sm">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">
                  <BsFileEarmarkText size={12} /> Panduan dari auditor
                </h4>
                <p className="text-sm font-semibold leading-relaxed text-slate-200">
                  {selectedItem.rekomendasi}
                </p>
              </div>

              {/* Section 1: Rencana Perbaikan */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                  <BsFileEarmarkText className="text-blue-500" /> 1. Rencana Perbaikan <span className="text-red-500">*</span>
                </h4>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Langkah perbaikan yang akan dilakukan</label>
                  <textarea 
                    placeholder="Uraikan secara konkret langkah-langkah yang akan dilakukan untuk menyelesaikan temuan ini..." 
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all min-h-[120px]"
                    value={rtlForm.langkah_perbaikan}
                    onChange={(e) => setRtlForm({...rtlForm, langkah_perbaikan: e.target.value})}
                  />
                  <p className="text-[10px] font-bold text-slate-400 italic">Jelaskan langkah nyata — bukan rencana abstrak. Semakin spesifik, semakin mudah dipantau.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Penyelesaian RTL <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer"
                      value={rtlForm.target_penyelesaian}
                      onChange={(e) => setRtlForm({...rtlForm, target_penyelesaian: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prioritas Penanganan <span className="text-red-500">*</span></label>
                    <select 
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer"
                      value={rtlForm.prioritas}
                      onChange={(e) => setRtlForm({...rtlForm, prioritas: e.target.value})}
                    >
                      <option value="">Pilih prioritas...</option>
                      <option value="Segera">Segera (≤ 7 hari)</option>
                      <option value="Mendesak">Mendesak (≤ 30 hari)</option>
                      <option value="Normal">Normal (≤ 90 hari)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Penanggung Jawab */}
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800">
                    <BsPerson className="text-blue-500" /> 2. Penanggung Jawab Pelaksana <span className="text-red-500">*</span>
                  </h4>
                  <button 
                    onClick={handleAddPic}
                    className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
                  >
                    <BsPlusLg /> Tambah PIC
                  </button>
                </div>

                <div className="space-y-3">
                  {rtlForm.pic_rtls.map((pic, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-black shrink-0">
                        {idx + 1}
                      </div>
                      <input 
                        type="text" placeholder="Nama Lengkap..."
                        className="flex-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 outline-none"
                        list="user-list"
                        value={pic.nama} onChange={(e) => handlePicChange(idx, 'nama', e.target.value)}
                      />
                      <input 
                        type="text" placeholder="Jabatan / Divisi..."
                        className="flex-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 outline-none"
                        list="jabatan-list"
                        value={pic.jabatan} onChange={(e) => handlePicChange(idx, 'jabatan', e.target.value)}
                      />
                      <input 
                        type="text" placeholder="Kontak (No HP / Email)..."
                        className="flex-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-blue-500 outline-none"
                        value={pic.kontak} onChange={(e) => handlePicChange(idx, 'kontak', e.target.value)}
                      />
                      {rtlForm.pic_rtls.length > 1 && (
                        <button 
                          onClick={() => handleRemovePic(idx)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors absolute right-2 top-2 md:static md:mt-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Hapus PIC"
                        >
                          <BsTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Sumber Daya */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                  <BsBoxArrowInRight className="text-blue-500" /> 3. Sumber Daya <span className="text-[10px] text-slate-400 font-bold lowercase tracking-normal ml-2">(Opsional)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimasi Anggaran</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
                      <input 
                        type="text" placeholder="0"
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 pl-9 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                        value={formatRupiah(rtlForm.estimasi_anggaran)}
                        onChange={handleBudgetChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SDM yang Dibutuhkan</label>
                    <input 
                      type="text" placeholder="Contoh: 2 orang IT..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none"
                      value={rtlForm.sdm_dibutuhkan}
                      onChange={(e) => setRtlForm({...rtlForm, sdm_dibutuhkan: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sarana / Alat</label>
                    <input 
                      type="text" placeholder="Contoh: Lisensi software..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none"
                      value={rtlForm.sarana_alat}
                      onChange={(e) => setRtlForm({...rtlForm, sarana_alat: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Risiko & Catatan */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
                  <BsChatLeftText className="text-blue-500" /> 4. Risiko & Informasi Tambahan <span className="text-[10px] text-slate-400 font-bold lowercase tracking-normal ml-2">(Opsional)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Potensi Kendala / Risiko</label>
                    <textarea 
                      placeholder="Uraikan hambatan yang mungkin terjadi selama pelaksanaan..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none min-h-[100px]"
                      value={rtlForm.potensi_kendala}
                      onChange={(e) => setRtlForm({...rtlForm, potensi_kendala: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Catatan untuk Auditor</label>
                    <textarea 
                      placeholder="Informasi lain yang perlu diketahui auditor..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-700 focus:border-blue-500 outline-none min-h-[100px]"
                      value={rtlForm.catatan_auditor}
                      onChange={(e) => setRtlForm({...rtlForm, catatan_auditor: e.target.value})}
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="px-6 py-5 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowRtlModal(false)}
                className="px-6 py-3 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
                disabled={isSubmittingRtl}
              >
                Batal
              </button>
              <button 
                onClick={handleSaveRtl}
                disabled={isSubmittingRtl}
                className="px-8 py-3 bg-[#1f4b82] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-900 transition-all active:scale-95 flex items-center gap-2"
              >
                {isSubmittingRtl ? (
                  <><BsArrowRepeat className="animate-spin" size={16} /> Menyimpan...</>
                ) : (
                  <><BsCheckCircleFill size={16} /> Submit RTL</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {renderPreviewModal()}

      <datalist id="user-list">
        {users.map((u) => <option key={u.id} value={u.name} />)}
      </datalist>
      <datalist id="jabatan-list">
        {jabatans.map((j) => <option key={j.id} value={j.nama} />)}
      </datalist>
    </div>
  );
};

export default DetailTindakLanjut;
