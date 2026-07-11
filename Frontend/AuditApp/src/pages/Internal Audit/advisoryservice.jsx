import React, { useEffect, useState } from "react";
import apiClient from "../../../../Shared/api/apiClient";
import useRealTime from "../../hooks/useRealTime";
import {
  BsChatLeftText,
  BsSearch,
  BsLightningCharge,
  BsPeople,
  BsCalendar3,
  BsX,
  BsClock,
  BsPerson,
  BsTelephone,
  BsPencilSquare,
  BsTrash
} from "react-icons/bs";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";

const AdvisoryService = () => {
  const [dataAdvisory, setDataAdvisory] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUnitTerm, setSearchUnitTerm] = useState("");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const [form, setForm] = useState({
    tanggal_kegiatan: "",
    unit_id: "",
    contact_person: "",
    no_telepon: "",
    waktu_mulai: "",
    waktu_selesai: "",
    uraian_konsultasi: "",
    opini_spi: "",
    pengawas: "",
    keterangan: "",
  });

  // ================= FETCH =================
  // Sinkronisasi Real-Time
  useRealTime(['advisory_services', 'units', 'users'], () => {
    fetchData();
    fetchUnits();
    fetchUsers();
  });

  useEffect(() => {
    fetchData();
    fetchUnits();
    fetchUsers();
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await apiClient.get("/api/units");
      setUnits(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal fetch unit", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/api/users");
      setUsers(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal fetch users", err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/api/advisory-service");
      setDataAdvisory(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal fetch advisory", err);
    }
  };

  // ================= HANDLE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));

      // Append unit text since backend DB requires 'unit' column
      const selectedUnit = units.find(u => u.id == form.unit_id);
      if (selectedUnit) {
        formData.append("unit", selectedUnit.nama);
      }

      if (isEdit) {
        await apiClient.post(`/api/advisory-service/${selectedId}?_method=PUT`, formData);
      } else {
        await apiClient.post("/api/advisory-service", formData);
      }

      fetchData();
      setOpenModal(false);
      setIsEdit(false);
      setSelectedId(null);
      resetForm();
      notifySuccess("Data advisory berhasil disimpan!");
    } catch (err) {
      console.error(err);
      notifyError("Gagal simpan data advisory");
    }
  };

  const handleEdit = (item) => {
    setForm({
      tanggal_kegiatan: item.tanggal_kegiatan || "",
      unit_id: item.unit_id || "",
      contact_person: item.contact_person || "",
      no_telepon: item.no_telepon || "",
      waktu_mulai: item.waktu_mulai ? item.waktu_mulai.substring(0, 5) : "",
      waktu_selesai: item.waktu_selesai ? item.waktu_selesai.substring(0, 5) : "",
      uraian_konsultasi: item.uraian_konsultasi || "",
      opini_spi: item.opini_spi || "",
      pengawas: item.pengawas || "",
      keterangan: item.keterangan || "",
    });

    const unitName = item.unit || units.find(u => u.id == item.unit_id)?.nama || "";
    setSearchUnitTerm(unitName);

    setSelectedId(item.id);
    setIsEdit(true);
    setOpenModal(true);
  };

  const handleDelete = (id) => {
    notifyConfirm("Yakin ingin menghapus data advisory ini?", async () => {
      try {
        await apiClient.delete(`/api/advisory-service/${id}`);
        fetchData();
        notifySuccess("Data advisory berhasil dihapus!");
      } catch (err) {
        notifyError("Gagal menghapus data");
      }
    });
  };

  const resetForm = () => {
    setForm({
      tanggal_kegiatan: "",
      unit_id: "",
      contact_person: "",
      no_telepon: "",
      waktu_mulai: "",
      waktu_selesai: "",
      uraian_konsultasi: "",
      opini_spi: "",
      pengawas: "",
      keterangan: "",
    });
    setSearchUnitTerm("");
  };

  // Format Tanggal (Opsional untuk tampilan tabel)
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredData = dataAdvisory.filter(item => 
    (item.unit?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.uraian_konsultasi?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="px-4 sm:px-8 py-4 font-sans">
      <div className="w-full">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-indigo-100">
              <BsChatLeftText size={12} /> Consulting & Support
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
              Advisory <span className="text-indigo-600">Service</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Pencatatan dan dokumentasi layanan konsultasi SPI untuk unit kerja.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsEdit(false);
              setOpenModal(true);
            }}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <BsLightningCharge size={18} /> Tambah Konsultasi
          </button>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="relative w-full md:w-96">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari unit, kontak, atau topik..."
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 text-center w-16">No</th>
                  <th className="px-6 py-4">Waktu & Tanggal</th>
                  <th className="px-6 py-4">Unit Kerja</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Topik / Uraian</th>
                  <th className="px-6 py-4">Pengawas (SPI)</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <BsCalendar3 className="text-indigo-500" size={12} /> {formatDate(item.tanggal_kegiatan)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {item.waktu_mulai.substring(0,5)} - {item.waktu_selesai.substring(0,5)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-wider rounded-lg">
                        {item.unit || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{item.contact_person}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><BsTelephone size={10}/> {item.no_telepon || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600 line-clamp-2 max-w-xs" title={item.uraian_konsultasi}>
                        {item.uraian_konsultasi || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                       <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 w-fit">
                          <BsPerson size={12} /> {item.pengawas || "-"}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center justify-center p-2 bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Edit Data"
                        >
                          <BsPencilSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center justify-center p-2 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Hapus Data"
                        >
                          <BsTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400 font-medium text-sm">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <BsChatLeftText size={32} className="opacity-20" />
                        Belum ada data advisory service.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL FORM --- */}
        {openModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <BsLightningCharge className="text-indigo-500" size={24} /> {isEdit ? "Edit" : "Tambah"} Advisory Service
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Formulir pencatatan layanan konsultasi
                  </p>
                </div>
                <button
                  onClick={() => setOpenModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <BsX size={28} />
                </button>
              </div>

              <div className="space-y-6">
                
                {/* ROW 1: WAKTU */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tanggal Kegiatan</label>
                    <input
                      type="date"
                      name="tanggal_kegiatan"
                      value={form.tanggal_kegiatan}
                      onChange={handleChange}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Waktu Mulai</label>
                    <input
                      type="time"
                      name="waktu_mulai"
                      value={form.waktu_mulai}
                      onChange={handleChange}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Waktu Selesai</label>
                    <input
                      type="time"
                      name="waktu_selesai"
                      value={form.waktu_selesai}
                      onChange={handleChange}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* ROW 2: IDENTITAS KLIEN */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Unit / Divisi (Auditee)</label>
                    <input
                      type="text"
                      placeholder="-- Ketik atau Pilih Unit --"
                      value={searchUnitTerm}
                      onChange={(e) => {
                        setSearchUnitTerm(e.target.value);
                        setForm({ ...form, unit_id: "" });
                        setShowUnitDropdown(true);
                      }}
                      onFocus={() => setShowUnitDropdown(true)}
                      onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                    />
                    {showUnitDropdown && (
                      <ul className="absolute z-[9999] top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {units
                          .filter(u => u.nama.toLowerCase().includes(searchUnitTerm.toLowerCase()))
                          .map((u) => (
                          <li
                            key={u.id}
                            onMouseDown={() => {
                              setSearchUnitTerm(u.nama);
                              setForm({ ...form, unit_id: u.id });
                              setShowUnitDropdown(false);
                            }}
                            className="p-3.5 hover:bg-indigo-50 cursor-pointer text-sm font-semibold text-slate-700 transition-colors"
                          >
                            {u.nama}
                          </li>
                        ))}
                        {units.filter(u => u.nama.toLowerCase().includes(searchUnitTerm.toLowerCase())).length === 0 && (
                          <li className="p-3.5 text-sm text-slate-400 italic text-center">Unit tidak ditemukan</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contact Person (PIC)</label>
                    <input
                      name="contact_person"
                      placeholder="Nama lengkap PIC"
                      value={form.contact_person}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nomor Telepon</label>
                    <input
                      name="no_telepon"
                      placeholder="08xxxxxxxxxx"
                      value={form.no_telepon}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* ROW 3: URAIAN & OPINI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Uraian / Topik Konsultasi</label>
                    <textarea
                      name="uraian_konsultasi"
                      placeholder="Jelaskan secara detail topik permasalahan atau kebutuhan konsultasi dari auditee..."
                      value={form.uraian_konsultasi}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm h-32 resize-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Opini / Saran SPI</label>
                    <textarea
                      name="opini_spi"
                      placeholder="Tuliskan saran, solusi, atau opini yang diberikan oleh SPI atas konsultasi tersebut..."
                      value={form.opini_spi}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm h-32 resize-none"
                    />
                  </div>
                </div>

                {/* ROW 4: INTERNAL SPI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Auditor Penanggung Jawab</label>
                    <div className="relative">
                       <BsPeople className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                       <select
                        name="pengawas"
                        value={form.pengawas}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm appearance-none"
                      >
                        <option value="">-- Pilih Auditor --</option>
                        {users
                          .filter(u => u.roles?.some(r => r.name.toLowerCase() === "auditor"))
                          .map(u => (
                            <option key={u.id} value={u.name}>{u.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Catatan Tambahan</label>
                    <input
                      name="keterangan"
                      placeholder="Opsional (Catatan lain jika ada)"
                      value={form.keterangan}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* TOMBOL */}
                <div className="flex gap-3 pt-6 mt-4">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="flex-1 py-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-2 w-[60%] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <BsLightningCharge size={18} /> Simpan Advisory
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisoryService;
