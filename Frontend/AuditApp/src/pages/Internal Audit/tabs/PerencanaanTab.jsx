import React, { useEffect, useState } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { BsX, BsPrinter, BsFileEarmarkCheck, BsPlusLg, BsCloudUpload, BsFileEarmarkText, BsFolder2Open } from "react-icons/bs";
import { notifySuccess, notifyError } from "../../../../../Shared/utils/notifier.jsx";

const PerencanaanTab = ({ assurance }) => {
  const [kka, setKka] = useState([]);
  const [docs, setDocs] = useState([]);

  const [showModalKka, setShowModalKka] = useState(false);
  const [showModalDoc, setShowModalDoc] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [kkaTemplates, setKkaTemplates] = useState([]);

  const [formKka, setFormKka] = useState({
    uraian: "",
    user_id: "",
    no_kka: "",
    anggaran: "",
    keterangan: "",
  });

  const [docFile, setDocFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");

  useEffect(() => {
    if (assurance?.id) {
      fetchKka();
      fetchDocs();
    }

    fetchUsers();
    fetchTemplates();
  }, [assurance]);

  const fetchKka = async () => {
    try {
      const res = await apiClient.get(
        `/api/assurance/${assurance.id}/kka-perencanaan`,
      );
      setKka(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchDocs = async () => {
    try {
      const res = await apiClient.get(
        `/api/assurance/${assurance.id}/documents`,
      );
      setDocs(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSaveKka = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(
        `/api/assurance/${assurance.id}/kka-perencanaan`,
        formKka,
      );

      setShowModalKka(false);
      setFormKka({
        uraian: "", user_id: "", no_kka: "", anggaran: "", keterangan: "",
      });
      fetchKka();
      notifySuccess("Data KKA berhasil disimpan!");
    } catch (e) {
      console.error(e);
      notifyError("Gagal menyimpan data KKA");
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docFile || !docTitle) {
      notifyError("Judul dan File Dokumen harus diisi!");
      return;
    }

    const form = new FormData();
    form.append("judul", docTitle);
    form.append("file", docFile);

    try {
      await apiClient.post(`/api/assurance/${assurance.id}/documents`, form);
      setShowModalDoc(false);
      setDocFile(null);
      setDocTitle("");
      fetchDocs();
      notifySuccess("Dokumen berhasil diupload!");
    } catch (e) {
      console.error(e);
      notifyError("Upload dokumen gagal");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/api/users");
      setUsersList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Users error:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await apiClient.get("/api/kka-templates");
      setKkaTemplates(res.data.data || res.data || []);
    } catch (err) {
      console.error("Template error:", err);
    }
  };

  const formatNumber = (value) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAnggaranChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setFormKka({ ...formKka, anggaran: raw });
  };

  return (
    <div className="space-y-10 py-4 font-sans">
      
      {/* ================= SECTION: KKA PERENCANAAN ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        {/* Header KKA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/80 border-b border-slate-200 gap-4">
          <div>
            <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BsFileEarmarkText className="text-blue-600" /> KKA Perencanaan
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Daftar Kertas Kerja & Anggaran</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
            >
              <BsPrinter size={14} /> Print
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-200 active:scale-95">
              <BsFileEarmarkCheck size={14} /> Checklist
            </button>
            <button
              onClick={() => setShowModalKka(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95"
            >
              <BsPlusLg size={14} /> Tambah Data
            </button>
          </div>
        </div>

        {/* Tabel KKA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111827] text-white">
              <tr className="uppercase text-[10px] tracking-widest font-bold">
                <th className="p-4 text-center w-16 border-r border-slate-700">No</th>
                <th className="p-4 border-r border-slate-700">Uraian Tugas / Kegiatan</th>
                <th className="p-4 text-slate-300 border-r border-slate-700">Auditor Pelaksana</th>
                <th className="p-4 text-center border-r border-slate-700">No KKA</th>
                <th className="p-4 text-right border-r border-slate-700">Anggaran (IDR)</th>
                <th className="p-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kka.length > 0 ? (
                kka.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-center text-slate-400 font-mono text-xs font-bold bg-slate-50/30 group-hover:bg-transparent border-r border-slate-100">
                      {i + 1}
                    </td>
                    <td className="p-4 font-bold text-slate-700 leading-snug border-r border-slate-100">
                      {item.uraian}
                    </td>
                    <td className="p-4 text-blue-700 font-bold text-xs uppercase tracking-wide border-r border-slate-100">
                      {item.auditor?.name || <span className="text-slate-400 italic">Belum Ditunjuk</span>}
                    </td>
                    <td className="p-4 text-center border-r border-slate-100">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-mono font-black uppercase tracking-widest shadow-sm">
                        {item.no_kka}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-black text-slate-800 bg-slate-50/30 group-hover:bg-transparent border-r border-slate-100">
                      {formatCurrency(item.anggaran)}
                    </td>
                    <td className="p-4 text-slate-500 italic text-xs font-medium leading-snug">
                      {item.keterangan || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <BsFileEarmarkText size={40} className="text-slate-200" />
                      <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Belum Ada Data KKA Perencanaan</p>
                      <button 
                        onClick={() => setShowModalKka(true)}
                        className="mt-2 text-blue-600 text-[11px] font-black uppercase tracking-wider hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors border border-blue-200"
                      >
                        + Tambah Data Sekarang
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= SECTION: DOKUMEN AUDITEE ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        {/* Header Dokumen */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/80 border-b border-slate-200 gap-4">
          <div>
            <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BsFolder2Open className="text-blue-600" /> Dokumen Auditee
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Arsip dokumen referensi pendukung</p>
          </div>

          <button
            onClick={() => setShowModalDoc(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-slate-300 active:scale-95"
          >
            <BsCloudUpload size={16} /> Upload Dokumen
          </button>
        </div>

        {/* Tabel Dokumen */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111827] text-white">
              <tr className="uppercase text-[10px] tracking-widest font-black border-b border-slate-700">
                <th className="p-4 text-center w-16 border-r border-slate-700">No</th>
                <th className="p-4 border-r border-slate-700 text-center">Judul Dokumen</th>
                <th className="p-4 text-center w-32 border-r border-slate-700">Format / Tipe</th>
                <th className="p-4 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.length > 0 ? (
                docs.map((doc, i) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-center text-slate-400 font-mono text-xs font-bold bg-slate-50/30 group-hover:bg-transparent border-r border-slate-100">
                      {i + 1}
                    </td>
                    <td className="p-4 font-bold text-slate-800 border-r border-slate-100 text-center">
                      {doc.judul_dokumen}
                    </td>
                    <td className="p-4 text-center border-r border-slate-100">
                       <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-black uppercase tracking-widest">
                         {doc.file_type || "FILE"}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setPreviewFile(doc)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Lihat File Preview
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <BsFolder2Open size={40} className="text-slate-200" />
                      <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Belum Ada Dokumen Pendukung</p>
                      <button 
                        onClick={() => setShowModalDoc(true)}
                        className="mt-2 text-slate-600 text-[11px] font-black uppercase tracking-wider hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors border border-slate-200"
                      >
                        + Upload Dokumen
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL TAMBAH KKA ================= */}
      {showModalKka && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModalKka(false)}></div>

          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight flex items-center gap-2">
                  <BsFileEarmarkText className="text-blue-600"/> Input KKA Perencanaan
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Isi rincian kertas kerja</p>
              </div>
              <button onClick={() => setShowModalKka(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors">
                <BsX size={28} />
              </button>
            </div>

            <form onSubmit={handleSaveKka} className="p-8 overflow-y-auto space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Uraian Tugas / Kegiatan</label>
                <input
                  required
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                  value={formKka.uraian}
                  onChange={(e) => setFormKka({ ...formKka, uraian: e.target.value })}
                  placeholder="Deskripsikan kegiatan audit..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Anggaran (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">Rp</span>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      className="w-full p-3.5 pl-11 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 text-sm transition-all"
                      value={formatNumber(formKka.anggaran)}
                      onChange={handleAnggaranChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dilaksanakan Oleh (Auditor)</label>
                  <select
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-pointer"
                    value={formKka.user_id}
                    onChange={(e) => setFormKka({ ...formKka, user_id: e.target.value })}
                  >
                    <option value="">-- Pilih Auditor Pelaksana --</option>
                    {usersList.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">No / Template KKA</label>
                  <select
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-pointer uppercase tracking-wider"
                    value={formKka.no_kka}
                    onChange={(e) => setFormKka({ ...formKka, no_kka: e.target.value })}
                  >
                    <option value="">-- Pilih Template KKA --</option>
                    {kkaTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>TEMPLATE ID: {tpl.id}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Keterangan Tambahan</label>
                  <input
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                    value={formKka.keterangan}
                    onChange={(e) => setFormKka({ ...formKka, keterangan: e.target.value })}
                    placeholder="Opsional..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalKka(false)}
                  className="flex-1 py-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 w-[60%] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] uppercase text-xs tracking-widest"
                >
                  Simpan Data KKA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL UPLOAD DOKUMEN ================= */}
      {showModalDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModalDoc(false)}></div>

          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight flex items-center gap-2">
                  <BsCloudUpload className="text-blue-500"/> Upload Dokumen
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Arsip file referensi auditee</p>
              </div>
              <button onClick={() => setShowModalDoc(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors">
                <BsX size={28} />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="p-8 space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Judul / Nama Dokumen</label>
                <input
                  required
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Misal: Laporan Keuangan 2025"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pilih File Dokumen</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setDocFile(e.target.files[0])}
                  />
                  <BsCloudUpload size={32} className="mx-auto text-slate-400 mb-3" />
                  {docFile ? (
                    <p className="text-sm font-bold text-blue-600">{docFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-600">Klik atau drag file ke area ini</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">PDF, DOCX, XLSX Maks 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalDoc(false)}
                  className="flex-1 py-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 w-[60%] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] uppercase text-xs tracking-widest flex justify-center items-center gap-2"
                >
                  <BsCloudUpload size={16}/> Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL PREVIEW FILE ================= */}
      {previewFile && (
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
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Tipe: {previewFile.file_type || 'FILE'} | Fitur Preview</p>
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
      )}

    </div>
  );
};

export default PerencanaanTab;
