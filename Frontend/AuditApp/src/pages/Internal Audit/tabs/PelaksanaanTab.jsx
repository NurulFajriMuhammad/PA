import React, { useEffect, useState, useRef } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { BsX, BsTrash, BsPencilSquare, BsPlusLg, BsCloudUpload, BsFileEarmarkText, BsWallet2, BsCardChecklist, BsCollection, BsPencil, BsCalendarCheck, BsLock } from "react-icons/bs";
import { notifySuccess, notifyError, notifyConfirm } from "@shared/utils/notifier.jsx";
import { useAuth } from "../../../../../Shared/hooks/useAuth.jsx";

const PelaksanaanTab = ({ assurance, onRefresh }) => {
  const [kka, setKka] = useState([]);
  const [selectedKka, setSelectedKka] = useState(null);
  const [showTemuanModal, setShowTemuanModal] = useState(false);
  const [showTambahTemuan, setShowTambahTemuan] = useState(false);
  const [temuan, setTemuan] = useState([]);
  const [lheFile, setLheFile] = useState(null);
  const [existingLhe, setExistingLhe] = useState(null);
  const [editTemuan, setEditTemuan] = useState(null);
  const [existingLampiran, setExistingLampiran] = useState(null);
  const [biaya, setBiaya] = useState([]);
  const [showTambahBiaya, setShowTambahBiaya] = useState(false);
  const [showDetailTemuan, setShowDetailTemuan] = useState(false);
  const [selectedTemuan, setSelectedTemuan] = useState(null);
  const [editBiaya, setEditBiaya] = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const buktiInputRef = useRef(null);

  const [formTemuan, setFormTemuan] = useState({
    kategori: "",
    halaman_lhe: "",
    masalah: "",
    rekomendasi: "",
    kondisi: "",
    kriteria: "",
    sebab: "",
    akibat: "",
    klarifikasi_temuan: "",
    area: "",
    referensi: "",
    target_selesai: "",
    nilai_kerugian: "",
    lampiran: null,
  });

  const resetFormTemuan = () => {
    setFormTemuan({
      kategori: "", halaman_lhe: "", masalah: "", rekomendasi: "", kondisi: "", kriteria: "",
      sebab: "", akibat: "", klarifikasi_temuan: "", area: "", referensi: "",
      target_selesai: "", nilai_kerugian: "", lampiran: null,
    });
  };

  const [formBiaya, setFormBiaya] = useState({
    kka_id: "",
    nama: "",
    jenis_akomodasi: "",
    nilai_realisasi: "",
    pelaksana: "",
    tgl_realisasi: "",
    bukti: "",
  });

  const fetchBiaya = async () => {
    try {
      const res = await apiClient.get(`/api/assurance/${assurance.id}/biaya`);
      setBiaya(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const [availableTransitions, setAvailableTransitions] = useState([]);
  const { user: authData } = useAuth();
  const userRole = authData?.user?.roles?.[0]?.name || "";
  const isPengendaliTeknis = userRole.toLowerCase() === "pengendali teknis";
  const isAuditor = userRole.toLowerCase() === "auditor" || userRole.toLowerCase() === "administrator audit";
  const isAssignedAuditor = selectedKka ? Number(authData?.user?.id) === Number(selectedKka.user_id) : false;

  const isAuditClosed = ["selesai", "closed", "close"].includes(String(assurance?.status_label || assurance?.status_pemeriksaan?.nama || "").toLowerCase());

  const fetchTransitions = async () => {
    try {
      const res = await apiClient.get(`/api/assurance/${assurance?.id}/transitions`);
      setAvailableTransitions(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchKka();
    fetchBiaya();
    fetchTransitions();
  }, [assurance]);

  const fetchKka = async () => {
    try {
      const res = await apiClient.get(`/api/assurance/${assurance.id}/kka-pelaksanaan`);
      setKka(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const openDetailTemuan = async (item) => {
    setSelectedKka(item);
    setShowTemuanModal(true);

    try {
      const res = await apiClient.get(`/api/kka/${item.id}/temuan`);
      setTemuan(res.data.data || []);
      const lhe = await apiClient.get(`/api/kka/${item.id}/lhe`);
      setExistingLhe(lhe.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadLHE = async (e) => {
    e.preventDefault();
    if (!lheFile) return notifyError("Pilih file LHE terlebih dahulu");

    const form = new FormData();
    form.append("file", lheFile);

    try {
      await apiClient.post(`/api/kka/${selectedKka.id}/upload-lhe`, form);
      notifySuccess("File LHE berhasil diupload");
      setLheFile(null); 
      
      const lhe = await apiClient.get(`/api/kka/${selectedKka.id}/lhe`);
      setExistingLhe(lhe.data.data);
      fetchKka(); 
    } catch (e) {
      console.error(e);
      notifyError("Gagal upload LHE");
    }
  };

  const formatRupiah = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  const getKategoriBadge = (kat) => {
    const lower = (kat || "").toLowerCase();
    if (lower === "major") {
      return <span className="inline-block px-2.5 py-0.5 bg-red-950/50 text-red-400 border border-red-800/40 rounded font-black uppercase text-[9px] tracking-wider">Major</span>;
    } else if (lower === "minor") {
      return <span className="inline-block px-2.5 py-0.5 bg-amber-950/50 text-amber-400 border border-amber-800/40 rounded font-black uppercase text-[9px] tracking-wider">Minor</span>;
    } else if (lower === "observasi") {
      return <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-black uppercase text-[9px] tracking-wider">Observasi</span>;
    } else if (lower === "ofi") {
      return <span className="inline-block px-2.5 py-0.5 bg-blue-950/50 text-blue-400 border border-blue-800/40 rounded font-black uppercase text-[9px] tracking-wider">OFI</span>;
    }
    return <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded font-black uppercase text-[9px] tracking-wider">—</span>;
  };

  const handleUploadLHEDirectly = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);

    try {
      await apiClient.post(`/api/kka/${selectedKka.id}/upload-lhe`, form);
      notifySuccess("File LHE berhasil diupload");
      
      const lhe = await apiClient.get(`/api/kka/${selectedKka.id}/lhe`);
      setExistingLhe(lhe.data.data);
      fetchKka(); 
    } catch (e) {
      console.error(e);
      notifyError("Gagal upload LHE");
    }
  };

  const handleSaveTemuan = async (e) => {
    e.preventDefault();
    const form = new FormData();

    Object.keys(formTemuan).forEach((key) => {
      const value = formTemuan[key];
      if (value !== null && value !== "" && key !== "lampiran") {
        form.append(key, value);
      }
    });

    form.append("kka_id", selectedKka.id);

    if (formTemuan.lampiran) {
      form.append("lampiran", formTemuan.lampiran);
    }

    try {
      if (editTemuan) {
        await apiClient.post(`/api/temuan/${editTemuan.id}?_method=PUT`, form);
      } else {
        await apiClient.post(`/api/kka/${selectedKka.id}/temuan`, form);
      }
      
      resetFormTemuan();
      setEditTemuan(null);
      setShowTambahTemuan(false);
      fetchTemuan();
      fetchKka(); 
      notifySuccess("Temuan berhasil disimpan");
    } catch (err) {
      console.error("ERROR BACKEND:", err.response?.data);
      notifyError("Gagal menyimpan temuan");
    }
  };

  const fetchTemuan = async () => {
    try {
      const res = await apiClient.get(`/api/kka/${selectedKka.id}/temuan`);
      setTemuan(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const closeModal = () => {
    setShowTemuanModal(false);
    fetchKka();
  };

  const handleDeleteLhe = () => {
    notifyConfirm("Hapus file LHE?", async () => {
      try {
        await apiClient.delete(`/api/kka/${selectedKka.id}/lhe`);
        setExistingLhe(null);
        fetchKka();
        notifySuccess("File LHE berhasil dihapus");
      } catch (e) {
        console.error(e);
        notifyError("Gagal menghapus LHE");
      }
    });
  };

  const handleBuktiChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        notifyError("Ukuran file maksimal 5 MB");
        return;
      }
      setBuktiFile(file);
    }
  };

  const handleSaveBiaya = async (e) => {
    e.preventDefault();

    if (!editBiaya && !buktiFile) {
      notifyError("Bukti / kwitansi wajib diupload (IIA Std. 2330)");
      return;
    }

    const form = new FormData();
    form.append("kka_id", formBiaya.kka_id);
    form.append("nama", formBiaya.nama);
    form.append("jenis_akomodasi", formBiaya.jenis_akomodasi);
    form.append("nilai_realisasi", formBiaya.nilai_realisasi);
    form.append("pelaksana", formBiaya.pelaksana);
    form.append("tgl_realisasi", formBiaya.tgl_realisasi);

    if (buktiFile) {
      form.append("bukti", buktiFile);
    }

    try {
      if (editBiaya) {
        form.append("_method", "PUT");
        await apiClient.post(`/api/biaya/${editBiaya.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await apiClient.post(`/api/biaya`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setShowTambahBiaya(false);
      setEditBiaya(null);
      setBuktiFile(null);
      setFormBiaya({ kka_id: "", nama: "", jenis_akomodasi: "", nilai_realisasi: "", pelaksana: "", tgl_realisasi: "", bukti: "" });
      fetchBiaya();
      notifySuccess("Biaya berhasil disimpan");
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Gagal simpan biaya");
    }
  };

  const handleDeleteTemuan = (id) => {
    notifyConfirm("Hapus temuan?", async () => {
      try {
        await apiClient.delete(`/api/temuan/${id}`);
        fetchTemuan();
        fetchKka();
        notifySuccess("Temuan berhasil dihapus");
      } catch (e) {
        console.error(e);
        notifyError("Gagal menghapus temuan");
      }
    });
  };

  const handleDeleteBiaya = (id) => {
    notifyConfirm("Hapus biaya?", async () => {
      try {
        await apiClient.delete(`/api/biaya/${id}`);
        fetchBiaya();
        notifySuccess("Biaya berhasil dihapus");
      } catch (e) {
        console.error(e);
        notifyError("Gagal menghapus biaya");
      }
    });
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return "-";
    try {
      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${start} - ${end}`;
      
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      
      const sDay = s.getDate();
      const sMonth = months[s.getMonth()];
      const sYear = s.getFullYear();
      
      const eDay = e.getDate();
      const eMonth = months[e.getMonth()];
      const eYear = e.getFullYear();
      
      if (sYear === eYear) {
        if (sMonth === eMonth) {
          return `${String(sDay).padStart(2, '0')} – ${String(eDay).padStart(2, '0')} ${sMonth} ${sYear}`;
        }
        return `${String(sDay).padStart(2, '0')} ${sMonth} – ${String(eDay).padStart(2, '0')} ${eMonth} ${sYear}`;
      }
      return `${String(sDay).padStart(2, '0')} ${sMonth} ${sYear} – ${String(eDay).padStart(2, '0')} ${eMonth} ${eYear}`;
    } catch (err) {
      return `${start} - ${end}`;
    }
  };

  const getSeveritySummary = (temuanArray) => {
    if (!temuanArray || temuanArray.length === 0) return "";
    
    const counts = {};
    temuanArray.forEach(t => {
      const cat = t.kategori || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const summaryParts = [];
    const order = ['Major', 'Minor', 'Observasi', 'OFI', 'Uncategorized'];
    
    order.forEach(cat => {
      if (counts[cat]) {
        summaryParts.push(`${counts[cat]} ${cat.toUpperCase()}`);
      }
    });

    return summaryParts.join(' · ');
  };

  const jenisAkomodasiList = [
    "transportasi_darat", "transportasi_udara", "transportasi_laut", "penginapan",
    "konsumsi", "uang_harian", "sewa_kendaraan", "bbm", "toll_parkir",
    "atk", "cetak_dokumen", "jasa_profesional", "lainnya",
  ];

  return (
    <div className="space-y-5 font-sans">
      
      {/* ====================== DAFTAR PEMERIKSAAN ====================== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border-b border-slate-100 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
                          <BsFileEarmarkText className="text-blue-600" /> Daftar pemeriksaan KKA
                        </h2>
                        <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          IIA Std. 2300
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Upload LHE dan input temuan per KKA</p>
                    </div>

          <div className="flex items-center gap-2">
            {(() => {
              const allLheApproved = kka.length > 0 && kka.every(item => item.lhe_status === "disetujui");
              return (
                <>
                  {availableTransitions.map((tr, index) => {
                    const isApprove = tr.action === "approve";
                    const isDisabled = isApprove && !allLheApproved;
                    return (
                      <button 
                        key={index}
                        disabled={isDisabled}
                        onClick={async () => {
                          if (isDisabled) return;
                          notifyConfirm(`Apakah Anda yakin ingin menyelesaikan pelaksanaan dan ${tr.label}?`, async () => {
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
                          });
                        }}
                        className={`flex items-center justify-center gap-2 px-4 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95 ${
                          isDisabled 
                            ? "bg-slate-400 text-white cursor-not-allowed opacity-50 shadow-none" 
                            : isApprove 
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 cursor-pointer" 
                              : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 cursor-pointer"
                        }`}
                        title={isDisabled ? "Semua LHE harus disetujui terlebih dahulu" : tr.label}
                      >
                        <BsCardChecklist size={14} /> {tr.label}
                      </button>
                    );
                  })}
                  {availableTransitions.length === 0 && (
                    <span className={`text-[10px] font-black px-3.5 py-2 rounded-lg uppercase tracking-widest border shadow-sm ${
                      assurance?.status_label === 'Monev'
                        ? 'text-white bg-amber-500 border-amber-600 shadow-amber-200/50'
                        : assurance?.status_label === 'Selesai'
                        ? 'text-white bg-emerald-600 border-emerald-700 shadow-emerald-200/50'
                        : 'text-white bg-rose-600 border-rose-700 shadow-rose-200/50'
                    }`}>
                      {assurance?.status_label === 'Monev' 
                        ? 'Pengisian Analisis Penyebab' 
                        : assurance?.status_label === 'Selesai'
                        ? 'Pemeriksaan Selesai'
                        : 'Menunggu checklist dari role berwenang'}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#151b2b] text-white">
              <tr className="uppercase text-[10px] tracking-widest font-black border-b border-slate-700">
                <th className="py-4 px-4 text-center w-16 border-r border-slate-800">No</th>
                <th className="py-4 px-5 border-r border-slate-800">Uraian Tugas / KKA</th>
                <th className="py-4 px-4 border-r border-slate-800 text-center w-48 text-[#93c5fd]">Dilaksanakan Oleh</th>
                <th className="py-4 px-4 border-r border-slate-800 text-center w-28">No KKA</th>
                <th className="py-4 px-4 border-r border-slate-800 text-center w-52">File LHE</th>
                <th className="py-4 px-4 border-r border-slate-800 text-center w-52">Temuan</th>
                <th className="py-4 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {kka.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/85 transition-colors group align-middle">
                  <td className="py-4 px-4 text-center text-slate-400 font-mono text-[13px] font-bold border-r border-slate-100 bg-slate-50/20">
                    {index + 1}
                  </td>
                  <td className="py-4 px-5 border-r border-slate-100">
                    <div className="font-bold text-slate-800 text-[13px] leading-snug">
                      {item.uraian}
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      {formatDateRange(item.tgl_mulai, item.tgl_selesai)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center border-r border-slate-100">
                    <span className="text-blue-600 hover:underline cursor-pointer font-bold text-[13px] transition-all">
                      {item.auditor?.name || <span className="text-slate-400 italic font-normal">Belum Ditunjuk</span>}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-800 text-[13px] border-r border-slate-100">
                    {item.no_kka}
                  </td>
                  <td className="py-4 px-4 text-center border-r border-slate-100">
                    {item.lhe_file?.file_name ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                          ✓ Uploaded
                        </span>
                        {(() => {
                          const status = item.lhe_status || "menunggu_review";
                          if (status === "disetujui") {
                            return (
                              <span className="inline-flex items-center bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                Disetujui
                              </span>
                            );
                          } else if (status === "perlu_revisi") {
                            return (
                              <span className="inline-flex items-center bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                Perlu Revisi
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                Menunggu Review
                              </span>
                            );
                          }
                        })()}
                        <span className="block text-[10px] text-slate-400 font-bold truncate max-w-[150px] mx-auto mt-1 lowercase" title={item.lhe_file.file_name}>
                          {item.lhe_file.file_name}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                        Belum Upload
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center border-r border-slate-100">
                     {item.temuan_count > 0 ? (
                       <div>
                         <span className="inline-block px-3 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black uppercase tracking-wider">
                           {item.temuan_count} temuan
                         </span>
                         <span className="block text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider whitespace-nowrap">
                           {getSeveritySummary(item.temuan)}
                         </span>
                       </div>
                     ) : (
                       <span className="text-slate-400 font-bold text-xs">—</span>
                     )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => openDetailTemuan(item)}
                        className="p-2 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white rounded-lg transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                        title="Detail Temuan & LHE"
                      >
                        <BsCollection size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {kka.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-[13px]">
                     Belum ada data kertas kerja dari fase perencanaan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box matching the bottom description from the screenshot */}
      <div className="bg-[#1e293b] text-slate-200 p-5 rounded-r-xl border-l-4 border-l-blue-500 font-bold text-xs leading-relaxed mt-2 shadow-sm">
        Klik tombol <span className="text-amber-400 font-black">detail</span> di kolom Aksi untuk membuka modal LHE + daftar temuan per KKA. Temuan diinput di dalam modal tersebut — bukan di halaman terpisah.
      </div>

      {/* ====================== BIAYA / AKOMODASI ====================== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border-b border-slate-100 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
                          <BsWallet2 className="text-blue-600" /> Serapan Anggaran Biaya
                        </h2>
                        <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          IIA Std. 2330
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rincian realisasi biaya akomodasi & tugas per KKA</p>
                    </div>


          <button
            onClick={() => { 
              if (isAuditClosed) return;
              setEditBiaya(null); 
              setFormBiaya({
                kka_id: "", 
                nama: "", 
                jenis_akomodasi: "", 
                nilai_realisasi: "",
                pelaksana: "",
                tgl_realisasi: "",
                bukti: ""
              }); 
              setBuktiFile(null);
              setShowTambahBiaya(true); 
            }}
            disabled={isAuditClosed}
            className={`flex items-center justify-center gap-2 px-4.5 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-sm active:scale-95 ${
              isAuditClosed ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" : "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            }`}
          >
            {isAuditClosed ? <BsLock size={12} strokeWidth={1} /> : <BsPlusLg size={12} strokeWidth={1} />} 
            {isAuditClosed ? "Terkunci" : "Input Biaya"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#151b2b] text-white">
              <tr className="uppercase text-[10px] tracking-widest font-black border-b border-slate-700">
                <th className="py-4 px-4 text-center w-16 border-r border-slate-800">No</th>
                <th className="py-4 px-5 border-r border-slate-800">Uraian KKA</th>
                <th className="py-4 px-4 border-r border-slate-800 text-center w-48">
                  <div>Pelaksana</div>
                </th>
                <th className="py-4 px-4 border-r border-slate-800 text-center w-48">Jenis Akomodasi</th>
                <th className="py-4 px-4 border-r border-slate-800 text-center w-44">
                  <div>Tgl Realisasi</div>
                </th>
                <th className="py-4 px-4 border-r border-slate-800 text-right w-44">Anggaran (IDR)</th>
                <th className="py-4 px-4 border-r border-slate-800 text-right w-44">Realisasi</th>
                <th className="py-4 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kka.map((item) => {
                const detail = biaya.filter((b) => b.kka_id === item.id);
                const total = detail.reduce((sum, d) => sum + Number(d.nilai_realisasi), 0);

                const getAkomodasiBadge = (jenis) => {
                  const label = jenis ? jenis.replaceAll("_", " ") : "akomodasi";
                  if (jenis?.toLowerCase().includes("udara") || jenis?.toLowerCase().includes("transportasi")) {
                    return (
                      <span className="inline-block px-3.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {label}
                      </span>
                    );
                  }
                  if (jenis?.toLowerCase().includes("penginapan") || jenis?.toLowerCase().includes("akomodasi")) {
                    return (
                      <span className="inline-block px-3.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Akomodasi
                      </span>
                    );
                  }
                  return (
                    <span className="inline-block px-3.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {label}
                    </span>
                  );
                };

                return (
                  <React.Fragment key={item.id}>
                    {/* HEADER GROUP BIAYA (PARENT ROW) */}
                    <tr className="bg-slate-50/20 border-b border-slate-100 align-middle">
                      <td className="py-4 px-4 border-r border-slate-100"></td>
                      <td className="py-4 px-5 font-bold text-slate-800 border-r border-slate-100 text-[13px]">
                        {item.uraian} (KKA {item.no_kka})
                      </td>
                      <td className="py-4 px-4 border-r border-slate-100"></td>
                      <td className="py-4 px-4 border-r border-slate-100"></td>
                      <td className="py-4 px-4 border-r border-slate-100"></td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-400 border-r border-slate-100 text-[13px]">
                        Rp {formatRupiah(item.anggaran)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-emerald-600 border-r border-slate-100 text-[13px]">
                        Rp {formatRupiah(total)}
                      </td>
                      <td className="py-4 px-4"></td>
                    </tr>

                    {/* DETAIL BIAYA (CHILD ROWS) */}
                    {detail.map((d, dIndex) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group align-middle">
                        <td className="py-4 px-4 text-center text-slate-400 font-mono text-[13px] font-bold border-r border-slate-100">
                          {dIndex + 1}
                        </td>
                        <td className="py-4 px-5 text-slate-700 font-semibold border-r border-slate-100 text-[13px]">
                           <div className="flex flex-col gap-1">
                             <span>{d.nama}</span>
                             {d.bukti && (
                               <a 
                                 href={`${import.meta.env.VITE_BACKEND_URL}/storage/${d.bukti}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-850 hover:underline w-fit uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded transition-all"
                               >
                                 <BsFileEarmarkText size={10} className="text-red-500" /> Lihat Bukti
                               </a>
                             )}
                           </div>
                        </td>
                        <td className="py-4 px-4 text-center border-r border-slate-100 font-bold text-slate-800 text-[13px]">
                           {d.pelaksana || "—"}
                        </td>
                        <td className="py-4 px-4 text-center border-r border-slate-100">
                           {getAkomodasiBadge(d.jenis_akomodasi)}
                        </td>
                        <td className="py-4 px-4 text-center border-r border-slate-100 font-bold text-slate-600 text-[12px]">
                           {d.tgl_realisasi || "—"}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-400 border-r border-slate-100 text-[13px]">
                          —
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-black text-slate-800 border-r border-slate-100 text-[13px]">
                          Rp {formatRupiah(d.nilai_realisasi)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            {!isAuditClosed && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditBiaya(d);
                                    setFormBiaya({
                                      kka_id: d.kka_id,
                                      nama: d.nama,
                                      jenis_akomodasi: d.jenis_akomodasi,
                                      nilai_realisasi: d.nilai_realisasi.toString(),
                                      pelaksana: d.pelaksana || "",
                                      tgl_realisasi: d.tgl_realisasi || "",
                                      bukti: d.bukti || ""
                                    });
                                    setBuktiFile(null);
                                    setShowTambahBiaya(true);
                                  }}
                                  className="p-2 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white rounded-lg transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                                  title="Edit Biaya"
                                >
                                  <BsPencilSquare size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteBiaya(d.id)}
                                  className="p-2 bg-slate-800 hover:bg-slate-900 border border-red-900/50 text-red-400 hover:text-red-500 rounded-lg transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                                  title="Hapus Biaya"
                                >
                                  <BsTrash size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              {kka.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 text-[13px]">
                    Belum ada data kertas kerja untuk penginputan biaya.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Summary Footer */}
        {(() => {
          const totalAnggaran = kka.reduce((sum, item) => sum + Number(item.anggaran || 0), 0);
          const totalRealisasi = biaya.reduce((sum, item) => sum + Number(item.nilai_realisasi || 0), 0);
          const percentage = totalAnggaran > 0 ? Math.round((totalRealisasi / totalAnggaran) * 100) : 0;
          const sisa = totalAnggaran - totalRealisasi;

          const formatToJuta = (val) => {
            if (val < 1000000) return `Rp ${(val / 1000).toFixed(0)} rb`;
            const millions = val / 1000000;
            if (millions % 1 === 0) return `Rp ${millions.toFixed(0)} jt`;
            return `Rp ${millions.toFixed(1).replace(".", ",")} jt`;
          };

          return (
            <div className="bg-slate-900 text-slate-100 p-5 border-t border-slate-800 font-sans">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Serapan keseluruhan progress bar */}
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Serapan keseluruhan:
                  </span>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden relative">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-black text-amber-400 whitespace-nowrap uppercase tracking-wider">
                    {percentage}% ({formatToJuta(totalRealisasi)} dari {formatToJuta(totalAnggaran)})
                  </span>
                </div>

                {/* Detail totals */}
                <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-wider font-bold">
                  <div>
                    <span className="text-slate-400">Total anggaran:</span>{" "}
                    <span className="text-white font-black text-sm leading-none">Rp {formatRupiah(totalAnggaran)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total realisasi:</span>{" "}
                    <span className="text-emerald-400 font-black text-sm leading-none">Rp {formatRupiah(totalRealisasi)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Sisa:</span>{" "}
                    <span className="text-blue-400 font-black text-sm leading-none">Rp {formatRupiah(sisa)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ====================== MODAL MENGELOLA LHE & TEMUAN ====================== */}
      {showTemuanModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>

          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-800">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="font-black text-slate-850 text-[17px] uppercase tracking-tight flex items-center gap-2">
                  <BsFileEarmarkText className="text-blue-600"/> LHE & Temuan — KKA No. {selectedKka?.no_kka}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 leading-snug">
                  {selectedKka?.uraian} <span className="text-slate-300 mx-1.5">|</span> Dilaksanakan oleh: <span className="text-slate-700">{selectedKka?.auditor?.name || "—"}</span> <span className="text-slate-300 mx-1.5">|</span> {formatDateRange(selectedKka?.tgl_mulai, selectedKka?.tgl_selesai)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {existingLhe && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-3 py-1 font-black rounded-full uppercase tracking-widest shadow-sm">
                    LHE Uploaded
                  </span>
                )}
                {/* <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" title="Tutup">
                  <BsX size={26} />
                </button> */}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 space-y-6 mt-0">
              
              {/* --- SECTION UPLOAD LHE --- */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <h4 className="bg-blue-50/50 text-blue-800 font-black text-[10px] py-2 px-3 rounded-lg uppercase tracking-wider flex items-center gap-2 border border-blue-100/50 w-fit mb-0">
                     <BsCloudUpload className="text-blue-600" size={13}/> UPLOAD FILE LHE
                  </h4>
                  <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    IIA Std. 2330
                  </span>
                </div>
                
                <div>
                  {existingLhe ? (
                    isAssignedAuditor ? (
                      <label className="border border-dashed border-emerald-250 bg-emerald-50/10 hover:bg-emerald-50/20 transition-all duration-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer group relative">
                        <BsFileEarmarkText className="text-emerald-550 text-4xl group-hover:scale-105 transition-transform duration-200" />
                        <span className="text-[13px] font-black text-emerald-700">LHE Sudah Berhasil Diupload</span>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-200 text-xs px-4 py-1.5 font-bold rounded-full shadow-sm hover:bg-slate-200 transition-colors"
                        >
                          <BsFileEarmarkText className="text-red-500" />
                          <a href={`${import.meta.env.VITE_BACKEND_URL}/storage/${existingLhe.file_path}`} target="_blank" rel="noreferrer" className="hover:underline text-slate-805">
                            {existingLhe.file_name} {existingLhe.file_size ? ` · ${(existingLhe.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                          </a>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Klik untuk mengganti file · PDF, DOCX maks. 20 MB</span>
                        <input type="file" className="hidden" onChange={(e) => handleUploadLHEDirectly(e.target.files[0])} />
                      </label>
                    ) : (
                      <div className="border border-emerald-200 bg-emerald-50/30 p-6 rounded-2xl flex flex-col items-center justify-center gap-3">
                        <BsFileEarmarkText className="text-emerald-500 text-4xl" />
                        <span className="text-[13px] font-black text-emerald-700">LHE Telah Diupload</span>
                        <div className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 text-xs px-4 py-1.5 font-bold rounded-full shadow-sm">
                          <BsFileEarmarkText className="text-red-500" />
                          <a href={`${import.meta.env.VITE_BACKEND_URL}/storage/${existingLhe.file_path}`} target="_blank" rel="noreferrer" className="hover:underline text-slate-805">
                            {existingLhe.file_name} {existingLhe.file_size ? ` · ${(existingLhe.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                          </a>
                        </div>
                      </div>
                    )
                  ) : (
                    isAssignedAuditor && !isAuditClosed ? (
                      <label className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer group min-h-[160px]">
                        <BsCloudUpload className="text-slate-300 group-hover:text-blue-500 text-5xl group-hover:animate-bounce transition-colors duration-300 mb-2" />
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-sm font-black text-slate-500 group-hover:text-blue-700 transition-colors">Klik untuk memilih file LHE</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">PDF, DOCX, XLSX (Maks 20MB)</span>
                        </div>
                        <input type="file" className="hidden" onChange={(e) => handleUploadLHEDirectly(e.target.files[0])} />
                      </label>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 h-[120px]">
                        <BsFileEarmarkText className="text-slate-300 text-3xl" />
                        <span className="text-[13px] font-bold text-slate-500">Belum ada file LHE</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-1">Menunggu Auditor Pelaksana mengunggah file LHE</span>
                      </div>
                    )
                  )}
                </div>

                {existingLhe && (
                  <div className="mt-4 p-5 border border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col gap-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        🛡️ Review Pengendali Teknis (Std. 2340)
                      </span>
                      {(() => {
                        const status = selectedKka?.lhe_status || "menunggu_review";
                        if (status === "disetujui") {
                          return (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                              LHE Disetujui
                            </span>
                          );
                        } else if (status === "perlu_revisi") {
                          return (
                            <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider animate-pulse">
                              Perlu Revisi
                            </span>
                          );
                        } else {
                          return (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider animate-pulse">
                              Menunggu Review
                            </span>
                          );
                        }
                      })()}
                    </div>

                    {selectedKka?.lhe_catatan_review && (
                      <div className="bg-white border border-slate-100 p-3.5 rounded-xl text-xs font-semibold text-slate-700 shadow-sm leading-relaxed">
                        <span className="font-black text-slate-400 block mb-1 uppercase tracking-widest text-[9px]">Catatan PT:</span>
                        {selectedKka.lhe_catatan_review}
                      </div>
                    )}

                    {isPengendaliTeknis && (!selectedKka?.lhe_status || selectedKka?.lhe_status === 'menunggu_review') && !isAuditClosed && (
                      <div className="flex flex-col gap-2.5 border-t border-slate-200/60 pt-3.5 mt-1">
                        <textarea
                          placeholder="Tulis catatan review LHE di sini (Catatan wajib diisi jika meminta revisi)..."
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-xs text-slate-800 transition-all resize-y leading-relaxed shadow-sm"
                          rows="2"
                          id="review-catatan-input"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const catatan = document.getElementById("review-catatan-input")?.value || "";
                              if (!catatan.trim()) {
                                notifyError("Catatan review wajib diisi jika meminta revisi!");
                                        return;
                                      }
                                      try {
                                        const res = await apiClient.post(`/api/kka/${selectedKka.id}/review-lhe`, {
                                          status: "perlu_revisi",
                                          catatan
                                        });
                                        if (res.data.success) {
                                          notifySuccess(res.data.message);
                                          fetchKka();
                                          setSelectedKka(prev => ({ ...prev, lhe_status: "perlu_revisi", lhe_catatan_review: catatan }));
                                          document.getElementById("review-catatan-input").value = "";
                                        }
                                      } catch (e) {
                                        notifyError(e.response?.data?.message || "Gagal menyimpan review");
                                      }
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-rose-250 cursor-pointer"
                          >
                            Minta Revisi
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const catatan = document.getElementById("review-catatan-input")?.value || "";
                              try {
                                const res = await apiClient.post(`/api/kka/${selectedKka.id}/review-lhe`, {
                                  status: "disetujui",
                                  catatan
                                });
                                if (res.data.success) {
                                  notifySuccess(res.data.message);
                                  fetchKka();
                                  setSelectedKka(prev => ({ ...prev, lhe_status: "disetujui", lhe_catatan_review: catatan }));
                                  document.getElementById("review-catatan-input").value = "";
                                }
                              } catch (e) {
                                notifyError(e.response?.data?.message || "Gagal menyimpan review");
                              }
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-emerald-250 cursor-pointer"
                          >
                            Setujui LHE
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* --- SECTION DAFTAR TEMUAN --- */}
              <div>
                <div className="bg-slate-50 border border-slate-200 text-slate-750 font-black text-[11px] py-2.5 px-4 rounded-xl uppercase tracking-wider flex items-center justify-between mb-4 shadow-sm">
                  <span className="flex items-center gap-2">
                    <BsCardChecklist className="text-blue-600" size={14}/> Daftar Temuan KKA
                  </span>
                  {isAssignedAuditor && !isAuditClosed && (
                    <button
                      onClick={() => {
                        setEditTemuan(null);
                        resetFormTemuan();
                        setExistingLampiran(null);
                        setShowTambahTemuan(true);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      <BsPlusLg size={10}/> Tambah temuan
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-md">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                      <tr className="uppercase text-[9px] tracking-wider font-black">
                        <th className="py-3 px-3 text-center w-14 border-r border-slate-200/50">No</th>
                        <th className="py-3 px-3 text-center border-r border-slate-200/50 w-20">Hal LHE</th>
                        <th className="py-3 px-4 border-r border-slate-200/50 w-[45%]">Masalah Utama</th>
                        <th className="py-3 px-4 text-center border-r border-slate-200/50 w-32">Kategori</th>
                        <th className="py-3 px-4 text-right border-r border-slate-200/50 w-40">Nilai Kerugian</th>
                        <th className="py-3 px-3 text-center w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {temuan.map((t, i) => (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition-all group align-middle">
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs font-bold bg-slate-50/30 border-r border-slate-200/50">
                            {i + 1}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-600 border-r border-slate-200/50 text-xs">
                            {t.halaman_lhe}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-700 border-r border-slate-200/50 leading-relaxed text-[13px]">
                            <button
                              onClick={() => { setSelectedTemuan(t); setShowDetailTemuan(true); }}
                              className="text-left text-slate-700 hover:text-blue-600 hover:underline transition-colors w-full"
                              title="Lihat Detail Temuan"
                            >
                              {t.masalah}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center border-r border-slate-200/50">
                            {getKategoriBadge(t.kategori)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-slate-700 border-r border-slate-200/50 text-xs">
                            {t.nilai_kerugian ? `Rp ${formatRupiah(t.nilai_kerugian)}` : "Rp 0"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex justify-center gap-2">
                              {isAssignedAuditor && !isAuditClosed ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditTemuan(t);
                                      setFormTemuan({ ...t, lampiran: null });
                                      setExistingLampiran(t.lampiran);
                                      setShowTambahTemuan(true);
                                    }}
                                    className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Temuan"
                                  >
                                    <BsPencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTemuan(t.id)}
                                    className="p-1.5 border border-red-105 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus Temuan"
                                  >
                                    <BsTrash size={12} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-slate-400 font-bold text-xs">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {isAssignedAuditor ? (
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-300 font-mono text-[11px] font-bold bg-slate-50/30 border-r border-slate-200/50">+</td>
                          <td className="py-3 px-3 text-center border-r border-slate-200/50 text-xs text-slate-300">—</td>
                          <td colSpan={4} className="py-3 px-4 text-slate-400 font-bold italic text-xs leading-relaxed">
                            Belum ada temuan lain — klik Tambah Temuan
                          </td>
                        </tr>
                      ) : temuan.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold italic text-[11px] leading-relaxed uppercase tracking-wider">
                            Belum ada temuan yang diinput oleh Auditor Pelaksana
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/30 shrink-0 mt-1">
              <button 
                onClick={closeModal} 
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 border border-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.99] cursor-pointer shadow-md shadow-rose-200"
              >
                Tutup Halaman LHE & Temuan
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ====================== MODAL TAMBAH/EDIT TEMUAN ====================== */}
      {showTambahTemuan && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { resetFormTemuan(); setShowTambahTemuan(false); }}></div>

          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="font-black text-slate-850 text-[17px] uppercase tracking-tight flex items-center gap-2">
                  <BsCardChecklist className="text-blue-600"/> {editTemuan ? "Edit Temuan LHE" : "Tambah Temuan KKA Baru"}
                  <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    IIA Std. 2310
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 leading-snug">
                  KKA No. {selectedKka?.no_kka} <span className="text-slate-300 mx-1.5">|</span> {selectedKka?.uraian}
                </p>
              </div>
              <button onClick={() => { resetFormTemuan(); setShowTambahTemuan(false); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" title="Tutup">
                <BsX size={26} />
              </button>
            </div>

            <form onSubmit={handleSaveTemuan} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* --- SECTION 1: IDENTITAS TEMUAN --- */}
              <div>
                <h4 className="bg-blue-50/50 text-blue-800 font-black text-[10px] py-2 px-3 rounded-lg uppercase tracking-wider mb-4 border border-blue-100/50 flex items-center gap-1.5 w-fit">
                  IDENTITAS TEMUAN
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Kategori Temuan</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "Major", label: "Major", colorClass: "border-red-200 text-red-650 hover:bg-red-50/50", activeClass: "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20" },
                        { key: "Minor", label: "Minor ✓", colorClass: "border-amber-200 text-amber-750 hover:bg-amber-50/50", activeClass: "bg-amber-500 text-slate-900 border-amber-500 shadow-md shadow-amber-500/20" },
                        { key: "Observasi", label: "Observasi ✓", colorClass: "border-slate-200 text-slate-600 hover:bg-slate-50", activeClass: "bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-500/20" },
                        { key: "OFI", label: "OFI ✓", colorClass: "border-blue-200 text-blue-650 hover:bg-blue-50/50", activeClass: "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" }
                      ].map((item) => {
                        const isSelected = formTemuan.kategori === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setFormTemuan({ ...formTemuan, kategori: item.key })}
                            className={`px-4 py-1.5 border text-xs font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer ${
                              isSelected ? item.activeClass : `bg-white ${item.colorClass}`
                            }`}
                          >
                            {isSelected ? item.label : item.key}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[9px] font-bold text-slate-450 mt-1 uppercase tracking-wide block ml-1 leading-none">Pilih tingkat keparahan temuan — wajib</span>
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Hal LHE</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-800 transition-all text-center"
                      value={formTemuan.halaman_lhe || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, halaman_lhe: e.target.value.replace(/\D/g, "") })}
                      placeholder="Misal: 12"
                    />
                    <span className="text-[9px] font-bold text-slate-450 mt-1 uppercase tracking-wide block ml-1 leading-none">Nomor halaman di dokumen LHE</span>
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Potensi Nilai Kerugian</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">Rp</span>
                      <input
                        type="text"
                        className="w-full p-2 pl-9 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-805 text-sm transition-all"
                        value={formatRupiah(formTemuan.nilai_kerugian)}
                        onChange={(e) => setFormTemuan({ ...formTemuan, nilai_kerugian: e.target.value.replace(/\D/g, "") })}
                        placeholder="0"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-450 mt-1 uppercase tracking-wide block ml-1 leading-none">Opsional — isi jika ada dampak finansial</span>
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Masalah Utama Yang Dijumpai</label>
                    <textarea
                      required
                      rows="2"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all resize-none leading-relaxed shadow-sm"
                      value={formTemuan.masalah || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, masalah: e.target.value })}
                      placeholder="Uraian singkat masalah utama..."
                    />
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: DETAIL TEMUAN (5C) --- */}
              <div>
                <h4 className="bg-blue-50/50 text-blue-800 font-black text-[10px] py-2 px-3 rounded-lg uppercase tracking-wider mb-4 border border-blue-100/50 flex items-center gap-1.5 w-fit">
                  DETAIL TEMUAN (5C)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Kondisi — fakta yang ditemukan</label>
                    <textarea
                      required
                      rows="3"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all resize-y leading-relaxed shadow-sm"
                      value={formTemuan.kondisi || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, kondisi: e.target.value })}
                      placeholder="Deskripsikan kondisi riil di lapangan..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Kriteria — standar / aturan yang dilanggar</label>
                    <textarea
                      required
                      rows="3"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all resize-y leading-relaxed shadow-sm"
                      value={formTemuan.kriteria || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, kriteria: e.target.value })}
                      placeholder="Sebutkan aturan, SOP, atau standar acuan..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Sebab — root cause</label>
                    <textarea
                      required
                      rows="3"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all resize-y leading-relaxed shadow-sm"
                      value={formTemuan.sebab || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, sebab: e.target.value })}
                      placeholder="Analisis penyebab utama terjadinya deviasi..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Akibat — dampak / impact</label>
                    <textarea
                      required
                      rows="3"
                      className="w-full p-3 bg-white border border-red-200 focus:border-red-500 rounded-xl outline-none focus:ring-2 focus:ring-red-500/10 font-bold text-sm text-slate-805 transition-all resize-y leading-relaxed shadow-sm"
                      value={formTemuan.akibat || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, akibat: e.target.value })}
                      placeholder="Dampak negatif atau kerugian akibat temuan ini..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Rekomendasi Perbaikan</label>
                    <textarea
                      required
                      rows="3"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all resize-y leading-relaxed shadow-sm"
                      value={formTemuan.rekomendasi || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, rekomendasi: e.target.value })}
                      placeholder="Solusi konkret dan saran perbaikan dari auditor..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Klarifikasi Auditee</label>
                    <textarea
                      rows="3"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all resize-y leading-relaxed shadow-sm"
                      value={formTemuan.klarifikasi_temuan || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, klarifikasi_temuan: e.target.value })}
                      placeholder="Tanggapan atau klarifikasi awal dari auditee..."
                    />
                    <span className="text-[9px] font-bold text-slate-450 mt-1 uppercase tracking-wide block ml-1 leading-none">Isi saat exit meeting — bisa dikosongkan dulu</span>
                  </div>
                </div>
              </div>

              {/* --- SECTION 3: INFORMASI TAMBAHAN --- */}
              <div>
                <h4 className="bg-blue-50/50 text-blue-800 font-black text-[10px] py-2 px-3 rounded-lg uppercase tracking-wider mb-4 border border-blue-100/50 flex items-center gap-1.5 w-fit">
                  INFORMASI TAMBAHAN
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Area / Proses Bisnis</label>
                    <input
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all"
                      value={formTemuan.area || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, area: e.target.value })}
                      placeholder="Misal: IT Infrastructure"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Referensi Aturan</label>
                    <input
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all"
                      value={formTemuan.referensi || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, referensi: e.target.value })}
                      placeholder="Misal: ISO 27001 Clause 12"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Target Selesai Perbaikan</label>
                    <input
                      type="date"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm text-slate-805 transition-all"
                      value={formTemuan.target_selesai || ""}
                      onChange={(e) => setFormTemuan({ ...formTemuan, target_selesai: e.target.value })}
                    />
                    <span className="text-[9px] font-bold text-slate-450 mt-1 uppercase tracking-wide block ml-1 leading-none">Bisa diubah di Tab Analisis Penyebab</span>
                  </div>

                  <div className="space-y-1.5 col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">Lampiran Pendukung</label>
                    
                    {existingLampiran && !formTemuan.lampiran && (
                      <div className="border border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-xl flex items-center justify-between">
                        <a href={`/storage/${existingLampiran}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-2">
                          <BsFileEarmarkText className="text-red-500" /> Lihat File Terupload
                        </a>
                        <button type="button" onClick={(e) => { e.preventDefault(); setExistingLampiran(null); }} className="p-1.5 border border-red-105 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer">
                          <BsX size={14}/>
                        </button>
                      </div>
                    )}

                    {formTemuan.lampiran && (
                      <div className="border border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-xl flex items-center justify-between">
                        <span className="text-slate-700 font-bold text-xs flex items-center gap-2">
                          <BsFileEarmarkText className="text-blue-500" /> {formTemuan.lampiran.name}
                        </span>
                        <button type="button" onClick={(e) => { e.preventDefault(); setFormTemuan({ ...formTemuan, lampiran: null }); }} className="p-1.5 border border-red-105 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer">
                          <BsX size={14}/>
                        </button>
                      </div>
                    )}

                    {!existingLampiran && !formTemuan.lampiran && (
                      <label htmlFor="lampiranUpload" className="border border-dashed border-2 border-slate-200 bg-slate-50/50 hover:bg-blue-50/5 hover:border-blue-400 transition-all rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer h-24 group">
                        <BsCloudUpload className="text-slate-400 group-hover:text-blue-600 text-2xl mb-1 group-hover:scale-105 transition-all animate-bounce" />
                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-600">Klik atau seret file</span>
                        <span className="text-[9px] text-slate-450 font-bold uppercase tracking-widest mt-1">PDF, DOCX, XLSX, PNG, JPG · maks. 10 MB</span>
                        <input id="lampiranUpload" type="file" className="hidden" onChange={(e) => setFormTemuan({ ...formTemuan, lampiran: e.target.files[0] })} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 shrink-0 mt-4">
                <button 
                  type="button" 
                  onClick={() => { resetFormTemuan(); setShowTambahTemuan(false); }} 
                  className="flex-1 py-3.5 text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl font-bold transition-all text-xs uppercase tracking-widest active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 uppercase text-[11px] tracking-widest cursor-pointer flex items-center justify-center gap-2"
                >
                  ✓ Simpan Temuan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ====================== MODAL DETAIL TEMUAN ====================== */}
      {showDetailTemuan && selectedTemuan && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailTemuan(false)}></div>

          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10">
              <div>
                <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight flex items-center gap-2">
                  <BsCardChecklist className="text-blue-600"/> Detail Temuan LHE
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Halaman LHE: {selectedTemuan.halaman_lhe || "-"}</p>
              </div>
              <button onClick={() => setShowDetailTemuan(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors">
                <BsX size={28} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Masalah Utama</p>
                   <p className="text-sm font-bold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">{selectedTemuan.masalah || "-"}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kondisi (Fakta)</p>
                   <p className="text-sm font-medium text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">{selectedTemuan.kondisi || "-"}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kriteria (Standar)</p>
                   <p className="text-sm font-medium text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">{selectedTemuan.kriteria || "-"}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sebab (Root Cause)</p>
                   <p className="text-sm font-medium text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">{selectedTemuan.sebab || "-"}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Akibat (Impact)</p>
                   <p className="text-sm font-medium text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">{selectedTemuan.akibat || "-"}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Rekomendasi Perbaikan</p>
                   <p className="text-sm font-bold text-blue-800 bg-blue-50 p-4 rounded-xl border border-blue-200 leading-relaxed">{selectedTemuan.rekomendasi || "-"}</p>
                 </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Area / Proses</p>
                   <p className="text-sm font-bold text-slate-700">{selectedTemuan.area || "-"}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referensi</p>
                   <p className="text-sm font-bold text-slate-700">{selectedTemuan.referensi || "-"}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nilai Kerugian</p>
                   <p className="text-sm font-black text-red-600 font-mono">
                     {selectedTemuan.nilai_kerugian ? `Rp ${Number(selectedTemuan.nilai_kerugian).toLocaleString("id-ID")}` : "-"}
                   </p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lampiran</p>
                   {selectedTemuan.lampiran ? (
                     <a href={`/storage/${selectedTemuan.lampiran}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                       <BsFileEarmarkText size={14}/> Lihat File
                     </a>
                   ) : <span className="text-sm font-bold text-slate-400">-</span>}
                </div>
              </div>

              {selectedTemuan.klarifikasi_temuan && (
                <div className="md:col-span-2 bg-slate-100 p-5 rounded-xl border border-slate-200">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Klarifikasi Auditee</p>
                   <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedTemuan.klarifikasi_temuan}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================== MODAL TAMBAH/EDIT BIAYA ====================== */}
      {showTambahBiaya && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTambahBiaya(false)}></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200">
            {/* Header Block */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-100/50">
                <BsWallet2 size={18} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-[16px] uppercase tracking-tight leading-none">
                  {editBiaya ? "Edit Rincian Biaya" : "Input Biaya Baru"}
                </h3>
                <p className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                  Rincian realisasi biaya akomodasi & tugas
                </p>
              </div>
              <button 
                onClick={() => setShowTambahBiaya(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-150 rounded-lg transition-colors cursor-pointer"
                title="Tutup"
              >
                <BsX size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBiaya} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                
                {/* Field 1: KKA / uraian pemeriksaan */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    KKA / uraian pemeriksaan <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 text-[13px] transition-all cursor-pointer shadow-sm"
                    value={formBiaya.kka_id}
                    onChange={(e) => setFormBiaya({ ...formBiaya, kka_id: e.target.value })}
                  >
                    <option value="">-- Pilih KKA --</option>
                    {kka.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.no_kka ? `${k.no_kka} — ` : ''}{k.uraian}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide block ml-1">
                    Pilih KKA yang biaya ini terkait
                  </span>
                </div>

                {/* Field 2: Pelaksana */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                      Pelaksana <span className="text-red-500 font-bold">*</span>
                    </label>
                  </div>
                  <select
                    required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 text-[13px] transition-all cursor-pointer shadow-sm"
                    value={formBiaya.pelaksana}
                    onChange={(e) => setFormBiaya({ ...formBiaya, pelaksana: e.target.value })}
                  >
                    <option value="">-- Pilih Pelaksana --</option>
                    {Array.from(new Set(kka.map(k => k.auditor?.name).filter(Boolean))).map(name => (
                      <option key={name} value={name}>{name} — Auditor</option>
                    ))}
                    {formBiaya.pelaksana && !Array.from(new Set(kka.map(k => k.auditor?.name).filter(Boolean))).includes(formBiaya.pelaksana) && (
                      <option value={formBiaya.pelaksana}>{formBiaya.pelaksana}</option>
                    )}
                  </select>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide block ml-1">
                    Siapa yang mengeluarkan biaya ini — hanya dari tim terdaftar
                  </span>
                </div>

                {/* Field 3: Jenis akomodasi */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Jenis akomodasi <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 text-[13px] transition-all cursor-pointer shadow-sm"
                    value={formBiaya.jenis_akomodasi}
                    onChange={(e) => setFormBiaya({ ...formBiaya, jenis_akomodasi: e.target.value })}
                  >
                    <option value="">-- Pilih Jenis Akomodasi --</option>
                    {jenisAkomodasiList.map((item) => (
                      <option key={item} value={item} className="uppercase tracking-wide font-semibold text-slate-800">
                        {item.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide block ml-1">
                    Transportasi / Akomodasi / Uang Harian / Konsumsi / dll
                  </span>
                </div>

                {/* Field 4: Tanggal realisasi */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                      Tanggal realisasi <span className="text-red-500 font-bold">*</span>
                    </label>
                  </div>
                  <input
                    required
                    type="text"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 text-[13px] transition-all shadow-sm"
                    value={formBiaya.tgl_realisasi}
                    onChange={(e) => setFormBiaya({ ...formBiaya, tgl_realisasi: e.target.value })}
                    placeholder="Contoh: 05/05/2026 atau 05 - 08 Mei 2026"
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide block ml-1">
                    Tanggal biaya ini dikeluarkan
                  </span>
                </div>

                {/* Field 5: Uraian biaya */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Uraian biaya <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 text-[13px] transition-all shadow-sm"
                    value={formBiaya.nama}
                    onChange={(e) => setFormBiaya({ ...formBiaya, nama: e.target.value })}
                    placeholder="Tiket pesawat tim IT audit (PP)"
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide block ml-1">
                    Deskripsi spesifik pengeluaran
                  </span>
                </div>

                {/* Field 6: Nilai realisasi (IDR) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Nilai realisasi (IDR) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[13px]">Rp</span>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      className="w-full p-2.5 pl-10 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-black text-slate-800 text-[13px] transition-all shadow-sm"
                      value={formatRupiah(formBiaya.nilai_realisasi)}
                      onChange={(e) => setFormBiaya({ ...formBiaya, nilai_realisasi: e.target.value.replace(/\D/g, "") })}
                      placeholder="0"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide block ml-1">
                    &nbsp;
                  </span>
                </div>

                {/* Field 7: Upload bukti / kwitansi */}
                <div className="space-y-1 md:col-span-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                      Upload bukti / kwitansi <span className="text-red-500 font-bold">*</span>
                      <span className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ml-2">
                        IIA Std. 2330
                      </span>
                    </label>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={buktiInputRef} 
                    onChange={handleBuktiChange} 
                    className="hidden" 
                    accept="image/*,application/pdf"
                  />

                  <div 
                    onClick={() => buktiInputRef.current?.click()}
                    className="border-dashed border-2 border-slate-200 hover:border-blue-400 bg-slate-50/20 hover:bg-blue-50/5 transition-all duration-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer group h-28 relative"
                  >
                    <BsCloudUpload className="text-slate-400 group-hover:text-blue-500 text-3xl group-hover:scale-105 transition-transform duration-200 mb-1" />
                    <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-700 transition-colors duration-200 text-center px-4 truncate max-w-full">
                      {buktiFile ? buktiFile.name : (formBiaya.bukti ? "Ganti bukti / kwitansi terupload" : "Upload struk, invoice, atau tiket")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {buktiFile ? `${(buktiFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, JPG, PNG · maks. 5 MB"}
                    </span>
                    {formBiaya.bukti && !buktiFile && (
                      <div className="mt-1">
                        <a 
                          href={`${import.meta.env.VITE_BACKEND_URL}/storage/${formBiaya.bukti}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                          <BsFileEarmarkText size={10} className="text-red-500" /> Lihat File Terupload
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wide block ml-1 leading-snug">
                    Wajib — bukti fisik/digital diperlukan untuk pertanggungjawaban keuangan audit
                  </span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setShowTambahBiaya(false)}
                  className="flex-1 py-3 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-xs uppercase tracking-widest active:scale-95 border border-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BsCalendarCheck size={14} /> Simpan biaya
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PelaksanaanTab;
