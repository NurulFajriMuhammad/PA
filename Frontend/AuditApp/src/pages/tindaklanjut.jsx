import React, { useEffect, useState } from "react";
import { 
  BsArrowRepeat, 
  BsBoxArrowInRight, 
  BsClock, 
  BsSearch, 
  BsFilter, 
  BsArrowLeft, 
  BsPlusLg, 
  BsFileEarmarkArrowDown,
  BsFileEarmarkText,
  BsExclamationCircle,
  BsX
} from "react-icons/bs";
import { notifySuccess, notifyError } from "../../../Shared/utils/notifier";
import apiClient from "../../../Shared/api/apiClient";

const EMPTY_CREATE_FORM = { tahun: "", bulan: "", keterangan: "", bukti: null };
const EMPTY_REVIEW_FORM = { hasil_evaluasi: "", kesimpulan: "" };

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, { value: 3, label: "Maret" },
  { value: 4, label: "April" }, { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
  { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, { value: 9, label: "September" },
  { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Desember" },
];

const EVALUATION_OPTIONS = [
  { value: "sesuai", label: "Sesuai" },
  { value: "potensi sesuai", label: "Potensi Sesuai" },
  { value: "belum sesuai", label: "Belum Sesuai" },
];

// Komponen Reusable untuk Field Detail agar rapi
const Field = ({ label, value }) => (
  <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{label}</span>
    <div className="text-sm font-medium text-slate-700">{value ?? "-"}</div>
  </div>
);

const FollowUp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenisAudit, setFilterJenisAudit] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [dataFollowUp, setDataFollowUp] = useState([]);
  const [mode, setMode] = useState("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW_FORM);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchFollowUp = async () => {
    try {
      const res = await apiClient.get("/api/tindak-lanjut");
      const sorted = (res.data.data || []).sort((a, b) => a.id - b.id);
      setDataFollowUp(sorted);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchFollowUp(); }, []);

  const filteredData = dataFollowUp.filter(
    (item) =>
      (item.masalah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id).includes(searchTerm)) &&
      (filterJenisAudit === "" || item.jenis_audit === filterJenisAudit) &&
      (filterUnit === "" || item.unit === filterUnit) &&
      (filterStatus === "" || item.status === filterStatus),
  );

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const getMonthLabel = (month) => MONTH_OPTIONS.find((item) => item.value === Number(month))?.label || "-";

  const getStatusBadgeClass = (status) => {
    if (status === "close") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "monev") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const getStatusLabel = (status) => {
    if (status === "close") return "Close";
    if (status === "monev") return "Monev";
    return "Draft Temuan";
  };

  const getUniqueJenisAudit = () => [...new Set(dataFollowUp.map((item) => item.jenis_audit).filter(Boolean))].sort();
  const getUniqueUnit = () => [...new Set(dataFollowUp.map((item) => item.unit).filter(Boolean))].sort();
  const getUniqueStatus = () => ["draft", "monev", "close"];

  const handleDetail = async (item) => {
    try {
      const res = await apiClient.get(`/api/tindak-lanjut/detail/${item.temuan_id}?jenis=${item.jenis_audit}`);
      setSelectedItem({
        ...res.data.temuan,
        temuan_id: item.temuan_id,
        jenis_audit: item.jenis_audit,
        tindak_lanjut: Array.isArray(res.data.tindak_lanjut) ? res.data.tindak_lanjut : [],
      });
      setMode("detail");
    } catch (err) { console.error(err); }
  };

  const refreshDetail = async () => {
    if (!selectedItem?.temuan_id) return;
    await handleDetail({ temuan_id: selectedItem.temuan_id, jenis_audit: selectedItem.jenis_audit });
    await fetchFollowUp();
  };

  const handleCreateTL = async () => {
    try {
      const formData = new FormData();
      formData.append("tahun", createForm.tahun);
      formData.append("bulan", createForm.bulan);
      formData.append("keterangan", createForm.keterangan);
      if (createForm.bukti) formData.append("bukti", createForm.bukti);
      await apiClient.post(`/api/tindak-lanjut/${selectedItem.temuan_id}/detail?jenis=${selectedItem.jenis_audit}`, formData);
      notifySuccess("Tindak lanjut berhasil ditambahkan");
      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE_FORM);
      await refreshDetail();
    } catch (err) { notifyError("Gagal menyimpan data"); }
  };

  const openReviewModal = (item) => {
    setReviewItem(item);
    setReviewForm({ hasil_evaluasi: item.hasil_evaluasi || "", kesimpulan: item.kesimpulan || "" });
  };

  const handleSubmitReview = async () => {
    try {
      await apiClient.put(`/api/tindak-lanjut/${reviewItem.id}/review`, reviewForm);
      notifySuccess("Review disimpan");
      setReviewItem(null);
      await refreshDetail();
    } catch (err) { console.error(err); }
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

  // --- DETAIL MODE ---
  if (mode === "detail" && selectedItem) {
    const isLocked = selectedItem.status === "close";
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <button onClick={() => setMode("list")} className="mb-6 flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition-all">
          <BsArrowLeft /> Kembali ke Monitoring
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-[#1f4b82] px-6 py-4 text-white">
            <h2 className="text-xl font-bold">Detail Temuan Audit</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Masalah yang Dijumpai" value={selectedItem.masalah} />
            <Field label="Kondisi" value={selectedItem.kondisi} />
            <Field label="Kriteria" value={selectedItem.kriteria} />
            <Field label="Sebab" value={selectedItem.sebab} />
            <Field label="Akibat" value={selectedItem.akibat} />
            <Field label="Rekomendasi" value={selectedItem.rekomendasi} />
            <Field label="Analisa Penyebab" value={selectedItem.analisa} />
            <Field label="Rencana Tindakan Koreksi" value={selectedItem.rencana_koreksi} />
            <Field label="Rencana Tindakan Kolektif" value={selectedItem.rencana_kolektif} />
            <Field label="Target Penyelesaian" value={formatDate(selectedItem.target_selesai)} />
            <Field label="Lampiran" value={selectedItem.lampiran ? (
              <button
                onClick={() => setPreviewFile({
                  file_path: selectedItem.lampiran,
                  judul_dokumen: selectedItem.lampiran_name || selectedItem.lampiran.split("/").pop()
                })}
                className="text-blue-600 font-bold hover:underline flex items-center gap-1.5 w-fit"
              >
                <BsFileEarmarkText size={14} /> <span className="line-clamp-1">{selectedItem.lampiran_name || selectedItem.lampiran.split("/").pop()}</span>
              </button>
            ) : "-"} />
            <div className="p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Status Saat Ini</span>
              <div className="mt-1"><span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadgeClass(selectedItem.status)}`}>{getStatusLabel(selectedItem.status)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Riwayat Progres Tindak Lanjut</h2>
              {isLocked && <p className="text-sm text-red-500 flex items-center gap-1 mt-1"><BsExclamationCircle /> Data terkunci (Status Close)</p>}
            </div>
            <button onClick={() => setShowCreateModal(true)} disabled={isLocked} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-lg shadow-blue-100">
              <BsPlusLg /> Tambah Progress
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-y border-slate-100 text-slate-500">
                <tr>
                  <th className="p-4 text-left font-bold">No</th>
                  <th className="p-4 text-left font-bold">Periode</th>
                  <th className="p-4 text-left font-bold">Bukti Dukung</th>
                  <th className="p-4 text-left font-bold">Hasil Evaluasi</th>
                  <th className="p-4 text-left font-bold">Kesimpulan</th>
                  <th className="p-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedItem.tindak_lanjut.map((tl, index) => (
                  <tr key={tl.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-400">{index + 1}</td>
                    <td className="p-4 font-bold text-slate-700">{getMonthLabel(tl.bulan)} {tl.tahun}</td>
                    <td className="p-4">{tl.bukti ? (
                      <button
                        onClick={() => setPreviewFile({
                          file_path: tl.bukti,
                          judul_dokumen: tl.bukti.split("/").pop()
                        })}
                        className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline text-xs"
                      >
                        <BsFileEarmarkText size={14} /> <span className="line-clamp-1 text-left max-w-[120px]" title={tl.bukti.split("/").pop()}>{tl.bukti.split("/").pop()}</span>
                      </button>
                    ) : "-"}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${tl.hasil_evaluasi === 'sesuai' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{tl.hasil_evaluasi || "Draft"}</span></td>
                    <td className="p-4 text-slate-600 italic">"{tl.kesimpulan || "-"}"</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openReviewModal(tl)} disabled={isLocked} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL TAMBAH PROGRES */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold">Tambah Realisasi Tindak Lanjut</h3>
                <button onClick={() => setShowCreateModal(false)}><BsX size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                <textarea placeholder="Keterangan perbaikan yang dilakukan..." className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 outline-none" rows="4" value={createForm.keterangan} onChange={(e) => setCreateForm({ ...createForm, keterangan: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Tahun" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 outline-none" value={createForm.tahun} onChange={(e) => setCreateForm({ ...createForm, tahun: e.target.value })} />
                  <select className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 outline-none" value={createForm.bulan} onChange={(e) => setCreateForm({ ...createForm, bulan: e.target.value })}>
                    <option value="">Pilih Bulan</option>
                    {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="p-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Upload Bukti Dukung</p>
                  <input type="file" onChange={(e) => setCreateForm({ ...createForm, bukti: e.target.files?.[0] || null })} className="text-xs" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-sm">Batal</button>
                  <button onClick={handleCreateTL} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100">Simpan Data</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REVIEW */}
        {reviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold">Evaluasi Progress Perbaikan</h3>
                <button onClick={() => setReviewItem(null)}><BsX size={24} /></button>
              </div>
              <div className="p-6 space-y-5">
                 <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div><p className="text-[10px] font-bold text-slate-400">PERIODE</p><p className="text-sm font-bold text-slate-700">{getMonthLabel(reviewItem.bulan)} {reviewItem.tahun}</p></div>
                   <div><p className="text-[10px] font-bold text-slate-400">BUKTI</p>{reviewItem.bukti ? (
                      <button
                        onClick={() => setPreviewFile({
                          file_path: reviewItem.bukti,
                          judul_dokumen: reviewItem.bukti.split("/").pop()
                        })}
                        className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1.5"
                      >
                        <BsFileEarmarkText size={14} /> <span className="line-clamp-1 max-w-[150px]">{reviewItem.bukti.split("/").pop()}</span>
                      </button>
                    ) : "-"}</div>
                   <div className="col-span-2 mt-2"><p className="text-[10px] font-bold text-slate-400">KETERANGAN AUDITEE</p><p className="text-sm italic text-slate-600">"{reviewItem.keterangan || "-"}"</p></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Hasil Evaluasi Auditor</label>
                  <select className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 outline-none" value={reviewForm.hasil_evaluasi} onChange={(e) => setReviewForm({ ...reviewForm, hasil_evaluasi: e.target.value })}>
                    <option value="">-- Pilih Hasil Evaluasi --</option>
                    {EVALUATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kesimpulan / Feedback</label>
                  <textarea rows="3" className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 outline-none" value={reviewForm.kesimpulan} onChange={(e) => setReviewForm({ ...reviewForm, kesimpulan: e.target.value })} placeholder="Berikan catatan tambahan untuk auditee..." />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setReviewItem(null)} className="flex-1 py-3 text-slate-400 font-bold">Batal</button>
                  <button onClick={handleSubmitReview} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-50">Simpan Evaluasi</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderPreviewModal()}
      </div>
    );
  }

  // --- LIST MODE ---
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase tracking-tight">
          <BsArrowRepeat className="text-blue-600" /> Monitoring Tindak Lanjut
        </h1>
        <p className="text-slate-500 text-sm">Sistem Pemantauan dan Realisasi Rekomendasi Hasil Pemeriksaan</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative flex-1 min-w-[300px]">
          <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari masalah temuan atau unit..." className="w-full rounded-xl border-none bg-slate-50 py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="rounded-xl border-none bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={filterJenisAudit} onChange={(e) => setFilterJenisAudit(e.target.value)}>
            <option value="">Jenis Audit</option>
            {getUniqueJenisAudit().map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="rounded-xl border-none bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}>
            <option value="">Unit Kerja</option>
            {getUniqueUnit().map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="rounded-xl border-none bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Status</option>
            {getUniqueStatus().map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-center">No</th>
              <th className="px-6 py-4">Informasi Temuan (Masalah)</th>
              <th className="px-6 py-4">Audit / Unit</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                <td className="px-6 py-4"><p className="text-sm font-bold text-slate-700 max-w-md line-clamp-2 uppercase leading-snug">{item.masalah}</p></td>
                <td className="px-6 py-4">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">{item.jenis_audit || "-"}</p>
                  <p className="text-xs text-slate-500 italic">{item.unit || "-"}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">
                    <BsClock className="text-blue-500" /> {formatDate(item.target_selesai)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-tighter ${getStatusBadgeClass(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDetail(item)} className="inline-flex items-center gap-2 rounded-xl bg-[#1f4b82] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-md shadow-blue-50">
                    <BsBoxArrowInRight /> Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && <div className="py-20 text-center text-slate-400">Data tindak lanjut tidak ditemukan...</div>}
      </div>
    </div>
  );
};

export default FollowUp;