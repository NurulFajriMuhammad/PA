import React, { useEffect, useState } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { BsX, BsTrash, BsPencilSquare, BsPlusLg, BsCloudUpload, BsFileEarmarkText, BsWallet2, BsCardChecklist } from "react-icons/bs";

const PelaksanaanTab = ({ assurance }) => {
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

  const [formTemuan, setFormTemuan] = useState({
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
    nilai_kerugian: "",
    keterangan: "",
    lampiran: null,
  });

  const resetFormTemuan = () => {
    setFormTemuan({
      halaman_lhe: "", masalah: "", rekomendasi: "", kondisi: "", kriteria: "",
      sebab: "", akibat: "", klarifikasi_temuan: "", area: "", referensi: "",
      nilai_kerugian: "", keterangan: "", lampiran: null,
    });
  };

  const [formBiaya, setFormBiaya] = useState({
    kka_id: "",
    nama: "",
    jenis_akomodasi: "",
    nilai_realisasi: "",
  });

  const fetchBiaya = async () => {
    try {
      const res = await apiClient.get(`/api/assurance/${assurance.id}/biaya`);
      setBiaya(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchKka();
    fetchBiaya();
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
    if (!lheFile) return alert("Pilih file LHE terlebih dahulu");

    const form = new FormData();
    form.append("file", lheFile);

    try {
      await apiClient.post(`/api/kka/${selectedKka.id}/upload-lhe`, form);
      alert("File LHE berhasil diupload");
      setLheFile(null); 
      
      const lhe = await apiClient.get(`/api/kka/${selectedKka.id}/lhe`);
      setExistingLhe(lhe.data.data);
      fetchKka(); 
    } catch (e) {
      console.error(e);
      alert("Gagal upload LHE");
    }
  };

  const formatRupiah = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(Number(value));
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
        await apiClient.put(`/api/temuan/${editTemuan.id}`, form);
      } else {
        await apiClient.post(`/api/kka/${selectedKka.id}/temuan`, form);
      }
      
      resetFormTemuan();
      setEditTemuan(null);
      setShowTambahTemuan(false);
      fetchTemuan();
      fetchKka(); 
    } catch (err) {
      console.error("ERROR BACKEND:", err.response?.data);
      alert(JSON.stringify(err.response?.data));
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

  const handleDeleteLhe = async () => {
    if (!window.confirm("Hapus file LHE?")) return;
    try {
      await apiClient.delete(`/api/kka/${selectedKka.id}/lhe`);
      setExistingLhe(null);
      fetchKka();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus LHE");
    }
  };

  const handleSaveBiaya = async (e) => {
    e.preventDefault();
    try {
      if (editBiaya) {
        await apiClient.put(`/api/biaya/${editBiaya.id}`, formBiaya);
      } else {
        await apiClient.post(`/api/biaya`, formBiaya);
      }

      setShowTambahBiaya(false);
      setEditBiaya(null);
      setFormBiaya({ kka_id: "", nama: "", jenis_akomodasi: "", nilai_realisasi: "" });
      fetchBiaya();
    } catch (err) {
      console.error(err);
      alert("Gagal simpan biaya");
    }
  };

  const handleDeleteTemuan = async (id) => {
    if (!window.confirm("Hapus temuan?")) return;
    try {
      await apiClient.delete(`/api/temuan/${id}`);
      fetchTemuan();
      fetchKka();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus temuan");
    }
  };

  const handleDeleteBiaya = async (id) => {
    if (!window.confirm("Hapus biaya?")) return;
    try {
      await apiClient.delete(`/api/biaya/${id}`);
      fetchBiaya();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus biaya");
    }
  };

  const jenisAkomodasiList = [
    "transportasi_darat", "transportasi_udara", "transportasi_laut", "penginapan",
    "konsumsi", "uang_harian", "sewa_kendaraan", "bbm", "toll_parkir",
    "atk", "cetak_dokumen", "jasa_profesional", "lainnya",
  ];

  return (
    <div className="space-y-8 py-2 font-sans">
      
      {/* ====================== DAFTAR PEMERIKSAAN ====================== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <BsFileEarmarkText className="text-slate-500 text-xl" />
            <div>
              <h2 className="font-black text-[15px] text-slate-800 uppercase tracking-tight">
                Daftar Pemeriksaan
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pengisian LHE dan Detail Temuan KKA</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95">
              <BsCardChecklist size={14} /> Checklist Penyelesaian
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95">
              <BsCardChecklist size={14} /> Checklist Laporan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#151b2b] text-white">
              <tr className="uppercase text-[10px] tracking-widest font-bold">
                <th className="py-3 px-4 text-center w-12 border-r border-slate-700/50">No</th>
                <th className="py-3 px-4 border-r border-slate-700/50">Uraian Tugas / KKA</th>
                <th className="py-3 px-4 border-r border-slate-700/50 text-blue-300">Dilaksanakan Oleh</th>
                <th className="py-3 px-4 border-r border-slate-700/50 text-center">No KKA</th>
                <th className="py-3 px-4 border-r border-slate-700/50 text-center">File LHE</th>
                <th className="py-3 px-4 border-r border-slate-700/50 text-center w-24">Temuan</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {kka.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group align-middle">
                  <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px] font-bold border-r border-slate-100">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 text-[13px] border-r border-slate-100">
                    {item.uraian}
                  </td>
                  <td className="py-3 px-4 text-blue-700 font-bold text-[11px] uppercase tracking-wide border-r border-slate-100">
                    {item.auditor?.name || <span className="text-slate-400 italic font-normal">Belum Ditunjuk</span>}
                  </td>
                  <td className="py-3 px-4 text-center border-r border-slate-100">
                    <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded text-[10px] font-bold uppercase tracking-widest">
                      {item.no_kka}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center border-r border-slate-100">
                    {item.lhe_file?.file_name ? (
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-widest">
                        UPLOADED
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center border-r border-slate-100">
                     <span className={`font-black text-sm ${item.temuan_count > 0 ? "text-red-600" : "text-slate-400"}`}>
                       {item.temuan_count || 0}
                     </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openDetailTemuan(item)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                    >
                      <BsPlusLg size={10} strokeWidth={1} /> DETAIL TEMUAN
                    </button>
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

      {/* ====================== BIAYA / AKOMODASI ====================== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
             <BsWallet2 className="text-slate-500 text-xl" />
             <div>
               <h2 className="font-black text-[15px] text-slate-800 uppercase tracking-tight">
                 Serapan Anggaran Biaya
               </h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Rincian realisasi biaya akomodasi & tugas</p>
             </div>
          </div>
          <button
            onClick={() => { setEditBiaya(null); setFormBiaya({kka_id: "", nama: "", jenis_akomodasi: "", nilai_realisasi: ""}); setShowTambahBiaya(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95"
          >
            <BsPlusLg size={12} /> Input Biaya
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#111827] text-white">
              <tr className="uppercase text-[10px] tracking-widest font-bold">
                <th className="py-3 px-4 border-r border-slate-700/50 w-[35%]">Uraian Pemeriksaan / Rincian Biaya</th>
                <th className="py-3 px-4 border-r border-slate-700/50 text-center w-[20%]">Jenis Akomodasi</th>
                <th className="py-3 px-4 border-r border-slate-700/50 text-right w-[15%]">Anggaran (IDR)</th>
                <th className="py-3 px-4 border-r border-slate-700/50 text-right w-[15%]">Realisasi (IDR)</th>
                <th className="py-3 px-4 text-center w-[15%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kka.map((item) => {
                const detail = biaya.filter((b) => b.kka_id === item.id);
                const total = detail.reduce((sum, d) => sum + Number(d.nilai_realisasi), 0);

                return (
                  <React.Fragment key={item.id}>
                    {/* HEADER GROUP BIAYA */}
                    <tr className="bg-white border-b border-slate-100">
                      <td className="py-3 px-4 font-bold text-slate-800 border-r border-slate-100 text-[13px]">{item.uraian}</td>
                      <td className="py-3 px-4 border-r border-slate-100"></td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-400 border-r border-slate-100 text-[13px]">{formatRupiah(item.anggaran)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 border-r border-slate-100 text-[13px]">{formatRupiah(total)}</td>
                      <td className="py-3 px-4"></td>
                    </tr>

                    {/* DETAIL BIAYA */}
                    {detail.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors group align-middle">
                        <td className="py-3 px-4 pl-10 text-slate-600 font-medium border-r border-slate-100 flex items-center gap-2.5 text-[13px]">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {d.nama}
                        </td>
                        <td className="py-3 px-4 text-center border-r border-slate-100">
                           <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest">
                             {d.jenis_akomodasi.replaceAll("_", " ")}
                           </span>
                        </td>
                        <td className="py-3 px-4 border-r border-slate-100"></td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 border-r border-slate-100 text-[13px]">
                          {formatRupiah(d.nilai_realisasi)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditBiaya(d);
                                setFormBiaya({ ...d, nilai_realisasi: d.nilai_realisasi.toString() });
                                setShowTambahBiaya(true);
                              }}
                              className="p-1.5 text-amber-500 hover:bg-amber-50 border border-amber-200 bg-white rounded transition-colors" title="Edit Biaya"
                            >
                              <BsPencilSquare size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteBiaya(d.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 bg-white rounded transition-colors" title="Hapus Biaya"
                            >
                              <BsTrash size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              {kka.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 text-[13px]">
                    Belum ada data kertas kerja untuk penginputan biaya.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================== MODAL MENGELOLA LHE & TEMUAN ====================== */}
      {showTemuanModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-2">
                  <BsFileEarmarkText className="text-slate-500"/> Laporan Hasil Evaluasi (LHE) & Temuan
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">NO KKA: {selectedKka?.no_kka}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                <BsX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* --- SECTION UPLOAD LHE --- */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <BsCloudUpload className="text-blue-600" size={14}/> Upload File LHE
                </h4>
                <form onSubmit={handleUploadLHE} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      {existingLhe ? (
                        <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <a href={`/storage/${existingLhe.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-2">
                             <BsFileEarmarkText size={14}/> {existingLhe.file_name}
                          </a>
                          <button type="button" onClick={handleDeleteLhe} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors border border-red-100">
                            <BsTrash size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-blue-50 transition-colors group h-[88px]">
                          {lheFile ? (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-blue-600">{lheFile.name}</span>
                              <button type="button" onClick={(e) => { e.preventDefault(); setLheFile(null); }} className="text-red-500 font-bold bg-red-50 p-1 rounded hover:bg-red-100 border border-red-200">
                                <BsX size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Klik untuk memilih file LHE</span>
                              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-1">PDF, DOCX, XLSX (Maks 5MB)</span>
                            </div>
                          )}
                          <input type="file" className="hidden" onChange={(e) => setLheFile(e.target.files[0])} />
                        </label>
                      )}
                    </div>
                    
                    {!existingLhe && (
                      <button type="submit" className="w-full md:w-auto h-[88px] px-6 bg-blue-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm active:scale-95 flex items-center justify-center">
                        Upload
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* --- SECTION DAFTAR TEMUAN --- */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                     <BsCardChecklist className="text-blue-600" size={14}/> Daftar Temuan
                  </h4>
                  <button
                    onClick={() => {
                      setEditTemuan(null);
                      resetFormTemuan();
                      setExistingLampiran(null);
                      setShowTambahTemuan(true);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95"
                  >
                    <BsPlusLg size={10}/> Tambah Temuan
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-[#111827] text-white">
                      <tr className="uppercase text-[10px] tracking-widest font-bold">
                        <th className="py-2.5 px-3 text-center w-12 border-r border-slate-700/50">No</th>
                        <th className="py-2.5 px-3 text-center border-r border-slate-700/50 w-24">Hal LHE</th>
                        <th className="py-2.5 px-4 border-r border-slate-700/50 w-[35%]">Masalah Utama</th>
                        <th className="py-2.5 px-4 border-r border-slate-700/50">Rekomendasi</th>
                        <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {temuan.map((t, i) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors group align-middle">
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px] font-bold bg-slate-50/50 group-hover:bg-transparent border-r border-slate-100">
                            {i + 1}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-600 border-r border-slate-100 text-xs">
                            {t.halaman_lhe}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 border-r border-slate-100 leading-snug text-[13px]">
                            <button
                              onClick={() => { setSelectedTemuan(t); setShowDetailTemuan(true); }}
                              className="text-left hover:text-blue-600 hover:underline transition-colors line-clamp-2"
                              title="Lihat Detail Temuan"
                            >
                              {t.masalah}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-slate-600 border-r border-slate-100 text-[12px] line-clamp-2 leading-relaxed">
                            {t.rekomendasi}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditTemuan(t);
                                  setFormTemuan({ ...t, lampiran: null });
                                  setExistingLampiran(t.lampiran);
                                  setShowTambahTemuan(true);
                                }}
                                className="p-1.5 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white rounded transition-colors"
                                title="Edit Temuan"
                              >
                                <BsPencilSquare size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteTemuan(t.id)}
                                className="p-1.5 bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white rounded transition-colors"
                                title="Hapus Temuan"
                              >
                                <BsTrash size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {temuan.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                            Belum ada catatan temuan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* ====================== MODAL TAMBAH/EDIT TEMUAN ====================== */}
      {showTambahTemuan && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => { resetFormTemuan(); setShowTambahTemuan(false); }}></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-2">
                  <BsCardChecklist className="text-blue-600"/> {editTemuan ? "Edit Temuan" : "Tambah Temuan"}
                </h3>
              </div>
              <button onClick={() => { resetFormTemuan(); setShowTambahTemuan(false); }} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveTemuan} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Hal LHE</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-900 transition-all text-center"
                    value={formTemuan.halaman_lhe || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, halaman_lhe: e.target.value.replace(/\D/g, "") })}
                    placeholder="Misal: 12"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Masalah Utama Yang Dijumpai</label>
                  <textarea
                    required
                    rows="2"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-900 transition-all resize-none leading-relaxed"
                    value={formTemuan.masalah || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, masalah: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kondisi (Fakta)</label>
                  <textarea
                    required
                    rows="3"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 transition-all resize-y leading-relaxed"
                    value={formTemuan.kondisi || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, kondisi: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kriteria (Standar / Aturan)</label>
                  <textarea
                    required
                    rows="3"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 transition-all resize-y leading-relaxed"
                    value={formTemuan.kriteria || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, kriteria: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sebab (Root Cause)</label>
                  <textarea
                    required
                    rows="2"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 transition-all resize-y leading-relaxed"
                    value={formTemuan.sebab || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, sebab: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Akibat (Impact)</label>
                  <textarea
                    required
                    rows="2"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 transition-all resize-y leading-relaxed"
                    value={formTemuan.akibat || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, akibat: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Klarifikasi Auditee</label>
                  <textarea
                    rows="2"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 transition-all resize-y leading-relaxed"
                    value={formTemuan.klarifikasi_temuan || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, klarifikasi_temuan: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rekomendasi Perbaikan</label>
                  <textarea
                    required
                    rows="2"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800 transition-all resize-y leading-relaxed"
                    value={formTemuan.rekomendasi || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, rekomendasi: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Area / Proses Bisnis</label>
                  <input
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                    value={formTemuan.area || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, area: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Referensi Aturan</label>
                  <input
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all"
                    value={formTemuan.referensi || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, referensi: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Potensi Nilai Kerugian (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">Rp</span>
                    <input
                      type="text"
                      className="w-full p-2.5 pl-9 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 text-sm transition-all"
                      value={formatRupiah(formTemuan.nilai_kerugian)}
                      onChange={(e) => setFormTemuan({ ...formTemuan, nilai_kerugian: e.target.value.replace(/\D/g, "") })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Keterangan Opsional</label>
                  <textarea
                    rows="2"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 transition-all resize-none"
                    value={formTemuan.keterangan || ""}
                    onChange={(e) => setFormTemuan({ ...formTemuan, keterangan: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lampiran Pendukung</label>
                  <label htmlFor="lampiranUpload" className="border-2 border-dashed border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-50 transition-colors h-[74px]">
                    
                    {existingLampiran && !formTemuan.lampiran && (
                      <div className="flex items-center justify-center gap-3">
                        <a href={`/storage/${existingLampiran}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-[11px] hover:underline flex items-center gap-1">
                          <BsFileEarmarkText size={12}/> Lihat File
                        </a>
                        <button type="button" onClick={(e) => { e.preventDefault(); setExistingLampiran(null); }} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded border border-red-200 p-1 flex items-center justify-center transition-colors">
                          <BsX size={12}/>
                        </button>
                      </div>
                    )}

                    {formTemuan.lampiran && (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-blue-600 font-bold text-[11px] truncate max-w-[150px]">
                          {formTemuan.lampiran.name}
                        </span>
                        <button type="button" onClick={(e) => { e.preventDefault(); setFormTemuan({ ...formTemuan, lampiran: null }); }} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded border border-red-200 p-1 flex items-center justify-center transition-colors">
                          <BsX size={12}/>
                        </button>
                      </div>
                    )}

                    {!existingLampiran && !formTemuan.lampiran && (
                       <span className="text-slate-400 font-medium text-[11px] flex items-center gap-2"><BsCloudUpload size={14}/> Klik u/ upload</span>
                    )}
                  </label>
                  <input id="lampiranUpload" type="file" className="hidden" onChange={(e) => setFormTemuan({ ...formTemuan, lampiran: e.target.files[0] })} />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => { resetFormTemuan(); setShowTambahTemuan(false); }} className="flex-1 py-3 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold transition-all text-xs uppercase tracking-wider">
                  Batal
                </button>
                <button type="submit" className="flex-2 w-[60%] py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] uppercase text-[11px] tracking-widest">
                  Simpan Temuan
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

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-2">
                  <BsWallet2 className="text-blue-600"/> {editBiaya ? "Edit Biaya" : "Input Biaya Baru"}
                </h3>
              </div>
              <button onClick={() => setShowTambahBiaya(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveBiaya} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">KKA / Uraian Pemeriksaan</label>
                <select
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-pointer"
                  value={formBiaya.kka_id}
                  onChange={(e) => setFormBiaya({ ...formBiaya, kka_id: e.target.value })}
                >
                  <option value="">-- Pilih KKA --</option>
                  {kka.map((k) => (
                    <option key={k.id} value={k.id}>{k.uraian}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Item / Pengeluaran</label>
                <input
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800 transition-all"
                  value={formBiaya.nama}
                  onChange={(e) => setFormBiaya({ ...formBiaya, nama: e.target.value })}
                  placeholder="Misal: Tiket Pesawat Jakarta-Surabaya..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jenis Akomodasi</label>
                <select
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm transition-all cursor-pointer"
                  value={formBiaya.jenis_akomodasi}
                  onChange={(e) => setFormBiaya({ ...formBiaya, jenis_akomodasi: e.target.value })}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {jenisAkomodasiList.map((item) => (
                    <option key={item} value={item} className="uppercase tracking-wide">{item.replaceAll("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nilai Realisasi (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">Rp</span>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    className="w-full p-2.5 pl-9 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-800 text-sm transition-all"
                    value={formatRupiah(formBiaya.nilai_realisasi)}
                    onChange={(e) => setFormBiaya({ ...formBiaya, nilai_realisasi: e.target.value.replace(/\D/g, "") })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTambahBiaya(false)}
                  className="flex-1 py-3 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold transition-all text-xs uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 w-[60%] py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] uppercase text-[11px] tracking-widest"
                >
                  Simpan Biaya
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