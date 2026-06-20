import React, { useEffect, useState } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { BsX, BsPrinter, BsFileEarmarkCheck, BsPlusLg, BsCloudUpload, BsFileEarmarkText, BsFolder2Open, BsTrash, BsEye, BsCheckCircle } from "react-icons/bs";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../../Shared/utils/notifier.jsx";
import { useAuth } from "../../../../../Shared/hooks/useAuth.jsx";

const PerencanaanTab = ({ assurance, onRefresh }) => {
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
    prosedur_audit: "",
    tgl_mulai: "",
    tgl_selesai: "",
  });

  const [docFile, setDocFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("");
  const [docKka, setDocKka] = useState("");
  const [docKeterangan, setDocKeterangan] = useState("");

  const [availableTransitions, setAvailableTransitions] = useState([]);
  const { user: authData } = useAuth();

  const fetchTransitions = async () => {
    try {
      const res = await apiClient.get(`/api/assurance/${assurance?.id}/transitions`);
      setAvailableTransitions(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (assurance?.id) {
      fetchKka();
      fetchDocs();
      fetchTransitions();
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
        uraian: "",
        user_id: "",
        no_kka: "",
        anggaran: "",
        keterangan: "",
        prosedur_audit: "",
        tgl_mulai: "",
        tgl_selesai: "",
      });
      fetchKka();
      notifySuccess("Data KKA berhasil disimpan!");
    } catch (e) {
      console.error(e);
      notifyError("Gagal menyimpan data KKA");
    }
  };

  const handleDeleteKka = (id) => {
    notifyConfirm(
      "Apakah Anda yakin ingin menghapus data KKA ini?",
      async () => {
        try {
          await apiClient.delete(`/api/kka-perencanaan/${id}`);
          fetchKka();
          notifySuccess("Data KKA berhasil dihapus!");
        } catch (e) {
          console.error(e);
          notifyError("Gagal menghapus data KKA");
        }
      },
      null,
      {
        title: "Hapus KKA",
        confirmText: "Hapus",
        confirmColor: "bg-rose-600",
        confirmHoverColor: "hover:bg-rose-700",
        iconColor: "bg-rose-500",
        iconShadow: "shadow-rose-100",
      }
    );
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
    form.append("tipe_dokumen", docType);
    form.append("terkait_kka", docKka);
    form.append("keterangan", docKeterangan);

    try {
      await apiClient.post(`/api/assurance/${assurance.id}/documents`, form);
      setShowModalDoc(false);
      setDocFile(null);
      setDocTitle("");
      setDocType("");
      setDocKka("");
      setDocKeterangan("");
      fetchDocs();
      notifySuccess("Dokumen berhasil diupload!");
    } catch (e) {
      console.error(e);
      notifyError("Upload dokumen gagal");
    }
  };

  const handleDeleteDoc = (id) => {
    notifyConfirm(
      "Apakah Anda yakin ingin menghapus dokumen ini?",
      async () => {
        try {
          await apiClient.delete(`/api/documents/${id}`);
          fetchDocs();
          notifySuccess("Dokumen berhasil dihapus!");
        } catch (e) {
          console.error(e);
          notifyError("Gagal menghapus dokumen");
        }
      },
      null,
      {
        title: "Hapus Dokumen",
        confirmText: "Hapus",
        confirmColor: "bg-rose-600",
        confirmHoverColor: "hover:bg-rose-700",
        iconColor: "bg-rose-500",
        iconShadow: "shadow-rose-100",
      }
    );
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

  const getTeamList = () => {
    const list = [];
    
    const addToList = (val) => {
      if (!val) return;
      if (typeof val === 'string') {
        list.push(val);
      } else if (typeof val === 'object') {
        if (val.name) list.push(val.name);
        else if (val.username) list.push(val.username);
        else if (val.id) list.push(String(val.id));
      } else if (typeof val === 'number') {
        list.push(String(val));
      }
    };

    addToList(assurance?.koordinator);
    addToList(assurance?.pengendali_teknis);
    addToList(assurance?.ketua);
    
    if (assurance?.auditors && Array.isArray(assurance.auditors)) {
      assurance.auditors.forEach(a => addToList(a));
    }
    
    if (assurance?.auditor) {
      if (Array.isArray(assurance.auditor)) {
        assurance.auditor.forEach(a => addToList(a));
      } else if (typeof assurance.auditor === 'string') {
        assurance.auditor.split(',').forEach(a => {
          const clean = a.trim();
          if (clean) list.push(clean);
        });
      } else if (typeof assurance.auditor === 'object') {
        addToList(assurance.auditor);
      }
    }
    return [...new Set(list)];
  };

  const registeredTeam = usersList.filter(user => 
    getTeamList().some(member => {
      if (!member || !user) return false;
      const memberStr = String(member).toLowerCase();
      const userNameStr = String(user.name || '').toLowerCase();
      const userIdStr = String(user.id || '').toLowerCase();
      return memberStr === userNameStr || memberStr === userIdStr;
    })
  );

  const auditorOptions = registeredTeam.length > 0 ? registeredTeam : usersList;

  const formatPeriod = (start, end) => {
    if (!start || !end) return "-";
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
      "Jul", "Agt", "Sep", "Okt", "Nov", "Des"
    ];
    const sDate = new Date(start);
    const eDate = new Date(end);
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) return "-";
    
    const sDay = String(sDate.getDate()).padStart(2, '0');
    const sMonth = months[sDate.getMonth()];
    const eDay = String(eDate.getDate()).padStart(2, '0');
    const eMonth = months[eDate.getMonth()];
    
    if (sMonth === eMonth) {
      return `${sDay}–${eDay} ${sMonth}`;
    }
    return `${sDay} ${sMonth} – ${eDay} ${eMonth}`;
  };

  const totalAnggaran = kka.reduce((acc, item) => acc + Number(item.anggaran || 0), 0);

  const isKkaLengkap = kka.length > 0;
  const isAnggaranSesuai = kka.length > 0 && totalAnggaran <= Number(assurance?.estimasi_anggaran || assurance?.anggaran || totalAnggaran);
  const isDocUploaded = docs.length > 0;
  const fulfilledCount = [isKkaLengkap, isAnggaranSesuai, isDocUploaded].filter(Boolean).length;

  return (
    <div className="space-y-5 font-sans">
      
      {/* ================= SECTION: KKA PERENCANAAN ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        {/* Header KKA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/80 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <BsFileEarmarkText className="text-blue-600" /> KKA Perencanaan
              </h2>
              <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                IIA Std. 2240
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Daftar kertas kerja & alokasi anggaran per tugas</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <BsPrinter size={14} /> Print
            </button>
            <button
              onClick={() => setShowModalKka(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95 cursor-pointer"
            >
              <BsPlusLg size={14} /> Tambah KKA
            </button>
          </div>
        </div>

        {/* Tabel KKA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111827] text-white">
              <tr className="uppercase text-[10px] tracking-widest font-bold border-b border-slate-800">
                <th className="p-4 text-center w-16 border-r border-slate-700">No</th>
                <th className="p-4 border-r border-slate-700">Uraian Tugas / Kegiatan</th>
                <th className="p-4 text-slate-300 border-r border-slate-700">Auditor Pelaksana</th>
                <th className="p-4 text-center w-24 border-r border-slate-700">No KKA</th>
                <th className="p-4 text-center w-36 border-r border-slate-700">Template</th>
                <th className="p-4 text-center w-36 border-r border-slate-700">Periode KKA</th>
                <th className="p-4 text-right w-44 border-r border-slate-700">Anggaran (IDR)</th>
                <th className="p-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kka.length > 0 ? (
                kka.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-center text-slate-400 font-mono text-xs font-bold bg-slate-50/30 group-hover:bg-transparent border-r border-slate-100">
                      {i + 1}
                    </td>
                    <td className="p-4 border-r border-slate-100">
                      <div className="font-bold text-slate-700 leading-snug">{item.uraian}</div>
                      {item.prosedur_audit && (
                        <div className="text-[10px] text-slate-400 mt-1 font-medium italic leading-relaxed">
                          Prosedur: {item.prosedur_audit}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-blue-700 font-bold text-xs uppercase tracking-wide border-r border-slate-100 text-center">
                      {item.auditor?.name || <span className="text-slate-400 italic">Belum Ditunjuk</span>}
                    </td>
                    <td className="p-4 text-center border-r border-slate-100 font-bold text-slate-700 font-mono text-xs">
                      {i + 1}
                    </td>
                    <td className="p-4 text-center border-r border-slate-100">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-mono font-black uppercase tracking-widest shadow-sm">
                        {item.no_kka}
                      </span>
                    </td>
                    <td className="p-4 text-center border-r border-slate-100 font-semibold text-slate-600 text-xs">
                      {formatPeriod(item.tgl_mulai, item.tgl_selesai)}
                    </td>
                    <td className="p-4 text-right font-mono font-black text-slate-800 bg-slate-50/30 group-hover:bg-transparent border-r border-slate-100">
                      {formatCurrency(item.anggaran)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteKka(item.id)}
                        className="w-8 h-8 rounded-lg border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-200 flex items-center justify-center mx-auto active:scale-95 cursor-pointer"
                        title="Hapus KKA"
                      >
                        <BsTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-slate-400">
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
              {/* Total Anggaran Footer Row */}
              {kka.length > 0 && (
                <tr className="bg-slate-50/50 font-black text-slate-800 border-t border-slate-200">
                  <td colSpan="6" className="p-4 text-right text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                    Total anggaran KKA:
                  </td>
                  <td className="p-4 text-right font-mono text-sm font-black text-slate-900 border-l border-slate-100">
                    {formatCurrency(totalAnggaran)}
                  </td>
                  <td className="p-4"></td>
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
              <BsFolder2Open className="text-blue-600" /> Dokumen auditee
              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black rounded-full uppercase tracking-wider">IIA Std. 2310</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Arsip dokumen referensi pendukung audit</p>
          </div>

          <button
            onClick={() => setShowModalDoc(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border border-slate-700"
          >
            <BsCloudUpload size={16} /> Upload dokumen
          </button>
        </div>

        {/* Tabel Dokumen */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111827] text-white">
              <tr className="uppercase text-[10px] tracking-widest font-black border-b border-slate-700">
                <th className="p-4 text-center w-16 border-r border-slate-800">No</th>
                <th className="p-4 border-r border-slate-800">Judul Dokumen</th>
                <th className="p-4 text-center w-48 border-r border-slate-800">
                  Tipe Dokumen
                </th>
                <th className="p-4 text-center w-48 border-r border-slate-800">
                  Terkait KKA
                </th>
                <th className="p-4 text-center w-36 border-r border-slate-800">Format</th>
                <th className="p-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.length > 0 ? (
                docs.map((doc, i) => {
                  // Determine badge colors dynamically
                  const getDocTypeBadge = (type) => {
                    const t = String(type || '').toLowerCase();
                    if (t.includes('it') || t.includes('informasi') || t.includes('teknologi')) {
                      return "bg-sky-50 text-sky-700 border border-sky-200";
                    }
                    if (t.includes('keuangan') || t.includes('fin') || t.includes('anggaran') || t.includes('akuntansi')) {
                      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
                    }
                    if (t.includes('sop') || t.includes('prosedur') || t.includes('instruksi')) {
                      return "bg-amber-50 text-amber-700 border border-amber-200";
                    }
                    if (t.includes('kontrak') || t.includes('perjanjian') || t.includes('mou')) {
                      return "bg-purple-50 text-purple-700 border border-purple-200";
                    }
                    if (t.includes('kebijakan') || t.includes('sk') || t.includes('regulasi')) {
                      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
                    }
                    return "bg-slate-50 text-slate-700 border border-slate-200";
                  };

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 text-center text-slate-400 font-mono text-xs font-bold bg-slate-50/30 group-hover:bg-transparent border-r border-slate-100">
                        {i + 1}
                      </td>
                      <td className="p-4 font-bold text-slate-800 border-r border-slate-100">
                        {doc.judul_dokumen}
                      </td>
                      <td className="p-4 text-center border-r border-slate-100">
                         <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${getDocTypeBadge(doc.tipe_dokumen)}`}>
                           {doc.tipe_dokumen || "Lainnya"}
                         </span>
                      </td>
                      <td className="p-4 text-center border-r border-slate-100">
                        {doc.terkait_kka ? (
                          <span className="font-mono font-black text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {doc.terkait_kka}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center border-r border-slate-100">
                         <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full font-bold text-xs uppercase">
                           {doc.file_type || "FILE"}
                         </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => setPreviewFile(doc)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg hover:text-blue-600 transition-all active:scale-95 cursor-pointer"
                            title="Lihat Preview"
                          >
                            <BsEye size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all active:scale-95 cursor-pointer"
                            title="Hapus Dokumen"
                          >
                            <BsTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-slate-400">
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

      {/* ================= SECTION: CHECKLIST PENYELESAIAN ================= */}
      {Number(assurance.id_status_pemeriksaan) === 1 ? (
        <div className="bg-slate-50/50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-slate-700 shadow-sm mt-6 transition-colors">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-slate-800 text-sm uppercase tracking-tight">
            <BsFileEarmarkCheck size={18} className="text-blue-600" /> Checklist Penyelesaian — syarat sebelum aktif
          </h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
              {isKkaLengkap ? <BsCheckCircle size={18} className="text-emerald-500" /> : <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-amber-500" />}
              Minimal 1 KKA sudah diisi lengkap (uraian + auditor + periode)
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
              {isAnggaranSesuai ? <BsCheckCircle size={18} className="text-emerald-500" /> : <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-amber-500" />}
              Total anggaran KKA tidak melebihi estimasi registrasi
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
              {isDocUploaded ? <BsCheckCircle size={18} className="text-emerald-500" /> : <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-amber-500" />}
              Minimal 1 dokumen auditee sudah diupload
            </li>
          </ul>
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{fulfilledCount} dari 3 syarat terpenuhi</span>
            
            <div className="flex gap-2">
              {availableTransitions.map((tr, index) => {
                const isApprove = tr.action === "approve";
                const isDisabled = isApprove && fulfilledCount < 3;
                return (
                  <button 
                    key={index}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      notifyConfirm(
                        `Apakah Anda yakin ingin menyelesaikan perencanaan dan ${tr.label}?`,
                        async () => {
                          try {
                            const res = await apiClient.post(`/api/assurance/${assurance.id}/transition`, {
                              action: tr.action,
                              next_status_id: tr.next_status_id
                            });
                            if (res.data.success) {
                              notifySuccess(res.data.message);
                              if (onRefresh) onRefresh();
                            }
                          } catch (err) {
                            notifyError(err.response?.data?.message || "Gagal melakukan transisi");
                          }
                        },
                        null,
                        {
                          title: "Konfirmasi Pengajuan",
                          confirmText: tr.label,
                          confirmColor: isApprove ? "bg-emerald-600" : "bg-rose-600",
                          confirmHoverColor: isApprove ? "hover:bg-emerald-700" : "hover:bg-rose-700",
                          iconColor: isApprove ? "bg-emerald-500" : "bg-rose-500",
                          iconShadow: isApprove ? "shadow-emerald-100" : "shadow-rose-100",
                        }
                      );
                    }}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all active:scale-95 ${
                      isDisabled 
                        ? "bg-slate-400 text-white cursor-not-allowed opacity-50 shadow-none" 
                        : isApprove 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 cursor-pointer" 
                          : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 cursor-pointer"
                    }`}
                  >
                    <BsFileEarmarkCheck size={15} /> {tr.label}
                  </button>
                );
              })}
              {availableTransitions.length === 0 && (
                <span className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  Menunggu Checklist dari Kepala SPI
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-800 shadow-sm mt-6 flex items-center gap-4 animate-in fade-in duration-300">
          <BsCheckCircle size={24} className="text-emerald-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider">Perencanaan Telah Diselesaikan</h4>
            <p className="text-xs text-emerald-600 mt-1">
              Tahap perencanaan untuk kegiatan ini telah rampung dan disetujui. Saat ini penugasan sedang berjalan di tahap pemeriksaan lapangan.
            </p>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH KKA ================= */}
      {showModalKka && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModalKka(false)}></div>

          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="p-6 border-b border-blue-100/50 flex justify-between items-center bg-blue-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl ring-4 ring-blue-50">
                  <BsFileEarmarkText size={22} />
                </div>
                <div>
                  <h3 className="font-black text-blue-900 text-lg uppercase tracking-tight">Input KKA Perencanaan</h3>
                  <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">
                    Isi rincian kertas kerja — audit: {assurance?.nama_kegiatan || 'Assurance'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModalKka(false)} className="p-2 text-blue-400 hover:text-blue-700 hover:bg-blue-100/50 rounded-xl transition-all cursor-pointer">
                <BsX size={26} />
              </button>
            </div>

            <form onSubmit={handleSaveKka} className="p-8 overflow-y-auto space-y-6">
              
              {/* No/Template KKA & Auditor pelaksana */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      No / Template KKA <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <select
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all cursor-pointer"
                    value={formKka.no_kka}
                    onChange={(e) => setFormKka({ ...formKka, no_kka: e.target.value })}
                  >
                    <option value="">-- Pilih Template KKA --</option>
                    {kkaTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.id} — {tpl.nama}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 font-medium ml-1">Pilih template sesuai jenis audit — nama bermakna bukan ID angka</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Auditor pelaksana <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">dari tim terdaftar</span>
                  </div>
                  <select
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all cursor-pointer"
                    value={formKka.user_id}
                    onChange={(e) => setFormKka({ ...formKka, user_id: e.target.value })}
                  >
                    <option value="">-- Pilih Anggota Tim --</option>
                    {auditorOptions.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 font-medium ml-1">Hanya menampilkan anggota tim yang sudah didaftarkan di registrasi</p>
                </div>
              </div>

              {/* Uraian tugas / kegiatan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Uraian tugas / kegiatan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all resize-none leading-relaxed"
                  value={formKka.uraian}
                  onChange={(e) => setFormKka({ ...formKka, uraian: e.target.value })}
                  placeholder="Deskripsikan kegiatan audit secara spesifik..."
                />
                <p className="text-[9px] text-slate-400 font-medium ml-1">Deskripsikan kegiatan audit secara spesifik — akan menjadi judul KKA di laporan</p>
              </div>

              {/* Prosedur audit (optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Prosedur audit</label>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">opsional — direkomendasikan</span>
                </div>
                <textarea
                  rows={2}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all resize-none leading-relaxed"
                  value={formKka.prosedur_audit}
                  onChange={(e) => setFormKka({ ...formKka, prosedur_audit: e.target.value })}
                  placeholder="Langkah-langkah teknis yang dilakukan auditor untuk KKA ini. Contoh: sampling 30 hari terakhir, uji restore 3 titik waktu berbeda..."
                />
                <p className="text-[9px] text-slate-400 font-medium ml-1">Dicatat sebagai sub-teks di tabel KKA — membantu auditor saat pelaksanaan</p>
              </div>

              {/* Periode KKA & Anggaran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Periode KKA <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      required
                      type="date"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all cursor-pointer"
                      value={formKka.tgl_mulai}
                      onChange={(e) => setFormKka({ ...formKka, tgl_mulai: e.target.value })}
                    />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">s/d</span>
                    <input
                      required
                      type="date"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all cursor-pointer"
                      value={formKka.tgl_selesai}
                      onChange={(e) => setFormKka({ ...formKka, tgl_selesai: e.target.value })}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium ml-1">Jadwal pelaksanaan KKA ini — harus dalam rentang periode audit di registrasi</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Anggaran (IDR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">Rp</span>
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
                  <p className="text-[9px] text-slate-400 font-medium ml-1">Estimasi biaya untuk KKA ini — total semua KKA tidak boleh melebihi anggaran registrasi</p>
                </div>
              </div>

              {/* Keterangan tambahan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Keterangan tambahan</label>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">opsional</span>
                </div>
                <input
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all"
                  value={formKka.keterangan}
                  onChange={(e) => setFormKka({ ...formKka, keterangan: e.target.value })}
                  placeholder="Fokuskan pengujian pada log backup periode Kuartal 1 2026..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs font-semibold text-blue-900 flex flex-col gap-1.5">
                <span className="font-extrabold uppercase tracking-widest text-[9px] text-blue-600">Info Form Perencanaan KKA:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 font-medium">
                  <li><strong className="text-blue-900 font-bold">Template KKA:</strong> Menggunakan nama bermakna dan kode KKA yang terstandarisasi.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalKka(false)}
                  className="flex-1 py-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-xs uppercase tracking-wider active:scale-98 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 w-[60%] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] uppercase text-xs tracking-widest cursor-pointer"
                >
                  Simpan KKA
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

          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="p-6 border-b border-blue-100/50 flex justify-between items-center bg-blue-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl ring-4 ring-blue-50">
                  <BsCloudUpload size={22} />
                </div>
                <div>
                  <h3 className="font-black text-blue-900 text-lg uppercase tracking-tight">Upload Dokumen Auditee</h3>
                  <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">
                    Arsip file referensi pendukung — audit: {assurance?.nama_kegiatan || 'Assurance'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModalDoc(false)} className="p-2 text-blue-400 hover:text-blue-700 hover:bg-blue-100/50 rounded-xl transition-all cursor-pointer">
                <BsX size={26} />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="p-8 overflow-y-auto space-y-6">
              
              {/* Judul / nama dokumen */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Judul / nama dokumen <span className="text-rose-500">*</span>
                  </label>
                </div>
                <input
                  required
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Misal: Log Report Backup Server Utama — Q1 2026"
                />
                <p className="text-[9px] text-slate-400 font-medium ml-1">Nama yang deskriptif — akan muncul di tabel dokumen</p>
              </div>

              {/* Tipe dokumen & Terkait KKA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Tipe dokumen <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all cursor-pointer"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="">-- Pilih Tipe --</option>
                    <option value="Laporan Keuangan">Laporan Keuangan</option>
                    <option value="Laporan IT">Laporan IT</option>
                    <option value="SOP">SOP</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Kebijakan">Kebijakan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <p className="text-[9px] text-slate-400 font-medium ml-1">Laporan Keuangan / Laporan IT / SOP / Kontrak / Kebijakan / Lainnya</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Terkait KKA <span className="text-slate-400 font-bold">(opsional)</span>
                  </label>
                  <select
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all cursor-pointer"
                    value={docKka}
                    onChange={(e) => setDocKka(e.target.value)}
                  >
                    <option value="">— Pilih KKA terkait —</option>
                    {kka.map((k) => (
                      <option key={k.id} value={k.no_kka}>
                        {k.no_kka} — {k.uraian}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 font-medium ml-1">Dokumen ini relevan untuk KKA nomor berapa — memudahkan auditor filter</p>
                </div>
              </div>

              {/* File dokumen dropzone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  File dokumen <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:bg-slate-50 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setDocFile(e.target.files[0])}
                  />
                  <BsCloudUpload size={36} className="mx-auto text-slate-400 mb-3" />
                  {docFile ? (
                    <p className="text-sm font-bold text-blue-600">{docFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-600">Klik atau seret file ke sini</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">PDF, DOCX, XLSX, PNG, JPG — maks. 10 MB</p>
                    </>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-medium ml-1">Satu dokumen per upload — bisa upload beberapa kali untuk dokumen berbeda</p>
              </div>

              {/* Keterangan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Keterangan <span className="text-slate-400 font-bold">(opsional)</span>
                  </label>
                </div>
                <input
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 text-sm transition-all"
                  value={docKeterangan}
                  onChange={(e) => setDocKeterangan(e.target.value)}
                  placeholder="Catatan singkat tentang dokumen ini..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalDoc(false)}
                  className="flex-1 py-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-xs uppercase tracking-wider active:scale-98 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 w-[60%] py-4 bg-[#111827] text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest flex justify-center items-center gap-2 cursor-pointer"
                >
                  <BsCloudUpload size={16}/> Upload Dokumen
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
