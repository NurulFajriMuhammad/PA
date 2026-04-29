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

const ExternalAuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openInfo, setOpenInfo] = useState(false);
  const [temuan, setTemuan] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [statusTemuanList, setStatusTemuanList] = useState([]);

  // Fetch status temuan untuk warna badge
  useEffect(() => {
    apiClient.get('/api/status-temuan').then(res => {
      setStatusTemuanList(res.data || []);
    }).catch(() => {});
  }, []);

  // Helper: ambil style badge dari daftar status
  const getStatusTemuan = (val) => {
    const found = statusTemuanList.find(
      s => s.nama.toLowerCase() === (val || '').toLowerCase()
    );
    return found ? { bg: found.warna, text: found.warna_teks, label: found.nama }
                 : (val === 'monev'
                   ? { bg: '#d1fae5', text: '#059669', label: 'Monev' }
                   : { bg: '#fef3c7', text: '#d97706', label: val || 'Draft' });
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
      nilai_kerugian: item.nilai_kerugian || ""
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
        alert("Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
    fetchTemuan();
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
      } else if (!existingLampiran) {
        formData.append("lampiran", null);
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

      formData.append("status", isComplete ? "monev" : "draft");

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
        rekomendasi: "", rencana: "", keterangan: "", target_penyelesaian: "", nilai_kerugian: ""
      });
      setLheFile(null);

    } catch (err) {
      console.error(err);
      alert("Gagal simpan");
    }
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
    nilai_kerugian: ""
  });

  const formatRupiah = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  const handleDelete = async (idTemuan) => {
    if (!window.confirm("Yakin hapus data?")) return;
    try {
      await apiClient.delete(`/api/external-audit-temuan/${idTemuan}`);
      fetchTemuan();
    } catch (e) {
      console.error(e);
      alert("Gagal Menghapus Data");
    }
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
      nilai_kerugian: ""
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
              <span className={`px-3 py-1 rounded-md text-xs font-bold
                ${data.status === "Selesai"
                  ? "bg-green-600"
                  : "bg-blue-600"} text-white`}
              >
                {data.status || "Planning"}
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50/80 border-b border-slate-200 gap-4">
          <div>
            <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BsCardChecklist className="text-slate-700" /> Daftar Temuan
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hasil Evaluasi Eksternal</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            <BsPlusLg size={14} /> Tambah Temuan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr className="uppercase text-[10px] tracking-widest font-bold text-left">
                <th className="py-3 px-2 text-center w-8">No</th>
                <th className="py-3 px-2">Masalah</th>
                <th className="py-3 px-2">Kriteria</th>
                <th className="py-3 px-2">Sebab</th>
                <th className="py-3 px-2">Akibat</th>
                <th className="py-3 px-2">Kondisi</th>
                <th className="py-3 px-2 text-blue-600">Rekomendasi</th>
                <th className="py-3 px-2 text-blue-600">Rencana</th>
                <th className="py-3 px-2 text-blue-600">Keterangan</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-2 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {temuan.length > 0 ? (
                temuan.map((t, i) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group text-[12px] align-top">
                    <td className="px-2 py-3 text-center text-slate-400 font-mono text-[11px] font-bold bg-slate-50/50 group-hover:bg-transparent">
                      {i + 1}
                    </td>
                    <td className="px-2 py-3 font-bold text-slate-800 leading-relaxed break-words">
                      {t.masalah}
                    </td>
                    <td className="px-2 py-3 leading-relaxed text-slate-600 break-words">
                      {t.kriteria}
                    </td>
                    <td className="px-2 py-3 leading-relaxed text-slate-600 break-words">
                      {t.sebab}
                    </td>
                    <td className="px-2 py-3 text-red-600 font-medium leading-relaxed break-words">
                      {t.akibat}
                    </td>
                    <td className="px-2 py-3 text-slate-600 italic leading-relaxed break-words">
                      {t.kondisi}
                    </td>
                    <td className="px-2 py-3 bg-blue-50/30 text-blue-700 font-bold leading-relaxed break-words">
                      {t.rekomendasi}
                    </td>
                    <td className="px-2 py-3 bg-blue-50/30 text-slate-700 leading-relaxed break-words">
                      {t.rencana}
                    </td>
                    <td className="px-2 py-3 text-slate-500 text-[11px] break-words">
                      {t.keterangan || "-"}
                    </td>
                    <td className="px-2 py-3 text-center align-middle">
                      {(() => {
                        const st = getStatusTemuan(t.status);
                        return (
                          <span
                            className="inline-flex items-center justify-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest"
                            style={{ backgroundColor: st.bg, color: st.text }}
                          >
                            {st.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-2 py-3 text-center align-middle">
                      <div className="flex flex-row justify-center gap-1.5">
                        <button 
                          onClick={() => handleEdit(t)}
                          className="p-1.5 bg-slate-100 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors border border-slate-200 hover:border-transparent flex items-center justify-center" title="Edit"
                        >
                          <BsPencilSquare size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 bg-slate-100 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-slate-200 hover:border-transparent flex items-center justify-center" title="Hapus"
                        >
                          <BsTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="p-16 text-center text-slate-400 italic">
                    <div className="flex flex-col items-center gap-3">
                      <BsFileEarmarkText size={40} className="text-slate-200" />
                      <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Belum ada data temuan yang diinput</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  name="masalah" value={form.masalah || ""} placeholder="Uraian masalah utama..." onChange={handleChange} required
                  className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kondisi</label>
                  <textarea 
                    name="kondisi" value={form.kondisi || ""} placeholder="Fakta di lapangan..." onChange={handleChange} required
                    className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 resize-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kriteria</label>
                  <textarea 
                    name="kriteria" value={form.kriteria || ""} placeholder="Aturan/Standard yang dilanggar..." onChange={handleChange} required
                    className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sebab</label>
                  <input 
                    name="sebab" value={form.sebab || ""} placeholder="Penyebab terjadinya masalah..." onChange={handleChange} required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">Akibat / Dampak</label>
                  <input 
                    name="akibat" value={form.akibat || ""} placeholder="Dampak/Kerugian yang timbul..." onChange={handleChange} required
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
                    type="date" name="target_penyelesaian" required
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
                    name="rekomendasi" placeholder="Saran perbaikan..." value={form.rekomendasi || ""} onChange={handleChange} required
                    className="w-full h-24 p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-800 text-sm resize-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rencana Tindakan Auditee</label>
                  <textarea 
                    name="rencana" value={form.rencana || ""} placeholder="Langkah konkret auditee..." onChange={handleChange} required
                    className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
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

    </div>
  );
};

export default ExternalAuditDetail;