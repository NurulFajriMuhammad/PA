import React, { useEffect, useState } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { 
  BsFileEarmarkText, 
  BsPaperclip, 
  BsCloudUpload, 
  BsX, 
  BsSearch, 
  BsSend, 
  BsPencilSquare,
  BsCheckCircle,
  BsXCircle
} from "react-icons/bs";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../../Shared/utils/notifier.jsx";
import { useAuth } from "../../../../../Shared/hooks/useAuth.jsx";

const AnalisisTab = ({ assurance, onRefresh }) => {
  const [data, setData] = useState([]);
  const [selectedTemuan, setSelectedTemuan] = useState(null);
  const [lampiranFile, setLampiranFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [statusTemuanList, setStatusTemuanList] = useState([]);
  const [form, setForm] = useState({});

  // Fetch daftar status temuan dari database
  useEffect(() => {
    apiClient.get('/api/status-temuan').then(res => {
      setStatusTemuanList(res.data || []);
    }).catch(() => {});
  }, []);

  const fetchAnalisis = async () => {
    try {
      const res = await apiClient.get(
        `/api/assurance/${assurance.id}/kka-pelaksanaan`,
      );

      let allTemuan = [];

      res.data.data.forEach((kka) => {
        (kka.temuan || []).forEach((t) => {
          let status = "belum"; // default = belum diisi = Draft Temuan

          // Prioritas 1: Jika sudah ada di tabel tindak_lanjut, statusnya minimal Monev
          if (t.tindak_lanjut) {
            status = t.tindak_lanjut.status === 'close' ? 'close' : 'monev';
          } 
          // Prioritas 2: Jika belum di tindak_lanjut, cek status di tabel analisis_temuan
          else if (t.analisis) {
            const s = (t.analisis.status || '').toLowerCase();
            if (s === 'close')         status = 'close';
            else if (s === 'monev')    status = 'monev';
            else if (s === 'ditolak' || s === 'ditolak_auditee') status = 'ditolak';
            else                       status = 'draft';
          }

          allTemuan.push({
            ...t,
            analisis: t.analisis || null,
            status_analisis: status,
            no_kka: kka.no_kka,
            uraian_kka: kka.uraian,
          });
        });
      });

      setData(allTemuan);
    } catch (err) {
      console.error(err);
    }
  };

  const [lhaData, setLhaData] = useState({
    lha_status: "draft",
    lha_submitted_by: null,
    lha_submitted_at: null,
    lha_approved_by: null,
    lha_approved_at: null,
    lha_catatan: null,
  });

  const { user: authData } = useAuth();
  const userRole = authData?.user?.roles?.[0]?.name || "";
  const isKepalaSPI = userRole.toLowerCase() === "kepala spi";
  const isAuditor = userRole.toLowerCase() === "auditor" || userRole.toLowerCase() === "administrator audit" || userRole.toLowerCase() === "pengendali teknis";

  const fetchLhaStatus = async () => {
    try {
      const res = await apiClient.get(`/api/assurance/${assurance?.id}/lha-status`);
      if (res.data.success) {
        setLhaData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (assurance?.id) {
      fetchAnalisis();
      fetchLhaStatus();
    }
  }, [assurance]);

  const handleSelectTemuan = (item) => {
    const dataAnalisis = item.analisis || {};

    setSelectedTemuan(item);
    setForm({
      tanggapan: dataAnalisis.tanggapan || "setuju", // Default setuju
      status: dataAnalisis.status || "draft",
      analisa: dataAnalisis.analisa || "", // Analisa auditee
      analisa_auditor: dataAnalisis.analisa_auditor || "",
      aspek_penolakan: dataAnalisis.aspek_penolakan || "",
      fakta_pembanding: dataAnalisis.fakta_pembanding || "",
      rencana_koreksi: dataAnalisis.rencana_koreksi || "",
      rencana_kolektif: dataAnalisis.rencana_kolektif || "",
      target_penyelesaian: dataAnalisis.target_penyelesaian || "",
      feedback: dataAnalisis.feedback || "", // Alasan penolakan
      nilai_kerugian: item.nilai_kerugian || "", // Potensi nilai kerugian
      lampiran: null,
    });
    setLampiranFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        notifyError("Ukuran file maksimal adalah 10MB!");
        return;
      }
      setLampiranFile(file);
      setForm({
        ...form,
        lampiran: file,
      });
    }
  };

  const handleRemoveFile = () => {
    setLampiranFile(null);
    setForm({
      ...form,
      lampiran: null,
    });
  };

  const handleSave = async (isTolak = false) => {
    try {
      // Validasi input wajib
      if (isTolak) {
        if (!form.feedback) {
          notifyError("Alasan penolakan wajib diisi!");
          return;
        }
        if (!form.aspek_penolakan) {
          notifyError("Aspek yang dipermasalahkan wajib diisi!");
          return;
        }
      } else {
        if (!form.analisa_auditor) {
          notifyError("Analisa penyebab auditor wajib diisi!");
          return;
        }
        if (!form.rencana_koreksi) {
          notifyError("Rencana tindakan koreksi wajib diisi!");
          return;
        }
        if (!form.target_penyelesaian) {
          notifyError("Target selesai perbaikan wajib diisi!");
          return;
        }
      }

      const formData = new FormData();
      formData.append("tanggapan", isTolak ? "tolak" : "setuju");
      formData.append("status", isTolak ? "ditolak" : "monev");

      if (isTolak) {
        formData.append("feedback", form.feedback || "");
        formData.append("aspek_penolakan", form.aspek_penolakan || "");
        formData.append("fakta_pembanding", form.fakta_pembanding || "");
        if (lampiranFile) {
          formData.append("lampiran", lampiranFile);
        }
      } else {
        formData.append("analisa_auditor", form.analisa_auditor || "");
        formData.append("analisa", form.analisa || ""); // Analisa auditee
        formData.append("rencana_koreksi", form.rencana_koreksi || "");
        formData.append("rencana_kolektif", form.rencana_kolektif || "");
        formData.append("target_penyelesaian", form.target_penyelesaian || "");
        if (form.nilai_kerugian !== undefined && form.nilai_kerugian !== null) {
          formData.append("nilai_kerugian", form.nilai_kerugian);
        }
      }

      await apiClient.post(
        `/api/temuan/${selectedTemuan.id}/analisis`,
        formData,
      );

      notifySuccess(isTolak ? "Penolakan berhasil dikirim ke auditor!" : "Analisis berhasil disimpan!");
      setSelectedTemuan(null);
      await fetchAnalisis();
    } catch (err) {
      console.error(err);
      notifyError("Gagal menyimpan data analisis.");
    }
  };

  const handleKirimTindakLanjut = () => {
    try {
      const readyTemuan = data.filter(
        (item) => item.status_analisis === "monev"
      );

      if (readyTemuan.length === 0) {
        notifyError("Tidak ada temuan dengan status Monev yang siap dikirim.");
        return;
      }

      notifyConfirm(`Kirim ${readyTemuan.length} temuan (Monev) ke panel Tindak Lanjut?`, async () => {
        try {
          await apiClient.post("/api/tindak-lanjut/generate", {
            temuan_ids: readyTemuan.map((t) => t.id),
          });

          notifySuccess("Berhasil dikirim ke Tindak Lanjut 🚀");
          fetchAnalisis();
        } catch (err) {
          console.error(err);
          notifyError("Gagal mengirim tindak lanjut.");
        }
      });
    } catch (err) {
      console.error(err);
      notifyError("Terjadi kesalahan.");
    }
  };

  const handlePrintLha = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Hasil Audit (LHA) - ${assurance?.no_pengajuan || ""}</title>
          <style>
            body { font-family: 'Arial', sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px double #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; color: #0f172a; }
            .header p { margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #64748b; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .meta-table td { padding: 8px 12px; font-size: 13px; vertical-align: top; }
            .meta-table td.label { font-weight: bold; width: 180px; color: #475569; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; color: #1e3a8a; }
            .finding-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 20px; page-break-inside: avoid; }
            .finding-header { display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px; }
            .finding-title { font-size: 14px; color: #0f172a; }
            .finding-meta { font-size: 11px; color: #64748b; text-transform: uppercase; }
            .grid-5c { display: flex; flex-direction: column; gap: 12px; }
            .c-item { font-size: 12px; }
            .c-label { font-weight: bold; color: #475569; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; tracking-wide; }
            .c-value { color: #334155; }
            .sign-section { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sign-box { text-align: center; width: 220px; font-size: 12px; }
            .sign-line { margin-top: 70px; border-top: 1px solid #1e293b; padding-top: 5px; font-weight: bold; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #1e3a8a; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Cetak LHA</button>
          </div>
          <div class="header">
            <h1>Laporan Hasil Audit (LHA)</h1>
            <p>SPI (Satuan Pengawas Intern)</p>
          </div>
          
          <table class="meta-table">
            <tr>
              <td class="label">Nomor Pengajuan</td>
              <td>: ${assurance?.no_pengajuan || "-"}</td>
            </tr>
            <tr>
              <td class="label">Judul Audit</td>
              <td>: ${assurance?.judul || "-"}</td>
            </tr>
            <tr>
              <td class="label">Periode Audit</td>
              <td>: ${assurance?.tgl_mulai ? new Date(assurance.tgl_mulai).toLocaleDateString("id-ID") : "-"} s/d ${assurance?.tgl_selesai ? new Date(assurance.tgl_selesai).toLocaleDateString("id-ID") : "-"}</td>
            </tr>
            <tr>
              <td class="label">Status LHA</td>
              <td>: DISETUJUI oleh Kepala SPI</td>
            </tr>
          </table>

          <div class="section-title">Daftar Temuan & Analisis Penyebab (5C)</div>
          ${data.map((item, index) => `
            <div class="finding-card">
              <div class="finding-header">
                <div class="finding-title">Temuan #${index + 1}: ${item.masalah}</div>
                <div class="finding-meta">Kategori: ${item.kategori || "Minor"} | Hal: ${item.halaman_lhe || "-"}</div>
              </div>
              <div class="grid-5c">
                <div class="c-item">
                  <span class="c-label">1. Kondisi (Fakta di lapangan):</span>
                  <div class="c-value">${item.kondisi || "-"}</div>
                </div>
                <div class="c-item">
                  <span class="c-label">2. Kriteria (Aturan/Standar):</span>
                  <div class="c-value">${item.kriteria || "-"}</div>
                </div>
                <div class="c-item">
                  <span class="c-label">3. Sebab (Pemicu deviasi):</span>
                  <div class="c-value">${item.sebab || "-"}</div>
                </div>
                <div class="c-item">
                  <span class="c-label">4. Akibat (Dampak/Kerugian):</span>
                  <div class="c-value">${item.akibat || "-"}</div>
                </div>
                <div class="c-item">
                  <span class="c-label">5. Rekomendasi Auditor:</span>
                  <div class="c-value">${item.rekomendasi || "-"}</div>
                </div>
                <div class="c-item" style="border-top: 1px dashed #e2e8f0; padding-top: 10px; margin-top: 5px;">
                  <span class="c-label">Analisis Penyebab (Auditor):</span>
                  <div class="c-value">${item.analisis_auditor || item.analisa_auditor || "-"}</div>
                </div>
                <div class="c-item">
                  <span class="c-label">Rencana Tindakan Koreksi (Auditee):</span>
                  <div class="c-value">${item.rencana_koreksi || "-"}</div>
                </div>
              </div>
            </div>
          `).join("")}

          <div class="sign-section">
            <div class="sign-box">
              <p>Diajukan oleh,</p>
              <div class="sign-line">Tim Auditor / PT</div>
              <p>${lhaData.lha_submitted_by || ""}</p>
            </div>
            <div class="sign-box">
              <p>Disetujui oleh,</p>
              <div class="sign-line">Kepala SPI</div>
              <p>${lhaData.lha_approved_by || ""}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper formats
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatRupiah = (val) => {
    if (val === undefined || val === null || val === "") return "Rp 0";
    const clean = val.toString().replace(/\D/g, "");
    if (!clean) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(clean).replace("Rp", "Rp ").trim();
  };

  const getKategoriBadge = (kategori) => {
    const lower = (kategori || "").toLowerCase();
    if (lower === "major") {
      return <span className="px-2.5 py-0.5 bg-red-50 text-red-650 border border-red-200 rounded font-black uppercase text-[9px] tracking-wider">Major</span>;
    } else if (lower === "minor") {
      return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-black uppercase text-[9px] tracking-wider">Minor</span>;
    } else if (lower === "observasi") {
      return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded font-black uppercase text-[9px] tracking-wider">Observasi</span>;
    } else if (lower === "ofi") {
      return <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded font-black uppercase text-[9px] tracking-wider">OFI</span>;
    }
    return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-400 rounded font-black uppercase text-[9px] tracking-wider">—</span>;
  };

  const getStatusBadgeConfig = (status) => {
    switch (status) {
      case 'close':
        return { bgColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Close' };
      case 'monev':
        return { bgColor: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Monev ✓' };
      case 'ditolak':
        return { bgColor: 'bg-red-50 text-red-700 border border-red-200', label: 'Ditolak Auditee' };
      default:
        return { bgColor: 'bg-slate-50 text-slate-500 border border-slate-200', label: 'Draft — belum dianalisis' };
    }
  };

  // Logika pengecekan status submits
  const draftCount = data.filter(t => t.status_analisis === 'belum' || t.status_analisis === 'draft' || t.status_analisis === 'ditolak').length;
  const isReadyToSubmit = data.length > 0 && draftCount === 0 && lhaData.lha_status === "approved";

  // ============================
  // 🎥 RENDER PREVIEW MODAL (DOKUMEN)
  // ============================
  const renderPreviewModal = () => {
    if (!previewFile) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewFile(null)}></div>
        <div className="relative bg-white border border-slate-200 w-full max-w-6xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl">
                <BsFileEarmarkText size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{previewFile.judul_dokumen || 'Preview Dokumen'}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tipe: Lampiran Penolakan | Fitur Preview</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href={`${import.meta.env.VITE_BACKEND_URL}/storage/${previewFile.file_path}`} 
                target="_blank" 
                rel="noreferrer" 
                className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                Buka Di Tab Baru
              </a>
              <button onClick={() => setPreviewFile(null)} className="p-2.5 bg-red-50 text-red-650 hover:bg-red-600 hover:text-white rounded-xl transition-colors border border-red-200 shadow-sm active:scale-95">
                <BsX size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-hidden">
            <div className="bg-white w-full h-full rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
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

  // ============================
  // 🔵 RENDER MODAL ISI / EDIT ANALISIS
  // ============================
  const renderModal = () => {
    if (!selectedTemuan) return null;

    const isTolak = form.tanggapan === "tolak";
    const statusConfig = getStatusBadgeConfig(selectedTemuan.status_analisis);

    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="relative bg-white border border-slate-200 text-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 flex flex-col animate-in zoom-in-95 duration-200 space-y-6">
          
          {/* MODAL HEADER */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div className="space-y-1.5 flex-1 pr-6">
              <div className="flex items-center gap-2">
                  <BsSearch size={18} />
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Isi Analisis Penyebab</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Temuan: <span className="text-slate-850 font-bold">{selectedTemuan.masalah}</span> · KKA {selectedTemuan.no_kka} · {selectedTemuan.kategori || "-"}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${statusConfig.bgColor} shrink-0`}>
              {statusConfig.label}
            </span>
          </div>

          {/* BOX 1: RINGKASAN TEMUAN (READ-ONLY) */}
          <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-2xl space-y-3 shadow-inner">
            <div className="text-[10px] font-black text-blue-650 uppercase tracking-widest">
              Ringkasan Temuan (Read-Only)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Kondisi</span>
                <p className="text-xs font-semibold text-slate-655">{selectedTemuan.kondisi || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Kriteria</span>
                <p className="text-xs font-semibold text-slate-655">{selectedTemuan.kriteria || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Rekomendasi</span>
                <p className="text-xs font-semibold text-slate-655">{selectedTemuan.rekomendasi || "-"}</p>
              </div>
            </div>
          </div>

          {/* BOX 2: KEPUTUSAN TANGGAPAN AUDITEE */}
          <div className="space-y-3">
            <div className="bg-slate-50 text-slate-600 font-bold text-[10px] py-2 px-3 rounded-lg uppercase tracking-wider flex items-center gap-2 border border-slate-200">
              <CheckCircle2 size={13} className="text-slate-400" /> Keputusan Tanggapan Auditee
                <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  IIA Std. 2410
                </span>
            </div>
            
            <div className="flex gap-4">
              {/* TOMBOL SETUJU */}
              <button
                type="button"
                onClick={() => setForm({ ...form, tanggapan: "setuju" })}
                className={`flex items-center justify-center gap-2.5 flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all font-black text-sm uppercase tracking-wider active:scale-[0.98] ${
                  !isTolak 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100" 
                    : "border-slate-200 bg-slate-50 text-slate-550 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <BsCheckCircle size={16} />
                Setuju
              </button>

              {/* TOMBOL TOLAK */}
              <button
                type="button"
                onClick={() => setForm({ ...form, tanggapan: "tolak" })}
                className={`flex items-center justify-center gap-2.5 flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all font-black text-sm uppercase tracking-wider active:scale-[0.98] ${
                  isTolak 
                    ? "border-red-500 bg-red-50 text-red-700 shadow-md shadow-red-100" 
                    : "border-slate-200 bg-slate-50 text-slate-550 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <BsXCircle size={16} />
                Tolak
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              Jika Tolak &rarr; muncul field alasan penolakan + upload bukti - temuan dikembalikan ke auditor untuk direvisi
            </p>
          </div>

          {/* MAIN DYNAMIC CONTENT */}
          {!isTolak ? (
            /* ============================================================ */
            /* 🟢 MODE SETUJU (BOX 3 & BOX 4)                                */
            /* ============================================================ */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* BOX 3: ANALISIS PENYEBAB */}
              <div className="space-y-4">
                <div className="bg-slate-50 text-slate-655 font-bold text-[10px] py-2 px-3 rounded-lg uppercase tracking-wider flex items-center gap-2 border border-slate-200">
                  <BsSearch size={13} className="text-slate-400" /> Analisis Penyebab
                  <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">IIA Std. 2320</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Analisa penyebab auditor <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Uraian analisis mendalam mengapa masalah ini terjadi dari sudut pandang auditor..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 font-medium text-sm text-slate-800 h-24 resize-none transition-all placeholder:text-slate-400"
                      value={form.analisa_auditor || ""}
                      onChange={(e) => setForm({ ...form, analisa_auditor: e.target.value })}
                    />
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Berbeda dengan &ldquo;Sebab&rdquo; di input temuan — ini analisis lebih mendalam berdasarkan seluruh bukti yang dikumpulkan
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Analisa penyebab auditee <span className="text-slate-400">(opsional — diisi jika auditee setuju)</span>
                    </label>
                    <textarea
                      placeholder="Tanggapan / analisis dari pihak auditee..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 font-medium text-sm text-slate-800 h-24 resize-none transition-all placeholder:text-slate-400"
                      value={form.analisa || ""}
                      onChange={(e) => setForm({ ...form, analisa: e.target.value })}
                    />
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Perspektif auditee atas penyebab temuan — dicatat untuk kelengkapan dokumentasi
                    </span>
                  </div>
                </div>
              </div>

              {/* BOX 4: RENCANA PERBAIKAN */}
              <div className="space-y-4">
                <div className="bg-slate-50 text-slate-655 font-bold text-[10px] py-2 px-3 rounded-lg uppercase tracking-wider flex items-center gap-2 border border-slate-200">
                  <BsPaperclip size={13} className="text-slate-400" /> Rencana Perbaikan
                  <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">IIA Std. 2400</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Rencana tindakan koreksi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Langkah spesifik untuk mengoreksi temuan ini..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 font-medium text-sm text-slate-800 h-24 resize-none transition-all placeholder:text-slate-400"
                      value={form.rencana_koreksi || ""}
                      onChange={(e) => setForm({ ...form, rencana_koreksi: e.target.value })}
                    />
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Tindakan langsung mengatasi akar masalah
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Rencana tindakan kolektif <span className="text-slate-400">(opsional)</span>
                    </label>
                    <textarea
                      placeholder="Tindakan sistemik agar masalah tidak terulang di unit lain..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 font-medium text-sm text-slate-800 h-24 resize-none transition-all placeholder:text-slate-400"
                      value={form.rencana_kolektif || ""}
                      onChange={(e) => setForm({ ...form, rencana_kolektif: e.target.value })}
                    />
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Berlaku lebih luas — pencegahan di level sistem/kebijakan
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Target selesai perbaikan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 font-bold text-sm text-slate-800 cursor-pointer [color-scheme:light]"
                      value={form.target_penyelesaian || ""}
                      onChange={(e) => setForm({ ...form, target_penyelesaian: e.target.value })}
                    />
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Menjadi acuan monitoring di halaman tindak lanjut
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Potensi nilai kerugian (IDR) <span className="text-slate-450">(jika belum diisi)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 font-bold text-sm text-slate-800"
                      placeholder="Rp 0"
                      value={form.nilai_kerugian ? formatRupiah(form.nilai_kerugian) : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setForm({ ...form, nilai_kerugian: raw });
                      }}
                    />
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Mengacu pada kerugian finansial yang diakibatkan temuan
                    </span>
                  </div>
                </div>
              </div>

              {/* BOX 5: FOOTER INFO ALERT BAR */}
              <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl text-xs font-semibold leading-relaxed">
                Setelah klik <strong className="text-blue-650">Simpan Analisis</strong> &rarr; status temuan otomatis berubah dari <strong>Draft</strong> ke <strong>Monev</strong>. Jika semua temuan sudah <strong>Monev</strong> &rarr; tombol <strong>&ldquo;Kirim ke Tindak Lanjut&rdquo;</strong> di header aktif.
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* 🔴 MODE TOLAK (BOX RED)                                      */
            /* ============================================================ */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-red-50/45 border border-red-200 p-5 rounded-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-red-200 pb-2">
                  <AlertCircle size={13} className="text-red-650 animate-pulse" /> Field yang muncul saat auditee pilih Tolak
                </div>

                <div className="space-y-4">
                  {/* ALASAN PENOLAKAN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-red-650 uppercase tracking-widest ml-1">
                      Alasan penolakan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Jelaskan secara spesifik mengapa temuan ini ditolak. Contoh: data yang dirujuk auditor tidak akurat, periode yang salah, atau kondisi yang digambarkan tidak sesuai fakta lapangan..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 font-medium text-sm text-slate-800 h-28 resize-none transition-all placeholder:text-slate-400"
                      value={form.feedback || ""}
                      onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                    />
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Wajib diisi — menjadi dasar auditor merevisi temuan. Semakin detail semakin mudah auditor memahami keberatan.
                    </span>
                  </div>

                  {/* ASPEK YANG DIPERMASALAHKAN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-red-650 uppercase tracking-widest ml-1">
                      Aspek yang dipermasalahkan <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 font-bold text-sm text-slate-850 cursor-pointer"
                      value={form.aspek_penolakan || ""}
                      onChange={(e) => setForm({ ...form, aspek_penolakan: e.target.value })}
                    >
                      <option value="">— Pilih aspek temuan yang ditolak —</option>
                      <option value="Kondisi tidak akurat">Kondisi tidak akurat</option>
                      <option value="Kriteria tidak tepat">Kriteria tidak tepat</option>
                      <option value="Sebab tidak sesuai">Sebab tidak sesuai</option>
                      <option value="Akibat terlalu berlebihan">Akibat terlalu berlebihan</option>
                      <option value="Data/fakta salah">Data/fakta salah</option>
                      <option value="Semua aspek">Semua aspek</option>
                    </select>
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Membantu auditor langsung tahu bagian mana yang perlu direvisi
                    </span>
                  </div>

                  {/* DATA / FAKTA PEMBANDING */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-red-655 uppercase tracking-widest ml-1">
                      Data / fakta pembanding <span className="text-slate-450">(opsional tapi sangat disarankan)</span>
                    </label>
                    <textarea
                      placeholder="Sampaikan data atau fakta yang menurut auditee lebih akurat. Contoh: angka yang benar, periode yang tepat, atau bukti yang bertentangan..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 font-medium text-sm text-slate-800 h-24 resize-none transition-all placeholder:text-slate-400"
                      value={form.fakta_pembanding || ""}
                      onChange={(e) => setForm({ ...form, fakta_pembanding: e.target.value })}
                    />
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Semakin konkret data yang diberikan, semakin mudah auditor memutuskan apakah temuan perlu direvisi atau dipertahankan
                    </span>
                  </div>

                  {/* UPLOAD BUKTI PENOLAKAN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-red-655 uppercase tracking-widest ml-1">
                      Upload bukti penolakan <span className="text-slate-450">(opsional tapi sangat disarankan)</span>
                    </label>
                    
                    <div className="flex flex-col gap-3">
                      <input
                        type="file"
                        id="lampiran-penolakan"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      
                      <label
                        htmlFor="lampiran-penolakan"
                        className="border-2 border-dashed border-red-200 bg-red-50/20 hover:bg-red-50/40 hover:border-red-500 transition-all duration-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer group h-[130px]"
                      >
                        <BsCloudUpload className="text-red-500/70 group-hover:text-red-600 group-hover:scale-105 transition-transform duration-200 animation-bounce" size={32} />
                        <span className="text-[12px] font-bold text-slate-600 group-hover:text-slate-800">Upload dokumen pendukung penolakan</span>
                        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wide">
                          PDF, DOCX, XLSX, JPG, PNG · maks. 10 MB
                        </span>
                      </label>

                      {lampiranFile && (
                        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl w-fit shadow-sm animate-in zoom-in-95 duration-150">
                          <BsPaperclip className="text-slate-400 animate-bounce" />
                          <span className="text-sm font-bold text-blue-600 truncate max-w-[200px]">{lampiranFile.name}</span>
                          <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-600 p-1 bg-red-50 rounded-md transition-colors border border-red-100">
                            <BsX size={14} />
                          </button>
                        </div>
                      )}
                      
                      <p className="text-[9px] text-slate-500 font-medium">
                        Bukti kuat mempercepat proses review ulang auditor dan meningkatkan akuntabilitas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOX 5: FOOTER INFO ALERT BAR FOR TOLAK */}
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold leading-relaxed">
                Setelah klik <strong>Kirim Penolakan</strong> &rarr; temuan dikembalikan ke auditor dengan flag <strong>&ldquo;Ditolak auditee&rdquo;</strong>. Auditor harus review ulang temuan di Tab Pelaksanaan — bisa direvisi atau dipertahankan dengan penjelasan.
              </div>
            </div>
          )}

          {/* FOOTER AKSI */}
          <div className="border-t border-slate-200 pt-5 flex justify-between items-center shrink-0">
            <button
              type="button"
              onClick={() => setSelectedTemuan(null)}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-55 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
            >
              Batal
            </button>
            
            {isTolak ? (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <BsSend size={14} /> Kirim penolakan ke auditor
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={14} /> Simpan analisis &rarr; status jadi Monev
              </button>
            )}
          </div>
          
        </div>
      </div>
    );
  };

  // ============================
  // 🟢 MAIN LIST / DAFTAR TEMUAN (WHITE & BLUE)
  // ============================
  return (
    <div className="bg-white text-slate-800 p-6 rounded-3xl border border-slate-200 space-y-5 font-sans min-h-screen shadow-sm">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BsSearch className="text-blue-600" /> Analisis penyebab temuan
                      </h2>
                      <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        IIA Std. 2320
                      </span>
                    </div>
          <p className="text-xs text-slate-500 font-medium">
            Klik &ldquo;Isi Analisis&rdquo; pada temuan yang belum dianalisis · semua temuan harus Monev sebelum bisa dikirim
          </p>
        </div>
        
        <button
          onClick={handleKirimTindakLanjut}
          disabled={!isReadyToSubmit}
          className={`flex items-center justify-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 ${
            isReadyToSubmit
              ? "bg-blue-600 border border-blue-600 text-white hover:bg-green-700 cursor-pointer shadow-blue-100"
              : "bg-slate-105 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          <BsSend size={15} /> Kirim ke Tindak Lanjut
        </button>
      </div>

      {/* ================= LHA APPROVAL WORKFLOW PANEL (IIA Std. 2420 & 2440) ================= */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight flex items-center gap-2">
                🛡️ Alur Persetujuan LHA
              </h3>
              <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                IIA Std. 2420 & 2440
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Persetujuan Laporan Hasil Audit oleh Kepala SPI sebelum didistribusikan
            </p>
          </div>
          
          {/* Status Badge */}
          {(() => {
            const status = lhaData.lha_status;
            if (status === "approved") {
              return (
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintLha}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Cetak LHA (PDF)
                  </button>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    LHA Disetujui
                  </span>
                </div>
              );
            } else if (status === "submitted") {
              return (
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                  Menunggu Persetujuan Kepala SPI
                </span>
              );
            } else if (status === "rejected") {
              return (
                <span className="bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  LHA Dikembalikan / Ditolak
                </span>
              );
            } else {
              return (
                <span className="bg-slate-100 text-slate-605 border border-slate-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Draft LHA
                </span>
              );
            }
          })()}
        </div>

        {/* LHA Info details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
          <div className="space-y-1.5">
            {lhaData.lha_submitted_by && (
              <p>
                <b>Diajukan Oleh:</b> {lhaData.lha_submitted_by} {lhaData.lha_submitted_at && `pada ${new Date(lhaData.lha_submitted_at).toLocaleString("id-ID")}`}
              </p>
            )}
            {lhaData.lha_approved_by && (
              <p>
                <b>Disetujui Oleh:</b> {lhaData.lha_approved_by} {lhaData.lha_approved_at && `pada ${new Date(lhaData.lha_approved_at).toLocaleString("id-ID")}`}
              </p>
            )}
          </div>
          {lhaData.lha_catatan && (
            <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm text-xs font-medium text-slate-700">
              <span className="font-bold text-slate-400 block mb-1 uppercase tracking-wide text-[9px]">Catatan Kepala SPI:</span>
              {lhaData.lha_catatan}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {lhaData.lha_status === "draft" || lhaData.lha_status === "rejected" ? (
            <>
              <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">
                {draftCount > 0 
                  ? "Semua temuan harus berstatus Monev sebelum LHA dapat diajukan ke Kepala SPI."
                  : "Semua temuan telah selesai dianalisis. LHA siap diajukan."
                }
              </span>
              {isAuditor && (
                <button
                  disabled={draftCount > 0}
                  onClick={async () => {
                    if (!window.confirm("Apakah Anda yakin ingin mengajukan LHA ini ke Kepala SPI?")) return;
                    try {
                      const res = await apiClient.post(`/api/assurance/${assurance.id}/submit-lha`);
                      if (res.data.success) {
                        notifySuccess(res.data.message);
                        fetchLhaStatus();
                      }
                    } catch (e) {
                      notifyError(e.response?.data?.message || "Gagal mengajukan LHA");
                    }
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer shadow-md"
                >
                  Ajukan LHA ke Kepala SPI
                </button>
              )}
            </>
          ) : lhaData.lha_status === "submitted" && isKepalaSPI ? (
            <div className="w-full flex flex-col gap-3">
              <textarea
                placeholder="Tulis catatan persetujuan atau alasan penolakan di sini..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-xs text-slate-800 transition-all resize-y leading-relaxed shadow-sm"
                rows="2"
                id="lha-catatan-input"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const catatan = document.getElementById("lha-catatan-input")?.value || "";
                    if (!catatan.trim()) {
                      notifyError("Catatan penolakan wajib diisi!");
                      return;
                    }
                    try {
                      const res = await apiClient.post(`/api/assurance/${assurance.id}/approve-lha`, {
                        action: "reject",
                        catatan
                      });
                      if (res.data.success) {
                        notifySuccess(res.data.message);
                        fetchLhaStatus();
                      }
                    } catch (e) {
                      notifyError(e.response?.data?.message || "Gagal memproses LHA");
                    }
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-rose-200"
                >
                  Kembalikan ke Auditor
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const catatan = document.getElementById("lha-catatan-input")?.value || "";
                    try {
                      const res = await apiClient.post(`/api/assurance/${assurance.id}/approve-lha`, {
                        action: "approve",
                        catatan
                      });
                      if (res.data.success) {
                        notifySuccess(res.data.message);
                        fetchLhaStatus();
                      }
                    } catch (e) {
                      notifyError(e.response?.data?.message || "Gagal menyetujui LHA");
                    }
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-250"
                >
                  Setujui & Tandatangani LHA
                </button>
              </div>
            </div>
          ) : (
            <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">
              {lhaData.lha_status === "approved" 
                ? "LHA telah disetujui. Tim audit dapat meneruskan temuan ini ke panel Tindak Lanjut."
                : "Menunggu Kepala SPI melakukan review dan persetujuan LHA."
              }
            </span>
          )}
        </div>
      </div>

      {/* WARNING INFO BAR */}
      {!isReadyToSubmit && data.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-5 rounded-r-2xl shadow-sm text-xs leading-relaxed font-semibold">
          {draftCount > 0 ? (
            <span>
              Tombol <strong className="text-amber-600">Kirim ke Tindak Lanjut</strong> baru aktif jika semua temuan berstatus <strong>Monev</strong> (sudah dianalisis). Saat ini {draftCount} temuan masih Draft.
            </span>
          ) : lhaData.lha_status !== "approved" ? (
            <span>
              Semua temuan telah selesai dianalisis. Namun LHA masih berstatus <strong className="text-amber-600">{lhaData.lha_status.toUpperCase()}</strong>. Ajukan dan dapatkan persetujuan LHA dari Kepala SPI terlebih dahulu agar tombol Kirim aktif.
            </span>
          ) : null}
        </div>
      )}

      {/* TEMUAN CARDS LIST */}
      <div className="grid grid-cols-1 gap-5">
        {data.length > 0 ? (
          data.map((item, index) => {
            const statusConfig = getStatusBadgeConfig(item.status_analisis);
            const isMonevOrClose = item.status_analisis === "monev" || item.status_analisis === "close";

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all space-y-5"
              >
                {/* CARD HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-300 font-mono text-xl font-bold pr-2 select-none pt-0.5">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-slate-850 font-bold text-[15px] leading-snug">
                        {item.masalah}
                      </h3>
                      <p className="text-[10px] text-slate-450 font-bold mt-1 uppercase tracking-wider">
                        KKA {item.no_kka} · Hal LHE {item.halaman_lhe || "-"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-start">
                    {getKategoriBadge(item.kategori)}
                    
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${statusConfig.bgColor}`}>
                      {statusConfig.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSelectTemuan(item)}
                      className="px-4 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50/50 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 hover:border-blue-550"
                    >
                      <BsPencilSquare size={13} />
                      {isMonevOrClose ? "Edit analisis" : "Isi analisis"}
                    </button>
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className="space-y-4">
                  
                  {/* ROW 1: KONDISI, SEBAB, AKIBAT */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Kondisi</span>
                      <p className="text-slate-700 text-[12px] font-medium leading-relaxed">{item.kondisi || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Sebab</span>
                      <p className="text-slate-700 text-[12px] font-medium leading-relaxed">{item.sebab || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Akibat</span>
                      <p className="text-red-600 text-[12px] font-semibold leading-relaxed">{item.akibat || "-"}</p>
                    </div>
                  </div>

                  {/* DYNAMIC SECTION BASED ON STATUS */}
                  {isMonevOrClose && item.analisis ? (
                    <div className="border-t border-slate-100 pt-4 space-y-4 animate-in fade-in duration-200">
                      
                      {/* ROW 2: TANGGAPAN, ANALISA AUDITOR, KOREKSI */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Keputusan Tanggapan</span>
                          <p className="text-[12px] font-semibold flex items-center gap-1">
                            {item.analisis.tanggapan === "setuju" ? (
                              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                <CheckCircle2 size={13} /> Setuju
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center gap-1 font-bold">
                                <XCircle size={13} /> Tolak
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Analisa Penyebab Auditor</span>
                          <p className="text-slate-750 text-[12px] font-medium leading-relaxed">{item.analisis.analisa_auditor || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Rencana Tindakan Koreksi</span>
                          <p className="text-blue-600 text-[12px] font-semibold leading-relaxed">{item.analisis.rencana_koreksi || "-"}</p>
                        </div>
                      </div>

                      {/* ROW 3: TINDAKAN KOLEKTIF, TARGET SELESAI */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-100 pt-4">
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Rencana Tindakan Kolektif</span>
                          <p className="text-slate-750 text-[12px] font-medium leading-relaxed">{item.analisis.rencana_kolektif || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Target Selesai Perbaikan</span>
                          <p className="text-slate-800 text-[12px] font-bold">{formatDateIndo(item.analisis.target_penyelesaian)}</p>
                        </div>
                        {item.nilai_kerugian ? (
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Potensi Nilai Kerugian</span>
                            <p className="text-slate-800 text-[12px] font-bold font-mono">{formatRupiah(item.nilai_kerugian)}</p>
                          </div>
                        ) : null}
                      </div>
                      
                    </div>
                  ) : item.status_analisis === "ditolak" && item.analisis ? (
                    <div className="border-t border-red-100 pt-4 animate-in fade-in duration-200">
                      <div className="bg-red-50/40 border border-red-200 p-4 rounded-xl space-y-3">
                        <div className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-1">
                          <AlertCircle size={12} className="text-red-500 animate-pulse" /> Temuan ditolak auditee
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-1">
                            <span className="text-red-700/60 font-bold uppercase tracking-widest text-[9px] block">Alasan Penolakan</span>
                            <p className="text-slate-800 text-[12px] font-medium leading-relaxed">{item.analisis.feedback || "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-red-700/60 font-bold uppercase tracking-widest text-[9px] block">Aspek yang dipermasalahkan</span>
                            <p className="text-slate-800 text-[12px] font-bold">{item.analisis.aspek_penolakan || "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-red-700/60 font-bold uppercase tracking-widest text-[9px] block">Fakta Pembanding</span>
                            <p className="text-slate-800 text-[12px] font-medium leading-relaxed">{item.analisis.fakta_pembanding || "-"}</p>
                          </div>
                        </div>

                        {item.analisis.lampiran && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewFile({
                                  file_path: item.analisis.lampiran,
                                  judul_dokumen: item.analisis.lampiran_name || item.analisis.lampiran.split("/").pop()
                                });
                              }}
                              className="text-red-600 font-bold text-[11px] hover:underline flex items-center gap-1.5 bg-red-100 hover:bg-red-200/80 px-3 py-1.5 rounded-md transition-colors cursor-pointer w-fit border border-red-200/50"
                            >
                              <BsFileEarmarkText size={12}/> 
                              Buka Bukti Penolakan: {item.analisis.lampiran_name || item.analisis.lampiran.split("/").pop()}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-center select-none shadow-inner border-dashed animate-in fade-in duration-200">
                      <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">
                        Analisis penyebab belum diisi — klik &ldquo;Isi Analisis&rdquo; untuk melengkapi
                      </p>
                    </div>
                  )}
                  
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-20 text-center select-none">
            <BsFileEarmarkText size={54} className="mx-auto text-slate-350 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-655">Belum Ada Temuan</h3>
            <p className="text-sm text-slate-400 mt-1 font-semibold">Harap isi temuan pada tab Pelaksanaan terlebih dahulu.</p>
          </div>
        )}
      </div>

      {renderModal()}
      {renderPreviewModal()}
    </div>
  );
};

export default AnalisisTab;
