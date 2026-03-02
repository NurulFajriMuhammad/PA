import React, { useState } from 'react';
import { 
  Network, Database, Landmark, BookOpen, Monitor, 
  ShieldAlert, Globe, Layers, Search, ArrowRight 
} from 'lucide-react';

const AuditUniverseSPI = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      title: "Unit Akademik",
      icon: <BookOpen size={20} className="text-blue-600" />,
      color: "blue",
      items: [
        { name: "Fakultas & Sekolah", risk: "High", lastAudit: "2024" },
        { name: "Lembaga Penelitian", risk: "Medium", lastAudit: "2023" },
        { name: "Lembaga Pengabdian Masyarakat", risk: "Low", lastAudit: "2022" },
        { name: "Perpustakaan Pusat", risk: "Low", lastAudit: "2023" }
      ]
    },
    {
      title: "Unit Non-Akademik",
      icon: <Landmark size={20} className="text-purple-600" />,
      color: "purple",
      items: [
        { name: "Biro Keuangan", risk: "High", lastAudit: "2024" },
        { name: "Biro Kepegawaian / SDM", risk: "Medium", lastAudit: "2024" },
        { name: "Biro Umum & Sarpras", risk: "Medium", lastAudit: "2023" },
        { name: "Unit Usaha / Business Center", risk: "High", lastAudit: "2025" }
      ]
    },
    {
      title: "Infrastruktur & TI",
      icon: <Monitor size={20} className="text-orange-600" />,
      color: "orange",
      items: [
        { name: "Pusat Data (Data Center)", risk: "High", lastAudit: "2024" },
        { name: "Sistem Informasi Akademik", risk: "High", lastAudit: "2024" },
        { name: "Infrastruktur Jaringan", risk: "Medium", lastAudit: "2023" },
        { name: "Pengadaan Hardware", risk: "Medium", lastAudit: "2022" }
      ]
    }
  ];

  const getRiskStyle = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              <Globe size={12} /> Strategic Map
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Audit <span className="text-indigo-600">Universe</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Pemetaan objek pengawasan berbasis risiko tahun anggaran 2026.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari unit kerja..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-80 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- STATS SUMMARY --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Objek" value="42" icon={<Layers className="text-blue-600"/>} bgColor="bg-blue-50" />
          <StatCard title="High Risk" value="12" icon={<ShieldAlert className="text-red-600"/>} bgColor="bg-red-50" />
          <StatCard title="Telah Diaudit" value="28" icon={<Database className="text-emerald-600"/>} bgColor="bg-emerald-50" />
          <StatCard title="Belum Diaudit" value="14" icon={<ArrowRight className="text-slate-600"/>} bgColor="bg-slate-100" />
        </div>

        {/* --- CATEGORY GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md">
              <div className="p-5 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                <div className="bg-white p-2 rounded-lg shadow-sm">{cat.icon}</div>
                <h3 className="font-bold text-slate-800">{cat.title}</h3>
              </div>
              
              <div className="p-4 space-y-3 flex-1">
                {cat.items
                  .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((item, idx) => (
                    <div key={idx} className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getRiskStyle(item.risk)}`}>
                          {item.risk}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Last Audit: {item.lastAudit}</span>
                        <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Detail <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// Sub-komponen StatCard
const StatCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bgColor}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default AuditUniverseSPI;