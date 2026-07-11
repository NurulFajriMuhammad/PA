import React, { useState, useEffect } from "react";
import {
  BsPlusLg,
  BsSearch,
  BsPencilSquare,
  BsTrash,
  BsX,
  BsPrinter,
} from "react-icons/bs";
import {
  Hash,
  Calendar,
  FileText,
  UserCheck,
  UserCircle,
  Users,
} from "lucide-react";
import apiClient from "../../../../Shared/api/axios";
import useRealTime from "../../hooks/useRealTime";
import { notifySuccess, notifyError, notifyConfirm } from "@shared/utils/notifier.jsx";

// --- CSS KHUSUS UNTUK PRINTING (Sembunyikan Web, Tampilkan Kertas) ---
const printStyles = `
  @media screen {
    #print-area {
      display: none;
    }
  }
  @media print {
    body {
      background-color: white !important;
    }
    .no-print {
      display: none !important;
    }
    #print-area {
      display: block !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 1cm 1.5cm 1.5cm 1.5cm !important;
      box-sizing: border-box !important;
    }
    @page {
      size: A4 portrait;
      margin: 0 !important;
    }
  }
`;

const SuratTugas = () => {
  const [users, setUsers] = useState([]);
  const [dataSurat, setDataSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurat, setSelectedSurat] = useState(null);

  const [formData, setFormData] = useState({
    nomor_surat: "",
    tanggal_surat: new Date().toISOString().split("T")[0],
    tgl_mulai: "",
    tgl_selesai: "",
    deskripsi: "",
    koordinator: "",
    pengendali_teknis: "",
    ketua: "",
    auditor: [],
  });

  const handleSelectAuditor = (name) => {
    if (!formData.auditor.includes(name) && name !== "") {
      setFormData({
        ...formData,
        auditor: [...formData.auditor, name],
      });
    }
  };

  const removeAuditor = (name) => {
    setFormData({
      ...formData,
      auditor: formData.auditor.filter((a) => a !== name),
    });
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/api/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Gagal ambil users:", err);
    }
  };

  const renderUserOptions = (roleName = null) => {
    let filtered = users;
    if (roleName) {
      filtered = users.filter((user) =>
        user.roles?.some((r) => r.name.toLowerCase() === roleName.toLowerCase())
      );
    }
    return filtered.map((user) => (
      <option key={user.id} value={user.name}>
        {user.name}
      </option>
    ));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/surat-tugas");
      setDataSurat(res.data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sinkronisasi Real-Time
  useRealTime(['surat_tugas', 'users'], () => {
    fetchData();
    fetchUsers();
  });

  useEffect(() => {
    fetchData();
    fetchUsers();
    
    // Inject CSS Print ke dalam Head
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      auditor: formData.auditor.join(", "),
      periode_pemeriksaan: `${formData.tgl_mulai} s/d ${formData.tgl_selesai}`,
    };

    try {
      if (editId) {
        await apiClient.put(`/api/surat-tugas/${editId}`, payload);
      } else {
        await apiClient.post("/api/surat-tugas", payload);
      }
      setShowModal(false);
      resetForm();
      fetchData();
      notifySuccess("Data surat tugas berhasil disimpan!");
    } catch (err) {
      notifyError("Gagal menyimpan data.");
    }
  };

  const resetForm = () => {
    setFormData({
      nomor_surat: "",
      tanggal_surat: new Date().toISOString().split("T")[0],
      tgl_mulai: "",
      tgl_selesai: "",
      deskripsi: "",
      koordinator: "",
      pengendali_teknis: "",
      ketua: "",
      auditor: [], 
    });
    setEditId(null);
  };

  const hitungHariKerja = (range) => {
    if (!range) return 0;
    const [start, end] = range.split(" s/d ");
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const handleEdit = (item) => {
    const tgl = item.periode_pemeriksaan?.split(" s/d ") || ["", ""];
    setEditId(item.id);
    setFormData({
      ...item,
      tgl_mulai: tgl[0],
      tgl_selesai: tgl[1],
      auditor: item.auditor ? item.auditor.split(", ") : [],
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    notifyConfirm("Hapus data surat tugas ini?", async () => {
      try {
        await apiClient.delete(`/api/surat-tugas/${id}`);
        fetchData();
        notifySuccess("Surat tugas berhasil dihapus!");
      } catch (err) {
        notifyError("Gagal menghapus");
      }
    });
  };

  const handlePrint = (item) => {
    setSelectedSurat(item);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const getUserRole = (name) => {
    const user = users.find((u) => u.name === name);
    return user?.roles?.[0]?.name || "-";
  };

  const filteredData = dataSurat.filter(
    (item) =>
      item.nomor_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatAuditors = () => {
    if (!selectedSurat?.auditor) return [];
    return selectedSurat.auditor.split(", ");
  };

  const formatTanggalIndo = (tanggal) => {
    if (!tanggal) return "";
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const tgl = new Date(tanggal);
    return `${tgl.getDate()} ${bulan[tgl.getMonth()]} ${tgl.getFullYear()}`;
  };

  const formatTanggalTable = (tanggal) => {
    if (!tanggal) return "";
    const tgl = new Date(tanggal);
    const day = String(tgl.getDate()).padStart(2, "0");
    const month = String(tgl.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${tgl.getFullYear()}`;
  };

  const isExpired = (periodeStr) => {
    if (!periodeStr) return false;
    const parts = periodeStr.split(" s/d ");
    if (parts.length !== 2) return false;
    const endDateStr = parts[1];
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    const today = new Date();
    return today > endDate;
  };

  const getPrintDateIndo = () => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const today = new Date();
    const dayName = days[today.getDay()];
    const dateNum = String(today.getDate()).padStart(2, "0");
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  };

  return (
    <>
      {/* ========================================= */}
      {/* TAMPILAN WEB UI (AKAN HILANG SAAT PRINT)  */}
      {/* ========================================= */}
      <div className="no-print px-4 sm:px-8 py-4 font-sans">
        <div className="w-full">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                  <FileText size={12} /> Legal & Compliance
                </div>
                <div className="inline-flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                  IIA Std. 2200
                </div>
              </div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
                Surat <span className="text-indigo-600">Tugas</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                Manajemen penerbitan dan pencetakan surat tugas untuk tim auditor.
              </p>
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              <BsPlusLg size={18} /> Buat Surat Tugas Baru
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <div className="relative w-full md:w-96">
              <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nomor atau deskripsi surat..."
                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 transition-all">
            {loading ? (
              <div className="text-center py-24 text-slate-400 font-medium tracking-widest animate-pulse text-xs uppercase flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                Memuat Data Surat Tugas...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#111827] text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-800">
                      <th className="px-6 py-5 text-center w-20">No</th>
                      <th className="px-6 py-5">Nomor Penugasan Audit</th>
                      <th className="px-6 py-5">Tanggal Dibuat</th>
                      <th className="px-6 py-5">Deskripsi / Penugasan</th>
                      <th className="px-6 py-5 text-right pr-10">Aksi & Dokumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                        <td className="px-6 py-6 text-center">
                          <span className="text-xs font-black text-slate-400 font-mono">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-black text-indigo-600 uppercase tracking-tight group-hover:text-indigo-700 transition-colors">
                              {item.nomor_surat}
                            </span>
                            {(() => {
                              const expired = isExpired(item.periode_pemeriksaan);
                              const dates = item.periode_pemeriksaan?.split(" s/d ") || ["", ""];
                              const start = dates[0] ? formatTanggalTable(dates[0]) : "-";
                              const end = dates[1] ? formatTanggalTable(dates[1]) : "-";
                              return (
                                <div className="flex flex-col gap-1 mt-1">
                                  <span className="text-[10px] font-bold text-slate-500">
                                    Periode: {start} s/d {end}
                                  </span>
                                  {expired ? (
                                    <span className="inline-flex items-center gap-1 w-fit bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-100">
                                      🔒 Expired & Terkunci
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 w-fit bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                      ✓ Aktif
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 bg-slate-100 w-fit px-3 py-1.5 rounded-lg border border-slate-200">
                            <Calendar size={14} className="text-indigo-500" />
                            {formatTanggalTable(item.tanggal_surat)}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="max-w-md">
                            <p className="text-sm font-bold text-slate-800 leading-relaxed line-clamp-2 mb-1.5">
                              {item.deskripsi}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserCheck size={10} className="text-indigo-600" />
                              </div>
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                                Ketua Tim: <span className="text-slate-800">{item.ketua}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right pr-8">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handlePrint(item)}
                              className="flex items-center justify-center w-10 h-10 bg-white text-slate-600 hover:bg-emerald-500 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow-emerald-100 active:scale-95"
                              title="Cetak Surat Tugas"
                            >
                              <BsPrinter size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="flex items-center justify-center w-10 h-10 bg-white text-slate-600 hover:bg-amber-500 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow-amber-100 active:scale-95"
                              title="Edit"
                            >
                              <BsPencilSquare size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center justify-center w-10 h-10 bg-white text-slate-600 hover:bg-red-500 hover:text-white border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow-red-100 active:scale-95"
                              title="Hapus"
                            >
                              <BsTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-24 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                              <FileText size={32} />
                            </div>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Belum ada surat tugas</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* MODAL FORM WEB */}
          {showModal && (
            <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                      <FileText className="text-indigo-500" size={24} /> {editId ? "Edit" : "Tambah"} Surat Tugas
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                      Isi detail penugasan dan personil tim
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <BsX size={28} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Info Surat */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Hash size={12} /> Nomor Surat
                      </label>
                      <input
                        required
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-indigo-700 uppercase"
                        value={formData.nomor_surat}
                        onChange={(e) => setFormData({ ...formData, nomor_surat: e.target.value })}
                        placeholder="ST-001/SPI/2026"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Calendar size={12} /> Tanggal Dikeluarkan
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm text-slate-700"
                        value={formData.tanggal_surat}
                        onChange={(e) => setFormData({ ...formData, tanggal_surat: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <FileText size={12} /> Deskripsi Penugasan
                    </label>
                    <textarea
                      required
                      rows="3"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      placeholder="Contoh: Audit operasional bagian gudang bahan baku..."
                    />
                  </div>

                  {/* Periode */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <Calendar size={12} /> PERIODE PEMERIKSAAN
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Mulai
                        </label>
                        <input
                          type="date"
                          required
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm text-slate-700"
                          value={formData.tgl_mulai}
                          onChange={(e) => {
                            const newMulai = e.target.value;
                            setFormData((prev) => {
                              const updated = { ...prev, tgl_mulai: newMulai };
                              if (prev.tgl_selesai && prev.tgl_selesai < newMulai) {
                                updated.tgl_selesai = "";
                              }
                              return updated;
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Selesai
                        </label>
                        <input
                          type="date"
                          required
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm text-slate-700"
                          value={formData.tgl_selesai}
                          min={formData.tgl_mulai}
                          onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 pb-2">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">PERSONIL TIM AUDIT</p>
                  </div>

                  {/* Tim Inti */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <UserCheck size={12} /> Koordinator
                      </label>
                      <select
                        required
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                        value={formData.koordinator}
                        onChange={(e) => setFormData({ ...formData, koordinator: e.target.value })}
                      >
                        <option value="">Pilih Koordinator...</option>
                        {renderUserOptions("koordinator")}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <UserCircle size={12} /> Pengendali Teknis
                      </label>
                      <select
                        required
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                        value={formData.pengendali_teknis}
                        onChange={(e) => setFormData({ ...formData, pengendali_teknis: e.target.value })}
                      >
                        <option value="">Pilih Pengendali Teknis...</option>
                        {renderUserOptions("Pengendali Teknis")}
                      </select>
                    </div>
                  </div>

                  {/* Tim Pelaksana */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Users size={12} /> Ketua Tim
                      </label>
                      <select
                        required
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                        value={formData.ketua}
                        onChange={(e) => setFormData({ ...formData, ketua: e.target.value })}
                      >
                        <option value="">Pilih Ketua Tim...</option>
                        {renderUserOptions("Ketua")}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Anggota Tim / Auditor
                      </label>
                      <select
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm mb-2"
                        onChange={(e) => {
                          handleSelectAuditor(e.target.value);
                          e.target.value = "";
                        }}
                      >
                        <option value="">+ Tambah Auditor...</option>
                        {renderUserOptions("auditor")}
                      </select>

                      <div className="flex flex-wrap gap-2">
                        {formData.auditor.map((a, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md text-[11px] font-bold border border-indigo-200">
                            {a}
                            <button type="button" onClick={() => removeAuditor(a)} className="hover:text-red-500 ml-1">
                              <BsX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-4 text-slate-500 bg-red-100 hover:bg-red-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-2 w-[60%] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest"
                    >
                      Simpan Surat Tugas
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAMPILAN PRINT (KERTAS A4) - DIKEMBALIKAN KE KODE ASLI FAJRI */}
      {/* ============================================================ */}
      <div id="print-area">
        {selectedSurat && (
          <div style={{ fontFamily: '"Times New Roman", Times, serif', color: "black", width: "100%", maxWidth: "21cm", margin: "0 auto" }}>
            
            {/* CUSTOM PRINT HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#666", marginBottom: "10px" }}>
              <span>{getPrintDateIndo()}</span>
              <span>AuditApp</span>
            </div>
            
            {/* KOP SURAT */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>PT. FAJX-TECH SOLUSINDO.</h2>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>
                SATUAN PENGAWASAN INTERN (SPI)
              </p>
              <hr style={{ marginTop: "10px", border: "1px solid black" }} />
            </div>

            {/* JUDUL */}
            <h1
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "20px",
                letterSpacing: "1px",
                marginBottom: "5px",
                textDecoration: "underline"
              }}
            >
              SURAT TUGAS
            </h1>

            <p style={{ textAlign: "center", fontSize: "14px", marginBottom: "25px" }}>
              <b>NOMOR : {selectedSurat.nomor_surat}</b>
            </p>

            {/* PEMBUKA */}
            <p style={{ marginTop: "25px", textAlign: "justify", fontSize: "14px", lineHeight: "1.5" }}>
              Manajer Senior Satuan Pengawasan Intern PT FAJX-TECH SOLUSINDO
              Tbk dengan ini menugaskan kepada:
            </p>

            {/* TABEL TIM */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px", marginBottom: "20px", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid black", padding: "8px", width: "50px" }}>No</th>
                  <th style={{ border: "1px solid black", padding: "8px" }}>Nama</th>
                  <th style={{ border: "1px solid black", padding: "8px" }}>Jabatan / Peran</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>1</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{selectedSurat.koordinator}</td>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>
                    {getUserRole(selectedSurat.koordinator)} / Koordinator
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>2</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{selectedSurat.pengendali_teknis}</td>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>
                    {getUserRole(selectedSurat.pengendali_teknis)} / Pengendali Teknis
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>3</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{selectedSurat.ketua}</td>
                  <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>
                    {getUserRole(selectedSurat.ketua)} / Ketua Tim
                  </td>
                </tr>
                {formatAuditors().map((auditor, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{index + 4}</td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>{auditor}</td>
                    <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>
                      {getUserRole(auditor)} / Auditor
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ISI SURAT */}
            <p style={{ marginTop: "20px", textAlign: "justify", fontSize: "14px", lineHeight: "1.5" }}>
              Untuk melaksanakan pemeriksaan <b>{selectedSurat.deskripsi}</b>.
              Penugasan ini dilaksanakan selama
              <b> {hitungHariKerja(selectedSurat.periode_pemeriksaan)} </b> hari
              kerja terhitung mulai tanggal
              <b> {formatTanggalIndo(selectedSurat.periode_pemeriksaan?.split(" s/d ")[0])} </b>
              sampai dengan
              <b> {formatTanggalIndo(selectedSurat.periode_pemeriksaan?.split(" s/d ")[1])}</b>.
            </p>

            <p style={{ textAlign: "justify", fontSize: "14px", lineHeight: "1.5", marginTop: "10px" }}>
              Segala pengeluaran akibat dikeluarkannya Surat Tugas ini
              dibebankan kepada anggaran operasional perusahaan.
            </p>

            {/* TANDA TANGAN */}
            <div style={{ marginTop: "40px", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ textAlign: "center", width: "250px" }}>
                <p style={{ fontSize: "14px", margin: "0 0 5px 0" }}>Lamongan, {formatTanggalIndo(selectedSurat.tanggal_surat)}</p>
                <p style={{ fontSize: "14px", margin: "0 0 60px 0" }}><b>KEPALA SPI</b></p>
                <p style={{ fontSize: "14px", margin: 0 }}>
                  <b>
                    ({users.find((u) =>
                      u.roles?.some((r) => r.name.toLowerCase() === "kepala spi")
                    )?.name || "........................................"})
                  </b>
                </p>
              </div>
            </div>

            {/* TEMBUSAN */}
            <div style={{ marginTop: "30px", fontSize: "12px", lineHeight: "1.5" }}>
              <p style={{ marginBottom: "5px" }}><b>Tembusan:</b></p>
              <p style={{ margin: "2px 0" }}>1. Direktur Utama PT FAJX-TECH SOLUSINDO</p>
              <p style={{ margin: "2px 0" }}>2. Arsip</p>
              <br />
              <p style={{ marginBottom: "5px" }}><b>Layanan Pengaduan / Hotline:</b></p>
              <p style={{ margin: "0", fontStyle: "italic" }}>
                Apabila Pengawas Unit Kerja SPI menerima atau meminta
                gratifikasi / suap, dapat dilaporkan melalui mekanisme
                penyampaian pengaduan.
              </p>
            </div>
            
          </div>
        )}
      </div>
    </>
  );
};

export default SuratTugas;
