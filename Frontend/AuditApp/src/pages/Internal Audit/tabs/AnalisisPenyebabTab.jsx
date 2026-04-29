import React, { useEffect, useState } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { BsFileEarmarkText, BsPaperclip, BsCloudUpload, BsX } from "react-icons/bs";

const AnalisisTab = ({ assurance }) => {
  const [data, setData] = useState([]);
  const [selectedTemuan, setSelectedTemuan] = useState(null);
  const [lampiranFile, setLampiranFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [statusTemuanList, setStatusTemuanList] = useState([]);

  const [form, setForm] = useState({});

  // Fetch daftar status temuan dari database (untuk warna badge)
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
            else                       status = 'draft';
          }

          allTemuan.push({
            ...t,
            analisis: t.analisis || null,
            status_analisis: status,
          });
        });
      });

      setData(allTemuan);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalisis();
  }, [assurance]);

  const handleSave = async () => {
    try {
      if (
        selectedTemuan?.status_analisis === "close" ||
        selectedTemuan?.analisis?.status === "close"
      ) {
        return;
      }

      const formData = new FormData();
      const cleanedForm = {
        status: form.status,
        tanggapan: form.tanggapan,
        analisa: form.analisa,
        rencana_koreksi: form.rencana_koreksi,
        rencana_kolektif: form.rencana_kolektif,
        target_penyelesaian: form.target_penyelesaian,
        feedback: form.feedback,
        lampiran: form.lampiran,
      };

      Object.keys(cleanedForm).forEach((key) => {
        formData.append(key, cleanedForm[key] ?? "");
      });

      await apiClient.post(
        `/api/temuan/${selectedTemuan.id}/analisis`,
        formData,
      );

      alert("Analisis berhasil disimpan!");
      await fetchAnalisis();
      await handleSelectTemuan(selectedTemuan); // Refresh detail
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data.");
    }
  };

  const handleSelectTemuan = (item) => {
    const data = item.analisis || {};

    setSelectedTemuan(item);
    setForm({
      status: data.status || "",
      tanggapan: data.tanggapan || "",
      analisa: data.analisa || "",
      rencana_koreksi: data.rencana_koreksi || "",
      rencana_kolektif: data.rencana_kolektif || "",
      target_penyelesaian: data.target_penyelesaian || "",
      feedback: data.feedback || "",
      lampiran: null,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLampiranFile(file);

    setForm({
      ...form,
      lampiran: file,
    });
  };

  const handleRemoveFile = () => {
    setLampiranFile(null);
    setForm({
      ...form,
      lampiran: null,
    });
  };

  const handleKirimTindakLanjut = async () => {
    try {
      const draftTemuan = data.filter(
        (item) => item.status_analisis === "draft"
      );

      if (draftTemuan.length === 0) {
        alert("Tidak ada temuan dengan status draft yang siap dikirim.");
        return;
      }

      if(!window.confirm(`Kirim ${draftTemuan.length} temuan (draft) ke panel Tindak Lanjut?`)) return;

      await apiClient.post("/api/tindak-lanjut/generate", {
        temuan_ids: draftTemuan.map((t) => t.id),
      });

      alert("Berhasil dikirim ke Tindak Lanjut 🚀");
      fetchAnalisis();
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim tindak lanjut.");
    }
  };

  // Peta: key internal → nama status di DB
  const STATUS_KEY_MAP = {
    'belum': 'Draft Temuan',  // belum diisi = Draft Temuan
    'draft': 'Draft Temuan',  // sudah diisi formnya tapi belum dikirim
    'monev': 'Monev',         // sudah dikirim ke tindak lanjut
    'close': 'Close',         // selesai
  };

  // Helper badge: cari warna dari database berdasarkan nama status
  const getStatusConfig = (status) => {
    const targetName = STATUS_KEY_MAP[status] || status;
    const found = statusTemuanList.find(
      s => s.nama.toLowerCase() === targetName.toLowerCase()
    );
    if (found) {
      return {
        bgColor:   found.warna,
        textColor: found.warna_teks,
        label:     found.nama,
        icon:      null,
      };
    }
    // Fallback warna jika belum ada di database
    switch (status) {
      case 'close':  return { bgColor: '#5ef047', textColor: '#000000', label: 'Close',        icon: <CheckCircle2 size={12}/> };
      case 'monev':  return { bgColor: '#f5e53f', textColor: '#000000', label: 'Monev',        icon: <AlertCircle size={12}/> };
      default:       return { bgColor: '#01aec4', textColor: '#ffffff', label: 'Draft Temuan', icon: <AlertCircle size={12}/> };
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
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{previewFile.judul_dokumen || 'Preview Dokumen'}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Tipe: Lampiran Temuan | Fitur Preview</p>
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

  // ============================
  // 🔵 MODE DETAIL
  // ============================
  if (selectedTemuan) {
    const isClosed =
      selectedTemuan.status_analisis === "close" ||
      selectedTemuan.analisis?.status === "close";

    return (
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* HEADER KEMBALI */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            onClick={() => setSelectedTemuan(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            <ArrowLeft size={16} /> Kembali ke Daftar
          </button>
          {isClosed && (
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-1.5">
              <CheckCircle2 size={12}/> Analisa Terkunci
            </span>
          )}
        </div>

        {/* INFO TEMUAN UTAMA */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h2 className="font-black text-lg text-slate-800 mb-2">Masalah yang Dijumpai</h2>
          <p className="text-slate-700 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-200">{selectedTemuan.masalah}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kondisi (Fakta)</span>
              <p className="text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100">{selectedTemuan.kondisi || "-"}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kriteria (Standar)</span>
              <p className="text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100">{selectedTemuan.kriteria || "-"}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sebab (Root Cause)</span>
              <p className="text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100">{selectedTemuan.sebab || "-"}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akibat (Impact)</span>
              <p className="text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100">{selectedTemuan.akibat || "-"}</p>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Rekomendasi Perbaikan</span>
              <p className="text-sm font-bold text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{selectedTemuan.rekomendasi || "-"}</p>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Lampiran Temuan</span>
              <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center">
                {selectedTemuan.analisis?.lampiran || selectedTemuan.lampiran ? (
                  <button
                    onClick={() => {
                        setPreviewFile({
                            file_path: selectedTemuan.analisis?.lampiran || selectedTemuan.lampiran,
                            judul_dokumen: selectedTemuan.analisis?.lampiran_name || selectedTemuan.lampiran_name || (selectedTemuan.analisis?.lampiran || selectedTemuan.lampiran).split("/").pop()
                        });
                    }}
                    className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                  >
                    <BsFileEarmarkText size={14}/> 
                    {selectedTemuan.analisis?.lampiran_name || selectedTemuan.lampiran_name || (selectedTemuan.analisis?.lampiran || selectedTemuan.lampiran).split("/").pop()}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-400 italic">Tidak ada lampiran</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AREA FORM TANGGAPAN */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* TANGGAPAN RADIOS */}
            <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Keputusan Tanggapan
              </label>
              <div className="flex gap-4">
                <label className={`flex items-center justify-center gap-2 flex-1 cursor-pointer p-3 rounded-xl border-2 transition-all ${form.tanggapan === "setuju" ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-slate-50 hover:bg-slate-100"} ${isClosed ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <input
                    type="radio"
                    name="tanggapan"
                    value="setuju"
                    checked={form.tanggapan === "setuju"}
                    disabled={isClosed}
                    onChange={(e) => setForm({ ...form, tanggapan: e.target.value })}
                    className="w-4 h-4 accent-blue-600 hidden"
                  />
                  <span className={`font-bold text-sm ${form.tanggapan === "setuju" ? "text-blue-700" : "text-slate-500"}`}>Setuju</span>
                </label>
                <label className={`flex items-center justify-center gap-2 flex-1 cursor-pointer p-3 rounded-xl border-2 transition-all ${form.tanggapan === "tolak" ? "border-red-500 bg-red-50" : "border-slate-100 bg-slate-50 hover:bg-slate-100"} ${isClosed ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <input
                    type="radio"
                    name="tanggapan"
                    value="tolak"
                    checked={form.tanggapan === "tolak"}
                    disabled={isClosed}
                    onChange={(e) => setForm({ ...form, tanggapan: e.target.value })}
                    className="w-4 h-4 accent-red-600 hidden"
                  />
                  <span className={`font-bold text-sm ${form.tanggapan === "tolak" ? "text-red-600" : "text-slate-500"}`}>Tolak</span>
                </label>
              </div>
            </div>

            {/* STATUS SELECT — dinamis dari database (hanya draft & close yang bisa dipilih manual) */}
            <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Status Analisis
              </label>
              {isClosed ? (
                // Jika sudah close, tampilkan badge saja
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: getStatusConfig('close').bgColor }}>
                  <CheckCircle2 size={14} style={{ color: getStatusConfig('close').textColor }} />
                  <span className="font-black text-sm" style={{ color: getStatusConfig('close').textColor }}>Close — Terkunci</span>
                </div>
              ) : (
                <select
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-700 cursor-pointer"
                  value={form.status || ""}
                  disabled={isClosed}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="">-- Pilih Status --</option>
                  {/* Opsi dari database — hanya tampilkan yang bisa dipilih manual (bukan Monev, itu otomatis) */}
                  {statusTemuanList
                    .filter(s => !['monev'].includes(s.nama.toLowerCase()))
                    .map(s => {
                      // Map nama DB ke value internal yang disimpan ke DB analisis
                      const valMap = { 'draft temuan': 'draft', 'close': 'close' };
                      const val = valMap[s.nama.toLowerCase()] || s.nama.toLowerCase();
                      return (
                        <option key={s.id} value={val}>
                          {s.nama}{val === 'close' ? ' (Terkunci — tidak bisa diedit lagi)' : ' (Masih diproses)'}
                        </option>
                      );
                    })
                  }
                </select>
              )}
              <p className="text-[10px] text-slate-400 mt-2">
                ⚠️ Status <strong>Monev</strong> diatur otomatis saat menekan tombol &ldquo;Kirim Rencana Tindak Lanjut&rdquo;.
              </p>
            </div>

          </div>

          {/* FORM JIKA SETUJU */}
          {form.tanggapan === "setuju" && (
            <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 space-y-5 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Analisa Penyebab Auditee</label>
                  <textarea
                    placeholder="Tuliskan analisa dari pihak auditee..."
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm h-24 resize-none transition-all"
                    value={form.analisa || ""}
                    disabled={isClosed}
                    onChange={(e) => setForm({ ...form, analisa: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Rencana Tindakan Koreksi</label>
                  <textarea
                    placeholder="Rencana perbaikan jangka pendek..."
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm h-24 resize-none transition-all"
                    value={form.rencana_koreksi || ""}
                    disabled={isClosed}
                    onChange={(e) => setForm({ ...form, rencana_koreksi: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Rencana Tindakan Kolektif</label>
                  <textarea
                    placeholder="Rencana perbaikan sistemik jangka panjang..."
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm h-24 resize-none transition-all"
                    value={form.rencana_kolektif || ""}
                    disabled={isClosed}
                    onChange={(e) => setForm({ ...form, rencana_kolektif: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Target Selesai Perbaikan</label>
                  <input
                    type="date"
                    className="w-full md:w-1/2 p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm transition-all"
                    value={form.target_penyelesaian || ""}
                    disabled={isClosed}
                    onChange={(e) => setForm({ ...form, target_penyelesaian: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* FORM JIKA TOLAK */}
          {form.tanggapan === "tolak" && (
            <div className="bg-red-50/30 p-6 rounded-2xl border border-red-100 space-y-5 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Tanggapan / Alasan Penolakan</label>
                <textarea
                  placeholder="Berikan alasan logis mengapa temuan ini ditolak oleh auditee..."
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400 font-medium text-sm h-32 resize-none transition-all"
                  disabled={isClosed}
                  value={form.feedback || ""}
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Lampiran Bukti Penolakan</label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    id="lampiran"
                    className="hidden"
                    disabled={isClosed}
                    onChange={handleFileChange}
                  />
                  
                  {!isClosed && (
                    <label
                      htmlFor="lampiran"
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors w-fit flex items-center gap-2 shadow-sm"
                    >
                      <BsCloudUpload size={14}/> Pilih File Bukti
                    </label>
                  )}

                  {lampiranFile && (
                    <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl w-fit shadow-sm">
                      <BsPaperclip className="text-slate-400" />
                      <span className="text-sm font-bold text-blue-600 truncate max-w-[200px]">{lampiranFile.name}</span>
                      {!isClosed && (
                        <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-md">
                          <BsX size={14} />
                        </button>
                      )}
                    </div>
                  )}
                  
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    Max size: 5MB (pdf, doc, docx, png, jpg)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER AKSI */}
        <div className="border-t border-slate-200 pt-6 flex justify-end">
          {isClosed ? (
            <span className="bg-slate-100 text-slate-500 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 flex items-center gap-2">
               <CheckCircle2 size={14}/> Analisa telah ditutup dan terkunci
            </span>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Simpan Analisa
            </button>
          )}
        </div>

        {renderPreviewModal()}
      </div>
    );
  }

  // ============================
  // 🟢 MODE LIST / DAFTAR TEMUAN
  // ============================
  return (
    <div className="space-y-6 py-4 font-sans animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
           <h2 className="font-black text-xl text-slate-800 uppercase tracking-tight flex items-center gap-2">
             Analisis Penyebab Temuan
           </h2>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Review temuan dan input respon dari auditee</p>
        </div>
        <button
          onClick={handleKirimTindakLanjut}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          Kirim Rencana Tindak Lanjut <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {data.length > 0 ? (
          data.map((item) => {
            const statusConfig = getStatusConfig(item.status_analisis);
            
            return (
              <div
                key={item.id}
                onClick={() => handleSelectTemuan(item)}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
              >
                {/* HEADER CARD */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5 border-b border-slate-100 pb-4">
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Masalah Utama</span>
                    <h3 className="text-slate-800 font-bold text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.masalah}
                    </h3>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0"
                    style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }}
                  >
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>

                {/* CONTENT CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kondisi</p>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-3">{item.kondisi || "-"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kriteria</p>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-3">{item.kriteria || "-"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sebab</p>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-3">{item.sebab || "-"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Akibat</p>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-3">{item.akibat || "-"}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <BsFileEarmarkText size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Belum Ada Temuan</h3>
            <p className="text-sm text-slate-500 mt-1">Harap isi temuan pada tab Pelaksanaan terlebih dahulu.</p>
          </div>
        )}
      </div>

      {renderPreviewModal()}
    </div>
  );
};

export default AnalisisTab;