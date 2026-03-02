import React, { useState } from 'react';
import { 
  BsBarChartSteps, BsSearch, BsArrowUpRight, 
  BsCalendarCheck, BsAward, BsClipboardData,
  BsFileEarmarkMedical, BsFunnel
} from 'react-icons/bs';

const AuditEvaluasi = () => {
  const [dataEvaluasi] = useState([
    {
      id: "EVL-2026-01",
      program: "Implementasi Sistem ERP Tahap 1",
      unit: "Divisi Keuangan",
      skor: 88.5,
      target: 90,
      status: "Very Good",
      periode: "Q4 2025"
    },
    {
      id: "EVL-2026-02",
      program: "Kinerja Pengadaan Logistik Vendor",
      unit: "Unit Logistik",
      skor: 65.2,
      target: 85,
      status: "Need Improvement",
      periode: "Januari 2026"
    },
    {
      id: "EVL-2026-03",
      program: "Efektivitas Pelatihan Karyawan Baru",
      unit: "Human Capital",
      skor: 78.0,
      target: 80,
      status: "Good",
      periode: "Februari 2026"
    }
  ]);

  return (
    <div className="p-6 bg-[#fcfcfd] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsBarChartSteps className="text-emerald-600" /> Audit Evaluasi
          </h1>
          <p className="text-slate-500 mt-1">Evaluasi pencapaian target, efektivitas program, dan penilaian kinerja unit.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 font-medium border-none cursor-pointer">
          <BsFileEarmarkMedical /> Buat Laporan Evaluasi
        </button>
      </div>

      {/* Evaluasi Highlight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SummaryCard 
          title="Rata-rata Skor Efektivitas" 
          value="77.2%" 
          subtitle="+2.4% dari tahun lalu" 
          icon={<BsAward />} 
          color="emerald" 
        />
        <SummaryCard 
          title="Program Dievaluasi" 
          value="14" 
          subtitle="Total pengerjaan aktif" 
          icon={<BsClipboardData />} 
          color="blue" 
        />
        <SummaryCard 
          title="Deadline Laporan" 
          value="03 Mar" 
          subtitle="Laporan evaluasi Q1" 
          icon={<BsCalendarCheck />} 
          color="amber" 
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-slate-700 font-bold">Daftar Hasil Evaluasi Kinerja</h3>
          <div className="flex gap-3">
            <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari program..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              <BsFunnel />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100">
                <th className="px-6 py-4">Program & Periode</th>
                <th className="px-6 py-4">Unit Kerja</th>
                <th className="px-6 py-4">Pencapaian Skor</th>
                <th className="px-6 py-4">Status Efektivitas</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dataEvaluasi.map((item) => (
                <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-700 text-sm group-hover:text-emerald-700 transition-colors">{item.program}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <span className="font-mono">{item.id}</span> • <span>{item.periode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                    {item.unit}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-[120px]">
                        <div className="flex justify-between text-[10px] mb-1 font-bold">
                          <span className="text-slate-400">Target: {item.target}%</span>
                          <span className={item.skor >= item.target ? "text-emerald-600" : "text-amber-600"}>
                            {item.skor}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-1000 ${
                              item.skor >= 80 ? 'bg-emerald-500' : item.skor >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.skor}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <RatingTag status={item.status} />
                  </td>
                  <td className="px-6 py-5">
                    <button className="flex items-center gap-1 text-emerald-600 font-bold text-xs hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer">
                      Detail <BsArrowUpRight strokeWidth={1} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const SummaryCard = ({ title, value, subtitle, icon, color }) => {
  const themes = {
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50"
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-5">
      <div className={`p-4 rounded-xl text-2xl ${themes[color]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 my-1">{value}</h3>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

const RatingTag = ({ status }) => {
  const config = {
    "Very Good": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Good": "bg-blue-100 text-blue-700 border-blue-200",
    "Need Improvement": "bg-amber-100 text-amber-700 border-amber-200"
  };
  return (
    <span className={`px-3 py-1 border rounded-md text-[10px] font-black uppercase tracking-tighter ${config[status]}`}>
      {status}
    </span>
  );
};

export default AuditEvaluasi;