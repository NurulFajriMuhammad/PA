import React, { useState, useEffect } from 'react';
import apiClient from "../../../Shared/api/apiClient"; // Sesuaikan jika ini salah
import { 
  BsExclamationOctagon, BsSearch, BsFilter, 
  BsFiles, BsShieldExclamation, BsCashStack,
  BsGraphUpArrow, BsArrowRight
} from 'react-icons/bs';

const AuditFindings = () => {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");
  const [statusTemuanList, setStatusTemuanList] = useState([]);

  // Fetch status temuan untuk warna badge
  useEffect(() => {
    apiClient.get('/api/status-temuan').then(res => {
      setStatusTemuanList(res.data || []);
    }).catch(() => {});
  }, []);

  const getStatusTemuan = (val) => {
    const v = (val || "").toLowerCase();
    const found = statusTemuanList.find((s) => {
      const n = s.nama.toLowerCase();
      return n === v || n.includes(v) || v.includes(n);
    });

    if (found) {
      return { bg: found.warna, text: found.warna_teks, label: found.nama };
    }

    // Fallback
    if (v === "selesai" || v === "closed") return { bg: "#ecfdf5", text: "#059669", label: "Selesai" };
    if (v === "draft") return { bg: "#f1f5f9", text: "#64748b", label: "Draft" };
    return { bg: "#eff6ff", text: "#2563eb", label: val || "Proses" };
  };


  const [stats, setStats] = useState({
    critical: 0,
    major: 0,
    minor: 0,
    totalImpact: 0
  });

  const fetchSemuaTemuan = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/semua-temuan');
      const data = res.data.data || [];
      setFindings(data);
      calculateStats(data);
    } catch (error) {
      console.error("Gagal memuat data temuan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemuaTemuan();
  }, []);

  const calculateStats = (data) => {
    let crit = 0, maj = 0, min = 0, impact = 0;
    data.forEach(item => {
      if (item.risiko === 'Critical' || item.risiko === 'Tinggi') crit++;
      else if (item.risiko === 'Major' || item.risiko === 'Sedang') maj++;
      else min++;

      if (item.impact && !isNaN(item.impact)) {
        impact += Number(item.impact);
      }
    });

    setStats({
      critical: crit,
      major: maj,
      minor: min,
      totalImpact: impact
    });
  };

  const formatRupiah = (number) => {
    if (!number || isNaN(number)) return "IDR 0";
    if (number >= 1000000000) return `IDR ${(number / 1000000000).toFixed(1)}B`;
    if (number >= 1000000) return `IDR ${(number / 1000000).toFixed(1)}M`;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredFindings = findings.filter(finding => {
    const matchesSearch = (finding.judul_masalah || finding.masalah || finding.judul || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (finding.id_format || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (finding.unit || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesKategori = kategoriFilter === "Semua Kategori" || finding.kategori === kategoriFilter;

    return matchesSearch && matchesKategori;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsShieldExclamation className="text-red-600" /> Database Temuan Audit
          </h1>
          <p className="text-slate-500 mt-1">Daftar seluruh observasi dan temuan hasil pengawasan internal & eksternal.</p>
        </div>
        {/* <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md text-sm border-none cursor-pointer">
          <BsFiles /> Export Laporan Temuan
        </button> */}
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <FindingStat label="Tinggi / Critical" value={stats.critical < 10 && stats.critical > 0 ? `0${stats.critical}` : stats.critical} color="bg-red-600" />
        <FindingStat label="Sedang / Major" value={stats.major < 10 && stats.major > 0 ? `0${stats.major}` : stats.major} color="bg-orange-500" />
        <FindingStat label="Rendah / Minor" value={stats.minor < 10 && stats.minor > 0 ? `0${stats.minor}` : stats.minor} color="bg-amber-400" />
        <FindingStat label="Total Impact Estimasi" value={formatRupiah(stats.totalImpact)} color="bg-slate-800" isValue />
      </div> */}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[300px]">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Cari Nomer Temuan, Judul, atau Unit Kerja..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none cursor-pointer"
          >
            <option>Semua Kategori</option>
            <option>Internal Audit</option>
            <option>External Audit</option>
          </select>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
            <BsFilter size={18} />
          </button>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 min-w-[250px]">Judul Temuan Masalah</th>
                <th className="px-6 py-4 w-36">Kategori</th>
                <th className="px-6 py-4 text-center">Risiko</th>
                <th className="px-6 py-4 w-48">Unit / Objek</th>
                <th className="px-6 py-4 min-w-[120px]">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading data...</td>
                </tr>
              ) : filteredFindings.length > 0 ? (
                filteredFindings.map((finding) => (
                  <tr key={finding.id_format} className="hover:bg-red-50/20 transition-all cursor-pointer group text-[13px] align-top">
                    <td className="px-6 py-5 align-middle">
                      <div className="flex flex-col gap-2 items-start">
                        {(() => {
                          const st = getStatusTemuan(finding.status);
                          return (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border"
                              style={{ backgroundColor: st.bg, color: st.text, borderColor: 'transparent' }}
                            >
                              {st.label}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-700 leading-relaxed group-hover:text-red-700 transition-colors line-clamp-3">
                        {finding.judul_masalah}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 uppercase font-bold tracking-wider">
                        {formatDate(finding.tanggal)}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                        {finding.kategori === 'Internal Audit' ? <BsShieldExclamation className="text-blue-500" /> : <BsExclamationOctagon className="text-amber-500" />}
                        {finding.kategori}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center align-middle">
                      <RiskBadge risk={finding.risiko} />
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-600 font-bold align-middle">{finding.unit}</td>
                    <td className="px-6 py-5 align-middle">
                      <div className="text-xs font-bold text-slate-700">{formatRupiah(finding.impact)}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <BsSearch size={40} className="text-slate-200" />
                      <p className="font-bold text-slate-500 tracking-wider">Tidak ada data temuan yang ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Internal Components
const FindingStat = ({ label, value, color, isValue }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</span>
    <div className={`px-4 py-1 rounded-full text-white font-black ${color} ${isValue ? 'text-lg' : 'text-xl'}`}>
      {value}
    </div>
  </div>
);

const RiskBadge = ({ risk }) => {
  const styles = {
    "Critical": "bg-red-100 text-red-700 border-red-200",
    "Tinggi": "bg-red-100 text-red-700 border-red-200",
    "Major": "bg-orange-100 text-orange-700 border-orange-200",
    "Sedang": "bg-orange-100 text-orange-700 border-orange-200",
    "Minor": "bg-amber-100 text-amber-700 border-amber-200",
    "Rendah": "bg-amber-100 text-amber-700 border-amber-200",
    "Medium": "bg-orange-100 text-orange-700 border-orange-200",
  };
  return (
    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase border tracking-tight ${styles[risk] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {risk || 'Medium'}
    </span>
  );
};

export default AuditFindings;
