import React, { useState, useEffect } from 'react';
import apiClient from "../../../../Shared/api/apiClient";
import useRealTime from "../../hooks/useRealTime";
import { useNavigate } from "react-router-dom";

import { 
  BsLightbulb, BsSearch, BsFolder2Open, 
  BsArrowRepeat, BsPeopleFill, BsFillBookmarkStarFill, 
  BsLink45Deg, BsX, BsCalendar3, BsChatDots
} from 'react-icons/bs';
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier.jsx";

const Consulting = () => {
  const navigate = useNavigate();

  const [dataConsulting, setDataConsulting] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    proyek: "",
    klien: "",
    unit_id: "",
    role_id: "",
    prioritas: "",
    tahap: "",
    deadline: "",
  });

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/consulting");
      setDataConsulting(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaster = async () => {
    try {
      const unitRes = await apiClient.get("/api/units");
      const roleRes = await apiClient.get("/api/roles");
      setUnits(unitRes.data.data || unitRes.data || []);
      setRoles(roleRes.data.data || roleRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Sinkronisasi Real-Time
  useRealTime(['consultings', 'units', 'roles'], () => {
    fetchData();
    fetchMaster();
  });

  useEffect(() => {
    fetchData();
    fetchMaster();
  }, []);

  // ================= HANDLE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await apiClient.post("/api/consulting", form);
      fetchData();
      setOpenModal(false);
      setForm({
        proyek: "", klien: "", unit_id: "", role_id: "",
        prioritas: "", tahap: "", deadline: "",
      });
      notifySuccess("Proyek consulting berhasil disimpan!");
    } catch (err) {
      console.error(err);
      notifyError("Gagal menyimpan proyek consulting");
    }
  };

  // ================= FORMAT & HELPER =================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  const getPriorityStyle = (prioritas) => {
    switch (prioritas?.toLowerCase()) {
      case "strategis": return "bg-red-50 text-red-700 border-red-200";
      case "penting": return "bg-amber-50 text-amber-700 border-amber-200";
      case "rutin": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getTahapStyle = (tahap) => {
    switch (tahap?.toLowerCase()) {
      case "designing": return "bg-sky-100 text-sky-700";
      case "implementation": return "bg-violet-100 text-violet-700";
      case "reporting": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const filteredData = dataConsulting.filter(item => 
    item.proyek?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.klien?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-violet-100">
              <BsLightbulb size={12} /> Strategic Assistance
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
              Internal <span className="text-violet-600">Consulting</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Proyek pendampingan strategis dan konsultasi untuk unit kerja organisasi.
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-violet-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 active:scale-95"
          >
            <BsLink45Deg size={20} /> Buat Proyek Baru
          </button>
        </div>

        {/* --- STATUS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatusCard label="Proyek Aktif" value={dataConsulting.length} icon={<BsArrowRepeat size={24} />} color="text-violet-600" bg="bg-violet-50" />
          <StatusCard label="Jam Konsultasi" value="120h" icon={<BsPeopleFill size={24} />} color="text-blue-600" bg="bg-blue-50" />
          <StatusCard label="Proyek Strategis" value="02" icon={<BsFillBookmarkStarFill size={24} />} color="text-amber-600" bg="bg-amber-50" />
          <StatusCard label="Dokumen Output" value="15" icon={<BsFolder2Open size={24} />} color="text-emerald-600" bg="bg-emerald-50" />
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="relative w-full md:w-96">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama proyek atau klien..."
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
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
                  <th className="px-6 py-4">Nama Proyek & Klien</th>
                  <th className="px-6 py-4">Unit Penanggung Jawab</th>
                  <th className="px-6 py-4 text-center">Akses Role</th>
                  <th className="px-6 py-4 text-center">Prioritas</th>
                  <th className="px-6 py-4 text-center">Tahap Saat Ini</th>
                  <th className="px-6 py-4 text-center">Deadline</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-slate-400 font-medium tracking-widest animate-pulse text-xs uppercase">
                      Memuat Data Konsultasi...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-violet-50/30 transition-colors group">
                      
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 text-sm leading-snug mb-1">
                          {item.proyek}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="text-violet-500">{item.kode_consulting}</span> &bull; {item.klien}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 font-bold text-xs rounded-lg">
                          {item.unit?.nama || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded border border-slate-200">
                          {item.role?.name || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getPriorityStyle(item.prioritas)}`}>
                          {item.prioritas || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getTahapStyle(item.tahap)}`}>
                          {item.tahap || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
                          <BsCalendar3 size={12} className="text-slate-400" />
                          {formatDate(item.deadline)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/consulting/${item.id}`)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 hover:bg-violet-600 hover:text-white rounded-xl transition-all shadow-sm font-bold text-xs"
                          title="Buka Ruang Diskusi"
                        >
                          <BsChatDots size={14} /> Diskusi
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400 font-medium text-sm">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <BsLightbulb size={32} className="opacity-20" />
                        Belum ada proyek konsultasi yang dibuat.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL FORM ================= */}
        {openModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <BsLink45Deg className="text-violet-600" size={28} /> Buat Proyek Baru
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    Setup ruang diskusi dan target penyelesaian
                  </p>
                </div>
                <button 
                  onClick={() => setOpenModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <BsX size={28} />
                </button>
              </div>

              <div className="space-y-5">
                
                {/* ROW 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Proyek Konsultasi</label>
                    <input
                      name="proyek"
                      required
                      value={form.proyek}
                      onChange={handleChange}
                      placeholder="Contoh: Audit Sistem Informasi..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Klien (Pemohon)</label>
                    <input
                      name="klien"
                      required
                      value={form.klien}
                      onChange={handleChange}
                      placeholder="Contoh: Divisi Keuangan..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold text-sm transition-all"
                    />
                  </div>
                </div>

                {/* ROW 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Penanggung Jawab</label>
                    <select
                      name="unit_id"
                      required
                      value={form.unit_id}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold text-sm transition-all cursor-pointer"
                    >
                      <option value="">-- Pilih Unit --</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Akses Role (Keamanan Data)</label>
                    <select
                      name="role_id"
                      required
                      value={form.role_id}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold text-sm transition-all cursor-pointer"
                    >
                      <option value="">-- Pilih Role Spesifik --</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* ROW 3 */}
                <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest ml-1">Prioritas</label>
                    <select
                      name="prioritas"
                      required
                      value={form.prioritas}
                      onChange={handleChange}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-bold text-slate-700 text-sm transition-all cursor-pointer"
                    >
                      <option value="">-- Pilih --</option>
                      <option value="Strategis">Strategis (High)</option>
                      <option value="Penting">Penting (Medium)</option>
                      <option value="Rutin">Rutin (Low)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest ml-1">Tahapan Saat Ini</label>
                    <select
                      name="tahap"
                      required
                      value={form.tahap}
                      onChange={handleChange}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-bold text-slate-700 text-sm transition-all cursor-pointer"
                    >
                      <option value="">-- Pilih --</option>
                      <option value="Designing">Designing</option>
                      <option value="Implementation">Implementation</option>
                      <option value="Reporting">Reporting</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest ml-1">Deadline Penyelesaian</label>
                    <div className="relative">
                      <BsCalendar3 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        name="deadline"
                        required
                        value={form.deadline}
                        onChange={handleChange}
                        className="w-full py-3 pl-9 pr-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-bold text-slate-700 text-sm transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
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
                    <BsLink45Deg size={20} /> Buat Ruang Diskusi Proyek
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

// ================= KOMPONEN STATUS CARD =================
const StatusCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-violet-200 transition-all group cursor-default">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
  </div>
);

export default Consulting;
