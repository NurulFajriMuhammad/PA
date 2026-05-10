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
  BsCollection, BsX, BsPrinter, 
  BsCalendar, BsChatLeftText, BsLink45Deg, BsEyeFill,
  BsFileEarmarkPdf, BsPerson, BsGraphUp, BsPencilSquare,
  BsCardChecklist, BsTrash, BsCheckCircleFill
} from 'react-icons/bs';
import { notifySuccess, notifyError, notifyConfirm } from "../../../Shared/utils/notifier.jsx";
import apiClient from "../../../Shared/api/apiClient";
import useRealTime from "../hooks/useRealTime";
import DetailTindakLanjut from "./detailtindaklanjut.jsx";


const MONTH_OPTIONS = [
  { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, { value: 3, label: "Maret" },
  { value: 4, label: "April" }, { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
  { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, { value: 9, label: "September" },
  { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Desember" },
];

const FollowUp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenisAudit, setFilterJenisAudit] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [dataFollowUp, setDataFollowUp] = useState([]);
  const [mode, setMode] = useState("list");
  const [statusTemuanList, setStatusTemuanList] = useState([]);

  // Ambil data user untuk cek role
  const currentUserContainer = JSON.parse(localStorage.getItem("user") || "{}");
  const user = currentUserContainer.user || currentUserContainer; // Fallback jika struktur flat
  
  const isAuditor = user?.role?.toLowerCase().includes("auditor") || 
                    user?.roles?.some(r => r.name?.toLowerCase().includes("auditor")) ||
                    (typeof user?.role === 'string' && user.role.toLowerCase().includes("auditor"));

  // Fetch status temuan untuk warna badge
  useEffect(() => {
    apiClient.get('/api/status-temuan').then(res => {
      setStatusTemuanList(res.data || []);
    }).catch(() => {});
  }, []);

  const getStatusConfig = (status) => {
    const v = (status || "").toLowerCase();
    const found = statusTemuanList.find((s) => {
      const n = s.nama.toLowerCase();
      return n === v || n.includes(v) || v.includes(n);
    });

    if (found) {
      return { bg: found.warna, text: found.warna_teks, label: found.nama };
    }

    // Fallback
    if (v === "draft" || v === "draft temuan") return { bg: "#f1f5f9", text: "#64748b", label: "Draft Temuan" };
    if (v === "pengisian tindak lanjut") return { bg: "#dbeafe", text: "#1e40af", label: "Pengisian Tindak Lanjut" };
    if (v === "pengisian tindak lanjut temuan") return { bg: "#e0f2fe", text: "#0369a1", label: "Pengisian TL Temuan" };
    if (v === "monev") return { bg: "#fef3c7", text: "#d97706", label: "Monev" };
    if (v === "close") return { bg: "#dcfce7", text: "#15803d", label: "Close" };
    if (v === "menunggu konfirmasi") return { bg: "#ffedd5", text: "#9a3412", label: "Menunggu Konfirmasi" };
    if (v === "dalam perbaikan") return { bg: "#dbeafe", text: "#1e40af", label: "Dalam Perbaikan" };
    if (v === "pengisian rtl") return { bg: "#dbeafe", text: "#1e40af", label: "Pengisian Tindak Lanjut" }; 


    return { bg: "#f1f5f9", text: "#64748b", label: status || "Draft Temuan" };
  };


  const fetchFollowUp = async () => {
    try {
      const res = await apiClient.get("/api/tindak-lanjut");
      const sorted = (res.data.data || []).sort((a, b) => a.id - b.id);
      setDataFollowUp(sorted);
    } catch (err) { console.error(err); }
  };

  // Sinkronisasi Real-Time
  useRealTime(['tindak_lanjut', 'external_audit_temuan', 'analisis_temuan'], () => {
    fetchFollowUp();
    if (mode === 'detail' && selectedItem) {
      refreshDetail();
    }
  });

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

  // Detail view functions and rendering logic have been extracted to DetailTindakLanjut component

  // --- DETAIL MODE ---
  if (mode === "detail" && selectedItem) {
    return (
      <DetailTindakLanjut 
        selectedItem={selectedItem}
        setMode={setMode}
        isAuditor={isAuditor}
        refreshDetail={refreshDetail}
        fetchFollowUp={fetchFollowUp}
        getStatusConfig={getStatusConfig}
        formatDate={formatDate}
        getMonthLabel={getMonthLabel}
      />
    );
  }

  // --- LIST MODE ---
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase tracking-tight">
          <BsArrowRepeat className="text-blue-600" /> Monitoring Tindak Lanjut
        </h1>
        <p className="text-slate-500 text-sm">Sistem Pemantauan dan Realisasi Rekomendasi Hasil Pemeriksaan</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
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
            {getUniqueStatus().map(s => {
              const sc = getStatusConfig(s);
              return <option key={s} value={s}>{sc.label}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead className="text-[11px] font-bold text-slate-400">
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
                  {(() => {
                    const sc = getStatusConfig(item.status);
                    return (
                      <span 
                        className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-tighter"
                        style={{ backgroundColor: sc.bg, color: sc.text, borderColor: 'transparent' }}
                      >
                        {sc.label}
                      </span>
                    );
                  })()}
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
