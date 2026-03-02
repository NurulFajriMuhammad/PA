import React, { useState } from 'react';
import { 
  BsExclamationOctagon, BsSearch, BsFilter, 
  BsFiles, BsShieldExclamation, BsCashStack,
  BsGraphUpArrow, BsArrowRight
} from 'react-icons/bs';

const AuditFindings = () => {
  const [findings] = useState([
    {
      id: "FND-2026-001",
      judul: "Pembayaran Ganda kepada Vendor Logistik",
      kategori: "Financial",
      risiko: "Critical",
      unit: "Finance",
      tanggal: "20 Feb 2026",
      impact: "IDR 50.000.000"
    },
    {
      id: "FND-2026-002",
      judul: "SOP Pengelolaan Data Nasabah Belum Diupdate",
      kategori: "Compliance",
      risiko: "Major",
      unit: "IT & Risk",
      tanggal: "22 Feb 2026",
      impact: "Legal Exposure"
    },
    {
      id: "FND-2026-003",
      judul: "Keterlambatan Rekonsiliasi Bank Harian",
      kategori: "Operational",
      risiko: "Minor",
      unit: "Operation",
      tanggal: "25 Feb 2026",
      impact: "Process Delay"
    }
  ]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsShieldExclamation className="text-red-600" /> Database Temuan Audit
          </h1>
          <p className="text-slate-500 mt-1">Daftar seluruh observasi dan temuan hasil pengawasan internal.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md text-sm border-none cursor-pointer">
          <BsFiles /> Export Laporan Temuan
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <FindingStat label="Critical" value="03" color="bg-red-600" />
        <FindingStat label="Major" value="12" color="bg-orange-500" />
        <FindingStat label="Minor" value="25" color="bg-amber-400" />
        <FindingStat label="Total Impact" value="IDR 1.2B" color="bg-slate-800" isValue />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[300px]">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari judul temuan atau unit..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none cursor-pointer">
            <option>Semua Kategori</option>
            <option>Financial</option>
            <option>Operational</option>
            <option>Compliance</option>
          </select>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
            <BsFilter size={18} />
          </button>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">ID & Judul Temuan</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4 text-center">Tingkat Risiko</th>
              <th className="px-6 py-4">Unit Kerja</th>
              <th className="px-6 py-4">Dampak / Impact</th>
              <th className="px-6 py-4 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {findings.map((finding) => (
              <tr key={finding.id} className="hover:bg-red-50/20 transition-all cursor-pointer group">
                <td className="px-6 py-5">
                  <div className="text-[10px] font-mono text-red-500 font-bold mb-1">{finding.id}</div>
                  <div className="text-sm font-bold text-slate-700 group-hover:text-red-700">{finding.judul}</div>
                  <div className="text-[11px] text-slate-400 mt-1 uppercase font-medium">{finding.tanggal}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    {finding.kategori === 'Financial' ? <BsCashStack className="text-emerald-500" /> : <BsExclamationOctagon className="text-blue-500" />}
                    {finding.kategori}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <RiskBadge risk={finding.risiko} />
                </td>
                <td className="px-6 py-5 text-sm text-slate-600 font-medium">{finding.unit}</td>
                <td className="px-6 py-5">
                  <div className="text-xs font-bold text-slate-700">{finding.impact}</div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-slate-300 group-hover:text-red-600 transition-colors">
                    <BsArrowRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    "Major": "bg-orange-100 text-orange-700 border-orange-200",
    "Minor": "bg-amber-100 text-amber-700 border-amber-200",
  };
  return (
    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase border tracking-tight ${styles[risk]}`}>
      {risk}
    </span>
  );
};

export default AuditFindings;